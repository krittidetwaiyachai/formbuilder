import { FieldType } from '@/types/enums';
export interface CheckboxOption {
  label: string;
  value: string;
}
export const checkboxDefaultValues = {
  type: FieldType.CHECKBOX,
  label: 'Checkbox',
  required: false,
  options: [
  { label: 'Option 1', value: 'Option 1' },
  { label: 'Option 2', value: 'Option 2' },
  { label: 'Option 3', value: 'Option 3' }] satisfies
  CheckboxOption[],
  validation: {
    minSelections: 0,
    maxSelections: 0
  }
} as const;