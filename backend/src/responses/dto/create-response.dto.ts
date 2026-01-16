import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAnswerDto {
  @IsString()
  fieldId: string;

  @IsString()
  value: string;
}

export class CreateResponseDto {
  @IsString()
  formId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  respondentEmail?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  @IsString()
  fingerprint?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}

