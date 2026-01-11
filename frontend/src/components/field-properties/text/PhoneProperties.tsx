import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface PhonePropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const PhoneProperties = ({ field, updateField, duplicatesField }: PhonePropertiesProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  const options = field.options || {};
  const validation = field.validation || {};

  const handleUpdate = (updates: any) => {
    updateField(field.id, updates);
  };

  const handleOptionUpdate = (key: string, value: any) => {
    handleUpdate({
      options: {
        ...options,
        [key]: value,
      },
    });
  };

  const handleValidationUpdate = (key: string, value: any) => {
    handleUpdate({
      validation: {
        ...validation,
        [key]: value,
      },
    });
  };

  return (
    <>
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

      <div className="space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
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
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">
                Prevent submission if this field is empty
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Sublabel
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

             <button
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
              className="w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              DUPLICATE
            </button>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-6">
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
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
              
              {options.width === 'FIXED' && (
                 <div className="mt-2">
                   <input
                        type="number"
                        value={options.customWidth || 300}
                        onChange={(e) => handleOptionUpdate('customWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        placeholder="Width in px"
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                Fixed width for the phone input
              </p>
            </div>

            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Country Code
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={options.showCountryCode || false}
                   onChange={(e) => handleOptionUpdate('showCountryCode', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
               <p className="mt-1 text-xs text-gray-500">
                Show country code selector (+66, +1, etc.)
              </p>
            </div>

             <div>
               <label className="block text-sm font-medium text-black mb-1">
                Input Mask
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={validation.hasInputMask || false}
                   onChange={(e) => handleValidationUpdate('hasInputMask', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
              
               {validation.hasInputMask && (
                 <div className="mt-2">
                   <input
                        type="text"
                        value={validation.inputMask || '(###) ###-####'}
                        onChange={(e) => handleValidationUpdate('inputMask', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        placeholder="e.g. (###) ###-####"
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                Format phone number as user types. Use # for digits.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Add an example inside the field (e.g., 081-234-5678)
              </p>
            </div>

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

             <div>
              <label className="block text-sm font-medium text-black mb-1">
                Default Value
              </label>
              <input
                type="tel"
                value={options.defaultValue || ''}
                onChange={(e) => handleOptionUpdate('defaultValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Pre-populate this field with a default phone number
              </p>
            </div>

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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
               <p className="mt-1 text-xs text-gray-500">
                Prevent entry in this field
              </p>
            </div>

            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Shrink
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={options.shrink || false}
                   onChange={(e) => handleOptionUpdate('shrink', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
               <p className="mt-1 text-xs text-gray-500">
                Make field smaller
              </p>
            </div>

             <div>
               <label className="block text-sm font-medium text-black mb-1">
                Hide Field
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={options.hidden || false}
                   onChange={(e) => handleOptionUpdate('hidden', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
