import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  ServiceUnavailableException } from
'@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, SubmissionIdentityLockType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FormsService } from '../forms/forms.service';
import { MailService } from '../mail/mail.service';
import { EncryptionService } from '../common/encryption.service';
import { ResponsePersistenceService } from './response-persistence.service';
import { RedisRateLimitService } from './redis-rate-limit.service';
import { TurnstileService } from './turnstile.service';
import { RequestUnifiedVerificationDto } from './dto/request-unified-verification.dto';
import { CreateUnifiedSubmissionDto } from './dto/create-unified-submission.dto';
import { isDisposableEmail, normalizeEmail } from './disposable-email.util';
import {
  validateFormSecuritySettings } from
'./form-security-settings.util';
import { resolveCanonicalEmail } from './canonical-email.resolver';
import { sha256 } from './verification-binding.util';
import { PublicSubmissionSessionService } from './public-submission-session.service';
import { generateOpaqueSessionToken } from './public-submission-session.util';
@Injectable()export class
UnifiedPublicSubmissionService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly formsService: FormsService,
  private readonly configService: ConfigService,
  private readonly mailService: MailService,
  private readonly encryptionService: EncryptionService,
  private readonly responsePersistenceService: ResponsePersistenceService,
  private readonly rateLimitService: RedisRateLimitService,
  private readonly turnstileService: TurnstileService,
  private readonly publicSessionService: PublicSubmissionSessionService)
  {}
  async getPublicForm(
  formId: string,
  cookieToken: string | null,
  ipAddress?: string,
  userAgent?: string)
  {
    const { session, cookieToken: nextCookieToken, isNew } =
    await this.publicSessionService.ensureSession(formId, cookieToken, ipAddress, userAgent);
    const form = await this.formsService.findPublic(formId, undefined, ipAddress, userAgent);
    const submissionState = await this.getSubmissionStateForSession(formId, session.id);
    return {
      form,
      submissionState,
      cookieToken: nextCookieToken,
      setCookie: isNew
    };
  }
  async requestVerification(
  formId: string,
  cookieToken: string | null,
  body: RequestUnifiedVerificationDto,
  ipAddress?: string,
  userAgent?: string)
  {
    this.rateLimitService.requireSharedStore();
    const { session, cookieToken: nextCookieToken, isNew } =
    await this.publicSessionService.ensureSession(formId, cookieToken, ipAddress, userAgent);
    const form = await this.responsePersistenceService.loadPublishedForm(formId);
    const security = validateFormSecuritySettings(form.settings, form.fields);
    if (!security.requireEmailVerification) {
      throw new BadRequestException({
        code: 'EMAIL_VERIFICATION_NOT_ENABLED',
        message: 'Email verification is not enabled for this form.'
      });
    }
    if (security.requireCaptcha) {
      await this.turnstileService.verifyToken(body.captchaToken || '', ipAddress);
    }
    const respondentEmail = body.respondentEmail?.trim() ?
    normalizeEmail(body.respondentEmail) :
    null;
    const canonicalEmail = this.resolveSubmissionEmail(
      form,
      security,
      respondentEmail,
      body.answers
    );
    if (!canonicalEmail) {
      throw new BadRequestException({
        code: 'EMAIL_REQUIRED',
        message: 'Respondent email is required.'
      });
    }
    if (security.blockDisposableEmails && isDisposableEmail(canonicalEmail)) {
      throw new BadRequestException({
        code: 'DISPOSABLE_EMAIL_BLOCKED',
        message: 'Disposable email addresses are not allowed.'
      });
    }
    const ipHash = ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null;
    const emailHash = sha256(`${formId}:${canonicalEmail}`);
    await this.rateLimitService.consume(`public:${formId}:verify:session:${session.id}`, 5, 10 * 60);
    if (ipHash) {
      await this.rateLimitService.consume(`public:${formId}:verify:ip:${ipHash}`, 20, 10 * 60);
    }
    const existingRequest = await this.prisma.submissionVerificationRequest.findFirst({
      where: {
        formId,
        sessionId: session.id,
        canonicalEmailNormalized: canonicalEmail,
        invalidatedAt: null,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    const cooldownKey = `public:${formId}:verify:cooldown:${emailHash}:${session.id}`;
    const cooldownAcquired = await this.rateLimitService.acquireCooldown(cooldownKey, 60);
    if (!cooldownAcquired && existingRequest) {
      return {
        status: 'PENDING',
        verificationRequestId: existingRequest.id,
        message: 'If verification is required, instructions have been sent.',
        cookieToken: nextCookieToken,
        setCookie: isNew
      };
    }
    const verificationToken = this.generateOpaqueToken();
    const tokenHash = sha256(verificationToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const requestRecord = await this.prisma.$transaction(async (tx) => {
      await tx.submissionVerificationRequest.updateMany({
        where: {
          formId,
          sessionId: session.id,
          canonicalEmailNormalized: canonicalEmail,
          invalidatedAt: null,
          consumedAt: null
        },
        data: {
          invalidatedAt: new Date()
        }
      });
      return tx.submissionVerificationRequest.create({
        data: {
          formId,
          sessionId: session.id,
          canonicalEmailNormalized: canonicalEmail,
          canonicalEmailHash: emailHash,
          tokenHash,
          requestedIpHash: ipHash,
          requestedUserAgentHash: userAgent ? sha256(userAgent) : null,
          expiresAt
        }
      });
    });
    await this.mailService.sendFormVerificationEmail({
      to: canonicalEmail,
      formTitle: form.title,
      verificationUrl: this.buildVerificationUrl(verificationToken)
    });
    return {
      status: 'PENDING',
      verificationRequestId: requestRecord.id,
      message: 'If verification is required, instructions have been sent.',
      cookieToken: nextCookieToken,
      setCookie: isNew
    };
  }
  async verifyEmailToken(token: string, ipAddress?: string) {
    this.rateLimitService.requireSharedStore();
    const tokenHash = sha256(token);
    const ipHash = ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null;
    if (ipHash) {
      await this.rateLimitService.consume(`public:verify-token:ip:${ipHash}`, 20, 10 * 60);
    }
    await this.rateLimitService.consume(`public:verify-token:token:${tokenHash}`, 5, 10 * 60);
    const verificationRequest = await this.prisma.submissionVerificationRequest.findFirst({
      where: {
        tokenHash,
        invalidatedAt: null
      }
    });
    if (
    !verificationRequest ||
    verificationRequest.verifiedAt ||
    verificationRequest.consumedAt ||
    verificationRequest.expiresAt <= new Date())
    {
      return {
        status: 'INVALID_OR_EXPIRED_TOKEN'
      };
    }
    const updated = await this.prisma.submissionVerificationRequest.updateMany({
      where: {
        id: verificationRequest.id,
        verifiedAt: null,
        consumedAt: null,
        invalidatedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      data: {
        verifiedAt: new Date()
      }
    });
    if (updated.count === 0) {
      return {
        status: 'INVALID_OR_EXPIRED_TOKEN'
      };
    }
    return {
      status: 'VERIFIED'
    };
  }
  async requestVerificationWithExistingSession(
  formId: string,
  cookieToken: string | null,
  verificationRequestId: string)
  {
    if (!cookieToken) {
      return { status: 'INVALID' };
    }
    const session = await this.publicSessionService.resolveSession(formId, cookieToken);
    if (!session) {
      return { status: 'INVALID' };
    }
    return this.getVerificationStatus(formId, verificationRequestId, cookieToken);
  }
  async getVerificationStatus(
  formId: string,
  verificationRequestId: string,
  cookieToken: string | null)
  {
    if (!cookieToken) {
      return { status: 'INVALID' };
    }
    const session = await this.publicSessionService.resolveSession(formId, cookieToken);
    if (!session) {
      return { status: 'INVALID' };
    }
    const verificationRequest = await this.prisma.submissionVerificationRequest.findFirst({
      where: {
        id: verificationRequestId,
        formId,
        sessionId: session.id
      }
    });
    if (!verificationRequest || verificationRequest.invalidatedAt) {
      return { status: 'INVALID' };
    }
    if (verificationRequest.consumedAt) {
      return { status: 'CONSUMED' };
    }
    if (verificationRequest.expiresAt <= new Date()) {
      return { status: 'EXPIRED' };
    }
    if (verificationRequest.verifiedAt) {
      return { status: 'VERIFIED_READY' };
    }
    return { status: 'PENDING' };
  }
  async submit(
  formId: string,
  cookieToken: string | null,
  body: CreateUnifiedSubmissionDto,
  ipAddress?: string,
  userAgent?: string)
  {
    this.rateLimitService.requireSharedStore();
    const { session, cookieToken: nextCookieToken, isNew } =
    await this.publicSessionService.ensureSession(formId, cookieToken, ipAddress, userAgent);
    const form = await this.responsePersistenceService.loadPublishedForm(formId);
    this.responsePersistenceService.assertQuizWindow(form);
    const security = validateFormSecuritySettings(form.settings, form.fields);
    if (security.requireCaptcha) {
      await this.turnstileService.verifyToken(body.captchaToken || '', ipAddress);
    }
    const respondentEmail = body.respondentEmail?.trim() ?
    normalizeEmail(body.respondentEmail) :
    null;
    const canonicalEmail = this.resolveSubmissionEmail(
      form,
      security,
      respondentEmail,
      body.answers
    );
    if (
    canonicalEmail &&
    security.blockDisposableEmails &&
    isDisposableEmail(canonicalEmail))
    {
      throw new BadRequestException({
        code: 'SUBMISSION_NOT_ALLOWED',
        message: 'This action could not be completed.'
      });
    }
    const ipHash = ipAddress ? this.encryptionService.hashIpAddress(ipAddress) : null;
    await this.rateLimitService.consume(`public:${formId}:submit:session:${session.id}`, 10, 10 * 60);
    if (ipHash) {
      await this.rateLimitService.consume(`public:${formId}:submit:ip:${ipHash}`, 20, 10 * 60);
    }
    try {
      const submission = await this.prisma.$transaction(async (tx) => {
        let verificationRequestId: string | null = null;
        let emailVerifiedAt: Date | null = null;
        if (security.requireEmailVerification) {
          const verificationRequest = await tx.submissionVerificationRequest.findFirst({
            where: {
              formId,
              sessionId: session.id,
              canonicalEmailNormalized: canonicalEmail || '',
              verifiedAt: { not: null },
              consumedAt: null,
              invalidatedAt: null,
              expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
          });
          if (!verificationRequest) {
            throw new ConflictException({
              code: 'VERIFICATION_REQUIRED',
              message: 'This action could not be completed.'
            });
          }
          verificationRequestId = verificationRequest.id;
          emailVerifiedAt = verificationRequest.verifiedAt;
        }
        const savedResponse = await this.responsePersistenceService.createInTransaction(
          tx,
          form,
          {
            formId,
            answers: body.answers,
            userId: null,
            submissionSessionId: session.id,
            verificationRequestId,
            respondentEmail: respondentEmail || canonicalEmail,
            normalizedRespondentEmail: canonicalEmail || respondentEmail,
            emailVerifiedAt,
            emailVerificationId: null,
            submissionGrantId: null,
            sessionKey: session.id,
            fingerprint: null,
            ipAddress
          }
        );
        const lockWrites: Array<Promise<unknown>> = [];
        if ((form.settings as {allowMultipleSubmissions?: boolean;} | null)?.allowMultipleSubmissions !== true) {
          lockWrites.push(
            tx.submissionIdentityLock.create({
              data: {
                formId,
                lockType: SubmissionIdentityLockType.SESSION,
                lockKeyHash: sha256(session.id),
                responseId: savedResponse.id
              }
            })
          );
        }
        if (security.limitOneResponsePerEmail && canonicalEmail) {
          lockWrites.push(
            tx.submissionIdentityLock.create({
              data: {
                formId,
                lockType: SubmissionIdentityLockType.CANONICAL_EMAIL,
                lockKeyHash: sha256(canonicalEmail),
                responseId: savedResponse.id
              }
            })
          );
        }
        if (security.limitOneResponsePerIP && ipHash) {
          lockWrites.push(
            tx.submissionIdentityLock.create({
              data: {
                formId,
                lockType: SubmissionIdentityLockType.IP,
                lockKeyHash: ipHash,
                responseId: savedResponse.id
              }
            })
          );
        }
        await Promise.all(lockWrites);
        if (verificationRequestId) {
          const consumeResult = await tx.submissionVerificationRequest.updateMany({
            where: {
              id: verificationRequestId,
              consumedAt: null
            },
            data: {
              consumedAt: new Date()
            }
          });
          if (consumeResult.count === 0) {
            throw new ConflictException({
              code: 'SUBMISSION_NOT_ALLOWED',
              message: 'This action could not be completed.'
            });
          }
        }
        await tx.publicSubmissionSession.update({
          where: { id: session.id },
          data: {
            submittedAt: new Date(),
            lastSeenAt: new Date()
          }
        });
        return savedResponse;
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      });
      return {
        submission,
        cookieToken: nextCookieToken,
        setCookie: isNew
      };
    } catch (error) {
      if (this.isUniqueConstraint(error)) {
        throw new ConflictException({
          code: 'SUBMISSION_NOT_ALLOWED',
          message: 'This action could not be completed.'
        });
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException({
        code: 'SUBMISSION_UNAVAILABLE',
        message: 'Submission is temporarily unavailable.'
      });
    }
  }
  async getSubmissionState(
  formId: string,
  cookieToken: string | null,
  ipAddress?: string,
  userAgent?: string)
  {
    const { session, cookieToken: nextCookieToken, isNew } =
    await this.publicSessionService.ensureSession(formId, cookieToken, ipAddress, userAgent);
    const submissionState = await this.getSubmissionStateForSession(formId, session.id);
    return {
      submissionState,
      cookieToken: nextCookieToken,
      setCookie: isNew
    };
  }
  private async getSubmissionStateForSession(formId: string, sessionId: string) {
    const [session, latestVerificationRequest] = await Promise.all([
    this.prisma.publicSubmissionSession.findUnique({
      where: { id: sessionId }
    }),
    this.prisma.submissionVerificationRequest.findFirst({
      where: {
        formId,
        sessionId,
        invalidatedAt: null
      },
      orderBy: { createdAt: 'desc' }
    })]
    );
    if (session?.submittedAt) {
      return { status: 'ALREADY_SUBMITTED' };
    }
    if (!latestVerificationRequest) {
      return { status: 'ELIGIBLE' };
    }
    if (latestVerificationRequest.consumedAt) {
      return { status: 'ALREADY_SUBMITTED' };
    }
    if (latestVerificationRequest.expiresAt <= new Date()) {
      return { status: 'VERIFICATION_EXPIRED' };
    }
    if (latestVerificationRequest.verifiedAt) {
      return { status: 'VERIFIED_READY' };
    }
    return { status: 'PENDING_VERIFICATION' };
  }
  private resolveSubmissionEmail(
  form: Awaited<ReturnType<ResponsePersistenceService['loadPublishedForm']>>,
  security: ReturnType<typeof validateFormSecuritySettings>,
  respondentEmail: string | null,
  answers: {fieldId: string;value: string;}[])
  {
    if (security.canonicalEmailSource) {
      return resolveCanonicalEmail({
        source: security.canonicalEmailSource,
        topLevelEmail: respondentEmail || undefined,
        answers,
        formFields: form.fields
      });
    }
    return respondentEmail;
  }
  private generateOpaqueToken(): string {
    return generateOpaqueSessionToken();
  }
  private buildVerificationUrl(token: string): string {
    const publicUrl =
    this.configService.get<string>('BACKEND_PUBLIC_URL') ||
    `http://localhost:${this.configService.get<number>('PORT') || 3000}`;
    return new URL(`/api/public/email-verifications/${token}`, publicUrl).toString();
  }
  private isUniqueConstraint(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002');
  }
}