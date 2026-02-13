import React, { useState } from 'react';
import { Field, AddressField, AddressFieldOptions } from '@/types';
import { Copy } from 'lucide-react';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';
import { useTranslation } from 'react-i18next';

interface AddressPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const AddressProperties: React.FC<AddressPropertiesProps> = ({ field: rawField, updateField, duplicatesField }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  const field = rawField as unknown as AddressField;
  const options = field.options || {} as AddressFieldOptions;

  const handleUpdate = (updates: Partial<AddressField>) => {
    updateField(field.id, updates);
  };

  const handleOptionUpdate = (key: keyof AddressFieldOptions, value: unknown) => {
    handleUpdate({
      options: {
        ...options,
        [key]: value,
      } as AddressFieldOptions,
    });
  };

  const toggleSubfield = (key: keyof AddressFieldOptions) => {
      // @ts-ignore - options[key] is boolean
    handleOptionUpdate(key, !options[key]);
  };

  return (
    <div className="space-y-4">
      {/* <h3 className="font-semibold mb-2">{t('builder.properties.address_properties')}</h3> */}
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
          {/* Label */}
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

           {/* Duplicate Button */}
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
           {/* Default Country */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.default_country')}
              </label>
              <input
                type="text"
                value={options.defaultCountry || ''}
                onChange={(e) => handleOptionUpdate('defaultCountry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                placeholder={t('builder.properties.default_country_placeholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.default_country_desc')}
              </p>
            </div>

            {/* Input Type for State */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.state_input_type')}
              </label>
              <div className="flex gap-2">
                <button
                    onClick={() => handleOptionUpdate('stateInputType', 'text')}
                     className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      (options.stateInputType === 'text') || (!options.stateInputType)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {t('builder.properties.text_input')}
                  </button>
                  <button
                    onClick={() => handleOptionUpdate('stateInputType', 'thai_provinces')}
                     className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      (options.stateInputType === 'thai_provinces')
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {t('builder.properties.thai_provinces')}
                  </button>
              </div>
            </div>

            {/* Subfields Visibility */}
            <div>
               <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.subfields_visibility')}
              </label>
              <div className="space-y-2">
                  <label className="flex items-center gap-2">
                      <input type="checkbox" checked={options.showStreet !== false} onChange={() => toggleSubfield('showStreet')} className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm">{t('builder.address.street')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                      <input type="checkbox" checked={options.showStreet2 !== false} onChange={() => toggleSubfield('showStreet2')} className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm">{t('builder.address.street2')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                      <input type="checkbox" checked={options.showCity !== false} onChange={() => toggleSubfield('showCity')} className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm">{t('builder.address.city')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                      <input type="checkbox" checked={options.showState !== false} onChange={() => toggleSubfield('showState')} className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm">{t('builder.address.state')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                      <input type="checkbox" checked={options.showZip !== false} onChange={() => toggleSubfield('showZip')} className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm">{t('builder.address.zip')}</span>
                  </label>
                  <label className="flex items-center gap-2">
                      <input type="checkbox" checked={options.showCountry !== false} onChange={() => toggleSubfield('showCountry')} className="rounded border-gray-300 text-black focus:ring-black" />
                      <span className="text-sm">{t('builder.address.country')}</span>
                  </label>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
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
            
            {/* Hide Field */}
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
