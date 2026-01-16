import { useState } from 'react';
import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stripHtml } from '@/lib/ui/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import { Field } from '@/types';
import { PdpaToggle } from '../common/PdpaToggle';
import { PropertiesTabs } from '../common/PropertiesTabs';

interface LongTextPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>) => void;
}

export function LongTextProperties({ field, updateField, duplicatesField }: LongTextPropertiesProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  // Helper to safely access options/validation with default values
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
        {/* GENERAL TAB */}
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

            {/* Sublabel */}
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
              onClick={() => duplicatesField({
                  type: field.type,
                  label: field.label,
                  placeholder: field.placeholder,
                  required: field.required,
                  validation: field.validation,
                  options: field.options,
                  order: 0,
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

        {/* OPTIONS TAB */}
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
                 <div className="mt-2">
                   <input
                        type="number"
                        value={options.customWidth || 300}
                        onChange={(e) => handleOptionUpdate('customWidth', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        placeholder={t('builder.properties.width_px_placeholder')}
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.width_desc')}
              </p>
            </div>

            {/* Height */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.height')}
               </label>
               <div className="flex items-center gap-2">
                 <input
                      type="number"
                      value={options.rows || 4}
                      onChange={(e) => handleOptionUpdate('rows', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                      placeholder={t('builder.properties.height')}
                  />
                  {/* <span className="text-sm text-gray-500">Rows</span> */}
               </div>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.height_desc')}
              </p>
            </div>

            {/* Entry Limits */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.entry_limits')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={validation.hasEntryLimits || false}
                    onChange={(e) => handleValidationUpdate('hasEntryLimits', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
               
               {validation.hasEntryLimits && (
                 <div className="mt-2 space-y-2">
                   <div className="flex gap-2">
                     <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">{t('builder.properties.min')}</label>
                        <input
                            type="number"
                            value={validation.minLength || ''}
                            onChange={(e) => handleValidationUpdate('minLength', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        />
                     </div>
                     <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">{t('builder.properties.max')}</label>
                        <input
                            type="number"
                            value={validation.maxLength || ''}
                            onChange={(e) => handleValidationUpdate('maxLength', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        />
                     </div>
                   </div>
                    {/* Mode selection (Characters/Words) could go here */}
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.entry_limits_text_desc')}
              </p>
            </div>

            {/* Editor Mode */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('builder.properties.editor_mode')}
              </label>
              <div className="flex gap-px bg-gray-200 border border-gray-300 rounded overflow-hidden">
                {['PLAIN_TEXT', 'RICH_TEXT'].map((mode) => (
                  <button
                    key={mode}
                     onClick={() => handleOptionUpdate('editorMode', mode)}
                     className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      (options.editorMode === mode) || (!options.editorMode && mode === 'PLAIN_TEXT')
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    {mode === 'PLAIN_TEXT' ? t('builder.properties.plain_text') : t('builder.properties.rich_text')}
                  </button>
                ))}
              </div>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.editor_mode_desc')}
              </p>
            </div>

            {/* Validation */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.validation')}
              </label>
              <Select
                value={validation.type || 'None'}
                onValueChange={(val) => handleValidationUpdate('type', val)}
              >
                <SelectTrigger className="w-full bg-white border-gray-400">
                    <SelectValue placeholder={t('builder.properties.select_validation')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="None">{t('builder.properties.validation_none')}</SelectItem>
                    <SelectItem value="Email">{t('builder.properties.validation_email')}</SelectItem>
                    <SelectItem value="URL">{t('builder.properties.validation_url')}</SelectItem>
                    <SelectItem value="Alphabetic">{t('builder.properties.validation_alphabetic')}</SelectItem>
                    <SelectItem value="Alphanumeric">{t('builder.properties.validation_alphanumeric')}</SelectItem>
                    <SelectItem value="Numeric">{t('builder.properties.validation_numeric')}</SelectItem>
                    <SelectItem value="Regex">{t('builder.properties.validation_regex')}</SelectItem>
                </SelectContent>
              </Select>
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.validation_desc')}
              </p>
            </div>
          </div>
        )}

        {/* ADVANCED TAB */}
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
              <textarea
                 value={options.defaultValue || ''}
                 onChange={(e) => handleOptionUpdate('defaultValue', e.target.value)}
                 rows={3}
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
                    checked={field.shrink || false}
                    onChange={(e) => handleUpdate({ shrink: e.target.checked })}
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
    </>
  );
};
