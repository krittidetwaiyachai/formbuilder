
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '@/types';
import { Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/custom-select';
import { stripHtml } from '@/lib/ui/utils';
import { PropertiesTabs } from '../common/PropertiesTabs';

interface RadioPropertiesProps {
  field: Field;
  updateField: (id: string, updates: Partial<Field>) => void;
  duplicatesField: (field: Omit<Field, 'id' | 'formId'>) => void;
}

export const RadioProperties = ({ field, updateField, duplicatesField }: RadioPropertiesProps) => {
  const { t } = useTranslation();
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
      <PropertiesTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tabs={['general', 'options', 'surveying', 'advanced']} 
      />

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
                placeholder={t('builder.properties.sublabel_desc')}
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
            {/* Options List */}
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
                    placeholder="Type option 1&#10;Type option 2"
                  />
               </div>
               <p className="mt-1 text-xs text-gray-500">
                 {t('builder.properties.options_desc')}
               </p>
            </div>
            
             {/* Predefined Options */}
             <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('builder.properties.predefined_options')}
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
                            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                            months_thai: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
                            education: ['Primary School', 'Secondary School', 'High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other'],
                            education_thai: ['ประถมศึกษา', 'มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'อื่นๆ'],
                            age_ranges: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
                            rating_1_5: ['1', '2', '3', '4', '5'],
                            rating_1_10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                            satisfaction: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
                            satisfaction_thai: ['ไม่พอใจมาก', 'ไม่พอใจ', 'ปานกลาง', 'พอใจ', 'พอใจมาก'],
                            agreement: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
                            agreement_thai: ['ไม่เห็นด้วยอย่างยิ่ง', 'ไม่เห็นด้วย', 'ปานกลาง', 'เห็นด้วย', 'เห็นด้วยอย่างยิ่ง'],
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
                        <SelectValue placeholder={t('builder.properties.select_predefined')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Thailand</SelectLabel>
                            <SelectItem value="yes_no_thai">Yes/No (Thai)</SelectItem>
                            <SelectItem value="gender_thai">Gender (Thai)</SelectItem>
                            <SelectItem value="days_thai">Days of Week (Thai)</SelectItem>
                            <SelectItem value="months_thai">Months (Thai)</SelectItem>
                            <SelectItem value="education_thai">Education Level (Thai)</SelectItem>
                            <SelectItem value="satisfaction_thai">Satisfaction (Thai)</SelectItem>
                            <SelectItem value="agreement_thai">Agreement (Thai)</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>English</SelectLabel>
                            <SelectItem value="yes_no">Yes/No</SelectItem>
                            <SelectItem value="gender">Gender</SelectItem>
                            <SelectItem value="days_of_week">Days of Week</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="education">Education Level</SelectItem>
                            <SelectItem value="satisfaction">Satisfaction</SelectItem>
                            <SelectItem value="agreement">Agreement</SelectItem>
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

            {/* Calculation Values */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.calculation_values')}
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
                  {t('builder.properties.calculation_values_desc')}
                </p>
            </div>

            {/* Display Other Option */}
             <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.display_other_option')}
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
                  {t('builder.properties.display_other_option_desc')}
                </p>
            </div>

             {/* Spread to Columns */}
            <div>
               <label className="block text-sm font-medium text-black mb-1">
                {t('builder.properties.spread_to_columns')}
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
                        {t('builder.properties.fixed_width')}
                   </span>
                 )}
               </div>
                 <p className="mt-1 text-xs text-gray-500">
                  {t('builder.properties.spread_to_columns_desc')}
                </p>
                 {options.spreadToColumns && (
                     <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('builder.properties.column_count')}</label>
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
               {/* Shuffle Options */}
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
                 {t('builder.properties.random_order_desc')}
               </p>
            </div>
           </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
            {/* Selected by Default */}
            <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {t('builder.properties.selected_by_default')}
                </label>
                 <Select 
                    value={options.defaultValue || ''} 
                    onValueChange={(val) => handleOptionUpdate('defaultValue', val)}
                >
                    <SelectTrigger className="w-full bg-white border-gray-400">
                        <SelectValue placeholder={t('builder.properties.select_default')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_no_default_">{t('builder.properties.no_selection')}</SelectItem>
                        {Array.isArray(field.options) && field.options.map((opt: any, idx: number) => (
                            <SelectItem key={idx} value={opt.value}>
                                {opt.label || opt.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="mt-1 text-xs text-gray-500">
                 {t('builder.properties.selected_by_default_desc')}
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
                  {t('builder.properties.hide_field_desc') || "Hide this field from the form"}
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
