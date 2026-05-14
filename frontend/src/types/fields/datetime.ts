import { FieldType } from '../enums';
import type { FieldWidthType, LabelAlignmentType } from '../field-schema';
import type { DateValidation, GenericValidation } from '../field-validation';
import type { BaseFieldProperties } from './base';
export interface DateFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  labelAlignment?: LabelAlignmentType;
  dateFormat?: string;
  timeFormat?: string;
  showTime?: boolean;
  subLabel?: string;
  hoverText?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
  defaultDate?: 'NONE' | 'CURRENT' | 'CUSTOM' | 'none' | 'current' | 'custom';
  customDefaultDate?: string;
}
export interface DateField extends BaseFieldProperties {
  type: FieldType.DATE;
  validation?: DateValidation;
  options?: DateFieldOptions;
}
export interface TimeFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  labelAlignment?: LabelAlignmentType;
  timeFormat?: '12' | '24' | 'AMPM' | '24 HOUR';
  subLabelHour?: string;
  subLabelMinutes?: string;
  defaultTime?: 'NONE' | 'CURRENT' | 'CUSTOM';
  customDefaultTime?: string;
  timeRange?: boolean;
  hoverText?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
  subLabel?: string;
}
export interface TimeField extends BaseFieldProperties {
  type: FieldType.TIME;
  validation?: GenericValidation;
  options?: TimeFieldOptions;
}