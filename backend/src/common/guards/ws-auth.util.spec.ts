import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RoleType } from '@prisma/client';
import { authenticateSocket } from './ws-auth.util';
describe('authenticateSocket', () => {
  const secret = 'test-secret';
  let jwtService: JwtService;
  let configService: Pick<ConfigService, 'get'>;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
    };
  };
  beforeEach(() => {
    jwtService = new JwtService({ secret });
    configService = {
      get: jest.fn((key: string) => key === 'JWT_SECRET' ? secret : undefined)
    };
    prismaService = {
      user: {
        findUnique: jest.fn()
      }
    };
  });
  it('returns null when the socket does not provide a token', async () => {
    const client = {
      handshake: {
        auth: {},
        headers: {},
        query: {}
      }
    } as any;
    await expect(
      authenticateSocket(client, jwtService, configService as ConfigService, prismaService as any)
    ).resolves.toBeNull();
  });
  it('returns the authenticated user for a valid active session', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'owner@example.com',
      sessionToken: 'session-1'
    });
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@example.com',
      isActive: true,
      sessionToken: 'session-1',
      role: { name: RoleType.EDITOR }
    });
    const client = {
      handshake: {
        auth: { token },
        headers: {},
        query: {}
      }
    } as any;
    await expect(
      authenticateSocket(client, jwtService, configService as ConfigService, prismaService as any)
    ).resolves.toEqual({
      userId: 'user-1',
      email: 'owner@example.com',
      role: RoleType.EDITOR
    });
  });
  it('returns null for a stale session token', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'owner@example.com',
      sessionToken: 'stale-session'
    });
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@example.com',
      isActive: true,
      sessionToken: 'fresh-session',
      role: { name: RoleType.EDITOR }
    });
    const client = {
      handshake: {
        auth: { token },
        headers: {},
        query: {}
      }
    } as any;
    await expect(
      authenticateSocket(client, jwtService, configService as ConfigService, prismaService as any)
    ).resolves.toBeNull();
  });
  it('returns null for a disabled account', async () => {
    const token = jwtService.sign({
      sub: 'user-1',
      email: 'owner@example.com',
      sessionToken: 'session-1'
    });
    prismaService.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'owner@example.com',
      isActive: false,
      sessionToken: 'session-1',
      role: { name: RoleType.EDITOR }
    });
    const client = {
      handshake: {
        auth: { token },
        headers: {},
        query: {}
      }
    } as any;
    await expect(
      authenticateSocket(client, jwtService, configService as ConfigService, prismaService as any)
    ).resolves.toBeNull();
  });
});