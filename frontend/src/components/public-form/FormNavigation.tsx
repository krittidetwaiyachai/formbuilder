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
    <div className="mt-8 md:mt-12 pt-6 md:pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
       <button
         type="button"
         onClick={handlePrevious}
         disabled={isFirstPage}
         className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors w-full md:w-auto"
       >
          <ChevronLeft className="h-4 w-4" />
          {t('public.back')}
       </button>

       {!isLastPage ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
          >
             {t('public.next')}
             <ChevronRight className="h-4 w-4" />
          </motion.button>
       ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
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
