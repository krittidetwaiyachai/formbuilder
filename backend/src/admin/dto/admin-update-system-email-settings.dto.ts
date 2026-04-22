import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEmail } from
'class-validator';
export class AdminUpdateSystemEmailSettingsDto {
  @IsOptional()
  @IsString()
  smtpHost?: string | null;
  @IsOptional()
  @Transform(({ value }) => value === '' || value === null ? undefined : Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort?: number;
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  smtpSecure?: boolean;
  @IsOptional()
  @IsString()
  smtpUser?: string | null;
  @IsOptional()
  @IsString()
  smtpPass?: string | null;
  @IsOptional()
  @IsBoolean()
  clearSmtpPass?: boolean;
  @IsOptional()
  @IsEmail()
  smtpFrom?: string | null;
  @IsOptional()
  @IsString()
  smtpFromName?: string | null;
}