import { FieldType } from '../enums';
import type {
    CheckboxValidation,
    RadioValidation,
    DropdownValidation,
    ChoiceFieldOptions,
} from '../field-validation';
import type { BaseFieldProperties } from './base';

export interface DropdownFieldOptions extends ChoiceFieldOptions {
    width?: 'FIXED' | 'FULL';
    customWidth?: number;
    multiple?: boolean;
}

export interface DropdownField extends BaseFieldProperties {
    type: FieldType.DROPDOWN;
    validation?: DropdownValidation;
    options?: DropdownFieldOptions;
}

export interface CheckboxFieldOptions extends ChoiceFieldOptions {
    entryLimits?: boolean;
    minSelections?: number;
    maxSelections?: number;
    shrink?: boolean;
}

export interface CheckboxField extends BaseFieldProperties {
    type: FieldType.CHECKBOX;
    validation?: CheckboxValidation;
    options?: CheckboxFieldOptions;
    correctAnswer?: string;
    score?: number;
    explanation?: string;
}

export interface RadioFieldOptions extends ChoiceFieldOptions {
    shrink?: boolean;
}

export interface RadioField extends BaseFieldProperties {
    type: FieldType.RADIO;
    validation?: RadioValidation;
    options?: RadioFieldOptions;
    correctAnswer?: string;
    score?: number;
    explanation?: string;
}
