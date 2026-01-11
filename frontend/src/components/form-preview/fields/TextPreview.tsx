import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Type } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export const TextPreview: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, shrink } = options;
  const { maxLength, hasMaxLength, type: validationType } = validation;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  // Validation rules
  const validationRules: any = {
    required: field.required ? 'This field is required' : false,
  };

  if (hasMaxLength && maxLength) {
    validationRules.maxLength = {
      value: maxLength,
      message: `Max length is ${maxLength} characters`
    };
  }

  if (validationType) {
    if (validationType === 'Email') {
      validationRules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address"
      };
    } else if (validationType === 'URL') {
      validationRules.pattern = {
        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: "Invalid URL"
      };
    } else if (validationType === 'Alphabetic') {
      validationRules.pattern = {
        value: /^[a-zA-Z\s]*$/,
        message: "Only alphabetic characters allowed"
      };
    } else if (validationType === 'Alphanumeric') {
      validationRules.pattern = {
        value: /^[a-zA-Z0-9\s]*$/,
        message: "Only alphanumeric characters allowed"
      };
    } else if (validationType === 'Numeric') {
      validationRules.pattern = {
        value: /^[0-9\s]*$/,
        message: "Only numeric characters allowed"
      };
    }
  }

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
        <div className="relative group" title={hoverText}>
          {!isPublic && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Type className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {isPublic ? (
             // Public Design: Clean, underlined or minimal box
            <input
                type="text"
                id={fieldName}
                {...register(fieldName, {
                    ...validationRules,
                    onChange: (e) => {
                        if (validation.hasInputMask && validation.inputMask) {
                            const mask = validation.inputMask;
                            const value = e.target.value;
                            
                            const formatMask = (rawValue: string, maskPattern: string) => {
                                let formatted = '';
                                let rawPtr = 0;
                                
                                for (let i = 0; i < maskPattern.length; i++) {
                                    const maskChar = maskPattern[i];
                                    if (rawPtr >= rawValue.length) break;

                                    if (maskChar === '#' || maskChar === '@' || maskChar === '*') {
                                        let isValid = false;
                                        while (rawPtr < rawValue.length) {
                                            const char = rawValue[rawPtr];
                                            const isNum = /\d/.test(char);
                                            const isLetter = /[a-zA-Z]/.test(char);
                                            
                                            if (maskChar === '#' && isNum) isValid = true;
                                            else if (maskChar === '@' && isLetter) isValid = true;
                                            else if (maskChar === '*' && (isNum || isLetter)) isValid = true;
                                            
                                            if (isValid) {
                                                formatted += char;
                                                rawPtr++;
                                                break;
                                            } else {
                                                rawPtr++;
                                            }
                                        }
                                    } else {
                                        formatted += maskChar;
                                        if (rawValue[rawPtr] === maskChar) {
                                            rawPtr++;
                                        }
                                    }
                                }
                                return formatted;
                            };

                            const newValue = formatMask(value, mask);
                            if (newValue !== value) {
                                e.target.value = newValue;
                            }
                        }
                    }
                })}
                placeholder={field.placeholder || "Type your answer here..."}
                defaultValue={defaultValue}
                readOnly={readOnly}
                maxLength={validation.hasInputMask && validation.inputMask ? validation.inputMask.length : (hasMaxLength ? maxLength : undefined)}
                style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                className={`w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${
                    fieldError ? 'border-red-500 bg-red-50' : 'hover:border-gray-300'
                }`}
            />
          ) : (
            // Builder Design
            <input
                type="text"
                id={fieldName}
                {...register(fieldName, validationRules)}
                placeholder={field.placeholder}
                defaultValue={defaultValue}
                readOnly={readOnly}
                maxLength={hasMaxLength ? maxLength : undefined}
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