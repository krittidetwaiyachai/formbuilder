import { FieldType } from '@/types';

export const checkboxDefaultValues = {
  type: FieldType.CHECKBOX,
  label: 'Checkbox',
  required: false,
  options: [
    { label: 'Option 1', value: 'Option 1' },
    { label: 'Option 2', value: 'Option 2' },
    { label: 'Option 3', value: 'Option 3' },
  ],
  validation: {
    minSelections: 0,
    maxSelections: 0,
  }
};
