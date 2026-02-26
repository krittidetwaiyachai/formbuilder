import { FieldType } from "@/types";
import { useTranslation } from "react-i18next";
import { Star, ChevronDown } from "lucide-react";
import { allFields } from "./config";
import { getFieldColorTheme } from "./useSidebarTheme";

export function SidebarDragPreview({
  fieldType,
}: {
  fieldType: (typeof allFields)[0];
}) {
  const Icon = fieldType.icon;
  const theme = getFieldColorTheme(fieldType.type);
  const { t } = useTranslation();

  const renderPreview = () => {
    const commonInput =
      "w-full h-9 bg-white rounded border border-gray-200 px-3 flex items-center text-xs text-gray-400 select-none";
    switch (fieldType.type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.FULLNAME:
        return (
          <div className={commonInput}>{t("builder.sidebar.type_here")}</div>
        );
      case FieldType.ADDRESS:
        return (
          <div className={commonInput}>{t("builder.sidebar.address")}</div>
        );
      case FieldType.NUMBER:
        return <div className={commonInput}>0</div>;
      case FieldType.PHONE:
        return (
          <div className={commonInput + " text-gray-300 tracking-wider"}>
            (555) 000-0000
          </div>
        );
      case FieldType.TEXTAREA:
        return (
          <div className={commonInput}>{t("builder.sidebar.long_text")}</div>
        );
      case FieldType.DROPDOWN:
        return (
          <div className={commonInput + " justify-between"}>
            <span>{t("builder.sidebar.select_option")}</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        );
      case FieldType.DATE:
      case FieldType.TIME:
        return (
          <div className={commonInput + " justify-between"}>
            <span>
              {fieldType.type === FieldType.DATE
                ? t("builder.sidebar.pick_date")
                : t("builder.sidebar.pick_time")}
            </span>
            <Icon className="h-3 w-3" />
          </div>
        );
      case FieldType.RADIO:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 rounded-full border border-gray-300 bg-white shadow-sm"></div>
            <span className="text-xs">{t("builder.sidebar.option_1")}</span>
          </div>
        );
      case FieldType.MATRIX:
        return (
          <div className="space-y-2 opacity-50">
            <div className="flex gap-2">
              <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
              <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
              <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        );
      case FieldType.CHECKBOX:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 rounded border border-gray-300 bg-white shadow-sm"></div>
            <span className="text-xs">{t("builder.sidebar.option_1")}</span>
          </div>
        );
      case FieldType.RATE:
        return (
          <div className="flex gap-1 text-gray-300">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
        );
      case FieldType.HEADER:
        return (
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        );
      case FieldType.PARAGRAPH:
        return (
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 rounded"></div>
            <div className="h-2 w-4/5 bg-gray-200 rounded"></div>
          </div>
        );
      case FieldType.SUBMIT:
        return (
          <div className="w-24 h-9 bg-black rounded-md text-white flex items-center justify-center text-sm font-medium shadow-sm">
            {t("builder.sidebar.submit")}
          </div>
        );
      case FieldType.PAGE_BREAK:
        return (
          <div className="w-full border-b border-dashed border-gray-300 text-center text-[10px] text-gray-400">
            {t("builder.sidebar.page_break")}
          </div>
        );
      default:
        return (
          <div className={commonInput}>
            {t("builder.sidebar.type_field", { type: fieldType.type })}
          </div>
        );
    }
  };

  return (
    <div
      style={{ width: "300px" }}
      className={`bg-white rounded-xl shadow-2xl p-4 border-2 ${theme.border} ring-4 ring-black/5 cursor-grabbing z-[9999] isolate`}
    >
      <div className="flex justify-center mb-3">
        <div className="w-8 h-1 bg-gray-200 rounded-full" />
      </div>
      <div className={`flex items-center gap-2 mb-3 ${theme.text}`}>
        <div className={`p-1.5 rounded-lg ${theme.bg}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="font-bold text-base truncate text-gray-900">
          {fieldType.label}
        </div>
      </div>
      <div>{renderPreview()}</div>
    </div>
  );
}
