import React from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
}

export const PreviewFullNameField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic }) => {
  const fieldName = `field_${field.id}`;
  const { updateField } = useFormStore();

  const options = field.options || {};
  const { 
    labelAlignment = 'TOP', 
    sublabels = {}, 
    placeholders = {}, 
    hoverText, 
    readOnly, 
    shrink, 
    showMiddleName, 
    showPrefix, 
    showSuffix 
  } = options;

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const inputClass = isPublic
    ? `flex-1 px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all hover:border-gray-300 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`
    : `flex-1 pl-10 pr-4 py-3 border-2 border-gray-300 bg-white text-black text-sm shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`;

  const handleSubLabelBlur = (key: string, e: React.FormEvent<HTMLDivElement>) => {
    if (isPublic) return;
    const text = e.currentTarget.innerText;
    updateField(field.id, {
        options: {
            ...options,
            sublabels: {
                ...sublabels,
                [key]: text
            }
        }
    });
  };

  const renderInput = (name: string, placeholder: string, sublabel: string, defaultSublabel: string) => (
    <div className="flex-1">
      <div className="relative" title={hoverText}>
        {!isPublic && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          type="text"
          id={`${fieldName}_${name}`}
          {...register(`${fieldName}_${name}`, {
            required: field.required ? `${sublabel} is required` : false,
          })}
          placeholder={placeholder || sublabel}
          readOnly={readOnly}
          className={inputClass}
        />
      </div>
      
      {/* Builder Mode: Editable Sublabel */}
      {!isPublic && (
         <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            className="mt-1 text-xs text-gray-500 font-normal outline-none focus:outline-none focus:ring-0 border border-transparent hover:border-gray-200 rounded px-1 transition-colors empty:before:content-['Type_sublabel...']"
            onBlur={(e) => handleSubLabelBlur(name, e)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()} // Prevent DnD/Selection interference
            dangerouslySetInnerHTML={{ __html: sublabels[name] || defaultSublabel }}
         />
      )}

      {/* Public Mode: Static Sublabel (Smart Hide) */}
      {isPublic && sublabel !== defaultSublabel && (
        <p className="mt-1 text-xs text-gray-400">{sublabel}</p>
      )}

      {errors[`${fieldName}_${name}`] && (
        <p className="mt-1 text-sm text-red-600">{errors[`${fieldName}_${name}`].message}</p>
      )}
    </div>
  );

  return (
    <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
      </div>

      <div className="flex-1 min-w-0">
        <div className={`flex ${isPublic ? 'gap-4' : 'gap-3'} flex-wrap`}>
          {showPrefix && renderInput('prefix', placeholders.prefix, sublabels.prefix || 'Prefix', 'Prefix')}
          {renderInput('first', placeholders.first, sublabels.first || 'First Name', 'First Name')}
          {showMiddleName && renderInput('middle', placeholders.middle, sublabels.middle || 'Middle Name', 'Middle Name')}
          {renderInput('last', placeholders.last, sublabels.last || 'Last Name', 'Last Name')}
          {showSuffix && renderInput('suffix', placeholders.suffix, sublabels.suffix || 'Suffix', 'Suffix')}
        </div>
      </div>
    </div>
  );
};
