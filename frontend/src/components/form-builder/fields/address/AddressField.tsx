import React from 'react';
import { Field } from '@/types';
import { useFormStore } from '@/store/formStore';
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
  const { updateField } = useFormStore();
  const { inputBorder } = fieldStyle;

  // Correctly read from options
  const options = field.options || {};
  const showStreet = options.showStreet !== false;
  const showStreet2 = options.showStreet2 !== false;
  const showCity = options.showCity !== false;
  const showState = options.showState !== false;
  const showZip = options.showZip !== false;
  const showCountry = options.showCountry !== false;

  const addressSublabels = options.sublabels || {};
  const addressPlaceholders = options.placeholders || {};
  const stateInputType = options.stateInputType || 'text';

  const handleSubLabelBlur = (key: string, e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    updateField(field.id, {
        options: {
            ...options,
            sublabels: {
                ...addressSublabels,
                [key]: text
            }
        }
    });
  };

  const renderEditableSublabel = (key: string, defaultText: string) => (
      <div
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className="mt-1 text-xs text-gray-500 font-normal outline-none focus:outline-none focus:ring-0 border border-transparent hover:border-gray-200 rounded px-1 transition-colors empty:before:content-['Type_sublabel...']"
        onBlur={(e) => handleSubLabelBlur(key, e)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        dangerouslySetInnerHTML={{ __html: addressSublabels[key] || defaultText }}
        style={{ pointerEvents: 'auto', cursor: 'text' }}
      />
  );

  return (
    <div className="space-y-3 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
       {showStreet && (
          <div className="group">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={addressPlaceholders.street || 'Street Address'}
                readOnly
                tabIndex={-1}
                className={`w-full pl-12 pr-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
                style={{ pointerEvents: 'none' }}
              />
            </div>
            {renderEditableSublabel('street', 'Street Address')}
          </div>
       )}

       {showStreet2 && (
          <div className="relative group">
            <input
              type="text"
              placeholder={addressPlaceholders.street2 || 'Street Address Line 2'}
              readOnly
              tabIndex={-1}
              className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
               style={{ pointerEvents: 'none' }}
            />
            {renderEditableSublabel('street2', 'Street Address Line 2')}
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
                className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
                 style={{ pointerEvents: 'none' }}
              />
              {renderEditableSublabel('city', 'City')}
            </div>
        )}
        {showState && (
            <div className="relative group">
              {stateInputType === 'us_states' ? (
                  <select
                     disabled
                     className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass} appearance-none`}
                     style={{ pointerEvents: 'none' }}
                  >
                      <option>{addressPlaceholders.state || 'Select State'}</option>
                  </select>
              ) : (
                   <input
                    type="text"
                    placeholder={addressPlaceholders.state || 'State / Province'}
                    readOnly
                    tabIndex={-1}
                    className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
                    style={{ pointerEvents: 'none' }}
                  />
              )}
              {renderEditableSublabel('state', 'State / Province')}
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
              className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass}`}
               style={{ pointerEvents: 'none' }}
            />
            {renderEditableSublabel('zip', 'Postal / Zip Code')}
          </div>
         )}
         {showCountry && (
            <div className="relative group">
               <select
                     disabled
                     className={`w-full px-4 py-3.5 border ${inputBorder} rounded-xl bg-white text-black text-base shadow-sm transition-all duration-300 ${disabledClass} appearance-none`}
                     style={{ pointerEvents: 'none' }}
                  >
                      <option>{addressPlaceholders.country || 'Select Country'}</option>
                  </select>
              {renderEditableSublabel('country', 'Country')}
            </div>
         )}
      </div>
    </div>
  );
};
