import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UnifiedPublicSubmissionController } from '../../src/form-security/unified-public-submission.controller';
import { UnifiedPublicSubmissionService } from '../../src/form-security/unified-public-submission.service';

describe('Unified public verification flow (e2e)', () => {
  let app: INestApplication;

  const unifiedPublicSubmissionService = {
    getPublicForm: jest.fn(),
    requestVerification: jest.fn(),
    verifyEmailToken: jest.fn(),
    getVerificationStatus: jest.fn(),
    submit: jest.fn(),
    getSubmissionState: jest.fn()
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UnifiedPublicSubmissionController],
      providers: [
        {
          provide: UnifiedPublicSubmissionService,
          useValue: unifiedPublicSubmissionService
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps verification and submission bound to the same session cookie', async () => {
    unifiedPublicSubmissionService.getPublicForm.mockResolvedValue({
      form: { id: 'form-1', title: 'Secure Form' },
      submissionState: { status: 'ELIGIBLE' },
      cookieToken: 'session-token',
      setCookie: true
    });
    unifiedPublicSubmissionService.requestVerification.mockResolvedValue({
      status: 'PENDING',
      verificationRequestId: 'vrq-1',
      message: 'If verification is required, instructions have been sent.',
      cookieToken: 'session-token',
      setCookie: false
    });
    unifiedPublicSubmissionService.verifyEmailToken.mockResolvedValue({
      status: 'VERIFIED'
    });
    unifiedPublicSubmissionService.getVerificationStatus.mockResolvedValue({
      status: 'VERIFIED_READY'
    });
    unifiedPublicSubmissionService.submit.mockResolvedValue({
      submission: {
        id: 'response-1',
        submittedAt: '2026-03-30T00:00:00.000Z'
      },
      cookieToken: 'session-token',
      setCookie: false
    });

    const loadResponse = await request(app.getHttpServer())
      .get('/api/public/forms/form-1')
      .expect(200);

    expect(loadResponse.body).toEqual({
      form: { id: 'form-1', title: 'Secure Form' },
      submissionState: { status: 'ELIGIBLE' }
    });

    const cookieHeader = loadResponse.headers['set-cookie'][0];
    const cookie = cookieHeader.split(';')[0];

    await request(app.getHttpServer())
      .post('/api/public/forms/form-1/verification-requests')
      .set('Cookie', cookie)
      .send({
        respondentEmail: 'user@example.com',
        answers: [{ fieldId: 'field-1', value: 'user@example.com' }]
      })
      .expect(201)
      .expect({
        status: 'PENDING',
        verificationRequestId: 'vrq-1',
        message: 'If verification is required, instructions have been sent.'
      });

    await request(app.getHttpServer())
      .get('/api/public/email-verifications/token-1')
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/public/forms/form-1/verification-requests/vrq-1')
      .set('Cookie', cookie)
      .expect(200)
      .expect({ status: 'VERIFIED_READY' });

    await request(app.getHttpServer())
      .post('/api/public/forms/form-1/submissions')
      .set('Cookie', cookie)
      .send({
        respondentEmail: 'user@example.com',
        answers: [{ fieldId: 'field-1', value: 'user@example.com' }]
      })
      .expect(201)
      .expect({
        submission: {
          id: 'response-1',
          submittedAt: '2026-03-30T00:00:00.000Z'
        }
      });

    expect(unifiedPublicSubmissionService.getPublicForm).toHaveBeenCalledWith(
      'form-1',
      null,
      expect.any(String),
      undefined
    );
    expect(unifiedPublicSubmissionService.requestVerification).toHaveBeenCalledWith(
      'form-1',
      'session-token',
      {
        respondentEmail: 'user@example.com',
        answers: [{ fieldId: 'field-1', value: 'user@example.com' }]
      },
      expect.any(String),
      undefined
    );
    expect(unifiedPublicSubmissionService.getVerificationStatus).toHaveBeenCalledWith(
      'form-1',
      'vrq-1',
      'session-token'
    );
    expect(unifiedPublicSubmissionService.submit).toHaveBeenCalledWith(
      'form-1',
      'session-token',
      {
        respondentEmail: 'user@example.com',
        answers: [{ fieldId: 'field-1', value: 'user@example.com' }]
      },
      expect.any(String),
      undefined
    );
  });
});
