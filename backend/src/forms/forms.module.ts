import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module'; // Corrected path
import { FormGateway } from './form.gateway';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [FormsController],
  providers: [FormsService, FormGateway],
  exports: [FormsService],
})
export class FormsModule {}
