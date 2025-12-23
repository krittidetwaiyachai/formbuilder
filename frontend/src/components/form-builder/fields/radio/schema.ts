import { FieldType } from '@/types';

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
    labelAlignment: 'TOP',
    width: 'FULL',
  }
};
