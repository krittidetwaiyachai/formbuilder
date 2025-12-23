import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface DropdownPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const DropdownProperties: React.FC<DropdownPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  // Handle field.options (which might be the actual list of choices) vs field.options (settings)
  // Actually in my Type definition `options` property on Field is for settings?
  // Let's check `types/index.ts` again.
  // `options?: any` is distinct from `validation?: any`.
  // But wait, where are the *choices* stored?
  // In `PropertiesPanel.tsx` (line 498), it uses `selectedField.options` as the array of choices.
  // And `field.options` usually stores settings in other fields (like `width`, `shrink`).
  // This is a collision in my previous understanding or the codebase.
  // Let's look at `SelectField.tsx`: `field.options` is used as the list of choices.
  // So I might need to store settings in `field.validation` or a new property if `field.options` is taken.
  // OR `field.options` is an object containing `choices` and settings?
  // Re-reading `SelectField.tsx`: 
  // `if (Array.isArray(field.options)) { ... }`
  // So `field.options` IS the list of choices.
  // This means I cannot store `shrink`, `width` etc in `field.options` directly if it's an array.
  // I should check `TextField` uses `field.options` as an object.
  // For `SelectField`, I probably need to migrate `field.options` to be an object containing `choices: []` AND settings.
  // OR store settings in `field.validation` (which is `any`).
  // Let's check `TextField.tsx` again. usage: `const { options = {} } = field; const { width, ... } = options;`
  // `SelectField.tsx`: `if (Array.isArray(field.options))`
  
  // DECISION: To avoid breaking existing structure too much, I will use `field.validation` for settings for now, 
  // OR I should refactor `field.options` for Dropdown to be `{ choices: [], ...settings }`.
  // Refactoring might break existing previews if they expect an array.
  // Let's look at `PropertiesPanel.tsx` existing code for Dropdown options editing (lines 488-524).
  // It writes purely to `options` as an array of objects.
  
  // The safest bet for "Layout/Behavior" properties (shrink, hidden, width) is `field.validation` 
  // if `field.options` is occupied by data.
  // HOWEVER, consistency is better.
  // If I look at `TextAreaField`, `options` has `rows`, `cols`.
  // If I look at `TextField`, `options` has `width`.
  
  // I will proceed by assuming I can store settings in `field.validation` for Dropdown specific settings 
  // to avoid conflicting with the `options` array, 
  // OR I should change `options` to contain `items` array.
  // Let's stick to `field.validation` for "settings" for Dropdown to start with, 
  // regarding `shrink`, `hidden`, `width`, `multiple`, `shuffle`.
  // Wait, `ParagraphProperties` used `options` for `shrink`, `hidden`.
  // `TextField` used `options`.
  
  // Use `field.extra`? No `extra` in type.
  // `field.items`? No.
  
  // Okay, I will try to support `field.options` being HYBRID or use `field.validation` for now.
  // Actually, standardizing `field.options` to ALWAYS be an object `{ items: [], ...settings }` is best long term.
  // But strictly for this task without refactoring everything:
  // I'll use `field.validation` for property settings (Width, Shrink, etc) for Dropdown, 
  // and keep `field.options` as the Array of items.
  
  // ... Wait, `PropertiesPanel.tsx` logic for "Options (one per line)" writes to `field.options`.
  
  const validation = field.validation || {};
  // I'll use validation for these layout settings for Dropdown specifically 
  // to avoid breaking the array structure of field.options
  
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
    const newOptions = text.split('\n').filter(line => line.trim()).map(line => {
        const [label, value] = line.split(':');
        return {
            label: label?.trim() || value?.trim() || '',
            value: value?.trim() || label?.trim() || '',
        };
    });
    handleUpdate({ options: newOptions });
  };
 
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md">
        {['general', 'options', 'advanced'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase ${
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

            {/* Sublabel */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Sublabel
              </label>
              <input
                type="text"
                value={validation.subLabel || ''}
                onChange={(e) => handleValidationUpdate('subLabel', e.target.value)}
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
                    checked={validation.width === 'FIXED'}
                    onChange={(e) => handleValidationUpdate('width', e.target.checked ? 'FIXED' : 'FULL')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
               
              {validation.width === 'FIXED' && (
                 <div className="mt-2">
                   <input
                        type="number"
                        value={validation.customWidth || 300}
                        onChange={(e) => handleValidationUpdate('customWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        placeholder="Width in px"
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                The width of this field will change according to your form's width.
              </p>
            </div>

            {/* Options List */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                 Options
               </label>
               <div className="border border-gray-400 rounded-md overflow-hidden bg-white">
                  <textarea
                    value={optionsList.map((opt: any) => opt.label === opt.value ? opt.label : `${opt.label}:${opt.value}`).join('\n')}
                    onChange={(e) => handleOptionsListChange(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 focus:outline-none resize-y text-sm"
                    placeholder="Option 1&#10;Option 2&#10;Option 3: value3"
                  />
               </div>
               <p className="mt-1 text-xs text-gray-500">
                 Give options for users to select from. Enter each option on a new line.
               </p>
            </div>
            
             {/* Predefined Options - Placeholder for now */}
             <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Predefined Options
                </label>
                <select className="w-full px-3 py-2 border border-gray-400 rounded-md bg-gray-50 text-gray-500">
                    <option>None</option>
                    {/* Add predefined logic later */}
                </select>
            </div>

            {/* Default Value */}
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Default Value
                </label>
                <select 
                    value={validation.defaultValue || ''} 
                    onChange={(e) => handleValidationUpdate('defaultValue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                    <option value="">Select a default...</option>
                    {optionsList.map((opt: any, idx: number) => (
                        <option key={idx} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                 <p className="mt-1 text-xs text-gray-500">
                 Choose an option to be selected by default
                </p>
            </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Multiple Selections */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Multiple Selections
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.multiple || false}
                    onChange={(e) => handleValidationUpdate('multiple', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                 Let users select multiple options
               </p>
            </div>

            {/* Visible Options (Rows) - Only relevant if multiple is true usually, or if converting to listbox */}
             {validation.multiple && (
                <div>
                    <label className="block text-sm font-medium text-black mb-1">
                        Visible Options
                    </label>
                    <div className="flex items-center gap-2">
                         <input
                            type="number"
                            value={validation.rows || 4}
                            onChange={(e) => handleValidationUpdate('rows', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        />
                         <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600">ROWS</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Show multiple options directly instead of in a dropdown
                    </p>
                </div>
             )}

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
