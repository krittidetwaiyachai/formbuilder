import React from 'react';
import { Field } from '@/types';

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
  // Destructure fieldStyle to only get used properties, or prefix unused ones
  const { inputBorder } = fieldStyle;

  const showPrefix = (field.validation as any)?.showPrefix;
  const showMiddleName = (field.validation as any)?.showMiddleName;
  const showSuffix = (field.validation as any)?.showSuffix;
  const sublabels = (field.validation as any)?.sublabels || {};
  const placeholders = (field.validation as any)?.placeholders || {};

  return (
    <div className="flex flex-wrap gap-4 pointer-events-none">
      {showPrefix && (
         <div className="flex-1 min-w-[80px] relative group">
          <input
            type="text"
            placeholder={placeholders.prefix || 'Prefix'}
            readOnly
            tabIndex={-1}
            className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-gray-50/50 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass}`}
          />
           <span className="text-xs text-gray-500 mt-1 block">{sublabels.prefix || 'Prefix'}</span>
        </div>
      )}
      
      <div className="flex-1 min-w-[150px] relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
           {/* <User className="h-5 w-5 text-gray-400" /> */}
        </div>
        <input
          type="text"
          placeholder={placeholders.first || 'First Name'}
          readOnly
          tabIndex={-1}
          className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-gray-50/50 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass}`}
        />
        <span className="text-xs text-gray-500 mt-1 block">{sublabels.first || 'First Name'}</span>
      </div>

      {showMiddleName && (
         <div className="flex-1 min-w-[150px] relative group">
          <input
            type="text"
            placeholder={placeholders.middle || 'Middle Name'}
            readOnly
            tabIndex={-1}
            className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-gray-50/50 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass}`}
          />
           <span className="text-xs text-gray-500 mt-1 block">{sublabels.middle || 'Middle Name'}</span>
        </div>
      )}

      <div className="flex-1 min-w-[150px] relative group">
        <input
          type="text"
          placeholder={placeholders.last || 'Last Name'}
          readOnly
          tabIndex={-1}
          className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-gray-50/50 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass}`}
        />
         <span className="text-xs text-gray-500 mt-1 block">{sublabels.last || 'Last Name'}</span>
      </div>
      
      {showSuffix && (
         <div className="flex-1 min-w-[80px] relative group">
          <input
            type="text"
            placeholder={placeholders.suffix || 'Suffix'}
            readOnly
            tabIndex={-1}
            className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-gray-50/50 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass}`}
          />
           <span className="text-xs text-gray-500 mt-1 block">{sublabels.suffix || 'Suffix'}</span>
        </div>
      )}
    </div>
  );
};
