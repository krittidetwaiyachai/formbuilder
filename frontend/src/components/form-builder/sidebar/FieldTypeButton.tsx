import React from "react";
import { useFormStore } from "@/store/formStore";
import { Draggable } from "@hello-pangea/dnd";
import { allFields } from "./config";
import type { SidebarFieldConfig } from "./config";
import { useFieldLabels, getFieldColorTheme } from "./useSidebarTheme";

const FieldTypeButtonVisual = ({
  fieldType,
  isCollapsed,
  variant = "list",
}: {
  fieldType: SidebarFieldConfig;
  isCollapsed?: boolean;
  variant?: "list" | "grid";
}) => {
  const labels = useFieldLabels();
  const Icon = fieldType.icon;
  const translatedLabel =
    labels[fieldType.label as keyof ReturnType<typeof useFieldLabels>] ||
    fieldType.label;
  const theme = getFieldColorTheme(fieldType.type);

  if (variant === "grid" && !isCollapsed) {
    return (
      <div
        className={`
                group w-full aspect-[1.3] flex flex-col items-center justify-center p-3 
                bg-white border hover:border-transparent rounded-xl transition-all duration-200
                hover:shadow-lg hover:-translate-y-1 relative overflow-hidden
                ${theme.border}
            `}
      >
        <div
          className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-br ${theme.bg} to-white pointer-events-none
                `}
        />

        <div
          className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300
                `}
        >
          <Icon className="h-6 w-6" />
        </div>

        <span
          className={`text-xs font-semibold text-center leading-tight z-10 text-gray-700 group-hover:text-gray-900`}
        >
          {translatedLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full flex items-center ${isCollapsed ? "justify-center px-1" : "px-3"} py-2 text-sm text-black bg-white hover:bg-gray-50 rounded-md border border-gray-400 transition-colors cursor-grab active:cursor-grabbing touch-none select-none`}
    >
      <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
      {!isCollapsed && <span>{translatedLabel}</span>}
    </div>
  );
};

export function FieldTypeButton({
  fieldType,
  isCollapsed,
  onFieldAdd,
  variant,
  isTouch,
}: {
  fieldType: SidebarFieldConfig;
  isCollapsed?: boolean;
  onFieldAdd?: () => void;
  variant?: "list" | "grid";
  isTouch?: boolean;
}) {
  const { addField } = useFormStore();
  const index = allFields.findIndex((f) => f.type === fieldType.type);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addField({
      type: fieldType.type,
      label: fieldType.label,
      required: false,
      validation: fieldType.validation,
      order: 0,
      options: fieldType.options,
    });
    onFieldAdd?.();
  };

  return (
    <div className="relative w-full h-full">
      <div
        className="relative z-0 select-none h-full"
        onClick={(e) => {
          if (isTouch && !isCollapsed && variant !== "grid") {
            handleDoubleClick(e);
          }
        }}
      >
        <FieldTypeButtonVisual
          fieldType={fieldType}
          isCollapsed={isCollapsed}
          variant={variant}
        />
      </div>

      <Draggable
        draggableId={`sidebar-${fieldType.type}`}
        index={index !== -1 ? index : 0}
      >
        {(provided, snapshot) => {
          const useSplitDrag = isTouch && !isCollapsed && variant !== "grid";

          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={{
                ...provided.draggableProps.style,
                position: "absolute",
                inset: 0,
                zIndex: 20,
                opacity: 0,
                pointerEvents: "none",
              }}
            >
              <div
                {...provided.dragHandleProps}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: useSplitDrag ? "60px" : "100%",
                  touchAction: useSplitDrag
                    ? "none"
                    : isTouch
                      ? "manipulation"
                      : "none",
                  pointerEvents: "auto",
                  cursor: snapshot.isDragging ? "grabbing" : "grab",
                }}
                onClick={(e) => {
                  if (!snapshot.isDragging) handleDoubleClick(e);
                }}
              />

              {useSplitDrag && (
                <div
                  style={{
                    position: "absolute",
                    left: "60px",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    pointerEvents: "auto",
                    touchAction: "manipulation",
                  }}
                  onClick={(e) => {
                    handleDoubleClick(e);
                  }}
                />
              )}
            </div>
          );
        }}
      </Draggable>
    </div>
  );
}
