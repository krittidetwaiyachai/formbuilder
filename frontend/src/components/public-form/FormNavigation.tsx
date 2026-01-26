import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '@/components/common/Loader';
import { useTranslation } from 'react-i18next';

interface FormNavigationProps {
  isCardLayout: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  handlePrevious: () => void;
  handleNext: () => void;
  submitting: boolean;
  submitButtonText?: string;
}

export function FormNavigation({

  isFirstPage,
  isLastPage,
  handlePrevious,
  handleNext,
  submitting,
  submitButtonText = 'Submit',
}: FormNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-12 pt-4 pb-8 flex items-center justify-between px-8 md:px-12">
       <button
         type="button"
         onClick={handlePrevious}
         disabled={isFirstPage}
         className={`flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 disabled:opacity-0 transition-colors ${isFirstPage ? 'pointer-events-none' : ''}`}
       >
          <ChevronLeft className="h-4 w-4" />
          {t('public.back')}
       </button>

       {!isLastPage ? (
          <motion.button
            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            style={{ 
                backgroundColor: 'var(--primary)', 
                color: '#ffffff', 
                borderRadius: 'var(--radius)'
            }}
          >
             {t('public.next')}
             <ChevronRight className="h-4 w-4" />
          </motion.button>
       ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ 
                backgroundColor: 'var(--primary)', 
                color: '#ffffff',
                borderRadius: 'var(--radius)'
            }}
          >
             {submitting ? (
                <Loader />
             ) : (
                 submitButtonText === 'Submit' ? t('public.submit') : submitButtonText
             )}
          </motion.button>
       )}
    </div>
  );
}
