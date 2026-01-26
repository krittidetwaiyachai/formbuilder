import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 1000,
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
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
