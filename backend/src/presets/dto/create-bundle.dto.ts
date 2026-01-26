import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Allow,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '@prisma/client';

export class CreateBundleFieldDto {
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
  @Allow()
  validation?: any;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @Allow()
  options?: any;

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
}

export class CreateBundleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPII?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  options?: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBundleFieldDto)
  fields: CreateBundleFieldDto[];
}
