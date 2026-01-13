import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com', 'protonmail.com', 'icloud.com', 'live.com', 'msn.com'];

export const EmailPreview: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, shrink } = options;
  const { maxLength, hasMaxLength, disallowFree, confirmation } = validation;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const validationRules: any = {
    required: field.required ? 'This field is required' : false,
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  };

  if (hasMaxLength && maxLength) {
    validationRules.maxLength = {
      value: maxLength,
      message: `Max length is ${maxLength} characters`
    };
  }

  if (disallowFree) {
    validationRules.validate = {
      ...validationRules.validate,
      noFreeEmail: (value: string) => {
        if (!value) return true;
        const domain = value.split('@')[1]?.toLowerCase();
        if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
          return "Please use a business/work email address";
        }
        return true;
      }
    };
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
                <Mail className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {isPublic ? (
            <input
                type="email"
                id={fieldName}
                {...register(fieldName, validationRules)}
                placeholder={field.placeholder || "email@example.com"}
                defaultValue={defaultValue}
                readOnly={readOnly}
                maxLength={hasMaxLength ? maxLength : undefined}
                style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                className={`w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${
                    fieldError ? 'border-red-500 bg-red-50' : 'hover:border-gray-300'
                } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          ) : (
            <input
                type="email"
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

        {confirmation && isPublic && (
          <div className="mt-4">
            <label htmlFor={`${fieldName}_confirm`} className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Email
            </label>
            <input
                type="email"
                id={`${fieldName}_confirm`}
                {...register(`${fieldName}_confirm`, {
                    required: field.required ? 'Please confirm your email' : false,
                    validate: (value: string, formValues: any) => {
                        if (value !== formValues[fieldName]) {
                            return 'Emails do not match';
                        }
                        return true;
                    }
                })}
                placeholder="Confirm your email"
                className={`w-full px-0 ${shrink ? 'py-2 text-base' : 'py-3 text-lg'} border-0 border-b-2 bg-transparent text-gray-900 placeholder:text-gray-300 focus:ring-0 focus:border-black transition-all ${
                    errors[`${fieldName}_confirm`] ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
            />
            {errors[`${fieldName}_confirm`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_confirm`].message as string}</p>
            )}
          </div>
        )}

        {fieldError && (
          <p className="mt-1 text-sm text-red-600">{fieldError.message as string}</p>
        )}
      </div>
    </div>
  );
};