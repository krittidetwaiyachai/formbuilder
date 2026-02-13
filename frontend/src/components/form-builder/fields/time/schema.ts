import { FieldType } from '@/types/enums';
import { FieldWidth, FieldWidthType, LabelAlignment, LabelAlignmentType } from '@/types/field-schema';

export const TimeFormat = {
  '12': '12',
  '24': '24',
} as const;

export type TimeFormatType = keyof typeof TimeFormat;

export interface TimeOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  timeFormat: TimeFormatType;
}

export const timeDefaultValues = {
  type: FieldType.TIME,
  label: 'Time',
  required: false,
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    timeFormat: TimeFormat['12'],
  } satisfies TimeOptions,
  validation: {
    readOnly: false,
  }
} as const;
