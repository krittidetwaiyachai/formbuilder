import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Phone } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export const PreviewPhoneField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, shrink, showCountryCode } = options;
  const { hasInputMask, inputMask } = validation;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const validationRules: any = {
    required: field.required ? 'This field is required' : false,
    pattern: {
      value: /^[\d\s\-\(\)\+]+$/,
      message: "Please enter a valid phone number"
    }
  };

  const formatPhoneMask = (value: string, maskPattern: string) => {
    let formatted = '';
    let rawPtr = 0;
    
    for (let i = 0; i < maskPattern.length; i++) {
      const maskChar = maskPattern[i];
      if (rawPtr >= value.length) break;

      if (maskChar === '#') {
        while (rawPtr < value.length) {
          const char = value[rawPtr];
          if (/\d/.test(char)) {
            formatted += char;
            rawPtr++;
            break;
          } else {
            rawPtr++;
          }
        }
      } else {
        formatted += maskChar;
        if (value[rawPtr] === maskChar) {
          rawPtr++;
        }
      }
    }
    return formatted;
  };

  return (
    <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <label htmlFor={fieldName} className={`block font-semibold text-gray-800 ${isPublic ? 'text-base' : 'text-sm'}`}>
          {questionNumber && <span className="text-gray-500 mr-2">{questionNumber} <span className="text-gray-300">|</span></span>}
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {subLabel && subLabel !== 'Sublabel' && (
           <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
        )}
      </div>

      <div className={`flex-1 min-w-0`}>
        <div className="relative group flex items-center gap-2" title={hoverText}>
          {showCountryCode && isPublic && (
            <select
              className={`${shrink ? 'py-2 text-base' : 'py-3 text-base'} px-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none cursor-pointer`}
              defaultValue="+66"
            >
              <option value="+66">🇹🇭 +66</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+82">🇰🇷 +82</option>
            </select>
          )}

          {!isPublic && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {isPublic ? (
            <input
                type="tel"
                id={fieldName}
                {...register(fieldName, {
                    ...validationRules,
                    onChange: (e) => {
                        if (hasInputMask && inputMask) {
                            const newValue = formatPhoneMask(e.target.value, inputMask);
                            if (newValue !== e.target.value) {
                                e.target.value = newValue;
                            }
                        }
                    }
                })}
                placeholder={field.placeholder || "081-234-5678"}
                defaultValue={defaultValue}
                readOnly={readOnly}
                maxLength={hasInputMask && inputMask ? inputMask.length : undefined}
                style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                className={`flex-1 px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${
                    fieldError ? 'border-red-500 bg-red-50' : 'hover:border-gray-300'
                } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          ) : (
            <input
                type="tel"
                id={fieldName}
                {...register(fieldName, validationRules)}
                placeholder={field.placeholder}
                defaultValue={defaultValue}
                readOnly={readOnly}
                style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                className={`w-full pl-10 pr-4 py-3 border-2 ${
                fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                } rounded-lg text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${
                readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                }`}
            />
          )}
        </div>

        {fieldError && (
          <p className="mt-1 text-sm text-red-600">{fieldError.message as string}</p>
        )}
      </div>
    </div>
  );
};
