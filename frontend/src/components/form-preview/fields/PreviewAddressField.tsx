import React from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';
import { AddressInput } from './components/AddressInput';
import { AddressProvinceSelect } from './components/AddressProvinceSelect';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export const PreviewAddressField: React.FC<PreviewFieldProps> = ({
  field,
  register,
  errors,
  questionNumber,
  isPublic,
}) => {
  const { t } = useTranslation();
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
    stateInputType = 'text',
  } = options;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const getBaseInputClass = (hasIcon: boolean = false) => {
    if (isPublic) {
      return `w-full px-4 ${
        shrink ? 'py-2 text-base' : 'py-3 text-base'
      } border placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:border-[color:var(--primary)] transition-all hover:border-gray-300`;
    }
    const padding = hasIcon ? 'pl-10 pr-4' : 'px-4';
    return `w-full ${padding} py-3 border-2 border-gray-300 bg-white text-black text-sm shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all`;
  };

  const inputStyle = isPublic
    ? {
        color: 'var(--text)',
        backgroundColor: 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        borderRadius: 'var(--radius)',
      }
    : {};

  const renderStateInput = () => {
    if (stateInputType === 'thai_provinces') {
      return (
        <AddressProvinceSelect
          fieldName={fieldName}
          register={register}
          isPublic={isPublic}
          sublabel={sublabels.state}
          inputClass={getBaseInputClass(false)}
          inputStyle={inputStyle}
        />
      );
    }
    return (
      <AddressInput
        id={`${fieldName}_state`}
        name={`${fieldName}_state`}
        label={sublabels.state || t('public.address.state', 'State / Province')}
        placeholder={placeholders.state}
        defaultLabel={t('public.address.state', 'State / Province')}
        isPublic={isPublic}
        register={register}
        inputClass={getBaseInputClass(false)}
        inputStyle={inputStyle}
        errorMessage={errors[`${fieldName}_state`]?.message}
      />
    );
  };

  const streetDefault = t('public.address.street', 'Street Address');

  return (
    <div
      className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`}
      title={hoverText}
    >
      <div
        className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${
          labelAlignment === 'RIGHT' ? 'text-right' : ''
        }`}
      >
        <PreviewLabel
          field={field}
          questionNumber={questionNumber}
          isPublic={isPublic}
          htmlFor={fieldName}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="space-y-3">
          {showStreet && (
            <AddressInput
              id={`${fieldName}_street`}
              name={`${fieldName}_street`}
              label={sublabels.street || streetDefault}
              placeholder={placeholders.street}
              defaultLabel={streetDefault}
              isPublic={isPublic}
              isRequired={field.required}
              register={register}
              inputClass={getBaseInputClass(!isPublic)}
              inputStyle={inputStyle}
              errorMessage={errors[`${fieldName}_street`]?.message}
              startIcon={
                !isPublic ? (
                  <MapPin className="h-4 w-4 text-gray-400" />
                ) : undefined
              }
            />
          )}

          {showStreet2 && (
            <AddressInput
              id={`${fieldName}_street2`}
              name={`${fieldName}_street2`}
              label={sublabels.street2 || t('public.address.street2', 'Street Address Line 2')}
              placeholder={placeholders.street2}
              defaultLabel={t('public.address.street2', 'Street Address Line 2')}
              isPublic={isPublic}
              register={register}
              inputClass={getBaseInputClass(false)}
              inputStyle={inputStyle}
              errorMessage={errors[`${fieldName}_street2`]?.message}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            {showCity && (
              <AddressInput
                id={`${fieldName}_city`}
                name={`${fieldName}_city`}
                label={sublabels.city || t('public.address.city', 'City')}
                placeholder={placeholders.city}
                defaultLabel={t('public.address.city', 'City')}
                isPublic={isPublic}
                isRequired={field.required}
                register={register}
                inputClass={getBaseInputClass(false)}
                inputStyle={inputStyle}
                errorMessage={errors[`${fieldName}_city`]?.message}
              />
            )}
            {showState && renderStateInput()}
          </div>

          <div
            className={`grid ${
              showCountry ? 'grid-cols-2' : 'grid-cols-1'
            } gap-3`}
          >
            {showZip && (
              <AddressInput
                id={`${fieldName}_zip`}
                name={`${fieldName}_zip`}
                label={sublabels.zip || t('public.address.zip', 'Postal / Zip Code')}
                placeholder={placeholders.zip}
                defaultLabel={t('public.address.zip', 'Postal / Zip Code')}
                isPublic={isPublic}
                isRequired={field.required}
                register={register}
                inputClass={getBaseInputClass(false)}
                inputStyle={inputStyle}
                errorMessage={errors[`${fieldName}_zip`]?.message}
              />
            )}
            {showCountry && (
              <AddressInput
                id={`${fieldName}_country`}
                name={`${fieldName}_country`}
                label={sublabels.country || t('public.address.country', 'Country')}
                placeholder={placeholders.country}
                defaultLabel={t('public.address.country', 'Country')}
                isPublic={isPublic}
                isRequired={field.required}
                register={register}
                inputClass={getBaseInputClass(false)}
                inputStyle={inputStyle}
                errorMessage={errors[`${fieldName}_country`]?.message}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
