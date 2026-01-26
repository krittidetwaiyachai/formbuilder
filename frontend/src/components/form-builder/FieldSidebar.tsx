import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { createPortal } from 'react-dom';
import { FieldType } from '@/types';
import { useFormStore } from '@/store/formStore';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Type,
  FileText,
  Hash,
  Mail,
  Phone,
  ChevronDown,
  CheckSquare,
  Circle,
  Calendar,
  Clock,
  Star,
  Heading,
  User,
  MapPin,
  AlignLeft,
  Minus,
  ChevronRight,
  ChevronLeft,
  FileX,
  Layers,
  Lock,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Share2,
  GraduationCap,
  Plus,
  LayoutGrid
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Loader from '@/components/common/Loader';

interface SidebarFieldConfig {
  type: FieldType;
  label: string;
  icon: any;
  options?: any;
  validation?: any;
}

const fieldCategories: { name: string; fields: SidebarFieldConfig[] }[] = [
  {
    name: 'Text Fields',
    fields: [
      { type: FieldType.TEXT, label: 'Short Text', icon: Type },
      { type: FieldType.EMAIL, label: 'Email', icon: Mail },
      { type: FieldType.PHONE, label: 'Phone', icon: Phone },
      { type: FieldType.NUMBER, label: 'Number', icon: Hash },
      { type: FieldType.TEXTAREA, label: 'Long Text', icon: FileText },
      { type: FieldType.FULLNAME, label: 'Full Name', icon: User },
      { type: FieldType.ADDRESS, label: 'Address', icon: MapPin, options: { stateInputType: 'text' } },
    ],
  },
  {
    name: 'Choice Fields',
    fields: [
      { type: FieldType.DROPDOWN, label: 'Dropdown Menu', icon: ChevronDown },
      { type: FieldType.RADIO, label: 'Single Choice', icon: Circle },
      { type: FieldType.CHECKBOX, label: 'Multiple Choice', icon: CheckSquare },
      { type: FieldType.MATRIX, label: 'Matrix Logic', icon: LayoutGrid },
      { 
        type: FieldType.TABLE, 
        label: 'Input Table', 
        icon: LayoutGrid,
        options: {
            columns: [
                { id: 'c1', label: 'Column 1' },
                { id: 'c2', label: 'Column 2' },
                { id: 'c3', label: 'Column 3' }
            ],
            allowAddRow: true
        }
      },
    ],
  },
  {
    name: 'Date & Time',
    fields: [
      { type: FieldType.DATE, label: 'Date', icon: Calendar, validation: { separator: '/' } },
      { type: FieldType.TIME, label: 'Time', icon: Clock },
    ],
  },
  {
    name: 'Rating',
    fields: [
      { type: FieldType.RATE, label: 'Star Rating', icon: Star },
    ],
  },
  {
    name: 'Layout',
    fields: [
      { type: FieldType.HEADER, label: 'Heading', icon: Heading },
      { type: FieldType.PARAGRAPH, label: 'Text Block', icon: AlignLeft },
      { type: FieldType.DIVIDER, label: 'Separator', icon: Minus },
      { type: FieldType.PAGE_BREAK, label: 'Page Break', icon: FileX },
      { type: FieldType.GROUP, label: 'Field Group', icon: Layers },
    ],
  },
];

const allFields = fieldCategories.flatMap(c => c.fields);

