import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, FieldType } from '@/types';
import { Trash2 } from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { ShortTextField } from './fields/short-text/ShortTextField';
import { EmailField } from './fields/email/EmailField';
import { PhoneField } from './fields/phone/PhoneField';
import { NumberField } from './fields/number/NumberField';
import { LongTextField } from './fields/long-text/LongTextField';
import { DropdownField } from './fields/dropdown/DropdownField';
import { RadioField } from './fields/radio/RadioField';
import { DateField } from './fields/date/DateField';
import { RateField } from './fields/rate/RateField';
import { HeaderField } from './fields/header/HeaderField';
import { FullNameField } from './fields/full-name/FullNameField';
import { AddressField } from './fields/address/AddressField';
import { ParagraphField } from './fields/paragraph/ParagraphField';
import { SubmitField } from './fields/submit/SubmitField';
import { CheckboxField } from './fields/checkbox/CheckboxField';

interface FieldItemProps {
  field: Field;
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  isHidden?: boolean; // สำหรับซ่อน field ที่กำลังถูก drag จาก sidebar
  isNewFromSidebar?: boolean; // สำหรับแสดง visual feedback สำหรับ field ใหม่ที่ลากจาก sidebar
  isOverlay?: boolean; // สำหรับใช้ใน DragOverlay
}

