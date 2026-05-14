export interface BaseFieldProperties {
  id: string;
  formId: string;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  shrink?: boolean;
  groupId?: string;
  helperText?: string;
  isPII?: boolean;
  imageUrl?: string;
  imageWidth?: string;
  videoUrl?: string;
}
export type FieldOptions = Record<string, unknown>;