jest.mock('uuid', () => ({
  v4: () => 'job-fixed-id',
}));

jest.mock('../../src/auth/jwt-auth.guard', () => ({
  JwtAuthGuard: class {
    canActivate(context: { switchToHttp: () => { getRequest: () => any } }) {
      const req = context.switchToHttp().getRequest();
      req.user = {
        id: (req.headers['x-user-id'] as string) || 'user-1',
        email: 'tester@example.com',
        role: ((req.headers['x-user-role'] as string) || 'EDITOR') as RoleType,
      };
      return true;
    }
  }
}));

jest.mock('../../src/auth/roles.guard', () => ({
  RolesGuard: class {
    canActivate() {
      return true;
    }
  }
}));

jest.mock('../../src/auth/permissions.guard', () => ({
  PermissionsGuard: class {
    canActivate() {
      return true;
    }
  }
}));

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { RoleType } from '@prisma/client';
import { ResponsesController } from '../../src/responses/responses.controller';
import { ResponsesService } from '../../src/responses/responses.service';
import { ResponsesStatsService } from '../../src/responses/responses-stats.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { FormAccessService } from '../../src/common/guards/form-access.service';
import { ResponsePersistenceService } from '../../src/form-security/response-persistence.service';
import { RedisService } from '../../src/common/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncryptionService } from '../../src/common/encryption.service';

type RedisValue = { value: string; expiresAt: number | null };

function createFakeRedisClient() {
  const store = new Map<string, RedisValue>();

  const cleanupIfExpired = (key: string) => {
    const entry = store.get(key);
    if (!entry) {
      return;
    }
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      store.delete(key);
    }
  };

  return {
    get: jest.fn(async (key: string) => {
      cleanupIfExpired(key);
      return store.get(key)?.value ?? null;
    }),
    set: jest.fn(
      async (
        key: string,
        value: string,
        exLiteral?: string,
        ttlSeconds?: number,
        nxLiteral?: string,
      ) => {
        cleanupIfExpired(key);
        const expiresAt =
          exLiteral === 'EX' && typeof ttlSeconds === 'number'
            ? Date.now() + ttlSeconds * 1000
            : null;
        if (nxLiteral === 'NX') {
          if (store.has(key)) {
            return null;
          }
          store.set(key, { value, expiresAt });
          return 'OK';
        }
        store.set(key, { value, expiresAt });
        return 'OK';
      },
    ),
    del: jest.fn(async (key: string) => {
      store.delete(key);
      return 1;
    }),
  };
}

describe('Responses export distributed flow (e2e)', () => {
  let app: INestApplication;
  let responsesService: ResponsesService;
  let fakeRedis: ReturnType<typeof createFakeRedisClient>;

  beforeEach(async () => {
    fakeRedis = createFakeRedisClient();

    const moduleRef = await Test.createTestingModule({
      controllers: [ResponsesController],
      providers: [
        ResponsesService,
        {
          provide: ResponsesStatsService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            form: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'form-1',
                title: 'Distributed Export Form',
                isQuiz: false,
                settings: {},
                fields: [],
              }),
            },
            formResponse: {
              count: jest.fn().mockResolvedValue(10),
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
            responseAnswer: {
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: FormAccessService,
          useValue: {
            assertReadAccess: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ResponsePersistenceService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn(() => fakeRedis),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string | undefined> = {
                EXPORT_DISTRIBUTED_ONLY: 'true',
                EXPORT_LOCK_TTL_SECONDS: '1800',
                EXPORT_RESULT_TTL_SECONDS: '900',
                EXPORT_IDEMPOTENCY_TTL_SECONDS: '86400',
              };
              return map[key];
            }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: EncryptionService,
          useValue: { decrypt: jest.fn((value: string) => value) },
        },
      ],
    }).compile();

    responsesService = moduleRef.get(ResponsesService);
    jest
      .spyOn(responsesService as any, 'processExportJobInBackground')
      .mockResolvedValue(undefined);

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it('replays same export job for identical idempotency key', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/responses/form/form-1/export/start')
      .set('x-user-id', 'user-1')
      .set('x-user-role', 'EDITOR')
      .set('idempotency-key', 'idem-export-1')
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/api/responses/form/form-1/export/start')
      .set('x-user-id', 'user-1')
      .set('x-user-role', 'EDITOR')
      .set('idempotency-key', 'idem-export-1')
      .expect(201);

    expect(first.body.id).toBe('job-fixed-id');
    expect(second.body.id).toBe('job-fixed-id');
    expect(second.body.ownerId).toBe('user-1');
  });

  it('returns conflict for concurrent export start without idempotency replay', async () => {
    await request(app.getHttpServer())
      .post('/api/responses/form/form-1/export/start')
      .set('x-user-id', 'user-1')
      .set('x-user-role', 'EDITOR')
      .set('idempotency-key', 'idem-export-2')
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/responses/form/form-1/export/start')
      .set('x-user-id', 'user-1')
      .set('x-user-role', 'EDITOR')
      .set('idempotency-key', 'idem-export-3')
      .expect(409);
  });

  it('denies download access to a non-owner user', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/responses/form/form-1/export/start')
      .set('x-user-id', 'owner-1')
      .set('x-user-role', 'EDITOR')
      .set('idempotency-key', 'idem-export-4')
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/responses/export/download/${created.body.id}`)
      .set('x-user-id', 'outsider-1')
      .set('x-user-role', 'EDITOR')
      .expect(403);
  });
});
