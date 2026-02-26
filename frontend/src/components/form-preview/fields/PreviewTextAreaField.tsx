import React from "react";
import type { Field, TextareaField, LongTextValidation } from "@/types";
import { useForm, Controller } from "react-hook-form";
import type { FieldErrors, Control, RegisterOptions } from "react-hook-form";
import { FileText } from "lucide-react";
import { PreviewLabel } from "../PreviewLabel";
import { stripHtml } from "@/lib/ui/utils";
import { useTranslation } from "react-i18next";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>["register"];
  control?: Control;
  errors: FieldErrors;
  questionNumber?: number;
  isPublic?: boolean;
  watch?: ReturnType<typeof useForm>["watch"];
  setValue?: ReturnType<typeof useForm>["setValue"];
}

export const PreviewTextAreaField: React.FC<PreviewFieldProps> = ({
  field,
  register,
  control,
  errors,
  questionNumber,
  isPublic,
  watch,
}) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  const typedField = field as TextareaField;

  const options = typedField.options || {};
  const validation = (typedField.validation || {}) as LongTextValidation;
  const {
    labelAlignment = "TOP",
    subLabel,
    width,
    customWidth,
    hoverText,
    readOnly = false,
    defaultValue,
    rows = 4,
    shrink,
    editorMode,
  } = options;
  const { maxLength, minLength, hasEntryLimits } = validation;
  const isRichText = editorMode === "RICH_TEXT";

  const isRowLayout = labelAlignment === "LEFT" || labelAlignment === "RIGHT";

  const validationRules: RegisterOptions = {
    required: field.required
      ? t("public.validation.required_field", { label: stripHtml(field.label) })
      : false,
  };

  if (hasEntryLimits) {
    if (maxLength) {
      validationRules.maxLength = {
        value: maxLength,
        message: t("public.validation.max_length", { count: maxLength }),
      };
    }
    if (minLength) {
      validationRules.minLength = {
        value: minLength,
        message: t("public.validation.min_length", { count: minLength }),
      };
    }
  }

  return (
    <div
      className={`mb-4 w-full ${isRowLayout ? "flex items-start gap-4" : ""}`}
    >
      <div
        className={`${isRowLayout ? "w-40 flex-shrink-0 pt-2" : "mb-3"} ${labelAlignment === "RIGHT" ? "text-right" : ""}`}
      >
        <PreviewLabel
          field={field}
          questionNumber={questionNumber}
          isPublic={isPublic}
          htmlFor={fieldName}
        />
        {subLabel && subLabel !== "Sublabel" && (
          <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="relative group" title={hoverText}>
          {!isPublic && (
            <div className="absolute left-3 top-4 pointer-events-none z-10">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          )}

          {isPublic ? (
            isRichText ? (
              <div
                style={
                  width === "FIXED" && customWidth
                    ? { maxWidth: `${customWidth}px` }
                    : {}
                }
                className="w-full"
              >
                {control ? (
                  <Controller
                    control={control}
                    name={fieldName}
                    defaultValue={defaultValue || ""}
                    rules={validationRules}
                    render={({ field: { onChange, value } }) => (
                      <RichTextEditor
                        value={value}
                        onChange={onChange}
                        readOnly={readOnly}
                        minHeight={rows ? `${rows * 24}px` : "120px"}
                        className={
                          fieldError ? "border-red-500 ring-1 ring-red-500" : ""
                        }
                      />
                    )}
                  />
                ) : (
                  <RichTextEditor
                    value={defaultValue}
                    readOnly={true}
                    minHeight={rows ? `${rows * 24}px` : "120px"}
                  />
                )}
              </div>
            ) : (
              <textarea
                id={fieldName}
                {...register(fieldName, validationRules)}
                placeholder={
                  field.placeholder ||
                  t("public.placeholder.text", "Type your answer here...")
                }
                defaultValue={defaultValue}
                readOnly={readOnly}
                rows={shrink ? Math.max(2, rows - 2) : rows}
                maxLength={hasEntryLimits && maxLength ? maxLength : undefined}
                style={
                  width === "FIXED" && customWidth
                    ? {
                        maxWidth: `${customWidth}px`,
                        color: "var(--text)",
                        backgroundColor: "var(--input-bg)",
                        borderColor: "var(--input-border)",
                      }
                    : {
                        color: "var(--text)",
                        backgroundColor: "var(--input-bg)",
                        borderColor: "var(--input-border)",
                      }
                }
                className={`w-full px-4 ${shrink ? "py-2 text-base" : "py-3 text-base"} border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${
                  fieldError
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${readOnly ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
              />
            )
          ) : (
            <textarea
              id={fieldName}
              {...register(fieldName, validationRules)}
              placeholder={field.placeholder}
              defaultValue={defaultValue}
              readOnly={readOnly}
              rows={rows}
              maxLength={hasEntryLimits && maxLength ? maxLength : undefined}
              style={
                width === "FIXED" && customWidth
                  ? { maxWidth: `${customWidth}px` }
                  : {}
              }
              className={`w-full pl-10 pr-4 py-3 border-2 ${
                fieldError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              } rounded-lg text-black text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${
                readOnly ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
              }`}
            />
          )}
        </div>

        {hasEntryLimits && maxLength && isPublic && !isRichText && (
          <p className="mt-1 text-xs text-gray-400 text-right">
            {t("public.max_characters", { count: maxLength })}
          </p>
        )}

        {fieldError && (
          <p className="mt-1 text-sm text-red-600">
            {fieldError.message as string}
          </p>
        )}
      </div>
    </div>
  );
};
