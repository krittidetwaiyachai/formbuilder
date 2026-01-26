
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private async createTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    
    if (host && user) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT') || 587,
            secure: false, 
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
        this.logger.log(`📧 SMTP Transporter configured for ${host}`);
    } else {
        this.logger.warn('⚠️ No SMTP configuration found. Emails will be logged to console only.');
    }
  }

  async sendNewSubmissionEmail(to: string[], formTitle: string, submissionId: string, answers: any) {
    if (!to || to.length === 0) return;

    const subject = `New Submission: ${formTitle}`;
    
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    
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

    if (this.transporter) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Form Builder" <noreply@formbuilder.com>', 
                to: to.join(', '), 
                subject: subject, 
                html: htmlContent, 
            });
            this.logger.log(`✅ Email sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error('❌ Failed to send email', error);
        }
    } else {
        this.logger.log(`[MOCK EMAIL] To: ${to.join(', ')} | Subject: ${subject}`);
    }
  }
}
