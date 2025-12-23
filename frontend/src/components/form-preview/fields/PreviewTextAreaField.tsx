import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { FileText } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
}

export const PreviewTextAreaField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, rows = 4 } = options;
  const { maxLength, hasMaxLength, minLength, hasEntryLimits, type: validationType } = validation;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  // Validation rules
  const validationRules: any = {
    required: field.required ? 'This field is required' : false,
  };

  if (hasEntryLimits || hasMaxLength) {
      if (maxLength) {
           validationRules.maxLength = {
                value: maxLength,
                message: `Max length is ${maxLength} characters`
           };
      }
      if (minLength) {
           validationRules.minLength = {
                value: minLength,
                message: `Min length is ${minLength} characters`
           };
      }
  }

  // Regex/Type validation logic same as TextField...
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
      }  else if (validationType === 'Numeric') {
           validationRules.pattern = {
              value: /^[0-9\s]*$/,
              message: "Only numeric characters allowed"
          };
      }
  }


  return (
    <div className={`mb-4 ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-2'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <label htmlFor={fieldName} className="block text-sm font-medium text-black">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      <div className="flex-1 min-w-0">
        <div className="relative group" title={hoverText}>
            <div className="absolute left-3 top-4 pointer-events-none">
            <FileText className="h-4 w-4 text-purple-500" />
            </div>
            <textarea
            id={fieldName}
            {...register(fieldName, validationRules)}
            placeholder={field.placeholder}
            defaultValue={defaultValue}
            readOnly={readOnly}
            rows={rows}
            maxLength={hasMaxLength || (hasEntryLimits && maxLength) ? maxLength : undefined}
            style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
            className={`w-full pl-10 pr-4 py-3 border-2 ${
                fieldError ? 'border-red-500 bg-red-50' : 'border-purple-300 bg-white'
            } rounded-xl text-black text-sm shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
            }`}
            />
        </div>
        {subLabel && (
            <p className="mt-1 text-xs text-gray-500">{subLabel}</p>
        )}
        {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message as string}</p>
        )}
      </div>
    </div>
  );
};
