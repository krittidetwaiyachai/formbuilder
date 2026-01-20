import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useBundleEditorStore, BundleField } from '@/store/bundleEditorStore';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Field, FieldType } from '@/types';
import { useTranslation } from 'react-i18next';

import { ShortTextField } from '@/components/form-builder/fields/short-text';
import { EmailField } from '@/components/form-builder/fields/email';
import { PhoneField } from '@/components/form-builder/fields/phone/PhoneField';
import { NumberField } from '@/components/form-builder/fields/number';
import { LongTextField } from '@/components/form-builder/fields/long-text/LongTextField';
import { DropdownField } from '@/components/form-builder/fields/dropdown/DropdownField';
import { RadioField } from '@/components/form-builder/fields/radio/RadioField';
import { CheckboxField } from '@/components/form-builder/fields/checkbox/CheckboxField';
import { DateField } from '@/components/form-builder/fields/date/DateField';
import { TimeField } from '@/components/form-builder/fields/time/TimeField';
import { RateField } from '@/components/form-builder/fields/rate/RateField';
import { HeaderField } from '@/components/form-builder/fields/header/HeaderField';
import { FullNameField } from '@/components/form-builder/fields/full-name/FullNameField';
import { AddressField } from '@/components/form-builder/fields/address/AddressField';
import { ParagraphField } from '@/components/form-builder/fields/paragraph/ParagraphField';
import { DividerField } from '@/components/form-builder/fields/divider/DividerField';
import { SubmitField } from '@/components/form-builder/fields/submit/SubmitField';
import { GroupField } from '@/components/form-builder/fields/group/GroupField';
import { MatrixField } from '@/components/form-builder/fields/matrix/MatrixField';
import { TableField } from '@/components/form-builder/fields/table/TableField';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { RichTextToolbar } from '@/components/ui/RichTextToolbar';

