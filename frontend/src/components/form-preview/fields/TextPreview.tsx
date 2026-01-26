import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Type } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';
import { stripHtml } from '@/lib/ui/utils';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export const TextPreview: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, shrink } = options;
  const { maxLength, hasMaxLength, type: validationType } = validation;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  
  const validationRules: any = {
    required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false,
  };

  if (hasMaxLength && maxLength) {
    validationRules.maxLength = {
      value: maxLength,
      message: t('public.validation.max_length', { count: maxLength })
    };
  }

  if (validationType) {
    if (validationType === 'Email') {
      validationRules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: t('public.validation.invalid_email', "Invalid email address")
      };
    } else if (validationType === 'URL') {
      validationRules.pattern = {
        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        message: t('public.validation.invalid_url', "Invalid URL")
      };
    } else if (validationType === 'Alphabetic') {
      validationRules.pattern = {
        value: /^[a-zA-Z\s]*$/,
        message: t('public.validation.alphabetic', "Only alphabetic characters allowed")
      };
    } else if (validationType === 'Alphanumeric') {
      validationRules.pattern = {
        value: /^[a-zA-Z0-9\s]*$/,
        message: t('public.validation.alphanumeric', "Only alphanumeric characters allowed")
      };
    } else if (validationType === 'Numeric') {
      validationRules.pattern = {
        value: /^[0-9\s]*$/,
        message: t('public.validation.numeric', "Only numeric characters allowed")
      };
    }
  }

  return (
    <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
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
                placeholder={field.placeholder || t('public.placeholder.text', "Type your answer here...")}
                defaultValue={defaultValue}
                readOnly={readOnly}
                maxLength={validation.hasInputMask && validation.inputMask ? validation.inputMask.length : (hasMaxLength ? maxLength : undefined)}
                style={width === 'FIXED' && customWidth ? { 
                    maxWidth: `${customWidth}px`, 
                    color: 'var(--text)', 
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)'
                } : { 
                    color: 'var(--text)', 
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)'
                }}
                className={`w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    fieldError ? 'border-red-500 bg-red-50/10' : 'hover:border-primary/50'
                } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          ) : (
            
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