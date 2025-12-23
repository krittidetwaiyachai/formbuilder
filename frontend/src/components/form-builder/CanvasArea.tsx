import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Field, Form } from '@/types';
import FieldItem from '@/components/form-builder/FieldItem';

interface CanvasAreaProps {
  visibleFields: Field[];
  currentForm: Form | null;
  selectedFieldId: string | null;
  onSelectField: (id: string, autoFocus?: boolean) => void;
  sidebarDragFieldId: string | null;
  newlyAddedFieldId: string | null;
  // CanvasArea doesn't need currentPage directly unless it uses it for logic within. 
  // It receives visibleFields which are already filtered.
}

export default function CanvasArea({ 
  visibleFields, 
  currentForm, 
  selectedFieldId, 
  onSelectField, 
  sidebarDragFieldId, 
  newlyAddedFieldId 
}: CanvasAreaProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
    data: {
      droppableId: 'canvas',
    },
  });

  // Map visible fields to IDs for SortableContext
  const itemIds = useMemo(() => visibleFields.map((f) => f.id), [visibleFields]);

  // Show blank loading state (or minimal skeleton) instead of "Empty State" text
  if (!currentForm) {
    return <div className="min-h-[200px]" />;
  }
  
  return (
    <div ref={setNodeRef} className="min-h-[200px]">
      {visibleFields.length > 0 ? (
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {visibleFields.map((field) => (
              <FieldItem
                key={field.id}
                field={field}
                isSelected={selectedFieldId === field.id}
                onSelect={onSelectField}
                // Highlight if it's currently being dragged from sidebar OR if it was just added
                isNewFromSidebar={sidebarDragFieldId === field.id || newlyAddedFieldId === field.id}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <p className="text-sm font-medium">Drag fields here or select from sidebar</p>
        </div>
      )}
    </div>
  );
}
