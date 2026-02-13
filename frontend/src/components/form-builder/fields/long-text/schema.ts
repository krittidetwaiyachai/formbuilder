import { FieldType } from '@/types/enums';
import { FieldWidth, FieldWidthType, LabelAlignment, LabelAlignmentType } from '@/types/field-schema';

export const EditorMode = {
  PLAIN_TEXT: 'PLAIN_TEXT',
  RICH_TEXT: 'RICH_TEXT',
} as const;

export type EditorModeType = keyof typeof EditorMode;

export interface LongTextOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  rows: number;
  editorMode: EditorModeType;
}

export const longTextDefaultValues = {
  type: FieldType.TEXTAREA,
  label: 'Long Text',
  required: false,
  placeholder: '',
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    rows: 4,
    editorMode: EditorMode.PLAIN_TEXT,
  } satisfies LongTextOptions,
  validation: {
    readOnly: false,
    maxLength: 500,
    hasMaxLength: false,
    entryLimits: false,
    minWords: undefined,
    maxWords: undefined,
  }
} as const;
