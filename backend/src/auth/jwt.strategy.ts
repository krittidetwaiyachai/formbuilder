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
      secretOrKey: (() => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          if (configService.get<string>('NODE_ENV') === 'production') {
            throw new Error('JWT_SECRET environment variable is not defined!');
          }
          console.warn('WARNING: JWT_SECRET is not defined, using default insecure secret');
        }
        return secret || 'secret';
      })(),
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


