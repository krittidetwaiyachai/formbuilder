import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface AddressPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const AddressProperties = ({ field, updateField, duplicatesField }: AddressPropertiesProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

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

      {activeTab === 'general' && (
        <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-black mb-1">Field Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Label Alignment</label>
              <div className="flex gap-2">
                {[
                  { value: 'LEFT', label: 'LEFT' },
                  { value: 'RIGHT', label: 'RIGHT' },
                  { value: 'TOP', label: 'TOP' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateField(field.id, {
                      validation: { ...field.validation, labelAlignment: value }
                    })}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      (field.validation as any)?.labelAlignment === value || 
                      (!((field.validation as any)?.labelAlignment) && value === 'TOP')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center">
                <input type="checkbox" className="rounded border-gray-400 text-blue-600 focus:ring-black ml-1" />
                <span className="ml-2 text-xs text-gray-600">Set as form default</span>
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-black mb-1">Required</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <p className="mt-1 text-xs text-gray-500">Prevent submission if this field is empty</p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-black mb-2">Sublabels</label>
                <div className="space-y-2">
                   {[
                     { key: 'street', label: 'Street Address 1' },
                     { key: 'street2', label: 'Street Address 2' },
                     { key: 'city', label: 'City' },
                     { key: 'state', label: 'State / Province' },
                     { key: 'zip', label: 'Postal / Zip Code' },
                     { key: 'country', label: 'Country' }
                   ].map(({ key, label }) => (
                     <div key={key} className="grid grid-cols-2 gap-2 items-center">
                         <label className="text-xs text-gray-600">{label}</label>
                          <input
                            type="text"
                            value={(field.validation as any)?.sublabels?.[key] || ''}
                            onChange={(e) => updateField(field.id, {
                                validation: { 
                                    ...field.validation, 
                                    sublabels: { 
                                        ...(field.validation as any)?.sublabels, 
                                        [key]: e.target.value 
                                    } 
                                }
                            })}
                            className="w-full px-2 py-1.5 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white select-text"
                          />
                     </div>
                   ))}
                </div>
            </div>

             <button
                type="button"
                onClick={() => {
                  duplicatesField({
                    type: field.type,
                    label: field.label,
                    placeholder: field.placeholder,
                    required: field.required,
                    validation: field.validation,
                    order: 0,
                    formId: field.formId,
                  });
                }}
                className="w-full mt-4 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                DUPLICATE
              </button>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-black mb-2">Field Options</label>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { key: 'showStreet', label: 'Street Address' },
                     { key: 'showStreet2', label: 'Street Address 2' },
                     { key: 'showCity', label: 'City' },
                     { key: 'showState', label: 'State' },
                     { key: 'showZip', label: 'Postal/Zip Code' },
                     { key: 'showCountry', label: 'Country' }
                   ].map(({ key, label }) => (
                       <div key={key} className="flex items-center">
                         <input 
                            type="checkbox"
                            checked={(field.validation as any)?.[key] !== false} // Default to true if undefined
                            onChange={(e) => updateField(field.id, {
                               validation: { ...field.validation, [key]: e.target.checked }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                         />
                         <span className="ml-2 text-sm text-black">{label}</span>
                       </div>
                   ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">Select which fields to include on your form</p>
            </div>

             <div>
                <label className="block text-sm font-medium text-black mb-2">State Options</label>
                <div className="flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => updateField(field.id, {
                         validation: { ...field.validation, stateInputType: 'text' }
                      })}
                      className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
                          (field.validation as any)?.stateInputType !== 'us_states' // Default is text
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      TEXT BOX
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField(field.id, {
                         validation: { ...field.validation, stateInputType: 'us_states' }
                      })}
                      className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${
                          (field.validation as any)?.stateInputType === 'us_states'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      AMERICAN STATES
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Give your users a text box or predefined options.</p>
             </div>
        </div>
      )}

      {activeTab === 'advanced' && (
         <div className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-black mb-2">Placeholder</label>
                <div className="space-y-2">
                   {[
                     { key: 'street', label: 'Street Address 1' },
                     { key: 'street2', label: 'Street Address 2' },
                     { key: 'city', label: 'City' },
                     { key: 'state', label: 'State / Province' },
                     { key: 'zip', label: 'Postal / Zip Code' },
                     { key: 'country', label: 'Country' }
                   ].map(({ key, label }) => (
                     <div key={key} className="grid grid-cols-2 gap-2 items-center">
                         <label className="text-xs text-gray-600">{label}</label>
                          <input
                            type="text"
                            value={(field.validation as any)?.placeholders?.[key] || ''}
                            onChange={(e) => updateField(field.id, {
                                validation: { 
                                    ...field.validation, 
                                    placeholders: { 
                                        ...(field.validation as any)?.placeholders, 
                                        [key]: e.target.value 
                                    } 
                                }
                            })}
                            className="w-full px-2 py-1.5 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white select-text"
                          />
                     </div>
                   ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">Add an example inside each field</p>
            </div>
             <div>
                <label className="block text-sm font-medium text-black mb-1">Hover Text</label>
                 <textarea
                    value={(field.validation as any)?.hoverText || ''}
                    onChange={(e) => updateField(field.id, {
                       validation: { ...field.validation, hoverText: e.target.value }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                  />
                 <p className="mt-1 text-xs text-gray-500">Show a description when a user hovers over this field</p>
             </div>
             <div> 
                <label className="block text-sm font-medium text-black mb-1">Shrink</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={(field.validation as any)?.shrink || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, shrink: e.target.checked } })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <p className="mt-1 text-xs text-gray-500">Make field smaller</p>
             </div>
             <div> 
                <label className="block text-sm font-medium text-black mb-1">Hide field</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={(field.validation as any)?.hidden || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, hidden: e.target.checked } })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
             </div>
         </div>
      )}
    </>
  );
};
