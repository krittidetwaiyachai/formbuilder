import React from "react";
import { FieldType } from "@/types";
import { useTranslation } from "react-i18next";
import { Star, ChevronDown } from "lucide-react";
import { allFields } from "./config";
import { getFieldColorTheme } from "./useSidebarTheme";
interface FieldDragPreviewCardProps {
  fieldType: (typeof allFields)[0];
  title: string;
  badgeLabel?: string;
  width?: number | string;
  lightweight?: boolean;
  children: React.ReactNode;
}
export function FieldDragPreviewCard({
  fieldType,
  title,
  badgeLabel,
  width = 280,
  lightweight = false,
  children
}: FieldDragPreviewCardProps) {
  const Icon = fieldType.icon;
  const theme = getFieldColorTheme(fieldType.type);
  return (
    <div
      style={{ width }}
      className={`pointer-events-none isolate overflow-hidden rounded-[18px] border p-3 ring-1 ${
      lightweight ?
      "border-slate-200 bg-white shadow-[0_12px_28px_-20px_rgba(15,23,42,0.22)] ring-slate-900/5" :
      "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_22px_50px_-30px_rgba(15,23,42,0.35)] ring-slate-900/5 backdrop-blur-md"}`
      }>
      <div className="mb-2.5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-slate-200/90" />
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 ${theme.bg} shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)]`}>
              <Icon className={`h-4 w-4 ${theme.text}`} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900">
                {title}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="inline-flex max-w-full items-center rounded-full border border-slate-200/80 bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <span className="truncate">{badgeLabel || fieldType.label}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`rounded-[16px] border p-3 ${
        lightweight ?
        "border-slate-200 bg-white shadow-[0_10px_18px_-18px_rgba(15,23,42,0.2)]" :
        "border-slate-200/80 bg-white/90 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.35)]"}`
        }>
        {children}
      </div>
    </div>);
}
export function SidebarDragPreview({
  fieldType,
  lightweight = false
}: {fieldType: (typeof allFields)[0];lightweight?: boolean;}) {
  const { t } = useTranslation();
  const PreviewIcon = fieldType.icon;
  const renderPreview = () => {
    const commonInput =
    "flex w-full items-center rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,#FFFFFF,#F8FAFC)] px-3 text-xs font-medium text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] select-none";
    switch (fieldType.type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.FULLNAME:
        return (
          <div className={`${commonInput} h-11`}>
            {t("builder.sidebar.type_here")}
          </div>);
      case FieldType.ADDRESS:
        return (
          <div className={`${commonInput} h-11`}>
            {t("builder.sidebar.address")}
          </div>);
      case FieldType.NUMBER:
        return <div className={`${commonInput} h-11`}>0</div>;
      case FieldType.PHONE:
        return (
          <div className={`${commonInput} h-11 text-slate-300 tracking-wider`}>
            (555) 000-0000
          </div>);
      case FieldType.TEXTAREA:
        return (
          <div className={`${commonInput} h-20 items-start pt-3`}>
            {t("builder.sidebar.long_text")}
          </div>);
      case FieldType.DROPDOWN:
        return (
          <div className={`${commonInput} h-11 justify-between`}>
            <span>{t("builder.sidebar.select_option")}</span>
            <ChevronDown className="h-3 w-3" />
          </div>);
      case FieldType.DATE:
      case FieldType.TIME:
        return (
          <div className={`${commonInput} h-11 justify-between`}>
            <span>
              {fieldType.type === FieldType.DATE ?
              t("builder.sidebar.pick_date") :
              t("builder.sidebar.pick_time")}
            </span>
            <PreviewIcon className="h-3 w-3" />
          </div>);
      case FieldType.RADIO:
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <div className="h-4 w-4 rounded-full border border-slate-300 bg-white shadow-sm" />
            <span className="text-xs">{t("builder.sidebar.option_1")}</span>
          </div>);
      case FieldType.MATRIX:
        return (
          <div className="space-y-2 opacity-60">
            <div className="flex gap-2">
              <div className="h-2 w-1/4 rounded bg-slate-200" />
              <div className="h-2 w-1/4 rounded bg-slate-200" />
              <div className="h-2 w-1/4 rounded bg-slate-200" />
            </div>
          </div>);
      case FieldType.CHECKBOX:
        return (
          <div className="flex items-center gap-2 text-slate-500">
            <div className="h-4 w-4 rounded border border-slate-300 bg-white shadow-sm" />
            <span className="text-xs">{t("builder.sidebar.option_1")}</span>
          </div>);
      case FieldType.RATE:
        return (
          <div className="flex gap-1 text-amber-300">
            {[1, 2, 3, 4, 5].map((i) =>
            <Star key={i} className="h-5 w-5 fill-current" />
            )}
          </div>);
      case FieldType.HEADER:
        return <div className="h-6 w-3/4 rounded-full bg-slate-200/90" />;
      case FieldType.PARAGRAPH:
        return (
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-slate-200/90" />
            <div className="h-2 w-4/5 rounded-full bg-slate-200/90" />
          </div>);
      case FieldType.SUBMIT:
        return (
          <div className="flex h-10 w-28 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.85)]">
            {t("builder.sidebar.submit")}
          </div>);
      case FieldType.PAGE_BREAK:
        return (
          <div className="w-full border-b border-dashed border-slate-300 pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {t("builder.sidebar.page_break")}
          </div>);
      default:
        return (
          <div className={`${commonInput} h-11`}>
            {t("builder.sidebar.type_field", { type: fieldType.type })}
          </div>);
    }
  };
  return (
    <FieldDragPreviewCard
      fieldType={fieldType}
      title={fieldType.label}
      badgeLabel={fieldType.type.replace(/_/g, " ")}
      width={272}
      lightweight={lightweight}>
      <div className="space-y-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Preview
        </div>
        {renderPreview()}
      </div>
    </FieldDragPreviewCard>);
}