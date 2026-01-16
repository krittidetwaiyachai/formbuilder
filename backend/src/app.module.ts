import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    FormsModule,
    BundlesModule,
    ResponsesModule,

    ActivityLogModule,
    FoldersModule,
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
