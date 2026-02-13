import { FieldType } from '@/types/enums';
import { FieldWidth, FieldWidthType, LabelAlignment, LabelAlignmentType } from '@/types/field-schema';

export interface NumberOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  subLabel: string;
}

export const numberDefaultValues = {
  type: FieldType.NUMBER,
  label: 'Number',
  required: false,
  placeholder: '',
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    subLabel: '',
  } satisfies NumberOptions,
  validation: {
    required: false,
    readOnly: false,
    min: null,
    max: null,
  }
} as const;
