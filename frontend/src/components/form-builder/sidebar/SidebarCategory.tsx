import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SidebarFieldConfig } from "./config";
import { useFieldLabels } from "./useSidebarTheme";
import { FieldTypeButton } from "./FieldTypeButton";
export function SidebarCategory({
  category,
  isCollapsed,
  onFieldAdd,
  variant,
  isTouch
}: {category: {name: string;fields: SidebarFieldConfig[];};isCollapsed: boolean;onFieldAdd?: () => void;variant?: "list" | "grid";isTouch?: boolean;}) {
  const [isOpen, setIsOpen] = useState(true);
  const labels = useFieldLabels();
  const translatedCategoryName =
  labels[category.name as keyof ReturnType<typeof useFieldLabels>] ||
  category.name;
  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <div className="my-1 h-px w-full bg-gray-200" />
        {category.fields.map((field) =>
        <FieldTypeButton
          key={field.type}
          fieldType={field}
          isCollapsed
          onFieldAdd={onFieldAdd}
          variant="list"
          isTouch={isTouch} />
        )}
      </div>);
  }
  if (variant === "grid") {
    return (
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="h-px flex-1 bg-gray-200" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            {translatedCategoryName}
          </h3>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {category.fields.map((field) =>
          <FieldTypeButton
            key={field.type}
            fieldType={field}
            onFieldAdd={onFieldAdd}
            variant="grid"
            isTouch={isTouch} />
          )}
        </div>
      </div>);
  }
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 transition-colors hover:bg-gray-50">
        <span>{translatedCategoryName}</span>
        {isOpen ?
        <ChevronDown className="h-4 w-4 text-gray-400" /> :
        <ChevronRight className="h-4 w-4 text-gray-400" />
        }
      </button>
      {isOpen &&
      <div className="space-y-2 border-t border-gray-100 bg-gray-50/50 p-2">
          {category.fields.map((field) =>
        <FieldTypeButton
          key={field.type}
          fieldType={field}
          onFieldAdd={onFieldAdd}
          variant="list"
          isTouch={isTouch} />
        )}
        </div>
      }
    </div>);
}