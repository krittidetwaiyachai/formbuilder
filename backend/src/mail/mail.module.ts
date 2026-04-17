import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
@Module({
  imports: [ConfigModule, SystemSettingsModule],
  providers: [MailService],
  exports: [MailService]
})export class
MailModule {}
