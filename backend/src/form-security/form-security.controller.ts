import {
  Body,
  Controller,
  Ip,
  Param,
  Post
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { SubmitPublicResponseDto } from './dto/submit-public-response.dto';
import { VerifiedSubmissionStatusDto } from './dto/verified-submission-status.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { FormSecurityService } from './form-security.service';
import { PublicSubmissionOrchestratorService } from './public-submission-orchestrator.service';

@Controller('forms/:formId')
@Public()
export class FormSecurityController {
  constructor(
    private readonly formSecurityService: FormSecurityService,
    private readonly publicSubmissionOrchestrator: PublicSubmissionOrchestratorService
  ) {}

  @Post('request-email-verification')
  requestEmailVerification(
    @Param('formId') formId: string,
    @Body() body: RequestEmailVerificationDto,
    @Ip() ipAddress: string
  ) {
    return this.formSecurityService.requestEmailVerification(formId, body, ipAddress);
  }

  @Post('verify-email')
  verifyEmail(
    @Param('formId') formId: string,
    @Body() body: VerifyEmailDto,
    @Ip() ipAddress: string
  ) {
    return this.formSecurityService.verifyEmail(formId, body, ipAddress);
  }

  @Post('verified-submission-status')
  verifiedSubmissionStatus(
    @Param('formId') formId: string,
    @Body() body: VerifiedSubmissionStatusDto
  ) {
    return this.formSecurityService.getVerifiedSubmissionStatus(formId, body);
  }

  @Post('submit')
  submit(
    @Param('formId') formId: string,
    @Body() body: SubmitPublicResponseDto,
    @Ip() ipAddress: string
  ) {
    return this.publicSubmissionOrchestrator.submitPublicForm({
      formId,
      answers: body.answers,
      email: body.email,
      captchaToken: body.captchaToken,
      sessionKey: body.sessionKey,
      fingerprint: body.fingerprint,
      bindingId: body.bindingId,
      grantToken: body.grantToken,
      ipAddress
    });
  }
}
