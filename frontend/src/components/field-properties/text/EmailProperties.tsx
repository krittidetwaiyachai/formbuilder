import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';

interface EmailPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const EmailProperties = ({ field, updateField, duplicatesField }: EmailPropertiesProps) => {
  const { t } = useTranslation();
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
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="space-y-4">
        {activeTab === 'general' && (
          <div className="space-y-4">
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
              {t('builder.properties.duplicate')}
            </button>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-6">
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
               
              {options.width === 'FIXED' && (
                 <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('builder.properties.custom_width')}</label>
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
                {t('builder.properties.width_desc')}
              </p>
            </div>

            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.disallow_free_addresses')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={validation.disallowFree || false}
                   onChange={(e) => handleValidationUpdate('disallowFree', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.disallow_free_addresses_desc')}
              </p>
            </div>

            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.confirmation_field')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={validation.confirmation || false}
                   onChange={(e) => handleValidationUpdate('confirmation', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.confirmation_field_desc')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.placeholder')}
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.placeholder_desc')}
              </p>
            </div>

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

             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.default_value')}
              </label>
              <input
                type="email"
                value={options.defaultValue || ''}
                onChange={(e) => handleOptionUpdate('defaultValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.default_value_desc')}
              </p>
            </div>

            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.character_limit')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={validation.hasMaxLength || false}
                   onChange={(e) => handleValidationUpdate('hasMaxLength', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
               </label>
              
               {validation.hasMaxLength && (
                 <div className="mt-2">
                   <input
                        type="number"
                        value={validation.maxLength || 100}
                        onChange={(e) => handleValidationUpdate('maxLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        placeholder="Max characters"
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.character_limit_desc')}
              </p>
            </div>

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
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
               </label>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.shrink_desc')}
              </p>
            </div>

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
    </>
  );
};
