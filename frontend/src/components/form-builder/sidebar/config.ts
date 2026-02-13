import { FieldType } from '@/types';
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
    Layers,
    LayoutGrid
} from 'lucide-react';

export interface SidebarFieldConfig {
    type: FieldType;
    label: string;
    icon: React.ElementType;
    options?: Record<string, unknown>;
    validation?: Record<string, unknown>;
}

export const fieldCategories: { name: string; fields: SidebarFieldConfig[] }[] = [
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

export const allFields = fieldCategories.flatMap(c => c.fields);
