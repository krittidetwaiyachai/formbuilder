import { FieldType } from '@/types';

export const timeDefaultValues = {
  type: FieldType.TIME,
  label: 'Time',
  required: false,
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
    timeFormat: '12',
  },
  validation: {
    readOnly: false,
  }
};
