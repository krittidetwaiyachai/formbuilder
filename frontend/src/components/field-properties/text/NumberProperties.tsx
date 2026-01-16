import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stripHtml } from '@/lib/ui/utils';
import { PdpaToggle } from '../common/PdpaToggle';
import { PropertiesTabs } from '../common/PropertiesTabs';

interface NumberPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const NumberProperties: React.FC<NumberPropertiesProps> = ({ field, updateField, duplicatesField }) => {
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
      {/* Tabs */}
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
           {/* Field Label */}
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

            {/* Label Alignment */}
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

            {/* Required */}
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

            {/* Sub Label */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.sublabel')}
              </label>
              <input
                type="text"
                value={options.subLabel || ''}
                onChange={(e) => handleOptionUpdate('subLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.sublabel_desc')}
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
               className="w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
               <Copy className="h-4 w-4" />
               {t('builder.properties.duplicate')}
             </button>

            <PdpaToggle 
                value={field.isPII || false} 
                onChange={(val) => handleUpdate({ isPII: val })} 
            />
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            {/* Width */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.width')}
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
                   <div className="mt-2 text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600 inline-block">
                        {t('builder.properties.fixed_width')}
                   </div>
                )}
                 <p className="mt-1 text-xs text-gray-500">
                  {t('builder.properties.width_desc')}
                </p>
                 {options.width === 'FIXED' && (
                     <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('builder.properties.custom_width')}</label>
                        <input
                            type="number"
                            value={options.customWidth || ''}
                            onChange={(e) => handleOptionUpdate('customWidth', parseInt(e.target.value))}
                             className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                            placeholder="e.g. 300"
                        />
                     </div>
                 )}
            </div>
            
            {/* Entry Limits */}
             <div>
                   <label className="block text-sm font-medium text-black mb-1">
                    {t('builder.properties.entry_limits')}
                   </label>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={validation.entryLimits || false}
                        onChange={(e) => handleValidationUpdate('entryLimits', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                    </label>
                   <p className="mt-1 text-xs text-gray-500">
                    {t('builder.properties.entry_limits_value_desc')}
                   </p>
                   {validation.entryLimits && (
                       <div className="mt-4 flex gap-4">
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('builder.properties.min')}</label>
                                <input
                                    type="number"
                                    value={validation.min || ''}
                                    onChange={(e) => handleValidationUpdate('min', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                />
                           </div>
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('builder.properties.max')}</label>
                                <input
                                    type="number"
                                    value={validation.max || ''}
                                    onChange={(e) => handleValidationUpdate('max', parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                />
                            </div>
                       </div>
                   )}
                </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Placeholder */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.placeholder')}
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                placeholder="e.g., 23"
              />
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.placeholder_desc')}
              </p>
            </div>

             {/* Hover Text */}
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

            {/* Default Value */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.default_value')}
              </label>
              <input
                type="number"
                value={options.defaultValue || ''}
                onChange={(e) => handleOptionUpdate('defaultValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.default_value_desc')}
              </p>
            </div>

             {/* Read Only */}
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

             {/* Shrink */}
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
            
            {/* Hide field */}
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
