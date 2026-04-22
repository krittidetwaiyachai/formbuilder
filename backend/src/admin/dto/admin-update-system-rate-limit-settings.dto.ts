import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
export class AdminUpdateSystemRateLimitSettingsDto {
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  authLoginLimit?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(10)
  @Max(24 * 60 * 60)
  authLoginWindowSeconds?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  publicVerifySessionLimit?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  publicVerifyIpLimit?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(10)
  @Max(24 * 60 * 60)
  publicVerifyWindowSeconds?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  publicSubmitSessionLimit?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(1000)
  publicSubmitIpLimit?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(10)
  @Max(24 * 60 * 60)
  publicSubmitWindowSeconds?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(5)
  @Max(3600)
  verificationCooldownSeconds?: number;
}