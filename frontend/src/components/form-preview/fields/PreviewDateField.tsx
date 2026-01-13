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

export const PreviewDateField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
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
  
  // Helper to render label
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="date"
              id={fieldName}
              readOnly={readOnly}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Clock className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="time"
              id={fieldName}
              readOnly={readOnly}
              {...register(fieldName, {
                required: field.required ? `${field.label} is required` : false,
              })}
              className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
