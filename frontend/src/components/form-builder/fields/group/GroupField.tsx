import { Field, FieldType } from '@/types';
import { ChevronDown, ChevronUp, ChevronRight, Layers, Plus, LogOut, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useFormStore } from '@/store/formStore';
import FieldItem from '@/components/form-builder/FieldItem';
import { useTranslation } from 'react-i18next';
import { motion, LayoutGroup } from 'framer-motion';

interface GroupFieldProps {
  field: Field;
  isSelected?: boolean;
  childFields?: Field[];
  allFields?: Field[];
  onSelectField?: (id: string) => void;
  selectedFieldId?: string | null;
}

export function GroupField({ 
  field, 
  isSelected, 
  childFields = [], 
  allFields = [],
  onSelectField
}: GroupFieldProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const updateField = useFormStore((state) => state.updateField);
  const selectField = useFormStore((state) => state.selectField);
  const storeSelectedFieldId = useFormStore((state) => state.selectedFieldId);
  const { t } = useTranslation();



  const handleSelectChild = (childId: string) => {
    if (onSelectField) {
      onSelectField(childId);
    } else {
      selectField(childId);
    }
  };

  const availableFields = allFields.filter(f => 
    f.id !== field.id && 
    !f.groupId && 
    f.type !== FieldType.GROUP && 
    f.type !== FieldType.PAGE_BREAK
  );

  const addFieldToGroup = (fieldId: string) => {
    updateField(fieldId, { groupId: field.id });
    handleSelectChild(fieldId);
    setShowAddMenu(false);
  };

  const removeFieldFromGroup = (fieldId: string) => {
    updateField(fieldId, { groupId: undefined });
  };

  const sortedChildFields = [...childFields].sort((a, b) => a.order - b.order);

  const moveFieldUp = (index: number) => {
    if (index <= 0) return;
    const currentField = sortedChildFields[index];
    const prevField = sortedChildFields[index - 1];
    updateField(currentField.id, { order: prevField.order });
    updateField(prevField.id, { order: currentField.order });
  };

  const moveFieldDown = (index: number) => {
    if (index >= sortedChildFields.length - 1) return;
    const currentField = sortedChildFields[index];
    const nextField = sortedChildFields[index + 1];
    updateField(currentField.id, { order: nextField.order });
    updateField(nextField.id, { order: currentField.order });
  };

  const droppableId = `GROUP-${field.id}`;

  return (
    <div
      className="group-field-container"
      style={{
        border: `2px solid ${isSelected ? '#6366f1' : '#e5e7eb'}`,
        borderRadius: '12px',
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : '#fafafa',
        overflow: 'visible',
        transition: 'all 0.2s ease',
        width: '100%',
      }}
    >
      <div
        className="group-field-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#f3f4f6',
          borderBottom: isCollapsed ? 'none' : '1px solid #e5e7eb',
          cursor: 'pointer',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </button>

        <Layers size={18} style={{ color: '#6366f1' }} />

        <span
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          {t('builder.group.field_group')}
        </span>

        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
          {t('builder.group.fields_count', { count: childFields.length })}
        </span>
      </div>

      {!isCollapsed && (
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="group-field-content"
              style={{
                padding: '16px',
                minHeight: '80px',
                backgroundColor: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
            >
              {sortedChildFields.length > 0 ? (
                <LayoutGroup>
                  <div className="flex flex-col gap-3">
                    {sortedChildFields.map((childField, index) => (
                      <motion.div 
                        key={childField.id}
                        layout
                        transition={{ 
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          mass: 0.8
                        }}
                        className="relative group/child"
                        onClick={() => handleSelectChild(childField.id)}
                      >
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 opacity-0 group-hover/child:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveFieldUp(index);
                            }}
                            disabled={index === 0}
                            className={`p-2 rounded-lg bg-white shadow-md border transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600 hover:border-indigo-300'}`}
                            title={t('builder.group.move_up')}
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveFieldDown(index);
                            }}
                            disabled={index === sortedChildFields.length - 1}
                            className={`p-2 rounded-lg bg-white shadow-md border transition-colors ${index === sortedChildFields.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600 hover:border-indigo-300'}`}
                            title={t('builder.group.move_down')}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </div>

                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 opacity-0 group-hover/child:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFieldFromGroup(childField.id);
                            }}
                            className="p-2 bg-white rounded-full shadow-md border text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                            title={t('builder.group.remove_from_group')}
                          >
                            <LogOut size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const deleteField = useFormStore.getState().deleteField;
                              deleteField(childField.id);
                            }}
                            className="p-2 bg-white rounded-full shadow-md border text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                            title={t('builder.group.delete_field')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <FieldItem
                          field={childField}
                          isSelected={storeSelectedFieldId === childField.id}
                          onSelect={handleSelectChild}
                          allFields={allFields}
                          disableHover={false}
                          hideDragHandle={true}
                        />
                      </motion.div>
                    ))}
                  </div>
                </LayoutGroup>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60px',
                    border: snapshot.isDraggingOver ? '2px solid #6366f1' : '2px dashed #d1d5db',
                    borderRadius: '8px',
                    color: snapshot.isDraggingOver ? '#6366f1' : '#9ca3af',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {snapshot.isDraggingOver ? t('builder.group.drop_here') : t('builder.group.drag_fields')}
                </div>
              )}
              {provided.placeholder}

              <div style={{ position: 'relative', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectChild(field.id);
                    setShowAddMenu(!showAddMenu);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.color = '#6366f1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <Plus size={14} />
                  {t('builder.group.add_field')}
                </button>

                {showAddMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      zIndex: 9999,
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {availableFields.length > 0 ? (
                      availableFields.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addFieldToGroup(f.id);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#374151',
                            textAlign: 'left',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{f.label || f.type}</span>
                          <span style={{ marginLeft: '8px', color: '#9ca3af', fontSize: '11px' }}>
                            ({f.type})
                          </span>
                        </button>
                      ))
                    ) : (
                      <div style={{ padding: '12px', color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
                        {t('builder.group.no_available_fields')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
