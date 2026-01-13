
import React from 'react';
import { Field } from '@/types';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewMatrixFieldProps {
  field: Field;
  register: UseFormRegister<any>;
  errors: any;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  questionNumber?: number;
  isPublic?: boolean;
}

export const PreviewMatrixField: React.FC<PreviewMatrixFieldProps> = ({
  field,
  register,
  errors,
  watch,
  setValue,
  questionNumber,
  isPublic
}) => {
  const rows = field.options?.rows || [];
  const columns = field.options?.columns || [];
  const inputType = field.options?.inputType || 'radio';
  
  // Watch the entire field value
  const currentValue = watch(field.id) || {};
  const fieldName = `field_${field.id}`; // Consistent naming convention if needed, though we use field.id directly for matrix object

  const handleCellChange = (rowId: string, colId: string, colLabel: string) => {
    const newValue = { ...currentValue };

    if (inputType === 'checkbox') {
      // Initialize row array if not exists
      if (!Array.isArray(newValue[rowId])) {
        newValue[rowId] = [];
      }
      
      const index = newValue[rowId].indexOf(colLabel);
      if (index === -1) {
        newValue[rowId].push(colLabel);
      } else {
        newValue[rowId].splice(index, 1);
      }
    } else {
      // Radio: just set the value
      newValue[rowId] = colLabel;
    }

    setValue(field.id, newValue, { shouldValidate: true, shouldDirty: true });
  };

  const isChecked = (rowId: string, colLabel: string) => {
    const rowValue = currentValue[rowId];
    if (inputType === 'checkbox') {
      return Array.isArray(rowValue) && rowValue.includes(colLabel);
    }
    return rowValue === colLabel;
  };

  // Layout & Styling Props
  const validation = field.validation || {};
  const optionsSettings = field.options || {};
  const { 
    labelAlignment = 'TOP', 
    subLabel, 
    hoverText, 
    hidden 
  } = { ...validation, ...optionsSettings };

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  return (
    <div className={`mb-6 w-full ${hidden ? 'hidden' : ''} ${isRowLayout ? 'flex items-start gap-6' : ''}`} title={hoverText}>
      
      {/* Label Section */}
      <div className={`${isRowLayout ? 'w-48 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} />
        {subLabel && subLabel !== 'Sublabel' && (
          <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
        )}
      </div>

      {/* Input Section */}
      <div className="flex-1 min-w-0">
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/80">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">
                    {/* Corner */}
                  </th>
                  {columns.map((col: any) => (
                    <th key={col.id} scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row: any, rowIndex: number) => (
                  <tr 
                    key={row.id} 
                    className={`transition-colors hover:bg-gray-50/50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-3.5 whitespace-normal text-sm font-medium text-gray-700">
                      {row.label}
                    </td>
                    {columns.map((col: any) => (
                      <td key={col.id} className="px-4 py-3.5 whitespace-nowrap text-center">
                      <td key={col.id} className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="relative inline-flex items-center justify-center cursor-pointer p-1">
                          <input
                            type={inputType}
                            name={`${field.id}_${row.id}`}
                            checked={isChecked(row.id, col.label)}
                            onChange={() => handleCellChange(row.id, col.id, col.label)}
                            className={`
                              w-5 h-5 
                              border-2 border-gray-300 
                              text-black focus:ring-black focus:ring-offset-0
                              appearance-none cursor-pointer transition-all duration-200
                              ${inputType === 'checkbox' ? 'rounded' : 'rounded-full'}
                              checked:bg-black checked:border-black
                            `}
                            disabled={false}
                          />
                          {inputType === 'checkbox' && isChecked(row.id, col.label) && (
                            <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {inputType === 'radio' && isChecked(row.id, col.label) && (
                             <div className="absolute w-2 h-2 bg-white rounded-full pointer-events-none" />
                          )}
                        </div>
                      </td>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Hidden input to register with react-hook-form validation */}
        <input 
          type="hidden" 
          {...register(field.id, { 
            required: field.required,
            validate: (value) => {
              if (!field.required) return true;
              
              if (inputType === 'radio') {
                  const answeredRows = Object.keys(value || {}).length;
                  // Check if all rows found in 'value' keys match the total rows count
                  // Note: Logic might need robust checking against row IDs, but count is a good proxy for now.
                  return answeredRows === rows.length || 'Please answer all questions in this table.';
              }
              // For Checkbox, usually we need at least one answer total or per row? 
              // Standard behavior: At least one answer in the entire table? Or per row?
              // Let's assume at least one answer TOTAL for checkbox matrix if required.
              if (inputType === 'checkbox') {
                 const hasAnswers = Object.values(value || {}).some((arr: any) => Array.isArray(arr) && arr.length > 0);
                 return hasAnswers || 'Please select at least one option.';
              }
              return true;
            }
          })} 
        />

        {errors[field.id] && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors[field.id].message}
          </p>
        )}
      </div>
    </div>
  );
};
