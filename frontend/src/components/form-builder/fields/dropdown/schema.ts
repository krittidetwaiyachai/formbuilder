import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';
export interface DropdownValidation {
  readOnly: boolean;
  multiple: boolean;
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
}
export const dropdownDefaultValues = {
  type: FieldType.DROPDOWN,
  label: 'Dropdown',
  required: false,
  placeholder: 'Select an option',
  options: ['Option 1', 'Option 2', 'Option 3'],
  validation: {
    readOnly: false,
    multiple: false,
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP
  } satisfies DropdownValidation
} as const;