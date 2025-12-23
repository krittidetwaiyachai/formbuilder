import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Clock } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  control?: any; // We might need control for more complex handling, but start with register
  watch?: any;
}

export const PreviewTimeField: React.FC<PreviewFieldProps> = ({ field, register, errors }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  
  const options = field.options || {};
  const validation = field.validation || {};
  
  const labelAlignment = options.labelAlignment || 'TOP';
  const subLabelHour = options.subLabelHour || 'Hour';
  const subLabelMinutes = options.subLabelMinutes || 'Minutes';
  const timeFormat = options.timeFormat || 'AMPM'; // '24HOUR' | 'AMPM'
  const timeRange = options.timeRange || false;
  const hoverText = options.hoverText;
  const readOnly = options.readOnly;
  
  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  // Helper to render a single time input group
  const TimeInputGroup = ({ prefix = '' }) => (
      <div className="flex items-start gap-2">
           <div>
               <input
                type="number"
                placeholder="HH"
                readOnly={readOnly}
                min={1}
                max={timeFormat === '24HOUR' ? 23 : 12}
                {...register(`${fieldName}${prefix}_hour`, { required: field.required })}
                className={`w-16 px-3 py-3 border-2 ${fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} rounded-lg text-center text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
               />
               <label className="block text-xs text-gray-500 mt-1 text-center">{subLabelHour}</label>
           </div>
           <span className="text-gray-400 font-bold mt-3">:</span>
           <div>
               <input
                type="number"
                placeholder="MM"
                readOnly={readOnly}
                min={0}
                max={59}
                {...register(`${fieldName}${prefix}_minute`, { required: field.required })}
                className={`w-16 px-3 py-3 border-2 ${fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} rounded-lg text-center text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
               />
                <label className="block text-xs text-gray-500 mt-1 text-center">{subLabelMinutes}</label>
           </div>
           {timeFormat === 'AMPM' && (
               <div>
                    <select 
                        disabled={readOnly}
                        {...register(`${fieldName}${prefix}_ampm`)}
                        className={`h-[48px] px-2 border-2 ${fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
               </div>
           )}
           <div className="mt-3 ml-2">
             <Clock className="w-5 h-5 text-gray-400" />
           </div>
      </div>
  );

  return (
    <div className={`mb-4 ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-2'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <label htmlFor={fieldName} className="block text-sm font-medium text-black">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      <div className={`flex-1 min-w-0`} title={hoverText}>
        <div className="flex flex-col gap-4">
            <TimeInputGroup />
            {timeRange && (
                <>
                   <div className="text-xs font-bold text-gray-500 uppercase">to</div>
                   <TimeInputGroup prefix="_end" />
                </>
            )}
        </div>
        {fieldError && (
          <p className="mt-1 text-sm text-red-600">This field is required</p>
        )}
      </div>
    </div>
  );
};
