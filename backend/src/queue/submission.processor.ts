import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ResponsesService } from '../responses/responses.service';
import { CreateResponseDto } from '../responses/dto/create-response.dto';

@Processor('submission')
export class SubmissionProcessor {
  private readonly logger = new Logger(SubmissionProcessor.name);

  constructor(private readonly responsesService: ResponsesService) {}

  @Process('create')
  async handleSubmission(job: Job<CreateResponseDto>) {
    this.logger.debug('Processing submission job: ' + job.id);
    try {
      const result = await this.responsesService.create(job.data);
      this.logger.debug('Submission processed successfully: ' + result.id);
      return result;
    } catch (error) {
      this.logger.error('Failed to process submission', error.stack);
      throw error;
    }
  }
}
