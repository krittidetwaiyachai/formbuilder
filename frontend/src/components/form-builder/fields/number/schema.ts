import { FieldType } from '@/types';

export const numberDefaultValues = {
  type: FieldType.NUMBER,
  label: 'Number',
  required: false,
  placeholder: 'Enter a number',
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
  },
  validation: {
    readOnly: false,
    min: undefined,
    max: undefined,
  }
};
