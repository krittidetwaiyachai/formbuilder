import { DISPOSABLE_EMAIL_DOMAINS } from './disposable-domains';
const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com']);
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return trimmed;
  }
  let localPart = trimmed.substring(0, atIndex);
  const rawDomain = trimmed.substring(atIndex + 1);
  const plusIndex = localPart.indexOf('+');
  if (plusIndex > 0) {
    localPart = localPart.substring(0, plusIndex);
  }
  if (GMAIL_DOMAINS.has(rawDomain)) {
    localPart = localPart.replace(/\./g, '');
  }
  const domain = rawDomain === 'googlemail.com' ? 'gmail.com' : rawDomain;
  return `${localPart}@${domain}`;
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