const useFieldLabels = () => {
  const { t } = useTranslation();
  return {
    'Text Fields': t('builder.categories.text'),
    'Choice Fields': t('builder.categories.choice'),
    'Date & Time': t('builder.categories.datetime'),
    'Rating': t('builder.categories.rating'),
    'Layout': t('builder.categories.layout'),
    'Short Text': t('builder.fields.short_text'),
    'Long Text': t('builder.fields.long_text'),
    'Email': t('builder.fields.email'),
    'Phone': t('builder.fields.phone'),
    'Number': t('builder.fields.number'),
    'Full Name': t('builder.fields.full_name'),
    'Address': t('builder.fields.address'),
    'Dropdown Menu': t('builder.fields.dropdown'),
    'Single Choice': t('builder.fields.single_choice'),
    'Multiple Choice': t('builder.fields.multiple_choice'),
    'Matrix Logic': t('builder.fields.matrix'),
    'Input Table': t('builder.fields.table'),
    'Date': t('builder.fields.date'),
    'Time': t('builder.fields.time'),
    'Star Rating': t('builder.fields.rating'),
    'Heading': t('builder.fields.heading'),
    'Text Block': t('builder.fields.text_block'),
    'Separator': t('builder.fields.separator'),
    'Page Break': t('builder.fields.page_break'),
    'Field Group': t('builder.fields.group'),
    
    'Type here...': t('builder.sidebar.type_here'),
    'Select option': t('builder.sidebar.select_option'),
    'Pick a date': t('builder.sidebar.pick_date'),
    'Pick a time': t('builder.sidebar.pick_time'),
    'Option 1': t('builder.sidebar.option_1'),
    'Submit': t('builder.sidebar.submit'),
    'PAGE BREAK': t('builder.sidebar.page_break'),
    'Column': t('builder.sidebar.column'),
  };
};

const useIsTouchDevice = () => {
    const [isTouch, setIsTouch] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const checkTouch = () => {
            return (
                ('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (window.matchMedia('(hover: none) and (pointer: coarse)').matches)
            );
        };
        setIsTouch(checkTouch());
    }, []);
    return isTouch;
};

const getFieldColorTheme = (type: FieldType) => {
    switch (type) {
        case FieldType.TEXT: 
        case FieldType.TEXTAREA: return { border: 'border-blue-200', text: 'text-blue-600', bg: 'bg-blue-50', hover: 'group-hover:bg-blue-100', iconBg: 'bg-blue-100' };
        
        case FieldType.NUMBER: return { border: 'border-amber-200', text: 'text-amber-600', bg: 'bg-amber-50', hover: 'group-hover:bg-amber-100', iconBg: 'bg-amber-100' };
        
        case FieldType.EMAIL: 
        case FieldType.PHONE: return { border: 'border-purple-200', text: 'text-purple-600', bg: 'bg-purple-50', hover: 'group-hover:bg-purple-100', iconBg: 'bg-purple-100' };
        
        case FieldType.DROPDOWN: 
        case FieldType.RADIO: 
        case FieldType.CHECKBOX: 
        case FieldType.MATRIX: 
        case FieldType.TABLE: return { border: 'border-pink-200', text: 'text-pink-600', bg: 'bg-pink-50', hover: 'group-hover:bg-pink-100', iconBg: 'bg-pink-100' };
        
        case FieldType.DATE: 
        case FieldType.TIME: 
        case FieldType.RATE: return { border: 'border-teal-200', text: 'text-teal-600', bg: 'bg-teal-50', hover: 'group-hover:bg-teal-100', iconBg: 'bg-teal-100' };
        
        case FieldType.FULLNAME:
        case FieldType.ADDRESS: return { border: 'border-orange-200', text: 'text-orange-600', bg: 'bg-orange-50', hover: 'group-hover:bg-orange-100', iconBg: 'bg-orange-100' };
        
        case FieldType.HEADER:
        case FieldType.PARAGRAPH: 
        case FieldType.DIVIDER:
        case FieldType.PAGE_BREAK:
        case FieldType.GROUP: return { border: 'border-slate-200', text: 'text-slate-600', bg: 'bg-slate-50', hover: 'group-hover:bg-slate-100', iconBg: 'bg-slate-200' };
        
        case FieldType.SUBMIT: return { border: 'border-emerald-200', text: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'group-hover:bg-emerald-100', iconBg: 'bg-emerald-100' };
        
        default: return { border: 'border-gray-200', text: 'text-gray-600', bg: 'bg-gray-50', hover: 'group-hover:bg-gray-100', iconBg: 'bg-gray-100' };
    }
};

