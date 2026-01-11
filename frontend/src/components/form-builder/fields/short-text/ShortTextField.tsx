import React from 'react';
import { Field } from '@/types';
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
  const { hoverText, width, customWidth } = field.options || {};

  return (
    <div className="relative max-w-full group" title={hoverText}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-hover/field:text-black">
        <Type className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
      </div>
      <input
        type="text"
        placeholder={field.placeholder || 'Enter text...'}
        readOnly
        tabIndex={-1}
        style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
        className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder || 'border-gray-200'} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover/field:border-blue-300 group-hover/field:shadow-md focus:ring-2 focus:ring-blue-100 outline-none`}
      />
    </div>
  );
};
