import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { stripHtml } from '@/lib/ui/utils';
import { PdpaToggle } from '../common/PdpaToggle';
import { PropertiesTabs } from '../common/PropertiesTabs';
import { useTranslation } from 'react-i18next';

interface DatePropertiesProps {
  field: Field;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>, id?: string) => Field | undefined;
}

export const DateProperties = ({ field, updateField, duplicatesField }: DatePropertiesProps) => {
  const { t } = useTranslation();
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
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.field_label')}</label>
            <input
              type="text"
              value={stripHtml(field.label)}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.label_alignment')}</label>
            <div className="flex gap-2">
              {[
                { value: 'LEFT', label: t('builder.properties.left') },
                { value: 'CENTER', label: t('builder.properties.center') },
                { value: 'TOP', label: t('builder.properties.top') },
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
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.required')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.required_desc')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.sublabel')}</label>
            <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
              <div className="bg-slate-700/5 p-2 flex items-center col-span-1"><span className="text-xs font-semibold">{t('builder.fields.date')}</span></div>
              <div className="bg-white p-0 col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border-0 focus:ring-0 bg-transparent"
                  value={options.subLabel || ''}
                  onChange={(e) => handleOptionUpdate('subLabel', e.target.value)}
                  placeholder={t('builder.properties.sublabel')}
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
             {t('builder.properties.duplicate')}
          </button>

            <PdpaToggle 
                value={field.isPII || false} 
                onChange={(val) => updateField(field.id, { isPII: val })} 
            />
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
           <div>
            <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.separator')}</label>
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
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.separator_desc')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.date_format')}</label>
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
            <p className="mt-1 text-xs text-gray-500">D = {t('builder.properties.day')}, M = {t('builder.properties.month')}, Y = {t('builder.properties.year')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.default_date')}</label>
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
                  {opt === 'NONE' ? t('builder.properties.none') : opt === 'CURRENT' ? t('builder.properties.current') : t('builder.properties.custom')}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.default_date_desc')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.calendar_popup')}</label>
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
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.calendar_popup_desc')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.lite_mode')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.liteMode || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, liteMode: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.lite_mode_desc')}</p>
          </div>

           <div className="border-t pt-4">
            <h4 className="text-sm font-bold mb-3">{t('builder.properties.time_settings')}</h4>
             <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.time_field')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.showTime || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, showTime: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.time_field_desc')}</p>
          </div>
          {(field.validation as any)?.showTime && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.time_format')}</label>
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
                <label className="block text-sm font-medium text-black mb-2">{t('builder.properties.limit_time')}</label>
                <div className="flex gap-0">
                  {['BOTH', 'AM', 'PM'].map((opt, index) => {
                     const value = opt === 'BOTH' ? 'BOTH' : opt;
                     const label = opt === 'BOTH' ? t('builder.properties.both_am_pm') : opt === 'AM' ? t('builder.properties.am_only') : t('builder.properties.pm_only');
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
             <h4 className="text-sm font-bold mb-3">{t('builder.properties.limits')}</h4>
             <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.age_verification')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={(field.validation as any)?.ageVerification || false} onChange={(e) => updateField(field.id, { validation: { ...field.validation, ageVerification: e.target.checked } })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.age_verification_desc')}</p>
            {(field.validation as any)?.ageVerification && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('builder.properties.minimum_age')}</label>
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
                  <span className="text-sm text-gray-500">{t('builder.properties.years_old')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-3">{t('builder.properties.past_future')}</label>
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
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{t('builder.properties.past')}</span>
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
                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{t('builder.properties.future')}</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('builder.properties.past_future_desc')}</p>
          </div>
           </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.hover_text')}</label>
            <textarea
              value={options.hoverText || ''}
              onChange={(e) => handleOptionUpdate('hoverText', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
            />
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.hover_text_desc')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.read_only')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={options.readOnly || false} onChange={(e) => handleOptionUpdate('readOnly', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.read_only_desc')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.shrink')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={options.shrink || false} onChange={(e) => handleOptionUpdate('shrink', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.shrink_desc')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">{t('builder.properties.hide_field')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={options.hidden || false} onChange={(e) => handleOptionUpdate('hidden', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
            </label>
             <p className="mt-1 text-xs text-gray-500">{t('builder.properties.hide_field_desc')}</p>
          </div>
        </div>
      )}
    </>
  );
};
