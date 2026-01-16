import React, { useState } from 'react';
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

// --- CONFIGURATION ---
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
      { type: FieldType.TEXT, label: 'Short Text', icon: Type, options: { subLabel: 'Sublabel' } },
      { type: FieldType.EMAIL, label: 'Email', icon: Mail },
      { type: FieldType.PHONE, label: 'Phone', icon: Phone },
      { type: FieldType.NUMBER, label: 'Number', icon: Hash },
      { type: FieldType.TEXTAREA, label: 'Long Text', icon: FileText, options: { subLabel: 'Sublabel' } },
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
  // Template Popup Button implemented separately below
];

const allFields = fieldCategories.flatMap(c => c.fields);

// Hook for translations
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
  };
};

// --- COMPONENTS ---

// --- HELPERS ---
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

// --- COMPONENTS ---

// 1. The Dragging Preview Card
function SidebarDragPreview({ fieldType }: { fieldType: typeof allFields[0] }) {
    const Icon = fieldType.icon;
    const theme = getFieldColorTheme(fieldType.type);
    
    // Mapping theme legacy check for sidebar preview specific styles if needed, 
    // but reusing the extracted theme logic for consistency where possible or keeping distinct drag styles.
    // We'll map the new theme structure to the old component's expectations or update the component.
    // The old component used specific hardcoded returns. Let's keep using the new theme for consistency.

    const renderPreview = () => {
        const commonInput = "w-full h-9 bg-white rounded border border-gray-200 px-3 flex items-center text-xs text-gray-400 select-none";
        switch (fieldType.type) {
             case FieldType.TEXT:
            case FieldType.EMAIL:
            case FieldType.FULLNAME:
                return <div className={commonInput}>Type here...</div>;
            case FieldType.ADDRESS:
                return <div className={commonInput}>Address</div>;
            case FieldType.NUMBER:
                return <div className={commonInput}>0</div>;
            case FieldType.PHONE:
                return <div className={commonInput + " text-gray-300 tracking-wider"}>(555) 000-0000</div>;
            case FieldType.TEXTAREA:
                return <div className={commonInput}>Long Text</div>;
            case FieldType.DROPDOWN:
                return (
                    <div className={commonInput + " justify-between"}>
                        <span>Select option</span>
                        <ChevronDown className="h-3 w-3" />
                    </div>
                );
            case FieldType.DATE:
            case FieldType.TIME:
                return (
                        <div className={commonInput + " justify-between"}>
                        <span>{fieldType.type === FieldType.DATE ? 'Pick a date' : 'Pick a time'}</span>
                        <Icon className="h-3 w-3" />
                    </div>
                );
            case FieldType.RADIO:
                return (
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 rounded-full border border-gray-300 bg-white shadow-sm"></div>
                        <span className="text-xs">Option 1</span>
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
                        <span className="text-xs">Option 1</span>
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
                return <div className="w-24 h-9 bg-black rounded-md text-white flex items-center justify-center text-sm font-medium shadow-sm">Submit</div>;
            case FieldType.PAGE_BREAK:
                return <div className="w-full border-b border-dashed border-gray-300 text-center text-[10px] text-gray-400">PAGE BREAK</div>;
            default:
                return <div className={commonInput}>{fieldType.type} Field</div>;
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

// 2. The Visual Representation of the Button (Shared)
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

// 3. The Draggable Wrapper (Unchanged for standard fields)
function FieldTypeButton({ fieldType, isCollapsed, onFieldAdd, variant }: { fieldType: { type: FieldType; label: string; icon: any; options?: any; validation?: any }, isCollapsed?: boolean, onFieldAdd?: () => void, variant?: 'list' | 'grid' }) {
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

  // For grid (mobile), disable drag completely. Just tap to add.
  // We use custom pointer handling to support "Long Press & Release" without triggering context menu or getting lost.
  const pointerRef = React.useRef<{ x: number, y: number } | null>(null);

  if (variant === 'grid') {
      return (
          <div 
            onPointerDown={(e) => {
                pointerRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
                if (!pointerRef.current) return;
                const dist = Math.sqrt(
                    Math.pow(e.clientX - pointerRef.current.x, 2) + 
                    Math.pow(e.clientY - pointerRef.current.y, 2)
                );
                pointerRef.current = null;
                
                // If moved less than 10px, treat as click/tap (even if held for a long time)
                if (dist < 10) {
                    handleDoubleClick(e as any);
                }
            }}
            onClick={(e) => {
                // Fallback for mouse users or simple clicks if pointer events miss for some reason
                // But we must prevent double-firing if pointerUp already handled it.
                // Actually, let's rely just on PointerUp for consistency on hybrid devices.
                // Standard click might be suppressed by context menu prevention anyway.
                e.stopPropagation();
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            className="cursor-pointer active:scale-95 transition-transform select-none"
            style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                touchAction: 'pan-y' // Allow vertical scrolling, but we detect tap if no scroll occurred
            }}
          >
              <FieldTypeButtonVisual fieldType={fieldType} isCollapsed={isCollapsed} variant={variant} />
          </div>
      );
  }

  return (
    <div className="relative w-full">
      {/* 1. Underlying Visual */}
      <div className="relative z-0 select-none">
          <FieldTypeButtonVisual fieldType={fieldType} isCollapsed={isCollapsed} variant={variant} />
      </div>

      {/* 2. Draggable */}
      <Draggable draggableId={`sidebar-${fieldType.type}`} index={index !== -1 ? index : 0}>
        {(provided, snapshot) => (
           <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onDoubleClick={handleDoubleClick}
              onClick={(e) => {
                 if (!snapshot.isDragging) {
                     handleDoubleClick(e);
                 }
              }}
              style={
                  snapshot.isDragging 
                  ? { ...provided.draggableProps.style, opacity: 0 } 
                  : { ...provided.draggableProps.style }
              }
              className={`z-10 w-full h-full touch-none ${snapshot.isDragging ? 'opacity-0' : 'absolute inset-0'}`}
          >
              <div className="w-full h-full"> 
                   <div className="opacity-0">
                        <FieldTypeButtonVisual fieldType={fieldType} isCollapsed={isCollapsed} variant={variant} />
                   </div>
              </div>
          </div>
        )}
      </Draggable>
    </div>
  );
}

// --- SAMPLE BUNDLES DATA ---
const sampleBundles = [
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Capture lead details including Name, Email, and Phone.',
    icon: User,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    fields: [
      { type: FieldType.FULLNAME, label: 'Full Name', required: true, placeholder: 'John Doe', options: { subLabel: 'First and Last Name' } },
      { type: FieldType.EMAIL, label: 'Email Address', required: true, placeholder: 'name@example.com' },
      { type: FieldType.PHONE, label: 'Phone Number', placeholder: '(555) 000-0000' }
    ]
  },
  {
    id: 'address',
    title: 'Shipping Address',
    description: 'Complete address block with Street, City, State, and Zip.',
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    fields: [
      { type: FieldType.ADDRESS, label: 'Street Address', required: true, placeholder: '123 Main St' },
      { type: FieldType.TEXT, label: 'City', required: true, options: { width: '50%' }, placeholder: 'New York' },
      { type: FieldType.TEXT, label: 'State / Province', required: true, options: { width: '50%' }, placeholder: 'NY' },
      { type: FieldType.NUMBER, label: 'Zip / Postal Code', required: true, placeholder: '10001', options: { width: '50%' } },
       { type: FieldType.TEXT, label: 'Country', required: true, placeholder: 'United States', options: { width: '50%' } }
    ]
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Essential fields for recruitment and hiring forms.',
    icon: Briefcase,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    fields: [
        { type: FieldType.FULLNAME, label: 'Applicant Name', required: true, placeholder: 'Jane Smith' },
        { type: FieldType.EMAIL, label: 'Email Address', required: true, placeholder: 'jane@example.com' },
        { type: FieldType.TEXT, label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/janesmith', options: { prefixIcon: 'link' } },
        { type: FieldType.TEXTAREA, label: 'Why do you want to join us?', required: true, placeholder: 'Tell us about your motivation...', options: { rows: 4 } }
    ]
  },
  {
    id: 'event-booking',
    title: 'Event Booking',
    description: 'Registration details with date, time, and preferences.',
    icon: CalendarCheck,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    fields: [
        { type: FieldType.FULLNAME, label: 'Attendee Name', required: true },
        { type: FieldType.DATE, label: 'Preferred Date', required: true },
        { type: FieldType.DROPDOWN, label: 'Ticket Type', required: true, options: { items: ['General Admission', 'VIP Access', 'Student Pass'], placeholder: 'Select a ticket type' } },
        { type: FieldType.CHECKBOX, label: 'Dietary Requirements', options: { items: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Nut Allergy'] } }
    ]
  },
  {
    id: 'product-survey',
    title: 'Product Survey',
    description: 'Gather insights on product usage and satisfaction.',
    icon: MessageSquare,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    fields: [
        { type: FieldType.DROPDOWN, label: 'Which product do you use?', required: true, options: { items: ['Basic Plan', 'Pro Plan', 'Enterprise Suite'], placeholder: 'Select product' } },
        { type: FieldType.RATE, label: 'Overall Satisfaction', required: true, options: { maxRating: 5 } },
        { type: FieldType.TEXTAREA, label: 'Share your experience', placeholder: 'What do you like most? What can we improve?', options: { rows: 3 } }
    ]
  },
  {
    id: 'social-media',
    title: 'Social Profile',
    description: 'Collect social media handles and preferences.',
    icon: Share2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    fields: [
        { type: FieldType.CHECKBOX, label: 'Preferred Platforms', options: { items: ['Twitter / X', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube'] } },
        { type: FieldType.TEXT, label: 'Main Handle/Username', required: true, placeholder: '@username', options: { prefix: '@' } },
        { type: FieldType.RADIO, label: 'Content Type', options: { items: ['Creator', 'Consumer', 'Business Account'] } }
    ]
  },
  {
    id: 'education',
    title: 'Education History',
    description: 'Academic background and qualifications.',
    icon: GraduationCap,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    fields: [
        { type: FieldType.TEXT, label: 'University / Institution', required: true, placeholder: 'Harvard University' },
        { type: FieldType.TEXT, label: 'Degree / Major', required: true, placeholder: 'Computer Science', options: { width: '70%' } },
        { type: FieldType.NUMBER, label: 'Grad Year', required: true, placeholder: '2024', options: { width: '30%' } }
    ]
  },
  {
    id: 'feedback',
    title: 'Customer Feedback',
    description: 'Rating and comments to gather user sentiment.',
    icon: Star,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    fields: [
      { type: FieldType.RATE, label: 'How would you rate us?', required: true },
      { type: FieldType.TEXTAREA, label: 'What can we improve?', placeholder: 'We value your feedback...' },
      { type: FieldType.RADIO, label: 'Would you recommend us?', options: { items: ['Yes, definitely', 'Maybe', 'No, not likely'] } }
    ]
  },
  {
    id: 'login',
    title: 'Account Cleanup',
    description: 'Standard fields for account management forms.',
    icon: Lock,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    fields: [
        { type: FieldType.EMAIL, label: 'Email Address', required: true, placeholder: 'user@example.com' },
        { type: FieldType.TEXT, label: 'Username', required: true, placeholder: 'username' }
    ]
  }
];

const TemplatePopup = ({ onClose }: { onClose: () => void }) => {
  if (typeof document === 'undefined') return null;

  const { addBundle } = useFormStore();

  const handleAddBundle = (bundle: any) => {
    addBundle(bundle);
    onClose();
  };
  
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
          
          {/* Header - Clean & Minimal */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Field Bundles
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Choose a pre-built template to add to your form</p>
              </div>
              <button 
                  onClick={onClose} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                  <span className="text-xl leading-none">&times;</span>
              </button>
          </div>

          {/* Body: Grid of Cards */}
          <div className="p-6 overflow-y-auto flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleBundles.map((bundle) => (
                    <button
                        key={bundle.id}
                        onClick={() => handleAddBundle(bundle)}
                        className="group relative p-5 text-left bg-white border border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition-all duration-200"
                    >
                        {/* Title */}
                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {bundle.title}
                        </h4>
                        
                        {/* Description - hide on hover */}
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:hidden">
                            {bundle.description}
                        </p>
                        
                        {/* Fields Preview - show on hover */}
                        <div className="hidden group-hover:block mt-2">
                            <div className="flex flex-wrap gap-1">
                                {bundle.fields.slice(0, 4).map((f, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-medium">
                                        {f.label}
                                    </span>
                                ))}
                                {bundle.fields.length > 4 && (
                                    <span className="px-1.5 py-0.5 text-[9px] text-gray-400">
                                        +{bundle.fields.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Field Count Badge */}
                        <div className="mt-3 flex items-center gap-2 group-hover:hidden">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-500">
                                {bundle.fields.length} fields
                            </span>
                        </div>
                        
                        {/* Hover Indicator */}
                        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </button>
                ))}
             </div>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">
                  Click on a template to add it to your form
              </p>
          </div>
      </div>
    </div>,
    document.body
  );
};



function SidebarCategory({ category, isCollapsed, onFieldAdd, variant }: { category: { name: string; fields: any[] }, isCollapsed: boolean, onFieldAdd?: () => void, variant?: 'list' | 'grid' }) {
  const [isOpen, setIsOpen] = useState(true);
  const labels = useFieldLabels();
  const translatedCategoryName = labels[category.name as keyof ReturnType<typeof useFieldLabels>] || category.name;

  if (isCollapsed) {
    return (
        <div className="space-y-2">
             <div className="w-full h-px bg-gray-200 my-1" />
             {category.fields.map((field) => (
                <FieldTypeButton key={field.type} fieldType={field} isCollapsed={true} onFieldAdd={onFieldAdd} variant="list" />
              ))}
        </div>
    )
  }

  // Mobile Grid Mode
  if (variant === 'grid') {
      return (
          <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{translatedCategoryName}</h3>
              <div className="grid grid-cols-2 gap-3">
                  {category.fields.map((field) => (
                      <FieldTypeButton key={field.type} fieldType={field} onFieldAdd={onFieldAdd} variant="grid" />
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
            <FieldTypeButton key={field.type} fieldType={field} onFieldAdd={onFieldAdd} variant="list" />
          ))}
        </div>
      )}
    </div>
  )
}

interface FieldSidebarProps {
  onFieldSelected?: () => void;
  className?: string;
  variant?: 'list' | 'grid'; // Explicit visual variant
}

export default function FieldSidebar({ onFieldSelected, className, variant }: FieldSidebarProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();

  // If className is provided (typical for mobile drawer), we might default to 'grid' if variant not specified, or just trust the prop.
  // Actually, checking if className exists is a loose way to detect mobile. Explicit prop is better.
  const visualVariant = variant || (className ? 'grid' : 'list');

  // Helper to intercept add field calls
  const handleFieldSelect = () => {
      if (onFieldSelected) {
          onFieldSelected();
      }
  };

  return (
    <div 
      className={className || `bg-white border-r border-gray-200 flex flex-col h-full shadow-sm relative z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-[300px]'}`}
    >

      {/* Floating Toggle Button - Desktop Only */}
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

       {/* Template Section Button */}
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
                     }}
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
                     <SidebarCategory key={category.name} category={category} isCollapsed={isCollapsed} onFieldAdd={handleFieldSelect} variant={visualVariant} />
                 ))}
                 {provided.placeholder}
             </div>
         )}
       </Droppable>
       </div>
     </div>
   );
 }
