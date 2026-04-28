import { IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class VerifyPasswordResetOtpDto {
  @IsString()
  @IsNotEmpty()
  resetId: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}

export class CompletePasswordResetDto {
  @IsString()
  @IsNotEmpty()
  resetId: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
