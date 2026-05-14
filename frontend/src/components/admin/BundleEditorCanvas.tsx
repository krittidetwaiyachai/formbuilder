import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Field as FormField } from "@/types";
import { useBundleEditorStore } from "@/store/bundleEditorStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import BundleDesignerElementCard from "./BundleDesignerElementCard";
const toFormField = (field: unknown): FormField => {
  const bundleField = field as Record<string, unknown>;
  return {
    ...(bundleField as FormField),
    formId: "bundle-preview"
  };
};
export default function BundleEditorCanvas() {
  const { t } = useTranslation();
  const { bundle, setSelectedFieldId, selectedFieldId, deleteField } = useBundleEditorStore();
  if (!bundle) {
    return (
      <div className="min-h-[200px]" />);
  }
  const sortedFields = [...bundle.fields].sort((a, b) => a.order - b.order);
  const formFields = sortedFields.map(toFormField);
  return (
    <div className="max-w-[700px] w-full mx-auto pb-32 pt-10">
      <Droppable droppableId="BUNDLE-CANVAS">
        {(provided, snapshot) =>
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (
            target.closest("[data-top-level-field-id]") ||
            target.closest("input, textarea, select, button, a, [contenteditable='true']"))
            {
              return;
            }
            setSelectedFieldId(null);
          }}
          className={cn(
            "min-h-full flex-1 transition-all duration-200 pb-10 relative rounded-xl bg-gray-50/80 border border-gray-100",
            snapshot.isDraggingOver ? "ring-2 ring-indigo-300 ring-dashed border-transparent" : ""
          )}>
            {formFields.length > 0 ?
          <div className="flex flex-row flex-wrap content-start gap-3 w-full">
                {formFields.map((field, index) =>
            <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(dragProvided, dragSnapshot) =>
              <div
                ref={dragProvided.innerRef}
                {...dragProvided.draggableProps}
                style={dragProvided.draggableProps.style}
                className="w-full"
                data-top-level-field-slot="true"
                data-top-level-field-id={field.id}>
                        <BundleDesignerElementCard
                  element={field}
                  allFields={formFields}
                  isSelected={selectedFieldId === field.id}
                  isDragging={dragSnapshot.isDragging}
                  dragHandleProps={dragProvided.dragHandleProps}
                  onClick={() => {
                    setSelectedFieldId(field.id);
                  }}
                  onDelete={(event) => {
                    event.stopPropagation();
                    deleteField(field.id);
                  }} />
                      </div>
              }
                  </Draggable>
            )}
                {provided.placeholder}
              </div> :
          <>
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                  <p className="text-sm font-medium">{t("builder.drag_drop_instructions")}</p>
                </div>
                {provided.placeholder}
              </>
          }
          </div>
        }
      </Droppable>
    </div>);
}