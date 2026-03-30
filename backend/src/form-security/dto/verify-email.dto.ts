import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  bindingId: string;

  @IsString()
  token: string;
}
