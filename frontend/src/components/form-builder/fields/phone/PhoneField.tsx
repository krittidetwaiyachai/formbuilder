import React from 'react';
import { Field } from '@/types';
import { Phone } from 'lucide-react';

interface PhoneFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const showCountryCode = (field.validation as any)?.countryCode || false;
  const phoneSublabel = (field.validation as any)?.sublabels?.masked;
  const phonePlaceholder = (field.validation as any)?.placeholders?.masked || (field.validation as any)?.maskPattern || '(###) ###-####';

  return (
    <div className="space-y-2 max-w-full group">
       <div className="flex gap-4">
          {showCountryCode && (
             <div className="w-[80px]">
                <input
                  type="text"
                   placeholder="+1"
                  readOnly
                  tabIndex={-1}
                  className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-green-50/20 text-black text-base shadow-sm text-center transition-all duration-300 ${disabledClass} group-hover/field:bg-white group-hover/field:shadow-md`}
                />
             </div>
          )}
          <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
                <Phone className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
              </div>
              <input
                type="tel"
                placeholder={phonePlaceholder}
                readOnly
                tabIndex={-1}
                className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-green-50/20 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover/field:bg-white group-hover/field:shadow-md`}
              />
          </div>
       </div>
       {phoneSublabel && (
          <p className="text-xs text-gray-500">{phoneSublabel}</p>
       )}
    </div>
  );
};
