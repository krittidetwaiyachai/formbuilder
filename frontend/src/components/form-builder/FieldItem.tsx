import React, { useRef, useState, useMemo } from 'react';
import { DraggableProvided } from '@hello-pangea/dnd';
import { Field, FieldType } from '@/types';
import { Trash2, ChevronRight, EyeOff } from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { ShortTextField } from './fields/short-text';
import { EmailField } from './fields/email';
import { PhoneField } from './fields/phone/PhoneField';
import { NumberField } from './fields/number';
import { LongTextField } from './fields/long-text/LongTextField';
import { DropdownField } from './fields/dropdown/DropdownField';
import { RadioField } from './fields/radio/RadioField';
import { DateField } from './fields/date/DateField';
import { TimeField } from './fields/time/TimeField';
import { RateField } from './fields/rate/RateField';
import { HeaderField } from './fields/header/HeaderField';
import { FullNameField } from './fields/full-name/FullNameField';
import { AddressField } from './fields/address/AddressField';
import { ParagraphField } from './fields/paragraph/ParagraphField';
import { SubmitField } from './fields/submit/SubmitField';
import { CheckboxField } from './fields/checkbox/CheckboxField';
import { DividerField } from './fields/divider/DividerField';
import { GroupField } from './fields/group/GroupField';
import { MatrixField } from './fields/matrix/MatrixField';
import { TableField } from './fields/table/TableField';
import InlineQuizBar from './InlineQuizBar';

interface FieldItemProps {
  field: Field;
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  onToggle?: (id: string) => void;
  onOpenContextMenu?: (e: React.MouseEvent) => void;
  isHidden?: boolean;
  isNewFromSidebar?: boolean;
  isOverlay?: boolean;
  provided?: DraggableProvided;
  isDragging?: boolean;
  disableHover?: boolean;
  allFields?: Field[];
  hideDragHandle?: boolean;
}

