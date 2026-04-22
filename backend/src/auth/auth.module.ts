import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { EventsModule } from '../events/events.module';
import { FormSecurityModule } from '../form-security/form-security.module';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
@Module({
  imports: [
  EventsModule,
  FormSecurityModule,
  SystemSettingsModule,
  PassportModule,
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') || '7d') as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;
      const secret = configService.get<string>('JWT_SECRET');
      if (!secret) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET environment variable is not defined!');
        }
        console.warn('WARNING: JWT_SECRET is not defined, using default insecure secret');
      }
      return {
        secret: secret || 'secret',
        signOptions: {
          expiresIn
        }
      };
    }
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard]
})export class
AuthModule {}