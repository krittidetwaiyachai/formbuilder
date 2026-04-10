import {
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { ResponsesService } from './responses.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'job-fixed-id'),
}));

describe('ResponsesService export distributed controls', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  const buildService = (options?: {
    redisClient?: {
      get: jest.Mock;
      set: jest.Mock;
      del: jest.Mock;
    } | null;
    configOverrides?: Record<string, string | undefined>;
  }) => {
    const prisma = {
      form: {
        findUnique: jest.fn(),
      },
      formResponse: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      responseAnswer: {
        deleteMany: jest.fn(),
      },
    };

    const formAccessService = {
      assertReadAccess: jest.fn().mockResolvedValue(undefined),
    };

    const responsePersistenceService = {};
    const eventEmitter = { emit: jest.fn() };
    const redisService = {
      getClient: jest.fn().mockReturnValue(options?.redisClient ?? null),
    };

    const configMap: Record<string, string | undefined> = {
      EXPORT_DISTRIBUTED_ONLY: undefined,
      EXPORT_LOCK_TTL_SECONDS: '1800',
      EXPORT_RESULT_TTL_SECONDS: '900',
      EXPORT_IDEMPOTENCY_TTL_SECONDS: '86400',
      ...options?.configOverrides,
    };
    const configService = {
      get: jest.fn((key: string) => configMap[key]),
    };

    const service = new ResponsesService(
      prisma as any,
      { decrypt: jest.fn((value: string) => value) } as any,
      formAccessService as any,
      responsePersistenceService as any,
      eventEmitter as any,
      redisService as any,
      configService as any,
    );

    jest
      .spyOn(service as any, 'processExportJobInBackground')
      .mockResolvedValue(undefined);

    return {
      service,
      prisma,
      formAccessService,
      redisService,
      configService,
      eventEmitter,
    };
  };

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it('fails safe in production when distributed export is required but Redis is unavailable', async () => {
    process.env.NODE_ENV = 'production';
    const { service, prisma } = buildService({
      redisClient: null,
    });

    prisma.form.findUnique.mockResolvedValue({
      id: 'form-1',
      title: 'Security Form',
      isQuiz: false,
      settings: {},
      fields: [],
    });
    prisma.formResponse.count.mockResolvedValue(5);

    await expect(
      service.startExportJob('form-1', 'user-1', RoleType.ADMIN),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('replays existing export job when idempotency key was already used', async () => {
    process.env.NODE_ENV = 'test';
    const redisClient = {
      get: jest
        .fn()
        .mockResolvedValueOnce('job-1')
        .mockResolvedValueOnce(
          JSON.stringify({
            id: 'job-1',
            formId: 'form-1',
            ownerId: 'user-1',
            status: 'completed',
            loaded: 10,
            total: 10,
            fileUrl: '/responses/export/download/job-1',
            filename: 'export.csv',
          }),
        ),
      set: jest.fn(),
      del: jest.fn(),
    };
    const { service, prisma } = buildService({ redisClient });

    const result = await service.startExportJob(
      'form-1',
      'user-1',
      RoleType.ADMIN,
      'idem-export-1',
    );

    expect(result.id).toBe('job-1');
    expect(prisma.form.findUnique).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('rejects concurrent export start when distributed lock is already held', async () => {
    process.env.NODE_ENV = 'test';
    const redisClient = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(null),
      del: jest.fn(),
    };
    const { service, prisma } = buildService({ redisClient });

    prisma.form.findUnique.mockResolvedValue({
      id: 'form-1',
      title: 'Security Form',
      isQuiz: false,
      settings: {},
      fields: [],
    });
    prisma.formResponse.count.mockResolvedValue(5);

    await expect(
      service.startExportJob('form-1', 'user-1', RoleType.ADMIN),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('writes distributed job + idempotency record when starting a new export', async () => {
    process.env.NODE_ENV = 'test';
    const redisClient = {
      get: jest.fn().mockResolvedValueOnce(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn(),
    };
    const { service, prisma } = buildService({ redisClient });

    prisma.form.findUnique.mockResolvedValue({
      id: 'form-1',
      title: 'Security Form',
      isQuiz: false,
      settings: {},
      fields: [],
    });
    prisma.formResponse.count.mockResolvedValue(12);

    const result = await service.startExportJob(
      'form-1',
      'user-1',
      RoleType.ADMIN,
      'idem-export-2',
    );

    expect(result.status).toBe('processing');
    expect(redisClient.set).toHaveBeenCalledWith(
      expect.stringContaining('responses:export:lock:user-1:form-1'),
      expect.any(String),
      'EX',
      1800,
      'NX',
    );
    expect(redisClient.set).toHaveBeenCalledWith(
      expect.stringContaining('responses:export:job:'),
      expect.any(String),
      'EX',
      900,
    );
    expect(redisClient.set).toHaveBeenCalledWith(
      expect.stringContaining('responses:export:idempotency:user-1:form-1:idem-export-2'),
      expect.any(String),
      'EX',
      86400,
    );
  });
});
