import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-domains';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getEmailDomain(email: string): string {
  const normalizedEmail = normalizeEmail(email);
  const separatorIndex = normalizedEmail.lastIndexOf('@');

  if (separatorIndex <= 0 || separatorIndex === normalizedEmail.length - 1) {
    return '';
  }

  return normalizedEmail.slice(separatorIndex + 1);
}

export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);

  if (!domain) {
    return false;
  }

  for (const blockedDomain of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) {
      return true;
    }
  }

  return false;
}
