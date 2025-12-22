import { useState, useEffect, useRef } from 'react';
import { useFormStore } from '@/store/formStore';
import { Field, FieldType } from '@/types';
import { Settings, Palette, Copy, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export default function PropertiesPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentForm, selectedFieldId, updateField, updateForm, addField } = useFormStore();
  const selectedField = currentForm?.fields?.find((f) => f.id === selectedFieldId);
  const [activeTab, setActiveTab] = useState<'properties' | 'theme' | 'settings'>('properties');

  const [formTitle, setFormTitle] = useState(currentForm?.title || '');
  const [formDescription, setFormDescription] = useState(currentForm?.description || '');
  const [headerTab, setHeaderTab] = useState<'general' | 'image'>('general');

  useEffect(() => {
    if (currentForm) {
      setFormTitle(currentForm.title);
      setFormDescription(currentForm.description || '');
    }
  }, [currentForm]);


  const handleFormUpdate = (field: string, value: any) => {
    if (!currentForm) return;
    updateForm({ ...currentForm, [field]: value });
  };

  if (!currentForm) return null;

  return (
    <div ref={panelRef} className="w-80 bg-white flex flex-col h-full" style={{ overscrollBehavior: 'none' }} onKeyDown={(e) => {
      // Prevent Ctrl+A (Cmd+A on Mac) in properties panel, but allow it in input/textarea
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }}>
      {/* Top Section - Tabs */}
      <div className="border-b bg-white px-3 py-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'properties'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="truncate">Properties</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'theme'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span className="truncate">Theme</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeTab === 'settings'
                ? 'bg-white border-gray-400 text-black shadow-sm'
                : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="truncate">Settings</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <>
            {!selectedField ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-black mb-4">Form Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      handleFormUpdate('title', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      handleFormUpdate('description', e.target.value);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Status
                  </label>
                  <select
                    value={currentForm.status}
                    onChange={(e) => handleFormUpdate('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isQuiz"
                    checked={currentForm.isQuiz || false}
                    onChange={(e) => handleFormUpdate('isQuiz', e.target.checked)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-400 rounded"
                  />
                  <label htmlFor="isQuiz" className="ml-2 block text-sm text-black">
                    Enable Quiz Mode
                  </label>
                </div>
              </div>
            ) : selectedField ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-black mb-2">Element Properties</h3>
                </div>
                
                {selectedField.type === FieldType.HEADER ? (
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
                            value={selectedField.label}
                            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
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
                            value={selectedField.placeholder || ''}
                            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
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
                                onClick={() => updateField(selectedField.id, {
                                  validation: { ...selectedField.validation, size }
                                })}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                                  (selectedField.validation as any)?.size === size || (!(selectedField.validation as any)?.size && size === 'DEFAULT')
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
                                onClick={() => updateField(selectedField.id, {
                                  validation: { ...selectedField.validation, alignment: value }
                                })}
                                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors flex items-center justify-center gap-1 ${
                                  (selectedField.validation as any)?.alignment === value || (!(selectedField.validation as any)?.alignment && value === 'LEFT')
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
                              addField({
                                type: selectedField.type,
                                label: selectedField.label,
                                placeholder: selectedField.placeholder,
                                required: selectedField.required,
                                validation: selectedField.validation,
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
                            onClick={() => updateField(selectedField.id, {
                              validation: {
                                ...selectedField.validation,
                                hidden: !((selectedField.validation as any)?.hidden || false)
                              }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              (selectedField.validation as any)?.hidden ? 'bg-gray-300' : 'bg-blue-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                (selectedField.validation as any)?.hidden ? 'translate-x-1' : 'translate-x-6'
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
                            value={(selectedField.validation as any)?.headingImage || ''}
                            onChange={(e) => updateField(selectedField.id, {
                              validation: { ...selectedField.validation, headingImage: e.target.value }
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

                          {(selectedField.validation as any)?.headingImage && (
                            <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                              <img 
                                src={(selectedField.validation as any)?.headingImage} 
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
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required" className="ml-2 block text-sm text-black">
                    Required
                  </label>
                </div>
                {(selectedField.type === FieldType.DROPDOWN ||
                  selectedField.type === FieldType.RADIO ||
                  selectedField.type === FieldType.CHECKBOX) && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Options (one per line)
                    </label>
                    <textarea
                      value={
                        selectedField.options
                          ?.map((opt: any) => `${opt.label || opt.value}:${opt.value}`)
                          .join('\n') || ''
                      }
                      onChange={(e) => {
                        const options = e.target.value
                          .split('\n')
                          .filter((line) => line.trim())
                          .map((line) => {
                            const [label, value] = line.split(':');
                            return {
                              label: label?.trim() || value?.trim() || '',
                              value: value?.trim() || label?.trim() || '',
                            };
                          });
                        updateField(selectedField.id, { options });
                      }}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                      placeholder="Option 1: value1&#10;Option 2: value2"
                    />
                  </div>
                )}
                {currentForm.isQuiz && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Correct Answer
                      </label>
                      <input
                        type="text"
                        value={selectedField.correctAnswer || ''}
                        onChange={(e) =>
                          updateField(selectedField.id, { correctAnswer: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Score
                      </label>
                      <input
                        type="number"
                        value={selectedField.score || 0}
                        onChange={(e) =>
                          updateField(selectedField.id, { score: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                        e.stopPropagation();
                      }
                    }}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-black mb-4">Theme Settings</h3>
            <p className="text-sm text-gray-600">Theme customization coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-black mb-4">Form Settings</h3>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  handleFormUpdate('title', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                    e.stopPropagation();
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  handleFormUpdate('description', e.target.value);
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                    e.stopPropagation();
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Status
              </label>
              <select
                value={currentForm.status}
                onChange={(e) => handleFormUpdate('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                    e.stopPropagation();
                  }
                }}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isQuizSettings"
                checked={currentForm.isQuiz || false}
                onChange={(e) => handleFormUpdate('isQuiz', e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-400 rounded"
              />
              <label htmlFor="isQuizSettings" className="ml-2 block text-sm text-black">
                Enable Quiz Mode
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
