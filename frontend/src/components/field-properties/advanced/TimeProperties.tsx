import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';
import { useTranslation } from 'react-i18next';

interface TimePropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const TimeProperties: React.FC<TimePropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const { t } = useTranslation();
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
      { }
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
           { }
           <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.field_label')}
              </label>
              <input
                type="text"
                value={stripHtml(field.label)}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>

            { }
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.label_alignment')}
              </label>
              <div className="flex gap-2">
                {(['LEFT', 'CENTER', 'TOP'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleOptionUpdate('labelAlignment', align)}
                     className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      (options.labelAlignment === align) || (!options.labelAlignment && align === 'TOP')
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'LEFT' ? t('builder.properties.left') : align === 'CENTER' ? t('builder.properties.center') : t('builder.properties.top')}
                  </button>
                ))}
              </div>

            </div>

            { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                  {t('builder.properties.required')}
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
                {t('builder.properties.required_desc')}
              </p>
            </div>

            { }
             <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.sublabels')}
              </label>
              <div className="grid grid-cols-[auto,1fr] bg-gray-50 rounded-md border border-gray-200 overflow-hidden text-sm">
                  { }
                  <div className="px-3 py-2 border-r border-gray-200 font-medium text-gray-700 flex items-center bg-gray-100">
                      {t('builder.time.hour')}
                  </div>
                  <input
                    type="text"
                    value={options.subLabelHour || t('builder.time.hour')}
                    onChange={(e) => handleOptionUpdate('subLabelHour', e.target.value)}
                    className="w-full px-3 py-2 bg-white focus:outline-none"
                    placeholder={t('builder.time.hour')}
                  />
                   { }
                  <div className="px-3 py-2 border-t border-r border-gray-200 font-medium text-gray-700 flex items-center bg-gray-100">
                      {t('builder.time.minutes')}
                  </div>
                  <input
                    type="text"
                    value={options.subLabelMinutes || t('builder.time.minutes')}
                    onChange={(e) => handleOptionUpdate('subLabelMinutes', e.target.value)}
                    className="w-full px-3 py-2 border-t border-gray-200 bg-white focus:outline-none"
                    placeholder={t('builder.time.minutes')}
                  />
              </div>
            </div>

             { }
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
               className="w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
               <Copy className="h-4 w-4" />
               {t('builder.properties.duplicate')}
             </button>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            { }
             <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.time_format')}
              </label>
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                {['24HOUR', 'AMPM'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleOptionUpdate('timeFormat', fmt)}
                     className={`flex-1 px-3 py-2 text-xs font-bold transition-colors ${
                      (options.timeFormat === fmt) || (!options.timeFormat && fmt === 'AMPM')
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {fmt === 'AMPM' ? 'AM/PM' : '24 HOUR'}
                  </button>
                ))}
              </div>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.time_format_desc')}
              </p>
            </div>

            { }
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.limit_time')}
              </label>
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                {['BOTH', 'AM', 'PM'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleValidationUpdate('limitTime', mode)}
                     className={`flex-1 px-3 py-2 text-xs font-bold transition-colors ${
                      (validation.limitTime === mode) || (!validation.limitTime && mode === 'BOTH')
                         ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'BOTH' ? t('builder.properties.limit_time_both') : mode === 'AM' ? t('builder.properties.limit_time_am') : t('builder.properties.limit_time_pm')}
                  </button>
                ))}
              </div>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.limit_time_desc')}
              </p>
            </div>

            { }
            <div>
               <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.default_time')}
              </label>
               <div className="flex rounded-md overflow-hidden border border-gray-300 mb-2">
                {['NONE', 'CURRENT', 'CUSTOM'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleOptionUpdate('defaultTime', mode)}
                     className={`flex-1 px-3 py-2 text-xs font-bold transition-colors ${
                      (options.defaultTime === mode) || (!options.defaultTime && mode === 'NONE')
                         ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'NONE' ? t('builder.properties.default_time_none') : mode === 'CURRENT' ? t('builder.properties.default_time_current') : t('builder.properties.default_time_custom')}
                  </button>
                ))}
              </div>
              {options.defaultTime === 'CUSTOM' && (
                  <div className="flex gap-2 items-center">
                       <input 
                         type="time" 
                         className="border border-gray-300 px-2 py-1 rounded w-full"
                         value={options.customDefaultTime || ''}
                         onChange={(e) => handleOptionUpdate('customDefaultTime', e.target.value)}
                       />
                  </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.default_time_desc')}
              </p>
            </div>

             { }
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.time_range')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.timeRange || false}
                    onChange={(e) => handleOptionUpdate('timeRange', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.time_range_desc')}
               </p>
            </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
             { }
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.hover_text')}
              </label>
              <textarea
                value={options.hoverText || ''}
                onChange={(e) => handleOptionUpdate('hoverText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.hover_text_desc')}
              </p>
            </div>

             { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.read_only')}
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
                {t('builder.properties.read_only_desc')}
              </p>
            </div>

             { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.shrink')}
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
                {t('builder.properties.shrink_desc')}
              </p>
            </div>
            
            { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.hide_field')}
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
                 <p className="mt-1 text-xs text-gray-500">
                  {t('builder.properties.hide_field_desc')}
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
