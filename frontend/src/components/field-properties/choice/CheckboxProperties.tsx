import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/custom-select';
import { parseOptions, formatOptionsToText } from './utils';

interface CheckboxPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>) => void;
}

export const CheckboxProperties: React.FC<CheckboxPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'surveying' | 'advanced'>('general');

  // We will now prioritize `options` for all settings to be consistent with other fields.
  const options = Array.isArray(field.options) ? { items: field.options } : (field.options || {});

  
  const handleUpdate = (updates: any) => {
    updateField(field.id, updates);
  };


  const handleOptionUpdate = (key: string, value: any) => {
    const currentOptions = Array.isArray(field.options) 
        ? { items: field.options } 
        : (field.options || {});
        
    handleUpdate({
      options: {
        ...currentOptions,
        [key]: value,
      },
    });
  };

  // For Options List management
  const optionsList = Array.isArray(field.options) ? field.options : ((field.options as any)?.items || []);
  
  const handleOptionsListChange = (text: string) => {
    const newItems = parseOptions(text);
    
    // Preserve existing options settings if it's an object
    const currentOptions = Array.isArray(field.options) ? {} : field.options;
    
    handleUpdate({ 
        options: Array.isArray(field.options) 
            ? { items: newItems }
            : { ...currentOptions, items: newItems }
    });
  };
 
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-4 bg-gray-100 p-1 rounded-md">
        {['general', 'options', 'surveying', 'advanced'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-colors uppercase whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab === 'surveying' ? 'SURVEY' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
           {/* Field Label */}
           <div>
              <label className="block text-sm font-medium text-black mb-1">
                Field Label
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
            </div>

            {/* Label Alignment */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Label Alignment
              </label>
              <div className="flex gap-2">
                {(['LEFT', 'RIGHT', 'TOP'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => handleOptionUpdate('labelAlignment', align)}
                     className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                      ((field.options as any)?.labelAlignment === align) || (!(field.options as any)?.labelAlignment && align === 'TOP')
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Required */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                  Required
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
                Prevent submission if this field is empty
              </p>
            </div>

            {/* Sublabel */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Sublabel
              </label>
              <input
                type="text"
                value={options.subLabel || ''}
                onChange={(e) => handleOptionUpdate('subLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                placeholder="Additional description..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Description shown below the field
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
               })}
               className="w-full mt-4 px-3 py-2 text-sm font-medium text-black bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
             >
               <Copy className="h-4 w-4" />
               DUPLICATE
             </button>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            {/* Options List */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                 Options
               </label>
               <div className="border border-gray-400 rounded-md overflow-hidden bg-white">
                  <textarea
                    value={formatOptionsToText(optionsList)}
                    onChange={(e) => handleOptionsListChange(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 focus:outline-none resize-y text-sm"
                    placeholder="Type option 1&#10;Type option 2"
                  />
               </div>
               <p className="mt-1 text-xs text-gray-500">
                 Give options for users to select from. Enter each option on a new line.
               </p>
            </div>
            
             {/* Predefined Options */}
             <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Predefined Options
                </label>
                <Select 
                    onValueChange={(value) => {
                        if (value === 'none') return;
                        
                        const predefinedLists: Record<string, string[]> = {
                            yes_no: ['Yes', 'No'],
                            yes_no_thai: ['ใช่', 'ไม่ใช่'],
                            gender: ['Male', 'Female', 'Other', 'Prefer not to say'],
                            gender_thai: ['ชาย', 'หญิง', 'อื่นๆ', 'ไม่ระบุ'],
                            days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            days_thai: ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'],
                            interests: ['Technology', 'Sports', 'Music', 'Art', 'Travel', 'Food', 'Gaming', 'Reading'],
                            interests_thai: ['เทคโนโลยี', 'กีฬา', 'ดนตรี', 'ศิลปะ', 'ท่องเที่ยว', 'อาหาร', 'เกม', 'การอ่าน'],
                            skills: ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management', 'Creativity'],
                            skills_thai: ['การสื่อสาร', 'ภาวะผู้นำ', 'แก้ปัญหา', 'การทำงานเป็นทีม', 'บริหารเวลา', 'ความคิดสร้างสรรค์'],
                            devices: ['Desktop', 'Laptop', 'Tablet', 'Smartphone', 'Smart TV'],
                            social_media: ['Facebook', 'Instagram', 'Twitter/X', 'TikTok', 'YouTube', 'LinkedIn'],
                        };
                        
                        const selected = predefinedLists[value];
                        if (selected) {
                            const newItems = selected.map(item => ({ label: item, value: item }));
                            
                            // Handler for updating options while preserving other settings
                            const currentOptions = Array.isArray(field.options) ? {} : (field.options || {});
                            handleUpdate({ 
                                options: {
                                    ...currentOptions,
                                    items: newItems
                                }
                            });
                        }
                    }}
                >
                    <SelectTrigger className="w-full bg-white border-gray-400">
                        <SelectValue placeholder="Select predefined list..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Thailand</SelectLabel>
                            <SelectItem value="yes_no_thai">Yes/No (Thai)</SelectItem>
                            <SelectItem value="gender_thai">Gender (Thai)</SelectItem>
                            <SelectItem value="days_thai">Days of Week (Thai)</SelectItem>
                            <SelectItem value="interests_thai">Interests (Thai)</SelectItem>
                            <SelectItem value="skills_thai">Skills (Thai)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>English</SelectLabel>
                            <SelectItem value="yes_no">Yes/No</SelectItem>
                            <SelectItem value="gender">Gender</SelectItem>
                            <SelectItem value="days_of_week">Days of Week</SelectItem>
                            <SelectItem value="interests">Interests</SelectItem>
                            <SelectItem value="skills">Skills</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Common</SelectLabel>
                            <SelectItem value="devices">Devices</SelectItem>
                            <SelectItem value="social_media">Social Media</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Select to replace current options with a predefined list
                </p>
            </div>

            {/* Calculation Values */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                Calculation Values
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.calculationValues || false}
                    onChange={(e) => handleOptionUpdate('calculationValues', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                  Add values to be used in calculations
                </p>
            </div>

            {/* Display Other Option */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                Display Other Option
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.otherOption || false}
                    onChange={(e) => handleOptionUpdate('otherOption', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                 <p className="mt-1 text-xs text-gray-500">
                  Allow users to enter text when their selection is not available.
                </p>
            </div>

             {/* Spread to Columns */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Spread to Columns
               </label>
               <div className="flex items-center gap-3">
                 <label className="relative inline-flex items-center cursor-pointer">
                   <input
                     type="checkbox"
                     checked={options.spreadToColumns || false}
                     onChange={(e) => handleOptionUpdate('spreadToColumns', e.target.checked)}
                     className="sr-only peer"
                   />
                   <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                 </label>
                 {options.spreadToColumns && (
                   <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600">
                        FIXED WIDTH
                   </span>
                 )}
               </div>
                 <p className="mt-1 text-xs text-gray-500">
                  Spread options side by side into specified number of columns.
                </p>
                 {options.spreadToColumns && (
                     <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Column Count</label>
                        <input
                            type="number"
                            value={options.columns || 2}
                            onChange={(e) => handleOptionUpdate('columns', parseInt(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                            min={2}
                            max={5}
                        />
                     </div>
                 )}
            </div>
        </div>
      )}

      {activeTab === 'surveying' && (
           <div className="space-y-6">
               {/* Entry Limits */}
                <div>
                   <label className="block text-sm font-medium text-black mb-1">
                    Entry Limits
                   </label>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.entryLimits || false}
                        onChange={(e) => handleOptionUpdate('entryLimits', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                    </label>
                   <p className="mt-1 text-xs text-gray-500">
                    Limit the minimum or maximum number of selections allowed.
                   </p>
                   {options.entryLimits && (
                       <div className="mt-4 flex gap-4">
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum</label>
                                <input
                                    type="number"
                                    value={options.minSelections || ''}
                                    onChange={(e) => handleOptionUpdate('minSelections', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                    min={0}
                                />
                           </div>
                           <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Maximum</label>
                                <input
                                    type="number"
                                    value={options.maxSelections || ''}
                                    onChange={(e) => handleOptionUpdate('maxSelections', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text text-sm"
                                    min={0}
                                />
                            </div>
                       </div>
                   )}
                </div>

               {/* Shuffle Options */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Shuffle Options
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.shuffle || false}
                    onChange={(e) => handleOptionUpdate('shuffle', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                 Display options in random order.
               </p>
            </div>
           </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Selected by Default */}
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Selected by Default
                </label>
                <Select 
                    value={options.defaultValue || ''} 
                    onValueChange={(val) => handleOptionUpdate('defaultValue', val)}
                >
                    <SelectTrigger className="w-full bg-white border-gray-400">
                        <SelectValue placeholder="No Selection" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_no_selection_">No Selection</SelectItem>
                        {optionsList.map((opt: any, idx: number) => (
                            <SelectItem key={idx} value={opt.value}>
                                {opt.label || opt.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="mt-1 text-xs text-gray-500">
                 Choose an option to be selected by default.
                </p>
            </div>

            {/* Hover Text */}
             <div>
              <label className="block text-sm font-medium text-black mb-1">
                Hover Text
              </label>
              <textarea
                value={options.hoverText || ''}
                onChange={(e) => handleOptionUpdate('hoverText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
              />
              <p className="mt-1 text-xs text-gray-500">
                Show a description when a user hovers over this field
              </p>
            </div>

             {/* Read Only */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Read Only
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
                Prevent entry in this field
              </p>
            </div>

             {/* Shrink */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Shrink
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
                Make field smaller
              </p>
            </div>
            
            {/* Hide field */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Hide field
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
                  Hide this field from the form
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
