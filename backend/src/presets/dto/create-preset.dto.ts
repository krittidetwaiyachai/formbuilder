import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber
} from
  'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '@prisma/client';
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
  validation?: Record<string, unknown>;
  @IsOptional()
  @IsNumber()
  order?: number;
  @IsOptional()
  options?: Record<string, unknown>;
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePresetFieldDto)
  fields: CreatePresetFieldDto[];
}