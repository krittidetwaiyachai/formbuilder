import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface FullNamePropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const FullNameProperties = ({ field, updateField, duplicatesField }: FullNamePropertiesProps) => {
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
               <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
                  <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">First Name</span></div>
                  <div className="bg-white p-0">
                    <input 
                      type="text" 
                      className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                      value={options.sublabels?.first || 'First Name'}
                      onChange={(e) => handleOptionUpdate('sublabels', { ...options.sublabels, first: e.target.value })}
                    />
                  </div>
                  
                  <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">Last Name</span></div>
                  <div className="bg-white p-0">
                    <input 
                      type="text" 
                      className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                      value={options.sublabels?.last || 'Last Name'}
                      onChange={(e) => handleOptionUpdate('sublabels', { ...options.sublabels, last: e.target.value })}
                    />
                  </div>
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
               <label className="block text-sm font-medium text-black mb-1">Middle Name</label>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showMiddleName || false}
                  onChange={(e) => handleOptionUpdate('showMiddleName', e.target.checked)}
                  className="sr-only peer"
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Let users enter a middle name</p>
            </div>

             <div>
               <label className="block text-sm font-medium text-black mb-1">Prefix</label>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showPrefix || false}
                  onChange={(e) => handleOptionUpdate('showPrefix', e.target.checked)}
                  className="sr-only peer"
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Let users enter a title before their name (Mr., Mrs., Dr.)</p>
            </div>

             <div>
               <label className="block text-sm font-medium text-black mb-1">Suffix</label>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showSuffix || false}
                  onChange={(e) => handleOptionUpdate('showSuffix', e.target.checked)}
                  className="sr-only peer"
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Let users enter a title after their name (Jr., Sr., PhD)</p>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-black mb-2">Placeholder</label>
               <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
                  <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">First Name</span></div>
                  <div className="bg-white p-0">
                    <input 
                      type="text" 
                      className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                      value={options.placeholders?.first || ''}
                      onChange={(e) => handleOptionUpdate('placeholders', { ...options.placeholders, first: e.target.value })}
                    />
                  </div>
                  
                   <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">Last Name</span></div>
                  <div className="bg-white p-0">
                    <input 
                      type="text" 
                      className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                      value={options.placeholders?.last || ''}
                      onChange={(e) => handleOptionUpdate('placeholders', { ...options.placeholders, last: e.target.value })}
                    />
                  </div>
               </div>
               <p className="mt-1 text-xs text-gray-500">Add an example inside each field</p>
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
               <label className="block text-sm font-medium text-black mb-1">Read Only</label>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.readOnly || false}
                  onChange={(e) => handleOptionUpdate('readOnly', e.target.checked)}
                  className="sr-only peer"
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Prevent entry in this field</p>
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
