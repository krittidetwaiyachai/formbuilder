
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

  const handleNow = () => {
     const now = new Date();
     let h = now.getHours();
     const m = now.getMinutes();
     const p = h >= 12 ? 'PM' : 'AM';
     
     if (h > 12) h -= 12;
     if (h === 0) h = 12;

     setHours(h);
     setMinutes(m);
     setPeriod(p);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           {/* Backdrop */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={onClose}
             className="absolute inset-0"
           />
           
           <motion.div
             initial={{ opacity: 0, scale: 0.95, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 10 }}
             className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden w-full max-w-[320px] flex flex-col relative z-10"
           >
              {/* Header */}
              <div className="p-6 text-white transition-colors flex flex-col justify-center items-start" style={{ backgroundColor: themeColor }}>
                  <p className="text-sm font-medium opacity-70 mb-1 pointer-events-none uppercase tracking-wider">{t('common.select_time', 'SELECT TIME')}</p>
                  <div className="flex items-baseline gap-1">
                      <h2 className="text-5xl font-bold tracking-tight">
                        {hours}:{minutes.toString().padStart(2, '0')}
                      </h2>
                      <span className="text-xl font-medium opacity-80 ml-1">{period}</span>
                  </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col items-center">
                 <div className="flex items-center gap-4 mb-6">
                      {/* Hours */}
                      <div className="flex flex-col items-center gap-1">
                          <button 
                            type="button"
                            onClick={incrementHours}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                              <ChevronUp className="w-6 h-6" />
                          </button>
                          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl font-bold text-gray-800 border border-gray-100">
                             {hours}
                          </div>
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t('common.hour', 'Hour')}</span>
                          <button 
                            type="button"
                            onClick={decrementHours}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                              <ChevronDown className="w-6 h-6" />
                          </button>
                      </div>

                      <div className="text-2xl font-bold text-gray-300 pb-6">:</div>

                      {/* Minutes */}
                      <div className="flex flex-col items-center gap-1">
                          <button 
                            type="button"
                            onClick={incrementMinutes}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                              <ChevronUp className="w-6 h-6" />
                          </button>
                          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl font-bold text-gray-800 border border-gray-100">
                             {minutes.toString().padStart(2, '0')}
                          </div>
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t('common.minute', 'Minute')}</span>
                          <button 
                            type="button"
                            onClick={decrementMinutes}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                              <ChevronDown className="w-6 h-6" />
                          </button>
                      </div>

                      {/* Period */}
                      <div className="flex flex-col gap-2 ml-2 pb-6">
                          <button
                            type="button"
                            onClick={() => setPeriod('AM')}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                                period === 'AM' 
                                ? 'bg-primary/10 text-primary border-primary' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                            style={period === 'AM' ? { backgroundColor: `${themeColor}20`, color: themeColor, borderColor: themeColor } : {}}
                          >
                              AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setPeriod('PM')}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                                period === 'PM' 
                                ? 'bg-primary/10 text-primary border-primary' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            }`}
                            style={period === 'PM' ? { backgroundColor: `${themeColor}20`, color: themeColor, borderColor: themeColor } : {}}
                          >
                              PM
                          </button>
                      </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 px-6 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    type="button"
                    onClick={handleNow}
                    className="text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                    style={{ color: themeColor }}
                  >
                    {t('common.now', 'Now')}
                  </button>
                  <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button 
                        type="button"
                        onClick={handleApply}
                        className="text-sm font-semibold hover:opacity-90 px-6 py-2 rounded-lg transition-colors text-white shadow-lg shadow-primary/30 active:scale-95 active:shadow-sm"
                        style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}40` }}
                    >
                        {t('common.ok', 'OK')}
                    </button>
                  </div>
              </div>

           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
