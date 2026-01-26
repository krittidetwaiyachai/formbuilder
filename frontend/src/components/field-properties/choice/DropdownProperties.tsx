import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/custom-select';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';

interface DropdownPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id'>) => void;
}

export const DropdownProperties: React.FC<DropdownPropertiesProps> = ({ field, updateField, duplicatesField }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'options' | 'advanced'>('general');

  
  
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

  
  const optionsList = Array.isArray(field.options) ? field.options : ((field.options as any)?.items || []);
  
  const handleOptionsListChange = (text: string) => {
    const newItems = text.split('\n').filter(line => line.trim()).map(line => {
        const [label, value] = line.split(':');
        return {
            label: label?.trim() || value?.trim() || '',
            value: value?.trim() || label?.trim() || '',
        };
    });
    
    
    const currentOptions = Array.isArray(field.options) ? {} : field.options;
    
    handleUpdate({ 
        options: Array.isArray(field.options) 
            ? { items: newItems }
            : { ...currentOptions, items: newItems }
    });
  };
 
  return (
    <div className="space-y-4">
      { }
      <PropertiesTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'general' && (
        <div className="space-y-4">
           { }
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

            { }
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
                      ((field.options as any)?.labelAlignment === align) || (!(field.options as any)?.labelAlignment && align === 'TOP')
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'LEFT' ? t('builder.properties.left') : align === 'CENTER' ? t('builder.properties.center') : t('builder.properties.top')}
                  </button>
                ))}
              </div>
            </div>

            { }
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

            { }
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

             { }
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
            { }
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
                        placeholder={t('builder.properties.width') + " (px)"}
                    />
                 </div>
              )}
               <p className="mt-1 text-xs text-gray-500">
                {t('builder.properties.width_desc')}
              </p>
            </div>

            { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                 {t('builder.properties.options')}
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
                 {t('builder.properties.options_desc')}
               </p>
            </div>
            
             { }
             <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('builder.properties.predefined_options')}
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
                        <SelectValue placeholder={t('builder.properties.select_predefined')} />
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
                  {t('builder.properties.predefined_desc')}
                </p>
            </div>

            { }
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('builder.properties.default_value')}
                </label>
                <Select 
                    value={options.defaultValue || ''} 
                    onValueChange={(val) => handleOptionUpdate('defaultValue', val)}
                >
                    <SelectTrigger className="w-full bg-white border-gray-400">
                        <SelectValue placeholder={t('builder.properties.select_default')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_no_default_">{t('builder.properties.no_default')}</SelectItem>
                        {optionsList.map((opt: any, idx: number) => (
                            <SelectItem key={idx} value={opt.value}>
                                {opt.label || opt.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="mt-1 text-xs text-gray-500">
                 {t('builder.properties.default_value_select_desc')}
                </p>
            </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.multiple_selections')}
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
                {t('builder.properties.multiple_selections_desc')}
              </p>
            </div>

            { }
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.shuffle_options')}
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
                 {t('builder.properties.shuffle_options_desc')}
               </p>
            </div>

             { }
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

            { }
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
            
             { }
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
            </div>

        </div>
      )}
    </div>
  );
};
