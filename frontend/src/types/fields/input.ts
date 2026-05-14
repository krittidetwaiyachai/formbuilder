import { FieldType } from '../enums';
import type { FieldWidthType, LabelAlignmentType } from '../field-schema';
import type {
  ShortTextValidation,
  LongTextValidation,
  NumberValidation,
  EmailValidation,
  PhoneValidation } from
'../field-validation';
import type { BaseFieldProperties } from './base';
export interface TextFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  customWidth?: number;
  labelAlignment?: LabelAlignmentType;
  subLabel?: string;
  hoverText?: string;
  defaultValue?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
  items?: {label: string;value: string;}[];
}
export interface TextField extends BaseFieldProperties {
  type: FieldType.TEXT;
  validation?: ShortTextValidation;
  options?: TextFieldOptions;
}
export interface TextareaFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  customWidth?: number;
  labelAlignment?: LabelAlignmentType;
  subLabel?: string;
  rows?: number;
  editorMode?: 'PLAIN_TEXT' | 'RICH_TEXT';
  hoverText?: string;
  defaultValue?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
}
export interface TextareaField extends BaseFieldProperties {
  type: FieldType.TEXTAREA;
  validation?: LongTextValidation;
  options?: TextareaFieldOptions;
}
export interface NumberFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  customWidth?: number;
  labelAlignment?: LabelAlignmentType;
  subLabel?: string;
  hoverText?: string;
  defaultValue?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
}
export interface NumberField extends BaseFieldProperties {
  type: FieldType.NUMBER;
  validation?: NumberValidation;
  options?: NumberFieldOptions;
  min?: number;
  max?: number;
}
export interface EmailFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  customWidth?: number;
  labelAlignment?: LabelAlignmentType;
  placeholder?: string;
  subLabel?: string;
  hoverText?: string;
  defaultValue?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
}
export interface EmailField extends BaseFieldProperties {
  type: FieldType.EMAIL;
  validation?: EmailValidation;
  options?: EmailFieldOptions;
}
export interface PhoneFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  customWidth?: number;
  labelAlignment?: LabelAlignmentType;
  subLabel?: string;
  hoverText?: string;
  defaultValue?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
  showCountryCode?: boolean;
}
export interface PhoneField extends BaseFieldProperties {
  type: FieldType.PHONE;
  validation?: PhoneValidation;
  options?: PhoneFieldOptions;
}