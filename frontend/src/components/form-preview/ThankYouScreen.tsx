
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Facebook, Twitter, Linkedin, ThumbsUp, Heart, Star, Trophy, PartyPopper } from 'lucide-react';
import { FormSettings, ThankYouScreenSettings } from '@/types';
import QuizResults from './QuizResults';

const iconMap: Record<string, any> = {
  check: Check,
  thumbsUp: ThumbsUp,
  heart: Heart,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
};

interface ThankYouScreenProps {
  settings?: ThankYouScreenSettings;
  globalSettings?: FormSettings;
  score?: { score: number; totalScore: number } | null;
  showScore?: boolean;
  quizReview?: any;
  isQuiz?: boolean;
}

const iconColorClasses = {
  green: 'from-emerald-400 to-green-500 shadow-green-500/30',
  blue: 'from-blue-400 to-blue-500 shadow-blue-500/30',
  purple: 'from-purple-400 to-purple-500 shadow-purple-500/30',
  orange: 'from-orange-400 to-orange-500 shadow-orange-500/30',
  pink: 'from-pink-400 to-pink-500 shadow-pink-500/30',
  red: 'from-red-400 to-red-500 shadow-red-500/30',
  yellow: 'from-yellow-400 to-yellow-500 shadow-yellow-500/30',
  gray: 'from-gray-600 to-gray-800 shadow-gray-500/30',
  white: 'bg-white text-gray-900 border border-gray-100 shadow-gray-200',
};

export default function ThankYouScreen({ settings, globalSettings, score, showScore, quizReview, isQuiz }: ThankYouScreenProps) {
  const layout = settings?.layout || 'simple';
  const bgImage = settings?.backgroundImage;
  const iconColor = settings?.iconColor || 'green';
  const IconComponent = iconMap[(settings as any)?.icon || 'check'] || Check;
  
  const defaultTitle = 'Thank you!';
  const defaultMessage = 'Your submission has been received.';
  
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
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
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
    const text = 'I just completed this form!';
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const renderContent = (isCover = false) => (
    <div className="flex flex-col items-center justify-center w-full text-center space-y-4">
      
      {/* Title */}
      <h2 className={`text-3xl md:text-4xl font-bold ${isCover ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>

      {/* Message */}
      <p className={`text-lg md:text-xl whitespace-pre-wrap leading-relaxed max-w-lg ${isCover ? 'text-white/90' : 'text-gray-500'}`}>
        {message}
      </p>

      {/* Score Display */}
      {showScore && score && (
        <motion.div 
           initial={{ y: 10, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3 }}
           className={`mt-6 rounded-2xl p-6 ${isCover ? 'bg-white/20 backdrop-blur-md border border-white/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'}`}
        >
           <p className={`text-sm font-medium uppercase tracking-wider mb-2 ${isCover ? 'text-white/80' : 'text-gray-400'}`}>
             Your Score
           </p>
           <div className="flex items-end justify-center gap-1">
             <span className={`text-5xl font-bold ${isCover ? 'text-white' : 'text-gray-900'}`}>{score.score}</span>
             <span className={`text-2xl mb-1 ${isCover ? 'text-white/70' : 'text-gray-400'}`}>/ {score.totalScore}</span>
           </div>
        </motion.div>
      )}

      {/* Button */}
      {settings?.showButton && settings?.buttonText && (
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          href={settings?.buttonLink || '/'}
          className={`mt-6 px-8 py-3 rounded-lg font-medium transition-all ${
            isCover 
              ? 'bg-white text-gray-900 hover:bg-white/90' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {settings.buttonText}
        </motion.a>
      )}

      {/* Social Share */}
      {settings?.showSocialShare && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mt-6"
        >
          <button
            onClick={() => handleShare('facebook')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isCover ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Facebook className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isCover ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'
            }`}
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isCover ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}
          >
            <Linkedin className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Quiz Results - Show answer review */}
      {quizReview && score && (
        <QuizResults quizReview={quizReview} score={score} />
      )}

      {/* Redirect Countdown */}
      {settings?.autoRedirect && settings?.redirectUrl && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-sm ${isCover ? 'text-white/60' : 'text-gray-400'}`}
        >
          Redirecting in {settings?.redirectDelay || 3} seconds...
        </motion.p>
      )}
    </div>
  );

  const renderImage = () => (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center min-h-[300px]">
          {bgImage ? (
              <img src={bgImage} alt="Thank You" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <Check className="w-12 h-12 text-gray-300" />
                </div>
            </div>
          )}
      </div>
  );

  const successIcon = (
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="mb-6"
    >
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`w-20 h-20 bg-gradient-to-br ${iconColorClasses[iconColor]} rounded-full flex items-center justify-center shadow-lg`}
      >
        <IconComponent className="w-10 h-10 text-white" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );

  const renderFooter = (isCover = false) => {
    if (!settings?.showFooter) return null;
    return (
      <div className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className={`text-xs ${isCover ? 'text-white/60' : 'text-gray-400'}`}>
          {settings?.footerText || 'Powered by FormBuilder'}
        </p>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${layout === 'simple' ? 'max-w-3xl' : 'max-w-5xl'} bg-white shadow-2xl ${isQuiz ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'} border border-gray-100 overflow-hidden flex ${
          layout === 'split-left' ? 'flex-col md:flex-row' : 
          layout === 'split-right' ? 'flex-col-reverse md:flex-row-reverse' : 
          'flex-col'
      } relative ${isQuiz ? 'min-h-full' : 'min-h-[400px]'}`}
    >
      
      {/* SIMPLE LAYOUT */}
      {layout === 'simple' && (
          <div className={`flex flex-col items-center justify-start w-full ${isQuiz ? 'py-8 pb-0' : 'py-16'} px-8 overflow-y-auto ${isQuiz ? 'flex-1 max-h-full' : 'max-h-[90vh]'}`}>
               {bgImage ? (
                  <div className="w-40 h-40 mb-6 mx-auto">
                      <img src={bgImage} alt="Success" className="w-full h-full object-contain" />
                  </div>
               ) : (
                  successIcon
               )}
               {renderContent()}
          </div>
      )}

      {/* SPLIT LAYOUTS */}
      {(layout === 'split-left' || layout === 'split-right') && (
          <>
              <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full">
                   {renderImage()}
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-10">
                   {successIcon}
                   {renderContent()}
              </div>
          </>
      )}

      {/* COVER LAYOUT */}
      {layout === 'cover' && (
          <div className="absolute inset-0 w-full h-full">
              {bgImage ? (
                   <img src={bgImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600" />
              )}
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-8 md:p-12">
                   <motion.div 
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="mb-8"
                   >
                     <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                       <IconComponent className="w-12 h-12 text-white" strokeWidth={3} />
                     </div>
                   </motion.div>
                   {renderContent(true)}
                   {renderFooter(true)}
              </div>
          </div>
      )}

      {/* Footer for non-cover layouts */}
      {layout !== 'cover' && renderFooter()}

    </motion.div>
  );
}
