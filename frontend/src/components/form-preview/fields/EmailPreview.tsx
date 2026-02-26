import React from "react";
import type {
  Field,
  EmailField,
  EmailFieldOptions,
  EmailValidation,
} from "@/types";
import { useForm } from "react-hook-form";
import type { FieldErrors, RegisterOptions } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { PreviewLabel } from "../PreviewLabel";
import { stripHtml } from "@/lib/ui/utils";

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>["register"];
  errors: FieldErrors;
  questionNumber?: number;
  isPublic?: boolean;
}

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "icloud.com",
  "live.com",
  "msn.com",
];

export const EmailPreview: React.FC<PreviewFieldProps> = ({
  field,
  register,
  errors,
  questionNumber,
  isPublic,
}) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  const typedField = field as EmailField;

  const options = (typedField.options || {}) as EmailFieldOptions;
  const validation = (field.validation || {}) as EmailValidation;
  const {
    labelAlignment = "TOP",
    subLabel,
    width,
    customWidth,
    hoverText,
    readOnly,
    defaultValue,
    shrink,
  } = options;
  const { maxLength, hasMaxLength, disallowFree, confirmation } = validation;

  const isRowLayout = labelAlignment === "LEFT" || labelAlignment === "RIGHT";

  const validationRules: RegisterOptions = {
    required: field.required
      ? (t("public.validation.required_field", {
          label: stripHtml(field.label),
        }) as string)
      : false,
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: t(
        "public.validation.invalid_email",
        "Invalid email address",
      ) as string,
    },
  };

  if (hasMaxLength && maxLength) {
    validationRules.maxLength = {
      value: maxLength as unknown as number,
      message: t("public.validation.max_length", {
        count: Number(maxLength),
      }) as string,
    };
  }

  if (disallowFree) {
    validationRules.validate = {
      ...validationRules.validate,
      noFreeEmail: (value: string) => {
        if (!value) return true;
        const domain = value.split("@")[1]?.toLowerCase();
        if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
          return t(
            "public.validation.business_email",
            "Please use a business/work email address",
          ) as string;
        }
        return true;
      },
    };
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

      <div className={`flex-1 min-w-0`}>
        <div className="relative group" title={hoverText}>
          {!isPublic && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
          )}
          {isPublic ? (
            <input
              type="email"
              id={fieldName}
              {...register(fieldName, validationRules)}
              placeholder={
                field.placeholder ||
                t("public.placeholder.email", "email@example.com")
              }
              defaultValue={defaultValue as string}
              readOnly={readOnly}
              maxLength={
                hasMaxLength ? (maxLength as unknown as number) : undefined
              }
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
              className={`w-full px-4 ${shrink ? "py-2 text-base" : "py-3 text-base"} border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                fieldError
                  ? "border-red-500 bg-red-50/10"
                  : "hover:border-primary/50"
              } ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
            />
          ) : (
            <input
              type="email"
              id={fieldName}
              {...register(fieldName, validationRules)}
              placeholder={field.placeholder as string}
              defaultValue={defaultValue as string}
              readOnly={readOnly}
              maxLength={
                hasMaxLength ? (maxLength as unknown as number) : undefined
              }
              style={
                width === "FIXED" && customWidth
                  ? { maxWidth: `${customWidth}px` }
                  : {}
              }
              className={`w-full pl-10 pr-4 py-3 border-2 ${
                fieldError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-white"
              } rounded-lg text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${
                readOnly ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
              }`}
            />
          )}
        </div>

        {confirmation && isPublic && (
          <div className="mt-4">
            <label
              htmlFor={`${fieldName}_confirm`}
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text)" }}
            >
              {t("public.validation.confirm_email_label", "Confirm Email")}
            </label>
            <input
              type="email"
              id={`${fieldName}_confirm`}
              {...register(`${fieldName}_confirm`, {
                required: field.required
                  ? (t("public.validation.required_field", {
                      label: t("public.validation.confirm_email_label"),
                    }) as string)
                  : false,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t("public.validation.pattern_mismatch") as string,
                },
                maxLength: field.validation?.maxLength
                  ? {
                      value: field.validation.maxLength as unknown as number,
                      message: t("public.validation.max_length", {
                        count: Number(field.validation.maxLength),
                      }) as string,
                    }
                  : undefined,
                minLength: field.validation?.minLength
                  ? {
                      value: field.validation.minLength as unknown as number,
                      message: t("public.validation.min_length", {
                        count: Number(field.validation.minLength),
                      }) as string,
                    }
                  : undefined,
                validate: (
                  value: string,
                  formValues: Record<string, unknown>,
                ) => {
                  if (value !== formValues[fieldName]) {
                    return t(
                      "public.validation.emails_not_match",
                      "Emails do not match",
                    );
                  }
                  return true;
                },
              })}
              placeholder={
                field.placeholder
                  ? (field.placeholder as string)
                  : t(
                      "public.validation.confirm_email_placeholder",
                      "Confirm your email",
                    )
              }
              defaultValue={defaultValue as string}
              style={{ color: "var(--text)", backgroundColor: "transparent" }}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors[`${fieldName}_confirm`] ? "border-red-300" : ""
              }`}
            />
            {errors[`${fieldName}_confirm`] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[`${fieldName}_confirm`]?.message as string}
              </p>
            )}
          </div>
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
