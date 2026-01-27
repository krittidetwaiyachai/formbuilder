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
  @IsOptional()
  @IsString()
  id?: string;

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

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsBoolean()
  shrink?: boolean;

  @IsOptional()
  @IsBoolean()
  isPII?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageWidth?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  formId?: string;

  @IsOptional()
  @IsString()
  helperText?: string;

  @IsOptional()
  @IsNumber()
  rows?: number;

  @IsOptional()
  @IsString()
  accept?: string;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  headingImage?: string;

  @IsOptional()
  @IsString()
  explanation?: string;
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

export class CreateLogicConditionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  fieldId: string;

  @IsString()
  operator: string;

  @IsOptional()
  value?: any;
}

export class CreateLogicActionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  fieldId: string;
}

export class CreateLogicRuleDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logicType?: string; 

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLogicConditionDto)
  conditions?: CreateLogicConditionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLogicActionDto)
  actions?: CreateLogicActionDto[];
}

export class CreateFormDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

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
  welcomeSettings?: any;

  @IsOptional()
  thankYouSettings?: any;

  @IsOptional()
  settings?: any;

  @IsOptional()
  pageSettings?: any;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLogicRuleDto)
  logicRules?: CreateLogicRuleDto[];
}

