import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SystemSettingsService } from '../system-settings/system-settings.service';

function getPrimaryFrontendUrl(rawFrontendUrl: string | undefined) {
  if (!rawFrontendUrl) {
    return 'http://localhost:5173';
  }
  return rawFrontendUrl
    .split(',')
    .map((value) => value.trim().replace(/^"(.*)"$/, '$1'))
    .find(Boolean) || 'http://localhost:5173';
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

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private transporterKey: string | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  private async getRuntimeConfig(): Promise<MailRuntimeConfig> {
    const effective = await this.systemSettingsService.getEffectiveEmailSettings();
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
      enabled,
    };
  }

  private async getTransporter() {
    const config = await this.getRuntimeConfig();
    if (!config.enabled) {
      if (this.transporterKey !== '__mock__') {
        this.logger.warn(
          'No SMTP configuration found in environment/system settings. Emails will be logged to console only.',
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
      config.fromName,
    ].join('|');

    if (this.transporter && this.transporterKey === key) {
      return { transporter: this.transporter, config };
    }

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    this.transporterKey = key;
    this.logger.log(`SMTP transporter configured for ${config.host}:${config.port}`);
    return { transporter: this.transporter, config };
  }

  private getFromAddress(config: MailRuntimeConfig) {
    return `"${config.fromName}" <${config.from}>`;
  }

  async sendNewSubmissionEmail(
    to: string[],
    formTitle: string,
    submissionId: string,
    answers: { formId?: string; [key: string]: unknown },
  ) {
    if (!to || to.length === 0) return;

    const subject = `New Submission: ${formTitle}`;
    const frontendUrl = getPrimaryFrontendUrl(this.configService.get<string>('FRONTEND_URL'));
    const link = `${frontendUrl}/forms/${answers.formId || ''}/responses`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">New Response Received</h2>
        <p>A new submission has been received for your form <strong>${formTitle}</strong>.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <h3 style="margin-top:0;">Submission Details</h3>
           <p><strong>ID:</strong> ${submissionId}</p>
           <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                View Submissions
            </a>
        </p>
      </div>
    `;

    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to: to.join(', '),
          subject,
          html: htmlContent,
        });
        this.logger.log(`Email sent: ${info.messageId}`);
      } catch (error) {
        this.logger.error('Failed to send email', error as Error);
      }
      return;
    }

    this.logger.log(`[MOCK EMAIL] To: ${to.join(', ')} | Subject: ${subject}`);
  }

  async sendFormVerificationEmail(params: { to: string; formTitle: string; verificationUrl: string }) {
    const { to, formTitle, verificationUrl } = params;
    const subject = `Verify your email for ${formTitle}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">Verify your email</h2>
        <p>You requested verification for the form <strong>${formTitle}</strong>.</p>
        <p>This link expires in 30 minutes.</p>
        <p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p style="word-break: break-all; color: #555;">${verificationUrl}</p>
      </div>
    `;

    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Verification email sent: ${info.messageId}`);
      } catch (error) {
        this.logger.error('Failed to send verification email', error as Error);
      }
      return;
    }

    this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Link: ${verificationUrl}`);
  }

  async sendCollaboratorInviteEmail(params: {
    to: string;
    formTitle: string;
    acceptUrl: string;
    invitedByName?: string;
    invitedByEmail?: string;
    expiresInDays?: number;
  }): Promise<{ sent: boolean; mode: 'smtp' | 'mock' | 'failed' }> {
    const { to, formTitle, acceptUrl, invitedByName, invitedByEmail, expiresInDays } = params;
    const subject = `You've been invited to collaborate on ${formTitle}`;
    const inviterLabel =
      invitedByName && invitedByName.trim().length > 0 ? invitedByName : invitedByEmail || 'a teammate';
    const displayExpiryDays = Number.isFinite(expiresInDays) && (expiresInDays || 0) > 0 ? expiresInDays : 3;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">You've been invited</h2>
        <p><strong>${inviterLabel}</strong> invited you to collaborate on <strong>${formTitle}</strong>.</p>
        <p>This invitation link expires in ${displayExpiryDays} days.</p>
        <p>
          <a href="${acceptUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
        </p>
        <p style="word-break: break-all; color: #555;">${acceptUrl}</p>
      </div>
    `;

    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`Collaborator invite email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error('Failed to send collaborator invite email', error as Error);
        return { sent: false, mode: 'failed' };
      }
    }

    this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Link: ${acceptUrl}`);
    return { sent: false, mode: 'mock' };
  }

  async sendTestEmail(params: {
    to: string;
  }): Promise<{ sent: boolean; mode: 'smtp' | 'mock' | 'failed'; reason?: string }> {
    const { to } = params;
    const subject = 'Form Builder SMTP test email';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #000;">SMTP test succeeded</h2>
        <p>This is a test email from Form Builder admin settings.</p>
        <p style="color: #666;">Sent at: ${new Date().toISOString()}</p>
      </div>
    `;

    const { transporter, config } = await this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: this.getFromAddress(config),
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`SMTP test email sent: ${info.messageId}`);
        return { sent: true, mode: 'smtp' };
      } catch (error) {
        this.logger.error('Failed to send SMTP test email', error as Error);
        const reason = error instanceof Error ? error.message : 'Unknown SMTP error';
        return { sent: false, mode: 'failed', reason };
      }
    }

    this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return { sent: false, mode: 'mock' };
  }
}
