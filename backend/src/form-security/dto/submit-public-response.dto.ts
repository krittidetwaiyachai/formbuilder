import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

class SubmitPublicResponseAnswerDto {
  @IsString()
  fieldId: string;

  @IsString()
  value: string;
}

export class SubmitPublicResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitPublicResponseAnswerDto)
  answers: SubmitPublicResponseAnswerDto[];

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;

  @IsOptional()
  @IsString()
  sessionKey?: string;

  @IsOptional()
  @IsString()
  fingerprint?: string;

  @IsOptional()
  @IsString()
  bindingId?: string;

  @IsOptional()
  @IsString()
  grantToken?: string;
}
