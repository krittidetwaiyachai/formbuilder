import { FieldType } from '@/types/enums';
import { FieldWidth, FieldWidthType, LabelAlignment, LabelAlignmentType } from '@/types/field-schema';

export const RateIcon = {
  STAR: 'STAR',
  HEART: 'HEART',
  THUMB: 'THUMB',
} as const;

export type RateIconType = typeof RateIcon[keyof typeof RateIcon];

export interface RateOptions {
  scale: number;
  icon: RateIconType;
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
}

export const rateDefaultValues = {
  type: FieldType.RATE,
  label: 'Rating',
  required: false,
  options: {
    scale: 5,
    icon: RateIcon.STAR,
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
  } satisfies RateOptions,
  validation: {
    readOnly: false,
  },
} as const;