function FieldItem({ field, isSelected, onSelect, isHidden = false, isNewFromSidebar = false, isOverlay = false }: FieldItemProps) {
  const deleteField = useFormStore((state) => state.deleteField);
  const updateField = useFormStore((state) => state.updateField);
  const shouldFocusField = useFormStore((state) => state.shouldFocusField);
  const setShouldFocusField = useFormStore((state) => state.setShouldFocusField);
  
  const labelInputRef = useRef<HTMLDivElement>(null);
  const isFocusingRef = useRef(false);

  // Initialize stable HTML for uncontrolled components to prevent React re-renders from reverting edits
  const [labelHtml] = useState({ __html: field.label || (field.type === FieldType.HEADER ? 'Heading' : '') });

  // Sync content manually to avoid cursor jumping
  useEffect(() => {
    if (labelInputRef.current && document.activeElement !== labelInputRef.current) {
        if (labelInputRef.current.textContent !== field.label) {
            labelInputRef.current.textContent = field.label;
        }
    }
  }, [field.label]);

  // Restore focus after selection change (when switching fields)
  useEffect(() => {
    if (isSelected && shouldFocusField && !isOverlay) {
        // We just selected this field via click, restore focus to the interaction target
        setTimeout(() => {
            if (field.type === FieldType.HEADER) {
                // Header focus handled in HeaderField or via manual click
            } else {
                if (labelInputRef.current) labelInputRef.current.focus();
            }
            // Reset the flag so we don't refocus on random re-renders
            setShouldFocusField(false);
        }, 50); // Small delay to wait for DOM and ref to be ready
    }
  }, [isSelected, shouldFocusField, field.type, setShouldFocusField, isOverlay]);


  // Memoize sortable data to prevent dnd-kit from triggering updates on every render
  const sortableData = useMemo(() => ({
    source: 'canvas',
    field: field,
  }), [field]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: isOverlay ? `overlay-${field.id}` : field.id,
    data: sortableData,
    disabled: isOverlay, // Disable sortable logic for overlay to prevent self-referential dragging behavior
  });

  const style = {
    // If it's an overlay, we don't want the sortable transform to apply (because DragOverlay handles it)
    // and we want to ensure opacity is 1 (fully visible)
    transform: isOverlay ? undefined : CSS.Transform.toString(transform),
    transition: transition ? transition : (isDragging ? undefined : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
    opacity: isHidden ? 0 : (isDragging && !isOverlay ? 0 : 1), // Only hide if dragging AND NOT the overlay itself
    visibility: (isDragging && !isOverlay) ? 'hidden' as const : 'visible' as const,
    touchAction: field.type === 'HEADER' ? 'auto' as const : 'none' as const,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this field?')) {
      deleteField(field.id);
    }
  };

  const getFieldStyle = () => {
    switch (field.type) {
      case FieldType.TEXT:
        return {
          cardBorder: 'border-l-4 border-l-sky-500',
          inputBorder: 'border-sky-200 focus:border-sky-500',
          bgGradient: 'bg-white hover:bg-sky-50/30',
          iconColor: 'text-sky-500',
        };
      case FieldType.EMAIL:
        return {
          cardBorder: 'border-l-4 border-l-blue-500',
          inputBorder: 'border-blue-200 focus:border-blue-500',
          bgGradient: 'bg-white hover:bg-blue-50/30',
          iconColor: 'text-blue-500',
        };
      case FieldType.PHONE:
        return {
          cardBorder: 'border-l-4 border-l-green-500',
          inputBorder: 'border-green-200 focus:border-green-500',
          bgGradient: 'bg-white hover:bg-green-50/30',
          iconColor: 'text-green-500',
        };
      case FieldType.TEXTAREA:
        return {
          cardBorder: 'border-l-4 border-l-purple-500',
          inputBorder: 'border-purple-200 focus:border-purple-500',
          bgGradient: 'bg-white hover:bg-purple-50/30',
          iconColor: 'text-purple-500',
        };
      case FieldType.NUMBER:
        return {
          cardBorder: 'border-l-4 border-l-emerald-500',
          inputBorder: 'border-emerald-200 focus:border-emerald-500',
          bgGradient: 'bg-white hover:bg-emerald-50/30',
          iconColor: 'text-emerald-500',
        };
      case FieldType.DROPDOWN:
        return {
          cardBorder: 'border-l-4 border-l-orange-500',
          inputBorder: 'border-orange-200 focus:border-orange-500',
          bgGradient: 'bg-white hover:bg-orange-50/30',
          iconColor: 'text-orange-500',
        };
      case FieldType.RADIO:
        return {
          cardBorder: 'border-l-4 border-l-pink-500',
          inputBorder: 'border-pink-200 focus:border-pink-500',
          bgGradient: 'bg-white hover:bg-pink-50/30',
          iconColor: 'text-pink-500',
        };
      case FieldType.CHECKBOX:
        return {
          cardBorder: 'border-l-4 border-l-indigo-500',
          inputBorder: 'border-indigo-200 focus:border-indigo-500',
          bgGradient: 'bg-white hover:bg-indigo-50/30',
          iconColor: 'text-indigo-500',
        };
      case FieldType.DATE:
        return {
          cardBorder: 'border-l-4 border-l-teal-500',
          inputBorder: 'border-teal-200 focus:border-teal-500',
          bgGradient: 'bg-white hover:bg-teal-50/30',
          iconColor: 'text-teal-500',
        };
      case FieldType.TIME:
        return {
          cardBorder: 'border-l-4 border-l-cyan-500',
          inputBorder: 'border-cyan-200 focus:border-cyan-500',
          bgGradient: 'bg-white hover:bg-cyan-50/30',
          iconColor: 'text-cyan-500',
        };
      case FieldType.RATE:
        return {
          cardBorder: 'border-l-4 border-l-yellow-500',
          inputBorder: 'border-yellow-200 focus:border-yellow-500',
          bgGradient: 'bg-white hover:bg-yellow-50/30',
          iconColor: 'text-yellow-500',
        };
      case FieldType.FULLNAME:
      case FieldType.ADDRESS:
        return {
            cardBorder: 'border-l-4 border-l-slate-500',
            inputBorder: 'border-slate-200 focus:border-slate-500',
            bgGradient: 'bg-white hover:bg-slate-50/30',
            iconColor: 'text-slate-500',
        };
      case FieldType.HEADER:
      case FieldType.PARAGRAPH:
        return {
            cardBorder: 'border-l-4 border-l-gray-600',
            inputBorder: 'border-gray-200 focus:border-gray-600',
            bgGradient: 'bg-white hover:bg-gray-50/30',
            iconColor: 'text-gray-600',
        };
      case FieldType.SUBMIT:
        return {
            cardBorder: 'border-l-4 border-l-black',
            inputBorder: 'border-black focus:border-black',
            bgGradient: 'bg-white hover:bg-gray-100',
            iconColor: 'text-black',
        };
      default:
        return {
          cardBorder: 'border-l-4 border-l-gray-300',
          inputBorder: 'border-gray-200 focus:border-gray-400',
          bgGradient: 'bg-white',
          iconColor: 'text-gray-400',
        };
    }
  };
  
  const fieldStyle = useMemo(() => getFieldStyle(), [field.type]);

  const renderFieldPreview = () => {
    // If overlay, modify ID to prevent duplicates in DOM
    const displayField = isOverlay ? { ...field, id: `${field.id}-overlay` } : field;
    const props = { field: displayField, fieldStyle };
    
    switch (field.type) {
      case FieldType.TEXT: return <ShortTextField {...props} />;
      case FieldType.EMAIL: return <EmailField {...props} />;
      case FieldType.PHONE: return <PhoneField {...props} />;
      case FieldType.NUMBER: return <NumberField {...props} />;
      case FieldType.TEXTAREA: return <LongTextField {...props} />;
      case FieldType.DROPDOWN: return <DropdownField {...props} />;
      case FieldType.RADIO: return <RadioField {...props} />;
      case FieldType.CHECKBOX: return <CheckboxField {...props} />;
      case FieldType.DATE:
      case FieldType.TIME: return <DateField {...props} />;
    // ...
      case FieldType.RATE: return <RateField {...props} />;
      case FieldType.DIVIDER:
      case FieldType.SECTION_COLLAPSE:
          return <HeaderField {...props} isSelected={isSelected} onSelect={onSelect} />;
      case FieldType.PAGE_BREAK:
          return null; // Handled explicitly in main layout
      case FieldType.SUBMIT:
          return <SubmitField {...props} />;
      case FieldType.PARAGRAPH:
          return <ParagraphField {...props} isSelected={isSelected} onSelect={onSelect} />;
      case FieldType.FULLNAME: return <FullNameField {...props} />;
      case FieldType.ADDRESS: return <AddressField {...props} />;
      default: return <ShortTextField {...props} />;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${field.type === FieldType.HEADER ? '' : ''}`}>
      <div
        ref={setNodeRef}
        style={style}
        data-field-id={field.id}
        onMouseDown={() => {
          isFocusingRef.current = true;
        }}
        onClick={() => {
          // If clicking anywhere on the container and it's not selected, select it with autoFocus
          if (!isSelected) {
             onSelect(field.id, true);
          }
        }}
        className={`relative group flex-1 ${fieldStyle.bgGradient} border rounded-2xl transition-all duration-200 ${field.type === FieldType.HEADER ? 'cursor-text' : 'cursor-pointer select-none'} ${
          isSelected && !isOverlay ? `ring-2 ring-black shadow-lg z-10 border-transparent ${fieldStyle.cardBorder}` : 
          isNewFromSidebar ? `border-blue-500 ring-4 ring-blue-500/10 shadow-blue-100/50 ${fieldStyle.cardBorder}` : 
          `border-gray-200 ${fieldStyle.cardBorder} hover:border-gray-300 hover:shadow-md`
        } ${isDragging ? 'pointer-events-none opacity-80 scale-95' : ''} ${isHidden ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div
          {...attributes}
          {...listeners}
          className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 cursor-grab active:cursor-grabbing p-2`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`w-12 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}></div>
        </div>
        <div className="px-4 pb-4 pt-6" style={field.type === FieldType.HEADER || field.type === FieldType.PARAGRAPH ? { pointerEvents: 'auto' } : {}}>
          {field.type === FieldType.HEADER || field.type === FieldType.PARAGRAPH ? (
            <div 
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('h2, p, div[contenteditable="true"]') || target.isContentEditable || target.closest('[contenteditable="true"]')) {
                  e.stopPropagation();
                }
              }}
              className="cursor-text"
              style={{ userSelect: 'text', pointerEvents: 'auto' }}
            >
              {renderFieldPreview()}
            </div>
          ) : field.type === FieldType.PAGE_BREAK ? (
             // Minimal Page Break Display - No Label Editing, No Properties Interaction
            <div className="flex flex-col items-center justify-center py-2 opacity-60">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-widest">
                   {renderFieldPreview()}
                   <span>Page Break</span>
                </div>
                <div className="w-full border-b border-dashed border-gray-300 mt-2"></div>
            </div>
          ) : (
            <>
              {(() => {
                 const labelAlignment = field.options?.labelAlignment || 'TOP';
                 const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';
                 
                 return (
                   <div className={`${isRowLayout ? 'flex items-start gap-6' : ''}`}>
                      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-3' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
                        <div className={`flex items-start gap-1 ${labelAlignment === 'RIGHT' ? 'justify-end' : ''}`}>
                          <div
                            ref={labelInputRef}
                            contentEditable={isSelected}
                            suppressContentEditableWarning
                            className="font-medium text-black outline-none cursor-text w-full break-words"
                            style={{ 
                              pointerEvents: 'auto', 
                              userSelect: 'text', 
                              WebkitUserSelect: 'text',
                              minHeight: '1.5em'
                            }}
                            dangerouslySetInnerHTML={labelHtml}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              isFocusingRef.current = true;
                              // Force focus immediately
                              if (labelInputRef.current) {
                                labelInputRef.current.focus();
                              }
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isSelected) {
                                onSelect(field.id, true);
                              }
                            }}
                            onBlur={(e) => {
                               const newText = e.currentTarget.textContent || '';
                               if (newText !== field.label) {
                                 updateField(field.id, { label: newText });
                               }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                e.currentTarget.blur();
                              }
                            }}
                          />
                          {field.required && (
                            <span className="text-red-500 select-none -mt-1 text-lg leading-none">*</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {renderFieldPreview()}
                        {field.options?.subLabel && (
                          <p className="text-xs text-gray-500 mt-2">{field.options.subLabel}</p>
                        )}
                      </div>
                   </div>
                 );
              })()}
            </>
          )}
        </div>
      </div>
      {!isOverlay && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(e);
          }}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-black"
          title="Delete field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default React.memo(FieldItem);
