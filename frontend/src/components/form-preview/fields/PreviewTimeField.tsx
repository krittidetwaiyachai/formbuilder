import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  control?: any;
  watch?: any;
  questionNumber?: number;
  isPublic?: boolean;
}

import { useTranslation } from 'react-i18next';
import { stripHtml } from '@/lib/ui/utils';

export const PreviewTimeField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const { t } = useTranslation();
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  
  const options = field.options || {};

  
  const labelAlignment = options.labelAlignment || 'TOP';
  const subLabelHour = options.subLabelHour || t('public.time.hour', 'Hour');
  const subLabelMinutes = options.subLabelMinutes || t('public.time.minute', 'Minutes');
  const timeFormat = options.timeFormat || 'AMPM'; 
  const timeRange = options.timeRange || false;
  const hoverText = options.hoverText;
  const readOnly = options.readOnly;
  
  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  
  const inputStyle = isPublic 
    ? { 
        color: 'var(--text)', 
        backgroundColor: 'var(--input-bg)', 
        borderColor: 'var(--input-border)',
        accentColor: 'var(--primary)',
        colorScheme: 'var(--color-scheme, light)'
      } 
    : {};

  const TimeInputGroup = ({ prefix = '' }) => (
      <div className="flex items-start gap-2">
            <div>
               <input
                type="number"
                placeholder={t('common.time.hour_placeholder')}
                readOnly={readOnly}
                min={1}
                max={timeFormat === '24HOUR' ? 23 : 12}
                {...register(`${fieldName}${prefix}_hour`, { required: field.required })}
                style={inputStyle}
                className={`w-16 px-3 py-3 border ${fieldError ? 'border-red-500 bg-red-50' : isPublic ? '' : 'border-gray-300 bg-white'} rounded-lg text-center text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
               />
               <label className="block text-xs mt-1 text-center" style={{ color: 'var(--text)', opacity: 0.6 }}>{subLabelHour}</label>
           </div>
           <span className="font-bold mt-3" style={{ color: 'var(--text)', opacity: 0.5 }}>:</span>
           <div>
               <input
                type="number"
                placeholder={t('common.time.minute_placeholder')}
                readOnly={readOnly}
                min={0}
                max={59}
                {...register(`${fieldName}${prefix}_minute`, { required: field.required })}
                style={inputStyle}
                className={`w-16 px-3 py-3 border ${fieldError ? 'border-red-500 bg-red-50' : isPublic ? '' : 'border-gray-300 bg-white'} rounded-lg text-center text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
               />
                <label className="block text-xs mt-1 text-center" style={{ color: 'var(--text)', opacity: 0.6 }}>{subLabelMinutes}</label>
           </div>
           {timeFormat === 'AMPM' && (
               <div>
                    <select 
                        disabled={readOnly}
                        {...register(`${fieldName}${prefix}_ampm`)}
                        style={inputStyle}
                        className={`h-[48px] px-2 border ${fieldError ? 'border-red-500 bg-red-50' : isPublic ? '' : 'border-gray-300 bg-white'} rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
               </div>
           )}
           <div className="mt-3 ml-2">
             <Clock className="w-5 h-5" style={{ color: 'var(--text)', opacity: 0.5 }} />
           </div>
      </div>
  );

  return (
    <div className={`mb-4 ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-2'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
        {options.subLabel && options.subLabel !== 'Sublabel' && (
            <p className="mt-1 text-xs text-gray-500">{stripHtml(options.subLabel)}</p>
        )}
      </div>

      <div className={`flex-1 min-w-0`} title={hoverText}>
        <div className="flex flex-col gap-4">
            <TimeInputGroup />
            {timeRange && (
                <>
                   <div className="text-xs font-bold text-gray-500 uppercase">{t('public.time.to', 'to')}</div>
                   <TimeInputGroup prefix="_end" />
                </>
            )}
        </div>
        {fieldError && (
          <p className="mt-1 text-sm text-red-600">{t('public.validation.required_field', { label: field.label })}</p>
        )}
      </div>
    </div>
  );
};
