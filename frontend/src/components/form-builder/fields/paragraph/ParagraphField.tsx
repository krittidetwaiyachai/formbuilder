import React from "react";
import type { Field } from "@/types";
import { useFormStore } from "@/store/formStore";
import { sanitize } from "@/utils/sanitization";
import { useTranslation } from "react-i18next";
const RichTextEditor = React.lazy(() =>
import("@/components/ui/RichTextEditor").then((m) => ({
  default: m.RichTextEditor
}))
);
interface ParagraphFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    iconColor: string;
    bgGradient: string;
    inputBorder: string;
    overlayBorder: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string, autoFocus?: boolean) => void;
  isMultiSelecting?: boolean;
}
export const ParagraphField: React.FC<ParagraphFieldProps> = ({
  field,
  isSelected = false,
  onSelect,
  isMultiSelecting = false
}) => {
  const { t } = useTranslation();
  const updateField = useFormStore((state) => state.updateField);
  const htmlContent = {
    __html: sanitize(field.label || t("builder.header.paragraph_edit"))
  };
  return (
    <div
      className={`relative w-full transition-all duration-200 group overflow-visible
        ${isSelected ? "" : "border-transparent hover:border-gray-200"}
        ${isSelected ? "cursor-default" : "cursor-pointer"}
        rounded-lg
      `}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect && !isSelected) {
          onSelect(field.id);
        }
      }}>
      {isSelected && !isMultiSelecting ?
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}>
          <React.Suspense
          fallback={
          <div className="h-24 bg-gray-50 animate-pulse rounded-md" />
          }>
            <RichTextEditor
            value={field.label}
            onChange={(value) => updateField(field.id, { label: value })}
            placeholder={t("builder.header.paragraph_edit")}
            className="text-sm text-black leading-relaxed"
            minHeight="80px" />
          </React.Suspense>        </div> :
      <div
        className="text-sm text-black leading-relaxed outline-none min-h-[1.5em] prose prose-sm max-w-none"
        dangerouslySetInnerHTML={htmlContent} />
      }    </div>);
};