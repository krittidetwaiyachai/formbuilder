import type { FieldWidthType, LabelAlignmentType } from './field-schema';
import type { DateFormatType, TimeFormatType as DateTimeFormatType } from '@/components/form-builder/fields/date/schema';
import type { TimeFormatType } from '@/components/form-builder/fields/time/schema';
import type { HeaderSizeType, HeaderAlignType } from '@/components/form-builder/fields/header/schema';
import type { EditorModeType } from '@/components/form-builder/fields/long-text/schema';
import type { RateIconType } from '@/components/form-builder/fields/rate/schema';
import type { ButtonPositionType } from '@/components/form-builder/fields/submit/schema';

export interface BaseValidation {
    [key: string]: unknown;
    readOnly?: boolean;
    required?: boolean;
}

export interface DateValidation extends BaseValidation {
    showTime?: boolean;
    liteMode?: boolean;
    separator?: string;
    dateFormat?: DateFormatType;
    timeFormat?: DateTimeFormatType;
    calendarPopup?: boolean;
    defaultDate?: string;
    limitTime?: 'BOTH' | 'PAST' | 'FUTURE';
    ageVerification?: boolean;
    minimumAge?: number;
    allowPast?: boolean;
    allowFuture?: boolean;
    sublabels?: { date?: string };
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    minDate?: string;
    maxDate?: string;
}

export interface PhoneValidation extends BaseValidation {
    countryCode?: boolean;
    maskPattern?: string;
    sublabels?: { masked?: string };
    placeholders?: { masked?: string };
    hasInputMask?: boolean;
    inputMask?: string;
}

export interface EmailValidation extends BaseValidation {
    confirmation?: boolean;
    disallowFree?: boolean;
    hasMaxLength?: boolean;
    maxLength?: number;
}

export interface HeaderValidation extends BaseValidation {
    size?: HeaderSizeType;
    alignment?: HeaderAlignType;
    headingImage?: string;
}

export interface ShortTextValidation extends BaseValidation {
    maxLength?: number;
    hasMaxLength?: boolean;
    hasInputMask?: boolean;
    inputMask?: string;
    type?: string;
}

export interface LongTextValidation extends BaseValidation {
    maxLength?: number;
    hasMaxLength?: boolean;
    minLength?: number;
    hasEntryLimits?: boolean;
    minWords?: number;
    maxWords?: number;
    type?: string;
}

export interface NumberValidation extends BaseValidation {
    min?: number | null;
    max?: number | null;
    entryLimits?: boolean;
}

export interface AddressValidation extends BaseValidation {
    showStreet?: boolean;
    showStreet2?: boolean;
    showCity?: boolean;
    showState?: boolean;
    showZip?: boolean;
    showCountry?: boolean;
}

export interface CheckboxValidation extends BaseValidation {
    minSelections?: number;
    maxSelections?: number;
    spreadToColumns?: boolean;
    columns?: number;
    otherOption?: boolean;
}

export interface RadioValidation extends BaseValidation {
    spreadToColumns?: boolean;
    columns?: number;
    otherOption?: boolean;
    labelAlignment?: LabelAlignmentType;
    width?: FieldWidthType;
}

export interface DropdownValidation extends BaseValidation {
    multiple?: boolean;
    rows?: number;
    width?: FieldWidthType;
    labelAlignment?: LabelAlignmentType;
}

export interface GenericValidation extends BaseValidation {
    [key: string]: unknown;
}

export interface FieldValidation extends BaseValidation {
    [key: string]: unknown;
}

export interface CheckboxOption {
    id?: string;
    label: string;
    value: string;
}

export interface ChoiceFieldOptions {
    [key: string]: unknown;
    items?: CheckboxOption[];
    labelAlignment?: 'LEFT' | 'CENTER' | 'TOP';
    subLabel?: string;
    calculationValues?: boolean;
    otherOption?: boolean;
    spreadToColumns?: boolean;
    columns?: number;
    shuffle?: boolean;
    defaultValue?: string;
    hoverText?: string;
    readOnly?: boolean;
    hidden?: boolean;
}

// FieldOptions is now defined in typed-fields.ts
