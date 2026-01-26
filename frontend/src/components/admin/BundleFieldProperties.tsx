import { useBundleEditorStore } from '@/store/bundleEditorStore';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FieldType, Field } from '@/types';


import { DateProperties } from '@/components/field-properties/advanced/DateProperties';
import { FullNameProperties } from '@/components/field-properties/text/FullNameProperties';
import { EmailProperties } from '@/components/field-properties/text/EmailProperties';
import { AddressProperties } from '@/components/field-properties/advanced/AddressProperties';
import { PhoneProperties } from '@/components/field-properties/text/PhoneProperties';
import { ShortTextProperties } from '@/components/field-properties/text/ShortTextProperties';
import { LongTextProperties } from '@/components/field-properties/text/LongTextProperties';
import { ParagraphProperties } from '@/components/field-properties/text/ParagraphProperties';
import { DropdownProperties } from '@/components/field-properties/choice/DropdownProperties';
import { RadioProperties } from '@/components/field-properties/choice/RadioProperties';
import { CheckboxProperties } from '@/components/field-properties/choice/CheckboxProperties';
import { NumberProperties } from '@/components/field-properties/text/NumberProperties';
import { TimeProperties } from '@/components/field-properties/advanced/TimeProperties';
import { SubmitProperties } from '@/components/field-properties/advanced/SubmitProperties';
import { HeaderProperties } from '@/components/field-properties/advanced/HeaderProperties';
import { RateProperties } from '@/components/field-properties/advanced/RateProperties';
import { MatrixProperties } from '@/components/field-properties/advanced/MatrixProperties';
import { TableProperties } from '@/components/field-properties/advanced/TableProperties';


