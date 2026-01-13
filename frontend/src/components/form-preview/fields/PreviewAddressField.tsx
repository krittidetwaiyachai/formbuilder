import React, { useState } from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
  'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
  'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา',
  'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม',
  'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี',
  'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
  'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

export const PreviewAddressField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const fieldName = `field_${field.id}`;

  const options = field.options || {};
  const { 
    labelAlignment = 'TOP', 
    sublabels = {}, 
    placeholders = {}, 
    hoverText, 
    shrink,
    showStreet = true,
    showStreet2 = true,
    showCity = true,
    showState = true,
    showZip = true,
    showCountry = true,
    stateInputType = 'text'
  } = options;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const inputClass = isPublic
    ? `w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300`
    : `w-full px-4 py-3 border-2 border-gray-300 bg-white text-black text-sm shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all`;

  const renderInput = (name: string, placeholder: string, sublabel: string, defaultSublabel: string, required = false) => (
    <div className="flex-1">
      <input
        type="text"
        id={`${fieldName}_${name}`}
        {...register(`${fieldName}_${name}`, {
          required: required && field.required ? `${sublabel} is required` : false,
        })}
        placeholder={placeholder || sublabel}
        className={inputClass}
      />
      {isPublic && sublabel !== defaultSublabel && (
        <p className="mt-1 text-xs text-gray-400">{sublabel}</p>
      )}
      {errors[`${fieldName}_${name}`] && (
        <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_${name}`].message}</p>
      )}
    </div>
  );

  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const provinceDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target as Node)) {
        setShowProvinceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProvinces = THAI_PROVINCES.filter((p: string) =>
    p.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const renderStateInput = () => {
    if (stateInputType === 'thai_provinces') {
      const defaultStateLabel = 'Province';
      const currentStateLabel = sublabels.state || defaultStateLabel;
      
      return (
        <div className="flex-1 relative" ref={provinceDropdownRef}>
          <input type="hidden" {...register(`${fieldName}_state`)} value={selectedProvince} />
          <input
            type="text"
            value={provinceSearch || selectedProvince}
            onChange={(e) => {
              setProvinceSearch(e.target.value);
              setShowProvinceDropdown(true);
            }}
            onFocus={() => setShowProvinceDropdown(true)}
            placeholder="Search province..."
            className={inputClass}
          />
          {showProvinceDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProvinces.length > 0 ? (
                filteredProvinces.map((province: string) => (
                  <button
                    key={province}
                    type="button"
                    onClick={() => {
                      setSelectedProvince(province);
                      setProvinceSearch('');
                      setShowProvinceDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${
                      selectedProvince === province ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {province}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
              )}
            </div>
          )}
          {isPublic && currentStateLabel !== defaultStateLabel && (
            <p className="mt-1 text-xs text-gray-400">{currentStateLabel}</p>
          )}
        </div>
      );
    }
    return renderInput('state', placeholders.state, sublabels.state || 'State / Province', 'State / Province');
  };

  const streetDefault = 'Street Address';
  
  return (
    <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="space-y-3">
          {showStreet && (
            <div className="relative">
              {!isPublic && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 mt-1 pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <input
                type="text"
                id={`${fieldName}_street`}
                {...register(`${fieldName}_street`, {
                  required: field.required ? 'Street address is required' : false,
                })}
                placeholder={placeholders.street || sublabels.street || streetDefault}
                className={isPublic ? inputClass : `w-full pl-10 pr-4 py-3 border-2 border-gray-300 bg-white text-black text-sm shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all`}
              />
              {isPublic && (sublabels.street || streetDefault) !== streetDefault && (
                <p className="mt-1 text-xs text-gray-400">{sublabels.street}</p>
              )}
               {errors[`${fieldName}_street`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_street`].message}</p>
              )}
            </div>
          )}

          {showStreet2 && renderInput('street2', placeholders.street2, sublabels.street2 || 'Street Address Line 2', 'Street Address Line 2')}

          <div className={`grid ${isPublic ? 'grid-cols-2' : 'grid-cols-2'} gap-3`}>
            {showCity && renderInput('city', placeholders.city, sublabels.city || 'City', 'City')}
            {showState && renderStateInput()}
          </div>

          <div className={`grid ${showCountry ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {showZip && renderInput('zip', placeholders.zip, sublabels.zip || 'Postal / Zip Code', 'Postal / Zip Code')}
            {showCountry && renderInput('country', placeholders.country, sublabels.country || 'Country', 'Country')}
          </div>
        </div>
      </div>
    </div>
  );
};
