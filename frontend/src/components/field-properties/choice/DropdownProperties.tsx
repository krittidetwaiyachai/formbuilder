import { useState } from 'react';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/custom-select';

interface DropdownPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const DropdownProperties: React.FC<DropdownPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  // Handle field.options (which might be the actual list of choices) vs field.options (settings)
  // Actually in my Type definition `options` property on Field is for settings?
  // Let's check `types/index.ts` again.
  // `options?: any` is distinct from `validation?: any`.
  // But wait, where are the *choices* stored?
  // In `PropertiesPanel.tsx` (line 498), it uses `selectedField.options` as the array of choices.
  // And `field.options` usually stores settings in other fields (like `width`, `shrink`).
  // This is a collision in my previous understanding or the codebase.
  // Let's look at `SelectField.tsx`: `field.options` is used as the list of choices.
  // So I might need to store settings in `field.validation` or a new property if `field.options` is taken.
  // OR `field.options` is an object containing `choices` and settings?
  // Re-reading `SelectField.tsx`: 
  // `if (Array.isArray(field.options)) { ... }`
  // So `field.options` IS the list of choices.
  // This means I cannot store `shrink`, `width` etc in `field.options` directly if it's an array.
  // I should check `TextField` uses `field.options` as an object.
  // For `SelectField`, I probably need to migrate `field.options` to be an object containing `choices: []` AND settings.
  // OR store settings in `field.validation` (which is `any`).
  // Let's check `TextField.tsx` again. usage: `const { options = {} } = field; const { width, ... } = options;`
  // `SelectField.tsx`: `if (Array.isArray(field.options))`
  
  // DECISION: To avoid breaking existing structure too much, I will use `field.validation` for settings for now, 
  // OR I should refactor `field.options` for Dropdown to be `{ choices: [], ...settings }`.
  // Refactoring might break existing previews if they expect an array.
  // Let's look at `PropertiesPanel.tsx` existing code for Dropdown options editing (lines 488-524).
  // It writes purely to `options` as an array of objects.
  
  // The safest bet for "Layout/Behavior" properties (shrink, hidden, width) is `field.validation` 
  // if `field.options` is occupied by data.
  // HOWEVER, consistency is better.
  // If I look at `TextAreaField`, `options` has `rows`, `cols`.
  // If I look at `TextField`, `options` has `width`.
  
  // I will proceed by assuming I can store settings in `field.validation` for Dropdown specific settings 
  // to avoid conflicting with the `options` array, 
  // OR I should change `options` to contain `items` array.
  // Let's stick to `field.validation` for "settings" for Dropdown to start with, 
  // regarding `shrink`, `hidden`, `width`, `multiple`, `shuffle`.
  // Wait, `ParagraphProperties` used `options` for `shrink`, `hidden`.
  // `TextField` used `options`.
  
  // Use `field.extra`? No `extra` in type.
  // `field.items`? No.
  
  // Okay, I will try to support `field.options` being HYBRID or use `field.validation` for now.
  // Actually, standardizing `field.options` to ALWAYS be an object `{ items: [], ...settings }` is best long term.
  // But strictly for this task without refactoring everything:
  // I'll use `field.validation` for property settings (Width, Shrink, etc) for Dropdown, 
  // and keep `field.options` as the Array of items.
  
  // ... Wait, `PropertiesPanel.tsx` logic for "Options (one per line)" writes to `field.options`.
  
  // We will now prioritize `options` for all settings to be consistent with other fields.
  // `PreviewSelectField` has been updated to support this.
  const options = Array.isArray(field.options) ? { items: field.options } : (field.options || {});
  const validation = field.validation || {};
  
  const handleUpdate = (updates: any) => {
    updateField(field.id, updates);
  };

  const handleValidationUpdate = (key: string, value: any) => {
    handleUpdate({
      validation: {
        ...validation,
        [key]: value,
      },
    });
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
    const newItems = text.split('\n').filter(line => line.trim()).map(line => {
        const [label, value] = line.split(':');
        return {
            label: label?.trim() || value?.trim() || '',
            value: value?.trim() || label?.trim() || '',
        };
    });
    
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
      <div className="flex items-center gap-1 mb-4 bg-gray-100 p-1 rounded-md">
        {['general', 'options', 'advanced'].map((tab) => (
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
              />
              <p className="mt-1 text-xs text-gray-500">
                Add a short description below the field
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
               DUPLICATE
             </button>
        </div>
      )}

      {activeTab === 'options' && (
        <div className="space-y-6">
            {/* Width */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Width
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
                        placeholder="Width in px"
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                The width of this field will change according to your form's width.
              </p>
            </div>

            {/* Options List */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                 Options
               </label>
               <div className="border border-gray-400 rounded-md overflow-hidden bg-white">
                  <textarea
                    value={optionsList.map((opt: any) => opt.label === opt.value ? opt.label : `${opt.label}:${opt.value}`).join('\n')}
                    onChange={(e) => handleOptionsListChange(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 focus:outline-none resize-y text-sm"
                    placeholder="Option 1&#10;Option 2&#10;Option 3: value3"
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
                            thai_provinces: ['กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'],
                            days_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                            days_thai: ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'],
                            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                            months_thai: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
                            yes_no: ['Yes', 'No'],
                            yes_no_thai: ['ใช่', 'ไม่ใช่'],
                            gender: ['Male', 'Female', 'Other', 'Prefer not to say'],
                            gender_thai: ['ชาย', 'หญิง', 'อื่นๆ', 'ไม่ระบุ'],
                            education: ['Primary School', 'Secondary School', 'High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other'],
                            education_thai: ['ประถมศึกษา', 'มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'อื่นๆ'],
                            age_ranges: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
                            rating_1_5: ['1', '2', '3', '4', '5'],
                            rating_1_10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                            satisfaction: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
                            satisfaction_thai: ['ไม่พอใจมาก', 'ไม่พอใจ', 'ปานกลาง', 'พอใจ', 'พอใจมาก'],
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
                            <SelectItem value="thai_provinces">Thai Provinces (77)</SelectItem>
                            <SelectItem value="days_thai">Days of Week (Thai)</SelectItem>
                            <SelectItem value="months_thai">Months (Thai)</SelectItem>
                            <SelectItem value="yes_no_thai">Yes/No (Thai)</SelectItem>
                            <SelectItem value="gender_thai">Gender (Thai)</SelectItem>
                            <SelectItem value="education_thai">Education Level (Thai)</SelectItem>
                            <SelectItem value="satisfaction_thai">Satisfaction (Thai)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>English</SelectLabel>
                            <SelectItem value="days_of_week">Days of Week</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="yes_no">Yes/No</SelectItem>
                            <SelectItem value="gender">Gender</SelectItem>
                            <SelectItem value="education">Education Level</SelectItem>
                            <SelectItem value="satisfaction">Satisfaction</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Numbers</SelectLabel>
                            <SelectItem value="age_ranges">Age Ranges</SelectItem>
                            <SelectItem value="rating_1_5">Rating 1-5</SelectItem>
                            <SelectItem value="rating_1_10">Rating 1-10</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Select to replace current options with a predefined list
                </p>
            </div>

            {/* Default Value */}
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Default Value
                </label>
                <Select 
                    value={options.defaultValue || ''} 
                    onValueChange={(val) => handleOptionUpdate('defaultValue', val)}
                >
                    <SelectTrigger className="w-full bg-white border-gray-400">
                        <SelectValue placeholder="Select a default..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_no_default_">No Default</SelectItem>
                        {optionsList.map((opt: any, idx: number) => (
                            <SelectItem key={idx} value={opt.value}>
                                {opt.label || opt.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="mt-1 text-xs text-gray-500">
                 Choose an option to be selected by default
                </p>
            </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Multiple Selections */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Multiple Selections
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.multiple || false}
                    onChange={(e) => handleOptionUpdate('multiple', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 after:ease-in-out after:shadow-sm peer-checked:bg-black"></div>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                 Let users select multiple options
               </p>
            </div>

            {/* Visible Options (Rows) - Only relevant if multiple is true usually, or if converting to listbox */}
             {options.multiple && (
                <div>
                    <label className="block text-sm font-medium text-black mb-1">
                        Visible Options
                    </label>
                    <div className="flex items-center gap-2">
                         <input
                            type="number"
                            value={options.rows || 4}
                            onChange={(e) => handleOptionUpdate('rows', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
                        />
                         <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600">ROWS</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Show multiple options directly instead of in a dropdown
                    </p>
                </div>
             )}

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

             {/* Shrink */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                Shrink
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
