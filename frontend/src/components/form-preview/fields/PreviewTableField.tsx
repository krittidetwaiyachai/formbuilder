
import React, { useState, useEffect } from 'react';
import { Field } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  control: any; // Important for useFieldArray
  questionNumber?: number;
  isPublic?: boolean;
}

export const PreviewTableField: React.FC<PreviewFieldProps> = ({ field, register, errors, control, questionNumber, isPublic }) => {
  const columns = field.options?.columns || [{ id: 'c1', label: 'Column 1' }, { id: 'c2', label: 'Column 2' }];
  const allowAddRow = field.options?.allowAddRow !== undefined ? field.options.allowAddRow : true;
  
  const fieldName = `field_${field.id}`;
  
  // Use field array to manage dynamic rows
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName
  });

  // Initialize with at least one row if empty and not readonly?
  // Actually, let's start with 1 row by default if none exist.
  // But useFieldArray might be empty initially.
  
  // We can't use useEffect to append inside render logic easily without conditions.
  // For now, let's rely on defaultValues from parent or just render one by default if length 0.
  // Problem: useFieldArray syncs with form state.
  
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && fields.length === 0) {
      append({}); // Append 1 empty row
      setInitialized(true);
    }
  }, [fields.length, append, initialized]);

  const handleAddRow = () => {
    append({});
  };

  return (
    <div className="mb-6 w-full">
         <div className="mb-2">
            <label className={`block font-semibold text-gray-800 ${isPublic ? 'text-base' : 'text-sm'}`}>
                {questionNumber && <span className="text-gray-500 mr-2">{questionNumber} <span className="text-gray-300">|</span></span>}
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.options?.subLabel && (
                <p className="mt-1 text-sm text-gray-500 font-normal">{field.options.subLabel}</p>
            )}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 border-collapse border border-gray-200 rounded-lg shadow-sm">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                         <th scope="col" className="px-4 py-3 border border-gray-200 w-10 text-center">#</th>
                        {columns.map((col: any, idx: number) => (
                             <th key={idx} scope="col" className="px-4 py-3 border border-gray-200 font-semibold min-w-[150px]">
                                {col.label}
                            </th>
                        ))}
                         {allowAddRow && !field.options?.readOnly && <th scope="col" className="px-2 py-3 border border-gray-200 w-10"></th>}
                    </tr>
                </thead>
                <tbody>
                    {fields.map((item, index) => (
                        <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                             <td className="px-4 py-2 border border-gray-200 text-center text-xs font-medium text-gray-400">
                                {index + 1}
                             </td>
                            {columns.map((col: any, cIdx: number) => (
                                <td key={cIdx} className="px-4 py-2 border border-gray-200">
                                    <input
                                        type="text"
                                        placeholder={col.label}
                                        {...register(`${fieldName}.${index}.${col.id}`, { 
                                            required: field.required && index === 0 && cIdx === 0 // Basic required check: At least first cell of first row?
                                            // Actually, "Required" for table usually means "At least one row filled" or "All cols in added rows filled".
                                            // Let's enforce required on ALL cells if field is required for now.
                                            ? `${field.label} is required` : false 
                                        })} 
                                        disabled={field.options?.readOnly}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 outline-none transition-all"
                                    />
                                </td>
                            ))}
                             {allowAddRow && !field.options?.readOnly && (
                                <td className="px-2 py-2 border border-gray-200 text-center">
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
        
        {allowAddRow && !field.options?.readOnly && (
            <div className="mt-3 flex justify-end">
                <button 
                    type="button" 
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Row
                </button>
            </div>
        )}
        
         {errors[fieldName] && (
            <p className="mt-1 text-sm text-red-600">{errors[fieldName]?.message || 'This field is required'}</p>
         )}
    </div>
  );
};
