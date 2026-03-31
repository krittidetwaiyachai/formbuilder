import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  Sse,
  MessageEvent } from
'@nestjs/common';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fs from 'fs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResponsesService } from './responses.service';
import { ResponsesStatsService } from './responses-stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';
import { Response } from 'express';
interface User {
  id: string;
  email: string;
  role: RoleType;
}
@Controller('responses')export class
ResponsesController {
  constructor(
  private readonly responsesService: ResponsesService,
  private readonly statsService: ResponsesStatsService,
  private readonly eventEmitter: EventEmitter2)
  {}
  @Get('form/:formId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  getStats(
    @Param('formId')formId: string,
    @Query()query: Record<string, unknown>,
    @CurrentUser()user: User) {
    const month =
    typeof query.month === 'string' ? query.month :
    typeof query.selectedMonth === 'string' ? query.selectedMonth :
    undefined;
    return this.statsService.getStats(formId, user.id, user.role, { month });
  }
  @Get('form/:formId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  findAll(
    @Param('formId')formId: string,
    @CurrentUser()user: User,
    @Query('page')page?: string,
    @Query('limit')limit?: string,
    @Query('sort')sort?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const sortOrder = sort === 'asc' ? 'asc' : 'desc';
    return this.responsesService.findAll(formId, user.id, user.role, pageNum, limitNum, sortOrder);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  findOne(
    @Param('id')id: string,
    @CurrentUser()user: User) {
    return this.responsesService.findOne(id, user.id, user.role);
  }
  @Post('form/:formId/export/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  async startExport(
    @Param('formId')formId: string,
    @CurrentUser()user: User)
  {
    return this.responsesService.startExportJob(formId, user.id, user.role);
  }
  @Sse('export/progress/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  exportProgress(
    @Param('jobId')jobId: string,
    @CurrentUser()user: User): Observable<MessageEvent> {
    this.responsesService.assertJobOwner(jobId, user.id, user.role);
    return fromEvent(this.eventEmitter, `export.progress.${jobId}`).pipe(
      map((payload: Record<string, unknown>) => ({
        data: payload
      }) as MessageEvent)
    );
  }
  @Get('export/download/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.EDITOR, RoleType.VIEWER)
  async downloadExport(
    @Param('jobId')jobId: string,
    @CurrentUser()user: User,
    @Res()res: Response)
  {
    const { filePath, filename } = this.responsesService.getJobResultFilePath(jobId, user.id, user.role);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('DELETE_RESPONSES')
  async remove(
    @Param('id')id: string,
    @CurrentUser()user: User) {
    return this.responsesService.remove(id, user.id, user.role);
  }
}