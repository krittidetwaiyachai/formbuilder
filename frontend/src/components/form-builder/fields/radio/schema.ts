import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';

export interface RadioValidation {
  readOnly: boolean;
  spreadToColumns: boolean;
  columns: number;
  otherOption: boolean;
  labelAlignment: LabelAlignmentType;
  width: FieldWidthType;
}

export const radioDefaultValues = {
  type: FieldType.RADIO,
  label: 'Single Choice',
  required: false,
  options: ['Option 1', 'Option 2', 'Option 3'],
  validation: {
    readOnly: false,
    spreadToColumns: false,
    columns: 2,
    otherOption: false,
    labelAlignment: LabelAlignment.TOP,
    width: FieldWidth.FULL,
  } satisfies RadioValidation,
} as const;
