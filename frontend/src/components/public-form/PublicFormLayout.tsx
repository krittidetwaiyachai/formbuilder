import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form } from '@/types';
import { FormProgressBar } from './FormProgressBar';
import QuizTimer from './QuizTimer';

interface PublicFormLayoutProps {
  form: Form;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  isCardLayout: boolean;
  isMobileView: boolean;
  isTabletView: boolean;
  submitted: boolean;
  visibleFields: any[];
  watchedValues: any;
  currentCardIndex: number;
  quizStartTime: Date | null;
  onTimeUp: () => void;
  cardStyleVars: React.CSSProperties;
  children: ReactNode;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  formRef: React.RefObject<HTMLFormElement>;
}

export function PublicFormLayout({
  form,
  viewMode,
  isCardLayout,
  isMobileView,
  isTabletView,
  submitted,
  visibleFields,
  watchedValues,
  currentCardIndex,
  quizStartTime,
  onTimeUp,
  cardStyleVars,
  children,
  onSubmit,
  formRef
}: PublicFormLayoutProps) {

  return (
    <div className={`min-h-screen ${isCardLayout ? 'min-h-screen flex flex-col' : ''} ${isMobileView ? 'text-sm' : ''}`}>
      {(() => {
        const fontFamily = form.settings?.fontFamily || '';
        const primaryColor = form.settings?.primaryColor || '';
        const isThailandPost = fontFamily === 'Sarabun' && primaryColor === '#ED1C24' && (form.settings?.backgroundType === 'image' || form.settings?.backgroundImage?.includes('thailand-post'));

        if (isThailandPost) {
            return (
                <>
                    <div 
                        key="thailand-post-watermark"
                        className="fixed bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none z-0 transition-opacity duration-300"
                        style={{
                            backgroundImage: 'url(/themes/thailand-post-logo.png)',
                            backgroundSize: 'contain',
                            backgroundPosition: 'bottom right',
                            backgroundRepeat: 'no-repeat',
                            filter: 'grayscale(100%)'
                        }}
                    />
                    <div className="fixed top-0 right-0 h-32 w-32 bg-gradient-to-bl from-[#ED1C24]/10 to-transparent pointer-events-none" />
                </>
            );
        }

        let emojis: string[] = [];
        if (fontFamily === 'Quicksand' && form.settings?.primaryColor === '#EC4899') emojis = ['💕', '💖', '💝', '🌹', '💐', '💗'];
        else if (fontFamily === 'Creepster') emojis = ['🎃', '👻', '🦇', '🕷️', '🕸️', '💀'];
        else if (fontFamily === 'Playfair Display' && form.settings?.primaryColor === '#FCD34D') emojis = ['🎊', '🎉', '✨', '🎆', '🎇', '🥂'];
        else if (fontFamily === 'Sarabun' && form.settings?.primaryColor === '#0EA5E9') emojis = ['💦', '🌊', '💧', '🐘', '🌺', '☀️'];
        else if (fontFamily === 'Sarabun' && form.settings?.primaryColor === '#F59E0B') emojis = ['🏮', '🌕', '🪔', '🌸', '🕯️', '⭐'];
        
        if (emojis.length === 0) return null;
        
        return (
          <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {emojis.map((emoji, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl opacity-20"
                initial={{ x: Math.random() * window.innerWidth, y: -100, rotate: 0 }}
                animate={{ y: window.innerHeight + 100, rotate: 360, x: Math.random() * window.innerWidth }}
                transition={{ duration: 15 + Math.random() * 10, repeat: Infinity, delay: i * 2, ease: "linear" }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        );
      })()}

      {form.settings?.backgroundImage && (
         <div 
           className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none"
           style={{ backgroundImage: `url(${form.settings.backgroundImage})` }}
         />
      )}

      {form.isQuiz && quizStartTime && !submitted && (form.quizSettings?.timeLimit || 0) > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
             <QuizTimer startTime={quizStartTime} timeLimitMinutes={form.quizSettings?.timeLimit || 0} onTimeUp={onTimeUp} />
          </div>
      )}

      {!submitted && form.settings?.showProgressBar && (
        <div className="fixed top-0 left-0 right-0 z-30">
           <FormProgressBar 
              visibleFields={visibleFields}
              watchedValues={watchedValues}
              isCardLayout={!!isCardLayout}
              currentCardIndex={currentCardIndex}
              totalQuestions={visibleFields.length}
           />
        </div>
      )}

      <motion.div 
        className={`relative z-10 w-full mx-auto ${isMobileView ? 'max-w-full px-4' : isTabletView ? 'max-w-2xl px-6' : 'max-w-3xl'} ${isCardLayout ? 'flex-1 flex flex-col justify-center py-4' : isMobileView ? 'pt-6 pb-8 px-4' : 'pt-20 pb-12 px-4'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
            '--primary': form.settings?.primaryColor || '#000000',
            '--background': form.settings?.backgroundColor || '#ffffff',
            '--text': form.settings?.textColor || '#000000',
            '--font-family': form.settings?.fontFamily || 'Inter',
            '--radius': form.settings?.borderRadius === 'none' ? '0px' : 
                        form.settings?.borderRadius === 'small' ? '0.25rem' : 
                        form.settings?.borderRadius === 'large' ? '0.75rem' : '0.5rem',
        } as React.CSSProperties}
      >
        <form ref={formRef} onSubmit={onSubmit} className={isCardLayout ? 'h-full' : ''}>
           {children}
        </form>
        
        <div className={`${isMobileView ? 'mt-4' : 'mt-8'} text-center`}>
            {form.settings?.footerText && (
               <p className="text-sm text-gray-400 mb-2">{form.settings.footerText}</p>
            )}
        </div>
      </motion.div>
    </div>
  );
}
