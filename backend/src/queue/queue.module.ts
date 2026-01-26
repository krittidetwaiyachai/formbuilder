import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SubmissionProcessor } from './submission.processor';
import { ResponsesModule } from '../responses/responses.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'submission',
    }),
    ResponsesModule,
  ],
  providers: [SubmissionProcessor],
  exports: [BullModule],
})
export class QueueModule {}
