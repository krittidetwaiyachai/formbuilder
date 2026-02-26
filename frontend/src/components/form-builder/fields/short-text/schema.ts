import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';

export interface ShortTextOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  subLabel: string;
}

export const shortTextDefaultValues = {
  type: FieldType.TEXT,
  label: 'Short Text',
  required: false,
  placeholder: '',
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    subLabel: '',
  } satisfies ShortTextOptions,
  validation: {
    required: false,
    readOnly: false,
    maxLength: 100,
    hasMaxLength: false,
  }
} as const;
