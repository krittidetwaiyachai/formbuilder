import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestEmailVerificationDto {
  @IsOptional()
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email?: string;
}

