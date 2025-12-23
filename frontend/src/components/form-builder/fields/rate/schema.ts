import { FieldType } from '@/types';

export const rateDefaultValues = {
  type: FieldType.RATE,
  label: 'Rating',
  required: false,
  options: {
    scale: 5,
    icon: 'STAR', // STAR, HEART, THUMB
    width: 'FULL',
    labelAlignment: 'TOP',
  },
  validation: {
    readOnly: false,
  }
};
