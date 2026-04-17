import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

const SYSTEM_SETTINGS_ID = 'default';
const DEFAULT_INVITE_EXPIRY_DAYS = 3;
const MIN_INVITE_EXPIRY_DAYS = 1;
const MAX_INVITE_EXPIRY_DAYS = 30;

type NullableString = string | null | undefined;

export type EffectiveEmailSettings = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpFromName: string;
};

@Injectable()
export class SystemSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private normalizeString(value: NullableString) {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizePort(value: unknown, fallback: number) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 65535) {
      return fallback;
    }
    return parsed;
  }

  private normalizeInviteExpiryDays(value: unknown, fallback = DEFAULT_INVITE_EXPIRY_DAYS) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(MAX_INVITE_EXPIRY_DAYS, Math.max(MIN_INVITE_EXPIRY_DAYS, parsed));
  }

  private async getOrCreateSettingsRow() {
    return this.prisma.systemSetting.upsert({
      where: { id: SYSTEM_SETTINGS_ID },
      create: { id: SYSTEM_SETTINGS_ID },
      update: {},
    });
  }

  async getPublicSettings() {
    const settings = await this.getOrCreateSettingsRow();
    const effectiveEmail = await this.getEffectiveEmailSettings();
    return {
      email: {
        smtpHost: this.normalizeString(settings.smtpHost) || '',
        smtpPort: settings.smtpPort ?? effectiveEmail.smtpPort,
        smtpSecure: settings.smtpSecure ?? false,
        smtpUser: this.normalizeString(settings.smtpUser) || '',
        smtpFrom: this.normalizeString(settings.smtpFrom) || '',
        smtpFromName: this.normalizeString(settings.smtpFromName) || '',
        hasPassword:
          this.normalizeString(settings.smtpPass) !== null ||
          this.normalizeString(this.configService.get<string>('SMTP_PASS')) !== null,
        isConfigured:
          this.normalizeString(effectiveEmail.smtpHost) !== null &&
          this.normalizeString(effectiveEmail.smtpUser) !== null &&
          this.normalizeString(effectiveEmail.smtpPass) !== null,
      },
      invite: {
        expiryDays: this.normalizeInviteExpiryDays(settings.inviteExpiryDays),
      },
    };
  }

  async updateEmailSettings(payload: {
    smtpHost?: string | null;
    smtpPort?: number | string | null;
    smtpSecure?: boolean | null;
    smtpUser?: string | null;
    smtpFrom?: string | null;
    smtpFromName?: string | null;
    smtpPass?: string | null;
    clearSmtpPass?: boolean;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    const nextPassword = payload.clearSmtpPass
      ? null
      : payload.smtpPass !== undefined
        ? this.normalizeString(payload.smtpPass)
        : existing.smtpPass;

    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        smtpHost:
          payload.smtpHost !== undefined ? this.normalizeString(payload.smtpHost) : existing.smtpHost,
        smtpPort:
          payload.smtpPort !== undefined
            ? this.normalizePort(payload.smtpPort, existing.smtpPort ?? 587)
            : existing.smtpPort,
        smtpSecure:
          typeof payload.smtpSecure === 'boolean' ? payload.smtpSecure : existing.smtpSecure,
        smtpUser:
          payload.smtpUser !== undefined ? this.normalizeString(payload.smtpUser) : existing.smtpUser,
        smtpFrom:
          payload.smtpFrom !== undefined ? this.normalizeString(payload.smtpFrom) : existing.smtpFrom,
        smtpFromName:
          payload.smtpFromName !== undefined
            ? this.normalizeString(payload.smtpFromName)
            : existing.smtpFromName,
        smtpPass: nextPassword,
      },
    });

    return this.getPublicSettings();
  }

  async updateInviteSettings(payload: { expiryDays?: number | string | null }) {
    const existing = await this.getOrCreateSettingsRow();
    const nextExpiryDays =
      payload.expiryDays !== undefined
        ? this.normalizeInviteExpiryDays(payload.expiryDays, existing.inviteExpiryDays)
        : this.normalizeInviteExpiryDays(existing.inviteExpiryDays);

    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        inviteExpiryDays: nextExpiryDays,
      },
    });

    return this.getPublicSettings();
  }

  async getInviteExpiryDays() {
    const settings = await this.getOrCreateSettingsRow();
    return this.normalizeInviteExpiryDays(settings.inviteExpiryDays);
  }

  async getEffectiveEmailSettings(): Promise<EffectiveEmailSettings> {
    const settings = await this.getOrCreateSettingsRow();
    const envHost = this.normalizeString(this.configService.get<string>('SMTP_HOST'));
    const envPort = this.normalizePort(this.configService.get<string>('SMTP_PORT'), 587);
    const envSecure = this.configService.get<string>('SMTP_SECURE')?.toLowerCase() === 'true';
    const envUser = this.normalizeString(this.configService.get<string>('SMTP_USER'));
    const envPass = this.normalizeString(this.configService.get<string>('SMTP_PASS'));
    const envFrom = this.normalizeString(this.configService.get<string>('SMTP_FROM'));
    const envFromName = this.normalizeString(this.configService.get<string>('SMTP_FROM_NAME'));

    return {
      smtpHost: this.normalizeString(settings.smtpHost) || envHost || '',
      smtpPort: this.normalizePort(settings.smtpPort ?? envPort, 587),
      smtpSecure: settings.smtpSecure ?? envSecure,
      smtpUser: this.normalizeString(settings.smtpUser) || envUser || '',
      smtpPass: this.normalizeString(settings.smtpPass) || envPass || '',
      smtpFrom: this.normalizeString(settings.smtpFrom) || envFrom || 'noreply@formbuilder.com',
      smtpFromName: this.normalizeString(settings.smtpFromName) || envFromName || 'Form Builder',
    };
  }
}

