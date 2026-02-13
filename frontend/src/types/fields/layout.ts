import { FieldType } from '../enums';
import type { FieldWidthType } from '../field-schema';
import type { HeaderValidation, GenericValidation } from '../field-validation';
import type { BaseFieldProperties } from './base';

export interface HeaderFieldOptions {
    [key: string]: unknown;
    text?: string;
    subText?: string;
    size?: 'SMALL' | 'MEDIUM' | 'LARGE';
    align?: 'LEFT' | 'CENTER' | 'RIGHT';
    showImage?: boolean;
}

export interface HeaderField extends BaseFieldProperties {
    type: FieldType.HEADER;
    validation?: HeaderValidation;
    options?: HeaderFieldOptions;
    headingImage?: string;
}

export interface ParagraphFieldOptions {
    [key: string]: unknown;
    width?: FieldWidthType;
    moveToNewLine?: boolean;
    shrink?: boolean;
    hidden?: boolean;
}

export interface ParagraphField extends BaseFieldProperties {
    type: FieldType.PARAGRAPH;
    validation?: GenericValidation;
    options?: ParagraphFieldOptions;
    content?: string;
}

export interface DividerField extends BaseFieldProperties {
    type: FieldType.DIVIDER;
    validation?: GenericValidation;
    options?: Record<string, unknown>;
}

export interface SectionCollapseField extends BaseFieldProperties {
    type: FieldType.SECTION_COLLAPSE;
    validation?: GenericValidation;
    options?: Record<string, unknown>;
}

export interface PageBreakField extends BaseFieldProperties {
    type: FieldType.PAGE_BREAK;
    validation?: GenericValidation;
    options?: Record<string, unknown>;
}

export interface GroupField extends BaseFieldProperties {
    type: FieldType.GROUP;
    validation?: GenericValidation;
    options?: Record<string, unknown>;
}
