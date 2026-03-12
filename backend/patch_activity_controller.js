const fs = require('fs');
let s = fs.readFileSync('src/activity-log/activity-log.controller.ts', 'utf8');

// Normalize newlines
s = s.replace(/\r\n/g, '\n');

s = s.replace(
  `import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';`,
  `import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';\nimport { CurrentUser } from '../auth/decorators/current-user.decorator';\nimport { RoleType } from '@prisma/client';`
);

s = s.replace(
  `  async getFormActivity(
    @Param('id') id: string,
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
    );
  }`,
  `  async getFormActivity(
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
  }`
);

fs.writeFileSync('src/activity-log/activity-log.controller.ts', s);
console.log('activity-log.controller.ts patched');
