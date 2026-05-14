import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class LoginDto {
  @IsString()
  @MaxLength(254)
  identifier: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsOptional()
  @IsString()
  captchaToken?: string;
}