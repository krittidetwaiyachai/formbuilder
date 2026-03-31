import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UnifiedPublicSubmissionService } from './unified-public-submission.service';
describe('UnifiedPublicSubmissionService', () => {
  let service: UnifiedPublicSubmissionService;
  let prisma: {
    publicSubmissionSession: {findUnique: jest.Mock;};
    submissionVerificationRequest: {findFirst: jest.Mock;};
    $transaction: jest.Mock;
  };
  let publicSessionService: {resolveSession: jest.Mock;ensureSession: jest.Mock;};
  let responsePersistenceService: {
    loadPublishedForm: jest.Mock;
    assertQuizWindow: jest.Mock;
    createInTransaction: jest.Mock;
  };
  let rateLimitService: {
    requireSharedStore: jest.Mock;
    consume: jest.Mock;
  };
  let encryptionService: {hashIpAddress: jest.Mock;};
  beforeEach(() => {
    prisma = {
      publicSubmissionSession: {
        findUnique: jest.fn()
      },
      submissionVerificationRequest: {
        findFirst: jest.fn()
      },
      $transaction: jest.fn()
    };
    publicSessionService = {
      resolveSession: jest.fn(),
      ensureSession: jest.fn()
    };
    responsePersistenceService = {
      loadPublishedForm: jest.fn(),
      assertQuizWindow: jest.fn(),
      createInTransaction: jest.fn()
    };
    rateLimitService = {
      requireSharedStore: jest.fn(),
      consume: jest.fn().mockResolvedValue(undefined)
    };
    encryptionService = {
      hashIpAddress: jest.fn().mockReturnValue('ip-hash')
    };
    service = new UnifiedPublicSubmissionService(
      prisma as any,
      { findPublic: jest.fn() } as any,
      { get: jest.fn() } as any,
      {} as any,
      encryptionService as any,
      responsePersistenceService as any,
      rateLimitService as any,
      { verifyToken: jest.fn().mockResolvedValue(undefined) } as any,
      publicSessionService as any
    );
  });
  it('returns VERIFIED_READY only for the same verified session-bound request', async () => {
    publicSessionService.resolveSession.mockResolvedValue({ id: 'session-1' });
    prisma.submissionVerificationRequest.findFirst.mockResolvedValue({
      id: 'vr-1',
      invalidatedAt: null,
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      verifiedAt: new Date()
    });
    await expect(
      service.getVerificationStatus('form-1', 'vr-1', 'cookie-token')
    ).resolves.toEqual({ status: 'VERIFIED_READY' });
  });
  it('fails closed with a generic conflict when identity locks race at commit time', async () => {
    publicSessionService.ensureSession.mockResolvedValue({
      session: { id: 'session-1' },
      cookieToken: 'cookie-token',
      isNew: false
    });
    responsePersistenceService.loadPublishedForm.mockResolvedValue({
      id: 'form-1',
      isQuiz: false,
      settings: {},
      fields: []
    });
    responsePersistenceService.createInTransaction.mockResolvedValue({
      id: 'response-1'
    });
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test'
      }
    );
    prisma.$transaction.mockImplementation(async (callback: any) =>
    callback({
      submissionVerificationRequest: {
        findFirst: jest.fn(),
        updateMany: jest.fn()
      },
      submissionIdentityLock: {
        create: jest.fn().mockRejectedValue(uniqueConstraintError)
      },
      publicSubmissionSession: {
        update: jest.fn()
      }
    })
    );
    await expect(
      service.submit(
        'form-1',
        'cookie-token',
        {
          answers: [{ fieldId: 'field-1', value: 'value-1' }]
        },
        '127.0.0.1',
        'jest-agent'
      )
    ).rejects.toMatchObject({
      response: {
        code: 'SUBMISSION_NOT_ALLOWED'
      }
    });
  });
  it('fails closed when a verified request is consumed by a competing transaction', async () => {
    publicSessionService.ensureSession.mockResolvedValue({
      session: { id: 'session-1' },
      cookieToken: 'cookie-token',
      isNew: false
    });
    responsePersistenceService.loadPublishedForm.mockResolvedValue({
      id: 'form-1',
      isQuiz: false,
      settings: {
        security: {
          requireEmailVerification: true,
          canonicalEmailSource: {
            mode: 'top_level'
          }
        }
      },
      fields: []
    });
    responsePersistenceService.createInTransaction.mockResolvedValue({
      id: 'response-1'
    });
    prisma.$transaction.mockImplementation(async (callback: any) =>
    callback({
      submissionVerificationRequest: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'vr-1',
          verifiedAt: new Date(),
          consumedAt: null,
          invalidatedAt: null,
          expiresAt: new Date(Date.now() + 60_000)
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 })
      },
      submissionIdentityLock: {
        create: jest.fn().mockResolvedValue({})
      },
      publicSubmissionSession: {
        update: jest.fn().mockResolvedValue({})
      }
    })
    );
    await expect(
      service.submit(
        'form-1',
        'cookie-token',
        {
          respondentEmail: 'user@example.com',
          answers: [{ fieldId: 'field-1', value: 'value-1' }]
        },
        '127.0.0.1',
        'jest-agent'
      )
    ).rejects.toBeInstanceOf(ConflictException);
  });
});