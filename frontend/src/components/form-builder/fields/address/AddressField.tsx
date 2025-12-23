import React from 'react';
import { Field } from '@/types';
import { MapPin } from 'lucide-react';

interface AddressFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const AddressField: React.FC<AddressFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const showStreet = (field.validation as any)?.showStreet !== false;
  const showStreet2 = (field.validation as any)?.showStreet2 !== false;
  const showCity = (field.validation as any)?.showCity !== false;
  const showState = (field.validation as any)?.showState !== false;
  const showZip = (field.validation as any)?.showZip !== false;
  const showCountry = (field.validation as any)?.showCountry !== false;

  const addressSublabels = (field.validation as any)?.sublabels || {};
  const addressPlaceholders = (field.validation as any)?.placeholders || {};
  const stateInputType = (field.validation as any)?.stateInputType || 'text';

  return (
    <div className="space-y-3 pointer-events-none bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
       {showStreet && (
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-9 pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={addressPlaceholders.street || 'Street Address'}
              readOnly
              tabIndex={-1}
              className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
            />
            <span className="text-xs text-gray-500 mt-1 block">{addressSublabels.street || 'Street Address'}</span>
          </div>
       )}

       {showStreet2 && (
          <div className="relative group">
            <input
              type="text"
              placeholder={addressPlaceholders.street2 || 'Street Address Line 2'}
              readOnly
              tabIndex={-1}
              className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
            />
            <span className="text-xs text-gray-500 mt-1 block">{addressSublabels.street2 || 'Street Address Line 2'}</span>
          </div>
       )}

      <div className="grid grid-cols-2 gap-4">
        {showCity && (
            <div className="relative group">
              <input
                type="text"
                placeholder={addressPlaceholders.city || 'City'}
                readOnly
                tabIndex={-1}
                className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
              />
              <span className="text-xs text-gray-500 mt-1 block">{addressSublabels.city || 'City'}</span>
            </div>
        )}
        {showState && (
            <div className="relative group">
              {stateInputType === 'us_states' ? (
                  <select
                     disabled
                     className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass} appearance-none`}
                  >
                      <option>{addressPlaceholders.state || 'Select State'}</option>
                  </select>
              ) : (
                   <input
                    type="text"
                    placeholder={addressPlaceholders.state || 'State / Province'}
                    readOnly
                    tabIndex={-1}
                    className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
                  />
              )}
              <span className="text-xs text-gray-500 mt-1 block">{addressSublabels.state || 'State / Province'}</span>
            </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
         {showZip && (
          <div className="relative group">
            <input
              type="text"
              placeholder={addressPlaceholders.zip || 'Postal / Zip Code'}
              readOnly
              tabIndex={-1}
              className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
            />
            <span className="text-xs text-gray-500 mt-1 block">{addressSublabels.zip || 'Postal / Zip Code'}</span>
          </div>
         )}
         {showCountry && (
            <div className="relative group">
               <select
                     disabled
                     className={`w-full px-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass} appearance-none`}
                  >
                      <option>{addressPlaceholders.country || 'Select Country'}</option>
                  </select>
              <span className="text-xs text-gray-500 mt-1 block">{addressSublabels.country || 'Country'}</span>
            </div>
         )}
      </div>
    </div>
  );
};