function FieldItem({ 
  field, 
  isSelected, 
  onSelect,
  onToggle,
  onOpenContextMenu,
  isHidden = false, 
  isNewFromSidebar = false, 
  isOverlay = false,
  provided,
  isDragging = false,
  disableHover = false,
  allFields = [],
  hideDragHandle = false
}: FieldItemProps) {
  const deleteField = useFormStore((state) => state.deleteField);
  const updateField = useFormStore((state) => state.updateField);
  const currentForm = useFormStore((state) => state.currentForm);

  const style = provided?.draggableProps.style;
  const labelInputRef = useRef<HTMLDivElement>(null);
  const isFocusingRef = useRef(false);

  // Initialize stable HTML
  const [labelHtml, setLabelHtml] = useState({ __html: field.label || (field.type === FieldType.HEADER ? 'Heading' : '') });
  
  const subLabelRef = useRef<HTMLDivElement>(null);
  const [subLabelHtml, setSubLabelHtml] = useState({ __html: field.options?.subLabel || (isSelected ? 'Sublabel' : '') });

  // Sync state with prop when field.label changes (e.g. from Properties Panel)
  React.useEffect(() => {
    const currentText = labelInputRef.current?.textContent;
    const newLabel = field.label || (field.type === FieldType.HEADER ? 'Heading' : '');
    
    // Only update internal HTML if the new label via props is different from what's currently in the DOM.
    // This prevents the cursor from jumping when We are the ones typing (Cycle: Type -> Store -> Prop -> Re-render).
    if (currentText !== newLabel) {
      setLabelHtml({ __html: newLabel });
    }
  }, [field.label, field.type]);

  React.useEffect(() => {
     const currentText = subLabelRef.current?.textContent;
     const newSubLabel = field.options?.subLabel || (isSelected ? 'Sublabel' : '');
     // Just a loose check, if we are typing "Sublabel" as placeholder it might differ
     if (currentText !== newSubLabel) {
         setSubLabelHtml({ __html: newSubLabel });
     }
  }, [field.options?.subLabel, isSelected]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the field if not already selected
    if (!isSelected) {
        onSelect(field.id, false);
    }
    
    // Call Parent Handler
    if (onOpenContextMenu) {
        onOpenContextMenu(e);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteField(field.id);
  };
  

  const getFieldStyle = () => {
    switch (field.type) {
      // Input / Text Fields -> Blue
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
        return {
          cardBorder: 'border-l-4 border-l-blue-500',
          iconColor: 'text-blue-500',
          bgGradient: 'bg-gradient-to-r from-blue-50/50 to-transparent',
          inputBorder: 'border-blue-200',
          overlayBorder: 'border-blue-500'
        };

      // numeric -> Amber (Distinct from Orange)
      case FieldType.NUMBER:
        return {
          cardBorder: 'border-l-4 border-l-amber-500',
          iconColor: 'text-amber-500',
          bgGradient: 'bg-gradient-to-r from-amber-50/50 to-transparent',
          inputBorder: 'border-amber-200',
          overlayBorder: 'border-amber-500'
        };

      // Contact Info -> Purple (Distinct from Blue)
      case FieldType.EMAIL:
      case FieldType.PHONE:
        return {
          cardBorder: 'border-l-4 border-l-purple-600',
          iconColor: 'text-purple-600',
          bgGradient: 'bg-gradient-to-r from-purple-50/50 to-transparent',
          inputBorder: 'border-purple-200',
          overlayBorder: 'border-purple-600'
        };

      // Choices -> Pink (Distinct from Purple/Red)
      case FieldType.DROPDOWN:
      case FieldType.CHECKBOX:
      case FieldType.RADIO:
      case FieldType.MATRIX:
        return {
          cardBorder: 'border-l-4 border-l-pink-500',
          iconColor: 'text-pink-500',
          bgGradient: 'bg-gradient-to-r from-pink-50/50 to-transparent',
          inputBorder: 'border-pink-200',
          overlayBorder: 'border-pink-500'
        };

      // Date / Time / Rate -> Teal (Distinct from Blue/Green)
      case FieldType.DATE:
      case FieldType.TIME:
      case FieldType.RATE:
        return {
          cardBorder: 'border-l-4 border-l-teal-500',
          iconColor: 'text-teal-500',
          bgGradient: 'bg-gradient-to-r from-teal-50/50 to-transparent',
          inputBorder: 'border-teal-200',
          overlayBorder: 'border-teal-500'
        };

      // Personal Info -> Orange (Distinct from Amber)
      case FieldType.FULLNAME:
      case FieldType.ADDRESS:
        return {
          cardBorder: 'border-l-4 border-l-orange-500',
          iconColor: 'text-orange-500',
          bgGradient: 'bg-gradient-to-r from-orange-50/50 to-transparent',
          inputBorder: 'border-orange-200',
          overlayBorder: 'border-orange-500'
        };

      case FieldType.HEADER:
      case FieldType.PARAGRAPH:
      case FieldType.DIVIDER:
      case FieldType.SECTION_COLLAPSE:
      case FieldType.GROUP:
        return {
          cardBorder: 'border-l-4 border-l-slate-600',
          iconColor: 'text-slate-600',
          bgGradient: 'bg-gradient-to-r from-slate-100 to-transparent',
          inputBorder: 'border-transparent',
          overlayBorder: 'border-slate-600'
        };

      case FieldType.PAGE_BREAK:
        return {
           cardBorder: 'border-l-4 border-l-slate-500 border-y border-r border-gray-200 rounded-lg overflow-hidden shadow-sm',
           iconColor: 'text-slate-500',
           bgGradient: 'bg-gradient-to-r from-slate-100 to-transparent',
           inputBorder: 'border-transparent',
           overlayBorder: 'border-slate-500'
        };

      // Action -> Emerald
      case FieldType.SUBMIT:
        return {
          cardBorder: 'border-l-4 border-l-emerald-500',
          iconColor: 'text-emerald-500',
          bgGradient: 'bg-gradient-to-r from-emerald-50/50 to-transparent',
          inputBorder: 'border-emerald-200',
          overlayBorder: 'border-emerald-500'
        };

      // Default
      default:
        return {
          cardBorder: 'border-l-4 border-l-gray-400',
          iconColor: 'text-gray-400',
          bgGradient: 'bg-white',
          inputBorder: 'border-gray-200',
          overlayBorder: 'border-gray-400'
        };
    }
  };

  const fieldStyle = useMemo(() => getFieldStyle(), [field.type, disableHover]);

  const renderFieldPreview = () => {
    switch (field.type) {
      case FieldType.TEXT:
        return <ShortTextField field={field} fieldStyle={fieldStyle} />;
      case FieldType.TEXTAREA:
        return <LongTextField field={field} fieldStyle={fieldStyle} />;
      case FieldType.NUMBER:
        return <NumberField field={field} fieldStyle={fieldStyle} />;
      case FieldType.EMAIL:
        return <EmailField field={field} fieldStyle={fieldStyle} />;
      case FieldType.PHONE:
        return <PhoneField field={field} fieldStyle={fieldStyle} />;
      case FieldType.DROPDOWN:
        return <DropdownField field={field} fieldStyle={fieldStyle} />;
      case FieldType.CHECKBOX:
        return <CheckboxField field={field} fieldStyle={fieldStyle} />;
      case FieldType.RADIO:
        return <RadioField field={field} fieldStyle={fieldStyle} />;
      case FieldType.DATE:
        return <DateField field={field} fieldStyle={fieldStyle} />;
      case FieldType.TIME:
        return <TimeField field={field} fieldStyle={fieldStyle} />;
      case FieldType.RATE:
        return <RateField field={field} fieldStyle={fieldStyle} />;
      case FieldType.HEADER:
        return <HeaderField field={field} fieldStyle={fieldStyle} isSelected={isSelected} onSelect={onSelect} />;
      case FieldType.FULLNAME:
        return <FullNameField field={field} fieldStyle={fieldStyle} />;
      case FieldType.ADDRESS:
        return <AddressField field={field} fieldStyle={fieldStyle} />;
      case FieldType.PARAGRAPH:
        return <ParagraphField field={field} fieldStyle={fieldStyle} isSelected={isSelected} onSelect={onSelect} />;
      case FieldType.DIVIDER:
        return <DividerField field={field} fieldStyle={fieldStyle} />;
      case FieldType.SECTION_COLLAPSE:
         return (
             <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 font-medium">
                <ChevronRight className="w-5 h-5" />
                <span>{field.label || 'Collapsible Section'}</span>
             </div>
         );
      case FieldType.SUBMIT:
        return <SubmitField field={field} fieldStyle={fieldStyle} />;
      case FieldType.GROUP:
        const childFields = allFields.filter(f => f.groupId === field.id);
        return (
          <GroupField 
            field={field} 
            isSelected={isSelected} 
            childFields={childFields} 
            allFields={allFields}
            onSelectField={onSelect}
            selectedFieldId={isSelected ? field.id : null}
          />
        );
      case FieldType.MATRIX:
        return (
          <MatrixField 
            field={field} 
            fieldStyle={fieldStyle} 
            isSelected={isSelected}
            updateField={updateField}
          />
        );
      case FieldType.TABLE:
        return (
          <TableField 
            field={field} 
            isSelected={isSelected}
            updateField={updateField}
          />
        );
      case FieldType.PAGE_BREAK:
        return (
             <div className="flex flex-col items-center justify-center py-4 w-full">
                 <div className="flex items-center gap-3 text-sm font-semibold text-gray-500 uppercase tracking-widest bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    Page Break
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                 </div>
                 <div className="w-full border-b-2 border-dashed border-gray-300 mt-4 relative">
                    <div className="absolute left-0 -top-1 w-1 h-3 bg-gray-300"></div>
                    <div className="absolute right-0 -top-1 w-1 h-3 bg-gray-300"></div>
                 </div>
                 <p className="mt-2 text-xs text-gray-400">Content below this line will appear on the next page</p>
             </div>
        );
      default:
        return null;
    }
  };

  const isPageBreak = field.type === FieldType.PAGE_BREAK;

  // Render for DragOverlay
  if (isOverlay) {
    return (
      <div 
        style={style}
        className={`w-[calc(105%-4rem)] bg-white rounded-xl shadow-2xl p-4 border-2 ${fieldStyle.overlayBorder} ${fieldStyle.cardBorder} ring-4 ring-black/5 cursor-grabbing`}
      >
          <div className="flex justify-center mb-3">
              <div className="w-8 h-1 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center gap-2 mb-2">
              <div className={`font-medium text-base truncate ${fieldStyle.iconColor}`}>{field.label || 'Untitled Field'}</div>
          </div>
          <div className="h-8 w-full bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">
              {field.type} Field
          </div>
      </div>
    );
  }

  const isShrunk = field.options?.shrink || field.shrink;

  return (
    <>
        <div className={`flex items-center gap-3 transition-all duration-200 ${
          isShrunk ? 'w-[calc(50%-0.375rem)]' : 'w-full'
        } ${field.type === FieldType.HEADER ? '' : ''}`}>
          <div
            ref={provided?.innerRef}
            {...provided?.draggableProps}
            style={style}
            data-field-id={field.id}
            onContextMenu={handleContextMenu} // Attach Context Menu Handler
            onMouseDown={() => {
              isFocusingRef.current = true;
            }}
            onClick={(e) => {
               e.stopPropagation();
               // Multi-Selection Logic
               if ((e.ctrlKey || e.metaKey)) {
                   if (onToggle) {
                       onToggle(field.id);
                   }
               } else {
                   // Single Selection
                   if (!isSelected) {
                       onSelect(field.id, false);
                   }
               }
            }}
            className={`relative group/field isolate flex-1 ${fieldStyle.bgGradient} ${isPageBreak ? '' : 'border rounded-2xl'} transition-colors duration-200 ${field.type === FieldType.HEADER ? 'cursor-text' : 'cursor-pointer'} ${
              isSelected && !isOverlay ? `ring-2 ring-black shadow-lg z-10 border-transparent ${fieldStyle.cardBorder}` : 
              isNewFromSidebar ? `border-blue-500 ring-4 ring-blue-500/10 shadow-blue-100/50 ${fieldStyle.cardBorder}` : 
              `${isPageBreak ? '' : 'border-gray-200'} ${fieldStyle.cardBorder} ${isPageBreak ? '' : (disableHover ? '' : 'hover:border-gray-300 hover:shadow-md')}`
            } ${isDragging ? 'shadow-2xl rotate-1 w-[320px]' : ''} ${isHidden ? 'opacity-50' : ''}`}
          >
            {/* ... Content of FieldItem (Drag Handle, Label, etc.) */}
            {!hideDragHandle && (
              <div
                {...provided?.dragHandleProps}
                className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 cursor-grab active:cursor-grabbing p-2`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`w-12 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}></div>
              </div>
            )}
            {/* Hidden Indicator */}
            {(field.validation?.hidden || field.options?.hidden) && !isOverlay && !isDragging && (
                <div className="absolute top-2 right-2 z-20 bg-gray-100/80 p-1 rounded-full text-gray-500 backdrop-blur-sm" title="This field is hidden">
                    <EyeOff className="h-4 w-4" />
                </div>
            )}

            <div className={`${isDragging ? 'px-4 py-6' : 'px-4 pb-4 pt-6'}`} style={(!isDragging && (field.type === FieldType.HEADER || field.type === FieldType.PARAGRAPH || field.type === FieldType.DIVIDER)) ? { pointerEvents: 'auto' } : {}}>
              {/* ... Field Content Rendering */}
              {field.type === FieldType.HEADER || field.type === FieldType.PARAGRAPH || field.type === FieldType.DIVIDER || field.type === FieldType.PAGE_BREAK ? (
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
               ) : (
                 <>
                   {(() => {
                      const labelAlignment = field.options?.labelAlignment || 'TOP';
                      const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';
                      
                      return (
                        <div className={`${isRowLayout ? 'flex items-start gap-6' : ''}`}>
                           <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-3' : (isDragging ? 'mb-1' : 'mb-3')} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
                             <div className={`flex items-start gap-1 ${labelAlignment === 'RIGHT' ? 'justify-end' : ''}`}>
                                 <div
                                 ref={labelInputRef}
                                 contentEditable={isSelected}
                                 suppressContentEditableWarning
                                 spellCheck={false}
                                 className="font-medium text-black outline-none cursor-text break-words max-w-full"
                                 style={{ 
                                   pointerEvents: 'auto', 
                                   userSelect: 'text', 
                                   WebkitUserSelect: 'text',
                                   minHeight: '1.5em',
                                   minWidth: '1px' 
                                 }}
                                 dangerouslySetInnerHTML={labelHtml}
                                 onMouseDown={(e) => {
                                   e.stopPropagation();
                                   isFocusingRef.current = true;
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
                                 onInput={(e) => {
                                    const newText = e.currentTarget.textContent || '';
                                    updateField(field.id, { label: newText });
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
                             {(isOverlay || isDragging) ? (
                                 <div className="h-10 bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">
                                     {field.type === FieldType.TEXTAREA ? 'Long Text' : field.type === FieldType.ADDRESS ? 'Address' : `${field.type} Field`}
                                 </div>
                             ) : (
                                 <>
                                     {renderFieldPreview()}
                                      {![FieldType.HEADER, FieldType.PARAGRAPH, FieldType.DIVIDER, FieldType.SUBMIT, FieldType.PAGE_BREAK, FieldType.GROUP, FieldType.SECTION_COLLAPSE].includes(field.type) && (isSelected || (field.options?.subLabel && field.options.subLabel !== 'Sublabel')) && (
                                        <div
                                            ref={subLabelRef}
                                            contentEditable={isSelected}
                                            suppressContentEditableWarning
                                            spellCheck={false}
                                            className={`text-xs mt-2 outline-none cursor-text w-full break-words min-h-[1.25em] ${(field.options?.subLabel && field.options.subLabel !== 'Sublabel') ? 'text-gray-500' : 'text-gray-300'}`}
                                            dangerouslySetInnerHTML={subLabelHtml}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isSelected) {
                                                    onSelect(field.id, false);
                                                }
                                            }}
                                            onFocus={(e) => {
                                                const currentText = e.currentTarget.textContent;
                                                if (currentText === 'Sublabel') {
                                                    e.currentTarget.textContent = '';
                                                }
                                            }}
                                            onInput={(e) => {
                                                const newText = e.currentTarget.textContent || '';
                                                updateField(field.id, { options: { ...field.options, subLabel: newText } });
                                            }}
                                            onBlur={(e) => {
                                                const newText = e.currentTarget.textContent?.trim() || '';
                                                // Don't save "Sublabel" as actual data, save empty instead
                                                const valueToSave = (newText === 'Sublabel' || !newText) ? '' : newText;
                                                if (valueToSave !== field.options?.subLabel) {
                                                    updateField(field.id, { options: { ...field.options, subLabel: valueToSave } });
                                                }
                                                // Show placeholder when selected and empty
                                                if (!valueToSave && isSelected) {
                                                    e.currentTarget.textContent = 'Sublabel';
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />
                                      )}
                                 </>
                             )}
                           </div>
                        </div>
                      );
                   })()}
                 </>
               )}
            </div>
             
            {/* Inline Quiz Bar */}
            {isSelected && currentForm?.isQuiz && !isOverlay && !isDragging && (
              <InlineQuizBar
                field={field}
                currentForm={currentForm}
                allFields={allFields}
                onUpdate={updateField}
              />
            )}
          </div>
          {!isOverlay && !isDragging && !field.groupId && (
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
    </>
  );
}

export default React.memo(FieldItem);
