import { IsString } from 'class-validator';

export class VerifiedSubmissionStatusDto {
  @IsString()
  grantToken: string;
}
