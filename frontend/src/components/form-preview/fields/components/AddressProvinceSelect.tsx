import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { THAI_PROVINCES } from '@/utils/thai-provinces';

interface AddressProvinceSelectProps {
  fieldName: string;
  register: UseFormRegister<any>;
  isPublic?: boolean;
  sublabel?: string;
  inputClass: string;
  inputStyle: React.CSSProperties;
}

import { useTranslation } from 'react-i18next';

export const AddressProvinceSelect: React.FC<AddressProvinceSelectProps> = ({
  fieldName,
  register,
  isPublic,
  sublabel,
  inputClass,
  inputStyle,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultLabel = t('public.address.province', 'Province');
  const currentLabel = sublabel || defaultLabel;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProvinces = THAI_PROVINCES.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (province: string) => {
    setSelected(province);
    setSearch('');
    setShowDropdown(false);
  };

  return (
    <div className="flex-1 relative" ref={dropdownRef}>
      <input type="hidden" {...register(`${fieldName}_state`)} value={selected} />
      <input
        type="text"
        value={search || selected}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={t('public.address.search_province', 'Search province...')}
        className={inputClass}
        style={inputStyle}
      />
      {showDropdown && (
        <div 
          className="absolute z-50 w-full mt-1 border shadow-lg max-h-60 overflow-y-auto backdrop-blur-xl"
          style={{
            backgroundColor: isPublic ? 'var(--card-bg)' : '#ffffff',
            borderColor: isPublic ? 'var(--input-border)' : '#e5e7eb', 
            borderRadius: isPublic ? 'var(--radius)' : '0.5rem',
            color: isPublic ? 'var(--text)' : '#000000'
          }}
        >
          {filteredProvinces.length > 0 ? (
            filteredProvinces.map((province) => (
              <button
                key={province}
                type="button"
                onClick={() => handleSelect(province)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-black/5 ${
                  selected === province ? 'bg-black/5 font-medium' : ''
                }`}
              >
                {province}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm opacity-50">{t('public.filter.no_results', 'No results found')}</div>
          )}
        </div>
      )}
      {isPublic && currentLabel !== defaultLabel && (
        <p className="mt-1 text-xs text-gray-400">{currentLabel}</p>
      )}
    </div>
  );
};
