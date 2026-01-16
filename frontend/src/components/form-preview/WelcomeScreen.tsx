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

const iconGlowClasses: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  pink: 'bg-pink-100 text-pink-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600',
  white: 'bg-white text-gray-900 border border-gray-100 shadow-sm',
};

interface WelcomeScreenProps {
  settings?: WelcomeScreenSettings;
  onStart: () => void;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export default function WelcomeScreen({ settings, onStart, viewMode = 'desktop' }: WelcomeScreenProps) {
  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  const layout = settings?.layout || 'simple';
  const bgImage = settings?.backgroundImage;
  const iconColor = (settings as any)?.iconColor || 'blue'; // Default to blue
  const IconComponent = iconMap[(settings as any)?.icon || 'sparkles'] || Sparkles; // Default to sparkles
  const title = settings?.title;
  const description = settings?.description;
  const buttonText = settings?.buttonText || 'Start';
  const showButton = settings?.showStartButton !== false; // Default true

  const renderContent = (isCover = false) => (
    <div className={`flex flex-col items-center justify-center ${isMobile ? 'px-0 py-8' : 'p-6 md:p-12'} w-full h-full text-center space-y-6`}>
      
       {/* Icon */}
       {layout === 'simple' && (
          <div className="flex justify-center mb-8">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${iconGlowClasses[iconColor]} bg-opacity-50 backdrop-blur-sm`}>
               <IconComponent className="w-12 h-12" strokeWidth={2} />
            </div>
          </div>
       )}

      {/* Title */}
      {title && (
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-5xl'} font-extrabold tracking-tight ${isCover ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
      )}

      {/* Description */}
      {description && (
        <p className={`${isMobile ? 'text-base' : 'text-xl'} whitespace-pre-wrap leading-relaxed max-w-2xl ${isCover ? 'text-white/90' : 'text-gray-500'}`}>
            {description}
        </p>
      )}

      {/* Start Button */}
      {showButton && (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className={`flex items-center justify-center gap-2 px-10 py-4 font-bold rounded-full text-lg shadow-xl hover:shadow-2xl transition-all w-full md:w-auto ${
                isCover 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
        >
            {buttonText}
        </motion.button>
      )}
    </div>
  );

  const renderImage = () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[300px] overflow-hidden">
          {bgImage ? (
              <img src={bgImage} alt="Welcome" className="w-full h-full object-cover" />
          ) : (
             // Sidebar placeholder logic from builder
             <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span className="text-sm">No Image</span>
            </div>
          )}
      </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full bg-white shadow-2xl overflow-hidden flex ${
          layout === 'split-left' ? 'flex-col md:flex-row' : 
          layout === 'split-right' ? 'flex-col-reverse md:flex-row-reverse' : 
          'flex-col'
      } relative ${
          isMobile || isTablet 
            ? 'min-h-full rounded-none max-w-full' 
            : 'min-h-[600px] rounded-2xl max-w-6xl'
      }`}
    >
      
      {/* SIMPLE LAYOUT */}
      {layout === 'simple' && (
          <div className={`flex flex-col items-center justify-center w-full ${isMobile || isTablet ? 'flex-1 h-full' : 'min-h-[500px]'}`}>
               {/* Image removed in favor of icon in renderContent */}
               
               <div className="w-full flex-1 flex items-center justify-center">
                    {renderContent()}
               </div>
          </div>
      )}

      {/* SPLIT LAYOUTS */}
      {(layout === 'split-left' || layout === 'split-right') && (
          <>
              <div className="w-full md:w-1/2 relative bg-gray-50 border-r border-gray-100 min-h-[300px] md:min-h-full">
                   {renderImage()}
              </div>
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4">
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
                  <div className="absolute inset-0 bg-gray-900" />
              )}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center px-4">
                   {renderContent(true)}
              </div>
          </div>
      )}

    </motion.div>
  );
}
