import { motion } from 'framer-motion';
import { FieldType } from '@/types';

interface FormProgressBarProps {
  visibleFields: any[];
  watchedValues: any;
  isCardLayout: boolean;
  currentCardIndex: number;
  totalQuestions: number;
}

export function FormProgressBar({
  visibleFields,
  watchedValues,
  isCardLayout,
  currentCardIndex,
  totalQuestions,
}: FormProgressBarProps) {
  
  if (totalQuestions === 0) return null;

  const inputFieldTypes = [
    FieldType.TEXT, FieldType.EMAIL, FieldType.PHONE, FieldType.NUMBER, 
    FieldType.TEXTAREA, FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX, 
    FieldType.DATE, FieldType.TIME, FieldType.RATE, FieldType.FULLNAME, 
    FieldType.ADDRESS
  ];

  const getData = () => {
    const isFieldAnswered = (value: any): boolean => {
      if (value === undefined || value === null) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value); 
      if (typeof value === 'boolean') return value;
      if (typeof value === 'object') {
          return Object.values(value).some(v => {
              if (typeof v === 'string') return v.trim().length > 0;
              return !!v;
          });
      }
      return false;
    };

    const answeredCount = visibleFields.filter(field => {
       
       if (!inputFieldTypes.includes(field.type)) return false;

       const fieldName = `field_${field.id}`;
       const value = watchedValues?.[fieldName];
       
       if (isFieldAnswered(value)) return true;

       
       if (field.type === FieldType.FULLNAME || field.type === FieldType.ADDRESS) {
          const prefix = `${fieldName}_`;
          if (watchedValues) {
               const subKeys = Object.keys(watchedValues).filter(k => k.startsWith(prefix));
               return subKeys.some(k => isFieldAnswered(watchedValues[k]));
          }
       }

       return false;
    }).length;

    const progress = isCardLayout 
        ? (currentCardIndex / totalQuestions) * 100
        : (answeredCount / totalQuestions) * 100;
    
    return Math.round(progress);
  };

  const progress = getData();

  return (
    <div className="sticky top-0 z-10 mb-6 glass-card-nav bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-4">
       <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
         <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--primary)' }}
          />
       </div>
       <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
          {progress}%
       </span>
    </div>
  );
}
