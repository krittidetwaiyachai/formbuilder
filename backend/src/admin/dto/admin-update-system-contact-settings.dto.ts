import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
export class AdminUpdateSystemContactSettingsDto {
  @IsOptional()
  @IsEmail()
  supportEmail?: string | null;
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supportLineId?: string | null;
}