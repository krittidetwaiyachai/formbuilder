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
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Field Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
            />
          </div>

          {/* Label Alignment */}
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
                    (!((field.validation as any)?.labelAlignment) && value === 'TOP') // Default to TOP
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

          {/* Required */}
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
          
          {/* Sublabels */}
          <div>
             <label className="block text-sm font-medium text-black mb-2">Sublabels</label>
             <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
                {/* First Name */}
                <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">First Name</span></div>
                <div className="bg-white p-0">
                  <input 
                    type="text" 
                    className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                    value={(field.validation as any)?.sublabels?.first || 'First Name'}
                    onChange={(e) => updateField(field.id, {
                      validation: { 
                        ...field.validation, 
                        sublabels: { ...(field.validation as any)?.sublabels, first: e.target.value } 
                      }
                    })}
                  />
                </div>
                
                {/* Last Name */}
                <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">Last Name</span></div>
                <div className="bg-white p-0">
                  <input 
                    type="text" 
                    className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                    value={(field.validation as any)?.sublabels?.last || 'Last Name'}
                    onChange={(e) => updateField(field.id, {
                      validation: { 
                        ...field.validation, 
                        sublabels: { ...(field.validation as any)?.sublabels, last: e.target.value } 
                      }
                    })}
                  />
                </div>
             </div>
          </div>
          
           {/* Duplicate */}
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
          {/* Middle Name */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">Middle Name</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(field.validation as any)?.showMiddleName || false}
                  onChange={(e) => updateField(field.id, {
                     validation: { ...field.validation, showMiddleName: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Let users enter a middle name</p>
          </div>

           {/* Prefix */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">Prefix</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(field.validation as any)?.showPrefix || false}
                  onChange={(e) => updateField(field.id, {
                     validation: { ...field.validation, showPrefix: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Let users enter a title before their name</p>
          </div>

           {/* Suffix */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">Suffix</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(field.validation as any)?.showSuffix || false}
                  onChange={(e) => updateField(field.id, {
                     validation: { ...field.validation, showSuffix: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Let users enter a title after their name</p>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          {/* Placeholders */}
          <div>
             <label className="block text-sm font-medium text-black mb-2">Placeholder</label>
             <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
                {/* First Name */}
                <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">First Name</span></div>
                <div className="bg-white p-0">
                  <input 
                    type="text" 
                    className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                    value={(field.validation as any)?.placeholders?.first || ''}
                    onChange={(e) => updateField(field.id, {
                      validation: { 
                        ...field.validation, 
                        placeholders: { ...(field.validation as any)?.placeholders, first: e.target.value } 
                      }
                    })}
                  />
                </div>
                
                 {/* Last Name */}
                <div className="bg-slate-700/5 p-2 flex items-center"><span className="text-xs font-semibold">Last Name</span></div>
                <div className="bg-white p-0">
                  <input 
                    type="text" 
                    className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                    value={(field.validation as any)?.placeholders?.last || ''}
                    onChange={(e) => updateField(field.id, {
                      validation: { 
                        ...field.validation, 
                        placeholders: { ...(field.validation as any)?.placeholders, last: e.target.value } 
                      }
                    })}
                  />
                </div>
             </div>
             <p className="mt-1 text-xs text-gray-500">Add an example inside each field</p>
          </div>

           {/* Hover Text */}
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

          {/* Read Only */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">Read Only</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(field.validation as any)?.readOnly || false}
                  onChange={(e) => updateField(field.id, {
                     validation: { ...field.validation, readOnly: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
               <p className="mt-1 text-xs text-gray-500">Prevent entry in this field</p>
          </div>
          
          {/* Hide Field */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">Hide field</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(field.validation as any)?.hidden || false}
                  onChange={(e) => updateField(field.id, {
                     validation: { ...field.validation, hidden: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
          </div>

        </div>
      )}
    </>
  );
};
