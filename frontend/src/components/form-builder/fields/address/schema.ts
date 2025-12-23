import { FieldType } from '@/types';

export const addressDefaultValues = {
  type: FieldType.ADDRESS,
  label: 'Address',
  required: false,
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
    defaultCountry: 'US',
  },
  validation: {
    readOnly: false,
    showStreet: true,
    showStreet2: true,
    showCity: true,
    showState: true,
    showZip: true,
    showCountry: true,
  }
};
