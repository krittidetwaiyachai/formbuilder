import React from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from '@/types';
import { Clock } from 'lucide-react';

interface TimeFieldProps {
  field: Field;
  fieldStyle: {
    cardBorder: string;
    inputBorder: string;
    bgGradient: string;
    iconColor: string;
  };
  disabledClass?: string;
}

export const TimeField: React.FC<TimeFieldProps> = ({ field, fieldStyle, disabledClass = "opacity-60 cursor-pointer" }) => {
  const { t } = useTranslation();
  const options = field.options || {};
  const timeFormat = options.timeFormat || 'AMPM'; // '24HOUR' | 'AMPM'
  const subLabelHour = options.subLabelHour || t('builder.time.hour');
  const subLabelMinutes = options.subLabelMinutes || t('builder.time.minutes');
  const timeRange = options.timeRange || false;

  const TimeInputGroup = () => (
      <div className="flex items-center gap-2">
           <div>
               <input
                type="text"
                placeholder="HH"
                readOnly
                className={`w-16 px-3 py-3 border ${fieldStyle.inputBorder} rounded-lg bg-gray-50/50 text-center text-sm shadow-sm ${disabledClass} pointer-events-none`}
               />
               <label className="block text-xs text-gray-400 mt-1 text-center">{subLabelHour}</label>
           </div>
           <span className="text-gray-400 font-bold mb-6">:</span>
           <div>
               <input
                type="text"
                placeholder="MM"
                readOnly
                className={`w-16 px-3 py-3 border ${fieldStyle.inputBorder} rounded-lg bg-gray-50/50 text-center text-sm shadow-sm ${disabledClass} pointer-events-none`}
               />
                <label className="block text-xs text-gray-400 mt-1 text-center">{subLabelMinutes}</label>
           </div>
           {timeFormat === 'AMPM' && (
               <div className="mb-6">
                    <select disabled className={`h-[46px] px-2 border ${fieldStyle.inputBorder} rounded-lg bg-gray-50/50 text-sm shadow-sm ${disabledClass} pointer-events-none`}>
                        <option>AM</option>
                        <option>PM</option>
                    </select>
               </div>
           )}
           <div className="mb-6 ml-2">
                <Clock className="w-5 h-5 text-gray-400" />
           </div>
      </div>
  );

  return (
    <div className="relative max-w-full">
        <div className="flex flex-col gap-4">
             <TimeInputGroup />
             {timeRange && (
                 <>
                    <div className="text-xs font-bold text-gray-400 uppercase">{t('builder.time.to')}</div>
                    <TimeInputGroup />
                 </>
             )}
        </div>
    </div>
  );
};
