import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { FieldType } from '@/types';
import BundleSidebarDragPreview from '@/components/admin/BundleSidebarDragPreview';
import { useBundleEditorStore } from '@/store/bundleEditorStore';
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
  FileX,
  LayoutGrid,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface SidebarFieldConfig {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options?: Record<string, unknown>;
  validation?: Record<string, unknown>;
}

export const fieldCategories: { name: string; fields: SidebarFieldConfig[] }[] = [
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
    ],
  },
];

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

function FieldTypeButton({ config, isCollapsed }: { config: SidebarFieldConfig; isCollapsed: boolean }) {
  const labels = useFieldLabels();
  const { addField } = useBundleEditorStore();
  const Icon = config.icon;
  const translatedLabel = labels[config.label as keyof ReturnType<typeof useFieldLabels>] || config.label;

  const needsOptions = (type: FieldType) =>
    [FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX].includes(type);

  const handleDoubleClick = () => {
    addField({
      type: config.type,
      label: config.label,
      required: false,
      validation: config.validation,
      options: config.options || (needsOptions(config.type) ? [
        { id: 'opt-1', label: 'Option 1', value: 'option-1' },
        { id: 'opt-2', label: 'Option 2', value: 'option-2' },
      ] : undefined),
    });
  };

  return (
    <div
      onClick={handleDoubleClick}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'px-3'} py-2 text-sm text-black bg-white hover:bg-gray-50 rounded-md border border-gray-400 transition-colors cursor-grab active:cursor-grabbing`}
    >
      <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
      {!isCollapsed && <span>{translatedLabel}</span>}
    </div>
  );
}

function SidebarCategory({ category, isCollapsed, startIndex }: { category: { name: string; fields: SidebarFieldConfig[] }; isCollapsed: boolean; startIndex: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const labels = useFieldLabels();
  const translatedCategoryName = labels[category.name as keyof ReturnType<typeof useFieldLabels>] || category.name;

  if (isCollapsed) {
    return (
      <div className="space-y-2">
        <div className="w-full h-px bg-gray-200 my-1" />
        {category.fields.map((field, index) => {
          
          
          
          
          return (
            <div key={field.type} className="relative z-0 select-none">
                { }
                <div className="relative z-0">
                    <FieldTypeButton config={field} isCollapsed={true} />
                </div>

                { }
                <Draggable draggableId={`sidebar-${field.type}`} index={startIndex + index}>
                  {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        className={cn(
                          "z-10 w-full h-full touch-none",
                          
                          
                          
                          
                          snapshot.isDragging ? "opacity-0 fixed" : "absolute inset-0 opacity-0"
                        )}
                        style={
                           snapshot.isDragging 
                           ? { ...provided.draggableProps.style, opacity: 0 } 
                           : provided.draggableProps.style
                        }
                      >
                          <div className="w-full h-full"> 
                              <FieldTypeButton config={field} isCollapsed={true} />
                          </div>
                      </div>
                  )}
                </Draggable>
            </div>
          );
        })}
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
          {category.fields.map((field, index) => (
            <div key={field.type} className="relative z-0 select-none">
               { }
               <div className="relative z-0">
                  <FieldTypeButton config={field} isCollapsed={false} />
               </div>

               { }
               <Draggable draggableId={`sidebar-${field.type}`} index={startIndex + index}>
                  {(provided, snapshot) => (
                     <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "z-10 w-full h-full touch-none",
                          
                          snapshot.isDragging ? "opacity-0 fixed" : "absolute inset-0 opacity-0"
                        )}
                        style={
                           snapshot.isDragging 
                           ? { ...provided.draggableProps.style, opacity: 0 } 
                           : provided.draggableProps.style
                        }
                      >
                           <div className="w-full h-full">
                              <FieldTypeButton config={field} isCollapsed={false} />
                           </div>
                      </div>
                  )}
               </Draggable>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BundleFieldsSidebar() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  let runningIndex = 0;

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-[300px]'} relative`}>
      
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:scale-110 transition-all z-50 flex items-center justify-center w-8 h-8"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      <div className={`p-4 border-b border-gray-200 flex items-center justify-center bg-white`}>
        {!isCollapsed && <h2 className="font-semibold text-gray-800 whitespace-nowrap overflow-hidden">{t('builder.fields')}</h2>}
      </div>
      
      <Droppable 
        droppableId="BUNDLE-SIDEBAR" 
        isDropDisabled={true}
        
        
        
        renderClone={(provided, _snapshot, rubric) => {
          
          
          const fieldType = rubric.draggableId.replace('sidebar-', '') as FieldType;
          const field = fieldCategories.flatMap(c => c.fields).find(f => f.type === fieldType);
          
          if (!field) return <div />;

          return (
             <div
               ref={provided.innerRef}
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               style={provided.draggableProps.style}
               className="z-[9999]" 
             >
                <div className="w-[300px]"> { }
                  <BundleSidebarDragPreview fieldConfig={field} />
                </div>
             </div>
          );
        }}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'} space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent`}
          >
            {fieldCategories.map((category) => {
              const categoryStartIndex = runningIndex;
              runningIndex += category.fields.length;
              return (
                <SidebarCategory 
                  key={category.name}
                  category={category} 
                  isCollapsed={isCollapsed}
                  startIndex={categoryStartIndex}
                />
              );
            })}
            
            { }
            <div className="hidden">
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
