import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { DEFAULT_USER_ROLE } from './auth.constants';
import { DEFAULT_ROLE_PERMISSIONS } from './permissions.constants';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from '../events/events.gateway';

interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  sessionToken: string;
  type?: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  private googleClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventsGateway: EventsGateway,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      const { OAuth2Client } = require('google-auth-library');
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private parseExpiresInToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] || 86400000);
  }

  private signAccessToken(payload: AuthTokenPayload) {
    return this.jwtService.sign({
      ...payload,
      type: 'access',
    });
  }

  private signRefreshToken(payload: AuthTokenPayload) {
    const refreshExpiresIn =
      (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`;
    return this.jwtService.sign(
      {
        ...payload,
        type: 'refresh',
      },
      { expiresIn: refreshExpiresIn },
    );
  }

  private buildAuthUser(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    photoUrl: string | null;
    role: { name: string; permissions?: unknown };
    permissionOverrides: unknown;
  }) {
    const rolePermissions = this.resolveRolePermissions(user.role.name, user.role.permissions);
    const effectivePermissions = this.resolveEffectivePermissions(
      user.role.name,
      rolePermissions,
      user.permissionOverrides,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      role: user.role.name,
      permissions: effectivePermissions,
    };
  }

  private normalizePermissionArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((permission): permission is string => typeof permission === 'string' && permission.length > 0);
  }

  private resolveRolePermissions(roleName: string, rolePermissionsFromDb: unknown): string[] {
    const fromDb = this.normalizePermissionArray(rolePermissionsFromDb);
    if (fromDb.length > 0) {
      return fromDb;
    }
    return DEFAULT_ROLE_PERMISSIONS[roleName] || [];
  }

  private resolveEffectivePermissions(
    roleName: string,
    resolvedRolePermissions: string[],
    permissionOverrides: unknown,
  ): string[] {
    const overrides = this.normalizePermissionArray(permissionOverrides);
    if (overrides.length > 0) {
      return overrides;
    }
    if (resolvedRolePermissions.length > 0) {
      return resolvedRolePermissions;
    }
    return DEFAULT_ROLE_PERMISSIONS[roleName] || [];
  }

  private buildAuthTokens(payload: AuthTokenPayload) {
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    const refreshMaxAgeMs = this.parseExpiresInToMs(refreshExpiresIn);

    return {
      access_token: this.signAccessToken(payload),
      refresh_token: this.signRefreshToken(payload),
      refresh_token_max_age_ms: refreshMaxAgeMs,
    };
  }

  async loginWithGoogle(token: string) {
    if (!this.googleClient) {
      throw new Error('Google Client ID not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const {
      email,
      sub: googleId,
      email_verified: emailVerified,
      given_name: firstName,
      family_name: lastName,
      picture: photoUrl,
    } = payload;
    if (!email || emailVerified !== true) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (user) {
      this.eventsGateway.server?.to(`user_${user.id}`).emit('force_logout');
      const sessionToken = this.generateSessionToken();
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          photoUrl,
          provider: 'google',
          sessionToken,
          lastActiveAt: new Date(),
        },
        include: { role: true },
      });
    } else {
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: DEFAULT_USER_ROLE },
      });
      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      const sessionToken = this.generateSessionToken();
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          googleId,
          photoUrl,
          provider: 'google',
          roleId: defaultRole.id,
          sessionToken,
          lastActiveAt: new Date(),
        },
        include: { role: true },
      });
    }

    const jwtPayload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      sessionToken: user.sessionToken || '',
    };

    return {
      ...this.buildAuthTokens(jwtPayload),
      user: this.buildAuthUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException({ message: 'Account is disabled', code: 'ACCOUNT_DISABLED' });
    }

    this.eventsGateway.server?.to(`user_${user.id}`).emit('force_logout');
    const sessionToken = this.generateSessionToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { sessionToken, lastActiveAt: new Date() },
    });

    const jwtPayload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      sessionToken,
    };

    return {
      ...this.buildAuthTokens(jwtPayload),
      user: this.buildAuthUser(user),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: AuthTokenPayload;
    try {
      payload = this.jwtService.verify<AuthTokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException({ message: 'Invalid refresh token', code: 'REFRESH_TOKEN_INVALID' });
    }

    if (!payload?.sub || !payload?.sessionToken || payload.type !== 'refresh') {
      throw new UnauthorizedException({ message: 'Invalid refresh token', code: 'REFRESH_TOKEN_INVALID' });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ message: 'Account is disabled', code: 'ACCOUNT_DISABLED' });
    }
    if (user.sessionToken !== payload.sessionToken) {
      throw new UnauthorizedException({ message: 'Session expired', code: 'SESSION_EXPIRED' });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const nextPayload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      sessionToken: user.sessionToken || '',
    };

    return this.buildAuthTokens(nextPayload);
  }

  async revokeCurrentSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { sessionToken: null },
    });
    this.eventsGateway.server?.to(`user_${userId}`).emit('force_logout');
    return { revoked: true };
  }

  async revokeAllUserSessions(userId: string) {
    const result = await this.revokeCurrentSession(userId);
    return { revokedSessions: result.revoked ? 1 : 0 };
  }

  async validateSession(userId: string, sessionToken: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { sessionToken: true },
    });
    return user?.sessionToken === sessionToken;
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!user) {
      return null;
    }
    const rolePermissions = this.resolveRolePermissions(user.role.name, user.role.permissions);
    const permissionOverrides = this.normalizePermissionArray(user.permissionOverrides);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      isActive: user.isActive,
      rolePermissions,
      permissionOverrides: permissionOverrides.length > 0 ? permissionOverrides : null,
    };
  }
}
