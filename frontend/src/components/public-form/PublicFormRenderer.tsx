import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, FormStatus } from '@/types';
import { Lock, FileQuestion, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Loader from '@/components/common/Loader';
import ThankYouScreen from '@/components/form-preview/ThankYouScreen';
import WelcomeScreen from '@/components/form-preview/WelcomeScreen';
import { useFormLogic } from '@/hooks/form/useFormLogic';
import { useFormSubmission } from '@/hooks/form/useFormSubmission';
import { ClassicLayout } from './ClassicLayout';
import { CardLayout } from './CardLayout';
import { FormProgressBar } from './FormProgressBar';
import { FormNavigation } from './FormNavigation';
import QuizTimer from './QuizTimer';
import { useFormNavigation } from './hooks/useFormNavigation';
import { useFormProgress } from './hooks/useFormProgress';
import { useQuizTimer, useSubmissionCheck } from './hooks/useQuizFeatures';
import { splitIntoPages, flattenFields } from './utils/formFieldUtils';

interface PublicFormRendererProps {
  form: Form | null;
  loading?: boolean;
  isPreview?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export default function PublicFormRenderer({ form, loading = false, isPreview = false, viewMode = 'desktop' }: PublicFormRendererProps) {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    submitting,
    submitted,
    submitForm,
    score,
    quizReview
  } = useFormSubmission({ form: form as Form, isPreview });

  const { checkingSubmission, hasAlreadySubmitted } = useSubmissionCheck({
    formId: form?.id,
    isPreview,
    loading
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    control,
    getValues,
  } = useForm({
    shouldUnregister: false,
  });

  const watchedValues = watch();
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logicValues = useMemo(() => {
     const values: Record<string, any> = {};
     if (!watchedValues) return values;
     Object.keys(watchedValues).forEach(key => {
       if (key.startsWith('field_')) {
         const id = key.replace('field_', '');
         values[id] = watchedValues[key];
       }
     });
     return values;
  }, [watchedValues]);

  const { hiddenFieldIds } = useFormLogic({
      fields: form?.fields || [],
      logicRules: form?.logicRules || [],
      formValues: logicValues
  });

  const { getDefaultValues } = useFormProgress({
    formId: form?.id,
    isPreview,
    submitted,
    watchedValues
  });

  // Load default values once
  useEffect(() => {
    const defaults = getDefaultValues();
    if (Object.keys(defaults).length > 0) {
      Object.entries(defaults).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [getDefaultValues, setValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handleTimeUp = async () => {
    if (!submitting && !submitted && form) {
      try {
        const currentValues = watchedValues || {};
        await submitForm(currentValues);
      } catch (error) {
        console.error('Force submit error:', error);
      }
    }
  };

  const { quizStartTime } = useQuizTimer({
    formId: form?.id,
    isQuiz: !!form?.isQuiz,
    isPreview,
    submitted,
    submitting,
    showWelcome,
    welcomeIsActive: form?.welcomeSettings?.isActive !== false,
    endTime: form?.quizSettings?.endTime,
    onTimeUp: handleTimeUp
  });

  const visibleFields = useMemo(() => {
    if (!form?.fields) return [];
    
    // Use utility to flatten fields (handle groups)
    const ordered = flattenFields(form.fields);

    return ordered.filter((field) => 
        !field.validation?.hidden && 
        !(field.options as any)?.hidden && 
        !hiddenFieldIds.has(field.id)
    );
  }, [form?.fields, hiddenFieldIds]);

  const pages = splitIntoPages(visibleFields);
  const totalPages = pages.length;
  const currentPageFields = pages[currentPageIndex] || [];
  const isCardLayout = form?.settings?.formLayout === 'card';
  const currentField = isCardLayout ? currentPageFields[currentCardIndex] : null;

  const {
    handleNext,
    handlePrevious,
    handlePreviousPage
  } = useFormNavigation({
    currentPageIndex,
    setCurrentPageIndex,
    currentCardIndex,
    setCurrentCardIndex,
    totalPages,
    currentPageFields,
    currentField,
    isCardLayout,
    trigger,
    getValues
  });

  // Scroll to top on page change or card change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageIndex, currentCardIndex]);

  const onSubmit = async (data: any) => {
    await submitForm(data);
  };

  if (checkingSubmission || loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('public.loading')}</p>
        </motion.div>
      </div>
    );
  }

  if (hasAlreadySubmitted) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('public.already_submitted_title')}</h2>
          <p className="text-gray-600 mb-6">{t('public.already_submitted_desc')}</p>
          <div className="text-sm text-gray-500">
            {t('public.thank_you')} 🙏
          </div>
        </motion.div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('public.form_not_found_title')}</h2>
          <p className="text-gray-600">{t('public.form_not_found_desc')}</p>
        </motion.div>
      </div>
    );
  }

  // Only check status if NOT in preview mode
  if (!isPreview && form.status !== FormStatus.PUBLISHED) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('public.form_unavailable_title')}</h2>
          <p className="text-gray-600">{t('public.form_unavailable_desc')}</p>
        </motion.div>
      </div>
    );
  }

  // Check quiz availability times
  const checkQuizAvailability = () => {
    if (!form?.isQuiz || isPreview) return { available: true, message: '' };
    
    const now = new Date();
    const startTime = form.quizSettings?.startTime ? new Date(form.quizSettings.startTime) : null;
    const endTime = form.quizSettings?.endTime ? new Date(form.quizSettings.endTime) : null;

    if (startTime && now < startTime) {
      return { 
        available: false, 
        message: `This quiz will be available starting ${startTime.toLocaleString()}` 
      };
    }

    if (endTime && now > endTime) {
      return { 
        available: false, 
        message: `This quiz closed on ${endTime.toLocaleString()}` 
      };
    }

    return { available: true, message: '' };
  };

  const availability = checkQuizAvailability();
  
  if (!availability.available && !isPreview) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('public.quiz_unavailable_title')}</h2>
          <p className="text-gray-600">{availability.message}</p>
        </motion.div>
      </div>
    );
  }

  /* Fix Thank You Screen Props */
  if (submitted) {
    const showScore = form.isQuiz && form.quizSettings?.showScore && form.quizSettings?.releaseScoreMode !== 'manual' && score;
    return (
      <ThankYouScreen 
        settings={form.thankYouSettings} 
        globalSettings={form.settings} 
        score={score}
        showScore={!!showScore}
        quizReview={quizReview}
        isQuiz={form.isQuiz}
        viewMode={viewMode}
      />
    );
  }

  const isWelcomeActive = form.welcomeSettings && form.welcomeSettings.isActive !== false;
  
  if (showWelcome && isWelcomeActive) {
    return (
      <WelcomeScreen 
        settings={form.welcomeSettings}
        onStart={() => setShowWelcome(false)} 
        viewMode={viewMode}
      />
    );
  }

  const isMobileView = viewMode === 'mobile';
  const isTabletView = viewMode === 'tablet';

  return (
    <div className={`min-h-screen bg-gray-50 ${isCardLayout ? 'min-h-screen flex flex-col' : ''} ${isMobileView ? 'text-sm' : ''}`}>
      {/* Background */}
      {form.settings?.backgroundImage && (
         <div 
           className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none"
           style={{ backgroundImage: `url(${form.settings.backgroundImage})` }}
         />
      )}

      {/* Quiz Timer */}
      {form.isQuiz && quizStartTime && !submitted && (
         <QuizTimer 
           startTime={quizStartTime} 
           timeLimitMinutes={form.quizSettings?.timeLimit || 0} 
           onTimeUp={handleTimeUp}
         />
      )}

       {/* Progress Bar */}
      {!submitted && form.settings?.showProgressBar && (
        <div className="fixed top-0 left-0 right-0 z-30">
           {/* Revert to using the existing FormProgressBar interface if possible, or update it. 
               The existing one needs: visibleFields, watchedValues, isCardLayout, currentCardIndex, totalQuestions
           */}
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
      >
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className={isCardLayout ? 'h-full' : ''}>
           <AnimatePresence mode="wait">
             <motion.div
                key={isCardLayout ? currentCardIndex : currentPageIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={isCardLayout ? `bg-white shadow-xl rounded-xl overflow-hidden flex flex-col ${isMobileView ? 'max-h-[90vh] mx-2 rounded-2xl' : isTabletView ? 'max-h-[85vh] mx-4 rounded-xl' : 'max-h-[80vh] mx-0 rounded-2xl'} border border-gray-100/50` : 'space-y-4'}
             >
                 {/* Card Header Effect */}
                <div className={`
                    ${isCardLayout 
                       ? 'relative bg-white/80 backdrop-blur-sm border-b border-gray-100 flex-shrink-0 z-20' 
                       : 'bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6'
                    }
                `}>
                   {isCardLayout && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />}

                   {/* Form Header Content */}
                   {((!isCardLayout && currentPageIndex === 0) || (isCardLayout)) && (
                      <div className={isCardLayout ? `${isMobileView ? 'p-4' : isTabletView ? 'p-5' : 'p-6 md:p-8'} space-y-2` : 'space-y-2'}>
                        {form.logoUrl && (
                           <div className="flex justify-center mb-6">
                              <img src={form.logoUrl} alt="Logo" className="h-16 object-contain" />
                           </div>
                        )}
                        <h1 className={`font-bold text-gray-900 ${isMobileView ? 'text-lg' : isTabletView ? 'text-xl' : isCardLayout ? 'text-2xl md:text-3xl' : 'text-3xl'}`}>
                           {form.title}
                        </h1>
                        {form.description && (
                           <div 
                             className="text-gray-600 prose prose-sm max-w-none mt-2"
                             dangerouslySetInnerHTML={{ __html: form.description }} 
                           />
                        )}

                        {/* Collect Email Field */}
                        {form.settings?.collectEmail && !isCardLayout && (
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <label className="block text-sm font-medium text-blue-900 mb-1">
                              {t('public.email_label')} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              {...register('respondentEmail', { 
                                required: t('public.email_required'),
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: t('public.email_invalid')
                                }
                              })}
                              className={`w-full px-4 py-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                                errors.respondentEmail ? 'border-red-500' : 'border-blue-200'
                              }`}
                              placeholder="name@example.com"
                            />
                            {errors.respondentEmail && (
                              <p className="mt-1 text-xs text-red-500 font-medium">
                                {errors.respondentEmail.message as string}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {t('public.email_collecting_notice')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                  <div className={`${isCardLayout ? `flex-1 overflow-y-auto ${isMobileView ? 'p-4' : isTabletView ? 'p-5' : 'p-6'}` : `flex flex-wrap gap-x-6 gap-y-0 ${!isMobileView ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8' : ''}`} ${isMobileView ? 'min-h-[150px]' : 'min-h-[200px] md:min-h-[300px]'}`}>
                    {isCardLayout ? (
                      // Card Layout
                      <CardLayout 
                        currentField={currentField}
                        currentCardIndex={currentCardIndex}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        control={control}
                        form={form}
                      />
                    ) : (
                      // Classic Layout
                      <ClassicLayout
                        currentPageFields={currentPageFields}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        control={control}
                        form={form}
                      />
                    )}
                  </div>

                {/* Navigation Buttons */}
                <FormNavigation
                    isCardLayout={!!isCardLayout}
                    isFirstPage={(isCardLayout ? currentCardIndex === 0 : currentPageIndex === 0) && currentPageIndex === 0}
                    isLastPage={!((isCardLayout && currentCardIndex < currentPageFields.length - 1) || currentPageIndex < totalPages - 1)}
                    handlePrevious={isCardLayout ? handlePrevious : handlePreviousPage}
                    handleNext={handleNext}
                    submitting={submitting}
                    submitButtonText={form.settings?.submitButtonText || 'Submit'}
                />

             </motion.div>
           </AnimatePresence>
        </form>
        
        {/* Footer */}
        <div className={`${isMobileView ? 'mt-4' : 'mt-8'} text-center`}>
            {form.settings?.footerText && (
               <p className="text-sm text-gray-400 mb-2">{form.settings.footerText}</p>
            )}

        </div>
      </motion.div>
    </div>
  );
}
