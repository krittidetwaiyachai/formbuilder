import { FieldType } from '@/types';

export const dateDefaultValues = {
  type: FieldType.DATE,
  label: 'Date',
  required: false,
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    showTime: false,
  },
  validation: {
    readOnly: false,
  }
};
