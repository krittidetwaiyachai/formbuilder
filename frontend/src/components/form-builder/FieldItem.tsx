import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, FieldType } from '@/types';
import { Trash2, Mail, Phone, Hash, FileText, ChevronDown, Calendar, Clock, Star, Type, User, MapPin, ChevronRight, FileX } from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import React, { useRef, useState, useEffect, useMemo } from 'react';

interface FieldItemProps {
  field: Field;
  isSelected: boolean;
  onSelect: (id: string, autoFocus?: boolean) => void;
  isHidden?: boolean; // สำหรับซ่อน field ที่กำลังถูก drag จาก sidebar
  isNewFromSidebar?: boolean; // สำหรับแสดง visual feedback สำหรับ field ใหม่ที่ลากจาก sidebar
}

function FieldItem({ field, isSelected, onSelect, isHidden = false, isNewFromSidebar = false }: FieldItemProps) {
  const deleteField = useFormStore((state) => state.deleteField);
  const updateField = useFormStore((state) => state.updateField);
  const shouldFocusField = useFormStore((state) => state.shouldFocusField);
  const setShouldFocusField = useFormStore((state) => state.setShouldFocusField);
  
  const headerInputRef = useRef<HTMLHeadingElement>(null);
  const subheadingInputRef = useRef<HTMLParagraphElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLDivElement>(null);
  const isFocusingRef = useRef(false);

  // Initialize stable HTML for uncontrolled components to prevent React re-renders from reverting edits
  const [labelHtml] = useState({ __html: field.label || (field.type === FieldType.HEADER ? 'Heading' : '') });
  const [placeholderHtml] = useState({ __html: field.placeholder || '' });

  // Sync content manually to avoid cursor jumping
  useEffect(() => {
    if (headerInputRef.current && document.activeElement !== headerInputRef.current) {
        if (headerInputRef.current.textContent !== (field.label || 'Heading')) {
            headerInputRef.current.textContent = field.label || 'Heading';
        }
    }
    // Also sync the generic label input ref
    if (labelInputRef.current && document.activeElement !== labelInputRef.current) {
        if (labelInputRef.current.textContent !== field.label) {
            labelInputRef.current.textContent = field.label;
        }
    }
  }, [field.label]);

  useEffect(() => {
    if (subheadingInputRef.current && document.activeElement !== subheadingInputRef.current) {
        if (subheadingInputRef.current.textContent !== (field.placeholder || '')) {
            subheadingInputRef.current.textContent = field.placeholder || '';
        }
    }
  }, [field.placeholder]);

  // Restore focus after selection change (when switching fields)
  useEffect(() => {
    if (isSelected && shouldFocusField) {
        // We just selected this field via click, restore focus to the interaction target
        setTimeout(() => {
            if (field.type === FieldType.HEADER) {
                if (headerInputRef.current) headerInputRef.current.focus();
            } else {
                if (labelInputRef.current) labelInputRef.current.focus();
            }
            // Reset the flag so we don't refocus on random re-renders
            setShouldFocusField(false);
        }, 50); // Small delay to wait for DOM and ref to be ready
    }
  }, [isSelected, shouldFocusField, field.type, setShouldFocusField]);


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
    id: field.id,
    data: sortableData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? transition : (isDragging ? undefined : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
    opacity: isHidden ? 0 : (isDragging ? 0 : 1),
    visibility: isDragging ? 'hidden' as const : 'visible' as const,
    touchAction: field.type === 'HEADER' ? 'auto' as const : 'none' as const,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this field?')) {
      deleteField(field.id);
    }
  };

  const getFieldStyle = () => {
    // กำหนดสไตล์ที่แตกต่างกันตาม field type
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
    const disabledClass = "opacity-60 cursor-pointer";

    switch (field.type) {
      case FieldType.TEXT:
        return (
          <div className="relative max-w-full group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-hover:text-black">
              <Type className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={field.placeholder || 'Enter text...'}
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-gray-50/50 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.EMAIL:
        return (
          <div className="relative max-w-full group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
              <Mail className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
            </div>
            <input
              type="email"
              placeholder={field.placeholder || 'Enter email...'}
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-blue-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.PHONE:
        return (
          <div className="relative max-w-full group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
              <Phone className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
            </div>
            <input
              type="tel"
              placeholder={field.placeholder || 'Enter phone...'}
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-green-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.TEXTAREA:
        return (
          <div className="relative max-w-full group">
            <div className="absolute left-4 top-4 pointer-events-none transition-colors duration-300">
               <FileText className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
            </div>
            <textarea
              placeholder={field.placeholder || 'Enter text...'}
              readOnly
              tabIndex={-1}
              rows={4}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-purple-50/30 text-black text-base shadow-sm resize-none transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.NUMBER:
        return (
          <div className="relative max-w-sm group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
               <Hash className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
            </div>
            <input
              type="number"
              placeholder={field.placeholder || 'Enter number...'}
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-emerald-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.DROPDOWN:
        return (
          <div className="relative max-w-full group">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
               <ChevronDown className={`h-5 w-5 ${fieldStyle.iconColor} opacity-80`} />
            </div>
            <div className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-orange-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md flex items-center`}>
               <span className="text-gray-500">{field.placeholder || 'Select an option...'}</span>
            </div>
          </div>
        );
      
      case FieldType.RADIO:
        const getRadioOptions = () => {
          if (!field.options) return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
          if (Array.isArray(field.options)) {
            // Check if it's array of objects or strings
            if (field.options.length > 0 && typeof field.options[0] === 'object') {
              return field.options;
            }
            return field.options.map((opt: string) => ({ label: opt, value: opt }));
          }
          return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
        };
        const radioOptions = getRadioOptions();
        return (
          <div className="space-y-3 pt-1">
            {radioOptions.map((opt: any, idx: number) => (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-pink-50/50 transition-colors duration-200 group`}>
                <div className="relative flex items-center justify-center">
                  <div className={`w-6 h-6 border-2 border-pink-200 rounded-full group-hover:border-pink-500 transition-colors`}></div>
                  {idx === 0 && <div className="absolute w-3 h-3 bg-pink-500 rounded-full"></div>}
                </div>
                <span className="text-base font-medium text-gray-700">{opt.label || opt.value || opt}</span>
              </div>
            ))}
          </div>
        );
      
      case FieldType.CHECKBOX:
        const getCheckboxOptions = () => {
          if (!field.options) return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
          if (Array.isArray(field.options)) {
            // Check if it's array of objects or strings
            if (field.options.length > 0 && typeof field.options[0] === 'object') {
              return field.options;
            }
            return field.options.map((opt: string) => ({ label: opt, value: opt }));
          }
          return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
        };
        const checkboxOptions = getCheckboxOptions();
        return (
          <div className="space-y-3 pt-1">
             {checkboxOptions.map((opt: any, idx: number) => (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-indigo-50/50 transition-colors duration-200 group`}>
                <div className="relative flex items-center justify-center">
                   <div className={`w-6 h-6 border-2 border-indigo-200 rounded-lg group-hover:border-indigo-500 transition-colors`}></div>
                   {idx === 0 && (
                      <svg className="absolute w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                   )}
                </div>
                <span className="text-base font-medium text-gray-700">{opt.label || opt.value || opt}</span>
              </div>
            ))}
          </div>
        );
      
      case FieldType.DATE:
        return (
          <div className="relative max-w-sm group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
               <Calendar className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
            </div>
            <input
              type="text"
              placeholder="Select date..."
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-teal-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.TIME:
        return (
          <div className="relative max-w-sm group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
               <Clock className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
            </div>
            <input
              type="text"
              placeholder="Select time..."
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-cyan-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
            />
          </div>
        );
      
      case FieldType.RATE:
        return (
          <div className="flex items-center gap-3 py-2 px-4 rounded-xl border border-yellow-100 bg-yellow-50/20 max-w-fit">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="relative group cursor-pointer">
                <Star className="w-8 h-8 text-yellow-300 fill-yellow-100 hover:text-yellow-400 hover:fill-yellow-400 transition-all duration-300 transform group-hover:scale-110" />
              </div>
            ))}
          </div>
        );
      
      case FieldType.HEADER:
        const headerValidation = (field.validation as any) || {};
        const headerSize = headerValidation?.size || 'DEFAULT';
        const headerAlignment = headerValidation?.alignment || 'LEFT';
        const headerSubheading = field.placeholder || '';
        
        const getHeaderSizeClass = () => {
          switch (headerSize) {
            case 'LARGE':
              return 'text-4xl';
            case 'SMALL':
              return 'text-xl';
            default:
              return 'text-2xl';
          }
        };
        
        const getHeaderAlignmentClass = () => {
          switch (headerAlignment) {
            case 'CENTER':
              return 'text-center';
            case 'RIGHT':
              return 'text-right';
            default:
              return 'text-left';
          }
        };
        
        return (
          <div 
            ref={headerContainerRef}
            className="cursor-text"
          >
            <h2
              ref={headerInputRef}
              contentEditable={isSelected}
              suppressContentEditableWarning
              className={`${getHeaderSizeClass()} font-bold text-black ${getHeaderAlignmentClass()} outline-none cursor-text`}
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
                // Force focus immediately to ensure single-click editing works
                if (headerInputRef.current) {
                  headerInputRef.current.focus();
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
                 if (newText !== (field.label || 'Header')) {
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
            {headerSubheading || headerSubheading === '' ? (
              <p
                ref={subheadingInputRef}
                contentEditable={isSelected}
                suppressContentEditableWarning
                className={`text-sm text-gray-600 mt-2 ${getHeaderAlignmentClass()} outline-none cursor-text`}
                style={{ 
                  pointerEvents: 'auto', 
                  userSelect: 'text', 
                  WebkitUserSelect: 'text',
                  minHeight: '1.5em'
                }}
                dangerouslySetInnerHTML={placeholderHtml}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  isFocusingRef.current = true;
                  // Force focus immediately
                  if (subheadingInputRef.current) {
                    subheadingInputRef.current.focus();
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
                   if (newText !== field.placeholder) {
                     updateField(field.id, { placeholder: newText });
                   }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
            ) : null}
             {(field.validation as any)?.headingImage && (
              <div className={`mt-4 ${
                headerAlignment === 'CENTER' ? 'flex justify-center' : 
                headerAlignment === 'RIGHT' ? 'flex justify-end' : 'flex justify-start'
              }`}>
                <img 
                  src={(field.validation as any).headingImage} 
                  alt="Heading" 
                  className="max-w-full h-auto rounded-lg max-h-96 object-contain"
                />
              </div>
            )}
          </div>
        );
      
      case FieldType.FULLNAME:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-none">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="First Name"
                readOnly
                tabIndex={-1}
                className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-gray-50/50 text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
              />
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Last Name"
                readOnly
                tabIndex={-1}
                className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-gray-50/50 text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
              />
            </div>
          </div>
        );
      
      case FieldType.ADDRESS:
        return (
          <div className="space-y-4 pointer-events-none bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Street Address"
                readOnly
                tabIndex={-1}
                className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="City"
                  readOnly
                  tabIndex={-1}
                  className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
                />
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="State"
                  readOnly
                  tabIndex={-1}
                  className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
                />
              </div>
            </div>
            <div className="relative max-w-[50%] group">
              <input
                type="text"
                placeholder="ZIP Code"
                readOnly
                tabIndex={-1}
                className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
              />
            </div>
          </div>
        );
      
      case FieldType.PARAGRAPH:
        return (
          <div className="max-w-2xl pointer-events-none">
            <p className="text-gray-700 text-sm leading-relaxed">
              {field.placeholder || 'This is a paragraph. You can add descriptive text here to provide instructions or additional information to your form users.'}
            </p>
          </div>
        );
      
      case FieldType.SUBMIT:
        return (
          <div className="flex justify-center pointer-events-none">
            <button
              type="button"
              disabled
              className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {field.label || 'Submit'}
            </button>
          </div>
        );
      
      case FieldType.DIVIDER:
        return (
          <div className="py-4 pointer-events-none">
            <hr className="border-t-2 border-gray-300" />
          </div>
        );
      
      case FieldType.SECTION_COLLAPSE:
        return (
          <div className="border-2 border-gray-300 rounded-lg p-4 max-w-md pointer-events-none">
            <div className="flex items-center justify-between cursor-pointer">
              <h3 className="font-semibold text-black">{field.label || 'Section Title'}</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Click to expand/collapse section</p>
          </div>
        );
      
      case FieldType.PAGE_BREAK:
        return (
          <div className="py-8 border-t-2 border-dashed border-gray-400 pointer-events-none">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <FileX className="h-5 w-5" />
              <span className="text-sm font-medium">Page Break</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="relative max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Type className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={field.placeholder || 'Enter text...'}
              readOnly
              tabIndex={-1}
              className={`w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm transition-all ${disabledClass}`}
            />
          </div>
        );
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
             // Check if we are clicking dragging handle, if so don't auto focus text?
             // Actually dragging handle has its own listener usually.
             // But to be safe, if we click, we likely want to select.
             onSelect(field.id, true);
          }
        }}
        className={`flex-1 ${fieldStyle.bgGradient} border rounded-2xl shadow-sm transition-all duration-300 ${field.type === FieldType.HEADER ? 'cursor-text' : 'cursor-pointer select-none'} ${
          isSelected ? `border-black ring-1 ring-black/5 ${fieldStyle.cardBorder}` : 
          isNewFromSidebar ? `border-blue-500 ring-4 ring-blue-500/10 shadow-blue-100/50 ${fieldStyle.cardBorder}` : 
          `border-gray-200 ${fieldStyle.cardBorder} hover:border-gray-300 hover:shadow-md`
        } ${isDragging ? 'pointer-events-none opacity-80 scale-95' : ''} ${isHidden ? 'pointer-events-none opacity-50' : ''}`}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black touch-none px-4 pt-4 pb-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full group-hover:bg-gray-300 transition-colors"></div>
        </div>
        <div className="p-4" style={field.type === FieldType.HEADER ? { pointerEvents: 'auto' } : {}}>
          {field.type === FieldType.HEADER ? (
            <div 
              onMouseDown={(e) => {
                // Don't select field if clicking on editable text
                const target = e.target as HTMLElement;
                if (target.closest('h2, p') || target.isContentEditable || target.closest('[contenteditable="true"]')) {
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 flex items-start gap-1">
                  <div
                    ref={labelInputRef}
                    contentEditable={isSelected}
                    suppressContentEditableWarning
                    className="font-medium text-black outline-none cursor-text"
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
              {renderFieldPreview()}
            </>
          )}
        </div>
      </div>
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
    </div>
  );
}

export default React.memo(FieldItem);

