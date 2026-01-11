import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Field, Form, FieldType } from '@/types';
import FieldItem from '@/components/form-builder/FieldItem';
import { FieldContextMenu } from './FieldContextMenu';

interface CanvasAreaProps {
  visibleFields: Field[];
  currentForm: Form | null;
  selectedFieldId: string | null;
  onSelectField: (id: string, autoFocus?: boolean) => void;
  onDeselect?: () => void;
  onToggleSelect?: (id: string) => void;
  additionalSelectedIds?: string[];
}

export default function CanvasArea({ 
  visibleFields, 
  currentForm, 
  selectedFieldId, 
  onSelectField,
  onDeselect,
  onToggleSelect,
  additionalSelectedIds = [],
}: CanvasAreaProps) {
  
  const [activeContextMenu, setActiveContextMenu] = React.useState<{ fieldId: string; x: number; y: number } | null>(null);

  if (!currentForm) {
    return <div className="min-h-[200px]" />;
  }

  const topLevelFields = visibleFields.filter(f => !f.groupId || f.type === FieldType.GROUP);

  const handleContextMenu = (e: React.MouseEvent, fieldId: string) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isSelected = selectedFieldId === fieldId || additionalSelectedIds.includes(fieldId);
      if (!isSelected) {
          onSelectField(fieldId, false);
      }
      setActiveContextMenu({ fieldId, x: e.clientX, y: e.clientY });
  };
  
  return (
    <Droppable droppableId="CANVAS" isCombineEnabled>
      {(provided, snapshot) => (
        <div 
           ref={provided.innerRef} 
           {...provided.droppableProps}
           className="min-h-[200px] transition-colors pt-10 pb-20 relative" 
           onClick={(e) => {
             if (e.target === e.currentTarget) {
                 onDeselect?.();
                 setActiveContextMenu(null);
             }
           }}
        >
          {topLevelFields.length > 0 ? (
            <div className="flex flex-row flex-wrap content-start gap-3 w-full">
              {topLevelFields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, draggableSnapshot) => (
                    <FieldItem
                      field={field}
                      isSelected={selectedFieldId === field.id || additionalSelectedIds.includes(field.id)}
                      onSelect={onSelectField}
                      onToggle={onToggleSelect}
                      onOpenContextMenu={(e) => handleContextMenu(e, field.id)}
                      provided={provided}
                      isDragging={draggableSnapshot.isDragging}
                      disableHover={snapshot.isDraggingOver}
                      allFields={visibleFields}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          ) : (
            <>
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <p className="text-sm font-medium">Drag fields here or select from sidebar</p>
                </div>
                {provided.placeholder}
            </>
          )}

          {activeContextMenu && (() => {
               const field = visibleFields.find(f => f.id === activeContextMenu.fieldId);
               if (!field) return null;
               return (
                   <FieldContextMenu 
                       field={field}
                       position={{ x: activeContextMenu.x, y: activeContextMenu.y }}
                       onClose={() => setActiveContextMenu(null)}
                   />
               );
          })()}
        </div>
      )}
    </Droppable>
  );
}

