import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Field, Form, FieldType } from '@/types';
import FieldItem from '@/components/form-builder/FieldItem';
import { FieldContextMenu } from './FieldContextMenu';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useFormStore } from '@/store/formStore';

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
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ isOpen: boolean; fieldId: string | null }>({ isOpen: false, fieldId: null });

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
    <>
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
            { }
            {topLevelFields.length > 0 ? (
              <div className="flex flex-row flex-wrap content-start gap-3 w-full">
                {topLevelFields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided, draggableSnapshot) => (
                      <FieldItem
                        field={field}
                        isSelected={selectedFieldId === field.id || additionalSelectedIds.includes(field.id)}
                        isMultiSelecting={(selectedFieldId ? 1 : 0) + (additionalSelectedIds.length) > 1}
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
                         onDelete={() => {
                             setDeleteConfirm({ isOpen: true, fieldId: field.id });
                         }}
                     />
                 );
            })()}
          </div>
        )}
      </Droppable>
      
      <ConfirmDialog
          open={deleteConfirm.isOpen}
          onOpenChange={(open) => !open && setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
          title={t('builder.field.delete_confirm')}
          description={t('builder.field.delete_confirm_desc')}
          onConfirm={() => {
              if (deleteConfirm.fieldId) {
                  useFormStore.getState().deleteField(deleteConfirm.fieldId);
                  setDeleteConfirm({ isOpen: false, fieldId: null });
              }
          }}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          variant="destructive"
      />
    </>
  );
}

