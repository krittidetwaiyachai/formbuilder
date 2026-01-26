
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

import { useTranslation } from 'react-i18next';

export const PreviewMatrixField: React.FC<PreviewMatrixFieldProps> = ({
  field,
  register,
  errors,
  watch,
  setValue,
  questionNumber,
  isPublic
}) => {
  const { t } = useTranslation();
  const rows = field.options?.rows || [];
  const columns = field.options?.columns || [];
  const inputType = field.options?.inputType || 'radio';
  
  
  const fieldName = `field_${field.id}`; 
  const currentValue = watch(fieldName) || {};

  const handleCellChange = (rowId: string, colLabel: string) => {
    const newValue = { ...currentValue };

    if (inputType === 'checkbox') {
      
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
      
      newValue[rowId] = colLabel;
    }

    setValue(fieldName, newValue, { shouldValidate: true, shouldDirty: true });
  };

  const isChecked = (rowId: string, colLabel: string) => {
    const rowValue = currentValue[rowId];
    if (inputType === 'checkbox') {
      return Array.isArray(rowValue) && rowValue.includes(colLabel);
    }
    return rowValue === colLabel;
  };

  
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
      
      { }
      <div className={`${isRowLayout ? 'w-48 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} />
        {subLabel && subLabel !== 'Sublabel' && (
          <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
        )}
      </div>

      { }
      <div className="flex-1 min-w-0">
        <div className="w-full rounded-xl border shadow-sm relative group overflow-hidden" 
             style={{ 
               backgroundColor: 'var(--card-bg)', 
               borderColor: 'var(--card-border)' 
             }}>
          { }
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10 rounded-r-xl" />
          
          <div className="overflow-x-auto pb-1">
            <table className="min-w-full divide-y divide-[color:var(--divider)]">
              <thead>
                <tr style={{ backgroundColor: 'var(--input-bg)' }}>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider min-w-[150px] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                      style={{ color: 'var(--text)', opacity: 0.7, backgroundColor: 'var(--input-bg)' }}>
                    { }
                  </th>
                  {columns.map((col: any) => (
                    <th key={col.id} scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[80px]"
                        style={{ color: 'var(--text)', opacity: 0.7 }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--divider)]" style={{ backgroundColor: 'var(--card-bg)' }}>
                {rows.map((row: any, rowIndex: number) => (
                  <tr 
                    key={row.id} 
                    className="transition-colors hover:bg-black/5"
                    style={{ backgroundColor: rowIndex % 2 === 0 ? 'var(--card-bg)' : 'var(--input-bg)' }}
                  >
                    <td className="px-4 py-3.5 whitespace-normal text-sm font-medium sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                        style={{ color: 'var(--text)', backgroundColor: rowIndex % 2 === 0 ? 'var(--card-bg)' : 'var(--input-bg)' }}>
                      {row.label}
                    </td>
                    {columns.map((col: any) => (
                      <td key={col.id} className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="relative inline-flex items-center justify-center cursor-pointer p-1">
                          <input
                            type={inputType}
                            name={`${field.id}_${row.id}`}
                            checked={isChecked(row.id, col.label)}
                            onChange={() => handleCellChange(row.id, col.label)}
                            style={{
                                borderColor: isChecked(row.id, col.label) ? 'var(--primary)' : 'var(--input-border)',
                                backgroundColor: isChecked(row.id, col.label) ? 'var(--primary)' : 'transparent',
                            }}
                            className={`
                              w-5 h-5 
                              border-2
                              appearance-none cursor-pointer transition-all duration-200
                              ${inputType === 'checkbox' ? 'rounded' : 'rounded-full'}
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

                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden mt-2 text-center">
             <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                ⟷ {t('public.scroll_hint', 'เลื่อนเพื่อดูเพิ่มเติม')}
             </span>
        </div>
        
        { }
        <input 
          type="hidden" 
          {...register(`field_${field.id}`, { 
            required: field.required,
            validate: (value) => {
              if (!field.required) return true;
              
                if (inputType === 'radio') {
                    if (value && typeof value === 'object') {
                        const answeredRows = Object.keys(value).filter(k => value[k]).length;
                        if (answeredRows !== rows.length) {
                          return t('public.validation.matrix_radio', 'Please answer all questions');
                        }
                        return true;
                    }
                    return t('public.validation.matrix_radio', 'Please answer all questions');
                }
                if (inputType === 'checkbox') {
                   const hasAnswers = Object.values(value || {}).some((arr: any) => Array.isArray(arr) && arr.length > 0);
                   return hasAnswers || t('public.validation.matrix_checkbox', 'Please select at least one option.');
                }
                return true;
            }
          })} 
        />

        {errors[fieldName] && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors[fieldName].message}
          </p>
        )}
      </div>
    </div>
  );
};
