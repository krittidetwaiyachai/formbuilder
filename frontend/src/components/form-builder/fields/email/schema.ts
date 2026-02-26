import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';

export interface EmailOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  placeholder: string;
  subLabel: string;
}

export const emailDefaultValues = {
  type: FieldType.EMAIL,
  label: 'Email',
  required: false,
  placeholder: 'example@email.com',
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    placeholder: 'example@email.com',
    subLabel: '',
  } satisfies EmailOptions,
  validation: {
    required: false,
    readOnly: false,
    confirmation: false,
  }
} as const;
