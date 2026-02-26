import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';

export interface PhoneOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
}

export const phoneDefaultValues = {
  type: FieldType.PHONE,
  label: 'Phone Number',
  required: false,
  placeholder: '(123) 456-7890',
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
  } satisfies PhoneOptions,
  validation: {
    readOnly: false,
  }
} as const;
