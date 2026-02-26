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
  isTouch,
}: {
  category: { name: string; fields: SidebarFieldConfig[] };
  isCollapsed: boolean;
  onFieldAdd?: () => void;
  variant?: "list" | "grid";
  isTouch?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const labels = useFieldLabels();
  const translatedCategoryName =
    labels[category.name as keyof ReturnType<typeof useFieldLabels>] ||
    category.name;

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <div className="w-full h-px bg-gray-200 my-1" />
        {category.fields.map((field) => (
          <FieldTypeButton
            key={field.type}
            fieldType={field}
            isCollapsed={true}
            onFieldAdd={onFieldAdd}
            variant="list"
            isTouch={isTouch}
          />
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
          {translatedCategoryName}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {category.fields.map((field) => (
            <FieldTypeButton
              key={field.type}
              fieldType={field}
              onFieldAdd={onFieldAdd}
              variant="grid"
              isTouch={isTouch}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-50 transition-colors"
      >
        <span>{translatedCategoryName}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-2 space-y-2 bg-gray-50/50 border-t border-gray-100">
          {category.fields.map((field) => (
            <FieldTypeButton
              key={field.type}
              fieldType={field}
              onFieldAdd={onFieldAdd}
              variant="list"
              isTouch={isTouch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
