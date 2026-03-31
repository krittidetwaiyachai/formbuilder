import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@prisma/client';
export interface WsAuthenticatedUser {
  userId: string;
  email: string;
  role: RoleType;
}
export async function authenticateSocket(
client: Socket,
jwtService: JwtService,
configService: ConfigService,
prismaService: PrismaService)
: Promise<WsAuthenticatedUser | null> {
  const token =
  client.handshake.auth?.token ||
  client.handshake.headers.authorization?.replace('Bearer ', '') ||
  client.handshake.query.token as string;
  if (!token) return null;
  try {
    const payload = jwtService.verify(token, {
      secret: configService.get<string>('JWT_SECRET') || 'secret'
    });
    if (!payload?.sub || !payload?.sessionToken) {
      return null;
    }
    const user = await prismaService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        isActive: true,
        sessionToken: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
    if (!user || user.isActive === false || user.sessionToken !== payload.sessionToken) {
      return null;
    }
    return {
      userId: user.id,
      email: user.email,
      role: user.role.name
    };
  } catch {
    return null;
  }
}