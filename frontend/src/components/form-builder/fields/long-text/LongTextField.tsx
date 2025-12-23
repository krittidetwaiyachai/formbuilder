import React from 'react';
import { Field } from '@/types';
import { FileText } from 'lucide-react';

interface LongTextFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const LongTextField: React.FC<LongTextFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const options = field.options || {};
  const validation = field.validation || {};
  const { width, customWidth, hoverText, rows = 4 } = options;
  const { maxLength, hasMaxLength } = validation;

  return (
    <div className="relative max-w-full group" title={hoverText}>
      <div className="absolute left-4 top-4 pointer-events-none transition-colors duration-300 group-hover:text-black">
         <FileText className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover:opacity-100`} />
      </div>
      <textarea
        placeholder={field.placeholder || 'Enter text...'}
        readOnly
        tabIndex={-1}
        rows={rows}
        maxLength={hasMaxLength ? maxLength : undefined}
        style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
        className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-purple-50/30 text-black text-base shadow-sm resize-none transition-all duration-300 ${disabledClass} pointer-events-none group-hover:bg-white group-hover:shadow-md`}
      />
    </div>
  );
};
