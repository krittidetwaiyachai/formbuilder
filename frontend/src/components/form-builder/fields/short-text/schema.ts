import { FieldType } from '@/types';

export const shortTextDefaultValues = {
  type: FieldType.TEXT,
  label: 'Short Text',
  required: false,
  placeholder: '',
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
  },
  validation: {
    hasMaxLength: false,
    maxLength: 100,
    readOnly: false,
  }
};
