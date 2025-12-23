import { FieldType } from '@/types';

export const phoneDefaultValues = {
  type: FieldType.PHONE,
  label: 'Phone Number',
  required: false,
  placeholder: '(123) 456-7890',
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
  },
  validation: {
    readOnly: false,
  }
};
