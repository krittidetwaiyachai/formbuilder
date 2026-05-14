import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import {
  getNewSubmissionEmailHtml,
  getFormVerificationEmailHtml,
  getCollaboratorInviteEmailHtml,
  getTestEmailHtml,
  getVerificationCodeEmailHtml } from
'./mail.templates';
function getPrimaryFrontendUrl(rawFrontendUrl: string | undefined) {
  if (!rawFrontendUrl) {
    return 'http://localhost:5173';
  }
  return (
    rawFrontendUrl.
    split(',').
    map((value) => value.trim().replace(/^"(.*)"$/, '$1')).
    find(Boolean) || 'http://localhost:5173');
}
type MailRuntimeConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  enabled: boolean;
};
@Injectable()export class
MailService {
  private transporter: nodemailer.Transporter | null = null;
  private transporterKey: string | null = null;
  private readonly logger = new Logger(MailService.name);
  constructor(
  private readonly configService: ConfigService,
  private readonly systemSettingsService: SystemSettingsService)
  {}
  private async getRuntimeConfig(): Promise<MailRuntimeConfig> {
    const effective =
    await this.systemSettingsService.getEffectiveEmailSettings();
    const enabled =
    effective.smtpHost.trim().length > 0 &&
    effective.smtpUser.trim().length > 0 &&
    effective.smtpPass.trim().length > 0;
    return {
      host: effective.smtpHost,
      port: effective.smtpPort,
      secure: effective.smtpSecure,
      user: effective.smtpUser,
      pass: effective.smtpPass,
      from: effective.smtpFrom,
      fromName: effective.smtpFromName,
      enabled
    };
  }
  private async getTransporter() {
    const config = await this.getRuntimeConfig();
    if (!config.enabled) {
      if (this.transporterKey !== '__mock__') {
        this.logger.warn(
          'No SMTP configuration found in environment/system settings. Emails will be logged to console only.'
        );
        this.transporterKey = '__mock__';
        this.transporter = null;
      }
      return { transporter: null, config };
    }
    const key = [
    config.host,
    config.port,
    config.secure ? 'secure' : 'insecure',
    config.user,
    config.from,
    config.fromName].
    join('|');
    if (this.transporter && this.transporterKey === key) {
      return { transporter: this.transporter, config };
    }
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
    this.transporterKey = key;
    this.logger.log(
      `SMTP transporter configured for ${config.host}:${config.port}`
    );
    return { transporter: this.transporter, config };
  }
  private getFromAddress(config: MailRuntimeConfig) {
    return `"${config.fromName}" <${config.from}>`;
  }
  async sendNewSubmissionEmail(
  to: string[],
  formTitle: string,
  submissionId: string,
  answers: {formId?: string;[key: string]: unknown;})
  {
    if (!to || to.length === 0) return;
    const subject = `New Submission: ${formTitle}`;
    const frontendUrl = getPrimaryFrontendUrl(
      this.configService.get<string>('FRONTEND_URL')
    );
    const link = `${frontendUrl}/forms/${answers.formId || ''}/responses`;
    const htmlContent = getNewSubmissionEmailHtml(formTitle, submissionId, link);
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to: to.join(', '),
          subject,
          html: htmlContent
        });
        this.logger.log(`Email sent: ${info.messageId}`);
      } catch (error) {
        this.logger.error('Failed to send email', error as Error);
      }
      return;
    }
    this.logger.log(`[MOCK EMAIL] To: ${to.join(', ')} | Subject: ${subject}`);
  }
  async sendFormVerificationEmail(params: {
    to: string;
    formTitle: string;
    verificationUrl: string;
  }) {
    const { to, formTitle, verificationUrl } = params;
    const subject = `Verify your email for ${formTitle}`;
    const htmlContent = getFormVerificationEmailHtml(formTitle, verificationUrl);
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent
        });
        this.logger.log(`Verification email sent: ${info.messageId}`);
      } catch (error) {
        this.logger.error('Failed to send verification email', error as Error);
      }
      return;
    }
    this.logger.log(
      `[MOCK EMAIL] To: ${to} | Subject: ${subject} | Link: ${verificationUrl}`
    );
  }
  async sendCollaboratorInviteEmail(params: {
    to: string;
    formTitle: string;
    acceptUrl: string;
    invitedByName?: string;
    invitedByEmail?: string;
    expiresInDays?: number;
  }): Promise<{sent: boolean;mode: 'smtp' | 'mock' | 'failed';}> {
    const {
      to,
      formTitle,
      acceptUrl,
      invitedByName,
      invitedByEmail,
      expiresInDays
    } = params;
    const subject = `You've been invited to collaborate on ${formTitle}`;
    const inviterLabel =
    invitedByName && invitedByName.trim().length > 0 ?
    invitedByName :
    invitedByEmail || 'a teammate';
    const displayExpiryDays =
    Number.isFinite(expiresInDays) && (expiresInDays || 0) > 0 ?
    expiresInDays :
    3;
    const htmlContent = getCollaboratorInviteEmailHtml(formTitle, acceptUrl, inviterLabel, displayExpiryDays);
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent
        });
        this.logger.log(`Collaborator invite email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error(
          'Failed to send collaborator invite email',
          error as Error
        );
        return { sent: false, mode: 'failed' };
      }
    }
    this.logger.log(
      `[MOCK EMAIL] To: ${to} | Subject: ${subject} | Link: ${acceptUrl}`
    );
    return { sent: false, mode: 'mock' };
  }
  async sendTestEmail(params: {to: string;}): Promise<{
    sent: boolean;
    mode: 'smtp' | 'mock' | 'failed';
    reason?: string;
  }> {
    const { to } = params;
    const subject = 'Form Builder SMTP test email';
    const htmlContent = getTestEmailHtml();
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent
        });
        this.logger.log(`SMTP test email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error('Failed to send SMTP test email', error as Error);
        const reason =
        error instanceof Error ? error.message : 'Unknown SMTP error';
        return { sent: false, mode: 'failed', reason };
      }
    }
    this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return { sent: false, mode: 'mock' };
  }
  async sendAdminLocalUserOtpEmail(params: {
    to: string;
    code: string;
    expiresInMinutes: number;
  }): Promise<{
    sent: boolean;
    mode: 'smtp' | 'mock' | 'failed';
    reason?: string;
  }> {
    const { to, code, expiresInMinutes } = params;
    const subject = 'Your verification code';
    const htmlContent = getVerificationCodeEmailHtml('Verification code', 'Use the following 6-digit code to verify your email address:', code, expiresInMinutes);
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent
        });
        this.logger.log(`Admin OTP email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error('Failed to send admin OTP email', error as Error);
        const reason =
        error instanceof Error ? error.message : 'Unknown SMTP error';
        return { sent: false, mode: 'failed', reason };
      }
    }
    this.logger.log(
      `[MOCK EMAIL] To: ${to} | Subject: ${subject} | Code: ${code}`
    );
    return { sent: false, mode: 'mock' };
  }
  async sendPasswordResetOtpEmail(params: {
    to: string;
    code: string;
    expiresInMinutes: number;
  }): Promise<{
    sent: boolean;
    mode: 'smtp' | 'mock' | 'failed';
    reason?: string;
  }> {
    const { to, code, expiresInMinutes } = params;
    const subject = 'Password Reset Verification Code';
    const htmlContent = getVerificationCodeEmailHtml('Password Reset', 'You have requested to reset your password. Use the following 6-digit code to verify your identity:', code, expiresInMinutes, 'If you did not request a password reset, please ignore this email.');
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent
        });
        this.logger.log(`Password reset OTP email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error(
          'Failed to send password reset OTP email',
          error as Error
        );
        const reason =
        error instanceof Error ? error.message : 'Unknown SMTP error';
        return { sent: false, mode: 'failed', reason };
      }
    }
    this.logger.log(
      `[MOCK EMAIL] To: ${to} | Subject: ${subject} | Code: ${code}`
    );
    return { sent: false, mode: 'mock' };
  }
  async sendEmailVerificationOtpEmail(params: {
    to: string;
    code: string;
    expiresInMinutes: number;
  }): Promise<{
    sent: boolean;
    mode: 'smtp' | 'mock' | 'failed';
    reason?: string;
  }> {
    const { to, code, expiresInMinutes } = params;
    const subject = 'Verify your email address';
    const htmlContent = getVerificationCodeEmailHtml('Email Verification', 'Use the following 6-digit code to verify your email address:', code, expiresInMinutes);
    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent
        });
        this.logger.log(`Email verification OTP email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error(
          'Failed to send email verification OTP email',
          error as Error
        );
        const reason =
        error instanceof Error ? error.message : 'Unknown SMTP error';
        return { sent: false, mode: 'failed', reason };
      }
    }
    this.logger.log(
      `[MOCK EMAIL] To: ${to} | Subject: ${subject} | Code: ${code}`
    );
    return { sent: false, mode: 'mock' };
  }
}