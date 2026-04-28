import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';

export class AdminCreateLocalUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[a-z0-9]+$/, {
    message: 'Username must contain only lowercase letters (a-z) and digits (0-9)',
  })
  username: string;

  @IsEmail()
  @IsOptional()
  realEmail?: string;

  @IsString()
  @IsOptional()
  emailVerificationId?: string;

  @IsString()
  @MinLength(16)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;
}
