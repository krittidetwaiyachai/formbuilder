import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
interface MaterialDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  themeColor?: string;
  mode?: "date" | "month";
}
type DateView = "day" | "month" | "year";
export const MaterialDatePicker: React.FC<MaterialDatePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  themeColor = "#6366f1",
  mode = "date"
}) => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [view, setView] = useState<DateView>("day");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "left"
  );
  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentDate(selectedDate);
      setViewDate(selectedDate);
      setView(mode === "month" ? "month" : "day");
    } else if (isOpen && !selectedDate) {
      const now = new Date();
      setCurrentDate(now);
      setViewDate(now);
      setView(mode === "month" ? "month" : "day");
    }
  }, [isOpen, selectedDate, mode]);
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  const handlePrevMonth = () => {
    setSlideDirection("right");
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setSlideDirection("left");
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };
  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(newDate);
  };
  const handleYearClick = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setView("month");
  };
  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);
    setCurrentDate(newDate);
    setView(mode === "month" ? "month" : "day");
  };
  const handleApply = () => {
    if (mode === "month") {
      onSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    } else {
      onSelect(currentDate);
    }
    onClose();
  };
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setViewDate(today);
    setView("day");
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
             ${isSelected ? "text-white font-bold" : "text-gray-700 hover:bg-gray-100"}
             ${isToday && !isSelected ? "border border-current font-semibold" : ""}
           `}
          style={{
            backgroundColor: isSelected ? themeColor : "transparent",
            borderColor: isToday && !isSelected ? themeColor : "transparent",
            color: isToday && !isSelected ? themeColor : undefined
          }}>
          {day}
        </motion.button>
      );
    }
    return days;
  };
  const yearListRef = React.useRef<HTMLDivElement>(null);
  const selectedYearRef = React.useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);
  useEffect(() => {
    if (view === "year" && isOpen) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (selectedYearRef.current && yearListRef.current) {
            const container = yearListRef.current;
            const selected = selectedYearRef.current;
            const containerHeight = container.clientHeight;
            const selectedTop = selected.offsetTop;
            const selectedHeight = selected.clientHeight;
            container.scrollTo({
              top: selectedTop - containerHeight / 2 + selectedHeight / 2,
              behavior: "auto"
            });
          }
        }, 100);
      });
    }
  }, [view, isOpen]);
  const renderYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    const startYear = 1900;
    const endYear = 2100;
    for (let year = endYear; year >= startYear; year--) {
      const isSelected = year === currentDate.getFullYear();
      years.push(
        <button
          key={year}
          ref={isSelected ? selectedYearRef : null}
          type="button"
          onClick={() => handleYearClick(year)}
          className={`py-2 px-6 rounded-full text-lg font-semibold transition-all ${
          isSelected ?
          "text-white shadow-md scale-110" :
          "text-gray-400 hover:text-gray-800"}`
          }
          style={isSelected ? { backgroundColor: themeColor } : {}}>
          {year}
        </button>
      );
    }
    return (
      <div
        ref={yearListRef}
        className="flex flex-col items-center gap-2 h-[260px] overflow-y-auto overscroll-contain py-4 scroll-smooth touch-pan-y isolate relative"
        onTouchMove={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}>
        {years}
      </div>);
  };
  const renderMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(viewDate.getFullYear(), i, 1);
      const monthName = date.toLocaleDateString(
        i18n.language === "th" ? "th-TH" : "en-US",
        { month: "short" }
      );
      const isSelected =
      i === currentDate.getMonth() &&
      viewDate.getFullYear() === currentDate.getFullYear();
      months.push(
        <button
          key={i}
          type="button"
          onClick={() => handleMonthClick(i)}
          className={`py-3 rounded-lg text-sm font-semibold transition-colors ${isSelected ? "text-white" : "text-gray-700 hover:bg-gray-100"}`}
          style={isSelected ? { backgroundColor: themeColor } : {}}>
          {monthName}
        </button>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-3 h-[260px] content-center">
        {months}
      </div>);
  };
  const monthName = viewDate.toLocaleDateString(
    i18n.language === "th" ? "th-TH" : "en-US",
    { month: "long", year: "numeric" }
  );
  const yearText = currentDate.toLocaleDateString(
    i18n.language === "th" ? "th-TH" : "en-US",
    { year: "numeric" }
  );
  const dateText =
    mode === "month"
      ? currentDate.toLocaleDateString(
          i18n.language === "th" ? "th-TH" : "en-US",
          { month: "short", year: "numeric" }
        )
      : currentDate.toLocaleDateString(
          i18n.language === "th" ? "th-TH" : "en-US",
          { weekday: "short", month: "short", day: "numeric" }
        );
  const weekDays =
  i18n.language === "th" ?
  ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] :
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <AnimatePresence>
      {isOpen &&
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 touch-none">
          {}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/0" />
          <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden w-full max-w-[360px] flex flex-col relative z-10">
            {}
            <div
            className="p-6 text-white transition-colors"
            style={{ backgroundColor: themeColor }}>
              <p
              className={`text-sm font-medium opacity-70 mb-1 cursor-pointer hover:opacity-100 transition-opacity ${view === "year" ? "opacity-100 font-bold" : ""}`}
              onClick={() => setView("year")}>
                {yearText}
              </p>
              <h2
              className={`text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity ${view === "day" ? "opacity-100" : "opacity-60"}`}
              onClick={() => setView(mode === "month" ? "month" : "day")}>
                {dateText}
              </h2>
            </div>
            {}
            <div className="p-4">
              {}
              {view === "day" && mode !== "month" &&
            <div className="flex items-center justify-between mb-4 px-2">
                  <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <span
                className="font-bold text-gray-800 text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => setView("month")}
                style={{ color: "inherit" }}>
                    {monthName}
                  </span>
                  <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
            }
              {view === "year" &&
            <div className="flex items-center justify-center mb-4">
                  <span className="font-bold text-gray-800 text-lg">
                    Select Year
                  </span>
                </div>
            }
              {view === "month" &&
            <div className="flex items-center justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => setView("year")}
                    className="font-bold text-gray-800 text-lg hover:text-gray-900 transition-colors"
                    title={t("common.date.year")}>
                    {viewDate.getFullYear()}
                  </button>
                </div>
            }
              {}
              {view === "day" && mode !== "month" &&
            <div className="grid grid-cols-7 mb-2 text-center">
                  {weekDays.map((day) =>
              <div
                key={day}
                className="text-xs font-semibold text-gray-400 w-10 h-10 flex items-center justify-center">
                      {day}
                    </div>
              )}
                </div>
            }
              {}
              <div className="h-[260px]">
                {view === "day" && mode !== "month" &&
              <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                    <AnimatePresence mode="popLayout" custom={slideDirection}>
                      {renderCalendarDays()}
                    </AnimatePresence>
                  </div>
              }
                {view === "year" && renderYears()}
                {view === "month" && renderMonths()}
              </div>
            </div>
            {}
            <div className="flex items-center justify-between p-4 px-6 border-t border-gray-100">
              <button
              type="button"
              onClick={handleToday}
              className="text-sm font-semibold hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              style={{ color: themeColor }}>
                {t("common.today", "Today")}
              </button>
              <div className="flex gap-2">
                <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                type="button"
                onClick={handleApply}
                className="text-sm font-semibold hover:bg-opacity-90 px-4 py-2 rounded-lg transition-colors text-white shadow-md active:shadow-sm"
                style={{ backgroundColor: themeColor }}>
                  {t("common.ok", "OK")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);
};