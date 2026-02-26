import React, { useState } from "react";
import { FieldType } from "@/types";
import type { Field, DateFieldOptions } from "@/types";
import { useForm, Controller } from "react-hook-form";
import type { FieldErrors, Control } from "react-hook-form";
import { Calendar, Clock } from "lucide-react";
import { PreviewLabel } from "../PreviewLabel";
import { MaterialDatePicker } from "@/components/ui/MaterialDatePicker";
import { MaterialTimePicker } from "@/components/ui/MaterialTimePicker";
import type { DateField } from "@/types";

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>["register"];
  control?: Control;
  errors: FieldErrors;
  questionNumber?: number;
  isPublic?: boolean;
}

import { useTranslation } from "react-i18next";
import { stripHtml } from "@/lib/ui/utils";

export const PreviewDateField: React.FC<PreviewFieldProps> = ({
  field,
  register,
  control,
  errors,
  questionNumber,
  isPublic,
}) => {
  const { t, i18n } = useTranslation();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const typedField = field as DateField;
  const validation = field.validation || {};
  const optionsSettings: DateFieldOptions = typedField.options || {};

  const {
    labelAlignment = "TOP",
    hoverText,
    subLabel,
    readOnly,
    hidden,
  } = { ...validation, ...optionsSettings };

  if (hidden) return null;

  const isRowLayout = labelAlignment === "LEFT" || labelAlignment === "RIGHT";

  const renderLabel = () => (
    <div className={`${isRowLayout ? "min-w-[150px]" : "mb-2"}`}>
      <PreviewLabel
        field={field}
        questionNumber={questionNumber}
        isPublic={isPublic}
        htmlFor={fieldName}
      />
      {subLabel && <p className="text-xs text-gray-500 mb-2">{subLabel}</p>}
    </div>
  );

  const getPrimaryColor = () => {
    if (typeof window !== "undefined") {
      const rootStyle = getComputedStyle(document.body);
      const primary = rootStyle.getPropertyValue("--primary").trim();
      if (primary && primary !== "") return primary;
    }
    return "#6366f1";
  };

  if (field.type === FieldType.DATE) {
    return (
      <div
        className={`mb-4 w-full ${isRowLayout ? "flex items-start gap-4" : ""}`}
        title={hoverText}
      >
        {renderLabel()}
        <div className="relative w-full">
          {!isPublic && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Calendar
                className="h-4 w-4"
                style={{ color: "var(--text)", opacity: 0.6 }}
              />
            </div>
          )}

          {control ? (
            <Controller
              control={control}
              name={fieldName}
              rules={{
                required: field.required
                  ? t("public.validation.required_field", {
                      label: stripHtml(field.label),
                    })
                  : false,
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <div
                    onClick={() => !readOnly && setIsDatePickerOpen(true)}
                    className={`w-full ${isPublic ? "px-4" : "pl-10 pr-4"} py-3 border rounded-xl text-sm shadow-sm transition-all hover:border-gray-300 cursor-pointer flex items-center ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-[var(--input-bg)]"}`}
                    style={{
                      borderColor: "var(--input-border)",
                      color: "var(--text)",
                    }}
                  >
                    {value ? (
                      <span>
                        {new Date(value).toLocaleDateString(
                          i18n.language === "th" ? "th-TH" : "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400 opacity-70">
                        {t("common.select_date", "Select date")}
                      </span>
                    )}
                  </div>

                  <MaterialDatePicker
                    isOpen={isDatePickerOpen}
                    onClose={() => setIsDatePickerOpen(false)}
                    selectedDate={value ? new Date(value) : null}
                    onSelect={(date) => {
                      date.setHours(12, 0, 0, 0);
                      onChange(date.toISOString().split("T")[0]);
                    }}
                    themeColor={getPrimaryColor()}
                  />
                </>
              )}
            />
          ) : (
            <input
              type="date"
              id={fieldName}
              readOnly={readOnly}
              {...register(fieldName, {
                required: field.required
                  ? t("public.validation.required_field", {
                      label: stripHtml(field.label),
                    })
                  : false,
              })}
              style={{
                color: "var(--text)",
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                accentColor: "var(--primary)",
                colorScheme: "var(--color-scheme, light)",
              }}
              className={`w-full ${isPublic ? "px-4" : "pl-10 pr-4"} py-3 border rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          )}
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">
              {fieldError?.message as string}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (field.type === FieldType.TIME) {
    return (
      <div
        className={`mb-4 w-full ${isRowLayout ? "flex items-start gap-4" : ""}`}
        title={hoverText}
      >
        {renderLabel()}
        <div className="relative w-full">
          {!isPublic && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Clock
                className="h-4 w-4"
                style={{ color: "var(--text)", opacity: 0.6 }}
              />
            </div>
          )}

          {control ? (
            <Controller
              control={control}
              name={fieldName}
              rules={{
                required: field.required
                  ? t("public.validation.required_field", {
                      label: stripHtml(field.label),
                    })
                  : false,
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <div
                    onClick={() => !readOnly && setIsTimePickerOpen(true)}
                    className={`w-full ${isPublic ? "px-4" : "pl-10 pr-4"} py-3 border rounded-xl text-sm shadow-sm transition-all hover:border-gray-300 cursor-pointer flex items-center ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-[var(--input-bg)]"}`}
                    style={{
                      borderColor: "var(--input-border)",
                      color: "var(--text)",
                    }}
                  >
                    {value ? (
                      <span>{value}</span>
                    ) : (
                      <span className="text-gray-400 opacity-70">
                        {t("common.select_time", "Select time")}
                      </span>
                    )}
                  </div>

                  <MaterialTimePicker
                    isOpen={isTimePickerOpen}
                    onClose={() => setIsTimePickerOpen(false)}
                    selectedTime={value}
                    onSelect={(time) => {
                      onChange(time);
                    }}
                    themeColor={getPrimaryColor()}
                  />
                </>
              )}
            />
          ) : (
            <input
              type="time"
              id={fieldName}
              readOnly={readOnly}
              {...register(fieldName, {
                required: field.required
                  ? t("public.validation.required_field", {
                      label: stripHtml(field.label),
                    })
                  : false,
              })}
              style={{
                color: "var(--text)",
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
              }}
              className={`w-full ${isPublic ? "px-4" : "pl-10 pr-4"} py-3 border rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          )}
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">
              {fieldError?.message as string}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};
