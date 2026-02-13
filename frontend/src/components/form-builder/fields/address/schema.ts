import { FieldType } from '@/types/enums';
import { FieldWidth, FieldWidthType, LabelAlignment, LabelAlignmentType } from '@/types/field-schema';

export interface AddressOptions {
  width: FieldWidthType;
  labelAlignment: LabelAlignmentType;
  defaultCountry: string;
}

export const addressDefaultValues = {
  type: FieldType.ADDRESS,
  label: 'Address',
  required: false,
  options: {
    width: FieldWidth.FULL,
    labelAlignment: LabelAlignment.TOP,
    defaultCountry: 'US',
  } satisfies AddressOptions,
  validation: {
    readOnly: false,
    showStreet: true,
    showStreet2: true,
    showCity: true,
    showState: true,
    showZip: true,
    showCountry: true,
  }
} as const;