function SidebarDragPreview({ fieldType }: { fieldType: typeof allFields[0] }) {
    const Icon = fieldType.icon;
    const theme = getFieldColorTheme(fieldType.type);
    const { t } = useTranslation();

    const renderPreview = () => {
        const commonInput = "w-full h-9 bg-white rounded border border-gray-200 px-3 flex items-center text-xs text-gray-400 select-none";
        switch (fieldType.type) {
             case FieldType.TEXT:
            case FieldType.EMAIL:
            case FieldType.FULLNAME:
                return <div className={commonInput}>{t('builder.sidebar.type_here')}</div>;
            case FieldType.ADDRESS:
                return <div className={commonInput}>{t('builder.sidebar.address')}</div>;
            case FieldType.NUMBER:
                return <div className={commonInput}>0</div>;
            case FieldType.PHONE:
                return <div className={commonInput + " text-gray-300 tracking-wider"}>(555) 000-0000</div>;
            case FieldType.TEXTAREA:
                return <div className={commonInput}>{t('builder.sidebar.long_text')}</div>;
            case FieldType.DROPDOWN:
                return (
                    <div className={commonInput + " justify-between"}>
                        <span>{t('builder.sidebar.select_option')}</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                );
            case FieldType.DATE:
            case FieldType.TIME:
                return (
                        <div className={commonInput + " justify-between"}>
                        <span>{fieldType.type === FieldType.DATE ? t('builder.sidebar.pick_date') : t('builder.sidebar.pick_time')}</span>
                        <Icon className="h-3 w-3" />
                    </div>
                );
            case FieldType.RADIO:
                return (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-white shadow-sm"></div>
                        <span className="text-xs">{t('builder.sidebar.option_1')}</span>
                    </div>
                );
            case FieldType.MATRIX:
                return (
                    <div className="space-y-2 opacity-50">
                        <div className="flex gap-2">
                           <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
                           <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
                           <div className="w-1/4 h-2 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                );
            case FieldType.CHECKBOX:
                return (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 rounded border border-gray-300 bg-white shadow-sm"></div>
                        <span className="text-xs">{t('builder.sidebar.option_1')}</span>
                    </div>
                );
            case FieldType.RATE:
                return (
                    <div className="flex gap-1 text-gray-300">
                        {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-current" />)}
                    </div>
                );
            case FieldType.HEADER:
                return <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>;
            case FieldType.PARAGRAPH:
                return (
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-200 rounded"></div>
                        <div className="h-2 w-4/5 bg-gray-200 rounded"></div>
                    </div>
                );
            case FieldType.SUBMIT:
                return <div className="w-24 h-9 bg-black rounded-md text-white flex items-center justify-center text-sm font-medium shadow-sm">{t('builder.sidebar.submit')}</div>;
            case FieldType.PAGE_BREAK:
                return <div className="w-full border-b border-dashed border-gray-300 text-center text-[10px] text-gray-400">{t('builder.sidebar.page_break')}</div>;
            default:
                return <div className={commonInput}>{t('builder.sidebar.type_field', { type: fieldType.type })}</div>;
        }
    };

    return (
        <div
            style={{ width: '300px' }}
            className={`bg-white rounded-xl shadow-2xl p-4 border-2 ${theme.border} ring-4 ring-black/5 cursor-grabbing z-[9999] isolate`}
        >
            <div className="flex justify-center mb-3">
                <div className="w-8 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className={`flex items-center gap-2 mb-3 ${theme.text}`}>
                <div className={`p-1.5 rounded-lg ${theme.bg}`}>
                        <Icon className="h-4 w-4" />
                </div>
                <div className="font-bold text-base truncate text-gray-900">{fieldType.label}</div>
            </div>
            <div>{renderPreview()}</div>
        </div>
    );
}

const FieldTypeButtonVisual = ({ fieldType, isCollapsed, variant = 'list' }: { fieldType: any, isCollapsed?: boolean, variant?: 'list' | 'grid' }) => {
    const labels = useFieldLabels();
    const Icon = fieldType.icon;
    const translatedLabel = labels[fieldType.label as keyof ReturnType<typeof useFieldLabels>] || fieldType.label;
    const theme = getFieldColorTheme(fieldType.type);

    if (variant === 'grid' && !isCollapsed) {
        return (
            <div className={`
                group w-full aspect-[1.3] flex flex-col items-center justify-center p-3 
                bg-white border hover:border-transparent rounded-xl transition-all duration-200
                hover:shadow-lg hover:-translate-y-1 relative overflow-hidden
                ${theme.border}
            `}>
                <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    bg-gradient-to-br ${theme.bg} to-white pointer-events-none
                `}/>
                
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300
                `}>
                    <Icon className="h-6 w-6" />
                </div>
                
                <span className={`text-xs font-semibold text-center leading-tight z-10 text-gray-700 group-hover:text-gray-900`}>
                    {translatedLabel}
                </span>
            </div>
        );
    }

    return (
        <div className={`w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'px-3'} py-2 text-sm text-black bg-white hover:bg-gray-50 rounded-md border border-gray-400 transition-colors cursor-grab active:cursor-grabbing touch-none select-none`}>
            <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
            {!isCollapsed && <span>{translatedLabel}</span>}
        </div>
    );
}

function FieldTypeButton({ fieldType, isCollapsed, onFieldAdd, variant, isTouch }: { fieldType: { type: FieldType; label: string; icon: any; options?: any; validation?: any }, isCollapsed?: boolean, onFieldAdd?: () => void, variant?: 'list' | 'grid', isTouch?: boolean }) {
  const { addField } = useFormStore();
  const index = allFields.indexOf(fieldType as any); 

  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addField({
      type: fieldType.type,
      label: fieldType.label,
      required: false,
      validation: fieldType.validation,
      order: 0, 
      options: fieldType.options,
    });
    onFieldAdd?.();
  };

  return (
    <div className="relative w-full h-full">
      <div 
        className="relative z-0 select-none h-full"
        onClick={(e) => {
            if (isTouch && !isCollapsed && variant !== 'grid') {
                handleDoubleClick(e);
            }
        }}
      >
          <FieldTypeButtonVisual fieldType={fieldType} isCollapsed={isCollapsed} variant={variant} />
      </div>

      <Draggable draggableId={`sidebar-${fieldType.type}`} index={index !== -1 ? index : 0}>
        {(provided, snapshot) => {
            
            const useSplitDrag = isTouch && !isCollapsed && variant !== 'grid';
            
            return (

           <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              style={{
                  ...provided.draggableProps.style,
                  position: 'absolute', 
                  inset: 0, 
                  zIndex: 20,
                  opacity: 0, 
                  pointerEvents: 'none', 
              }}
          >
               <div
                   {...provided.dragHandleProps}
                   style={{
                       position: 'absolute',
                       left: 0, top: 0, bottom: 0,
                       width: useSplitDrag ? '60px' : '100%',
                       touchAction: useSplitDrag ? 'none' : (isTouch ? 'manipulation' : 'none'),
                       pointerEvents: 'auto', 
                       cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                   }}
                   onClick={(e) => {
                       if (!snapshot.isDragging) handleDoubleClick(e);
                   }}
               />

               {useSplitDrag && (
                   <div 
                       style={{
                           position: 'absolute',
                           left: '60px', right: 0, top: 0, bottom: 0,
                           pointerEvents: 'auto', 
                           touchAction: 'manipulation' 
                       }}
                       onClick={(e) => {
                            handleDoubleClick(e);
                       }}
                   />
               )}
          </div>
        );
      }}
      </Draggable>
    </div>
  );
}

