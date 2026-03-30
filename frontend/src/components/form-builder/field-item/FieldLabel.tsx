import React, { useRef, useState, useEffect } from "react";
import { FieldType } from "@/types";
import type { Field } from "@/types";
import { useTranslation } from "react-i18next";
import { sanitize } from "@/utils/sanitization";
const RichTextEditor = React.lazy(() =>
import("@/components/ui/RichTextEditor").then((module) => ({
  default: module.RichTextEditor
}))
);
interface FieldLabelProps {
  field: Field;
  isSelected: boolean;
  isMultiSelecting: boolean;
  updateField: (id: string, updates: Partial<Field>) => void;
  onSelect: (id: string, autoFocus?: boolean) => void;
  children?: React.ReactNode;
}
export const FieldLabel: React.FC<FieldLabelProps> = ({
  field,
  isSelected,
  isMultiSelecting,
  updateField,
  onSelect,
  children
}) => {
  const { t } = useTranslation();
  const subLabelRef = useRef<HTMLDivElement>(null);
  const handleRichTextLinkInteraction = (
    event:
      | React.MouseEvent<HTMLElement>
      | React.PointerEvent<HTMLElement>
      | React.KeyboardEvent<HTMLElement>
  ) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest("a")) {
      return;
    }

    event.stopPropagation();
  };
  const [subLabelHtml, setSubLabelHtml] = useState({
    __html:
    sanitize(field.options?.subLabel as string || "") || (
    isSelected ? t("common.sublabel") : "")
  });
  useEffect(() => {
    const currentText = subLabelRef.current?.textContent;
    const newSubLabel =
    field.options?.subLabel as string || (
    isSelected ? t("common.sublabel") : "");
    if (currentText !== newSubLabel) {
      setSubLabelHtml({ __html: sanitize(newSubLabel as string) });
    }
  }, [field.options?.subLabel, isSelected, t]);
  const labelAlignment = field.options?.labelAlignment || "TOP";
  const isRowLayout = labelAlignment === "LEFT" || labelAlignment === "RIGHT";
  const isCenterAligned = labelAlignment === "CENTER";
  return (
    <div className={`${isRowLayout ? "flex items-start gap-6 relative" : ""}`}>      <div
        className={`${isRowLayout ? "w-48 flex-shrink-0 pt-3" : "mb-3"} ${labelAlignment === "RIGHT" ? "text-right" : ""} ${isCenterAligned ? "text-center" : ""}`}>
        <div
          className={`flex flex-col gap-2 ${labelAlignment === "RIGHT" ? "items-end" : isCenterAligned ? "items-center" : "items-start"}`}>
          <div className="w-full relative group/editor">            {isSelected && !isMultiSelecting ?
            <React.Suspense
              fallback={
              <div className="h-6 bg-gray-50 animate-pulse rounded w-full" />
              }>
                <RichTextEditor
                value={field.label || ""}
                onChange={(value) => updateField(field.id, { label: value })}
                placeholder={t("common.question")}
                className={`text-base font-medium text-black leading-tight borderless animate-slide-down min-h-[1.5em] ${labelAlignment === "RIGHT" ? "text-right" : ""} ${isCenterAligned ? "text-center" : ""}`}
                minHeight="auto" />
              </React.Suspense> :
            <div
              className={`flex items-start gap-1 ${labelAlignment === "RIGHT" ? "justify-end" : isCenterAligned ? "justify-center" : ""}`}>
                <div
                className={`rich-text-content font-medium text-black outline-none cursor-text break-words max-w-full ql-editor !p-0 ${labelAlignment === "RIGHT" ? "text-right" : ""} ${isCenterAligned ? "text-center" : ""}`}
                onMouseDownCapture={handleRichTextLinkInteraction}
                onClickCapture={handleRichTextLinkInteraction}
                onPointerDownCapture={handleRichTextLinkInteraction}
                dangerouslySetInnerHTML={{
                  __html: sanitize(field.label || t("common.question"))
                }} />
                {field.required &&
              <span className="text-red-500 select-none -mt-1 text-lg leading-none">                    *              </span>
              }            </div>
            }          </div>        </div>      </div>      <div
        className={`flex-1 min-w-0 w-full max-w-full pb-3 scrollbar-visible ${field.type === FieldType.GROUP ? "overflow-visible" : "overflow-x-auto"}`}>
        {children}        {![
        FieldType.HEADER,
        FieldType.PARAGRAPH,
        FieldType.DIVIDER,
        FieldType.SUBMIT,
        FieldType.PAGE_BREAK,
        FieldType.GROUP,
        FieldType.SECTION_COLLAPSE].
        includes(field.type) && (
        isSelected ||
        field.options?.subLabel as string &&
        field.options?.subLabel as string !== t("common.sublabel") &&
        field.options?.subLabel as string !== "Sublabel") &&
        <div
          ref={subLabelRef}
          contentEditable={isSelected}
          suppressContentEditableWarning
          spellCheck={false}
          className={`text-xs mt-2 outline-none cursor-text w-full break-words min-h-[1.25em] ${field.options?.subLabel as string && field.options?.subLabel as string !== t("common.sublabel") ? "text-gray-500" : "text-gray-300"}`}
          dangerouslySetInnerHTML={subLabelHtml}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isSelected) {
              onSelect(field.id, false);
            }
          }}
          onFocus={(e) => {
            const currentText = e.currentTarget.textContent;
            if (currentText === t("common.sublabel")) {
              e.currentTarget.textContent = "";
            }
          }}
          onInput={(e) => {
            const newText = e.currentTarget.textContent || "";
            updateField(field.id, {
              options: { ...field.options, subLabel: newText }
            });
          }}
          onBlur={(e) => {
            const newText = e.currentTarget.textContent?.trim() || "";
            const valueToSave =
            newText === t("common.sublabel") || !newText ? "" : newText;
            if (valueToSave !== field.options?.subLabel) {
              updateField(field.id, {
                options: { ...field.options, subLabel: valueToSave }
              });
            }
            if (!valueToSave && isSelected) {
              e.currentTarget.textContent = t("common.sublabel");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }} />
        }      </div>    </div>);
};
