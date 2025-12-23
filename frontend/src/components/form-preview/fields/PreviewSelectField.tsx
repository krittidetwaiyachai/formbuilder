import React from 'react';
import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  watch: ReturnType<typeof useForm>['watch'];
}

export const PreviewSelectField: React.FC<PreviewFieldProps> = ({ field, register, errors, watch }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const getOptions = () => {
    if (!field.options) return [];
    return field.options;
  };

  const options = getOptions();

  if (field.type === FieldType.DROPDOWN) {
      const isMultiple = field.validation?.multiple;
      const rows = field.validation?.rows;
      // If multiple is true OR rows > 1, show as list
      const showAsList = isMultiple || (rows && rows > 1);

      return (
        <div className="mb-4">
          <label htmlFor={fieldName} className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </label>
          <div className="relative">
            {!showAsList && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-orange-500" />
                </div>
            )}
            <select
              id={fieldName}
              multiple={isMultiple}
              size={showAsList ? (rows || 4) : undefined}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className={`w-full pl-4 pr-10 py-3 border-2 border-orange-300 rounded-xl bg-gradient-to-br from-orange-50 to-white text-black text-sm shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${showAsList ? 'overflow-y-auto' : ''}`}
              style={showAsList ? { paddingRight: '1rem' } : {}}
            >
              {!isMultiple && !field.validation?.defaultValue && <option value="">Select an option</option>}
              {options.map((opt: any, index: number) => (
                <option key={index} value={opt.value}>
                  {opt.label || opt.value}
                </option>
              ))}
            </select>
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );
  }

  if (field.type === FieldType.RADIO) {
      const spreadToColumns = field.validation?.spreadToColumns;
      const columns = field.validation?.columns || 2;
      const otherOption = field.validation?.otherOption;
      const shuffle = field.validation?.shuffle;
      const readOnly = field.validation?.readOnly;

      // Handle shuffling (simple version, memoize if possible but for now just render)
      const displayOptions = React.useMemo(() => {
          if (shuffle) {
              return [...options].sort(() => Math.random() - 0.5);
          }
          return options;
      }, [options, shuffle]);

      return (
        <div className="mb-4">
          <p className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </p>
          <div className={`p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border-2 border-pink-200 shadow-sm ${spreadToColumns ? 'grid gap-3' : 'space-y-3'}`} style={spreadToColumns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}>
            {displayOptions.map((opt: any, index: number) => (
              <label key={index} className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="relative shrink-0">
                  <input
                    type="radio"
                    id={`${fieldName}_${index}`}
                    value={opt.value}
                    {...register(fieldName, {
                      required: field.required ? `${field.label} is required` : false,
                    })}
                    disabled={readOnly}
                    className="w-5 h-5 text-pink-500 border-2 border-pink-300 focus:ring-2 focus:ring-pink-400 appearance-none rounded-full checked:bg-pink-500 checked:border-pink-500 cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-pink-500 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
                </div>
                <span className="text-sm font-medium text-gray-700 cursor-pointer">{opt.label || opt.value}</span>
              </label>
            ))}
            {otherOption && (
                <label className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''} ${spreadToColumns ? 'col-span-full' : ''}`}>
                    <div className="relative shrink-0">
                         <input
                            type="radio"
                            value="other"
                            {...register(fieldName, { required: field.required })}
                            className="w-5 h-5 text-pink-500 border-2 border-pink-300 focus:ring-2 focus:ring-pink-400 appearance-none rounded-full checked:bg-pink-500 checked:border-pink-500 cursor-pointer"
                        />
                    </div>
                     <span className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">Other:</span>
                     <input 
                        type="text" 
                        className="flex-1 border-b border-gray-300 focus:border-pink-500 outline-none text-sm py-1 bg-transparent"
                        placeholder="Please specify"
                        disabled={readOnly}
                        onClick={(e) => e.stopPropagation()} 
                         // Logic to bind this input to the form value when radio is 'other' would go here
                         // For now, it's visual
                     />
                </label>
            )}
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );
  }

  if (field.type === FieldType.CHECKBOX) {
      const checkboxValue = watch(fieldName) || [];
      const isChecked = (value: string) => {
        if (Array.isArray(checkboxValue)) {
          return checkboxValue.includes(value);
        }
        return false;
      };

      const spreadToColumns = field.validation?.spreadToColumns;
      const columns = field.validation?.columns || 2;
      const otherOption = field.validation?.otherOption;
      const shuffle = field.validation?.shuffle;
      const readOnly = field.validation?.readOnly;
      const minSelections = field.validation?.minSelections;
      const maxSelections = field.validation?.maxSelections;

       // Handle shuffling
      const displayOptions = React.useMemo(() => {
          if (shuffle) {
              return [...options].sort(() => Math.random() - 0.5);
          }
          return options;
      }, [options, shuffle]);
      
      return (
        <div className="mb-4">
          <p className="block text-sm font-medium text-black mb-2">
            {field.label}
            {field.required && <span className="text-black ml-1">*</span>}
          </p>
          <div className={`p-4 bg-gradient-to-br from-indigo-50 to-white rounded-xl border-2 border-indigo-200 shadow-sm ${spreadToColumns ? 'grid gap-3' : 'space-y-3'}`} style={spreadToColumns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}>
            {displayOptions.map((opt: any, index: number) => (
              <label key={index} className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    id={`${fieldName}_${index}`}
                    value={opt.value}
                    {...register(fieldName, {
                      required: field.required ? `${field.label} is required` : false,
                      validate: (value) => {
                          if (!value) return true; // Handled by required
                          if (minSelections && value.length < minSelections) return `Please select at least ${minSelections} options`;
                          if (maxSelections && value.length > maxSelections) return `Please select at most ${maxSelections} options`;
                          return true;
                      }
                    })}
                    disabled={readOnly}
                    className="w-5 h-5 text-indigo-600 border-2 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-400 appearance-none checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer"
                  />
                  {isChecked(opt.value) && (
                    <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 cursor-pointer">{opt.label || opt.value}</span>
              </label>
            ))}
             {otherOption && (
                <label className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''} ${spreadToColumns ? 'col-span-full' : ''}`}>
                    <div className="relative shrink-0">
                         <input
                            type="checkbox"
                            value="other"
                            {...register(fieldName, { 
                                required: field.required,
                                 validate: (value) => {
                                  // Validation logic shared with main group usually, effectively just checks existence in array
                                    if (!value) return true;
                                    if (minSelections && value.length < minSelections) return `Please select at least ${minSelections} options`;
                                    if (maxSelections && value.length > maxSelections) return `Please select at most ${maxSelections} options`;
                                    return true;
                                }
                             })}
                            className="w-5 h-5 text-indigo-600 border-2 border-indigo-300 rounded focus:ring-2 focus:ring-indigo-400 appearance-none checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer"
                        />
                         {isChecked('other') && (
                            <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                    </div>
                     <span className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap">Other:</span>
                     <input 
                        type="text" 
                        className="flex-1 border-b border-gray-300 focus:border-indigo-500 outline-none text-sm py-1 bg-transparent"
                        placeholder="Please specify"
                        disabled={readOnly}
                        onClick={(e) => e.stopPropagation()} 
                     />
                </label>
            )}
          </div>
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      );
  }

  return null;
};