const IconMap: Record<string, any> = {
  User, MapPin, Briefcase, CalendarCheck, MessageSquare, Share2, GraduationCap, Star, Lock
};

const TemplatePopup = ({ onClose }: { onClose: () => void }) => {
  if (typeof document === 'undefined') return null;

  const { t } = useTranslation();
  const { addBundle } = useFormStore();
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await api.get('/bundles', { params: { isActive: true } });
        setBundles(response.data);
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles(); 

    const interval = setInterval(fetchBundles, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddBundle = (bundle: any) => {
    const mappedBundle = {
        title: bundle.name,
        fields: bundle.fields
    };
    addBundle(mappedBundle);
    onClose();
  };
  
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
          
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {t('builder.bundles.title')}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{t('builder.bundles.choose_template')}</p>
              </div>
              <button 
                  onClick={onClose} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                  <span className="text-xl leading-none">&times;</span>
              </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
             {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader size={32} />
                </div>
             ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bundles.map((bundle) => {
                    const IconComponent = bundle.options?.icon ? IconMap[bundle.options.icon] : Layers;
                    const bundleColor = bundle.options?.color || 'text-gray-600';
                    const bundleBg = bundle.options?.bg || 'bg-gray-50';

                    return (
                    <button
                        key={bundle.id}
                        onClick={() => handleAddBundle(bundle)}
                        className="group relative p-5 text-left bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all duration-200"
                    >
                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {bundle.name}
                        </h4>
                        
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:hidden">
                            {bundle.description}
                        </p>
                        
                        <div className="hidden group-hover:block mt-2">
                            <div className="flex flex-wrap gap-1">
                                {bundle.fields?.slice(0, 4).map((f: any, i: number) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-medium">
                                        {f.label ? f.label.replace(/<[^>]*>/g, '') : ''}
                                    </span>
                                ))}
                                {bundle.fields?.length > 4 && (
                                    <span className="px-1.5 py-0.5 text-[9px] text-gray-400">
                                        {t('builder.bundles.more_count', { count: bundle.fields.length - 4 })}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-2 group-hover:hidden">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-500">
                                {t('builder.group.fields_count', { count: bundle.fields?.length || 0 })}
                            </span>
                        </div>
                        
                        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                        </div>

                        <div className={`absolute top-5 right-5 w-8 h-8 rounded-lg ${bundleBg} flex items-center justify-center group-hover:opacity-0 transition-opacity`}>
                            <IconComponent className={`w-4 h-4 ${bundleColor}`} />
                        </div>
                    </button>
                    );
                })}
             </div>
             )}
          </div>
          
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">
                  {t('builder.bundles.click_to_add')}
              </p>
          </div>
      </div>
    </div>,
    document.body
  );
};

