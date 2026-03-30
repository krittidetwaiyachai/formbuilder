import * as crypto from 'crypto';

export function generateBindingId(): string {
  return crypto.randomUUID();
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateGrantToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
