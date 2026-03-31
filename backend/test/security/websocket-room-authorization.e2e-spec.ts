import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';
import { RoleType } from '@prisma/client';
import { FormGateway } from '../../src/forms/form.gateway';
import { PrismaService } from '../../src/prisma/prisma.service';
import { FormAccessService } from '../../src/common/guards/form-access.service';

describe('Form websocket room authorization (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let port: number;
  let ownerSocket: Socket | null = null;
  let outsiderSocket: Socket | null = null;

  const users = {
    owner: {
      id: 'owner-1',
      email: 'owner@example.com',
      sessionToken: 'owner-session',
      isActive: true,
      role: { name: RoleType.EDITOR }
    },
    outsider: {
      id: 'outsider-1',
      email: 'outsider@example.com',
      sessionToken: 'outsider-session',
      isActive: true,
      role: { name: RoleType.USER }
    }
  };

  const prismaService = {
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        return Object.values(users).find((user) => user.id === where.id) ?? null;
      })
    }
  };

  const formAccessService = {
    assertReadAccess: jest.fn(async (formId: string, userId: string) => {
      if (formId === 'form-1' && userId === users.owner.id) {
        return { id: formId };
      }

      throw new Error('You do not have access to this form');
    })
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      providers: [
        FormGateway,
        JwtService,
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        { provide: PrismaService, useValue: prismaService },
        { provide: FormAccessService, useValue: formAccessService }
      ]
    }).compile();

    jwtService = moduleRef.get(JwtService);
    app = moduleRef.createNestApplication();
    await app.listen(0);
    port = app.getHttpServer().address().port;
  });

  afterEach(() => {
    ownerSocket?.disconnect();
    outsiderSocket?.disconnect();
    ownerSocket = null;
    outsiderSocket = null;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows an authorized user to join a form room', async () => {
    const token = jwtService.sign({
      sub: users.owner.id,
      email: users.owner.email,
      sessionToken: users.owner.sessionToken
    });

    ownerSocket = io(`http://127.0.0.1:${port}/forms`, {
      transports: ['websocket'],
      auth: { token }
    });

    await new Promise<void>((resolve, reject) => {
      ownerSocket!.on('connect', () => {
        ownerSocket!.emit('join_form', 'form-1');
      });
      ownerSocket!.on('joined_room', (room: string) => {
        expect(room).toBe('form_form-1');
        resolve();
      });
      ownerSocket!.on('join_error', reject);
      ownerSocket!.on('connect_error', reject);
    });
  });

  it('rejects an unauthorized user from joining a form room', async () => {
    const token = jwtService.sign({
      sub: users.outsider.id,
      email: users.outsider.email,
      sessionToken: users.outsider.sessionToken
    });

    outsiderSocket = io(`http://127.0.0.1:${port}/forms`, {
      transports: ['websocket'],
      auth: { token }
    });

    await new Promise<void>((resolve, reject) => {
      const joinedHandler = () => reject(new Error('Unauthorized user joined the room'));

      outsiderSocket!.on('connect', () => {
        outsiderSocket!.emit('join_form', 'form-1');
      });
      outsiderSocket!.on('joined_room', joinedHandler);
      outsiderSocket!.on('join_error', (payload: { message: string }) => {
        expect(payload.message).toBe('Unable to join form');
        outsiderSocket!.off('joined_room', joinedHandler);
        resolve();
      });
      outsiderSocket!.on('connect_error', reject);
    });
  });
});