const getFieldStyle = (field: Field) => {
    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
        return {
          cardBorder: 'border-l-4 border-l-blue-500',
          iconColor: 'text-blue-500',
          bgGradient: 'bg-gradient-to-r from-blue-50/50 to-transparent',
          inputBorder: 'border-blue-200',
          overlayBorder: 'border-blue-500'
        };

      case FieldType.NUMBER:
        return {
          cardBorder: 'border-l-4 border-l-amber-500',
          iconColor: 'text-amber-500',
          bgGradient: 'bg-gradient-to-r from-amber-50/50 to-transparent',
          inputBorder: 'border-amber-200',
          overlayBorder: 'border-amber-500'
        };

      case FieldType.EMAIL:
      case FieldType.PHONE:
        return {
          cardBorder: 'border-l-4 border-l-purple-600',
          iconColor: 'text-purple-600',
          bgGradient: 'bg-gradient-to-r from-purple-50/50 to-transparent',
          inputBorder: 'border-purple-200',
          overlayBorder: 'border-purple-600'
        };

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

      case FieldType.SUBMIT:
        return {
          cardBorder: 'border-l-4 border-l-emerald-500',
          iconColor: 'text-emerald-500',
          bgGradient: 'bg-gradient-to-r from-emerald-50/50 to-transparent',
          inputBorder: 'border-emerald-200',
          overlayBorder: 'border-emerald-500'
        };

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

export function BundleFieldCard({ 
    field, 
    isSelected, 
    renderContent,
    isOverlay = false,
    isDragging = false
}: { 
    field: BundleField | Field, 
    isSelected?: boolean, 
    renderContent?: () => React.ReactNode,
    isOverlay?: boolean,
    isDragging?: boolean
}) {
  const { t } = useTranslation();
  const { setSelectedFieldId, deleteField, updateField } = useBundleEditorStore();
  
  const renderField = { ...field } as unknown as Field;
  const fieldStyle = getFieldStyle(renderField);

  const content = renderContent ? renderContent() : (() => {
     switch (renderField.type) {
        case FieldType.TEXT: return <ShortTextField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.TEXTAREA: return <LongTextField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.NUMBER: return <NumberField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.EMAIL: return <EmailField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.PHONE: return <PhoneField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.DROPDOWN: return <DropdownField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.CHECKBOX: return <CheckboxField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.RADIO: return <RadioField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.DATE: return <DateField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.TIME: return <TimeField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.RATE: return <RateField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.HEADER: return <HeaderField field={renderField} fieldStyle={fieldStyle} isSelected={isSelected} onSelect={() => {}} />;
        case FieldType.FULLNAME: return <FullNameField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.ADDRESS: return <AddressField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.PARAGRAPH: return <ParagraphField field={renderField} fieldStyle={fieldStyle} isSelected={isSelected} onSelect={() => {}} />;
        case FieldType.DIVIDER: return <DividerField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.SUBMIT: return <SubmitField field={renderField} fieldStyle={fieldStyle} />;
        case FieldType.MATRIX: return <MatrixField field={renderField} fieldStyle={fieldStyle} isSelected={isSelected} updateField={() => {}} />;
        case FieldType.TABLE: return <TableField field={renderField} isSelected={isSelected} updateField={() => {}} />;
        case FieldType.GROUP: return <GroupField field={renderField} isSelected={isSelected} childFields={[]} allFields={[]} onSelectField={() => {}} selectedFieldId={null} />;
        default: return <div className="p-4 text-gray-500 text-sm italic">Unknown field type: {field.type}</div>;
    }
  })();

  const modules = React.useMemo(() => ({
    toolbar: {
      container: `#toolbar-label-${field.id}`,
    }
  }), [field.id]);

  const isRowLayout = renderField.options?.labelAlignment === 'LEFT' || renderField.options?.labelAlignment === 'RIGHT';
  const labelAlignment = renderField.options?.labelAlignment || 'TOP';
  const isCenterAligned = labelAlignment === 'CENTER';
  const isLayoutField = [FieldType.HEADER, FieldType.PARAGRAPH, FieldType.DIVIDER, FieldType.PAGE_BREAK, FieldType.SECTION_COLLAPSE].includes(renderField.type);

  return (
    <div className={cn(
      "flex items-center gap-3 relative group/wrap",
      isOverlay && "shadow-2xl"
    )}>
       
       {isSelected && !isLayoutField && !isOverlay && (
            <div className="absolute -top-12 left-0 right-0 z-[60] flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                    <RichTextToolbar id={`toolbar-label-${field.id}`} />
                </div>
            </div>
        )}

        <div
            onClick={(e) => {
                e.stopPropagation();
                if (!isOverlay) setSelectedFieldId(field.id);
            }}
            className={cn(
                "relative group/field isolate flex-1 min-w-0 bg-white transition-colors duration-200 rounded-2xl border-t border-r border-b",
                !isOverlay && "cursor-pointer",
                fieldStyle.bgGradient,
                isSelected 
                  ? "ring-2 ring-black shadow-lg z-10" 
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md",
                fieldStyle.cardBorder
            )}
        >
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 p-4 touch-none select-none outline-none ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}>
                <div className={`w-12 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}></div>
            </div>

             <div className="px-4 pb-4 pt-6">
                {isLayoutField ? (
                    content
                ) : (
                    <div className={cn(isRowLayout ? 'flex items-start gap-6 relative' : '')}>
                        <div className={cn(
                            isRowLayout ? 'w-48 flex-shrink-0 pt-3' : 'mb-3',
                            labelAlignment === 'RIGHT' ? 'text-right' : '',
                            isCenterAligned ? 'text-center' : ''
                        )}>
                             <div className={cn('flex gap-0.5', 
                                 labelAlignment === 'RIGHT' ? 'justify-end' : isCenterAligned ? 'justify-center' : 'justify-start'
                             )}>
                                 <div className="relative group/editor max-w-full">
                                     {isSelected && !isOverlay ? (
                                        <RichTextEditor
                                            theme="snow"
                                            value={field.label || ''}
                                            onChange={(value) => updateField(field.id, { label: value })}
                                            placeholder={t('common.question')}
                                            modules={modules}
                                            className={cn(
                                                "text-base font-medium text-black leading-tight borderless animate-slide-down min-h-[1.5em]",
                                                labelAlignment === 'RIGHT' ? 'text-right' : '',
                                                isCenterAligned ? 'text-center' : ''
                                            )}
                                        />
                                     ) : (
                                        <div 
                                            className="font-medium text-black break-words max-w-full ql-editor !p-0"
                                            dangerouslySetInnerHTML={{ __html: field.label || t('common.question') }}
                                        />
                                     )}
                                 </div>
                                 
                                 {renderField.required && (!isSelected || isOverlay) && (
                                     <span className="text-red-500 select-none text-lg leading-none shrink-0">*</span>
                                 )}
                             </div>
                        </div>

                        <div className={cn(
                            "flex-1 min-w-0 w-full max-w-full pb-3",
                            field.type === FieldType.GROUP ? "overflow-visible" : "overflow-x-auto"
                        )}>
                            {content}
                            
                            {(isSelected || field.options?.subLabel) && !isOverlay && (
                                <div className="mt-2 text-sm text-gray-500">
                                   {isSelected ? (
                                        <RichTextEditor
                                            theme="bubble"
                                            value={field.options?.subLabel || ''}
                                            onChange={(value) => updateField(field.id, { options: { ...field.options, subLabel: value } })}
                                            placeholder={t('builder.sublabel', 'Sublabel')}
                                            className="sublabel-editor"
                                        />
                                   ) : (
                                       <div 
                                           className="ql-editor !p-0"
                                           dangerouslySetInnerHTML={{ __html: field.options?.subLabel }}
                                       />
                                   )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
             </div>
        </div>

        {!isLayoutField && !isOverlay && (
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    deleteField(field.id);
                }}
                className={cn(
                    "flex-shrink-0 p-1 transition-colors",
                    isSelected 
                      ? "text-gray-500 hover:text-red-500" 
                      : "text-gray-400 hover:text-red-500 opacity-0 group-hover/wrap:opacity-100" 
                )}
                title="Delete Field"
             >
                 <Trash2 className="h-4 w-4" />
             </button>
        )}
    </div>
  );
}

export default function BundleEditorCanvas() {
  const { t } = useTranslation();
  const { bundle, setSelectedFieldId, selectedFieldId } = useBundleEditorStore();

  if (!bundle) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading bundle...</p>
      </div>
    );
  }

  const sortedFields = [...bundle.fields].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-white overflow-y-auto px-4 md:px-8">
        <div className="max-w-2xl flex-grow mx-auto flex flex-col min-h-full py-8 w-full">
            <Droppable droppableId="BUNDLE-CANVAS">
              {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={(e) => {
                        if(e.target === e.currentTarget) {
                            setSelectedFieldId(null);
                        }
                    }}
                    className={cn(
                        "min-h-full flex-1 transition-all duration-200 pt-10 pb-32 relative rounded-xl bg-gray-50 border border-gray-200",
                        snapshot.isDraggingOver ? "ring-2 ring-indigo-300 ring-dashed border-transparent bg-indigo-50/30" : ""
                    )}
                >
                    {sortedFields.length > 0 ? (
                        <div className="flex flex-col gap-3 w-full px-4">
                             {sortedFields.map((field, index) => (
                                <Draggable key={field.id} draggableId={field.id} index={index}>
                                  {(dragProvided, dragSnapshot) => (
                                    <div
                                      ref={dragProvided.innerRef}
                                      {...dragProvided.draggableProps}
                                      {...dragProvided.dragHandleProps}
                                      style={dragProvided.draggableProps.style}
                                    >
                                      <BundleFieldCard 
                                        field={field} 
                                        isSelected={selectedFieldId === field.id}
                                        isDragging={dragSnapshot.isDragging}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                             ))}
                             {provided.placeholder}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                            <p className="text-sm font-medium">{t('builder.drag_drop_instructions')}</p>
                            {provided.placeholder}
                        </div>
                    )}
                </div>
              )}
            </Droppable>
        </div>
    </div>
  );
}
