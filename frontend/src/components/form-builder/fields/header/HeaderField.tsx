import React, { useRef } from "react";
import { FieldType } from "@/types";
import type { Field, HeaderFieldOptions } from "@/types";
import { useFormStore } from "@/store/formStore";
import { ChevronRight, FileX } from "lucide-react";
import { sanitize } from "@/utils/sanitization";
import { useTranslation } from "react-i18next";
const RichTextEditor = React.lazy(() =>
import("@/components/ui/RichTextEditor").then((m) => ({
  default: m.RichTextEditor
}))
);
interface HeaderFieldProps {
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
export const HeaderField: React.FC<HeaderFieldProps> = ({
  field,
  isSelected = false,
  onSelect,
  isMultiSelecting = false
}) => {
  const { t } = useTranslation();
  const updateField = useFormStore((state) => state.updateField);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  if (field.type === FieldType.PARAGRAPH) {
    return (
      <div className="max-w-2xl pointer-events-none">        <p className="text-gray-700 text-sm leading-relaxed">          {field.placeholder || t("builder.header.paragraph_default")}        </p>      </div>);
  }
  if (field.type === FieldType.SUBMIT) {
    return (
      <div className="flex justify-center pointer-events-none">        <button
          type="button"
          disabled
          className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
          {field.label || t("builder.submit.default_label")}        </button>      </div>);
  }
  if (field.type === FieldType.DIVIDER) {
    return (
      <div className="py-4 pointer-events-none">        <hr className="border-t-2 border-gray-300" />      </div>);
  }
  if (field.type === FieldType.SECTION_COLLAPSE) {
    return (
      <div className="border-2 border-gray-300 rounded-lg p-4 max-w-md pointer-events-none">        <div className="flex items-center justify-between cursor-pointer">          <h3 className="font-semibold text-black">            {field.label || t("builder.header.section_title")}          </h3>          <ChevronRight className="h-5 w-5 text-gray-400" />        </div>        <p className="text-sm text-gray-600 mt-2">          {t("builder.header.section_desc")}        </p>      </div>);
  }
  if (field.type === FieldType.PAGE_BREAK) {
    return (
      <div className="py-8 border-t-2 border-dashed border-gray-400 pointer-events-none">        <div className="flex items-center justify-center gap-2 text-gray-500">          <FileX className="h-5 w-5" />          <span className="text-sm font-medium">            {t("builder.header.page_break")}          </span>        </div>      </div>);
  }
  const headerProps = (field.options || {}) as HeaderFieldOptions;
  const headerAlignment = headerProps.alignment || "LEFT";
  const headerSize = headerProps.size || "MEDIUM";
  const headerSubheading = field.placeholder && field.placeholder.length > 0;
  const headingImage = headerProps.headingImage as string || null;
  const imagePosition = headerProps.imagePosition as string || "TOP";
  const hasBackgroundImage = headingImage && imagePosition === "BACKGROUND";
  const overlayOpacity = headerProps.overlayOpacity as number ?? 50;
  const getHeaderSizeClass = () => {
    switch (headerSize) {
      case "SMALL":
        return "text-xl";
      case "LARGE":
        return "text-4xl";
      default:
        return "text-2xl";
    }
  };
  const getHeaderAlignmentClass = () => {
    switch (headerAlignment) {
      case "CENTER":
        return "text-center";
      case "RIGHT":
        return "text-right";
      default:
        return "text-left";
    }
  };
  return (
    <div
      ref={headerContainerRef}
      className={`relative w-full transition-all duration-200 group
        ${isSelected ? "" : "border-transparent hover:border-gray-200"}
        ${isSelected ? "cursor-default" : "cursor-pointer"}
        ${hasBackgroundImage ? "overflow-hidden rounded-lg min-h-[200px]" : "overflow-visible rounded-lg"}
      `}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) {
          onSelect(field.id);
        }
      }}>
      {hasBackgroundImage &&
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${headingImage})` }}>
          <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`
          }} />
        </div>
      }      <div
        className={
        hasBackgroundImage ?
        `relative z-10 p-8 flex flex-col justify-center h-full min-h-80 ${
        headerAlignment === "CENTER" ?
        "items-center" :
        headerAlignment === "RIGHT" ?
        "items-end" :
        "items-start"}` :
        ""
        }>
        {isSelected && !isMultiSelecting ?
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full">
            <React.Suspense
            fallback={
            <div className="h-12 bg-gray-50 animate-pulse rounded-md" />
            }>
              <RichTextEditor
              value={field.label || t("builder.header.default_heading")}
              onChange={(value) => updateField(field.id, { label: value })}
              placeholder={t("builder.header.default_heading")}
              className={`${getHeaderSizeClass()} ${getHeaderAlignmentClass()} text-gray-900 leading-tight tracking-tight`}
              minHeight="50px" />
            </React.Suspense>          </div> :
        <h2
          className={`${getHeaderSizeClass()} ${getHeaderAlignmentClass()} text-gray-900 leading-tight tracking-tight break-words break-all prose max-w-none`}
          dangerouslySetInnerHTML={{
            __html: sanitize(
              field.label || t("builder.header.default_heading")
            )
          }} />
        }        {(headerSubheading || isSelected) &&
        <div className="mt-3 w-full">            {isSelected && !isMultiSelecting ?
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}>
                <React.Suspense
              fallback={
              <div className="h-8 bg-gray-50 animate-pulse rounded-md" />
              }>
                  <RichTextEditor
                value={field.placeholder || ""}
                onChange={(value) =>
                updateField(field.id, { placeholder: value })
                }
                placeholder={t("builder.header.subheading_placeholder")}
                className="text-gray-500 text-lg"
                minHeight="40px" />
                </React.Suspense>              </div> :
          <div
            className={`text-base text-gray-500 ${getHeaderAlignmentClass()} font-light prose max-w-none`}
            dangerouslySetInnerHTML={{
              __html: sanitize(field.placeholder || "")
            }} />
          }          </div>
        }        {headingImage &&
        headingImage.startsWith("http") &&
        imagePosition !== "BACKGROUND" &&
        <div
          className={`mt-6 ${
          imagePosition === "CENTER" ?
          "flex justify-center" :
          imagePosition === "RIGHT" ?
          "flex justify-end" :
          "flex justify-start"}`
          }>
              <img
            src={headingImage}
            alt="Heading"
            className="max-w-full h-auto rounded-xl shadow-lg object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }} />
            </div>
        }      </div>    </div>);
};