import { FieldType } from '../enums';
import type { TypedField } from './union';
import type { TextField, TextareaField, NumberField, EmailField, PhoneField } from './input';
import type { DropdownField, CheckboxField, RadioField } from './choice';
import type { DateField, TimeField } from './datetime';
import type { HeaderField, ParagraphField, DividerField, SectionCollapseField, PageBreakField, GroupField } from './layout';
import type { RateField, FullNameField, AddressField, SubmitField, MatrixField, TableField, FileField } from './complex';
export function isTextField(field: TypedField): field is TextField {
  return field.type === FieldType.TEXT;
}
export function isTextareaField(field: TypedField): field is TextareaField {
  return field.type === FieldType.TEXTAREA;
}
export function isNumberField(field: TypedField): field is NumberField {
  return field.type === FieldType.NUMBER;
}
export function isEmailField(field: TypedField): field is EmailField {
  return field.type === FieldType.EMAIL;
}
export function isPhoneField(field: TypedField): field is PhoneField {
  return field.type === FieldType.PHONE;
}
export function isDropdownField(field: TypedField): field is DropdownField {
  return field.type === FieldType.DROPDOWN;
}
export function isCheckboxField(field: TypedField): field is CheckboxField {
  return field.type === FieldType.CHECKBOX;
}
export function isRadioField(field: TypedField): field is RadioField {
  return field.type === FieldType.RADIO;
}
export function isDateField(field: TypedField): field is DateField {
  return field.type === FieldType.DATE;
}
export function isTimeField(field: TypedField): field is TimeField {
  return field.type === FieldType.TIME;
}
export function isRateField(field: TypedField): field is RateField {
  return field.type === FieldType.RATE;
}
export function isHeaderField(field: TypedField): field is HeaderField {
  return field.type === FieldType.HEADER;
}
export function isFullNameField(field: TypedField): field is FullNameField {
  return field.type === FieldType.FULLNAME;
}
export function isAddressField(field: TypedField): field is AddressField {
  return field.type === FieldType.ADDRESS;
}
export function isParagraphField(field: TypedField): field is ParagraphField {
  return field.type === FieldType.PARAGRAPH;
}
export function isSubmitField(field: TypedField): field is SubmitField {
  return field.type === FieldType.SUBMIT;
}
export function isDividerField(field: TypedField): field is DividerField {
  return field.type === FieldType.DIVIDER;
}
export function isSectionCollapseField(field: TypedField): field is SectionCollapseField {
  return field.type === FieldType.SECTION_COLLAPSE;
}
export function isPageBreakField(field: TypedField): field is PageBreakField {
  return field.type === FieldType.PAGE_BREAK;
}
export function isGroupField(field: TypedField): field is GroupField {
  return field.type === FieldType.GROUP;
}
export function isMatrixField(field: TypedField): field is MatrixField {
  return field.type === FieldType.MATRIX;
}
export function isTableField(field: TypedField): field is TableField {
  return field.type === FieldType.TABLE;
}
export function isFileField(field: TypedField): field is FileField {
  return field.type === FieldType.FILE;
}
export function hasArrayOptions(field: TypedField): field is DropdownField | RadioField {
  return field.type === FieldType.DROPDOWN || field.type === FieldType.RADIO;
}
export function hasCheckboxOptions(field: TypedField): field is CheckboxField {
  return field.type === FieldType.CHECKBOX;
}