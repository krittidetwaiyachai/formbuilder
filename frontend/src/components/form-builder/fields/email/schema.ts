import { FieldType } from '@/types';

export const emailDefaultValues = {
  type: FieldType.EMAIL,
  label: 'Email',
  required: false,
  placeholder: 'example@email.com',
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
  },
  validation: {
    readOnly: false,
  }
};
