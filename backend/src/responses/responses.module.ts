import { Module } from '@nestjs/common';
import { FormSecurityModule } from '../form-security/form-security.module';
import { ResponsesService } from './responses.service';
import { ResponsesStatsService } from './responses-stats.service';
import { ResponsesController } from './responses.controller';
@Module({
  imports: [FormSecurityModule],
  controllers: [ResponsesController],
  providers: [ResponsesService, ResponsesStatsService],
  exports: [ResponsesService]
})export class
ResponsesModule {}