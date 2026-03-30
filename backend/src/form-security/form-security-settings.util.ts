import {
  FieldType
} from '@prisma/client';
import {
  UnprocessableEntityException
} from '@nestjs/common';

export type CanonicalEmailSource =
  | { mode: 'top_level' }
  | { mode: 'field'; fieldId: string };

export interface FormSecuritySettings {
  requireCaptcha?: boolean;
  requireEmailVerification?: boolean;
  blockDisposableEmails?: boolean;
  limitOneResponsePerEmail?: boolean;
  limitOneResponsePerIP?: boolean;
  canonicalEmailSource?: CanonicalEmailSource;
}

export interface FormFieldReference {
  id: string;
  type: FieldType;
}

export function getFormSecuritySettings(settings: unknown): FormSecuritySettings {
  if (!settings || typeof settings !== 'object') {
    return {};
  }

  const rawSettings = settings as Record<string, unknown>;
  const rawSecurity = rawSettings.security;

  if (!rawSecurity || typeof rawSecurity !== 'object') {
    return {};
  }

  const security = rawSecurity as Record<string, unknown>;
  const source = security.canonicalEmailSource;

  let canonicalEmailSource: CanonicalEmailSource | undefined;

  if (source && typeof source === 'object') {
    const sourceRecord = source as Record<string, unknown>;

    if (sourceRecord.mode === 'top_level') {
      canonicalEmailSource = { mode: 'top_level' };
    }

    if (
      sourceRecord.mode === 'field' &&
      typeof sourceRecord.fieldId === 'string' &&
      sourceRecord.fieldId.trim()
    ) {
      canonicalEmailSource = {
        mode: 'field',
        fieldId: sourceRecord.fieldId
      };
    }
  }

  return {
    requireCaptcha: security.requireCaptcha === true,
    requireEmailVerification: security.requireEmailVerification === true,
    blockDisposableEmails: security.blockDisposableEmails === true,
    limitOneResponsePerEmail: security.limitOneResponsePerEmail === true,
    limitOneResponsePerIP: security.limitOneResponsePerIP === true,
    canonicalEmailSource
  };
}

export function validateFormSecuritySettings(
  settings: unknown,
  formFields: FormFieldReference[]
): FormSecuritySettings {
  const parsed = getFormSecuritySettings(settings);
  const requiresCanonicalEmail =
    parsed.requireEmailVerification === true ||
    parsed.limitOneResponsePerEmail === true;

  if (!requiresCanonicalEmail) {
    return parsed;
  }

  if (!parsed.canonicalEmailSource) {
    throw new UnprocessableEntityException({
      code: 'FORM_SECURITY_MISCONFIGURED',
      message:
        'canonicalEmailSource is required when email verification or one-response-per-email is enabled.'
    });
  }

  if (parsed.canonicalEmailSource.mode === 'field') {
    const fieldId = parsed.canonicalEmailSource.fieldId;
    const field = formFields.find((candidate) => candidate.id === fieldId);

    if (!field || field.type !== FieldType.EMAIL) {
      throw new UnprocessableEntityException({
        code: 'FORM_SECURITY_MISCONFIGURED',
        message: 'canonicalEmailSource.fieldId must reference an EMAIL field.'
      });
    }
  }

  return parsed;
}
