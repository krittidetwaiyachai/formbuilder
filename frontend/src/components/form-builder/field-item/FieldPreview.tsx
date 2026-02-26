import React from "react";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ShortTextField } from "../fields/short-text";
import { EmailField } from "../fields/email";
import { PhoneField } from "../fields/phone/PhoneField";
import { NumberField } from "../fields/number";
import { LongTextField } from "../fields/long-text/LongTextField";
import { DropdownField } from "../fields/dropdown/DropdownField";
import { RadioField } from "../fields/radio/RadioField";
import { DateField } from "../fields/date/DateField";
import { TimeField } from "../fields/time/TimeField";
import { RateField } from "../fields/rate/RateField";
import { HeaderField } from "../fields/header/HeaderField";
import { FullNameField } from "../fields/full-name/FullNameField";
import { AddressField } from "../fields/address/AddressField";
import { ParagraphField } from "../fields/paragraph/ParagraphField";
import { SubmitField } from "../fields/submit/SubmitField";
import { CheckboxField } from "../fields/checkbox/CheckboxField";
import { DividerField } from "../fields/divider/DividerField";
import { GroupField } from "../fields/group/GroupField";
import { MatrixField } from "../fields/matrix/MatrixField";
import { TableField } from "../fields/table/TableField";

interface FieldPreviewProps {
  field: Field;
  fieldStyle: any;
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  isMultiSelecting: boolean;
  allFields: Field[];
  updateField: (id: string, updates: Partial<Field>) => void;
}

export const FieldPreview: React.FC<FieldPreviewProps> = ({
  field,
  fieldStyle,
  isSelected,
  onSelect,
  isMultiSelecting,
  allFields,
  updateField,
}) => {
  const { t } = useTranslation();

  switch (field.type) {
    case FieldType.TEXT:
      return <ShortTextField field={field} fieldStyle={fieldStyle} />;
    case FieldType.TEXTAREA:
      return <LongTextField field={field} fieldStyle={fieldStyle} />;
    case FieldType.NUMBER:
      return <NumberField field={field} fieldStyle={fieldStyle} />;
    case FieldType.EMAIL:
      return <EmailField field={field} fieldStyle={fieldStyle} />;
    case FieldType.PHONE:
      return <PhoneField field={field} fieldStyle={fieldStyle} />;
    case FieldType.DROPDOWN:
      return <DropdownField field={field} fieldStyle={fieldStyle} />;
    case FieldType.CHECKBOX:
      return <CheckboxField field={field} fieldStyle={fieldStyle} />;
    case FieldType.RADIO:
      return <RadioField field={field} fieldStyle={fieldStyle} />;
    case FieldType.DATE:
      return <DateField field={field} fieldStyle={fieldStyle} />;
    case FieldType.TIME:
      return <TimeField field={field} fieldStyle={fieldStyle} />;
    case FieldType.RATE:
      return <RateField field={field} fieldStyle={fieldStyle} />;
    case FieldType.HEADER:
      return (
        <HeaderField
          field={field}
          fieldStyle={fieldStyle}
          isSelected={isSelected}
          onSelect={onSelect}
          isMultiSelecting={isMultiSelecting}
        />
      );
    case FieldType.FULLNAME:
      return <FullNameField field={field} fieldStyle={fieldStyle} />;
    case FieldType.ADDRESS:
      return <AddressField field={field} fieldStyle={fieldStyle} />;
    case FieldType.PARAGRAPH:
      return (
        <ParagraphField
          field={field}
          fieldStyle={fieldStyle}
          isSelected={isSelected}
          onSelect={onSelect}
          isMultiSelecting={isMultiSelecting}
        />
      );
    case FieldType.DIVIDER:
      return <DividerField field={field} fieldStyle={fieldStyle} />;
    case FieldType.SECTION_COLLAPSE:
      return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 font-medium">
          <ChevronRight className="w-5 h-5" />
          <span>{field.label || t("common.collapsible_section")}</span>
        </div>
      );
    case FieldType.SUBMIT:
      return <SubmitField field={field} fieldStyle={fieldStyle} />;
    case FieldType.GROUP:
      const childFields = allFields.filter((f) => f.groupId === field.id);
      return (
        <GroupField
          field={field}
          isSelected={isSelected}
          childFields={childFields}
          allFields={allFields}
          onSelectField={onSelect}
          selectedFieldId={isSelected ? field.id : null}
        />
      );
    case FieldType.MATRIX:
      return (
        <MatrixField
          field={field}
          fieldStyle={fieldStyle}
          isSelected={isSelected}
          updateField={updateField}
        />
      );
    case FieldType.TABLE:
      return (
        <TableField
          field={field}
          isSelected={isSelected}
          updateField={updateField}
        />
      );
    case FieldType.PAGE_BREAK:
      return (
        <div className="flex flex-col items-center justify-center py-4 w-full">
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-500 uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            {t("common.page_break")}
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          </div>
          <div className="w-full border-b-2 border-dashed border-gray-300 mt-4 relative">
            <div className="absolute left-0 -top-1 w-1 h-3 bg-gray-300"></div>
            <div className="absolute right-0 -top-1 w-1 h-3 bg-gray-300"></div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {t("common.content_next_page")}
          </p>
        </div>
      );
    default:
      return null;
  }
};
