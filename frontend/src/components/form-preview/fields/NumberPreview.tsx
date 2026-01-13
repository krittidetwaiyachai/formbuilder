import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Hash } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export const NumberPreview: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, shrink } = options;
  const { min, max, entryLimits } = validation;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const validationRules: any = {
    required: field.required ? 'This field is required' : false,
  };

  if (entryLimits) {
    if (min !== undefined && min !== null) {
      validationRules.min = {
        value: min,
        message: `Minimum value is ${min}`
      };
    }
    if (max !== undefined && max !== null) {
      validationRules.max = {
        value: max,
        message: `Maximum value is ${max}`
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
                <Hash className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {isPublic ? (
            <input
                type="number"
                id={fieldName}
                {...register(fieldName, { ...validationRules, valueAsNumber: true })}
                placeholder={field.placeholder || "Enter a number..."}
                defaultValue={defaultValue}
                readOnly={readOnly}
                min={entryLimits ? min : undefined}
                max={entryLimits ? max : undefined}
                style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                className={`w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all ${
                    fieldError ? 'border-red-500 bg-red-50' : 'hover:border-gray-300'
                } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
          ) : (
            <input
                type="number"
                id={fieldName}
                {...register(fieldName, { ...validationRules, valueAsNumber: true })}
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