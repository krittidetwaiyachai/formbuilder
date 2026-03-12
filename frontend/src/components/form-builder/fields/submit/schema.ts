import { FieldType } from '@/types/enums';
import { FieldWidth } from '@/types/field-schema';
import type { FieldWidthType } from '@/types/field-schema';
export const ButtonPosition = {
  LEFT: 'LEFT',
  CENTER: 'CENTER',
  RIGHT: 'RIGHT'
} as const;
export type ButtonPositionType = keyof typeof ButtonPosition;
export interface SubmitOptions {
  buttonText: string;
  width: FieldWidthType;
  position: ButtonPositionType;
}
export const submitDefaultValues = {
  type: FieldType.SUBMIT,
  label: 'Submit',
  required: true,
  options: {
    buttonText: 'Submit',
    width: FieldWidth.FULL,
    position: ButtonPosition.CENTER
  } satisfies SubmitOptions,
  validation: {
    readOnly: true
  }
} as const;