import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  Ip,
  Sse,
  MessageEvent
} from '@nestjs/common';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fs from 'fs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Throttle } from '@nestjs/throttler';
import { ResponsesService } from './responses.service';
import { ResponsesStatsService } from './responses-stats.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleType } from '@prisma/client';
import { Response } from 'express';
interface User {
  id: string;
  email: string;
  role: RoleType;
}
@Controller('responses') export class
  ResponsesController {
  constructor(
    private readonly responsesService: ResponsesService,
    private readonly statsService: ResponsesStatsService,
    private readonly eventEmitter: EventEmitter2
  ) { }
  @Post()
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  create(@Body() createResponseDto: CreateResponseDto, @Ip() ip: string) {
    createResponseDto.ipAddress = ip;
    return this.responsesService.create(createResponseDto);
  }
  @Get('check/:formId')
  @Public()
  checkSubmissionStatus(
    @Param('formId') formId: string,
    @Query('userId') userId?: string,
    @Query('respondentEmail') respondentEmail?: string,
    @Query('fingerprint') fingerprint?: string) {
    return this.responsesService.checkSubmissionStatus(
      formId,
      userId,
      respondentEmail,
      fingerprint
    );
  }
  @Get('form/:formId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  getStats(
    @Param('formId') formId: string,
    @CurrentUser() user: User) {
    return this.statsService.getStats(formId, user.id, user.role);
  }
  @Get('form/:formId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  findAll(
    @Param('formId') formId: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const sortOrder = sort === 'asc' ? 'asc' : 'desc';
    return this.responsesService.findAll(formId, user.id, user.role, pageNum, limitNum, sortOrder);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User) {
    return this.responsesService.findOne(id, user.id, user.role);
  }
  @Post('form/:formId/export/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  async startExport(
    @Param('formId') formId: string,
    @CurrentUser() user: User
  ) {
    return this.responsesService.startExportJob(formId, user.id, user.role);
  }

  @Sse('export/progress/:jobId')
  @Public()
  exportProgress(@Param('jobId') jobId: string): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, `export.progress.${jobId}`).pipe(
      map((payload: any) => ({
        data: payload
      } as MessageEvent))
    );
  }

  @Get('export/download/:jobId')
  @Public()
  async downloadExport(
    @Param('jobId') jobId: string,
    @Res() res: Response
  ) {
    const { filePath, filename } = this.responsesService.getJobResultFilePath(jobId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('DELETE_RESPONSES')
  async remove(@Param('id') id: string) {
    return this.responsesService.remove(id);
  }
}