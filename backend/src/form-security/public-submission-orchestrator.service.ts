import {
  BadRequestException,
  ConflictException,
  Injectable
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption.service';
import { resolveCanonicalEmail } from './canonical-email.resolver';
import {
  getFormSecuritySettings,
  validateFormSecuritySettings
} from './form-security-settings.util';
import { isDisposableEmail, normalizeEmail } from './disposable-email.util';
import { RedisRateLimitService } from './redis-rate-limit.service';
import { ResponsePersistenceService } from './response-persistence.service';
import { TurnstileService } from './turnstile.service';
import { sha256 } from './verification-binding.util';

interface SubmitPublicFormInput {
  formId: string;
  answers: { fieldId: string; value: string }[];
  email?: string;
  captchaToken?: string;
  sessionKey?: string;
  fingerprint?: string;
  bindingId?: string;
  grantToken?: string;
  ipAddress?: string;
  userId?: string;
}

interface FormSettings {
  allowMultipleSubmissions?: boolean;
}

@Injectable()
export class PublicSubmissionOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly turnstileService: TurnstileService,
    private readonly rateLimitService: RedisRateLimitService,
    private readonly responsePersistenceService: ResponsePersistenceService
  ) {}

  async submitPublicForm(input: SubmitPublicFormInput) {
    const form = await this.responsePersistenceService.loadPublishedForm(input.formId);
    this.responsePersistenceService.assertQuizWindow(form);

    const passiveSecurity = getFormSecuritySettings(form.settings);
    const enforcedSecurity = validateFormSecuritySettings(form.settings, form.fields);
    const canonicalEmail = this.resolveSubmissionEmail(form, input, passiveSecurity);
    const ipHash = input.ipAddress
      ? this.encryptionService.hashIpAddress(input.ipAddress)
      : null;
    const sessionHash = input.sessionKey ? sha256(input.sessionKey) : null;

    if (ipHash) {
      await this.rateLimitService.consume(
        `form:${input.formId}:submit:ip:${ipHash}`,
        20,
        10 * 60
      );
    }

    if (sessionHash) {
      await this.rateLimitService.consume(
        `form:${input.formId}:submit:session:${sessionHash}`,
        10,
        10 * 60
      );
    }

    if (enforcedSecurity.requireCaptcha) {
      const validCaptcha = await this.turnstileService.verifyToken(
        input.captchaToken || '',
        input.ipAddress
      );

      if (!validCaptcha) {
        throw new BadRequestException({
          code: 'INVALID_CAPTCHA',
          message: 'Captcha verification failed.'
        });
      }
    }

    if (
      canonicalEmail &&
      enforcedSecurity.blockDisposableEmails &&
      isDisposableEmail(canonicalEmail)
    ) {
      throw new BadRequestException({
        code: 'DISPOSABLE_EMAIL_BLOCKED',
        message: 'Disposable email addresses are not allowed.'
      });
    }

    return this.prisma.$transaction(async (tx) => {
      let verificationId: string | null = null;
      let submissionGrantId: string | null = null;
      let emailVerifiedAt: Date | null = null;

      if (enforcedSecurity.requireEmailVerification) {
        if (!input.bindingId || !input.grantToken || !canonicalEmail) {
          throw new ConflictException({
            code: 'EMAIL_VERIFICATION_REQUIRED',
            verificationRequired: true,
            message: 'Email verification is required before submission.'
          });
        }

        const grantHash = sha256(input.grantToken);
        await this.rateLimitService.consume(
          `form:${input.formId}:submit:grant:${grantHash}`,
          3,
          5 * 60
        );

        const grant = await tx.formVerifiedSubmissionGrant.findFirst({
          where: {
            formId: input.formId,
            bindingId: input.bindingId,
            grantHash,
            normalizedEmail: canonicalEmail,
            consumedAt: null,
            invalidatedAt: null,
            expiresAt: {
              gt: new Date()
            }
          }
        });

        if (!grant) {
          throw new ConflictException({
            code: 'EMAIL_VERIFICATION_REQUIRED',
            verificationRequired: true,
            message: 'Email verification is required before submission.'
          });
        }

        verificationId = grant.verificationId;
        submissionGrantId = grant.id;
        emailVerifiedAt = new Date();
      }

      await this.assertSubmissionAllowed(tx, form, {
        formId: input.formId,
        userId: input.userId,
        fingerprint: input.fingerprint,
        canonicalEmail,
        ipHash,
        security: enforcedSecurity
      });

      const savedResponse = await this.responsePersistenceService.createInTransaction(
        tx,
        form,
        {
          formId: input.formId,
          answers: input.answers,
          userId: input.userId || null,
          respondentEmail: canonicalEmail,
          normalizedRespondentEmail: canonicalEmail,
          emailVerifiedAt,
          emailVerificationId: verificationId,
          submissionGrantId,
          sessionKey: input.sessionKey || null,
          fingerprint: input.fingerprint || null,
          ipAddress: input.ipAddress || null
        }
      );

      if (submissionGrantId) {
        await tx.formVerifiedSubmissionGrant.update({
          where: { id: submissionGrantId },
          data: {
            consumedAt: new Date()
          }
        });
      }

      return savedResponse;
    });
  }

  private resolveSubmissionEmail(
    form: Awaited<ReturnType<ResponsePersistenceService['loadPublishedForm']>>,
    input: SubmitPublicFormInput,
    security: ReturnType<typeof getFormSecuritySettings>
  ) {
    if (security.canonicalEmailSource) {
      return resolveCanonicalEmail({
        source: security.canonicalEmailSource,
        topLevelEmail: input.email,
        answers: input.answers,
        formFields: form.fields
      });
    }

    if (input.email?.trim()) {
      return normalizeEmail(input.email);
    }

    return null;
  }

  private async assertSubmissionAllowed(
    tx: Prisma.TransactionClient,
    form: Awaited<ReturnType<ResponsePersistenceService['loadPublishedForm']>>,
    params: {
      formId: string;
      userId?: string;
      fingerprint?: string;
      canonicalEmail: string | null;
      ipHash: string | null;
      security: ReturnType<typeof getFormSecuritySettings>;
    }
  ) {
    const settings = form.settings as FormSettings | null;
    const allowMultipleSubmissions = settings?.allowMultipleSubmissions === true;

    if (!allowMultipleSubmissions) {
      const legacyConditions = [];

      if (params.userId) {
        legacyConditions.push({ userId: params.userId });
      }

      if (params.canonicalEmail) {
        legacyConditions.push({ normalizedRespondentEmail: params.canonicalEmail });
      }

      if (params.fingerprint) {
        legacyConditions.push({ fingerprint: params.fingerprint });
      }

      if (legacyConditions.length > 0) {
        const existingLegacyResponse = await tx.formResponse.findFirst({
          where: {
            formId: params.formId,
            OR: legacyConditions
          }
        });

        if (existingLegacyResponse) {
          throw new ConflictException({
            code: 'SUBMISSION_NOT_ALLOWED',
            message: 'This submission is not allowed for this form.'
          });
        }
      }
    }

    if (params.security.limitOneResponsePerEmail && params.canonicalEmail) {
      const duplicateEmail = await tx.formResponse.findFirst({
        where: {
          formId: params.formId,
          normalizedRespondentEmail: params.canonicalEmail
        }
      });

      if (duplicateEmail) {
        throw new ConflictException({
          code: 'SUBMISSION_NOT_ALLOWED',
          message: 'This submission is not allowed for this form.'
        });
      }
    }

    if (params.security.limitOneResponsePerIP && params.ipHash) {
      const duplicateIp = await tx.formResponse.findFirst({
        where: {
          formId: params.formId,
          ipAddress: params.ipHash
        }
      });

      if (duplicateIp) {
        throw new ConflictException({
          code: 'SUBMISSION_NOT_ALLOWED',
          message: 'This submission is not allowed for this form.'
        });
      }
    }
  }
}
