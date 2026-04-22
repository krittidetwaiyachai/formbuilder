import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
export class AdminUpdateSystemBrandingSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  appName?: string | null;
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string | null;
  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'primaryColor must be a valid hex color.'
  })
  primaryColor?: string | null;
}