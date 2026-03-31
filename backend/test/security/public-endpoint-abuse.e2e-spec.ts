jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as request from 'supertest';
import { ResponsesController } from '../../src/responses/responses.controller';
import { ResponsesService } from '../../src/responses/responses.service';
import { ResponsesStatsService } from '../../src/responses/responses-stats.service';

describe('Deprecated public endpoints are disabled (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ResponsesController],
      providers: [
        {
          provide: ResponsesService,
          useValue: {}
        },
        {
          provide: ResponsesStatsService,
          useValue: {}
        },
        EventEmitter2
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('disables the legacy public submission status endpoint', async () => {
    await request(app.getHttpServer())
      .get('/api/responses/check/form-1')
      .expect(404);
  });

  it('disables the legacy public submission create endpoint', async () => {
    await request(app.getHttpServer())
      .post('/api/responses')
      .send({
        formId: 'form-1',
        answers: [{ fieldId: 'field-1', value: 'value-1' }]
      })
      .expect(404);
  });
});
