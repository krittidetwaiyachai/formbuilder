import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested } from
'class-validator';
import { UnifiedPublicAnswerDto } from './unified-public-answer.dto';
export class CreateUnifiedSubmissionDto {
  @IsOptional()
  @IsString()
  respondentEmail?: string;
  @IsOptional()
  @IsString()
  captchaToken?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnifiedPublicAnswerDto)
  answers: UnifiedPublicAnswerDto[];
}