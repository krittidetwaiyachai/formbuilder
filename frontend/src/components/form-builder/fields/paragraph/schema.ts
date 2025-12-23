import { FieldType } from '@/types';

export const paragraphDefaultValues = {
  type: FieldType.PARAGRAPH,
  label: 'Paragraph',
  required: false,
  options: {
    text: 'Enter your text here...',
    size: 'MEDIUM',
    align: 'LEFT',
  },
  validation: {
    readOnly: true,
  }
};
