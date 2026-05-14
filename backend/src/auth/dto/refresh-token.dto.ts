import { IsOptional, IsString, MaxLength } from 'class-validator';
export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  @MaxLength(512)
  refresh_token?: string;
}