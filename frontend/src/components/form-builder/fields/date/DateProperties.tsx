import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';

interface DatePropertiesProps {
  field: Field;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>, id?: string) => Field | undefined;
}

export const DateProperties = ({ field, updateField, duplicatesField }: DatePropertiesProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'time' | 'limits' | 'advanced'>('general');

  return (
    <>
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md overflow-x-auto">
        {['general', 'options', 'time', 'limits', 'advanced'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors uppercase whitespace-nowrap ${
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
                      ? 'bg-blue-600 text-white border-blue-600'
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
            <label className="block text-sm font-medium text-black mb-2">Sublabel</label>
            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
              <div className="bg-slate-700/5 p-2 flex items-center col-span-1"><span className="text-xs font-semibold">Date</span></div>
              <div className="bg-white p-0 col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                  value={(field.validation as any)?.sublabels?.date || 'Date'}
                  onChange={(e) => updateField(field.id, {
                    validation: {
                      ...field.validation,
                      sublabels: { ...(field.validation as any)?.sublabels, date: e.target.value }
                    }
                  })}
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
            <label className="block text-sm font-medium text-black mb-2">Date Format</label>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {['MM-DD-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, dateFormat: fmt }
                  })}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                    ((field.validation as any)?.dateFormat || 'MM-DD-YYYY') === fmt
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Select a date format. D stands for day, M for month, and Y for year.</p>
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
                      ? 'bg-blue-600 text-white border-blue-600'
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Show calendar when users interact with field</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Lite Mode</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.liteMode || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, liteMode: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Show a single field instead of three fields</p>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Time Field</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.showTime || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, showTime: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Allow users to specify a time with date.</p>
          </div>
          {(field.validation as any)?.showTime && (
            <>
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      } ${fmt === '24 HOUR' ? 'rounded-l-md' : 'rounded-r-md'}`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Select a time format</p>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'limits' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Age Verification</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.ageVerification || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, ageVerification: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Prevent users under a certain age from submitting this form</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Past & Future</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-blue-600 focus:ring-black mr-2"
                  checked={(field.validation as any)?.allowPast !== false}
                  onChange={(e) => updateField(field.id, { validation: { ...field.validation, allowPast: e.target.checked } })}
                />
                <span className="text-sm text-gray-700">Past</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-400 text-blue-600 focus:ring-black mr-2"
                  checked={(field.validation as any)?.allowFuture !== false}
                  onChange={(e) => updateField(field.id, { validation: { ...field.validation, allowFuture: e.target.checked } })}
                />
                <span className="text-sm text-gray-700">Future</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">Let users select dates in the past or future</p>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
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
            <label className="block text-sm font-medium text-black mb-1">Read Only</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.readOnly || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, readOnly: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">Prevent entry in this field</p>
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
