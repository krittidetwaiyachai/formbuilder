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

  const options = field.options || {};

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

  const ADDRESS_FIELDS = [
    { key: 'street', label: 'Street Address 1' },
    { key: 'street2', label: 'Street Address 2' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State / Province' },
    { key: 'zip', label: 'Postal / Zip Code' },
    { key: 'country', label: 'Country' }
  ];

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
              <label className="block text-sm font-medium text-black mb-1">Field Label</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Label Alignment</label>
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
               <label className="block text-sm font-medium text-black mb-1">Required</label>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleUpdate({ required: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Prevent submission if this field is empty</p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-black mb-2">Sublabels</label>
                <div className="space-y-2">
                   {ADDRESS_FIELDS.map(({ key, label }) => (
                     <div key={key} className="grid grid-cols-2 gap-2 items-center">
                         <label className="text-xs text-gray-600">{label}</label>
                          <input
                            type="text"
                            value={options.sublabels?.[key] || ''}
                            onChange={(e) => handleOptionUpdate('sublabels', { ...options.sublabels, [key]: e.target.value })}
                            className="w-full px-2 py-1.5 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white select-text"
                          />
                     </div>
                   ))}
                </div>
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
                <label className="block text-sm font-medium text-black mb-3">Field Options</label>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { key: 'showStreet', label: 'Street Address' },
                     { key: 'showStreet2', label: 'Street Address 2' },
                     { key: 'showCity', label: 'City' },
                     { key: 'showState', label: 'State' },
                     { key: 'showZip', label: 'Postal/Zip Code' },
                     { key: 'showCountry', label: 'Country' }
                   ].map(({ key, label }) => (
                       <label key={key} className="flex items-center gap-2 cursor-pointer group select-none">
                         <div className="relative flex items-center justify-center w-5 h-5">
                             <input 
                                type="checkbox"
                                checked={options[key] !== false}
                                onChange={(e) => handleOptionUpdate(key, e.target.checked)}
                                className="peer appearance-none w-5 h-5 border border-purple-300 rounded bg-white checked:bg-purple-600 checked:border-purple-600 transition-all cursor-pointer shadow-sm hover:border-purple-400"
                             />
                             <svg 
                                className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                             >
                                 <polyline points="20 6 9 17 4 12"></polyline>
                             </svg>
                         </div>
                         <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{label}</span>
                       </label>
                   ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">Select which fields to include on your form</p>
            </div>

             <div>
                <label className="block text-sm font-medium text-black mb-2">Province Options</label>
                <div className="flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => handleOptionUpdate('stateInputType', 'text')}
                      className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
                          options.stateInputType !== 'thai_provinces'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      TEXT BOX
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOptionUpdate('stateInputType', 'thai_provinces')}
                      className={`px-4 py-2 text-sm font-medium border rounded-r-lg ${
                          options.stateInputType === 'thai_provinces'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      THAI PROVINCES
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
                   {ADDRESS_FIELDS.map(({ key, label }) => (
                     <div key={key} className="grid grid-cols-2 gap-2 items-center">
                         <label className="text-xs text-gray-600">{label}</label>
                          <input
                            type="text"
                            value={options.placeholders?.[key] || ''}
                            onChange={(e) => handleOptionUpdate('placeholders', { ...options.placeholders, [key]: e.target.value })}
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
                   value={options.hoverText || ''}
                   onChange={(e) => handleOptionUpdate('hoverText', e.target.value)}
                   rows={2}
                   className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                 />
                <p className="mt-1 text-xs text-gray-500">Show a description when a user hovers over this field</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-black mb-1">Shrink</label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={options.shrink || false}
                   onChange={(e) => handleOptionUpdate('shrink', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Make field smaller</p>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-black mb-1">Hide field</label>
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
