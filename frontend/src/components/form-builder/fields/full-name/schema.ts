import { FieldType } from '@/types';

export const fullNameDefaultValues = {
  type: FieldType.FULLNAME,
  label: 'Full Name',
  required: false,
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
    showPrefix: false,
    showMiddleName: false,
    showSuffix: false,
  },
  validation: {
    readOnly: false,
  }
};
