import {
  BadRequestException,
  UnprocessableEntityException } from
'@nestjs/common';
import { FieldType } from '@prisma/client';
import {
  CanonicalEmailSource } from
'./form-security-settings.util';
import {
  normalizeEmail } from
'./disposable-email.util';
export interface CanonicalEmailAnswer {
  fieldId: string;
  value: string;
}
export interface CanonicalEmailFieldReference {
  id: string;
  type: FieldType;
}
export function resolveCanonicalEmail(params: {
  source?: CanonicalEmailSource;
  topLevelEmail?: string;
  answers: CanonicalEmailAnswer[];
  formFields: CanonicalEmailFieldReference[];
}): string {
  const {
    source,
    topLevelEmail,
    answers,
    formFields
  } = params;
  if (!source) {
    throw new UnprocessableEntityException({
      code: 'FORM_SECURITY_MISCONFIGURED',
      message: 'Canonical email source is not configured.'
    });
  }
  const normalizedTopLevelEmail =
  topLevelEmail && topLevelEmail.trim() ? normalizeEmail(topLevelEmail) : null;
  if (source.mode === 'top_level') {
    if (!normalizedTopLevelEmail) {
      throw new BadRequestException({
        code: 'EMAIL_REQUIRED',
        message: 'Respondent email is required.'
      });
    }
    const answerEmails = answers.
    filter((answer) =>
    formFields.some(
      (field) => field.id === answer.fieldId && field.type === FieldType.EMAIL
    )
    ).
    map((answer) => normalizeEmail(answer.value)).
    filter(Boolean);
    const mismatch = answerEmails.some((value) => value !== normalizedTopLevelEmail);
    if (mismatch) {
      throw new BadRequestException({
        code: 'EMAIL_SOURCE_MISMATCH',
        message: 'Email values do not match.'
      });
    }
    return normalizedTopLevelEmail;
  }
  const canonicalField = formFields.find((field) => field.id === source.fieldId);
  if (!canonicalField || canonicalField.type !== FieldType.EMAIL) {
    throw new UnprocessableEntityException({
      code: 'FORM_SECURITY_MISCONFIGURED',
      message: 'Canonical email field is invalid.'
    });
  }
  const fieldAnswer = answers.find((answer) => answer.fieldId === source.fieldId);
  const normalizedFieldEmail =
  fieldAnswer?.value && fieldAnswer.value.trim() ?
  normalizeEmail(fieldAnswer.value) :
  null;
  if (!normalizedFieldEmail) {
    throw new BadRequestException({
      code: 'EMAIL_REQUIRED',
      message: 'Respondent email is required.'
    });
  }
  if (normalizedTopLevelEmail && normalizedTopLevelEmail !== normalizedFieldEmail) {
    throw new BadRequestException({
      code: 'EMAIL_SOURCE_MISMATCH',
      message: 'Email values do not match.'
    });
  }
  return normalizedFieldEmail;
}