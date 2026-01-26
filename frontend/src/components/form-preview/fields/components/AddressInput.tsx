import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface AddressInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  defaultLabel: string;
  isPublic?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
  startIcon?: React.ReactNode;
  register: UseFormRegister<any>;
  inputClass: string;
  inputStyle: React.CSSProperties;
}

import { useTranslation } from 'react-i18next';

export const AddressInput: React.FC<AddressInputProps> = ({
  id,
  name,
  label,
  placeholder,
  defaultLabel,
  isPublic,
  isRequired,
  errorMessage,
  startIcon,
  register,
  inputClass,
  inputStyle,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1">
      <div className="relative">
        {startIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 mt-1 pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          type="text"
          id={id}
          {...register(name, {
            required: isRequired ? t('public.validation.required_field', { label }) : false,
          })}
          placeholder={placeholder || label}
          className={inputClass}
          style={inputStyle}
        />
      </div>
      {isPublic && label !== defaultLabel && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text)', opacity: 0.6 }}>{label}</p>
      )}
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};
