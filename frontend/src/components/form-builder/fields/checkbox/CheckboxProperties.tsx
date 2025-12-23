import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { parseOptions, formatOptionsToText } from './utils';

interface CheckboxPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>) => void;
}

export const CheckboxProperties: React.FC<CheckboxPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'surveying' | 'advanced'>('general');

  const validation = field.validation || {};
  
  const handleUpdate = (updates: any) => {
    updateField(field.id, updates);
  };

  const handleValidationUpdate = (key: string, value: any) => {
    handleUpdate({
      validation: {
        ...validation,
        [key]: value,
      },
    });
  };

  // For Options List management
  const optionsList = Array.isArray(field.options) ? field.options : [];
  
  const handleOptionsListChange = (text: string) => {
    handleUpdate({ options: parseOptions(text) });
  };
 
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md overflow-x-auto">
        {['general', 'options', 'surveying', 'advanced'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
           {/* Field Label */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">
                Field Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>

            {/* Label Alignment */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Label Alignment
              </label>
              <div className="flex gap-2">
                {(['LEFT', 'RIGHT', 'TOP'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleValidationUpdate('labelAlignment', align)}
                     className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      (validation.labelAlignment === align) || (!validation.labelAlignment && align === 'TOP')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Required */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                  Required
              </label>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleUpdate({ required: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">
                Prevent submission if this field is empty
              </p>
            </div>

             {/* Duplicate Field */}
             <button
               type="button"
               onClick={() => duplicatesField({
                   type: field.type,
                   label: field.label,
                   placeholder: field.placeholder,
                   required: field.required,
                   validation: field.validation,
                   options: field.options,
                   order: 0,
               })}
               className="w-full mt-4 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
             >
               <Copy className="h-4 w-4" />
               DUPLICATE
             </button>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            {/* Options List */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                 Options
               </label>
               <div className="border border-gray-400 rounded-md overflow-hidden bg-white">
                  <textarea
                    value={formatOptionsToText(optionsList)}
                    onChange={(e) => handleOptionsListChange(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 focus:outline-none resize-y text-sm"
                    placeholder="Type option 1&#10;Type option 2"
                  />
               </div>
               <p className="mt-1 text-xs text-gray-500">
                 Give options for users to select from. Enter each option on a new line.
               </p>
            </div>
            
             {/* Predefined Options */}
             <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Predefined Options
                </label>
                <select className="w-full px-3 py-2 border border-gray-400 rounded-md bg-gray-50 text-gray-500">
                    <option>None</option>
                    {/* Add predefined logic later */}
                </select>
            </div>

            {/* Calculation Values */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                Calculation Values
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.calculationValues || false}
                    onChange={(e) => handleValidationUpdate('calculationValues', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                  Add values to be used in calculations
                </p>
            </div>

            {/* Display Other Option */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                Display Other Option
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.otherOption || false}
                    onChange={(e) => handleValidationUpdate('otherOption', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                  Allow users to enter text when their selection is not available.
                </p>
            </div>

             {/* Spread to Columns */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Spread to Columns
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.spreadToColumns || false}
                    onChange={(e) => handleValidationUpdate('spreadToColumns', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                {validation.spreadToColumns && (
                   <div className="mt-2 text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600 inline-block">
                        FIXED WIDTH
                   </div>
                )}
                 <p className="mt-1 text-xs text-gray-500">
                  Spread options side by side into specified number of columns.
                </p>
                 {validation.spreadToColumns && (
                     <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Column Count</label>
                        <input
                            type="number"
                            value={validation.columns || 2}
                            onChange={(e) => handleValidationUpdate('columns', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                            min={2}
                            max={5}
                        />
                     </div>
                 )}
            </div>
        </div>
      )}

      {activeTab === 'surveying' && (
           <div className="space-y-6">
               {/* Entry Limits */}
                <div>
                   <label className="block text-sm font-medium text-black mb-1">
                    Entry Limits
                   </label>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={validation.entryLimits || false}
                        onChange={(e) => handleValidationUpdate('entryLimits', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                   <p className="mt-1 text-xs text-gray-500">
                    Limit the minimum or maximum number of selections allowed.
                   </p>
                   {validation.entryLimits && (
                       <div className="mt-4 flex gap-4">
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum</label>
                                <input
                                    type="number"
                                    value={validation.minSelections || ''}
                                    onChange={(e) => handleValidationUpdate('minSelections', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                    min={0}
                                />
                           </div>
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Maximum</label>
                                <input
                                    type="number"
                                    value={validation.maxSelections || ''}
                                    onChange={(e) => handleValidationUpdate('maxSelections', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                    min={0}
                                />
                            </div>
                       </div>
                   )}
                </div>

               {/* Shuffle Options */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Shuffle Options
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.shuffle || false}
                    onChange={(e) => handleValidationUpdate('shuffle', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                 Display options in random order.
               </p>
            </div>
           </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Selected by Default */}
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Selected by Default
                </label>
                 <select 
                    value={validation.defaultValue || ''} 
                    onChange={(e) => handleValidationUpdate('defaultValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                    <option value="">No Selection</option>
                    {optionsList.map((opt: any, idx: number) => (
                        <option key={idx} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                 <p className="mt-1 text-xs text-gray-500">
                 Choose an option to be selected by default.
                </p>
            </div>

            {/* Hover Text */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                Hover Text
              </label>
              <textarea
                value={validation.hoverText || ''}
                onChange={(e) => handleValidationUpdate('hoverText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Show a description when a user hovers over this field
              </p>
            </div>

             {/* Read Only */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Read Only
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.readOnly || false}
                    onChange={(e) => handleValidationUpdate('readOnly', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
               <p className="mt-1 text-xs text-gray-500">
                Prevent entry in this field
              </p>
            </div>

             {/* Shrink */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Shrink
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.shrink || false}
                    onChange={(e) => handleValidationUpdate('shrink', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
               <p className="mt-1 text-xs text-gray-500">
                Make field smaller
              </p>
            </div>
            
            {/* Hide field */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Hide field
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.hidden || false}
                    onChange={(e) => handleValidationUpdate('hidden', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                  Hide this field from the form
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
