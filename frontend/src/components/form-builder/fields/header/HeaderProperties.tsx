import { useState } from 'react';
import { Field } from '@/types';
import { AlignLeft, AlignCenter, AlignRight, Copy } from 'lucide-react';

interface HeaderPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>) => void;
}

export function HeaderProperties({ field, updateField, duplicatesField }: HeaderPropertiesProps) {
  const [headerTab, setHeaderTab] = useState<'general' | 'image'>('general');

  return (
    <>
      {/* Sub-tabs for Header */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md">
        <button
          onClick={() => setHeaderTab('general')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            headerTab === 'general'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setHeaderTab('image')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            headerTab === 'image'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Image
        </button>
      </div>

      {headerTab === 'general' ? (
        <div className="space-y-4">
          {/* Heading Text */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Heading Text
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                  e.stopPropagation();
                }
              }}
            />
          </div>

          {/* Subheading Text */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Subheading Text
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                  e.stopPropagation();
                }
              }}
            />
            <p className="mt-1 text-xs text-gray-500">Add smaller text below the heading</p>
          </div>

          {/* Heading Size */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Heading Size
            </label>
            <div className="flex gap-2">
              {['DEFAULT', 'LARGE', 'SMALL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateField(field.id, {
                    validation: { ...field.validation, size }
                  })}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    (field.validation as any)?.size === size || (!(field.validation as any)?.size && size === 'DEFAULT')
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Text Alignment
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
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors flex items-center justify-center gap-1 ${
                    (field.validation as any)?.alignment === value || (!(field.validation as any)?.alignment && value === 'LEFT')
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {value}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">Select how the heading is aligned horizontally</p>
          </div>

          {/* Duplicate Field */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Duplicate Field
            </label>
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
              className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-gray-100 border border-gray-400 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              DUPLICATE
            </button>
            <p className="mt-1 text-xs text-gray-500">Duplicate this field with all saved settings</p>
          </div>

          {/* Hide field */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Hide field
            </label>
            <button
              type="button"
              onClick={() => updateField(field.id, {
                validation: {
                  ...field.validation,
                  hidden: !((field.validation as any)?.hidden || false)
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                (field.validation as any)?.hidden ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  (field.validation as any)?.hidden ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Heading Image URL */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Heading Image URL
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
            <p className="text-xs text-gray-500 mb-4">
              Paste an image URL to display above the heading.
            </p>

            {(field.validation as any)?.headingImage && (
              <div className="relative border border-gray-200 rounded-lg overflow-hidden">
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
        </div>
      )}
    </>
  );
}
