import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { MapPin } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
}

export const PreviewAddressField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
  const fieldName = `field_${field.id}`;

  return (
    <div className="mb-4">
      <p className="block text-sm font-medium text-black mb-2">
        {field.label || 'Address'}
        {field.required && <span className="text-black ml-1">*</span>}
      </p>
      <div className="space-y-3 max-w-md">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id={`${fieldName}_street`}
            {...register(`${fieldName}_street`, {
              required: field.required ? 'Street address is required' : false,
            })}
            placeholder="Street Address"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
          />
           {errors[`${fieldName}_street`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_street`].message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
              <input
                type="text"
                id={`${fieldName}_city`}
                {...register(`${fieldName}_city`)}
                placeholder="City"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
          </div>
          <div>
              <input
                type="text"
                id={`${fieldName}_state`}
                {...register(`${fieldName}_state`)}
                placeholder="State"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
          </div>
        </div>
        <div>
            <input
              type="text"
              id={`${fieldName}_zip`}
              {...register(`${fieldName}_zip`)}
              placeholder="ZIP Code"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            />
        </div>
      </div>
    </div>
  );
};
