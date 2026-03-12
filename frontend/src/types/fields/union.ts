import type { TextField, TextareaField, NumberField, EmailField, PhoneField } from './input';
import type { DropdownField, CheckboxField, RadioField } from './choice';
import type { DateField, TimeField } from './datetime';
import type { HeaderField, ParagraphField, DividerField, SectionCollapseField, PageBreakField, GroupField } from './layout';
import type { RateField, FullNameField, AddressField, SubmitField, MatrixField, TableField, FileField } from './complex';
export type TypedField =
TextField |
TextareaField |
NumberField |
EmailField |
PhoneField |
DropdownField |
CheckboxField |
RadioField |
DateField |
TimeField |
RateField |
HeaderField |
FullNameField |
AddressField |
ParagraphField |
SubmitField |
DividerField |
SectionCollapseField |
PageBreakField |
GroupField |
MatrixField |
TableField |
FileField;