import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemSettingsService } from './system-settings.service';
import { SystemMaintenanceService } from './system-maintenance.service';
@Module({
  imports: [PrismaModule],
  providers: [SystemSettingsService, SystemMaintenanceService],
  exports: [SystemSettingsService, SystemMaintenanceService]
})export class
SystemSettingsModule {}