function SidebarCategory({ category, isCollapsed, onFieldAdd, variant, isTouch }: { category: { name: string; fields: any[] }, isCollapsed: boolean, onFieldAdd?: () => void, variant?: 'list' | 'grid', isTouch?: boolean }) {
  const [isOpen, setIsOpen] = useState(true);
  const labels = useFieldLabels();
  const translatedCategoryName = labels[category.name as keyof ReturnType<typeof useFieldLabels>] || category.name;

  if (isCollapsed) {
    return (
        <div className="space-y-2">
             <div className="w-full h-px bg-gray-200 my-1" />
             {category.fields.map((field) => (
                <FieldTypeButton key={field.type} fieldType={field} isCollapsed={true} onFieldAdd={onFieldAdd} variant="list" isTouch={isTouch} />
              ))}
        </div>
    )
  }

  if (variant === 'grid') {
      return (
          <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{translatedCategoryName}</h3>
              <div className="grid grid-cols-2 gap-3">
                  {category.fields.map((field) => (
                      <FieldTypeButton key={field.type} fieldType={field} onFieldAdd={onFieldAdd} variant="grid" isTouch={isTouch} />
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-50 transition-colors"
      >
        <span>{translatedCategoryName}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-2 space-y-2 bg-gray-50/50 border-t border-gray-100">
          {category.fields.map((field) => (
            <FieldTypeButton key={field.type} fieldType={field} onFieldAdd={onFieldAdd} variant="list" isTouch={isTouch} />
          ))}
        </div>
      )}
    </div>
  )
}

interface FieldSidebarProps {
  onFieldSelected?: () => void;
  className?: string;
  variant?: 'list' | 'grid'; 
}

export default function FieldSidebar({ onFieldSelected, className, variant }: FieldSidebarProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const isTouch = useIsTouchDevice();

  const visualVariant = variant || (className ? 'grid' : 'list');

  const handleFieldSelect = () => {
      if (onFieldSelected) {
          onFieldSelected();
      }
  };

  return (
    <div 
      className={className || `bg-white border-r border-gray-200 flex flex-col h-full shadow-sm relative z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-[300px]'}`}
    >

      {!className && (
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all z-50 flex items-center justify-center w-8 h-8"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
      )}

      <div className={`p-4 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} bg-white relative`}>
        {!isCollapsed && <h2 className="font-semibold text-gray-800 whitespace-nowrap overflow-hidden">{t('builder.fields')}</h2>}
      </div>

       <div className={`border-b border-gray-100 bg-gray-50/50 ${isCollapsed ? 'p-2' : 'px-4 py-4'}`}>
            {isCollapsed ? (
                <button
                    onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                    className="w-full flex items-center justify-center p-2 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors group relative overflow-hidden"
                    title="Field Bundles"
                >
                     <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm group-hover:bg-white/20 transition-colors animate-pulse" />
                     <div className="relative z-10 p-1"><Layers className="h-5 w-5 animate-wiggle" /></div>
                </button>
            ) : (
                <button
                    onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                    className="relative w-full group isolate"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:bg-white/40 transition-colors duration-500 animate-pulse" />
                    <div className="absolute -inset-[2px] rounded-xl overflow-hidden pb-px">
                        <div className="absolute top-[50%] left-[50%] w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(transparent_0deg,transparent_270deg,white_360deg)] opacity-100 shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-spin-slow" />
                    </div>
                    <div className="relative w-full bg-black rounded-[10px] px-4 py-3 flex items-center justify-between z-10 border border-transparent group-hover:bg-zinc-950 overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 pointer-events-none" />
                        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                        <div className="flex items-center gap-3 z-20">
                            <div className="relative group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">
                                <Layers className="relative w-5 h-5 text-white animate-wiggle" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-sm font-bold text-white tracking-wide">{t('builder.field_bundles')}</span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase group-hover:text-white transition-colors">{t('builder.bundles_subtitle')}</span>
                            </div>
                        </div>
                         <div className="relative z-20">
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 shadow-sm" />
                         </div>
                    </div>
                </button>
            )}
            <AnimatePresence>
                {isTemplateOpen && (<TemplatePopup onClose={() => setIsTemplateOpen(false)} />)}
            </AnimatePresence>
       </div>
 
       <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'} space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent`}>
         <Droppable 
           droppableId="SIDEBAR" 
           isDropDisabled={true}
           renderClone={(provided, _snapshot, rubric) => {
              const fieldType = allFields[rubric.source.index];
              return (
                  <div
                     ref={provided.innerRef}
                     {...provided.draggableProps}
                     {...provided.dragHandleProps}
                     style={{
                         ...provided.draggableProps.style,
                         pointerEvents: 'none', 
                         zIndex: 99999, 
                     }}
                     className="pointer-events-none" 
                  >
                      <SidebarDragPreview fieldType={fieldType} />
                  </div>
              );
         }}
       >
         {(provided) => (
              <div 
                 ref={provided.innerRef} 
                 {...provided.droppableProps}
                 className={visualVariant === 'list' ? "space-y-6" : "space-y-8 pb-10"}
              >
                 {fieldCategories.map((category) => (
                     <SidebarCategory key={category.name} category={category} isCollapsed={isCollapsed} onFieldAdd={handleFieldSelect} variant={visualVariant} isTouch={isTouch} />
                 ))}
                 {provided.placeholder}
             </div>
         )}
       </Droppable>
       </div>
     </div>
   );
}
