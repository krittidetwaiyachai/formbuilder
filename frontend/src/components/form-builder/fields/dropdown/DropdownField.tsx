import React from 'react';
import { Field } from '@/types';
import { ChevronDown } from 'lucide-react';

interface DropdownFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const getOptions = () => {
    if (!field.options) return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
    if (Array.isArray(field.options)) {
      if (field.options.length > 0 && typeof field.options[0] === 'object') {
        return field.options;
      }
      return field.options.map((opt: string) => ({ label: opt, value: opt }));
    }
    return [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }];
  };

  const options = getOptions();

  const isMultiple = field.validation?.multiple;
  const rows = field.validation?.rows;
  // If multiple is true OR rows > 1, show as list
  const showAsList = isMultiple || (rows && rows > 1);

  if (showAsList) {
      return (
          <div className={`w-full border ${fieldStyle.inputBorder} rounded-xl bg-orange-50/30 overflow-hidden shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}>
              <div className="p-2 space-y-1">
                  {options.slice(0, rows || 4).map((opt: any, idx: number) => (
                      <div key={idx} className="px-3 py-2 hover:bg-orange-100/50 rounded-lg text-sm text-gray-700 truncate">
                          {opt.label || opt.value}
                      </div>
                  ))}
                  {options.length > (rows || 4) && (
                      <div className="px-3 py-1 text-xs text-gray-400 italic">
                          ... {options.length - (rows || 4)} more options
                      </div>
                  )}
              </div>
          </div>
      );
  }

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
};
