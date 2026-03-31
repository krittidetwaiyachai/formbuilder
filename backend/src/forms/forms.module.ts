import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { FormGateway } from './form.gateway';
@Module({
  imports: [
  PrismaModule,
  ActivityLogModule,
  ConfigModule,
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET') || 'secret'
    })
  })],
  controllers: [FormsController],
  providers: [FormsService, FormGateway],
  exports: [FormsService]
})export class
FormsModule {}