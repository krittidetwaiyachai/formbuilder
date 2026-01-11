import { FieldType } from '@/types';

export const numberDefaultValues = {
  type: FieldType.NUMBER,
  label: 'Number',
  required: false,
  placeholder: '',
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
    subLabel: '',
  },
  validation: {
    required: false,
    readOnly: false,
    min: null,
    max: null,
  }
};
