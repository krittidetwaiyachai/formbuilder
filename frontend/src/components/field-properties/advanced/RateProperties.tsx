import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy, Star, Heart, Shield, Zap, Flag, ThumbsUp, Smile } from 'lucide-react';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';
import { useTranslation } from 'react-i18next';

interface RatePropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const RateProperties: React.FC<RatePropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const { t } = useTranslation();
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

  const icons = [
      { value: 'star', label: 'Star', icon: Star },
      { value: 'heart', label: 'Heart', icon: Heart },
      { value: 'shield', label: 'Shield', icon: Shield },
      { value: 'zap', label: 'Bolt', icon: Zap },
      { value: 'flag', label: 'Flag', icon: Flag },
      { value: 'thumbsup', label: 'Thumbs Up', icon: ThumbsUp },
      { value: 'smile', label: 'Smile', icon: Smile },
  ];

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
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            {/* Rating Icon */}
            <div>
                <label className="block text-sm font-medium text-black mb-2">
                    {t('builder.properties.rating_icon')}
                </label>
                <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200 gap-1">
                    {icons.map((item) => {
                         const Icon = item.icon;
                         const isSelected = (options.icon || 'star') === item.value;
                         return (
                            <button
                                key={item.value}
                                onClick={() => handleOptionUpdate('icon', item.value)}
                                className={`p-2 rounded transition-all ${isSelected ? 'bg-white shadow text-yellow-500 ring-1 ring-blue-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                title={item.label}
                            >
                                <Icon className="w-5 h-5 fill-current" />
                            </button>
                         );
                    })}
                </div>
                 <p className="mt-1 text-xs text-gray-500">
                  {t('builder.properties.rating_icon_desc')}
                </p>
            </div>

            {/* Rating Amount */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.rating_amount')}
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={options.maxRating || 5}
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 3 && val <= 10) {
                         handleOptionUpdate('maxRating', val);
                    }
                }}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.rating_amount_desc')}
              </p>
            </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
             {/* Default Value */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.rating_default_value')}
              </label>
               <input
                type="number"
                min={0}
                max={options.maxRating || 5}
                value={options.defaultValue || ''}
                 onChange={(e) => {
                    const val = parseInt(e.target.value);
                     if (!isNaN(val) && val >= 0 && val <= (options.maxRating || 5)) {
                         handleOptionUpdate('defaultValue', val);
                    } else if (e.target.value === '') {
                        handleOptionUpdate('defaultValue', null);
                    }
                }}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.rating_default_value_desc')}
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
