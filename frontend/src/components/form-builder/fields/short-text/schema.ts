import { FieldType } from '@/types';

export const shortTextDefaultValues = {
  type: FieldType.TEXT,
  label: 'Short Text',
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
    maxLength: 100,
    hasMaxLength: false,
  }
};
