import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException } from
'@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
const TURNSTILE_VERIFY_URL =
'https://challenges.cloudflare.com/turnstile/v0/siteverify';
@Injectable()export class
TurnstileService {
  constructor(private readonly configService: ConfigService) {}
  async verifyToken(captchaToken: string, remoteIp?: string): Promise<boolean> {
    const secret = this.configService.get<string>('CLOUDFLARE_TURNSTILE_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException({
        code: 'CAPTCHA_MISCONFIGURED',
        message: 'Captcha verification is not configured.'
      });
    }
    if (!captchaToken?.trim()) {
      throw new BadRequestException({
        code: 'CAPTCHA_REQUIRED',
        message: 'Captcha token is required.'
      });
    }
    const payload = new URLSearchParams({
      secret,
      response: captchaToken
    });
    if (remoteIp) {
      payload.append('remoteip', remoteIp);
    }
    try {
      const { data } = await axios.post<{
        success: boolean;
        'error-codes'?: string[];
      }>(TURNSTILE_VERIFY_URL, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      });
      return data.success === true;
    } catch {
      throw new ServiceUnavailableException({
        code: 'CAPTCHA_UNAVAILABLE',
        message: 'Captcha verification is temporarily unavailable.'
      });
    }
  }
}