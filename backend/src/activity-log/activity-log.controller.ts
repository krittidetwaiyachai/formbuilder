import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('forms/:id/activity')
@UseGuards(JwtAuthGuard)export class
ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}
  async getFormActivity(
    @Param('id')id: string,
  page: string = '1',
  limit: string = '20',
  sort: 'asc' | 'desc' = 'desc',
    @Query('action')action?: string)
  {
    return this.activityLogService.getFormActivity(
      id,
      parseInt(page),
      parseInt(limit),
      sort,
      action
    );
  }
}