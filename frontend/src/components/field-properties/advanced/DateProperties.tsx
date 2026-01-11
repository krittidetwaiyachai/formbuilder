import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface DatePropertiesProps {
  field: Field;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>, id?: string) => Field | undefined;
}

export const DateProperties = ({ field, updateField, duplicatesField }: DatePropertiesProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  const options = field.options || {};
  
  const handleOptionUpdate = (key: string, value: any) => {
    updateField(field.id, {
      options: {
        ...options,
        [key]: value,
      },
    });
  };


  return (
    <>
      <div className="flex items-center gap-0.5 mb-4 bg-gray-100 p-1 rounded-md overflow-x-auto">
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
                  onClick={() => handleOptionUpdate('labelAlignment', value)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    options.labelAlignment === value ||
                    (!options.labelAlignment && value === 'TOP')
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {label}
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
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Prevent submission if this field is empty</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Sublabel</label>
            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
              <div className="bg-slate-700/5 p-2 flex items-center col-span-1"><span className="text-xs font-semibold">Date</span></div>
              <div className="bg-white p-0 col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                  value={options.subLabel || ''}
                  onChange={(e) => handleOptionUpdate('subLabel', e.target.value)}
                  placeholder="Sublabel"
                />
              </div>
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
              });
            }}
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
            <label className="block text-sm font-medium text-black mb-2">Separator</label>
            <div className="flex gap-2">
              {['-', '/', '.'].map((sep) => (
                <button
                  key={sep}
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, separator: sep }
                  })}
                  className={`flex-1 px-3 py-2 text-lg font-bold rounded-md border transition-colors ${
                    ((field.validation as any)?.separator || '/') === sep
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {sep}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Select a character to use between date fields</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Date Format</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 'MM-DD-YYYY', label: 'MM-DD-YY' },
                { value: 'DD-MM-YYYY', label: 'DD-MM-YY' },
                { value: 'YYYY-MM-DD', label: 'YY-MM-DD' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, dateFormat: value }
                  })}
                  className={`px-2 py-2 text-[10px] font-medium rounded-md border transition-colors ${(
                    (field.validation as any)?.dateFormat || 'MM-DD-YYYY') === value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">D = Day, M = Month, Y = Year</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Default Date</label>
            <div className="flex gap-1">
              {['NONE', 'CURRENT', 'CUSTOM'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, defaultDate: opt }
                  })}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-md border transition-colors ${
                    ((field.validation as any)?.defaultDate || 'NONE') === opt
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Pre-populate with a current or custom date</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Calendar Popup</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={(field.validation as any)?.calendarPopup !== false} // Default true
                onChange={(e) => updateField(field.id, {
                  validation: { ...field.validation, calendarPopup: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Show calendar when users interact with field</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Lite Mode</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.liteMode || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, liteMode: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Show a single field instead of three fields</p>
          </div>

           <div className="border-t pt-4">
            <h4 className="text-sm font-bold mb-3">Time Settings</h4>
             <div>
            <label className="block text-sm font-medium text-black mb-1">Time Field</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.showTime || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, showTime: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Allow users to specify a time with date.</p>
          </div>
          {(field.validation as any)?.showTime && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Time Format</label>
                <div className="flex gap-0">
                  {['24 HOUR', 'AM/PM'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => updateField(field.id, {
                        validation: { ...field.validation, timeFormat: fmt }
                      })}
                      className={`px-3 py-2 text-xs font-bold transition-colors ${
                        ((field.validation as any)?.timeFormat || 'AM/PM') === fmt
                          ? 'bg-black text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      } ${fmt === '24 HOUR' ? 'rounded-l-md' : 'rounded-r-md'}`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Limit time</label>
                <div className="flex gap-0">
                  {['BOTH', 'AM', 'PM'].map((opt, index) => {
                     const value = opt === 'BOTH' ? 'BOTH' : opt;
                     const label = opt === 'BOTH' ? 'BOTH AM & PM' : `${opt} ONLY`;
                     const isSelected = ((field.validation as any)?.limitTime || 'BOTH') === value;
                     
                     return (
                        <button
                          key={opt}
                          onClick={() => updateField(field.id, {
                            validation: { ...field.validation, limitTime: value }
                          })}
                          className={`px-4 py-3 text-xs font-bold transition-colors uppercase ${
                            isSelected
                              ? 'bg-black text-white z-10'
                              : 'bg-[#F3F4F6] text-gray-700 hover:bg-gray-200'
                          } ${index === 0 ? 'rounded-l-md' : ''} ${index === 2 ? 'rounded-r-md' : ''} flex-1`}
                        >
                          {label}
                        </button>
                     );
                  })}
                </div>
              </div>
            </div>
          )}
          </div>

           <div className="border-t pt-4">
             <h4 className="text-sm font-bold mb-3">Limits</h4>
             <div>
            <label className="block text-sm font-medium text-black mb-1">Age Verification</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.ageVerification || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, ageVerification: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Prevent users under a certain age from submitting</p>
            {(field.validation as any)?.ageVerification && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Age</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={(field.validation as any)?.minimumAge || 18}
                    onChange={(e) => updateField(field.id, {
                      validation: { ...field.validation, minimumAge: parseInt(e.target.value) || 0 }
                    })}
                    className="w-20 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm"
                    min={0}
                    max={100}
                  />
                  <span className="text-sm text-gray-500">years old</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-3">Past & Future</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={(field.validation as any)?.allowPast !== false}
                    onChange={(e) => updateField(field.id, { validation: { ...field.validation, allowPast: e.target.checked } })}
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
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">Past</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group select-none">
                 <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={(field.validation as any)?.allowFuture !== false}
                    onChange={(e) => updateField(field.id, { validation: { ...field.validation, allowFuture: e.target.checked } })}
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
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">Future</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">Let users select dates in the past or future</p>
          </div>
           </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
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
              <input type="checkbox" checked={options.readOnly || false} onChange={(e) => handleOptionUpdate('readOnly', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Prevent entry in this field</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Shrink</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={options.shrink || false} onChange={(e) => handleOptionUpdate('shrink', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Make field smaller</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Hide field</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={options.hidden || false} onChange={(e) => handleOptionUpdate('hidden', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
          </div>
        </div>
      )}
    </>
  );
};
