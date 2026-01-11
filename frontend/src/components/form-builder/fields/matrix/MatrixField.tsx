
import React, { useCallback } from 'react';
import { Field } from '@/types';
import { Plus, X, GripVertical } from 'lucide-react';

interface MatrixFieldProps {
  field: Field;
  fieldStyle: any;
  isSelected?: boolean;
  updateField?: (id: string, updates: Partial<Field>) => void;
}

export function MatrixField({ field, fieldStyle, isSelected, updateField }: MatrixFieldProps) {
  const rows = field.options?.rows || [{ id: 'r1', label: 'Question 1' }];
  const columns = field.options?.columns || [{ id: 'c1', label: 'Column 1' }];
  const inputType = field.options?.inputType || 'radio';

  const updateRows = (newRows: any[]) => {
    if (updateField) {
      updateField(field.id, { options: { ...field.options, rows: newRows } });
    }
  };

  const updateColumns = (newCols: any[]) => {
    if (updateField) {
      updateField(field.id, { options: { ...field.options, columns: newCols } });
    }
  };

  const handleAddRow = () => {
    const newId = `r${Date.now()}`;
    updateRows([...rows, { id: newId, label: `Question ${rows.length + 1}` }]);
  };

  const handleAddColumn = () => {
    const newId = `c${Date.now()}`;
    updateColumns([...columns, { id: newId, label: `Column ${columns.length + 1}` }]);
  };

  const handleRemoveRow = (index: number) => {
    const newRows = rows.filter((_: any, i: number) => i !== index);
    updateRows(newRows);
  };

  const handleRemoveColumn = (index: number) => {
    const newCols = columns.filter((_: any, i: number) => i !== index);
    updateColumns(newCols);
  };

  const handleRowLabelChange = (index: number, newLabel: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], label: newLabel };
    updateRows(newRows);
  };

  const handleColumnLabelChange = (index: number, newLabel: string) => {
    const newCols = [...columns];
    newCols[index] = { ...newCols[index], label: newLabel };
    updateColumns(newCols);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 min-w-[150px]">
              {/* Corner */}
            </th>
            {columns.map((col: any, colIndex: number) => (
              <th key={col.id} className="p-2 border-b border-gray-200 bg-gray-50 text-center min-w-[100px] relative group/col">
                 <div className="flex items-center justify-center relative">
                    {isSelected && updateField ? (
                        <input
                            type="text"
                            value={col.label}
                            onChange={(e) => handleColumnLabelChange(colIndex, e.target.value)}
                            className="bg-transparent text-center text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-pink-500 rounded px-1 w-full"
                        />
                    ) : (
                        <span className="text-xs font-medium text-gray-700">{col.label}</span>
                    )}
                    
                    {isSelected && updateField && columns.length > 1 && (
                        <button
                            onClick={() => handleRemoveColumn(colIndex)}
                            className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full shadow border border-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover/col:opacity-100 transition-opacity"
                            title="Remove Column"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                 </div>
              </th>
            ))}
            {isSelected && updateField && (
                <th className="p-2 border-b border-gray-200 bg-gray-50 w-8">
                    <button 
                        onClick={handleAddColumn}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add Column"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, rowIndex: number) => (
            <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <td className="p-3 border-b border-gray-100 min-w-[150px] relative group/row">
                  <div className="flex items-center gap-2">
                       {isSelected && updateField ? (
                           <>
                               <div className="cursor-grab text-gray-300 hover:text-gray-500 opacity-0 group-hover/row:opacity-100">
                                   <GripVertical className="w-3 h-3" />
                               </div>
                               <input
                                   type="text"
                                   value={row.label}
                                   onChange={(e) => handleRowLabelChange(rowIndex, e.target.value)}
                                   className="flex-1 bg-transparent text-sm text-gray-700 font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-pink-500 rounded px-1"
                               />
                               {rows.length > 1 && (
                                   <button
                                       onClick={() => handleRemoveRow(rowIndex)}
                                       className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                       title="Remove Row"
                                   >
                                       <X className="w-3 h-3" />
                                   </button>
                               )}
                           </>
                       ) : (
                           <span className="text-sm text-gray-700 font-medium pl-5">{row.label}</span>
                       )}
                  </div>
              </td>
              {columns.map((col: any) => (
                <td key={col.id} className="p-2 border-b border-gray-100 text-center">
                  <div className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${fieldStyle.inputBorder} bg-white`}>
                    {/* Visual placeholder only */}
                    {inputType === 'checkbox' ? (
                        <div className={`w-3 h-3 rounded-[2px] ${fieldStyle.iconColor} opacity-20`} />
                    ) : (
                        <div className={`w-2.5 h-2.5 rounded-full ${fieldStyle.iconColor} opacity-20`} />
                    )}
                  </div>
                </td>
              ))}
              {isSelected && updateField && <td className="p-2 border-b border-gray-100"></td>}
            </tr>
          ))}
          {isSelected && updateField && (
            <tr>
                <td className="p-2 border-b border-gray-100">
                     <button
                        onClick={handleAddRow}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-600 font-medium px-2 py-1 rounded hover:bg-pink-50 transition-colors ml-4"
                     >
                         <Plus className="w-3 h-3" />
                         Add Row
                     </button>
                </td>
                <td colSpan={columns.length + 1} className="p-2 border-b border-gray-100"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
