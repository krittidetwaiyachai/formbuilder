import { FieldType } from '@/types';

export const dropdownDefaultValues = {
  type: FieldType.DROPDOWN,
  label: 'Dropdown',
  required: false,
  placeholder: 'Select an option',
  options: ['Option 1', 'Option 2', 'Option 3'],
  validation: {
    readOnly: false,
    multiple: false,
    width: 'FULL',
    labelAlignment: 'TOP',
  }
};
