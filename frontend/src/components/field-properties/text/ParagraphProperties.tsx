import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy, Edit2 } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useTranslation } from 'react-i18next';
import { PropertiesTabs } from '../common/PropertiesTabs';

interface ParagraphPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const ParagraphProperties: React.FC<ParagraphPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');
  const [isEditing, setIsEditing] = useState(false);

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

  const handleDuplicate = () => {
    duplicatesField({
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      validation: field.validation,
      options: field.options,
      order: field.order,
      formId: field.formId,
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
          {/* Paragraph Text */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {t('builder.properties.paragraph_text')}
            </label>
            
            {isEditing ? (
               <div className="space-y-2">
                 <RichTextEditor
                  value={field.label}
                  onChange={(value) => updateField(field.id, { label: value })}
                  placeholder="Enter your text here..."
                  className="min-h-[200px] text-sm [&_.ql-container]:min-h-[150px] [&_.ql-editor]:min-h-[150px]"
                 />
                 <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-black hover:text-blue-800 font-medium"
                 >
                   {t('builder.properties.done_editing')}
                 </button>
               </div>
            ) : (
              <div>
                 <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  {t('builder.properties.edit')}
                </button>
                <div 
                  className="mt-2 text-xs text-gray-500 line-clamp-3 p-2 border border-gray-100 rounded bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: field.label || t('builder.properties.empty_paragraph') }}
                />
              </div>
            )}
          </div>

          {/* Duplicate Field */}
          <button
             type="button"
             onClick={handleDuplicate}
             className="w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
           >
             <Copy className="h-4 w-4" />
             {t('builder.properties.duplicate')}
           </button>
        </div>
      )}

      {activeTab === 'options' && (
         <div className="space-y-6">
            {/* Move to a new line */}
           <div>
             <div className="flex items-center justify-between mb-1">
                 <label className="block text-sm font-medium text-black">
                     {t('builder.properties.move_to_new_line')}
                 </label>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                  <input
                     type="checkbox"
                     checked={options.moveToNewLine || false}
                     onChange={(e) => handleOptionUpdate('moveToNewLine', e.target.checked)}
                     className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
             </label>
              <p className="mt-1 text-xs text-gray-500">
                  {t('builder.properties.move_to_new_line_desc')}
              </p>
           </div>
         </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
           {/* Shrink */}
           <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-black">
                    {t('builder.properties.shrink')}
                </label>
            </div>
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

          <hr className="border-gray-200" />

          {/* Hide Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-black">
                    {t('builder.properties.hide_field')}
                </label>
            </div>
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
