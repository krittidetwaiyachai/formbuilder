import React from 'react';
import { Field, FieldType } from '@/types';
import { Calendar, Clock } from 'lucide-react';

interface DateFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

import { useTranslation } from 'react-i18next';

export const DateField: React.FC<DateFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const { t } = useTranslation();

  if (field.type === FieldType.TIME) {
    return (
      <div className="relative max-w-sm group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
           <Clock className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
        </div>
        <input
          type="text"
          placeholder={t('common.time.select_time')}
          readOnly
          tabIndex={-1}
          className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-cyan-50/30 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} pointer-events-none group-hover/field:bg-white group-hover/field:shadow-md`}
        />
      </div>
    );
  }

  
  const showTime = (field.validation as any)?.showTime || false;
  const liteMode = (field.validation as any)?.liteMode || false;
  const separator = (field.validation as any)?.separator || '/';
  const dateFormat = (field.validation as any)?.dateFormat || 'MM-DD-YYYY';
  const dateSublabel = (field.validation as any)?.sublabels?.date || t('builder.fields.date'); 
  const parts = dateFormat.split('-');

  return (
    <div className="space-y-2 pointer-events-none">
       <div className="flex gap-4">
           <div className="flex-1">
             {liteMode ? (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
                     <Calendar className={`h-5 w-5 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
                  </div>
                  <input
                    type="text"
                    placeholder={dateFormat.replace(/-/g, separator)}
                    readOnly
                    tabIndex={-1}
                    className={`w-full pl-12 pr-4 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-teal-50/20 text-black text-base shadow-sm transition-all duration-300 ${disabledClass} group-hover/field:bg-white group-hover/field:shadow-md`}
                  />
                  <span className="text-xs text-gray-500 mt-1 block px-1">{dateSublabel}</span>
                </div>
             ) : (
                <div className="flex items-start gap-2">
                    {parts.map((part: string, index: number) => (
                        <React.Fragment key={index}>
                            <div className="flex-1 min-w-[60px] group relative">
                                 <input
                                    type="text"
                                    placeholder={part}
                                    readOnly
                                    tabIndex={-1}
                                    className={`w-full px-3 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-teal-50/20 text-black text-center text-sm shadow-sm transition-all duration-300 ${disabledClass} group-hover/field:bg-white group-hover/field:shadow-md`}
                                  />
                                  <span className="text-xs text-gray-500 mt-1 block text-center">
                                      {part === 'MM' ? t('common.date.month') : part === 'DD' ? t('common.date.day') : t('common.date.year')}
                                  </span>
                            </div>
                            {index < parts.length - 1 && (
                                <div className="py-3.5 text-gray-400 font-bold self-start">{separator}</div>
                            )}
                        </React.Fragment>
                    ))}
                     <div className="pt-3 pl-2">
                       <Calendar className={`h-5 w-5 ${fieldStyle.iconColor} opacity-50`} />
                     </div>
                </div>
             )}
           </div>
           
           {showTime && (
              <div className="w-[120px]">
                   <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300">
                         <Clock className={`h-4 w-4 ${fieldStyle.iconColor} opacity-70 group-hover/field:opacity-100`} />
                      </div>
                       <input
                        type="text"
                        placeholder={t('builder.date.time_placeholder')}
                        readOnly
                        tabIndex={-1}
                        className={`w-full pl-9 pr-2 py-3.5 border ${fieldStyle.inputBorder} rounded-xl bg-teal-50/20 text-black text-sm shadow-sm transition-all duration-300 ${disabledClass} group-hover/field:bg-white group-hover/field:shadow-md`}
                      />
                      <span className="text-xs text-gray-500 mt-1 block px-1">{t('common.time.time')}</span>
                   </div>
              </div>
           )}
       </div>
    </div>
  );
};
