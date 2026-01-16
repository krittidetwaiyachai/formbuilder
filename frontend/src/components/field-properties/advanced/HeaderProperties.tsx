import { useState } from 'react';
import { Field } from '@/types';
import { AlignLeft, AlignCenter, AlignRight, Copy } from 'lucide-react';
import { PropertiesTabs } from '../common/PropertiesTabs';
import { useTranslation } from 'react-i18next';

interface HeaderPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>) => void;
}

export function HeaderProperties({ field, updateField, duplicatesField }: HeaderPropertiesProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const wrapWithParagraph = (text: string) => {
    if (!text.trim()) return '';
    return `<p>${text}</p>`;
  };

  return (
    <>
      {/* Tabs */}
      {/* Tabs */}
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
          {/* Heading Text */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t('builder.properties.heading_text')}
            </label>
            <textarea
              value={stripHtml(field.label)}
              onChange={(e) => updateField(field.id, { label: wrapWithParagraph(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none"
              placeholder={t('builder.properties.heading_placeholder')}
              rows={2}
            />
          </div>

          {/* Subheading Text */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t('builder.properties.subheading_text')}
            </label>
            <textarea
              value={stripHtml(field.placeholder || '')}
              onChange={(e) => updateField(field.id, { placeholder: wrapWithParagraph(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none"
              placeholder={t('builder.properties.subheading_placeholder')}
              rows={2}
            />
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.subheading_desc')}</p>
          </div>

          {/* Duplicate Field */}
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
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
          {/* Heading Size */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {t('builder.properties.heading_size')}
            </label>
            <div className="flex gap-2">
              {['DEFAULT', 'LARGE', 'SMALL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, size }
                  })}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    (field.validation as any)?.size === size || (!(field.validation as any)?.size && size === 'DEFAULT')
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {size === 'DEFAULT' ? t('builder.properties.default') : size === 'LARGE' ? t('builder.properties.large') : t('builder.properties.small')}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {t('builder.properties.text_alignment')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'LEFT', icon: AlignLeft },
                { value: 'CENTER', icon: AlignCenter },
                { value: 'RIGHT', icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, alignment: value }
                  })}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors flex items-center justify-center gap-1 ${
                    (field.validation as any)?.alignment === value || (!(field.validation as any)?.alignment && value === 'LEFT')
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {value === 'LEFT' ? t('builder.properties.left') : value === 'CENTER' ? t('builder.properties.center') : t('builder.properties.right')}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('builder.properties.alignment_desc')}</p>
          </div>

          {/* Heading Image URL */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              {t('builder.properties.heading_image')}
            </label>
            <input
              type="text"
              value={(field.validation as any)?.headingImage || ''}
              onChange={(e) => updateField(field.id, {
                validation: { ...field.validation, headingImage: e.target.value }
              })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text mb-2"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                  e.stopPropagation();
                }
              }}
            />
            <p className="text-xs text-gray-500 mb-2">
              {t('builder.properties.heading_image_desc')}
            </p>

            {(field.validation as any)?.headingImage && (
              <div className="relative border border-gray-200 rounded-lg overflow-hidden mb-4">
                <img 
                  src={(field.validation as any)?.headingImage} 
                  alt="Header Preview" 
                  className="w-full h-auto object-cover max-h-48"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Image Position */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {t('builder.properties.image_position')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'LEFT', label: t('builder.properties.left') },
                { value: 'CENTER', label: t('builder.properties.center') },
                { value: 'RIGHT', label: t('builder.properties.right') },
                { value: 'BACKGROUND', label: t('builder.properties.background') },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, imagePosition: value }
                  })}
                  className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                    (field.validation as any)?.imagePosition === value || (!(field.validation as any)?.imagePosition && value === 'CENTER')
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {t('builder.properties.background_desc')}
            </p>
          </div>

          {(field.validation as any)?.imagePosition === 'BACKGROUND' && (
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.overlay_opacity')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(field.validation as any)?.overlayOpacity ?? 50}
                  onChange={(e) => updateField(field.id, {
                    validation: { ...field.validation, overlayOpacity: parseInt(e.target.value) }
                  })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <span className="text-sm font-medium text-black w-12 text-right">
                  {(field.validation as any)?.overlayOpacity ?? 50}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.overlay_opacity_desc')}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'advanced' && (
         <div className="space-y-6">
           {/* Shrink Field */}
          <div>
             <label className="block text-sm font-medium text-black mb-1">
              {t('builder.properties.shrink')}
             </label>
             <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.shrink || false}
                  onChange={(e) => updateField(field.id, { shrink: e.target.checked })}
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
                  checked={(field.validation as any)?.hidden || false}
                  onChange={(e) => updateField(field.id, {
                    validation: {
                      ...field.validation,
                      hidden: e.target.checked
                    }
                  })}
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
    </>
  );
}
