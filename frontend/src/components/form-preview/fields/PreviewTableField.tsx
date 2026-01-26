
import React, { useState, useEffect } from 'react';
import { Field } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  control: any; 
  questionNumber?: number;
  isPublic?: boolean;
}

import { useTranslation } from 'react-i18next';
import { stripHtml } from '@/lib/ui/utils';

export const PreviewTableField: React.FC<PreviewFieldProps> = ({ field, register, errors, control, questionNumber, isPublic }) => {
  const { t } = useTranslation();
  const columns = field.options?.columns || [{ id: 'c1', label: t('public.table.column', { index: 1 }) }, { id: 'c2', label: t('public.table.column', { index: 2 }) }];
  const allowAddRow = field.options?.allowAddRow !== undefined ? field.options.allowAddRow : true;
  
  const fieldName = `field_${field.id}`;
  
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName
  });

  

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && fields.length === 0) {
      append({}); 
      setInitialized(true);
    }
  }, [fields.length, append, initialized]);

  const handleAddRow = () => {
    append({});
  };

  return (
    <div className="mb-6 w-full">
         <div className="mb-2">
            <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
            {field.options?.subLabel && (
                <p className="mt-1 text-sm text-gray-500 font-normal">{stripHtml(field.options.subLabel)}</p>
            )}
        </div>

        <div className="w-full relative group">
            { }
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10 rounded-r-lg" />

            <div className="overflow-x-auto pb-1">
                <table className="w-full text-sm text-left border-collapse border rounded-lg shadow-sm" style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}>
                    <thead className="text-xs uppercase" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text)' }}>
                        <tr>
                            <th scope="col" className="px-4 py-3 border w-10 text-center" style={{ borderColor: 'var(--card-border)', opacity: 0.7 }}>#</th>
                            {columns.map((col: any, idx: number) => (
                                <th key={idx} scope="col" className="px-4 py-3 border font-semibold min-w-[150px]" style={{ borderColor: 'var(--card-border)', opacity: 0.7 }}>
                                    {col.label}
                                </th>
                            ))}
                            {allowAddRow && !field.options?.readOnly && <th scope="col" className="px-2 py-3 border w-10" style={{ borderColor: 'var(--card-border)' }}></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((item, index) => (
                            <tr key={item.id} className="border-b transition-colors hover:bg-black/5" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                                <td className="px-4 py-2 border text-center text-xs font-medium" style={{ borderColor: 'var(--card-border)', color: 'var(--text)', opacity: 0.5 }}>
                                    {index + 1}
                                </td>
                                {columns.map((col: any, cIdx: number) => (
                                    <td key={cIdx} className="px-4 py-2 border" style={{ borderColor: 'var(--card-border)' }}>
                                        <input
                                            type="text"
                                            placeholder={col.label}
                                            {...register(`${fieldName}.${index}.${col.id}`, { 
                                                required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false 
                                            })} 
                                            disabled={field.options?.readOnly}
                                            style={{
                                                backgroundColor: 'var(--input-bg)',
                                                borderColor: 'var(--input-border)',
                                                color: 'var(--text)'
                                            }}
                                            className="border text-sm rounded-lg focus:ring-2 focus:ring-black/5 block w-full p-2.5 outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </td>
                                ))}
                                {allowAddRow && !field.options?.readOnly && (
                                    <td className="px-2 py-2 border text-center" style={{ borderColor: 'var(--card-border)' }}>
                                        {fields.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => remove(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                )}
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
        
        {allowAddRow && !field.options?.readOnly && (
            <div className="mt-3 flex justify-end">
                <button 
                    type="button" 
                    onClick={handleAddRow}
                    style={{ backgroundColor: 'var(--primary)' }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Plus className="w-4 h-4" /> {t('public.table.add_row', 'Add Row')}
                </button>
            </div>
        )}
        
          {errors[fieldName] && (
             <p className="mt-1 text-sm text-red-600">{errors[fieldName]?.message || t('public.validation.required_field', { label: stripHtml(field.label) })}</p>
          )}
     </div>
   );
};
