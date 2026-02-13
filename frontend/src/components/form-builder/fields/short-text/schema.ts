import { FieldType } from '@/types/enums';
import { FieldWidth, FieldWidthType, LabelAlignment, LabelAlignmentType } from '@/types/field-schema';

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
