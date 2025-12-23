import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
}

export const PreviewEmailField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  return (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
        {field.label}
        {field.required && <span className="text-black ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Mail className="h-4 w-4 text-blue-500" />
        </div>
        <input
          type="email"
          id={fieldName}
          {...register(fieldName, {
            required: field.required ? `${field.label} is required` : false,
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
            }
          })}
          placeholder={field.placeholder}
          className="w-full pl-10 pr-4 py-3 border-2 border-blue-300 rounded-xl bg-gradient-to-br from-blue-50 to-white text-black text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      {fieldError && (
        <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
      )}
    </div>
  );
};
