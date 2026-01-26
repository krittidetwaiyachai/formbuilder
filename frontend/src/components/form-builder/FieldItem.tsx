import React, { useRef, useState, useMemo } from 'react';
import { DraggableProvided } from '@hello-pangea/dnd';
import { Field, FieldType } from '@/types';
import { Trash2, ChevronRight, EyeOff, Settings, Image, Video } from 'lucide-react';
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
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { RichTextToolbar } from '@/components/ui/RichTextToolbar';
import { useTranslation } from 'react-i18next';
import { sanitize } from '@/utils/sanitization';
import { FloatingActionMenu } from './FloatingActionMenu';

interface FieldItemProps {
  field: Field;
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  onToggle?: (id: string) => void;
  onOpenContextMenu?: (e: React.MouseEvent) => void;
  onOpenProperties?: () => void;
  isHidden?: boolean;
  isNewFromSidebar?: boolean;
  isOverlay?: boolean;
  provided?: DraggableProvided;
  isDragging?: boolean;
  disableHover?: boolean;
  allFields?: Field[];
  hideDragHandle?: boolean;
  isMultiSelecting?: boolean;
}

function FieldItem({ 
  field, 
  isSelected, 
  onSelect,
  onToggle,
  onOpenContextMenu,
  onOpenProperties,
  isHidden = false, 
  isNewFromSidebar = false, 
  isOverlay = false,
  provided,
  isDragging = false,
  disableHover = false,
  allFields = [],
  hideDragHandle = false,
  isMultiSelecting = false
}: FieldItemProps) {
  const deleteField = useFormStore((state) => state.deleteField);
  const updateField = useFormStore((state) => state.updateField);
  const currentForm = useFormStore((state) => state.currentForm);

  const style = provided?.draggableProps.style;

  const isFocusingRef = useRef(false);
  const { t } = useTranslation();

  const subLabelRef = useRef<HTMLDivElement>(null);
  const [subLabelHtml, setSubLabelHtml] = useState({ __html: sanitize(field.options?.subLabel) || (isSelected ? t('common.sublabel') : '') });
  
  const [mediaInputMode, setMediaInputMode] = useState<'image' | 'video' | null>(null);

  React.useEffect(() => {
     const currentText = subLabelRef.current?.textContent;
     const newSubLabel = field.options?.subLabel || (isSelected ? t('common.sublabel') : '');
     if (currentText !== newSubLabel) {
         setSubLabelHtml({ __html: sanitize(newSubLabel) });
     }
  }, [field.options?.subLabel, isSelected, t]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ('ontouchstart' in window) {
      return;
    }
    
    if (!isSelected) {
        onSelect(field.id, false);
    }
    
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
        return <HeaderField field={field} fieldStyle={fieldStyle} isSelected={isSelected} onSelect={onSelect} isMultiSelecting={isMultiSelecting} />;
      case FieldType.FULLNAME:
        return <FullNameField field={field} fieldStyle={fieldStyle} />;
      case FieldType.ADDRESS:
        return <AddressField field={field} fieldStyle={fieldStyle} />;
      case FieldType.PARAGRAPH:
        return <ParagraphField field={field} fieldStyle={fieldStyle} isSelected={isSelected} onSelect={onSelect} isMultiSelecting={isMultiSelecting} />;
      case FieldType.DIVIDER:
        return <DividerField field={field} fieldStyle={fieldStyle} />;
      case FieldType.SECTION_COLLAPSE:
         return (
             <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-600 font-medium">
                <ChevronRight className="w-5 h-5" />
                <span>{field.label || t('common.collapsible_section')}</span>
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
                    {t('common.page_break')}
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                 </div>
                 <div className="w-full border-b-2 border-dashed border-gray-300 mt-4 relative">
                    <div className="absolute left-0 -top-1 w-1 h-3 bg-gray-300"></div>
                    <div className="absolute right-0 -top-1 w-1 h-3 bg-gray-300"></div>
                 </div>
                 <p className="mt-2 text-xs text-gray-400">{t('common.content_next_page')}</p>
             </div>
        );
      default:
        return null;
    }
  };

  const isPageBreak = field.type === FieldType.PAGE_BREAK;

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
              <div className={`font-medium text-base truncate ${fieldStyle.iconColor}`}>{field.label || t('common.untitled_field')}</div>
          </div>
          <div className="h-8 w-full bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">
              {t(`builder.fields.${field.type.toLowerCase()}`, field.type)} {t('common.field')}
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
            onContextMenu={handleContextMenu}
            onMouseDown={() => {
              isFocusingRef.current = true;
            }}
            onClick={(e) => {
               e.stopPropagation();
               if ((e.ctrlKey || e.metaKey)) {
                   if (onToggle) {
                       onToggle(field.id);
                   }
               } else {
                   if (!isSelected) {
                       onSelect(field.id, false);
                   }
               }
            }}
            className={`relative group/field isolate flex-1 min-w-0 bg-white ${fieldStyle.bgGradient} ${isPageBreak ? '' : 'border rounded-2xl'} transition-colors duration-200 ${field.type === FieldType.HEADER ? 'cursor-text' : 'cursor-pointer'} ${
              isSelected && !isOverlay ? `ring-2 ring-black shadow-lg z-40 border-transparent ${fieldStyle.cardBorder}` : 
              isNewFromSidebar ? `border-blue-500 ring-4 ring-blue-500/10 shadow-blue-100/50 ${fieldStyle.cardBorder}` : 
              `${isPageBreak ? '' : 'border-gray-200'} ${fieldStyle.cardBorder} ${isPageBreak ? '' : (disableHover ? '' : 'hover:border-gray-300 hover:shadow-md hover:z-30')}`
            } ${isDragging ? 'shadow-2xl rotate-1 w-[320px] !bg-white !opacity-100 z-[9999]' : ''} ${isHidden ? 'opacity-50' : ''}`}
          >
            {!hideDragHandle && (
              <div
                {...provided?.dragHandleProps}
                className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 cursor-grab active:cursor-grabbing p-4 touch-none select-none`}
                onClick={(e) => e.stopPropagation()}
                style={{ touchAction: 'none' }}
              >
                <div className={`w-12 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}></div>
              </div>
            )}

            {!isOverlay && !isDragging && (
                <div className={`absolute top-0 bottom-0 -right-14 w-14 flex items-center justify-center z-50 transition-all duration-200 ${
                    isSelected 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-2 pointer-events-none group-hover/field:opacity-100 group-hover/field:translate-x-0 group-hover/field:pointer-events-auto'
                }`}>
                     <button
                         onClick={(e) => {
                             e.stopPropagation();
                             deleteField(field.id);
                         }}
                         className="h-10 w-10 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full shadow-sm border border-gray-200 transition-all hover:scale-110 hover:shadow-md"
                         title={t('common.delete_field')}
                     >
                         <Trash2 className="h-5 w-5" />
                     </button>
                </div>
            )}
            {(field.validation?.hidden || field.options?.hidden) && !isOverlay && !isDragging && (
                <div className="absolute top-2 right-2 z-20 bg-gray-100/80 p-1 rounded-full text-gray-500 backdrop-blur-sm" title={t('common.field_hidden')}>
                    <EyeOff className="h-4 w-4" />
                </div>
            )}

            <div className={`${isDragging ? 'px-4 py-6' : 'px-4 pb-4 pt-6'}`} style={(!isDragging && (field.type === FieldType.HEADER || field.type === FieldType.PARAGRAPH || field.type === FieldType.DIVIDER)) ? { pointerEvents: 'auto' } : {}}>
              {isSelected && !isOverlay && !isDragging && (
                  <div className="mb-4 flex flex-col gap-3">
                      <div className="flex items-center justify-end gap-1 pb-2 border-b border-gray-100">
                          <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setMediaInputMode(prev => prev === 'image' ? null : 'image');
                              }}
                              className={`p-2 rounded-full transition-colors ${mediaInputMode === 'image' || field.imageUrl ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                              title={t('builder.media.insert_image')}
                          >
                              <Image className="h-4 w-4" />
                          </button>
                          <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setMediaInputMode(prev => prev === 'video' ? null : 'video');
                              }}
                              className={`p-2 rounded-full transition-colors ${mediaInputMode === 'video' || field.videoUrl ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                              title={t('builder.media.insert_video')}
                          >
                              <Video className="h-4 w-4" />
                          </button>
                      </div>

                      {(mediaInputMode === 'image' || mediaInputMode === 'video') && (
                          <div className="flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                               <input
                                  autoFocus
                                  type="text"
                                  placeholder={mediaInputMode === 'image' ? t('builder.media.paste_image_url') : t('builder.media.paste_youtube_url')}
                                  className="flex-1 text-sm border-b border-blue-500 focus:outline-none py-1 bg-transparent"
                                  defaultValue={mediaInputMode === 'image' ? field.imageUrl : field.videoUrl}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                          const val = e.currentTarget.value;
                                          if (mediaInputMode === 'image') {
                                              updateField(field.id, { imageUrl: val });
                                              if (val && !field.imageWidth) updateField(field.id, { imageWidth: '100%' });
                                          } else {
                                              updateField(field.id, { videoUrl: val });
                                          }
                                          setMediaInputMode(null);
                                      } else if (e.key === 'Escape') {
                                          setMediaInputMode(null);
                                      }
                                  }}
                                  onBlur={(e) => {
                                      const val = e.currentTarget.value;
                                       if (mediaInputMode === 'image') {
                                          if (val !== field.imageUrl) {
                                              updateField(field.id, { imageUrl: val });
                                              if (val && !field.imageWidth) updateField(field.id, { imageWidth: '100%' });
                                          }
                                      } else {
                                          if (val !== field.videoUrl) updateField(field.id, { videoUrl: val });
                                      }
                                      setMediaInputMode(null);
                                  }}
                               />
                               <button onClick={() => setMediaInputMode(null)} className="text-xs text-gray-400 hover:text-gray-600">
                                  {t('builder.media.cancel')}
                               </button>
                          </div>
                      )}
                  </div>
              )}
              
              {!isOverlay && !isDragging && (field.imageUrl || field.videoUrl) && (
                  <div className="flex flex-col items-center gap-3 my-4">
                      {field.imageUrl && (
                          <div className="relative group/media">
                              <img 
                                  src={field.imageUrl} 
                                  alt="Preview" 
                                  className="rounded-lg object-contain bg-gray-50 max-h-64"
                                  style={{ maxWidth: field.imageWidth || '100%' }}
                                  onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                              />
                              <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      updateField(field.id, { imageUrl: '', imageWidth: '' });
                                  }}
                                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover/media:opacity-100 transition-opacity"
                                  title={t('builder.media.remove_image')}
                              >
                                  <Trash2 className="h-3 w-3" />
                              </button>
                          </div>
                      )}

                      {field.videoUrl && (() => {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                          const match = field.videoUrl?.match(regExp);
                          const videoId = (match && match[2].length === 11) ? match[2] : null;

                          if (videoId) {
                              return (
                                  <div className="relative group/media w-full max-w-md overflow-hidden rounded-xl bg-black/5 aspect-video">
                                      <iframe 
                                          src={`https://www.youtube.com/embed/${videoId}`}
                                          title="YouTube video player"
                                          frameBorder="0" 
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                          allowFullScreen
                                          className="absolute top-0 left-0 w-full h-full rounded-xl"
                                      />
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              updateField(field.id, { videoUrl: '' });
                                          }}
                                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity z-10"
                                          title={t('builder.media.remove_video')}
                                      >
                                          <Trash2 className="h-3 w-3" />
                                      </button>
                                  </div>
                              );
                          }
                          return null;
                      })()}
                  </div>
              )}
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
                     const isCenterAligned = labelAlignment === 'CENTER';
                     
                     const modules = useMemo(() => ({
                       toolbar: {
                         container: `#toolbar-label-${field.id}`,
                       }
                     }), [field.id]);

                     return (
                       <>
                          {isSelected && !isMultiSelecting && (
                              <div className="absolute -top-12 left-0 right-0 z-[60] flex justify-center">
                                  <RichTextToolbar id={`toolbar-label-${field.id}`} />
                              </div>
                          )}

                          <div className={`${isRowLayout ? 'flex items-start gap-6 relative' : ''}`}>
                             <div className={`${isRowLayout ? 'w-48 flex-shrink-0 pt-3' : (isDragging ? 'mb-1' : 'mb-3')} ${labelAlignment === 'RIGHT' ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`}>
                                <div className={`flex flex-col gap-2 ${labelAlignment === 'RIGHT' ? 'items-end' : isCenterAligned ? 'items-center' : 'items-start'}`}>
                                    <div className="w-full relative group/editor">
                                       {isSelected && !isMultiSelecting ? (
                                          <RichTextEditor
                                            theme="snow"
                                            value={field.label || ''}
                                            onChange={(value) => updateField(field.id, { label: value })}
                                            placeholder={t('common.question')}
                                            modules={modules}
                                            className={`text-base font-medium text-black leading-tight borderless animate-slide-down min-h-[1.5em] ${labelAlignment === 'RIGHT' ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`}
                                          />
                                       ) : (
                                           <div className={`flex items-start gap-1 ${labelAlignment === 'RIGHT' ? 'justify-end' : isCenterAligned ? 'justify-center' : ''}`}>
                                             <div
                                               className={`font-medium text-black outline-none cursor-text break-words max-w-full ql-editor !p-0 ${labelAlignment === 'RIGHT' ? 'text-right' : ''} ${isCenterAligned ? 'text-center' : ''}`}
                                               dangerouslySetInnerHTML={{ __html: sanitize(field.label || t('common.question')) }}
                                             />
                                           {field.required && (
                                              <span className="text-red-500 select-none -mt-1 text-lg leading-none">*</span>
                                           )}
                                         </div>
                                       )}
                                    </div>
                                </div>
                              </div>
                          
                          <div className={`flex-1 min-w-0 w-full max-w-full pb-3 scrollbar-visible ${field.type === FieldType.GROUP ? 'overflow-visible' : 'overflow-x-auto'}`}>
                            {(isOverlay || isDragging) ? (
                                <div className="h-10 bg-gray-50 rounded border border-gray-100 flex items-center px-3 text-xs text-gray-400 font-medium select-none">
                                    {field.type === FieldType.TEXTAREA ? t('common.long_text') : field.type === FieldType.ADDRESS ? t('common.address') : `${t(`builder.fields.${field.type.toLowerCase()}`, field.type)} ${t('common.field')}`}
                                </div>
                            ) : (
                                <>
                                    {renderFieldPreview()}
                                     {![FieldType.HEADER, FieldType.PARAGRAPH, FieldType.DIVIDER, FieldType.SUBMIT, FieldType.PAGE_BREAK, FieldType.GROUP, FieldType.SECTION_COLLAPSE].includes(field.type) && (isSelected || (field.options?.subLabel && field.options.subLabel !== t('common.sublabel') && field.options.subLabel !== 'Sublabel')) && (
                                       <div
                                           ref={subLabelRef}
                                           contentEditable={isSelected}
                                           suppressContentEditableWarning
                                           spellCheck={false}
                                           className={`text-xs mt-2 outline-none cursor-text w-full break-words min-h-[1.25em] ${(field.options?.subLabel && field.options.subLabel !== t('common.sublabel')) ? 'text-gray-500' : 'text-gray-300'}`}
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
                                               if (currentText === t('common.sublabel')) {
                                                   e.currentTarget.textContent = '';
                                               }
                                           }}
                                           onInput={(e) => {
                                               const newText = e.currentTarget.textContent || '';
                                               updateField(field.id, { options: { ...field.options, subLabel: newText } });
                                           }}
                                           onBlur={(e) => {
                                               const newText = e.currentTarget.textContent?.trim() || '';
                                               const valueToSave = (newText === t('common.sublabel') || !newText) ? '' : newText;
                                               if (valueToSave !== field.options?.subLabel) {
                                                   updateField(field.id, { options: { ...field.options, subLabel: valueToSave } });
                                               }
                                               if (!valueToSave && isSelected) {
                                                   e.currentTarget.textContent = t('common.sublabel');
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
                       </>
                     );
                  })()}
                </>
               )}
            </div>
             
            {isSelected && currentForm?.isQuiz && !isOverlay && !isDragging && (
              <InlineQuizBar
                field={field}
                currentForm={currentForm}
                allFields={allFields}
                onUpdate={updateField}
              />
            )}
            
          </div>

        </div>
    </>
  );
}

export default React.memo(FieldItem);
