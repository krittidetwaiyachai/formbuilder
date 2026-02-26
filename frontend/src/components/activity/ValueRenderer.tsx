import { useTranslation } from "react-i18next";
import { stripHtml } from "@/lib/ui/utils";

type Primitive = string | number | boolean | null | undefined;

interface OptionItem {
  label?: string;
  value?: string | number;
  [key: string]: unknown;
}

interface ValueObject {
  items?: OptionItem[];
  subLabel?: string;
  [key: string]: unknown;
}

export type ValueType = Primitive | ValueObject | ValueType[];

interface ValueRendererProps {
  value: ValueType;
}

export default function ValueRenderer({ value }: ValueRendererProps) {
  const { t } = useTranslation();

  if (value === null || value === undefined)
    return (
      <span className="text-gray-300 italic">{t("activity.values.empty")}</span>
    );
  if (typeof value === "boolean")
    return value ? (
      <span className="text-emerald-600 font-medium">
        {t("activity.values.enable")}
      </span>
    ) : (
      <span className="text-gray-500">{t("activity.values.disable")}</span>
    );

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      if (value.length === 0)
        return (
          <span className="text-gray-300 italic">
            {t("activity.values.empty")}
          </span>
        );

      const firstItem = value[0];
      if (
        typeof firstItem === "object" &&
        firstItem !== null &&
        ("label" in firstItem || "value" in firstItem)
      ) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((opt, i: number) => {
              const item = opt as ValueObject;
              const display =
                item?.label ??
                item?.value ??
                (typeof opt === "object" ? JSON.stringify(opt) : opt);
              return (
                <span
                  key={i}
                  className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200"
                >
                  {typeof display === "object"
                    ? (t("activity.values.invalid") as React.ReactNode)
                    : (display as React.ReactNode)}
                </span>
              );
            })}
          </div>
        );
      }
      return (
        <span className="text-xs text-gray-600">
          {value.length} {t("activity.values.items")}
        </span>
      );
    }

    const objValue = value as ValueObject;

    if (objValue.items && Array.isArray(objValue.items)) {
      return (
        <div className="flex flex-wrap gap-1">
          {objValue.items.map((opt: OptionItem, i: number) => {
            const display =
              opt?.label ??
              opt?.value ??
              (typeof opt === "object" ? JSON.stringify(opt) : opt);
            return (
              <span
                key={i}
                className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200"
              >
                {typeof display === "object"
                  ? t("activity.values.invalid")
                  : String(display)}
              </span>
            );
          })}
          {objValue.subLabel && (
            <span className="text-xs text-gray-500 italic">
              ({objValue.subLabel})
            </span>
          )}
        </div>
      );
    }

    const entries = Object.entries(objValue).filter(
      ([k, v]) => v !== null && v !== undefined && v !== "" && k !== "items",
    );
    if (entries.length === 0)
      return (
        <span className="text-gray-300 italic">
          {t("activity.values.empty")}
        </span>
      );

    return (
      <div className="space-y-0.5">
        {entries.map(([key, val]: [string, unknown], i: number) => {
          const readableKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();

          return (
            <div key={i} className="text-xs">
              <span className="text-gray-500">{readableKey}:</span>{" "}
              <span className="text-gray-700 font-medium">
                {typeof val === "boolean"
                  ? val
                    ? t("activity.values.enable")
                    : t("activity.values.disable")
                  : String(val)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return <>{stripHtml(String(value))}</>;
}
