export const FieldWidth = {
    FULL: 'FULL',
    HALF: 'HALF',
    AUTO: 'AUTO',
    FIXED: 'FIXED',
} as const;

export type FieldWidthType = typeof FieldWidth[keyof typeof FieldWidth];

export const LabelAlignment = {
    TOP: 'TOP',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    CENTER: 'CENTER',
} as const;

export type LabelAlignmentType = typeof LabelAlignment[keyof typeof LabelAlignment];
