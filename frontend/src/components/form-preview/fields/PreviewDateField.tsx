import React from 'react';
import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { Calendar, Clock } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
}

export const PreviewDateField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  if (field.type === FieldType.DATE) {
       return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="h-4 w-4 text-teal-500" />
            </div>
            <input
              type="date"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className="w-full pl-10 pr-4 py-3 border-2 border-teal-300 rounded-xl bg-gradient-to-br from-teal-50 to-white text-black text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );
  }

  if (field.type === FieldType.TIME) {
       return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Clock className="h-4 w-4 text-cyan-500" />
            </div>
            <input
              type="time"
              id={fieldName}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className="w-full pl-10 pr-4 py-3 border-2 border-cyan-300 rounded-xl bg-gradient-to-br from-cyan-50 to-white text-black text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );
  }

  return null;
};
