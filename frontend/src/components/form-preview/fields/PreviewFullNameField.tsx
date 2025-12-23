import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
}

export const PreviewFullNameField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
  const fieldName = `field_${field.id}`;
  // fieldError for group?
  // Individual errors for subfields?
  // React Hook Form usually handles errors per input name.
  // Errors object will have nested errors if using nested names, but here names are `${fieldName}_first` etc.
  
  return (
    <div className="mb-4">
      <p className="block text-sm font-medium text-black mb-2">
        {field.label || 'Full Name'}
        {field.required && <span className="text-black ml-1">*</span>}
      </p>
      <div className="space-y-3 max-w-md">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id={`${fieldName}_first`}
            {...register(`${fieldName}_first`, {
              required: field.required ? 'First name is required' : false,
            })}
            placeholder="First Name"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
          />
           {errors[`${fieldName}_first`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_first`].message}</p>
          )}
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id={`${fieldName}_last`}
            {...register(`${fieldName}_last`, {
              required: field.required ? 'Last name is required' : false,
            })}
            placeholder="Last Name"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
          />
           {errors[`${fieldName}_last`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_last`].message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
