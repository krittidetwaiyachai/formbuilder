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

interface BundleSidebarDragPreviewProps {
  fieldConfig: {
    type: FieldType;
    label: string;
    icon?: any;
    options?: any;
  };
}

export default function BundleSidebarDragPreview({ fieldConfig }: BundleSidebarDragPreviewProps) {
    
    const getIcon = () => {
        if (fieldConfig.icon) return fieldConfig.icon;
        switch (fieldConfig.type) {
            case FieldType.TEXT: return Type;
            case FieldType.TEXTAREA: return FileText;
            case FieldType.NUMBER: return Hash;
            case FieldType.EMAIL: return Mail;
            case FieldType.PHONE: return Phone;
            case FieldType.DROPDOWN: return ChevronDown;
            case FieldType.RADIO: return Circle;
            case FieldType.CHECKBOX: return CheckSquare;
            case FieldType.DATE: return Calendar;
            case FieldType.TIME: return Clock;
            case FieldType.RATE: return Star;
            case FieldType.HEADER: return Heading;
            case FieldType.PARAGRAPH: return AlignLeft;
            case FieldType.DIVIDER: return Minus;
            case FieldType.PAGE_BREAK: return FileX;
            case FieldType.GROUP: return Layers;
            case FieldType.FULLNAME: return User;
            case FieldType.ADDRESS: return MapPin;
            case FieldType.MATRIX:
            case FieldType.TABLE: return LayoutGrid;
            default: return Type;
        }
    };

    const Icon = getIcon();
    const theme = getFieldColorTheme(fieldConfig.type);
    
    const renderPreview = () => {
        const commonInput = "w-full h-9 bg-white rounded border border-gray-200 px-3 flex items-center text-xs text-gray-400 select-none";
        switch (fieldConfig.type) {
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
                        <span>{fieldConfig.type === FieldType.DATE ? 'Pick a date' : 'Pick a time'}</span>
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
            case FieldType.TABLE:
                return (
                     <div className="space-y-2 opacity-50">
                        <div className="flex gap-1">
                           <div className="w-1/3 h-6 bg-gray-100 rounded border border-gray-200"></div>
                           <div className="w-1/3 h-6 bg-gray-100 rounded border border-gray-200"></div>
                           <div className="w-1/3 h-6 bg-gray-100 rounded border border-gray-200"></div>
                        </div>
                    </div>
                );
            default:
                return <div className={commonInput}>{fieldConfig.type} Field</div>;
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
                <div className="font-bold text-base truncate text-gray-900">{fieldConfig.label}</div>
            </div>
            <div>
                {renderPreview()}
                {fieldConfig.options?.subLabel && (
                    <div className="text-[10px] text-gray-400 mt-1">
                        {fieldConfig.options.subLabel}
                    </div>
                )}
            </div>
        </div>
    );
}
