import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CollaboratorInvitationStatus } from '@prisma/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
const SYSTEM_SETTINGS_ID = 'default';
const DEFAULT_INVITE_EXPIRY_DAYS = 3;
const MIN_INVITE_EXPIRY_DAYS = 1;
const MAX_INVITE_EXPIRY_DAYS = 30;
const DEFAULT_SUPPORT_EMAIL = 'support@formbuilder.com';
const DEFAULT_SUPPORT_LINE_ID = '@formbuilder';
const DEFAULT_APP_NAME = 'Form Builder';
const DEFAULT_BRANDING_PRIMARY_COLOR = '#111827';
const DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES = 30;
const DEFAULT_AUTH_MAX_FAILED_LOGIN_ATTEMPTS = 5;
const DEFAULT_AUTH_LOCKOUT_MINUTES = 15;
const DEFAULT_PASSWORD_MIN_LENGTH = 8;
const DEFAULT_AUTH_LOGIN_RATE_LIMIT = 10;
const DEFAULT_AUTH_LOGIN_RATE_WINDOW_SECONDS = 60;
const DEFAULT_PUBLIC_VERIFY_SESSION_LIMIT = 5;
const DEFAULT_PUBLIC_VERIFY_IP_LIMIT = 20;
const DEFAULT_PUBLIC_VERIFY_WINDOW_SECONDS = 600;
const DEFAULT_PUBLIC_SUBMIT_SESSION_LIMIT = 10;
const DEFAULT_PUBLIC_SUBMIT_IP_LIMIT = 20;
const DEFAULT_PUBLIC_SUBMIT_WINDOW_SECONDS = 600;
const DEFAULT_VERIFICATION_COOLDOWN_SECONDS = 60;
const DEFAULT_RETENTION_AUTO_CLEANUP_ENABLED = false;
const DEFAULT_RETENTION_AUDIT_LOG_DAYS = 180;
const DEFAULT_RETENTION_INVITATION_DAYS = 90;
const DEFAULT_RETENTION_CLEANUP_INTERVAL_HOURS = 24;
const DEFAULT_BACKUP_AUTO_ENABLED = false;
const DEFAULT_BACKUP_INTERVAL_HOURS = 24;
const DEFAULT_BACKUP_RETENTION_DAYS = 14;
const DEFAULT_MAINTENANCE_TICK_MS = 30 * 60 * 1000;
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
export type EffectiveContactSettings = {
  supportEmail: string;
  supportLineId: string;
};
export type BrandingSettings = {
  appName: string;
  logoUrl: string;
  primaryColor: string;
};
export type AuthPolicySettings = {
  sessionIdleTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  lockoutMinutes: number;
};
export type PasswordPolicySettings = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
};
export type RateLimitSettings = {
  authLoginLimit: number;
  authLoginWindowSeconds: number;
  publicVerifySessionLimit: number;
  publicVerifyIpLimit: number;
  publicVerifyWindowSeconds: number;
  publicSubmitSessionLimit: number;
  publicSubmitIpLimit: number;
  publicSubmitWindowSeconds: number;
  verificationCooldownSeconds: number;
};
export type RetentionSettings = {
  autoCleanupEnabled: boolean;
  responsesDays: number | null;
  auditLogsDays: number;
  invitationsDays: number;
  cleanupIntervalHours: number;
  lastCleanupAt: Date | null;
};
export type BackupSettings = {
  autoEnabled: boolean;
  intervalHours: number;
  retentionDays: number;
  directory: string;
  lastRunAt: Date | null;
  lastStatus: string;
  lastFile: string;
  lastError: string;
};
type BackupRecordPayload = {
  version: 1;
  createdAt: string;
  settings: Record<string, unknown>;
};
@Injectable()export class
SystemSettingsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SystemSettingsService.name);
  private maintenanceTimer: NodeJS.Timeout | null = null;
  private runningMaintenance = false;
  private runningBackup = false;
  private runningCleanup = false;
  constructor(
  private readonly prisma: PrismaService,
  private readonly configService: ConfigService)
  {}
  onModuleInit() {
    void this.runScheduledMaintenance();
    this.maintenanceTimer = setInterval(() => {
      void this.runScheduledMaintenance();
    }, DEFAULT_MAINTENANCE_TICK_MS);
  }
  onModuleDestroy() {
    if (this.maintenanceTimer) {
      clearInterval(this.maintenanceTimer);
      this.maintenanceTimer = null;
    }
  }
  private normalizeString(value: NullableString) {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  private normalizeHexColor(value: NullableString, fallback = DEFAULT_BRANDING_PRIMARY_COLOR) {
    const normalized = this.normalizeString(value);
    if (!normalized) {
      return fallback;
    }
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
  }
  private normalizePort(value: unknown, fallback: number) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 65535) {
      return fallback;
    }
    return parsed;
  }
  private normalizeInteger(
  value: unknown,
  fallback: number,
  minValue: number,
  maxValue: number)
  {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(maxValue, Math.max(minValue, parsed));
  }
  private normalizeOptionalDays(value: unknown, fallback: number | null = null) {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return Math.min(3650, parsed);
  }
  private normalizeInviteExpiryDays(value: unknown, fallback = DEFAULT_INVITE_EXPIRY_DAYS) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(MAX_INVITE_EXPIRY_DAYS, Math.max(MIN_INVITE_EXPIRY_DAYS, parsed));
  }
  private getDefaultSupportEmail() {
    return this.normalizeString(this.configService.get<string>('SUPPORT_EMAIL')) || DEFAULT_SUPPORT_EMAIL;
  }
  private getDefaultSupportLineId() {
    return this.normalizeString(this.configService.get<string>('SUPPORT_LINE')) || DEFAULT_SUPPORT_LINE_ID;
  }
  private getDefaultBackupDirectory() {
    return path.join(process.cwd(), 'var', 'system-backups');
  }
  private async getOrCreateSettingsRow() {
    return this.prisma.systemSetting.upsert({
      where: { id: SYSTEM_SETTINGS_ID },
      create: { id: SYSTEM_SETTINGS_ID },
      update: {}
    });
  }
  private buildContactSettings(settings: {supportEmail?: string | null;supportLineId?: string | null;}) {
    return {
      supportEmail: this.normalizeString(settings.supportEmail) || this.getDefaultSupportEmail(),
      supportLineId: this.normalizeString(settings.supportLineId) || this.getDefaultSupportLineId()
    };
  }
  private buildBrandingSettings(settings: {
    brandingAppName?: string | null;
    brandingLogoUrl?: string | null;
    brandingPrimaryColor?: string | null;
  }): BrandingSettings {
    return {
      appName: this.normalizeString(settings.brandingAppName) || DEFAULT_APP_NAME,
      logoUrl: this.normalizeString(settings.brandingLogoUrl) || '',
      primaryColor: this.normalizeHexColor(settings.brandingPrimaryColor, DEFAULT_BRANDING_PRIMARY_COLOR)
    };
  }
  private buildAuthPolicySettings(settings: {
    authSessionIdleTimeoutMinutes?: number | null;
    authMaxFailedLoginAttempts?: number | null;
    authLockoutMinutes?: number | null;
  }): AuthPolicySettings {
    return {
      sessionIdleTimeoutMinutes: this.normalizeInteger(
        settings.authSessionIdleTimeoutMinutes,
        DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES,
        5,
        24 * 60
      ),
      maxFailedLoginAttempts: this.normalizeInteger(
        settings.authMaxFailedLoginAttempts,
        DEFAULT_AUTH_MAX_FAILED_LOGIN_ATTEMPTS,
        1,
        20
      ),
      lockoutMinutes: this.normalizeInteger(
        settings.authLockoutMinutes,
        DEFAULT_AUTH_LOCKOUT_MINUTES,
        1,
        24 * 60
      )
    };
  }
  private buildPasswordPolicySettings(settings: {
    passwordMinLength?: number | null;
    passwordRequireUppercase?: boolean | null;
    passwordRequireLowercase?: boolean | null;
    passwordRequireNumber?: boolean | null;
    passwordRequireSymbol?: boolean | null;
  }): PasswordPolicySettings {
    return {
      minLength: this.normalizeInteger(settings.passwordMinLength, DEFAULT_PASSWORD_MIN_LENGTH, 6, 64),
      requireUppercase: settings.passwordRequireUppercase ?? true,
      requireLowercase: settings.passwordRequireLowercase ?? true,
      requireNumber: settings.passwordRequireNumber ?? true,
      requireSymbol: settings.passwordRequireSymbol ?? false
    };
  }
  private buildRateLimitSettings(settings: {
    rateAuthLoginLimit?: number | null;
    rateAuthLoginWindowSeconds?: number | null;
    ratePublicVerifySessionLimit?: number | null;
    ratePublicVerifyIpLimit?: number | null;
    ratePublicVerifyWindowSeconds?: number | null;
    ratePublicSubmitSessionLimit?: number | null;
    ratePublicSubmitIpLimit?: number | null;
    ratePublicSubmitWindowSeconds?: number | null;
    rateVerificationCooldownSeconds?: number | null;
  }): RateLimitSettings {
    return {
      authLoginLimit: this.normalizeInteger(settings.rateAuthLoginLimit, DEFAULT_AUTH_LOGIN_RATE_LIMIT, 1, 500),
      authLoginWindowSeconds: this.normalizeInteger(
        settings.rateAuthLoginWindowSeconds,
        DEFAULT_AUTH_LOGIN_RATE_WINDOW_SECONDS,
        10,
        24 * 60 * 60
      ),
      publicVerifySessionLimit: this.normalizeInteger(
        settings.ratePublicVerifySessionLimit,
        DEFAULT_PUBLIC_VERIFY_SESSION_LIMIT,
        1,
        500
      ),
      publicVerifyIpLimit: this.normalizeInteger(
        settings.ratePublicVerifyIpLimit,
        DEFAULT_PUBLIC_VERIFY_IP_LIMIT,
        1,
        1000
      ),
      publicVerifyWindowSeconds: this.normalizeInteger(
        settings.ratePublicVerifyWindowSeconds,
        DEFAULT_PUBLIC_VERIFY_WINDOW_SECONDS,
        10,
        24 * 60 * 60
      ),
      publicSubmitSessionLimit: this.normalizeInteger(
        settings.ratePublicSubmitSessionLimit,
        DEFAULT_PUBLIC_SUBMIT_SESSION_LIMIT,
        1,
        500
      ),
      publicSubmitIpLimit: this.normalizeInteger(
        settings.ratePublicSubmitIpLimit,
        DEFAULT_PUBLIC_SUBMIT_IP_LIMIT,
        1,
        1000
      ),
      publicSubmitWindowSeconds: this.normalizeInteger(
        settings.ratePublicSubmitWindowSeconds,
        DEFAULT_PUBLIC_SUBMIT_WINDOW_SECONDS,
        10,
        24 * 60 * 60
      ),
      verificationCooldownSeconds: this.normalizeInteger(
        settings.rateVerificationCooldownSeconds,
        DEFAULT_VERIFICATION_COOLDOWN_SECONDS,
        5,
        3600
      )
    };
  }
  private buildRetentionSettings(settings: {
    retentionAutoCleanupEnabled?: boolean | null;
    retentionResponsesDays?: number | null;
    retentionAuditLogsDays?: number | null;
    retentionInvitationsDays?: number | null;
    retentionCleanupIntervalHours?: number | null;
    retentionLastCleanupAt?: Date | null;
  }): RetentionSettings {
    return {
      autoCleanupEnabled: settings.retentionAutoCleanupEnabled ?? DEFAULT_RETENTION_AUTO_CLEANUP_ENABLED,
      responsesDays: this.normalizeOptionalDays(settings.retentionResponsesDays, null),
      auditLogsDays: this.normalizeInteger(
        settings.retentionAuditLogsDays,
        DEFAULT_RETENTION_AUDIT_LOG_DAYS,
        1,
        3650
      ),
      invitationsDays: this.normalizeInteger(
        settings.retentionInvitationsDays,
        DEFAULT_RETENTION_INVITATION_DAYS,
        1,
        3650
      ),
      cleanupIntervalHours: this.normalizeInteger(
        settings.retentionCleanupIntervalHours,
        DEFAULT_RETENTION_CLEANUP_INTERVAL_HOURS,
        1,
        24 * 30
      ),
      lastCleanupAt: settings.retentionLastCleanupAt || null
    };
  }
  private buildBackupSettings(settings: {
    backupAutoEnabled?: boolean | null;
    backupIntervalHours?: number | null;
    backupRetentionDays?: number | null;
    backupDirectory?: string | null;
    backupLastRunAt?: Date | null;
    backupLastStatus?: string | null;
    backupLastFile?: string | null;
    backupLastError?: string | null;
  }): BackupSettings {
    return {
      autoEnabled: settings.backupAutoEnabled ?? DEFAULT_BACKUP_AUTO_ENABLED,
      intervalHours: this.normalizeInteger(settings.backupIntervalHours, DEFAULT_BACKUP_INTERVAL_HOURS, 1, 24 * 30),
      retentionDays: this.normalizeInteger(settings.backupRetentionDays, DEFAULT_BACKUP_RETENTION_DAYS, 1, 3650),
      directory: this.normalizeString(settings.backupDirectory) || this.getDefaultBackupDirectory(),
      lastRunAt: settings.backupLastRunAt || null,
      lastStatus: this.normalizeString(settings.backupLastStatus) || '',
      lastFile: this.normalizeString(settings.backupLastFile) || '',
      lastError: this.normalizeString(settings.backupLastError) || ''
    };
  }
  async getPublicSettings() {
    const settings = await this.getOrCreateSettingsRow();
    const effectiveEmail = await this.getEffectiveEmailSettings();
    const effectiveContact = this.buildContactSettings(settings);
    const branding = this.buildBrandingSettings(settings);
    const authPolicy = this.buildAuthPolicySettings(settings);
    const passwordPolicy = this.buildPasswordPolicySettings(settings);
    const rateLimit = this.buildRateLimitSettings(settings);
    const retention = this.buildRetentionSettings(settings);
    const backup = this.buildBackupSettings(settings);
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
        this.normalizeString(effectiveEmail.smtpPass) !== null
      },
      contact: effectiveContact,
      branding,
      authPolicy,
      passwordPolicy,
      rateLimit,
      retention,
      backup,
      invite: {
        expiryDays: this.normalizeInviteExpiryDays(settings.inviteExpiryDays)
      }
    };
  }
  async getPublicContactSettings(): Promise<EffectiveContactSettings> {
    const settings = await this.getOrCreateSettingsRow();
    return this.buildContactSettings(settings);
  }
  async getPublicClientSettings() {
    const settings = await this.getOrCreateSettingsRow();
    return {
      contact: this.buildContactSettings(settings),
      branding: this.buildBrandingSettings(settings),
      authPolicy: this.buildAuthPolicySettings(settings),
      passwordPolicy: this.buildPasswordPolicySettings(settings)
    };
  }
  async getAuthPolicySettings(): Promise<AuthPolicySettings> {
    const settings = await this.getOrCreateSettingsRow();
    return this.buildAuthPolicySettings(settings);
  }
  async getPasswordPolicySettings(): Promise<PasswordPolicySettings> {
    const settings = await this.getOrCreateSettingsRow();
    return this.buildPasswordPolicySettings(settings);
  }
  async getRateLimitSettings(): Promise<RateLimitSettings> {
    const settings = await this.getOrCreateSettingsRow();
    return this.buildRateLimitSettings(settings);
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
    const nextPassword = payload.clearSmtpPass ?
    null :
    payload.smtpPass !== undefined ?
    this.normalizeString(payload.smtpPass) :
    existing.smtpPass;
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        smtpHost: payload.smtpHost !== undefined ? this.normalizeString(payload.smtpHost) : existing.smtpHost,
        smtpPort:
        payload.smtpPort !== undefined ?
        this.normalizePort(payload.smtpPort, existing.smtpPort ?? 587) :
        existing.smtpPort,
        smtpSecure: typeof payload.smtpSecure === 'boolean' ? payload.smtpSecure : existing.smtpSecure,
        smtpUser: payload.smtpUser !== undefined ? this.normalizeString(payload.smtpUser) : existing.smtpUser,
        smtpFrom: payload.smtpFrom !== undefined ? this.normalizeString(payload.smtpFrom) : existing.smtpFrom,
        smtpFromName:
        payload.smtpFromName !== undefined ?
        this.normalizeString(payload.smtpFromName) :
        existing.smtpFromName,
        smtpPass: nextPassword
      }
    });
    return this.getPublicSettings();
  }
  async updateContactSettings(payload: {
    supportEmail?: string | null;
    supportLineId?: string | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        supportEmail:
        payload.supportEmail !== undefined ? this.normalizeString(payload.supportEmail) : existing.supportEmail,
        supportLineId:
        payload.supportLineId !== undefined ? this.normalizeString(payload.supportLineId) : existing.supportLineId
      }
    });
    return this.getPublicSettings();
  }
  async updateBrandingSettings(payload: {
    appName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        brandingAppName: payload.appName !== undefined ? this.normalizeString(payload.appName) : existing.brandingAppName,
        brandingLogoUrl: payload.logoUrl !== undefined ? this.normalizeString(payload.logoUrl) : existing.brandingLogoUrl,
        brandingPrimaryColor:
        payload.primaryColor !== undefined ?
        this.normalizeHexColor(payload.primaryColor, DEFAULT_BRANDING_PRIMARY_COLOR) :
        existing.brandingPrimaryColor
      }
    });
    return this.getPublicSettings();
  }
  async updateAuthPolicySettings(payload: {
    sessionIdleTimeoutMinutes?: number | string | null;
    maxFailedLoginAttempts?: number | string | null;
    lockoutMinutes?: number | string | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        authSessionIdleTimeoutMinutes:
        payload.sessionIdleTimeoutMinutes !== undefined ?
        this.normalizeInteger(
          payload.sessionIdleTimeoutMinutes,
          existing.authSessionIdleTimeoutMinutes ?? DEFAULT_SESSION_IDLE_TIMEOUT_MINUTES,
          5,
          24 * 60
        ) :
        existing.authSessionIdleTimeoutMinutes,
        authMaxFailedLoginAttempts:
        payload.maxFailedLoginAttempts !== undefined ?
        this.normalizeInteger(
          payload.maxFailedLoginAttempts,
          existing.authMaxFailedLoginAttempts ?? DEFAULT_AUTH_MAX_FAILED_LOGIN_ATTEMPTS,
          1,
          20
        ) :
        existing.authMaxFailedLoginAttempts,
        authLockoutMinutes:
        payload.lockoutMinutes !== undefined ?
        this.normalizeInteger(
          payload.lockoutMinutes,
          existing.authLockoutMinutes ?? DEFAULT_AUTH_LOCKOUT_MINUTES,
          1,
          24 * 60
        ) :
        existing.authLockoutMinutes
      }
    });
    return this.getPublicSettings();
  }
  async updatePasswordPolicySettings(payload: {
    minLength?: number | string | null;
    requireUppercase?: boolean | null;
    requireLowercase?: boolean | null;
    requireNumber?: boolean | null;
    requireSymbol?: boolean | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        passwordMinLength:
        payload.minLength !== undefined ?
        this.normalizeInteger(payload.minLength, existing.passwordMinLength ?? DEFAULT_PASSWORD_MIN_LENGTH, 6, 64) :
        existing.passwordMinLength,
        passwordRequireUppercase:
        typeof payload.requireUppercase === 'boolean' ?
        payload.requireUppercase :
        existing.passwordRequireUppercase,
        passwordRequireLowercase:
        typeof payload.requireLowercase === 'boolean' ?
        payload.requireLowercase :
        existing.passwordRequireLowercase,
        passwordRequireNumber:
        typeof payload.requireNumber === 'boolean' ?
        payload.requireNumber :
        existing.passwordRequireNumber,
        passwordRequireSymbol:
        typeof payload.requireSymbol === 'boolean' ?
        payload.requireSymbol :
        existing.passwordRequireSymbol
      }
    });
    return this.getPublicSettings();
  }
  async updateRateLimitSettings(payload: {
    authLoginLimit?: number | string | null;
    authLoginWindowSeconds?: number | string | null;
    publicVerifySessionLimit?: number | string | null;
    publicVerifyIpLimit?: number | string | null;
    publicVerifyWindowSeconds?: number | string | null;
    publicSubmitSessionLimit?: number | string | null;
    publicSubmitIpLimit?: number | string | null;
    publicSubmitWindowSeconds?: number | string | null;
    verificationCooldownSeconds?: number | string | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        rateAuthLoginLimit:
        payload.authLoginLimit !== undefined ?
        this.normalizeInteger(payload.authLoginLimit, existing.rateAuthLoginLimit ?? DEFAULT_AUTH_LOGIN_RATE_LIMIT, 1, 500) :
        existing.rateAuthLoginLimit,
        rateAuthLoginWindowSeconds:
        payload.authLoginWindowSeconds !== undefined ?
        this.normalizeInteger(
          payload.authLoginWindowSeconds,
          existing.rateAuthLoginWindowSeconds ?? DEFAULT_AUTH_LOGIN_RATE_WINDOW_SECONDS,
          10,
          24 * 60 * 60
        ) :
        existing.rateAuthLoginWindowSeconds,
        ratePublicVerifySessionLimit:
        payload.publicVerifySessionLimit !== undefined ?
        this.normalizeInteger(
          payload.publicVerifySessionLimit,
          existing.ratePublicVerifySessionLimit ?? DEFAULT_PUBLIC_VERIFY_SESSION_LIMIT,
          1,
          500
        ) :
        existing.ratePublicVerifySessionLimit,
        ratePublicVerifyIpLimit:
        payload.publicVerifyIpLimit !== undefined ?
        this.normalizeInteger(
          payload.publicVerifyIpLimit,
          existing.ratePublicVerifyIpLimit ?? DEFAULT_PUBLIC_VERIFY_IP_LIMIT,
          1,
          1000
        ) :
        existing.ratePublicVerifyIpLimit,
        ratePublicVerifyWindowSeconds:
        payload.publicVerifyWindowSeconds !== undefined ?
        this.normalizeInteger(
          payload.publicVerifyWindowSeconds,
          existing.ratePublicVerifyWindowSeconds ?? DEFAULT_PUBLIC_VERIFY_WINDOW_SECONDS,
          10,
          24 * 60 * 60
        ) :
        existing.ratePublicVerifyWindowSeconds,
        ratePublicSubmitSessionLimit:
        payload.publicSubmitSessionLimit !== undefined ?
        this.normalizeInteger(
          payload.publicSubmitSessionLimit,
          existing.ratePublicSubmitSessionLimit ?? DEFAULT_PUBLIC_SUBMIT_SESSION_LIMIT,
          1,
          500
        ) :
        existing.ratePublicSubmitSessionLimit,
        ratePublicSubmitIpLimit:
        payload.publicSubmitIpLimit !== undefined ?
        this.normalizeInteger(
          payload.publicSubmitIpLimit,
          existing.ratePublicSubmitIpLimit ?? DEFAULT_PUBLIC_SUBMIT_IP_LIMIT,
          1,
          1000
        ) :
        existing.ratePublicSubmitIpLimit,
        ratePublicSubmitWindowSeconds:
        payload.publicSubmitWindowSeconds !== undefined ?
        this.normalizeInteger(
          payload.publicSubmitWindowSeconds,
          existing.ratePublicSubmitWindowSeconds ?? DEFAULT_PUBLIC_SUBMIT_WINDOW_SECONDS,
          10,
          24 * 60 * 60
        ) :
        existing.ratePublicSubmitWindowSeconds,
        rateVerificationCooldownSeconds:
        payload.verificationCooldownSeconds !== undefined ?
        this.normalizeInteger(
          payload.verificationCooldownSeconds,
          existing.rateVerificationCooldownSeconds ?? DEFAULT_VERIFICATION_COOLDOWN_SECONDS,
          5,
          3600
        ) :
        existing.rateVerificationCooldownSeconds
      }
    });
    return this.getPublicSettings();
  }
  async updateRetentionSettings(payload: {
    autoCleanupEnabled?: boolean | null;
    responsesDays?: number | string | null;
    auditLogsDays?: number | string | null;
    invitationsDays?: number | string | null;
    cleanupIntervalHours?: number | string | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        retentionAutoCleanupEnabled:
        typeof payload.autoCleanupEnabled === 'boolean' ?
        payload.autoCleanupEnabled :
        existing.retentionAutoCleanupEnabled,
        retentionResponsesDays:
        payload.responsesDays !== undefined ?
        this.normalizeOptionalDays(payload.responsesDays, null) :
        existing.retentionResponsesDays,
        retentionAuditLogsDays:
        payload.auditLogsDays !== undefined ?
        this.normalizeInteger(
          payload.auditLogsDays,
          existing.retentionAuditLogsDays ?? DEFAULT_RETENTION_AUDIT_LOG_DAYS,
          1,
          3650
        ) :
        existing.retentionAuditLogsDays,
        retentionInvitationsDays:
        payload.invitationsDays !== undefined ?
        this.normalizeInteger(
          payload.invitationsDays,
          existing.retentionInvitationsDays ?? DEFAULT_RETENTION_INVITATION_DAYS,
          1,
          3650
        ) :
        existing.retentionInvitationsDays,
        retentionCleanupIntervalHours:
        payload.cleanupIntervalHours !== undefined ?
        this.normalizeInteger(
          payload.cleanupIntervalHours,
          existing.retentionCleanupIntervalHours ?? DEFAULT_RETENTION_CLEANUP_INTERVAL_HOURS,
          1,
          24 * 30
        ) :
        existing.retentionCleanupIntervalHours
      }
    });
    return this.getPublicSettings();
  }
  async updateBackupSettings(payload: {
    autoEnabled?: boolean | null;
    intervalHours?: number | string | null;
    retentionDays?: number | string | null;
    directory?: string | null;
  }) {
    const existing = await this.getOrCreateSettingsRow();
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        backupAutoEnabled: typeof payload.autoEnabled === 'boolean' ? payload.autoEnabled : existing.backupAutoEnabled,
        backupIntervalHours:
        payload.intervalHours !== undefined ?
        this.normalizeInteger(
          payload.intervalHours,
          existing.backupIntervalHours ?? DEFAULT_BACKUP_INTERVAL_HOURS,
          1,
          24 * 30
        ) :
        existing.backupIntervalHours,
        backupRetentionDays:
        payload.retentionDays !== undefined ?
        this.normalizeInteger(
          payload.retentionDays,
          existing.backupRetentionDays ?? DEFAULT_BACKUP_RETENTION_DAYS,
          1,
          3650
        ) :
        existing.backupRetentionDays,
        backupDirectory:
        payload.directory !== undefined ? this.normalizeString(payload.directory) : existing.backupDirectory
      }
    });
    return this.getPublicSettings();
  }
  async updateInviteSettings(payload: {expiryDays?: number | string | null;}) {
    const existing = await this.getOrCreateSettingsRow();
    const nextExpiryDays =
    payload.expiryDays !== undefined ?
    this.normalizeInviteExpiryDays(payload.expiryDays, existing.inviteExpiryDays) :
    this.normalizeInviteExpiryDays(existing.inviteExpiryDays);
    await this.prisma.systemSetting.update({
      where: { id: SYSTEM_SETTINGS_ID },
      data: {
        inviteExpiryDays: nextExpiryDays
      }
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
      smtpFromName: this.normalizeString(settings.smtpFromName) || envFromName || 'Form Builder'
    };
  }
  private shouldRunByHours(lastRun: Date | null | undefined, intervalHours: number) {
    if (!lastRun) {
      return true;
    }
    const diffMs = Date.now() - lastRun.getTime();
    return diffMs >= intervalHours * 60 * 60 * 1000;
  }
  private getTimestampSuffix(now = new Date()) {
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }
  private async ensureDirectory(targetDirectory: string) {
    await fs.mkdir(targetDirectory, { recursive: true });
  }
  private async listBackupFiles(targetDirectory: string) {
    try {
      const files = await fs.readdir(targetDirectory, { withFileTypes: true });
      const backupFiles = await Promise.all(
        files.
        filter((entry) => entry.isFile() && /^system-settings-\d{8}-\d{6}\.json$/i.test(entry.name)).
        map(async (entry) => {
          const fullPath = path.join(targetDirectory, entry.name);
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            fullPath,
            mtimeMs: stats.mtimeMs
          };
        })
      );
      backupFiles.sort((a, b) => b.mtimeMs - a.mtimeMs);
      return backupFiles;
    } catch {
      return [];
    }
  }
  private async pruneBackupFiles(targetDirectory: string, retentionDays: number) {
    const files = await this.listBackupFiles(targetDirectory);
    const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    await Promise.all(
      files.
      filter((file) => file.mtimeMs < cutoffMs).
      map((file) =>
      fs.unlink(file.fullPath).catch(() => {
        return;
      })
      )
    );
  }
  private extractBackupPayloadSource(settings: Awaited<ReturnType<SystemSettingsService['getOrCreateSettingsRow']>>) {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...settingsWithoutMeta
    } = settings;
    return settingsWithoutMeta;
  }
  async runBackupNow() {
    if (this.runningBackup) {
      return {
        status: 'skipped',
        reason: 'Backup is already running.'
      };
    }
    this.runningBackup = true;
    try {
      const settings = await this.getOrCreateSettingsRow();
      const backupSettings = this.buildBackupSettings(settings);
      const targetDirectory = backupSettings.directory;
      await this.ensureDirectory(targetDirectory);
      const timestamp = this.getTimestampSuffix();
      const fileName = `system-settings-${timestamp}.json`;
      const fullPath = path.join(targetDirectory, fileName);
      const payload: BackupRecordPayload = {
        version: 1,
        createdAt: new Date().toISOString(),
        settings: this.extractBackupPayloadSource(settings)
      };
      await fs.writeFile(fullPath, JSON.stringify(payload, null, 2), 'utf8');
      await this.pruneBackupFiles(targetDirectory, backupSettings.retentionDays);
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          backupLastRunAt: new Date(),
          backupLastStatus: 'success',
          backupLastFile: fileName,
          backupLastError: null
        }
      });
      return {
        status: 'success',
        fileName,
        directory: targetDirectory
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown backup error';
      this.logger.error(`Backup failed: ${message}`);
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          backupLastRunAt: new Date(),
          backupLastStatus: 'failed',
          backupLastError: message
        }
      });
      return {
        status: 'failed',
        error: message
      };
    } finally {
      this.runningBackup = false;
    }
  }
  private buildRestoreUpdateData(raw: Record<string, unknown>) {
    const allowedKeys = new Set<string>([
    'smtpHost',
    'smtpPort',
    'smtpSecure',
    'smtpUser',
    'smtpPass',
    'smtpFrom',
    'smtpFromName',
    'supportEmail',
    'supportLineId',
    'brandingAppName',
    'brandingLogoUrl',
    'brandingPrimaryColor',
    'authSessionIdleTimeoutMinutes',
    'authMaxFailedLoginAttempts',
    'authLockoutMinutes',
    'passwordMinLength',
    'passwordRequireUppercase',
    'passwordRequireLowercase',
    'passwordRequireNumber',
    'passwordRequireSymbol',
    'rateAuthLoginLimit',
    'rateAuthLoginWindowSeconds',
    'ratePublicVerifySessionLimit',
    'ratePublicVerifyIpLimit',
    'ratePublicVerifyWindowSeconds',
    'ratePublicSubmitSessionLimit',
    'ratePublicSubmitIpLimit',
    'ratePublicSubmitWindowSeconds',
    'rateVerificationCooldownSeconds',
    'retentionAutoCleanupEnabled',
    'retentionResponsesDays',
    'retentionAuditLogsDays',
    'retentionInvitationsDays',
    'retentionCleanupIntervalHours',
    'inviteExpiryDays',
    'backupAutoEnabled',
    'backupIntervalHours',
    'backupRetentionDays',
    'backupDirectory']
    );
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (!allowedKeys.has(key)) {
        continue;
      }
      updateData[key] = value;
    }
    return updateData;
  }
  async restoreLatestBackup() {
    const settings = await this.getOrCreateSettingsRow();
    const backupSettings = this.buildBackupSettings(settings);
    const targetDirectory = backupSettings.directory;
    await this.ensureDirectory(targetDirectory);
    const files = await this.listBackupFiles(targetDirectory);
    if (files.length === 0) {
      return {
        status: 'failed',
        error: 'No backup file found.'
      };
    }
    const latest = files[0];
    try {
      const rawText = await fs.readFile(latest.fullPath, 'utf8');
      const parsed = JSON.parse(rawText) as BackupRecordPayload;
      if (!parsed || typeof parsed !== 'object' || typeof parsed.settings !== 'object' || !parsed.settings) {
        throw new Error('Invalid backup file format.');
      }
      const updateData = this.buildRestoreUpdateData(parsed.settings as Record<string, unknown>);
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          ...(updateData as Record<string, any>),
          backupLastStatus: 'restored',
          backupLastFile: latest.name,
          backupLastError: null
        }
      });
      return {
        status: 'success',
        fileName: latest.name
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown restore error';
      this.logger.error(`Restore failed: ${message}`);
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          backupLastStatus: 'failed',
          backupLastError: message
        }
      });
      return {
        status: 'failed',
        error: message
      };
    }
  }
  async runRetentionCleanupNow() {
    if (this.runningCleanup) {
      return {
        status: 'skipped',
        reason: 'Cleanup is already running.'
      };
    }
    this.runningCleanup = true;
    try {
      const settings = await this.getOrCreateSettingsRow();
      const retentionSettings = this.buildRetentionSettings(settings);
      const now = new Date();
      let deletedResponses = 0;
      let deletedAuditLogs = 0;
      let deletedInvitations = 0;
      if (retentionSettings.responsesDays && retentionSettings.responsesDays > 0) {
        const cutoff = new Date(now.getTime() - retentionSettings.responsesDays * 24 * 60 * 60 * 1000);
        const result = await this.prisma.formResponse.deleteMany({
          where: {
            createdAt: { lt: cutoff }
          }
        });
        deletedResponses = result.count;
      }
      if (retentionSettings.auditLogsDays > 0) {
        const cutoff = new Date(now.getTime() - retentionSettings.auditLogsDays * 24 * 60 * 60 * 1000);
        const result = await this.prisma.activityLog.deleteMany({
          where: {
            createdAt: { lt: cutoff }
          }
        });
        deletedAuditLogs = result.count;
      }
      if (retentionSettings.invitationsDays > 0) {
        const cutoff = new Date(now.getTime() - retentionSettings.invitationsDays * 24 * 60 * 60 * 1000);
        const result = await this.prisma.formCollaboratorInvitation.deleteMany({
          where: {
            createdAt: { lt: cutoff },
            OR: [
            { status: { not: CollaboratorInvitationStatus.PENDING } },
            { expiresAt: { lte: now } }]
          }
        });
        deletedInvitations = result.count;
      }
      await this.prisma.systemSetting.update({
        where: { id: SYSTEM_SETTINGS_ID },
        data: {
          retentionLastCleanupAt: now
        }
      });
      return {
        status: 'success',
        deletedResponses,
        deletedAuditLogs,
        deletedInvitations
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown cleanup error';
      this.logger.error(`Retention cleanup failed: ${message}`);
      return {
        status: 'failed',
        error: message
      };
    } finally {
      this.runningCleanup = false;
    }
  }
  private async runScheduledMaintenance() {
    if (this.runningMaintenance) {
      return;
    }
    this.runningMaintenance = true;
    try {
      const settings = await this.getOrCreateSettingsRow();
      const retention = this.buildRetentionSettings(settings);
      const backup = this.buildBackupSettings(settings);
      if (
      retention.autoCleanupEnabled &&
      this.shouldRunByHours(retention.lastCleanupAt, retention.cleanupIntervalHours))
      {
        await this.runRetentionCleanupNow();
      }
      if (backup.autoEnabled && this.shouldRunByHours(backup.lastRunAt, backup.intervalHours)) {
        await this.runBackupNow();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown maintenance error';
      this.logger.error(`Scheduled maintenance failed: ${message}`);
    } finally {
      this.runningMaintenance = false;
    }
  }
}