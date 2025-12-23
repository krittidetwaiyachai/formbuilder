import { FieldType } from '@/types';

export const submitDefaultValues = {
  type: FieldType.SUBMIT,
  label: 'Submit',
  required: true,
  options: {
    buttonText: 'Submit',
    width: 'FULL',
    position: 'CENTER',
  },
  validation: {
    readOnly: true,
  }
};
