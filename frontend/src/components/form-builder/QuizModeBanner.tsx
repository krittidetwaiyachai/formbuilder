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
      border: 'border-gray-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      messageColor: 'text-gray-200',
      message: t('builder.quiz.score_complete'),
    },
    incomplete: {
      border: 'border-gray-800',
      icon: AlertCircle,
      iconColor: 'text-orange-400',
      messageColor: 'text-gray-200',
      message: t('builder.quiz.missing_points', { points: difference }),
    },
    exceeded: {
      border: 'border-gray-800',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      messageColor: 'text-gray-200',
      message: t('builder.quiz.exceeded_points', { points: Math.abs(difference) }),
    },
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-30 mb-4 px-4 py-3 rounded-xl bg-black text-white shadow-xl border ${config.border}`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        {/* Left: Quiz Mode Info & Stats */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <GraduationCap className="w-4 h-4 text-white" />
            <span className="font-bold text-sm text-white">{t('builder.quiz.mode')}</span>
          </div>
          
          <div className="hidden md:block h-4 w-px bg-white/20" />
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
                <span className="text-gray-400">{t('builder.quiz.total')}</span>
                <span className="font-bold font-mono text-white">{totalScore}</span>
            </div>
            
            <div className="h-3 w-px bg-white/20" />
            
            <div className="flex items-center gap-2">
                <span className="text-gray-400">{t('builder.quiz.used')}</span>
                <span className="font-bold font-mono text-white">{usedScore}</span>
            </div>
          </div>
        </div>

        {/* Right: Status & Settings */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 border-t md:border-t-0 border-white/10 pt-2 md:pt-0 mt-1 md:mt-0">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
            <span className={`text-sm font-semibold ${config.messageColor}`}>{config.message}</span>
          </div>
          
          <button
            onClick={() => {
              setShouldScrollToQuizSettings(true);
              onOpenSettings();
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            title={t('builder.tabs.settings')}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
