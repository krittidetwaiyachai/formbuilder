import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
export class AdminUpdateSystemAuthPolicySettingsDto {
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(5)
  @Max(24 * 60)
  sessionIdleTimeoutMinutes?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(20)
  maxFailedLoginAttempts?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  lockoutMinutes?: number;
}