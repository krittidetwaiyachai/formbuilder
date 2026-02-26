import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';

export interface FullNameOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  showPrefix: boolean;
  showMiddleName: boolean;
  showSuffix: boolean;
}

export const fullNameDefaultValues = {
  type: FieldType.FULLNAME,
  label: 'Full Name',
  required: false,
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    showPrefix: false,
    showMiddleName: false,
    showSuffix: false,
  } satisfies FullNameOptions,
  validation: {
    readOnly: false,
  }
} as const;
