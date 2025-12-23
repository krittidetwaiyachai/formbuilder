import React from 'react';
import { Field, FieldType } from '@/types';
import { Type } from 'lucide-react';

interface ShortTextFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const ShortTextField: React.FC<ShortTextFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const options = field.options || {};
  const validation = field.validation || {};
  const { width, customWidth, hoverText } = options;
  const { maxLength, hasMaxLength } = validation;
  // Previously TextField handled Number if type was 'Number', but we have NumberField for that.
  // We'll keep it strictly text here or allow it if it falls back?
  // Let's assume this is mostly for Short Text.
  const isNumber = field.type === FieldType.NUMBER; 

  return (
    <div className="relative max-w-full group" title={hoverText}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-hover:text-black">
        {isNumber ? (
            <div className="font-bold text-gray-400 text-sm">123</div>
        ) : (
            <Type className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <input
        id={field.id}
        name={field.id}
        type={isNumber ? "number" : "text"}
        placeholder={field.placeholder || (isNumber ? 'Enter number...' : 'Enter text...')}
        readOnly
        tabIndex={-1}
        maxLength={!isNumber && hasMaxLength ? maxLength : undefined}
        style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
        className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-gray-50/50 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md appearance-none`}
      />
    </div>
  );
};
