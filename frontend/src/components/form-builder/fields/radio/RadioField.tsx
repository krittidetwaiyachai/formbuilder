import React from 'react';
import { Field } from '@/types';

interface RadioFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
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
  const spreadToColumns = field.validation?.spreadToColumns;
  const columns = field.validation?.columns || 2;
  const otherOption = field.validation?.otherOption;

  return (
    <div className={`pt-1 ${spreadToColumns ? 'grid gap-3' : 'space-y-3'}`} style={spreadToColumns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}>
      {options.map((opt: any, idx: number) => (
        <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-pink-50/50 transition-colors duration-200 group`}>
          <div className="relative flex items-center justify-center shrink-0">
            <div className={`w-6 h-6 border-2 border-pink-200 rounded-full group-hover:border-pink-500 transition-colors`}></div>
            {idx === 0 && <div className="absolute w-3 h-3 bg-pink-500 rounded-full"></div>}
          </div>
          <span className="text-base font-medium text-gray-700">{opt.label || opt.value || opt}</span>
        </div>
      ))}
      {otherOption && (
           <div className={`flex items-center gap-4 p-3 rounded-xl border border-transparent hover:bg-pink-50/50 transition-colors duration-200 group`}>
              <div className="relative flex items-center justify-center shrink-0">
                <div className={`w-6 h-6 border-2 border-pink-200 rounded-full group-hover:border-pink-500 transition-colors`}></div>
              </div>
              <span className="text-base font-medium text-gray-700">Other</span>
              <div className="ml-2 px-2 py-1 border-b border-gray-300 w-full text-xs text-gray-400 italic">type here...</div>
          </div>
      )}
    </div>
  );
};
