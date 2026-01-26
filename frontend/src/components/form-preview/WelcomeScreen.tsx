import { motion } from 'framer-motion';
import { WelcomeScreenSettings } from '@/types';
import { Check, ThumbsUp, Heart, Star, Trophy, PartyPopper, Rocket, Sparkles } from 'lucide-react';

const iconMap: Record<string, any> = {
  check: Check,
  thumbsUp: ThumbsUp,
  heart: Heart,
  star: Star,
  trophy: Trophy,
  party: PartyPopper,
  rocket: Rocket,
  sparkles: Sparkles,
};


const iconStyles: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  gray: 'bg-gray-50 text-gray-700 border-gray-100',
  white: 'bg-white text-black border-gray-100 shadow-sm',
};

interface WelcomeScreenProps {
  settings?: WelcomeScreenSettings;
  onStart: () => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

import { useTranslation } from 'react-i18next';

export default function WelcomeScreen({ settings, onStart, viewMode = 'desktop' }: WelcomeScreenProps) {
  const { t } = useTranslation();
  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  const layout = settings?.layout || 'simple';
  const bgImage = settings?.backgroundImage;
  const iconColor = (settings as any)?.iconColor || 'blue';
  const IconComponent = iconMap[(settings as any)?.icon || 'sparkles'] || Sparkles;
  const title = settings?.title;
  const description = settings?.description;
  const buttonText = settings?.buttonText || t('public.start', 'Start');
  const showButton = settings?.showStartButton !== false;

  const renderContent = (isCover = false) => (
    <div className={`flex flex-col items-center justify-center ${isMobile ? 'px-4 py-10' : 'p-12 md:p-16'} w-full max-w-2xl mx-auto text-center space-y-8`}>
      
       { }
       {layout === 'simple' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-28 h-28 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl ${iconStyles[iconColor] || iconStyles.blue}`}
          >
             <IconComponent className="w-12 h-12" strokeWidth={1.5} />
          </motion.div>
       )}

      { }
      {title && (
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'} font-bold tracking-tight leading-tight ${isCover ? 'text-white drop-shadow-md' : ''}`} style={!isCover ? { color: 'var(--text)' } : {}}>
            {title}
          </h1>
      )}

      { }
      {description && (
        <p className={`${isMobile ? 'text-base' : 'text-xl'} font-normal leading-relaxed max-w-xl mx-auto ${isCover ? 'text-white/90 drop-shadow' : ''}`} style={!isCover ? { color: 'var(--text)', opacity: 0.7 } : {}}>
            {description}
        </p>
      )}

      { }
      {showButton && (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className={`group relative mt-4 flex items-center justify-center gap-3 px-12 py-4 font-bold rounded-full text-lg shadow-xl transition-all w-full md:w-auto min-w-[200px] ${
                isCover 
                ? 'bg-white text-black border-2 border-transparent hover:border-white/50' 
                : 'text-white hover:opacity-90'
            }`}
            style={!isCover ? { backgroundColor: 'var(--primary)', borderRadius: 'var(--radius)' } : {}}
        >
            <span>{buttonText}</span>
        </motion.button>
      )}
    </div>
  );

  const renderImage = () => (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center overflow-hidden">
          {bgImage ? (
              <img src={bgImage} alt="Welcome" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
          ) : (
             <div className="flex flex-col items-center justify-center text-gray-300 space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                    <IconComponent className="w-8 h-8 opacity-20" />
                </div>
                <span className="text-sm font-medium tracking-widest text-gray-400 uppercase">{t('public.image_placeholder', 'Image Placeholder')}</span>
            </div>
          )}
      </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full shadow-2xl overflow-hidden flex ${
          layout === 'split-left' ? 'flex-col md:flex-row' : 
          layout === 'split-right' ? 'flex-col-reverse md:flex-row-reverse' : 
          'flex-col'
      } relative ${
          (isMobile || isTablet)
            ? 'min-h-full rounded-none max-w-full' 
            : 'min-h-[650px] rounded-[2.5rem] max-w-6xl my-8 border'
      }`}
      style={{ 
        backgroundColor: 'var(--card-bg, rgba(255,255,255,0.9))', 
        borderColor: 'var(--card-border, rgba(0,0,0,0.05))',
        backdropFilter: 'blur(16px)'
      }}
    >
      
      { }
      {layout === 'simple' && (
          <div className="flex flex-col items-center justify-center w-full min-h-[inherit] relative" style={{ backgroundColor: 'transparent' }}>
               { }
               <div className="absolute top-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'var(--primary)' }} />
               <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2" style={{ backgroundColor: 'var(--primary)' }} />
               
               <div className="w-full flex-1 flex items-center justify-center relative z-10">
                    {renderContent()}
               </div>
          </div>
      )}

      { }
      {(layout === 'split-left' || layout === 'split-right') && (
          <>
               <div className="w-full md:w-1/2 relative min-h-[350px] md:min-h-full">
                   {renderImage()}
               </div>
               <div className="w-full md:w-1/2 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--card-bg, rgba(255,255,255,0.9))' }}>
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
                  <div className="absolute inset-0 bg-gray-900" />
              )}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center px-4">
                   {renderContent(true)}
              </div>
          </div>
      )}

    </motion.div>
  );
}
