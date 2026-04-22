import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
@Module({
  imports: [PrismaModule, MailModule, SystemSettingsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})export class
AdminModule {}