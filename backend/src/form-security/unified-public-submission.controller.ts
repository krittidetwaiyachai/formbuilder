import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Param,
  Post,
  Req,
  Res } from
'@nestjs/common';
import { Request, Response } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { RequestUnifiedVerificationDto } from './dto/request-unified-verification.dto';
import { CreateUnifiedSubmissionDto } from './dto/create-unified-submission.dto';
import { UnifiedPublicSubmissionService } from './unified-public-submission.service';
import {
  extractCookieValue,
  getPublicSessionCookieName } from
'./public-submission-session.util';
@Controller('public')
@Public()export class
UnifiedPublicSubmissionController {
  constructor(private readonly unifiedPublicSubmissionService: UnifiedPublicSubmissionService) {}
  @Get('forms/:formId')
  async getForm(
    @Param('formId')formId: string,
    @Req()req: Request,
    @Res({ passthrough: true })res: Response,
    @Ip()ipAddress: string,
    @Headers('user-agent')userAgent?: string)
  {
    const cookieToken = this.readSessionCookie(req, formId);
    const result = await this.unifiedPublicSubmissionService.getPublicForm(
      formId,
      cookieToken,
      ipAddress,
      userAgent
    );
    this.writeSessionCookie(res, formId, result.cookieToken);
    return {
      form: result.form,
      submissionState: result.submissionState
    };
  }
  @Post('forms/:formId/verification-requests')
  async requestVerification(
    @Param('formId')formId: string,
    @Req()req: Request,
    @Res({ passthrough: true })res: Response,
    @Body()body: RequestUnifiedVerificationDto,
    @Ip()ipAddress: string,
    @Headers('user-agent')userAgent?: string)
  {
    const cookieToken = this.readSessionCookie(req, formId);
    const result = await this.unifiedPublicSubmissionService.requestVerification(
      formId,
      cookieToken,
      body,
      ipAddress,
      userAgent
    );
    this.writeSessionCookie(res, formId, result.cookieToken);
    return {
      status: result.status,
      verificationRequestId: result.verificationRequestId,
      message: result.message
    };
  }
  @Get('forms/:formId/verification-requests/:verificationRequestId')
  async getVerificationStatus(
    @Param('formId')formId: string,
    @Param('verificationRequestId')verificationRequestId: string,
    @Req()req: Request)
  {
    const cookieToken = this.readSessionCookie(req, formId);
    return this.unifiedPublicSubmissionService.getVerificationStatus(
      formId,
      verificationRequestId,
      cookieToken
    );
  }
  @Post('forms/:formId/submissions')
  async submit(
    @Param('formId')formId: string,
    @Req()req: Request,
    @Res({ passthrough: true })res: Response,
    @Body()body: CreateUnifiedSubmissionDto,
    @Ip()ipAddress: string,
    @Headers('user-agent')userAgent?: string)
  {
    const cookieToken = this.readSessionCookie(req, formId);
    const result = await this.unifiedPublicSubmissionService.submit(
      formId,
      cookieToken,
      body,
      ipAddress,
      userAgent
    );
    this.writeSessionCookie(res, formId, result.cookieToken);
    return {
      submission: result.submission
    };
  }
  @Get('forms/:formId/submission-state')
  async getSubmissionState(
    @Param('formId')formId: string,
    @Req()req: Request,
    @Res({ passthrough: true })res: Response,
    @Ip()ipAddress: string,
    @Headers('user-agent')userAgent?: string)
  {
    const cookieToken = this.readSessionCookie(req, formId);
    const result = await this.unifiedPublicSubmissionService.getSubmissionState(
      formId,
      cookieToken,
      ipAddress,
      userAgent
    );
    this.writeSessionCookie(res, formId, result.cookieToken);
    return result.submissionState;
  }
  @Get('email-verifications/:token')
  async verifyEmailToken(
    @Param('token')token: string,
    @Ip()ipAddress: string,
    @Res()res: Response)
  {
    const result = await this.unifiedPublicSubmissionService.verifyEmailToken(token, ipAddress);
    const html =
    result.status === 'VERIFIED' ?
    '<html><body><h1>Email verified</h1><p>Return to the original browser tab to continue.</p></body></html>' :
    '<html><body><h1>Link unavailable</h1><p>This verification link is invalid or expired.</p></body></html>';
    res.type('html').send(html);
  }
  private readSessionCookie(req: Request, formId: string): string | null {
    const cookieName = getPublicSessionCookieName(formId);
    return extractCookieValue(req.headers.cookie, cookieName);
  }
  private writeSessionCookie(res: Response, formId: string, cookieToken: string) {
    res.cookie(getPublicSessionCookieName(formId), cookieToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/api'
    });
  }
}