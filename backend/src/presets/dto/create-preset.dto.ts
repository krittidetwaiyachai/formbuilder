import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType, SensitivityLevel } from '@prisma/client';

export class CreatePresetFieldDto {
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
}

export class CreatePresetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPII?: boolean;

  @IsOptional()
  @IsEnum(SensitivityLevel)
  sensitivityLevel?: SensitivityLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePresetFieldDto)
  fields: CreatePresetFieldDto[];
}

