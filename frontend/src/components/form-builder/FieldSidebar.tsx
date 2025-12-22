import { FieldType } from '@/types';
import { useFormStore } from '@/store/formStore';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
  Send,
  Minus,
  ChevronRight,
  FileX,
} from 'lucide-react';

const fieldCategories = [
  {
    name: 'Text Fields',
    fields: [
      { type: FieldType.TEXT, label: 'Short Text', icon: Type },
      { type: FieldType.EMAIL, label: 'Email', icon: Mail },
      { type: FieldType.PHONE, label: 'Phone', icon: Phone },
      { type: FieldType.NUMBER, label: 'Number', icon: Hash },
      { type: FieldType.TEXTAREA, label: 'Long Text', icon: FileText },
      { type: FieldType.FULLNAME, label: 'Full Name', icon: User },
      { type: FieldType.ADDRESS, label: 'Address', icon: MapPin },
    ],
  },
  {
    name: 'Choice Fields',
    fields: [
      { type: FieldType.DROPDOWN, label: 'Dropdown Menu', icon: ChevronDown },
      { type: FieldType.RADIO, label: 'Single Choice', icon: Circle },
      { type: FieldType.CHECKBOX, label: 'Multiple Choice', icon: CheckSquare },
    ],
  },
  {
    name: 'Date & Time',
    fields: [
      { type: FieldType.DATE, label: 'Date', icon: Calendar },
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
      { type: FieldType.SECTION_COLLAPSE, label: 'Collapsible Section', icon: ChevronRight },
      { type: FieldType.PAGE_BREAK, label: 'Page Break', icon: FileX },
    ],
  },
  {
    name: 'Actions',
    fields: [
      { type: FieldType.SUBMIT, label: 'Submit Button', icon: Send },
    ],
  },
];

function FieldTypeButton({ fieldType }: { fieldType: { type: FieldType; label: string; icon: any } }) {
  const { addField } = useFormStore();
  const Icon = fieldType.icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `sidebar-${fieldType.type}`,
    data: {
      source: 'sidebar',
      type: fieldType.type,
      label: fieldType.label,
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addField({
      type: fieldType.type,
      label: fieldType.label,
      required: false,
      order: 0, // Will be set to end of fields list
    });
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={handleClick}
      className="w-full flex items-center px-3 py-2 text-sm text-black bg-white hover:bg-gray-100 rounded-md border border-gray-400 transition-colors cursor-grab active:cursor-grabbing touch-none"
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1,
        visibility: isDragging ? 'hidden' : 'visible',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      <Icon className="h-4 w-4 mr-2 pointer-events-none" />
      <span className="pointer-events-none">{fieldType.label}</span>
    </div>
  );
}

export default function FieldSidebar() {
  return (
    <div className="w-64 bg-white h-full flex flex-col" style={{ overflow: 'visible' }}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-black mb-1">Form Elements</h3>
        <p className="text-xs text-gray-500">Click to add</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {fieldCategories.map((category) => (
            <div key={category.name}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category.name}
              </h4>
              <div className="space-y-2">
                {category.fields.map((fieldType) => (
                  <FieldTypeButton key={fieldType.type} fieldType={fieldType} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

