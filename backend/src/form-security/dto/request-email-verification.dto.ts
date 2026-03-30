import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

class RequestEmailVerificationAnswerDto {
  @IsString()
  fieldId: string;

  @IsString()
  value: string;
}

export class RequestEmailVerificationDto {
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestEmailVerificationAnswerDto)
  answers?: RequestEmailVerificationAnswerDto[];
}
