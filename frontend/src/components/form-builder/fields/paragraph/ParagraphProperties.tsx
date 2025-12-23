import React, { useState } from 'react';
import { Field } from '@/types';
import { Copy, Edit2 } from 'lucide-react';

interface ParagraphPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const ParagraphProperties: React.FC<ParagraphPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');
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
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md">
        {['general', 'advanced'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors uppercase ${
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
          {/* Paragraph Text */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Paragraph Text
            </label>
            
            {isEditing ? (
               <div className="space-y-2">
                 <textarea
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white select-text text-sm"
                  placeholder="Enter your text here..."
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                  autoFocus
                 />
                 <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                 >
                   Done Editing
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
                  EDIT
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Click to edit paragraph text.
                </p>
              </div>
            )}
          </div>

          {/* Duplicate Field */}
          <button
             type="button"
             onClick={handleDuplicate}
             className="w-full mt-4 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
           >
             <Copy className="h-4 w-4" />
             DUPLICATE
           </button>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
           {/* Shrink */}
           <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-black">
                    Shrink
                </label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={options.shrink || false}
                    onChange={(e) => handleOptionUpdate('shrink', e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
             <p className="mt-1 text-xs text-gray-500">
                 Make field smaller
             </p>
          </div>

          <hr className="border-gray-200" />

          {/* Move to a new line */}
          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-black">
                    Move to a new line
                </label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                 <input
                    type="checkbox"
                    checked={options.moveToNewLine || false}
                    onChange={(e) => handleOptionUpdate('moveToNewLine', e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
             <p className="mt-1 text-xs text-gray-500">
                 Move field to a new line
             </p>
          </div>

          <hr className="border-gray-200" />

          {/* Hide Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-black">
                    Hide field
                </label>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={options.hidden || false}
                onChange={(e) => handleOptionUpdate('hidden', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <p className="mt-1 text-xs text-gray-500">
                Hide this field from the form
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
