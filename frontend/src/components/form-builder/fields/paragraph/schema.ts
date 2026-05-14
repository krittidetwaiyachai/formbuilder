import { FieldType } from '@/types/enums';
export const ParagraphSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
} as const;
export type ParagraphSizeType = keyof typeof ParagraphSize;
export const ParagraphAlign = {
  LEFT: 'LEFT',
  CENTER: 'CENTER',
  RIGHT: 'RIGHT',
  JUSTIFY: 'JUSTIFY'
} as const;
export type ParagraphAlignType = keyof typeof ParagraphAlign;
export interface ParagraphOptions {
  text: string;
  size: ParagraphSizeType;
  align: ParagraphAlignType;
}
export const paragraphDefaultValues = {
  type: FieldType.PARAGRAPH,
  label: 'Paragraph',
  required: false,
  options: {
    text: 'Enter your text here...',
    size: ParagraphSize.MEDIUM,
    align: ParagraphAlign.LEFT
  } satisfies ParagraphOptions,
  validation: {
    readOnly: true
  }
} as const;