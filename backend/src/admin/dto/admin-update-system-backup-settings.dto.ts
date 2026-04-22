import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
export class AdminUpdateSystemBackupSettingsDto {
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  autoEnabled?: boolean;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(24 * 30)
  intervalHours?: number;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(3650)
  retentionDays?: number;
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  directory?: string | null;
}