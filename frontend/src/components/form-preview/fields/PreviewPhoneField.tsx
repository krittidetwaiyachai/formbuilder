import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Phone } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
}

export const PreviewPhoneField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
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
          <Phone className="h-4 w-4 text-green-500" />
        </div>
        <input
          type="tel"
          id={fieldName}
          {...register(fieldName, {
            required: field.required ? `${field.label} is required` : false,
          })}
          placeholder={field.placeholder}
          className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        />
      </div>
      {fieldError && (
        <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
      )}
    </div>
  );
};
