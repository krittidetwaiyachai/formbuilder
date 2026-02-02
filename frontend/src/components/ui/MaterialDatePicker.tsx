
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MaterialDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  themeColor?: string;
}

export const MaterialDatePicker: React.FC<MaterialDatePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  themeColor = '#6366f1' 
}) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentDate(selectedDate);
      setViewDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setSlideDirection('right');
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSlideDirection('left');
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(newDate);
  };

  const handleApply = () => {
    onSelect(currentDate);
    onClose();
  };
  
  const handleToday = () => {
     const today = new Date();
     setCurrentDate(today);
     setViewDate(today);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    
    for (let day = 1; day <= daysInMonth; day++) {
       const date = new Date(year, month, day);
       const isSelected = currentDate.toDateString() === date.toDateString();
       const isToday = new Date().toDateString() === date.toDateString();

       days.push(
         <motion.button
           key={day}
           type="button"
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           onClick={() => handleDateClick(day)}
           className={`w-10 h-10 rounded-full flex items-center justify-center text-sm relative transition-colors
             ${isSelected ? 'text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}
             ${isToday && !isSelected ? 'border border-current font-semibold' : ''}
           `}
           style={{
             backgroundColor: isSelected ? themeColor : 'transparent',
             borderColor: isToday && !isSelected ? themeColor : 'transparent',
             color: isToday && !isSelected ? themeColor : undefined
           }}
         >
           {day}
         </motion.button>
       );
    }
    return days;
  };

  
  const monthName = viewDate.toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', { month: 'long', year: 'numeric' });
  const yearText = currentDate.toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', { year: 'numeric' });
  const dateText = currentDate.toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  
  const weekDays = i18n.language === 'th' 
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.9 }}
             className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden w-full max-w-[360px] flex flex-col"
           >
              {}
              <div className="p-6 text-white transition-colors" style={{ backgroundColor: themeColor }}>
                  <p className="text-sm font-medium opacity-70 mb-1">{yearText}</p>
                  <h2 className="text-3xl font-bold">{dateText}</h2>
              </div>

              {}
              <div className="p-4">
                 {}
                 <div className="flex items-center justify-between mb-4 px-2">
                    <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <span className="font-bold text-gray-800 text-lg">{monthName}</span>
                    <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                 </div>

                 {}
                 <div className="grid grid-cols-7 mb-2 text-center">
                    {weekDays.map(day => (
                        <div key={day} className="text-xs font-semibold text-gray-400 w-10 h-10 flex items-center justify-center">
                            {day}
                        </div>
                    ))}
                 </div>

                 {}
                 <div className="grid grid-cols-7 gap-y-1 justify-items-center h-[260px]">
                    <AnimatePresence mode="popLayout" custom={slideDirection}>
                        {renderCalendarDays()}
                    </AnimatePresence>
                 </div>
              </div>

              {}
              <div className="flex items-center justify-between p-4 px-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={handleToday}
                    className="text-sm font-semibold hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                    style={{ color: themeColor }}
                  >
                    {t('common.today', 'Today')}
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
                        className="text-sm font-semibold hover:bg-opacity-90 px-4 py-2 rounded-lg transition-colors text-white shadow-md active:shadow-sm"
                        style={{ backgroundColor: themeColor }}
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
