"use client";

import type { Field as FormElement } from "@/types";
import { FieldType } from "@/types";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldStyle } from "@/components/form-builder/field-item/useFieldStyle";
import { FieldPreview } from "@/components/form-builder/field-item/FieldPreview";
import { FieldLabel } from "@/components/form-builder/field-item/FieldLabel";
import { useBundleEditorStore } from "@/store/bundleEditorStore";

interface DesignerElementCardProps {
  element: FormElement;
  allFields: FormElement[];
  isSelected?: boolean;
  onDelete?: (event: React.MouseEvent) => void;
  onClick?: (event: React.MouseEvent) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
  dragHandleProps?: any;
}

export default function DesignerElementCard({
  element,
  allFields,
  isSelected = false,
  onDelete,
  onClick,
  isDragging,
  isOverlay,
  dragHandleProps,
}: DesignerElementCardProps) {
  const { updateField, setSelectedFieldId } = useBundleEditorStore();
  const fieldStyle = useFieldStyle(element, false);

  if (isDragging || isOverlay) {
    return (
      <div
        className={cn(
          "w-[calc(105%-4rem)] bg-white rounded-xl shadow-2xl p-4 border-2 ring-4 ring-black/5 cursor-grabbing",
          fieldStyle.overlayBorder,
          fieldStyle.cardBorder,
        )}
      >
        <div className="flex justify-center mb-3">
          <div className="w-8 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 w-full bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">
          {element.type} Field
        </div>
      </div>
    );
  }

  const isContentField =
    element.type !== FieldType.HEADER &&
    element.type !== FieldType.PARAGRAPH &&
    element.type !== FieldType.DIVIDER &&
    element.type !== FieldType.PAGE_BREAK;

  return (
    <div className="relative group/field isolate flex-1 min-w-0">
      <div
        className={cn(
          "relative origin-center transform-gpu bg-white border rounded-2xl transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          fieldStyle.bgGradient,
          fieldStyle.cardBorder,
          isSelected
            ? "ring-2 ring-black shadow-lg z-40 border-transparent scale-[1.004] -translate-y-px"
            : "border-gray-200 hover:border-gray-300 hover:shadow-md hover:z-30",
        )}
        onMouseDown={(event) => {
          event.stopPropagation();
          const target = event.target as HTMLElement;
          if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            event.stopPropagation();
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          const target = event.target as HTMLElement;
          if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            event.stopPropagation();
            return;
          }
          onClick?.(event);
        }}
      >
        <div
          {...dragHandleProps}
          className="absolute top-0 inset-x-0 z-50 flex h-8 items-start justify-center cursor-grab active:cursor-grabbing touch-none select-none"
          title="Drag to move"
        >
          <div
            className={cn(
              "mt-3 w-14 h-1.5 rounded-full transition-colors",
              isSelected ? "bg-gray-400" : "bg-gray-200 hover:bg-gray-300",
            )}
          />
        </div>

        <div
          className={cn(
            "px-4 pb-4 pt-8",
            (element.type === FieldType.HEADER || element.type === FieldType.PARAGRAPH) &&
              "overflow-visible",
          )}
        >
          {isContentField ? (
            <FieldLabel
              field={element}
              isSelected={isSelected}
              isMultiSelecting={false}
              updateField={(id, updates) => updateField(id, updates as any)}
              onSelect={(id) => setSelectedFieldId(id)}
            >
              <FieldPreview
                field={element}
                fieldStyle={fieldStyle}
                isSelected={isSelected}
                onSelect={(id) => setSelectedFieldId(id)}
                isMultiSelecting={false}
                allFields={allFields}
                updateField={(id, updates) => updateField(id, updates as any)}
              />
            </FieldLabel>
          ) : (
            <FieldPreview
              field={element}
              fieldStyle={fieldStyle}
              isSelected={isSelected}
              onSelect={(id) => setSelectedFieldId(id)}
              isMultiSelecting={false}
              allFields={allFields}
              updateField={(id, updates) => updateField(id, updates as any)}
            />
          )}
        </div>
      </div>

      {isSelected && onDelete && (
        <div className="hidden md:flex absolute top-0 bottom-0 -right-14 w-14 items-center justify-center z-50 opacity-100 translate-x-0">
          <button
            onClick={onDelete}
            className="h-10 w-10 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm border border-gray-200 transition-all hover:scale-110 hover:shadow-md"
            title="Delete field"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
