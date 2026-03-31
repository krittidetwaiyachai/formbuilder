import * as crypto from 'crypto';
import { sha256 } from './verification-binding.util';
const PUBLIC_SESSION_COOKIE_PREFIX = 'fb_public_session_';
export function getPublicSessionCookieName(formId: string): string {
  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${PUBLIC_SESSION_COOKIE_PREFIX}${sanitizedFormId}`;
}
export function extractCookieValue(
cookieHeader: string | undefined,
cookieName: string)
: string | null {
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (!trimmed.startsWith(`${cookieName}=`)) {
      continue;
    }
    return decodeURIComponent(trimmed.slice(cookieName.length + 1));
  }
  return null;
}
export function generateOpaqueSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}
export function hashOpaqueSessionToken(token: string): string {
  return sha256(token);
}
export function hashUserAgent(userAgent: string | undefined): string | null {
  if (!userAgent?.trim()) {
    return null;
  }
  return sha256(userAgent.trim());
}