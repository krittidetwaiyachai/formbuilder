import { FieldType } from '@/types/enums';

export const HeaderSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
} as const;

export type HeaderSizeType = keyof typeof HeaderSize;

export const HeaderAlign = {
  LEFT: 'LEFT',
  CENTER: 'CENTER',
  RIGHT: 'RIGHT',
} as const;

export type HeaderAlignType = keyof typeof HeaderAlign;

export interface HeaderOptions {
  text: string;
  subText: string;
  size: HeaderSizeType;
  align: HeaderAlignType;
  showImage: boolean;
}

export const headerDefaultValues = {
  type: FieldType.HEADER,
  label: 'Header',
  required: false,
  options: {
    text: 'Form Header',
    subText: 'Description goes here',
    size: HeaderSize.LARGE,
    align: HeaderAlign.LEFT,
    showImage: false,
  } satisfies HeaderOptions,
  validation: {
    readOnly: true,
  }
} as const;
