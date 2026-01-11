import React from 'react';
import { Field } from '@/types';
import { Hash } from 'lucide-react';

interface NumberFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  return (
    <div className="relative max-w-full group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
         <Hash className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
      </div>
      <input
        type="number"
        placeholder={field.placeholder || 'Enter number...'}
        readOnly
        tabIndex={-1}
        className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-emerald-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover/field:bg-white group-hover/field:shadow-md`}
      />
    </div>
  );
};
