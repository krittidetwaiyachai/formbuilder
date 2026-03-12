import React, { useState, useEffect } from "react";
import type { Field, RateField, RateFieldOptions } from "@/types";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { Star, Heart, Shield, Zap, Flag, ThumbsUp, Smile } from "lucide-react";
import { PreviewLabel } from "../PreviewLabel";
import { stripHtml } from "@/lib/ui/utils";
import { useTranslation } from "react-i18next";
interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>["register"];
  errors: FieldErrors;
  watch: ReturnType<typeof useForm>["watch"];
  setValue: ReturnType<typeof useForm>["setValue"];
  questionNumber?: number;
  isPublic?: boolean;
}
export const PreviewRateField: React.FC<PreviewFieldProps> = ({
  field,
  register,
  errors,
  watch,
  setValue,
  questionNumber,
  isPublic
}) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  const typedField = field as RateField;
  const options: RateFieldOptions = typedField.options || {};
  const maxRating = options.maxRating || 5;
  const iconType = options.icon || "star";
  const normalizedIcon = iconType.toLowerCase();
  const labelAlignment = options.labelAlignment || "TOP";
  const hoverText = options.hoverText;
  const readOnly = options.readOnly;
  const subLabel = options.subLabel;
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const fieldValue = watch(fieldName);
  useEffect(() => {
    if (fieldValue) {
      setRating(Number(fieldValue));
    } else if (options.defaultValue) {
      setRating(options.defaultValue);
      setValue(fieldName, options.defaultValue.toString());
    }
  }, [fieldValue, options.defaultValue, setValue, fieldName]);
  const getIcon = (idx: number) => {
    const currentRating = hoverRating !== null ? hoverRating : rating;
    const isFilled = (currentRating || 0) >= idx;
    const IconComponent =
    (
    {
      star: Star,
      heart: Heart,
      shield: Shield,
      zap: Zap,
      flag: Flag,
      thumbsup: ThumbsUp,
      thumb: ThumbsUp,
      smile: Smile
    } as Record<string, any>)[
    normalizedIcon] || Star;
    let colorClass = "text-gray-300";
    if (isFilled) {
      switch (normalizedIcon) {
        case "heart":
          colorClass = "fill-current text-red-400";
          break;
        case "shield":
          colorClass = "fill-current text-blue-400";
          break;
        case "zap":
          colorClass = "fill-current text-amber-400";
          break;
        case "flag":
          colorClass = "fill-current text-green-400";
          break;
        case "thumbsup":
        case "thumb":
          colorClass = "fill-current text-blue-500";
          break;
        case "smile":
          colorClass = "fill-current text-yellow-500";
          break;
        default:
          colorClass = "fill-current text-yellow-400";
      }
    }
    return (
      <IconComponent
        className={`w-8 h-8 cursor-pointer transition-colors ${colorClass}`} />);
  };
  const isRowLayout = labelAlignment === "LEFT" || labelAlignment === "RIGHT";
  return (
    <div className={`mb-4 ${isRowLayout ? "flex items-start gap-4" : ""}`}>      <div
        className={`${isRowLayout ? "w-40 flex-shrink-0 pt-2" : "mb-2"} ${labelAlignment === "RIGHT" ? "text-right" : ""}`}>
        <PreviewLabel
          field={field}
          questionNumber={questionNumber}
          isPublic={isPublic}
          htmlFor={fieldName} />
        {subLabel && subLabel !== "Sublabel" &&
        <p className="mt-1 text-xs text-gray-500">{stripHtml(subLabel)}</p>
        }      </div>      <div className="flex-1 min-w-0" title={hoverText}>        <div
          className={`flex items-center gap-1 ${labelAlignment === "CENTER" ? "justify-center" : ""}`}>
          {Array.from({ length: maxRating }).map((_, index) => {
            const starIdx = index + 1;
            return (
              <button
                key={starIdx}
                type="button"
                className="group focus:outline-none transition-transform hover:scale-110 p-1"
                onMouseEnter={() => !readOnly && setHoverRating(starIdx)}
                onMouseLeave={() => !readOnly && setHoverRating(null)}
                onClick={() => {
                  if (!readOnly) {
                    setValue(fieldName, starIdx.toString(), {
                      shouldValidate: true,
                      shouldDirty: true
                    });
                    setRating(starIdx);
                    setHoverRating(null);
                  }
                }}
                disabled={readOnly}>
                {getIcon(starIdx)}              </button>);
          })}        </div>        <input
          type="hidden"
          {...register(fieldName, {
            required: field.required ?
            t("public.validation.required_field", {
              label: stripHtml(field.label)
            }) :
            false,
            validate: (value) => {
              const numVal = Number(value);
              if (field.required && (!value || isNaN(numVal) || numVal < 1)) {
                return t(
                  "public.validation.rate_min",
                  "Please select at least 1"
                );
              }
              return true;
            }
          })}
          value={rating || ""} />
        {fieldError &&
        <p className="mt-1 text-sm text-red-600">            {fieldError.message as string}          </p>
        }      </div>    </div>);
};