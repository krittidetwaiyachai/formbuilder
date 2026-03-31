import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { FormsModule } from '../forms/forms.module';
import { RedisRateLimitService } from './redis-rate-limit.service';
import { ResponsePersistenceService } from './response-persistence.service';
import { TurnstileService } from './turnstile.service';
import { UnifiedPublicSubmissionController } from './unified-public-submission.controller';
import { UnifiedPublicSubmissionService } from './unified-public-submission.service';
import { PublicSubmissionSessionService } from './public-submission-session.service';
@Module({
  imports: [MailModule, FormsModule],
  controllers: [UnifiedPublicSubmissionController],
  providers: [
  TurnstileService,
  RedisRateLimitService,
  ResponsePersistenceService,
  PublicSubmissionSessionService,
  UnifiedPublicSubmissionService],
  exports: [
  TurnstileService,
  RedisRateLimitService,
  ResponsePersistenceService,
  PublicSubmissionSessionService,
  UnifiedPublicSubmissionService]
})export class
FormSecurityModule {}