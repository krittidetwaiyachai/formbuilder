import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Form } from '@/types';
import { useFormStore } from '@/store/formStore';

interface QuizModeBannerProps {
  form: Form;
  onOpenSettings: () => void;
}

export default function QuizModeBanner({ form, onOpenSettings }: QuizModeBannerProps) {
  const { t } = useTranslation();
  const { setShouldScrollToQuizSettings } = useFormStore();
  const totalScore = form.quizSettings?.totalScore || 100;
  const usedScore = form.fields?.reduce((sum, f) => sum + (f.score || 0), 0) || 0;
  const difference = totalScore - usedScore;
  
  const status = difference === 0 ? 'complete' : difference > 0 ? 'incomplete' : 'exceeded';
  
  const statusConfig = {
    complete: {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      messageColor: 'text-emerald-600',
      message: t('builder.quiz.score_complete'),
    },
    incomplete: {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      messageColor: 'text-orange-600',
      message: t('builder.quiz.missing_points', { points: difference }),
    },
    exceeded: {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      messageColor: 'text-rose-600',
      message: t('builder.quiz.exceeded_points', { points: Math.abs(difference) }),
    },
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-30 mb-4 px-4 py-3 rounded-xl border-2 ${config.bg} ${config.text} shadow-sm`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Quiz Mode Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-bold text-sm">{t('builder.quiz.mode')}</span>
          </div>
          
          <div className="h-4 w-px bg-current opacity-30" />
          
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{t('builder.quiz.total')}</span>
            <span className="font-bold">{totalScore}</span>
          </div>
          
          <div className="h-4 w-px bg-current opacity-30" />
          
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{t('builder.quiz.used')}</span>
            <span className="font-bold">{usedScore}</span>
          </div>
        </div>

        {/* Right: Status & Settings */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
            <span className={`text-sm font-semibold ${config.messageColor}`}>{config.message}</span>
          </div>
          
          <button
            onClick={() => {
              setShouldScrollToQuizSettings(true);
              onOpenSettings();
            }}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
            title={t('builder.tabs.settings')} // Reusing settings key or hardcoded? Let's use generic settings key or just leave tooltip simple? 
            // Better to use generic 'Settings' or keep it English if title not critical. 
            // Actually, I'll use common translation for 'Settings' if available from builder.ts
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
