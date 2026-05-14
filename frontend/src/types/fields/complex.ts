import { FieldType } from '../enums';
import type { FieldWidthType, LabelAlignmentType } from '../field-schema';
import type { AddressValidation, GenericValidation } from '../field-validation';
import type { BaseFieldProperties } from './base';
export interface RateFieldOptions {
  [key: string]: unknown;
  scale?: number;
  icon?: 'star' | 'heart' | 'thumb' | 'shield' | 'zap' | 'flag' | 'thumbsup' | 'smile' | 'STAR' | 'HEART' | 'THUMB';
  width?: FieldWidthType;
  labelAlignment?: LabelAlignmentType;
  maxRating?: number;
  defaultValue?: number | null;
  hoverText?: string;
  shrink?: boolean;
  hidden?: boolean;
  subLabel?: string;
  readOnly?: boolean;
}
export interface RateField extends BaseFieldProperties {
  type: FieldType.RATE;
  validation?: GenericValidation;
  options?: RateFieldOptions;
}
export interface FullNameFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  labelAlignment?: LabelAlignmentType;
  showPrefix?: boolean;
  showMiddleName?: boolean;
  showSuffix?: boolean;
  sublabels?: Record<string, string>;
  placeholders?: Record<string, string>;
  hoverText?: string;
  readOnly?: boolean;
  shrink?: boolean;
  hidden?: boolean;
}
export interface FullNameField extends BaseFieldProperties {
  type: FieldType.FULLNAME;
  validation?: GenericValidation;
  options?: FullNameFieldOptions;
}
export interface AddressFieldOptions {
  [key: string]: unknown;
  width?: FieldWidthType;
  labelAlignment?: LabelAlignmentType;
  defaultCountry?: string;
  sublabels?: Record<string, string>;
  showStreet?: boolean;
  showStreet2?: boolean;
  showCity?: boolean;
  showState?: boolean;
  showZip?: boolean;
  showCountry?: boolean;
  stateInputType?: 'text' | 'thai_provinces' | 'us_states';
  placeholders?: Record<string, string>;
  hoverText?: string;
  shrink?: boolean;
  hidden?: boolean;
}
export interface AddressField extends BaseFieldProperties {
  type: FieldType.ADDRESS;
  validation?: AddressValidation;
  options?: AddressFieldOptions;
}
export interface SubmitFieldOptions {
  [key: string]: unknown;
  buttonText?: string;
  width?: FieldWidthType;
  position?: 'LEFT' | 'CENTER' | 'RIGHT';
  buttonAlign?: 'AUTO' | 'LEFT' | 'CENTER' | 'RIGHT';
  resetButton?: boolean;
  printButton?: boolean;
  saveAndContinue?: boolean;
  hidden?: boolean;
}
export interface SubmitField extends BaseFieldProperties {
  type: FieldType.SUBMIT;
  validation?: GenericValidation;
  options?: SubmitFieldOptions;
}
export interface Row {
  id: string;
  label: string;
}
export interface Column {
  id: string;
  label: string;
}
export interface MatrixFieldOptions {
  [key: string]: unknown;
  rows?: Row[];
  columns?: Column[];
  inputType?: 'radio' | 'checkbox';
  labelAlignment?: LabelAlignmentType;
  subLabel?: string;
  hoverText?: string;
  hidden?: boolean;
  readOnly?: boolean;
}
export interface MatrixField extends BaseFieldProperties {
  type: FieldType.MATRIX;
  validation?: GenericValidation;
  options?: MatrixFieldOptions;
}
export interface TableFieldOptions {
  [key: string]: unknown;
  rows?: Row[];
  columns?: Column[];
  allowAddRow?: boolean;
  subLabel?: string;
  readOnly?: boolean;
  hoverText?: string;
  hidden?: boolean;
}
export interface TableField extends BaseFieldProperties {
  type: FieldType.TABLE;
  validation?: GenericValidation;
  options?: TableFieldOptions;
}
export interface FileFieldOptions {
  [key: string]: unknown;
  accept?: string;
  maxSize?: number;
}
export interface FileField extends BaseFieldProperties {
  type: FieldType.FILE;
  validation?: GenericValidation;
  options?: FileFieldOptions;
  accept?: string;
  max?: number;
}