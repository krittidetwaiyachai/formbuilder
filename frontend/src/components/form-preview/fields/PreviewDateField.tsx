import React from 'react';
import { Field, FieldType } from '@/types';
import { useForm } from 'react-hook-form';
import { Calendar, Clock } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

import { useTranslation } from 'react-i18next';
import { stripHtml } from '@/lib/ui/utils';

export const PreviewDateField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];

  const validation = field.validation || {};
  const optionsSettings = (field.options && !Array.isArray(field.options)) ? field.options : {};
  
  const { 
    labelAlignment = 'TOP', 
    hoverText, 
    subLabel,
    readOnly,
    hidden
  } = { ...validation, ...optionsSettings };

  if (hidden) return null;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';
  
  
  const renderLabel = () => (
     <div className={`${isRowLayout ? 'min-w-[150px]' : 'mb-2'}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
        {subLabel && <p className="text-xs text-gray-500 mb-2">{subLabel}</p>}
     </div>
  );

  if (field.type === FieldType.DATE) {
       return (
        <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
          {renderLabel()}
          <div className="relative w-full">
            {!isPublic && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Calendar className="h-4 w-4" style={{ color: 'var(--text)', opacity: 0.6 }} />
              </div>
            )}
            <input
              type="date"
              id={fieldName}
              readOnly={readOnly}
              {...register(fieldName, {
                required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false,
              })}
              style={{ 
                color: 'var(--text)', 
                backgroundColor: 'var(--input-bg)', 
                borderColor: 'var(--input-border)',
                accentColor: 'var(--primary)',
                colorScheme: 'var(--color-scheme, light)'
              }}
              className={`w-full ${isPublic ? 'px-4' : 'pl-10 pr-4'} py-3 border rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
             {fieldError && (
                <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
             )}
          </div>
        </div>
      );
  }

  if (field.type === FieldType.TIME) {
       return (
        <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`} title={hoverText}>
          {renderLabel()}
          <div className="relative w-full">
            {!isPublic && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Clock className="h-4 w-4" style={{ color: 'var(--text)', opacity: 0.6 }} />
              </div>
            )}
            <input
              type="time"
              id={fieldName}
              readOnly={readOnly}
              {...register(fieldName, {
                required: field.required ? t('public.validation.required_field', { label: stripHtml(field.label) }) : false,
              })}
              style={{ color: 'var(--text)', backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
              className={`w-full ${isPublic ? 'px-4' : 'pl-10 pr-4'} py-3 border rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {fieldError && (
                <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>
             )}
          </div>
        </div>
      );
  }

  return null;
};
