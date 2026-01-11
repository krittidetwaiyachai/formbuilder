import React from 'react';
import { Field } from '@/types';
import { Plus, X, Trash2 } from 'lucide-react';

interface TableFieldProps {
  field: Field;
  isSelected?: boolean;
  updateField?: (id: string, updates: Partial<Field>) => void;
}

export const TableField: React.FC<TableFieldProps> = ({ field, isSelected, updateField }) => {
  const columns = field.options?.columns || [{ id: 'c1', label: 'Column 1' }, { id: 'c2', label: 'Column 2' }];
  const allowAddRow = field.options?.allowAddRow !== undefined ? field.options.allowAddRow : true;

  // Helper to update columns in parent
  const updateColumns = (newCols: any[]) => {
    if (updateField) {
      updateField(field.id, { options: { ...field.options, columns: newCols } });
    }
  };

  const handleAddColumn = () => {
    const newId = `c${Date.now()}`;
    updateColumns([...columns, { id: newId, label: `Column ${columns.length + 1}` }]);
  };

  const handleRemoveColumn = (index: number) => {
    const newCols = columns.filter((_: any, i: number) => i !== index);
    updateColumns(newCols);
  };

  const handleColumnLabelChange = (index: number, newLabel: string) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], label: newLabel };
    updateColumns(newCols);
  };

  // Render dummy rows for preview
  const rowCount = 2; 

  return (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <thead className="text-xs text-gray-700 bg-gray-50">
                <tr>
                    {columns.map((col: any, idx: number) => (
                         <th key={idx} scope="col" className="px-4 py-3 border border-gray-200 font-semibold min-w-[150px] relative group/col">
                            <div className="flex items-center justify-between">
                                {isSelected && updateField ? (
                                    <input
                                        type="text"
                                        value={col.label}
                                        onChange={(e) => handleColumnLabelChange(idx, e.target.value)}
                                        className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black rounded px-1 w-full"
                                    />
                                ) : (
                                    <span>{col.label}</span>
                                )}
                                
                                {isSelected && updateField && columns.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveColumn(idx)}
                                        className="ml-2 p-0.5 bg-white rounded-full shadow border border-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover/col:opacity-100 transition-opacity"
                                        title="Remove Column"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </th>
                    ))}
                    {/* Action Column Placeholder or Add Column Button */}
                     <th scope="col" className="px-2 py-3 border border-gray-200 w-10 text-center">
                        {isSelected && updateField && (
                            <button 
                                onClick={handleAddColumn}
                                className="p-1 hover:bg-gray-200 rounded-full text-indigo-600 transition-colors"
                                title="Add Column"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                     </th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rowCount }).map((_, rIdx) => (
                     <tr key={rIdx} className="bg-white border-b hover:bg-gray-50">
                        {columns.map((col: any, cIdx: number) => (
                            <td key={cIdx} className="px-4 py-2 border border-gray-200">
                                <input 
                                    type="text" 
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-black focus:border-black block w-full p-2.5"
                                    disabled
                                    placeholder={`${col.label} (Row ${rIdx + 1})`}
                                />
                            </td>
                        ))}
                         <td className="px-2 py-2 border border-gray-200 text-center">
                            <button 
                                disabled
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-not-allowed"
                                title="Delete Row (Preview)"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </td>
                     </tr>
                ))}
            </tbody>
        </table>
        
        {allowAddRow && (
            <div className="mt-2 text-right">
                <button 
                    disabled 
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-md border border-indigo-200 opacity-60 cursor-not-allowed"
                >
                    <Plus className="w-3 h-3" /> Add Row
                </button>
            </div>
        )}
    </div>
  );
};
