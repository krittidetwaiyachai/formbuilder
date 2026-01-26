import React, { useMemo } from 'react';
import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/custom-select';
import { PreviewLabel } from '../PreviewLabel';
import { stripHtml } from '@/lib/ui/utils';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  watch: ReturnType<typeof useForm>['watch'];
  questionNumber?: number;
  isPublic?: boolean;
  setValue?: ReturnType<typeof useForm>['setValue'];
}

import { useTranslation } from 'react-i18next';

export const PreviewSelectField: React.FC<PreviewFieldProps> = ({ field, register, errors, watch, questionNumber, isPublic, setValue }) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  const currentValue = watch(fieldName);

  const validation = field.validation || {};
  const optionsSettings = (field.options && !Array.isArray(field.options)) ? field.options : {};
  
  
  const { 
    labelAlignment = 'TOP', 
    subLabel, 
    width, 
    customWidth, 
    hoverText, 
    shrink, 
    shuffle, 
    defaultValue,
    multiple,
    rows,
    spreadToColumns,
    columns,
    otherOption,
    readOnly,
    minSelections,
    maxSelections
  } = { ...validation, ...optionsSettings };

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const getOptions = (): { label: string; value: string }[] => {
    let rawOptions: any[] = [];
    
    if (Array.isArray(field.options)) {
        rawOptions = field.options;
    } else if (typeof field.options === 'object' && field.options !== null) {
        if (Array.isArray((field.options as any).options)) {
            rawOptions = (field.options as any).options;
        } else if (Array.isArray((field.options as any).items)) {
            rawOptions = (field.options as any).items;
        }
    }

    if (!rawOptions) return [];

    return rawOptions.map((opt: any) => {
        if (typeof opt === 'string') {
            return { label: opt, value: opt };
        }
        if (typeof opt === 'object' && opt !== null) {
            return {
                label: opt.label || opt.value || '',
                value: opt.value || opt.label || ''
            };
        }
        return { label: String(opt), value: String(opt) };
    });
  };

  const options = getOptions();

  const displayOptions = useMemo(() => {
    if (shuffle) {
      return [...options].sort(() => Math.random() - 0.5);
    }
    return options;
  }, [options, shuffle]);

  if (field.type === FieldType.DROPDOWN) {
    const showAsList = multiple || (rows && rows > 1);

    if (!showAsList && setValue) {
        return (
            <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
                <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
                <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
                {subLabel && subLabel !== 'Sublabel' && (
                    <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
                )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="relative" style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}>
                        { }
                        <input 
                            type="hidden" 
                            {...register(fieldName, { required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false })} 
                        />
                        <Select 
                            value={currentValue || defaultValue || ''} 
                            onValueChange={(val) => {
                                setValue(fieldName, val, { shouldValidate: true });
                            }}
                        >
                            <SelectTrigger className={`w-full ${isPublic ? 'h-12 text-base px-4' : ''} ${shrink ? '' : ''}`}>
                                <SelectValue placeholder={field.placeholder || t('public.select.placeholder', 'Select an option...')} />
                            </SelectTrigger>
                            <SelectContent>
                                {displayOptions.map((opt: any, index: number) => (
                                    <SelectItem key={index} value={opt.value}>
                                        {opt.label || opt.value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {fieldError && (
                        <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
                    )}
                </div>
            </div>
        );
    }

    const selectClass = isPublic
      ? `w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border rounded-lg focus:outline-none focus:ring-2 transition-all hover:border-gray-300 appearance-none cursor-pointer ${showAsList ? 'overflow-y-auto' : ''}`
      : `w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg bg-white text-black text-sm shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${showAsList ? 'overflow-y-auto' : ''}`;

      const publicSelectStyle = isPublic ? { color: 'var(--text)', backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)' } : {};

    return (
      <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
        <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
          <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
          {subLabel && subLabel !== 'Sublabel' && (
            <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative" style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}>
            {!showAsList && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className={`h-5 w-5 ${isPublic ? '' : 'text-gray-500'}`} style={isPublic ? { color: 'var(--text)', opacity: 0.5 } : {}} />
              </div>
            )}
            <select
              id={fieldName}
              multiple={multiple}
              size={showAsList ? (rows || 4) : undefined}
              defaultValue={defaultValue || ''}
              {...register(fieldName, {
                required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false,
              })}
              className={selectClass}
              style={{ ...(showAsList ? { paddingRight: '1rem' } : {}), ...publicSelectStyle }}
            >
              {!multiple && !defaultValue && <option value="">{t('public.select.default_option', 'Select an option')}</option>}
              {displayOptions.map((opt: any, index: number) => (
                <option key={index} value={opt.value}>
                  {opt.label || opt.value}
                </option>
              ))}
            </select>
          </div>

          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      </div>
    );
  }

  if (field.type === FieldType.RADIO) {


    return (
      <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
        <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
          <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} />
          {subLabel && subLabel !== 'Sublabel' && (
            <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div 
            className={`${isPublic ? '' : 'p-4 bg-gray-50 rounded-lg border border-gray-200'} ${spreadToColumns ? 'grid gap-3' : 'space-y-3'}`} 
            style={spreadToColumns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}
          >
            {displayOptions.map((opt: any, index: number) => (
              <label key={index} className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="relative shrink-0">
                  <input
                    type="radio"
                    id={`${fieldName}_${index}`}
                    value={opt.value}
                    {...register(fieldName, {
                      required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false,
                    })}
                    disabled={readOnly}
                    onClick={() => {
                        if (currentValue === opt.value) {
                            setValue?.(fieldName, null, { shouldValidate: true });
                        }
                    }}
                    style={{
                        borderColor: currentValue === opt.value ? 'var(--primary)' : 'var(--input-border)',
                        backgroundColor: currentValue === opt.value ? 'var(--primary)' : 'transparent',
                        boxShadow: currentValue === opt.value ? 'inset 0 0 0 3px var(--card-bg)' : 'none',
                    }}
                    className={`w-5 h-5 border-2 appearance-none rounded-full cursor-pointer transition-all duration-200`}
                  />
                </div>
                <span className={`font-medium cursor-pointer ${isPublic && shrink ? 'text-sm' : 'text-sm'}`} style={isPublic ? { color: 'var(--text)' } : { color: '#374151' }}>{opt.label || opt.value}</span>
              </label>
            ))}
            {otherOption && (
              <label className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''} ${spreadToColumns ? 'col-span-full' : ''}`}>
                <div className="relative shrink-0">
                  <input
                    type="radio"
                    value="other"
                    {...register(fieldName, { required: field.required })}
                    onClick={() => {
                         if (currentValue === 'other') {
                             setValue?.(fieldName, null, { shouldValidate: true });
                         }
                    }}
                    style={{
                        borderColor: currentValue === 'other' ? 'var(--primary)' : 'var(--input-border)',
                        backgroundColor: currentValue === 'other' ? 'var(--primary)' : 'transparent',
                        boxShadow: currentValue === 'other' ? 'inset 0 0 0 3px var(--card-bg)' : 'none',
                    }}
                    className={`w-5 h-5 border-2 appearance-none rounded-full cursor-pointer transition-all duration-200`}
                  />
                </div>
                <span className="text-sm font-medium cursor-pointer whitespace-nowrap" style={isPublic ? { color: 'var(--text)' } : { color: '#374151' }}>{t('public.select.other', 'Other:')}</span>
                <input 
                  type="text" 
                  className="flex-1 border-b border-gray-300 focus:border-black outline-none text-sm py-1 bg-transparent"
                  placeholder={t('public.select.please_specify', "Please specify")}
                  disabled={readOnly}
                  onClick={(e) => e.stopPropagation()} 
                />
              </label>
            )}
          </div>

          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      </div>
    );
  }

  if (field.type === FieldType.CHECKBOX) {
    const checkboxValue = currentValue || []; 
    const isChecked = (value: string) => {
      if (Array.isArray(checkboxValue)) {
        return checkboxValue.includes(value);
      }
      return false;
    };


    return (
      <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
        <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
          <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} />
          {subLabel && subLabel !== 'Sublabel' && (
            <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div 
            className={`${isPublic ? '' : 'p-4 bg-gray-50 rounded-lg border border-gray-200'} ${spreadToColumns ? 'grid gap-3' : 'space-y-3'}`} 
            style={spreadToColumns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}}
          >
            {displayOptions.map((opt: any, index: number) => (
              <label key={index} className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    id={`${fieldName}_${index}`}
                    value={opt.value}
                    {...register(fieldName, {
                      required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false,
                      validate: (value) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) {
                          return field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : true;
                        }
                        if (minSelections && value.length < minSelections) return t('public.validation.min_selections', { count: minSelections, defaultValue: `Please select at least ${minSelections} options` });
                        if (maxSelections && value.length > maxSelections) return t('public.validation.max_selections', { count: maxSelections, defaultValue: `Please select at most ${maxSelections} options` });
                        return true;
                      }
                    })}
                    disabled={readOnly}
                    style={{
                        borderColor: isChecked(opt.value) ? 'var(--primary)' : 'var(--input-border)',
                        backgroundColor: isChecked(opt.value) ? 'var(--primary)' : 'transparent',
                    }}
                    className={`w-5 h-5 border-2 rounded appearance-none cursor-pointer transition-all duration-200`}
                  />
                  {isChecked(opt.value) && (
                    <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium cursor-pointer ${isPublic && shrink ? 'text-sm' : 'text-sm'}`} style={isPublic ? { color: 'var(--text)' } : { color: '#374151' }}>{opt.label || opt.value}</span>
              </label>
            ))}
            {otherOption && (
              <label className={`flex items-center gap-3 cursor-pointer group ${readOnly ? 'opacity-60 pointer-events-none' : ''} ${spreadToColumns ? 'col-span-full' : ''}`}>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    value="other"
                    {...register(fieldName, { 
                      required: field.required,
                      validate: (value) => {
                        if (!value) return true;
                        if (minSelections && value.length < minSelections) return t('public.validation.min_selections', { count: minSelections, defaultValue: `Please select at least ${minSelections} options` });
                        if (maxSelections && value.length > maxSelections) return t('public.validation.max_selections', { count: maxSelections, defaultValue: `Please select at most ${maxSelections} options` });
                        return true;
                      }
                    })}
                    className={`w-5 h-5 border-2 border-gray-300 text-primary focus:ring-primary rounded appearance-none checked:bg-primary checked:border-primary cursor-pointer`}
                  />
                  {isChecked('other') && (
                    <svg className="absolute left-0.5 top-0.5 w-4 h-4 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium cursor-pointer whitespace-nowrap" style={isPublic ? { color: 'var(--text)' } : { color: '#374151' }}>{t('public.select.other', 'Other:')}</span>
                <input 
                  type="text" 
                  className="flex-1 border-b border-gray-300 focus:border-black outline-none text-sm py-1 bg-transparent"
                  placeholder={t('public.select.please_specify', "Please specify")}
                  disabled={readOnly}
                  onClick={(e) => e.stopPropagation()} 
                />
              </label>
            )}
          </div>

          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
};
