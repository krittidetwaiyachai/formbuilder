import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, FormStatus } from '@prisma/client';

export class CreateFieldDto {
  @IsEnum(FieldType)
  type: FieldType;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  validation?: any;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  options?: any;

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsNumber()
  score?: number;
}

export class CreateFieldConditionDto {
  @IsString()
  sourceFieldId: string;

  @IsString()
  targetFieldId: string;

  @IsString()
  operator: string;

  @IsString()
  value: string;

  @IsString()
  action: string;
}

export class CreateFormDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FormStatus)
  status?: FormStatus;

  @IsOptional()
  @IsBoolean()
  isQuiz?: boolean;

  @IsOptional()
  quizSettings?: {
    showScore?: boolean;
    showAnswer?: boolean;
    showDetail?: boolean;
  };

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  fields?: CreateFieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldConditionDto)
  conditions?: CreateFieldConditionDto[];
}

