import { FieldType } from '@/types';

export const headerDefaultValues = {
  type: FieldType.HEADER,
  label: 'Header',
  required: false,
  options: {
    text: 'Form Header',
    subText: 'Description goes here',
    size: 'LARGE',
    align: 'LEFT',
    showImage: false,
  },
  validation: {
    readOnly: true,
  }
};
