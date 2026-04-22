import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FormsModule } from './forms/forms.module';
import { BundlesModule } from './presets/bundles.module';
import { ResponsesModule } from './responses/responses.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { FoldersModule } from './folders/folders.module';
import { EventsModule } from './events/events.module';
import { CommonModule } from './common/common.module';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { CollaborationModule } from './collaboration/collaboration.module';
import { RedisModule } from './common/redis/redis.module';
import { FormSecurityModule } from './form-security/form-security.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true
  }),
  EventEmitterModule.forRoot(),
  ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 200
  }]),
  PrismaModule,
  AuthModule,
  UsersModule,
  FormsModule,
  BundlesModule,
  ResponsesModule,
  ActivityLogModule,
  FoldersModule,
  EventsModule,
  CommonModule,
  SystemSettingsModule,
  RedisModule,
  FormSecurityModule,
  AdminModule,
  CollaborationModule],
  providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  },
  {
    provide: APP_GUARD,
    useClass: CustomThrottlerGuard
  }],
  controllers: [AppController]
})export class
AppModule {}