import { BadRequestException, Body, Controller, Ip, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { extractCookieValue } from '../form-security/public-submission-session.util';
import { TurnstileService } from '../form-security/turnstile.service';

interface RequestWithUser extends Request {
  user?: { id?: string };
}

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly turnstileService: TurnstileService,
  ) {}

  private isAuthTurnstileRequired() {
    return this.configService.get<string>('AUTH_TURNSTILE_REQUIRED') === 'true';
  }

  private async verifyAuthCaptcha(captchaToken: string | undefined, ipAddress?: string) {
    if (!this.isAuthTurnstileRequired()) {
      return;
    }

    const isVerified = await this.turnstileService.verifyToken(captchaToken || '', ipAddress);
    if (!isVerified) {
      throw new BadRequestException({
        code: 'CAPTCHA_INVALID',
        message: 'Captcha verification failed.',
      });
    }
  }

  private isRefreshCookieEnabled() {
    return this.configService.get<string>('AUTH_REFRESH_COOKIE_ENABLED') !== 'false';
  }

  private isRefreshCookieOnlyMode() {
    return this.isRefreshCookieEnabled() && this.configService.get<string>('AUTH_REFRESH_COOKIE_ONLY') !== 'false';
  }

  private getRefreshCookieName() {
    return this.configService.get<string>('AUTH_REFRESH_COOKIE_NAME') || 'fb_refresh_token';
  }

  private getRefreshCookiePath() {
    return this.configService.get<string>('AUTH_REFRESH_COOKIE_PATH') || '/api/auth';
  }

  private getRefreshCookieDomain() {
    const value = this.configService.get<string>('AUTH_REFRESH_COOKIE_DOMAIN');
    return value && value.trim().length > 0 ? value.trim() : undefined;
  }

  private getRefreshCookieSameSite(): 'lax' | 'strict' | 'none' {
    const raw = (this.configService.get<string>('AUTH_REFRESH_COOKIE_SAMESITE') || 'lax').toLowerCase();
    if (raw === 'strict' || raw === 'none' || raw === 'lax') {
      return raw;
    }
    return 'lax';
  }

  private getRefreshCookieSecure() {
    const configured = this.configService.get<string>('AUTH_REFRESH_COOKIE_SECURE');
    if (configured === 'true') {
      return true;
    }
    if (configured === 'false') {
      return false;
    }
    return process.env.NODE_ENV === 'production';
  }

  private readRefreshTokenCookie(req: Request) {
    return extractCookieValue(req.headers.cookie, this.getRefreshCookieName());
  }

  private writeRefreshTokenCookie(res: Response, refreshToken: string, maxAgeMs: number | undefined) {
    if (!this.isRefreshCookieEnabled()) {
      return;
    }

    const secure = this.getRefreshCookieSecure();
    let sameSite = this.getRefreshCookieSameSite();
    if (sameSite === 'none' && !secure) {
      sameSite = 'lax';
    }

    res.cookie(this.getRefreshCookieName(), refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: maxAgeMs && maxAgeMs > 0 ? maxAgeMs : 7 * 24 * 60 * 60 * 1000,
      path: this.getRefreshCookiePath(),
      domain: this.getRefreshCookieDomain(),
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    if (!this.isRefreshCookieEnabled()) {
      return;
    }

    const secure = this.getRefreshCookieSecure();
    let sameSite = this.getRefreshCookieSameSite();
    if (sameSite === 'none' && !secure) {
      sameSite = 'lax';
    }

    res.clearCookie(this.getRefreshCookieName(), {
      httpOnly: true,
      secure,
      sameSite,
      path: this.getRefreshCookiePath(),
      domain: this.getRefreshCookieDomain(),
    });
  }

  private finalizeAuthResponse(
    res: Response,
    payload: { refresh_token?: string; refresh_token_max_age_ms?: number; [key: string]: unknown },
  ) {
    if (payload.refresh_token) {
      this.writeRefreshTokenCookie(res, payload.refresh_token, payload.refresh_token_max_age_ms);
      if (this.isRefreshCookieOnlyMode()) {
        const { refresh_token: _removed, ...safePayload } = payload;
        return safePayload;
      }
    }
    return payload;
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.verifyAuthCaptcha(loginDto.captchaToken, ipAddress);
    const result = await this.authService.login(loginDto);
    return this.finalizeAuthResponse(res, result);
  }

  @Public()
  @Post('google/login')
  async googleLogin(
    @Body() body: GoogleLoginDto,
    @Ip() ipAddress: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.verifyAuthCaptcha(body.captchaToken, ipAddress);
    const result = await this.authService.loginWithGoogle(body.token);
    return this.finalizeAuthResponse(res, result);
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = body.refresh_token || this.readRefreshTokenCookie(req) || '';
    const result = await this.authService.refreshAccessToken(refreshToken);
    return this.finalizeAuthResponse(res, result);
  }

  @Post('logout')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const result = await this.authService.revokeCurrentSession(userId);
    this.clearRefreshTokenCookie(res);
    return result;
  }

  @Post('logout-all')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async logoutAll(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }
    const result = await this.authService.revokeAllUserSessions(userId);
    this.clearRefreshTokenCookie(res);
    return result;
  }
}
