import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  private googleClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      const { OAuth2Client } = require('google-auth-library');
      this.googleClient = new OAuth2Client(clientId);
    }
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

    const { email, sub: googleId, given_name: firstName, family_name: lastName, picture: photoUrl } = payload;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, photoUrl, provider: 'google' },
          include: { role: true },
        });
      }
    } else {
      // Create new user
      const defaultRole = await this.prisma.role.findUnique({
        where: { name: 'EDITOR' },
      });

      if (!defaultRole) {
        throw new Error('Default role not found');
      }

      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          googleId,
          photoUrl,
          provider: 'google',
          roleId: defaultRole.id,
        },
        include: { role: true },
      });
    }

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(jwtPayload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        role: user.role.name,
      },
    };
  }



  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };
  }
}

