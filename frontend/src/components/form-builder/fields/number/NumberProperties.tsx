import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface NumberPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const NumberProperties: React.FC<NumberPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  const validation = field.validation || {};
  const options = field.options || {};
  
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

  const handleOptionUpdate = (key: string, value: any) => {
    handleUpdate({
      options: {
        ...options,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md overflow-x-auto">
        {['general', 'options', 'advanced'].map((tab) => (
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
                    onClick={() => handleOptionUpdate('labelAlignment', align)}
                     className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      (options.labelAlignment === align) || (!options.labelAlignment && align === 'TOP')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select how the label text is aligned horizontally
              </p>
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

            {/* Sub Label */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                Sub Label
              </label>
              <input
                type="text"
                value={options.subLabel || ''}
                onChange={(e) => handleOptionUpdate('subLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Add a short description below the field
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
                   formId: field.formId,
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
            {/* Width */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Width
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.width === 'FIXED'}
                    onChange={(e) => handleOptionUpdate('width', e.target.checked ? 'FIXED' : 'FULL')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                {options.width === 'FIXED' && (
                   <div className="mt-2 text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600 inline-block">
                        FIXED WIDTH
                   </div>
                )}
                 <p className="mt-1 text-xs text-gray-500">
                  The width of this field will change according to your form's width.
                </p>
                 {options.width === 'FIXED' && (
                     <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Custom Width (px)</label>
                        <input
                            type="number"
                            value={options.customWidth || ''}
                            onChange={(e) => handleOptionUpdate('customWidth', parseInt(e.target.value))}
                             className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                            placeholder="e.g. 300"
                        />
                     </div>
                 )}
            </div>
            
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
                    Limit the minimum or maximum value allowed for this field
                   </p>
                   {validation.entryLimits && (
                       <div className="mt-4 flex gap-4">
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum</label>
                                <input
                                    type="number"
                                    value={validation.min || ''}
                                    onChange={(e) => handleValidationUpdate('min', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                />
                           </div>
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Maximum</label>
                                <input
                                    type="number"
                                    value={validation.max || ''}
                                    onChange={(e) => handleValidationUpdate('max', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                />
                            </div>
                       </div>
                   )}
                </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Placeholder */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                placeholder="e.g., 23"
              />
               <p className="mt-1 text-xs text-gray-500">
                Add an example inside the field
              </p>
            </div>

             {/* Hover Text */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                Hover Text
              </label>
              <textarea
                value={options.hoverText || ''}
                onChange={(e) => handleOptionUpdate('hoverText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Show a description when a user hovers over this field
              </p>
            </div>

            {/* Default Value */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Default Value
              </label>
              <input
                type="number"
                value={options.defaultValue || ''}
                onChange={(e) => handleOptionUpdate('defaultValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
               <p className="mt-1 text-xs text-gray-500">
                Pre-populate this field with a default value
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
                    checked={options.readOnly || false}
                    onChange={(e) => handleOptionUpdate('readOnly', e.target.checked)}
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
