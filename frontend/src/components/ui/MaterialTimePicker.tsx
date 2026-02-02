
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MaterialTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime?: string | null;
  themeColor?: string;
}

export const MaterialTimePicker: React.FC<MaterialTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedTime,
  themeColor = '#6366f1'
}) => {
  const { t } = useTranslation();
  
  
  const parseTime = (timeStr?: string | null) => {
    if (!timeStr) {
      return { hours: 12, minutes: 0, period: 'AM' as const };
    }
    
    const [h, m] = timeStr.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
        let period = h >= 12 ? 'PM' : 'AM';
        let displayHours = h % 12;
        if (displayHours === 0) displayHours = 12;
        return { hours: displayHours, minutes: m, period: period as 'AM'|'PM' };
    }
    return { hours: 12, minutes: 0, period: 'AM' as const };
  };

  const initial = parseTime(selectedTime);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);

  useEffect(() => {
    if (isOpen) {
        const { hours, minutes, period } = parseTime(selectedTime);
        setHours(hours);
        setMinutes(minutes);
        setPeriod(period);
    }
  }, [isOpen, selectedTime]);

  const handleApply = () => {
    let finalHours = hours;
    if (period === 'PM' && hours !== 12) finalHours += 12;
    if (period === 'AM' && hours === 12) finalHours = 0;
    
    const formattedTime = `${finalHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onSelect(formattedTime);
    onClose();
  };

  const incrementHours = () => {
    setHours(prev => prev === 12 ? 1 : prev + 1);
  };

  const decrementHours = () => {
    setHours(prev => prev === 1 ? 12 : prev - 1);
  };

  const incrementMinutes = () => {
    setMinutes(prev => prev === 59 ? 0 : prev + 1);
  };

  const decrementMinutes = () => {
    setMinutes(prev => prev === 0 ? 59 : prev - 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden w-full max-w-[320px] p-6 flex flex-col items-center"
           >
              {}
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                 {t('common.time', 'Time')}
              </h3>

              {}
              <div className="flex items-start justify-center gap-8 mb-6">
                   {}
                   <div className="flex flex-col items-center gap-2 w-20">
                       <button 
                         type="button"
                         onClick={incrementHours}
                         className="w-full p-2 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
                       >
                           <ChevronUp className="w-4 h-4 text-gray-600" />
                       </button>
                       <div className="text-center py-2">
                           <div className="text-4xl font-bold text-gray-800">{hours}</div>
                           <div className="text-xs text-gray-500 font-medium mt-1">{t('common.hour', 'hour')}</div>
                       </div>
                       <button 
                         type="button"
                         onClick={decrementHours}
                         className="w-full p-2 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
                       >
                           <ChevronDown className="w-4 h-4 text-gray-600" />
                       </button>
                   </div>

                   {}
                   <div className="flex flex-col items-center gap-2 w-20">
                       <button 
                         type="button"
                         onClick={incrementMinutes}
                         className="w-full p-2 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
                       >
                           <ChevronUp className="w-4 h-4 text-gray-600" />
                       </button>
                       <div className="text-center py-2">
                           <div className="text-4xl font-bold text-gray-800">{minutes.toString().padStart(2, '0')}</div>
                           <div className="text-xs text-gray-500 font-medium mt-1">{t('common.min', 'min')}</div>
                       </div>
                       <button 
                         type="button"
                         onClick={decrementMinutes}
                         className="w-full p-2 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
                       >
                           <ChevronDown className="w-4 h-4 text-gray-600" />
                       </button>
                   </div>
              </div>

               {}
               <div className="flex bg-gray-100 p-1 rounded-lg mb-6 w-full max-w-[160px]">
                   <button
                     type="button"
                     onClick={() => setPeriod('AM')}
                     className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${period === 'AM' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                       AM
                   </button>
                   <button
                     type="button"
                     onClick={() => setPeriod('PM')}
                     className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${period === 'PM' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                   >
                       PM
                   </button>
               </div>
               
               {}
               <div className="text-gray-500 font-medium mb-6 text-lg">
                   {hours}:{minutes.toString().padStart(2, '0')} {period}
               </div>

              {}
              <div className="flex flex-col gap-3 w-full">
                    <button 
                        type="button"
                        onClick={handleApply}
                        className="w-full py-2.5 rounded-lg text-white font-semibold text-sm shadow-sm active:shadow-none hover:opacity-90 transition-all"
                        style={{ backgroundColor: themeColor }}
                    >
                        {t('common.ok', 'OK')}
                    </button>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
              </div>

           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
