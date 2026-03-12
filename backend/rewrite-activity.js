const fs = require('fs');

const content = \`import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '@prisma/client';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('forms/:id/activity')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  async getFormActivity(
    @Param('id') id: string,
    @CurrentUser() user: { id: string, role: RoleType },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('sort') sort: 'asc' | 'desc' = 'desc',
    @Query('action') action?: string,
  ) {
    return this.activityLogService.getFormActivity(
      id,
      parseInt(page),
      parseInt(limit),
      sort,
      action,
      undefined,
      user.id,
      user.role
    );
  }
}
\`;

fs.writeFileSync('src/activity-log/activity-log.controller.ts', content);
console.log('activity-log.controller.ts restored!');
