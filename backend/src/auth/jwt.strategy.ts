import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: { sub: string; sessionToken?: string }) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isActive === false) {
      throw new UnauthorizedException({ message: 'Account is disabled', code: 'ACCOUNT_DISABLED' });
    }

    if (payload.sessionToken) {
      const isValidSession = await this.authService.validateSession(payload.sub, payload.sessionToken);
      if (!isValidSession) {
        throw new UnauthorizedException({ message: 'Session expired', code: 'SESSION_EXPIRED' });
      }
    }

    return user;
  }
}


