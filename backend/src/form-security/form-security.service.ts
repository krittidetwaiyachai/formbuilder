import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { FormStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { EncryptionService } from '../common/encryption.service';
import { PrismaService } from '../prisma/prisma.service';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { VerifiedSubmissionStatusDto } from './dto/verified-submission-status.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { resolveCanonicalEmail } from './canonical-email.resolver';
import { validateFormSecuritySettings } from './form-security-settings.util';
import { isDisposableEmail } from './disposable-email.util';
import {
  generateBindingId,
  generateGrantToken,
  generateVerificationToken,
  sha256
} from './verification-binding.util';
import { RedisRateLimitService } from './redis-rate-limit.service';
import { TurnstileService } from './turnstile.service';

@Injectable()
export class FormSecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly encryptionService: EncryptionService,
    private readonly rateLimitService: RedisRateLimitService,
    private readonly turnstileService: TurnstileService
  ) {}

  async requestEmailVerification(
    formId: string,
    body: RequestEmailVerificationDto,
    ipAddress?: string
  ) {
    const form = await this.loadPublicSecuredForm(formId);
    const security = validateFormSecuritySettings(form.settings, form.fields);

    if (!security.requireEmailVerification) {
      throw new BadRequestException({
        code: 'EMAIL_VERIFICATION_NOT_ENABLED',
        message: 'Email verification is not enabled for this form.'
      });
    }

    const canonicalEmail = resolveCanonicalEmail({
      source: security.canonicalEmailSource,
      topLevelEmail: body.email,
      answers: body.answers || [],
      formFields: form.fields
    });

    if (security.requireCaptcha) {
      const validCaptcha = await this.turnstileService.verifyToken(
        body.captchaToken || '',
        ipAddress
      );

      if (!validCaptcha) {
        throw new BadRequestException({
          code: 'INVALID_CAPTCHA',
          message: 'Captcha verification failed.'
        });
      }
    }

    if (security.blockDisposableEmails && isDisposableEmail(canonicalEmail)) {
      throw new BadRequestException({
        code: 'DISPOSABLE_EMAIL_BLOCKED',
        message: 'Disposable email addresses are not allowed.'
      });
    }

    const ipHash = ipAddress
      ? this.encryptionService.hashIpAddress(ipAddress)
      : null;
    const emailHash = sha256(`${formId}:${canonicalEmail}`);
    const sessionHash = body.sessionKey ? sha256(body.sessionKey) : 'anonymous';

    if (ipHash) {
      await this.rateLimitService.consume(
        `form:${formId}:verify_req:ip:${ipHash}`,
        5,
        15 * 60
      );
    }

    await this.rateLimitService.consume(
      `form:${formId}:verify_req:email:${emailHash}`,
      3,
      60 * 60
    );

    const cooldownKey = `form:${formId}:verify_req:cooldown:${emailHash}:${sessionHash}`;
    const cooldownAcquired = await this.rateLimitService.acquireCooldown(cooldownKey, 60);

    if (!cooldownAcquired) {
      return {
        status: 'PENDING',
        code: 'VERIFICATION_REQUEST_ACCEPTED',
        message: 'If allowed, verification instructions have been sent.'
      };
    }

    const bindingId = generateBindingId();
    const token = generateVerificationToken();
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.formEmailVerification.updateMany({
        where: {
          formId,
          normalizedEmail: canonicalEmail,
          verifiedAt: null,
          usedAt: null,
          invalidatedAt: null
        },
        data: {
          invalidatedAt: new Date()
        }
      });

      await tx.formEmailVerification.create({
        data: {
          formId,
          email: canonicalEmail,
          normalizedEmail: canonicalEmail,
          tokenHash,
          bindingId,
          expiresAt,
          ipAddress: ipHash,
          sessionKey: body.sessionKey || null
        }
      });
    });

    await this.mailService.sendFormVerificationEmail({
      to: canonicalEmail,
      formTitle: form.title,
      verificationUrl: this.buildVerificationUrl(formId, bindingId, token)
    });

    return {
      status: 'PENDING',
      code: 'VERIFICATION_REQUEST_ACCEPTED',
      bindingId,
      message: 'If allowed, verification instructions have been sent.'
    };
  }

  async verifyEmail(formId: string, body: VerifyEmailDto, ipAddress?: string) {
    const tokenHash = sha256(body.token);
    const ipHash = ipAddress
      ? this.encryptionService.hashIpAddress(ipAddress)
      : null;

    if (ipHash) {
      await this.rateLimitService.consume(
        `form:${formId}:verify_token:ip:${ipHash}`,
        10,
        10 * 60
      );
    }

    await this.rateLimitService.consume(
      `form:${formId}:verify_token:token:${tokenHash}`,
      5,
      10 * 60
    );

    const verification = await this.prisma.formEmailVerification.findFirst({
      where: {
        formId,
        bindingId: body.bindingId,
        tokenHash,
        invalidatedAt: null
      }
    });

    if (
      !verification ||
      verification.usedAt ||
      verification.verifiedAt ||
      verification.expiresAt <= new Date()
    ) {
      throw new BadRequestException({
        code: 'EMAIL_VERIFICATION_FAILED',
        message: 'Verification link is invalid or expired.'
      });
    }

    const grantToken = generateGrantToken();
    const grantHash = sha256(grantToken);
    const grantExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.formEmailVerification.update({
        where: { id: verification.id },
        data: {
          usedAt: new Date(),
          verifiedAt: new Date()
        }
      });

      await tx.formVerifiedSubmissionGrant.updateMany({
        where: {
          formId,
          bindingId: verification.bindingId,
          consumedAt: null,
          invalidatedAt: null
        },
        data: {
          invalidatedAt: new Date()
        }
      });

      await tx.formVerifiedSubmissionGrant.create({
        data: {
          formId,
          verificationId: verification.id,
          bindingId: verification.bindingId,
          normalizedEmail: verification.normalizedEmail,
          grantHash,
          expiresAt: grantExpiresAt
        }
      });
    });

    return {
      status: 'VERIFIED',
      code: 'EMAIL_VERIFIED',
      bindingId: verification.bindingId,
      grantToken,
      grantExpiresAt: grantExpiresAt.toISOString()
    };
  }

  async getVerifiedSubmissionStatus(
    formId: string,
    body: VerifiedSubmissionStatusDto
  ) {
    const grantHash = sha256(body.grantToken);
    const grant = await this.prisma.formVerifiedSubmissionGrant.findFirst({
      where: {
        formId,
        grantHash
      }
    });

    if (!grant) {
      return {
        status: 'INVALID'
      };
    }

    if (grant.invalidatedAt) {
      return {
        status: 'INVALID'
      };
    }

    if (grant.consumedAt) {
      return {
        status: 'CONSUMED'
      };
    }

    if (grant.expiresAt <= new Date()) {
      return {
        status: 'EXPIRED'
      };
    }

    return {
      status: 'VALID',
      bindingId: grant.bindingId,
      expiresAt: grant.expiresAt.toISOString()
    };
  }

  private async loadPublicSecuredForm(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        status: true,
        settings: true,
        fields: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.status !== FormStatus.PUBLISHED) {
      throw new ConflictException({
        code: 'FORM_NOT_PUBLISHED',
        message: 'Form is not published.'
      });
    }

    return form;
  }

  private buildVerificationUrl(formId: string, bindingId: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const url = new URL(`/forms/${formId}/view`, frontendUrl);
    url.searchParams.set('bindingId', bindingId);
    url.searchParams.set('token', token);
    return url.toString();
  }
}
