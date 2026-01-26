
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle, Facebook, Twitter, Linkedin, ThumbsUp, Heart, Star, Trophy, PartyPopper } from 'lucide-react';
import { FormSettings, ThankYouScreenSettings } from '@/types';
import QuizResults from './QuizResults';
import Loader from '@/components/common/Loader';

const iconMap: Record<string, any> = {
  check: CheckCircle,
  thumbsUp: ThumbsUp,
  heart: Heart,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
};


const iconStyles: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  gray: 'bg-gray-50 text-gray-900 border-gray-100',
  white: 'bg-white text-gray-900 border-gray-100 shadow-sm',
};

interface ThankYouScreenProps {
  settings?: ThankYouScreenSettings;
  globalSettings?: FormSettings;
  score?: { score: number; totalScore: number } | null;
  showScore?: boolean;
  allowViewMissedQuestions?: boolean;
  showExplanation?: boolean;
  quizReview?: any;
  isQuiz?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

import { useTranslation } from 'react-i18next';

export default function ThankYouScreen({ settings, globalSettings, score, showScore, allowViewMissedQuestions, showExplanation, quizReview, isQuiz, viewMode = 'desktop' }: ThankYouScreenProps) {
  const { t } = useTranslation();
  const layout = settings?.layout || 'simple';
  const bgImage = settings?.backgroundImage;
  const iconColor = settings?.iconColor || 'green';
  const IconComponent = iconMap[(settings as any)?.icon || 'check'] || Check;
  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  
  const defaultTitle = t('public.thank_you.title', 'Thank you!');
  const defaultMessage = t('public.thank_you.message', 'Your submission has been received.');
  
  const title = settings?.title ?? defaultTitle;
  const message = globalSettings?.successMessage || settings?.message || defaultMessage;

  useEffect(() => {
    if (settings?.autoRedirect && settings?.redirectUrl) {
      const delay = (settings?.redirectDelay || 3) * 1000;
      const timer = setTimeout(() => {
        window.location.href = settings.redirectUrl!;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [settings?.autoRedirect, settings?.redirectUrl, settings?.redirectDelay]);

  

  useEffect(() => {
    if (settings?.showConfetti) {
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-[9999]';
      confettiContainer.innerHTML = Array.from({ length: 50 }).map(() => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const color = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)];
        return `<div style="position:absolute;left:${left}%;top:-10px;width:10px;height:10px;background:${color};border-radius:2px;animation:confetti-fall 3s ease-out ${delay}s forwards;"></div>`;
      }).join('');
      document.body.appendChild(confettiContainer);
      
      const style = document.createElement('style');
      style.textContent = `@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`;
      document.head.appendChild(style);
      
      setTimeout(() => {
        confettiContainer.remove();
        style.remove();
      }, 5000);
    }
  }, [settings?.showConfetti]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const renderContent = (isCover = false) => (
    <div className="flex flex-col items-center justify-center w-full text-center space-y-8 px-4">
      
      { }
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`text-4xl md:text-5xl font-bold tracking-tight ${isCover ? 'text-white drop-shadow-md' : ''}`}
        style={!isCover ? { color: 'var(--text)' } : {}}
      >
        {title}
      </motion.h2>

      { }
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-lg md:text-xl font-normal whitespace-pre-wrap leading-relaxed max-w-2xl ${isCover ? 'text-white/90 drop-shadow' : ''}`}
        style={!isCover ? { color: 'var(--text)', opacity: 0.7 } : {}}
      >
        {message}
      </motion.p>

      { }
      {settings?.showButton && settings?.buttonText && (
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          href={settings?.buttonLink || '/'}
          className={`mt-4 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all ${
            isCover 
              ? 'bg-white text-black hover:bg-gray-50' 
              : 'text-white hover:opacity-90'
          }`}
          style={!isCover ? { backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' } : {}}
        >
          {settings.buttonText}
        </motion.a>
      )}

      { }
      {settings?.showSocialShare && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 mt-8"
        >
          {[
            { id: 'facebook', icon: Facebook, color: 'hover:text-blue-600' },
            { id: 'twitter', icon: Twitter, color: 'hover:text-sky-500' },
            { id: 'linkedin', icon: Linkedin, color: 'hover:text-blue-700' }
          ].map((item) => (
             <button
                key={item.id}
                onClick={() => handleShare(item.id)}
                className={`p-3 rounded-full transition-all ${
                  isCover 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : `bg-gray-100 text-gray-500 hover:bg-white hover:shadow-md ${item.color}`
                }`}
             >
                <item.icon className="w-5 h-5" />
             </button>
          ))}
        </motion.div>
      )}

      { }
      {quizReview && score && (
        <QuizResults 
          quizReview={quizReview} 
          score={score} 
          showScore={showScore} 
          allowViewMissedQuestions={allowViewMissedQuestions}
          showExplanation={showExplanation}
        />
      )}

      { }
      {settings?.autoRedirect && settings?.redirectUrl && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`flex items-center gap-2 text-sm font-medium mt-4 ${isCover ? 'text-white/70' : 'text-gray-400'}`}
        >
           <Loader size={16} />
           <span>{t('public.redirecting_in', { seconds: settings?.redirectDelay || 3 })}</span>
        </motion.div>
      )}
    </div>
  );

  const renderImage = () => (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center min-h-[300px]">
          {bgImage ? (
              <img src={bgImage} alt="Thank You" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300 space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-500 opacity-50" />
                </div>
            </div>
          )}
      </div>
  );

  const successIcon = (
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="mb-8 relative"
    >
       { }
      <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${
          iconColor === 'white' ? 'bg-gray-200' : iconStyles[iconColor]?.split(' ')[0]?.replace('bg-', 'bg-') || 'bg-emerald-200'
      }`} />
      
      <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center relative z-10 shadow-xl border-4 border-white ${iconStyles[iconColor] || iconStyles.green}`}>
        <IconComponent className="w-10 h-10" strokeWidth={2.5} />
      </div>
    </motion.div>
  );

  const renderFooter = (isCover = false) => {
    if (!settings?.showFooter) return null;
    return (
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className={`text-xs font-medium tracking-wide opacity-50 ${isCover ? 'text-white' : 'text-gray-400'}`}>
          {settings?.footerText || t('public.powered_by', 'Powered by FormBuilder')}
        </p>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full shadow-2xl overflow-hidden flex ${
          layout === 'split-left' ? 'flex-col md:flex-row' : 
          layout === 'split-right' ? 'flex-col-reverse md:flex-row-reverse' : 
          'flex-col'
      } relative ${
          (isMobile || isTablet)
            ? 'min-h-full rounded-none max-w-full' 
            : `${layout === 'simple' ? 'max-w-4xl' : 'max-w-6xl'} ${isQuiz ? 'min-h-full' : 'min-h-[500px]'} rounded-[2.5rem] my-8 border`
      }`}
      style={{ 
        backgroundColor: 'var(--card-bg, rgba(255,255,255,0.9))', 
        borderColor: 'var(--card-border, rgba(0,0,0,0.05))',
        backdropFilter: 'blur(16px)'
      }}
    >
      
      { }
      {layout === 'simple' && (
          <div className={`flex flex-col items-center justify-center flex-1 w-full ${isQuiz ? 'py-8 pb-0' : 'py-16'} px-8 overflow-y-auto ${isQuiz ? 'flex-1 max-h-full' : 'max-h-[90vh]'}`}>
               { }
               <div className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'var(--primary)' }} />
               <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2" style={{ backgroundColor: 'var(--primary)' }} />

               {bgImage ? (
                  <div className="w-40 h-40 mb-8 mx-auto relative z-10">
                      <img src={bgImage} alt={t('common.success')} className="w-full h-full object-contain" />
                  </div>
               ) : (
                  <div className="relative z-10">
                    {successIcon}
                  </div>
               )}
               <div className="relative z-10 w-full">
                  {renderContent()}
               </div>
          </div>
      )}

      { }
      {(layout === 'split-left' || layout === 'split-right') && (
          <>
              <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full">
                   {renderImage()}
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16" style={{ backgroundColor: 'var(--card-bg, rgba(255,255,255,0.9))' }}>
                   {successIcon}
                   {renderContent()}
              </div>
          </>
      )}

      { }
      {layout === 'cover' && (
          <div className="absolute inset-0 w-full h-full">
              {bgImage ? (
                   <img src={bgImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-800" />
              )}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 md:p-12">
                   {successIcon}
                   {renderContent(true)}
                   {renderFooter(true)}
              </div>
          </div>
      )}

      { }
      {layout !== 'cover' && renderFooter()}

    </motion.div>
  );
}
