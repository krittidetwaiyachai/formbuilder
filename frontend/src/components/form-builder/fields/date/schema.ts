import { FieldType } from '@/types/enums';
import { FieldWidth, LabelAlignment } from '@/types/field-schema';
import type { FieldWidthType, LabelAlignmentType } from '@/types/field-schema';
export const DateFormat = {
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'YYYY/MM/DD': 'YYYY/MM/DD'
} as const;
export type DateFormatType = keyof typeof DateFormat;
export const TimeFormat = {
  '12': '12',
  '24': '24'
} as const;
export type TimeFormatType = keyof typeof TimeFormat;
export interface DateOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  dateFormat: DateFormatType;
  timeFormat: TimeFormatType;
  showTime: boolean;
}
export const dateDefaultValues = {
  type: FieldType.DATE,
  label: 'Date',
  required: false,
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    dateFormat: DateFormat['MM/DD/YYYY'],
    timeFormat: TimeFormat['12'],
    showTime: false
  } satisfies DateOptions,
  validation: {
    readOnly: false
  }
} as const;