import React, { useState, useEffect } from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { Star, Heart, Shield, Zap, Flag, ThumbsUp, Smile } from 'lucide-react';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  watch: ReturnType<typeof useForm>['watch'];
  setValue: ReturnType<typeof useForm>['setValue'];
}

export const PreviewRateField: React.FC<PreviewFieldProps> = ({ field, register, errors, watch, setValue }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  
  const options = field.options || {};
  const maxRating = options.maxRating || 5;
  const iconType = options.icon || 'star';
  const labelAlignment = options.labelAlignment || 'TOP';
  
  const hoverText = options.hoverText;

  const [rating, setRating] = useState<number | null>(null);
  const fieldValue = watch(fieldName);
  
  useEffect(() => {
    if (fieldValue) {
      setRating(Number(fieldValue));
    } else if (options.defaultValue) {
        setRating(options.defaultValue);
        setValue(fieldName, options.defaultValue.toString());
    }
  }, [fieldValue, options.defaultValue, setValue, fieldName]);

  const handleStarClick = (star: number) => {
    setRating(star);
    setValue(fieldName, star.toString(), { shouldValidate: true });
  };

   const getIcon = () => {
       switch(iconType) {
           case 'heart': return Heart;
           case 'shield': return Shield;
           case 'zap': return Zap;
           case 'flag': return Flag;
           case 'thumbsup': return ThumbsUp;
           case 'smile': return Smile;
           case 'star': default: return Star;
       }
  };

  const Icon = getIcon();
    
  // Color mapping
  const getColorClass = (active: boolean) => {
      if (!active) return 'text-gray-300 fill-gray-100';
      if (iconType === 'heart') return 'text-red-400 fill-red-400';
      if (iconType === 'shield') return 'text-blue-400 fill-blue-400';
      if (iconType === 'zap') return 'text-amber-400 fill-amber-400';
      if (iconType === 'flag') return 'text-green-400 fill-green-400';
      if (iconType === 'thumbsup') return 'text-blue-500 fill-blue-500';
      if (iconType === 'smile') return 'text-yellow-500 fill-yellow-500';
      return 'text-yellow-400 fill-yellow-400';
  };

  const getHoverColorClass = () => {
      if (iconType === 'heart') return 'group-hover:text-red-400 group-hover:fill-red-400';
      if (iconType === 'shield') return 'group-hover:text-blue-400 group-hover:fill-blue-400';
      if (iconType === 'zap') return 'group-hover:text-amber-400 group-hover:fill-amber-400';
      if (iconType === 'flag') return 'group-hover:text-green-400 group-hover:fill-green-400';
      if (iconType === 'thumbsup') return 'group-hover:text-blue-500 group-hover:fill-blue-500';
      if (iconType === 'smile') return 'group-hover:text-yellow-500 group-hover:fill-yellow-500';
      return 'group-hover:text-yellow-400 group-hover:fill-yellow-400';
  };

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  return (
    <div className={`mb-4 ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
       <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-2'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <label className="block text-sm font-medium text-black">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {options.subLabel && (
            <p className="mt-1 text-xs text-gray-500">{options.subLabel}</p>
        )}
      </div>

      <div className="flex-1 min-w-0" title={hoverText}>
          <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, index) => {
              const star = index + 1;
              const isActive = rating !== null && star <= rating;
              
              return (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className="group focus:outline-none transition-transform hover:scale-110 p-1"
                onMouseEnter={(e) => {
                   // Optional: Add hover preview logic if complex hover needed
                }}
              >
               <Icon
                  className={`w-8 h-8 transition-all duration-150 ${getColorClass(isActive)} ${getHoverColorClass()}`}
                />
              </button>
            )})}
          </div>
          <input
            type="hidden"
            {...register(fieldName, {
              required: field.required ? `This field is required` : false,
            })}
            value={rating || ''}
          />
          {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message as string}</p>
          )}
      </div>
    </div>
  );
};