const COLOR_OPTIONS = [
    { label: 'Gray', value: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' },
    { label: 'Blue', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Purple', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' },
    { label: 'Amber', value: 'amber', bg: 'bg-amber-100', text: 'text-amber-600' },
    { label: 'Emerald', value: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Pink', value: 'pink', bg: 'bg-pink-100', text: 'text-pink-600' },
    { label: 'Rose', value: 'rose', bg: 'bg-rose-100', text: 'text-rose-600' },
];

const ICON_OPTIONS = [
    { label: 'Layer', value: 'Layers' },
    { label: 'User', value: 'User' },
    { label: 'Work', value: 'Briefcase' },
    { label: 'Event', value: 'CalendarCheck' },
    { label: 'Message', value: 'MessageSquare' },
    { label: 'Share', value: 'Share2' },
    { label: 'Education', value: 'GraduationCap' },
    { label: 'Star', value: 'Star' },
    { label: 'Secure', value: 'Lock' },
];

import {
  Layers,
  User,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  Share2,
  GraduationCap,
  Star,
  Lock
} from 'lucide-react';

const IconMap: Record<string, any> = {
  Layers, User, Briefcase, CalendarCheck, MessageSquare, Share2, GraduationCap, Star, Lock
};

function BundleSettings({ bundle, updateBundleMeta }: { bundle: any; updateBundleMeta: any }) {

    return (
        <div className="space-y-6">
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-black mb-1">
                        Bundle Name
                    </label>
                    <input
                        type="text"
                        value={bundle.name}
                        onChange={(e) => updateBundleMeta({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-black mb-1">
                        Description
                    </label>
                    <textarea
                        value={bundle.description || ''}
                        onChange={(e) => updateBundleMeta({ description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none"
                    />
                </div>



                { }
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Appearance</h4>
                    
                    { }
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Icon</label>
                        <div className="grid grid-cols-5 gap-2">
                            {ICON_OPTIONS.map((iconOpt) => {
                                const IconComponent = IconMap[iconOpt.value] || Layers;
                                const isSelected = (bundle.options?.icon || 'Layers') === iconOpt.value;
                                return (
                                    <button
                                        key={iconOpt.value}
                                        onClick={() => updateBundleMeta({ options: { ...bundle.options, icon: iconOpt.value } })}
                                        className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                                            ${isSelected 
                                                ? 'bg-black text-white shadow-md scale-105' 
                                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                            }
                                        `}
                                        title={iconOpt.label}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    { }
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Color Theme</label>
                        <div className="grid grid-cols-4 gap-2">
                             {COLOR_OPTIONS.map((color) => {
                                 const isSelected = (bundle.options?.color || 'text-gray-600') === color.text;
                                 return (
                                     <button
                                         key={color.value}
                                         onClick={() => updateBundleMeta({ options: { ...bundle.options, color: color.text, bg: color.bg } })}
                                         className={`
                                             group relative w-full h-9 rounded-md border flex items-center justify-center transition-all
                                             ${isSelected ? 'border-black ring-1 ring-black/10' : 'border-gray-200 hover:border-gray-300'}
                                         `}
                                     >
                                        <div className={`w-4 h-4 rounded-full ${color.bg} border border-black/5`}></div>
                                        <span className="ml-2 text-xs text-gray-600 font-medium capitalize">{color.label}</span>
                                        {isSelected && <div className="absolute inset-0 rounded-md ring-2 ring-black pointer-events-none" />}
                                     </button>
                                 )
                             })}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}


export default function BundleFieldProperties() {
  const { t } = useTranslation();
  const { bundle, selectedFieldId, updateField, addField, updateBundleMeta } = useBundleEditorStore();
  const selectedField = bundle?.fields.find((f) => f.id === selectedFieldId);

  
  
  const handleDuplicate = (fieldData: Omit<Field, 'id'>) => {
    
    
    
    const { order, formId, ...rest } = fieldData as any;
    addField(rest);
  };

  if (!bundle) return null;

  return (
    <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full z-20 shadow-[-2px_0_15px_-3px_rgba(0,0,0,0.05)]">
      { }
      <div className="border-b border-gray-100 bg-white px-4 py-3 sticky top-0 z-10 shrink-0 h-[57px] flex items-center">
         <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <Settings className="w-4 h-4" />
            <span>{selectedField ? t('builder.tabs.properties') : 'Bundle Settings'}</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 content-container">
         {!selectedField ? (
             <BundleSettings bundle={bundle} updateBundleMeta={updateBundleMeta} />
         ) : (
             <div className="space-y-4">
                 { }
                 {(() => {
                    const fieldProps: any = {
                        field: selectedField,
                        updateField: updateField,
                        duplicatesField: handleDuplicate
                    };

                    switch (selectedField.type) {
                        case FieldType.FULLNAME: return <FullNameProperties {...fieldProps} />;
                        case FieldType.EMAIL: return <EmailProperties {...fieldProps} />;
                        case FieldType.ADDRESS: return <AddressProperties {...fieldProps} />;
                        case FieldType.PHONE: return <PhoneProperties {...fieldProps} />;
                        case FieldType.DATE: return <DateProperties {...fieldProps} />;
                        case FieldType.HEADER: return <HeaderProperties {...fieldProps} />;
                        case FieldType.TEXT: return <ShortTextProperties {...fieldProps} />;
                        case FieldType.TEXTAREA: return <LongTextProperties {...fieldProps} />;
                        case FieldType.PARAGRAPH: return <ParagraphProperties {...fieldProps} />;
                        case FieldType.DROPDOWN: return <DropdownProperties {...fieldProps} />;
                        case FieldType.RADIO: return <RadioProperties {...fieldProps} />;
                        case FieldType.CHECKBOX: return <CheckboxProperties {...fieldProps} />;
                        case FieldType.NUMBER: return <NumberProperties {...fieldProps} />;
                        case FieldType.TIME: return <TimeProperties {...fieldProps} />;
                        case FieldType.SUBMIT: return <SubmitProperties {...fieldProps} />; 
                        case FieldType.RATE: return <RateProperties {...fieldProps} />;
                        case FieldType.MATRIX: return <MatrixProperties {...fieldProps} />;
                        case FieldType.TABLE: return <TableProperties {...fieldProps} />;
                        default: return (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Properties for {selectedField.type} not available.
                            </div>
                        );
                    }
                 })()}
             </div>
         )}
      </div>
    </div>
  );
}
