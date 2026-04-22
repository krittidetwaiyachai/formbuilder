import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
export class AdminUpdateSystemRetentionSettingsDto {
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  autoCleanupEnabled?: boolean;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? null : Number(value))
  @IsInt()
  @Min(1)
  @Max(3650)
  responsesDays?: number | null;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(3650)
  auditLogsDays?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(3650)
  invitationsDays?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(24 * 30)
  cleanupIntervalHours?: number;
}