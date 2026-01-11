import React from 'react';
import { Field } from '@/types';
import { Mail } from 'lucide-react';

interface EmailFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const showConfirmation = (field.validation as any)?.confirmation;
  const isReadOnly = (field.validation as any)?.readOnly;

  return (
    <div className="space-y-3 pointer-events-none">
       <div className="relative max-w-full group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300">
           <Mail className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
         </div>
         <input
           type="email"
           placeholder={field.placeholder || 'Enter email...'}
           readOnly
           tabIndex={-1}
           className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-blue-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} group-hover/field:bg-white group-hover/field:shadow-md ${isReadOnly ? 'opacity-50' : ''}`}
         />
       </div>
       
       {showConfirmation && (
         <div className="relative max-w-full group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300">
             <Mail className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
           </div>
           <input
             type="email"
             placeholder="Confirm Email"
             readOnly
             tabIndex={-1}
             className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-blue-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} group-hover/field:bg-white group-hover/field:shadow-md ${isReadOnly ? 'opacity-50' : ''}`}
           />

         </div>
       )}
    </div>
  );
};
