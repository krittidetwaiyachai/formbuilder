import { FieldType } from '@/types';

export const longTextDefaultValues = {
  type: FieldType.TEXTAREA,
  label: 'Long Text',
  required: false,
  placeholder: '',
  options: {
    width: 'FULL',
    labelAlignment: 'TOP',
    rows: 4,
    editorMode: 'PLAIN_TEXT',
  },
  validation: {
    readOnly: false,
    maxLength: 500,
    hasMaxLength: false,
    entryLimits: false,
    minWords: undefined,
    maxWords: undefined,
  }
};
