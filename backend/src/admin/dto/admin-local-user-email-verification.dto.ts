import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class AdminRequestLocalUserEmailVerificationDto {
  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;
}

export class AdminVerifyLocalUserEmailDto {
  @IsString()
  verificationId: string;

  @IsString()
  @MaxLength(254)
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}
