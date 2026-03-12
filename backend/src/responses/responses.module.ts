import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesStatsService } from './responses-stats.service';
import { ResponsesController } from './responses.controller';
@Module({
  controllers: [ResponsesController],
  providers: [ResponsesService, ResponsesStatsService],
  exports: [ResponsesService]
}) export class
  ResponsesModule { }