import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Field, Form, FieldType } from '@/types';
import FieldItem from '@/components/form-builder/FieldItem';
import { FieldContextMenu } from './FieldContextMenu';
import { useTranslation } from 'react-i18next';

interface CanvasAreaProps {
  visibleFields: Field[];
  currentForm: Form | null;
  selectedFieldId: string | null;
  onSelectField: (id: string, autoFocus?: boolean) => void;
  onDeselect?: () => void;
  onToggleSelect?: (id: string) => void;
  onOpenProperties?: () => void;
  additionalSelectedIds?: string[];
}

export default function CanvasArea({ 
  visibleFields, 
  currentForm, 
  selectedFieldId, 
  onSelectField,
  onDeselect,
  onToggleSelect,
  onOpenProperties,
  additionalSelectedIds = [],
}: CanvasAreaProps) {
  
  const { t } = useTranslation();
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
           className={`min-h-full flex-1 transition-all duration-200 pt-10 pb-32 relative rounded-xl bg-gray-50/80 border border-gray-100 ${
             snapshot.isDraggingOver 
               ? 'ring-2 ring-indigo-300 ring-dashed border-transparent' 
               : ''
           }`}
           onClick={(e) => {
             if (e.target === e.currentTarget) {
                 onDeselect?.();
                 setActiveContextMenu(null);
             }
           }}
        >
          {/* Drop zone indicator when dragging */}
          {snapshot.isDraggingOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-indigo-500/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-indigo-200 shadow-lg">
                <p className="text-indigo-600 font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  {t('builder.drop_here')}
                </p>
              </div>
            </div>
          )}
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
                      onOpenProperties={onOpenProperties}
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
                <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <p className="text-sm font-medium">{t('builder.drag_drop_instructions')}</p>
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

