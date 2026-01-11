import React from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';
import { User } from 'lucide-react';

interface FullNameFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const FullNameField: React.FC<FullNameFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const { updateField } = useFormStore();
  const { inputBorder } = fieldStyle;

  // Correctly read from options, matching FullNameProperties
  const options = field.options || {};
  const showPrefix = options.showPrefix;
  const showMiddleName = options.showMiddleName;
  const showSuffix = options.showSuffix;
  const sublabels = options.sublabels || {};
  const placeholders = options.placeholders || {};

  const handleSubLabelBlur = (key: string, e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    updateField(field.id, {
        options: {
            ...options,
            sublabels: {
                ...sublabels,
                [key]: text
            }
        }
    });
  };

  const renderInput = (key: string, placeholder: string, defaultSublabel: string, minWidth: string) => (
    <div className={`flex-1 min-w-[${minWidth}] relative group`}>
      {key === 'first' && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
           {/* <User className="h-5 w-5 text-gray-400" /> */}
        </div>
      )}
      <input
        type="text"
        placeholder={placeholder || defaultSublabel}
        readOnly
        tabIndex={-1}
        className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-gray-50/50 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass}`}
        style={{ pointerEvents: 'none' }} // Inputs shouldn't be interactable in builder
      />
      <div
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className="mt-1 text-xs text-gray-500 font-normal outline-none focus:outline-none focus:ring-0 border border-transparent hover:border-gray-200 rounded px-1 transition-colors empty:before:content-['Type_sublabel...']"
        onBlur={(e) => handleSubLabelBlur(key, e)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        dangerouslySetInnerHTML={{ __html: sublabels[key] || defaultSublabel }}
        style={{ pointerEvents: 'auto', cursor: 'text' }}
      />
    </div>
  );

  return (
    <div className="flex flex-wrap gap-4">
      {showPrefix && renderInput('prefix', placeholders.prefix, 'Prefix', '80px')}
      {renderInput('first', placeholders.first, 'First Name', '150px')}
      {showMiddleName && renderInput('middle', placeholders.middle, 'Middle Name', '150px')}
      {renderInput('last', placeholders.last, 'Last Name', '150px')}
      {showSuffix && renderInput('suffix', placeholders.suffix, 'Suffix', '80px')}
    </div>
  );
};
