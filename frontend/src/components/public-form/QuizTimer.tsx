import { useEffect, useState, useRef } from 'react';
import { Clock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuizTimerProps {
  timeLimitMinutes: number;
  onTimeUp: () => void;
  startTime?: Date;
}

export default function QuizTimer({ timeLimitMinutes, onTimeUp, startTime }: QuizTimerProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimitMinutes * 60 * 1000); 
  const [isExpired, setIsExpired] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasCalledOnTimeUp = useRef(false);

  useEffect(() => {
    let targetTime: number;

    if (startTime) {
      targetTime = startTime.getTime() + (timeLimitMinutes * 60 * 1000);
    } else {
      targetTime = Date.now() + (timeLimitMinutes * 60 * 1000);
    }

    const checkTime = () => {
        if (hasCalledOnTimeUp.current) return;

        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
            setTimeRemaining(0);
            if (!isExpired) {
               setIsExpired(true);
               hasCalledOnTimeUp.current = true;
               onTimeUp();
            }
        } else {
            setTimeRemaining(diff);
        }
    };

    checkTime();

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [timeLimitMinutes, startTime, onTimeUp, isExpired]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const minutes = Math.floor(timeRemaining / 60000);
  const isWarning = minutes < 5 && !isExpired;
  const isDanger = minutes < 2 && !isExpired;

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 rounded-full text-red-600 font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <Clock className="w-5 h-5 animate-pulse" />
        <span>{t('public.timer.times_up')}</span>
      </div>
    );
  }

  const getStatusColor = () => {
    if (isDanger) return 'text-red-600';
    if (isWarning) return 'text-amber-600';
    return 'text-indigo-600';
  };

  const statusColor = getStatusColor();

  return (
    <div className={`flex items-center bg-white rounded-full border border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${isCollapsed ? 'p-2' : 'px-4 py-2 gap-3'}`}>
      
      <div className={`flex items-center gap-2 ${isCollapsed ? 'cursor-pointer' : ''}`} onClick={() => isCollapsed && setIsCollapsed(false)}>
        <Clock className={`w-5 h-5 ${statusColor} ${isDanger ? 'animate-pulse' : ''}`} />
        
        {!isCollapsed && (
          <div className="flex flex-col leading-none">
             <span className={`font-mono text-lg font-bold tracking-tight ${statusColor}`}>
               {formatTime(timeRemaining)}
             </span>
             {isWarning && !isDanger && (
               <span className="text-[10px] text-gray-400 font-medium -mt-0.5">
                 {t('public.timer.remaining')}
               </span>
             )}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="w-px h-6 bg-gray-100 mx-1" />
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed(!isCollapsed);
        }}
        className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        title={isCollapsed ? t('public.timer.show_timer') : t('public.timer.hide_timer')}
      >
        {isCollapsed ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

    </div>
  );
}
