import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { FormSecurityController } from './form-security.controller';
import { FormSecurityService } from './form-security.service';
import { PublicSubmissionOrchestratorService } from './public-submission-orchestrator.service';
import { RedisRateLimitService } from './redis-rate-limit.service';
import { ResponsePersistenceService } from './response-persistence.service';
import { TurnstileService } from './turnstile.service';

@Module({
  imports: [MailModule],
  controllers: [FormSecurityController],
  providers: [
    TurnstileService,
    RedisRateLimitService,
    ResponsePersistenceService,
    FormSecurityService,
    PublicSubmissionOrchestratorService
  ],
  exports: [
    TurnstileService,
    RedisRateLimitService,
    ResponsePersistenceService,
    FormSecurityService,
    PublicSubmissionOrchestratorService
  ]
})
export class FormSecurityModule {}
