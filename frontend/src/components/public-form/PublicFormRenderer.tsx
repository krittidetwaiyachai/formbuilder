import { motion } from 'framer-motion';
import { Form, FormStatus } from '@/types';
import { Lock, FileQuestion, CheckCircle } from 'lucide-react';
import Loader from '@/components/common/Loader';
import ThankYouScreen from '@/components/form-preview/ThankYouScreen';
import WelcomeScreen from '@/components/form-preview/WelcomeScreen';
import LoginModal from '@/components/auth/LoginModal';
import { ClassicLayout } from './ClassicLayout';
import { CardLayout } from './CardLayout';
import { FormNavigation } from './FormNavigation';
import { usePublicFormLogic } from './hooks/usePublicFormLogic';
import { PublicFormLayout } from './PublicFormLayout';
import { AnimatePresence } from 'framer-motion';
import { sanitize } from '@/utils/sanitization';

interface PublicFormRendererProps {
  form: Form | null;
  loading?: boolean;
  isPreview?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export default function PublicFormRenderer(props: PublicFormRendererProps) {
  const { form, loading = false, isPreview = false, viewMode = 'desktop' } = props;
  
  const {
    t,
    showWelcome,
    setShowWelcome,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAuthenticated,
    formRef,
    
    submitting,
    submitted,
    score,
    quizReview,
    checkingSubmission,
    hasAlreadySubmitted,
    currentCardIndex,
    currentPageIndex,
    cardStyleVars,
    
    methods: { register, formState: { errors }, watch, setValue, control, handleSubmit },
    submitForm,
    onSubmit,
    
    visibleFields,
    totalPages,
    currentPageFields,
    currentField,
    isCardLayout,
    isWelcomeScreenActive,
    quizStartTime,
    availability,
    
    navigation: { handleNext, handlePrevious, handlePreviousPage },
    handleTimeUp
  } = usePublicFormLogic(props);

  if (checkingSubmission || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader className="mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('public.loading')}</p>
        </motion.div>
      </div>
    );
  }

  if (hasAlreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-2xl shadow-xl p-10 text-center border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
        >
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
            <CheckCircle className="h-8 w-8" style={{ color: 'var(--primary)' }} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>{t('public.already_submitted_title')}</h2>
          <p className="mb-6" style={{ color: 'var(--text)', opacity: 0.8 }}>{t('public.already_submitted_desc')}</p>
        </motion.div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-2xl shadow-xl p-10 text-center border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
        >
          <FileQuestion className="mx-auto h-16 w-16 opacity-50 mb-4" />
          <h2 className="text-2xl font-bold mb-4">{t('public.form_not_found_title')}</h2>
          <p>{t('public.form_not_found_desc')}</p>
        </motion.div>
      </div>
    );
  }

  if (!isPreview && form.status !== FormStatus.PUBLISHED) {
     return (
       <div className="h-full flex items-center justify-center px-4">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-10 shadow-xl rounded-2xl border bg-white/90">
            <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('public.form_unavailable_title')}</h2>
            <p className="text-gray-500">{t('public.form_unavailable_desc')}</p>
         </motion.div>
       </div>
     );
  }

  if (form.isQuiz && !isPreview && form.quizSettings?.requireSignIn && !isAuthenticated) {
     return (
       <div className="min-h-screen flex items-center justify-center px-4">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full rounded-2xl shadow-xl p-10 text-center border bg-white/90">
           <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
           <h2 className="text-xl font-bold mb-4">{t('public.auth_required_title')}</h2>
           <p className="text-gray-500 mb-6">{t('public.auth_required_desc')}</p>
           <button onClick={() => setIsLoginModalOpen(true)} className="w-full py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
             {t('public.sign_in')}
           </button>
         </motion.div>
         <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={() => setIsLoginModalOpen(false)} />
       </div>
     );
  }

  if (!availability.available && !isPreview) {
      return (
        <div className="h-full flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-10 shadow-xl rounded-2xl border bg-white/90">
             <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
             <h2 className="text-xl font-bold mb-2">{t('public.quiz_unavailable_title')}</h2>
             <p className="text-gray-500">{availability.message}</p>
          </motion.div>
        </div>
      );
  }

  if (submitted) {
    const showScore = form.isQuiz && form.quizSettings?.showScore && score;
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: form.settings?.backgroundImage ? `url(${form.settings.backgroundImage})` : undefined, backgroundSize: 'cover' }}>
        <div className="relative z-10 w-full flex justify-center">
            <ThankYouScreen 
              settings={form.thankYouSettings} 
              globalSettings={form.settings} 
              score={score}
              showScore={!!showScore}
              allowViewMissedQuestions={!!form.quizSettings?.allowViewMissedQuestions}
              showExplanation={!!form.quizSettings?.showExplanation}
              quizReview={quizReview}
              isQuiz={form.isQuiz}
              viewMode={viewMode}
            />
        </div>
      </div>
    );
  }

  if (showWelcome && isWelcomeScreenActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: form.settings?.backgroundImage ? `url(${form.settings.backgroundImage})` : undefined, backgroundSize: 'cover' }}>
        <div className="relative z-10 w-full flex justify-center">
            <WelcomeScreen settings={form.welcomeSettings} onStart={() => setShowWelcome(false)} viewMode={viewMode} />
        </div>
      </div>
    );
  }

  const isMobileView = viewMode === 'mobile';
  const isTabletView = viewMode === 'tablet';

  return (
    <PublicFormLayout
      form={form}
      viewMode={viewMode || 'desktop'}
      isCardLayout={!!isCardLayout}
      isMobileView={isMobileView}
      isTabletView={isTabletView}
      submitted={submitted}
      visibleFields={visibleFields}
      watchedValues={watch()}
      currentCardIndex={currentCardIndex}
      quizStartTime={quizStartTime}
      onTimeUp={handleTimeUp}
      cardStyleVars={cardStyleVars}
      onSubmit={handleSubmit(onSubmit)}
      formRef={formRef}
    >
        <AnimatePresence mode="wait">
            <motion.div
            key={isCardLayout ? currentCardIndex : currentPageIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
            className={isCardLayout ? `relative flex flex-col ${isMobileView ? 'max-h-[90vh] mx-2' : isTabletView ? 'max-h-[85vh] mx-4' : 'max-h-[80vh] mx-auto w-full max-w-3xl'} border shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300` : 'space-y-4'}
            style={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--card-border)',
                boxShadow: 'var(--card-shadow)',
                color: 'var(--text)',
                ...cardStyleVars 
            }}
            >
                <div className={`${isCardLayout ? 'relative z-20 flex-shrink-0 px-8 pt-8 pb-4 border-b' : 'rounded-xl shadow-sm border p-6 md:p-8 mb-6 backdrop-blur-md'}`} 
                    style={{ backgroundColor: isCardLayout ? 'transparent' : 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                >
                    {isCardLayout && <div className="absolute top-0 left-0 w-full h-1.5 bg-black" />}
                    {((!isCardLayout && currentPageIndex === 0) || (isCardLayout)) && (
                        <div className={isCardLayout ? `${isMobileView ? 'p-4' : isTabletView ? 'p-5' : 'p-6 md:p-8'} space-y-2` : 'space-y-2'}>
                            {form.logoUrl && <div className="flex justify-center mb-6"><img src={form.logoUrl} alt="Logo" className="h-16 object-contain" /></div>}
                            <h1 className={`font-bold ${isMobileView ? 'text-lg' : isTabletView ? 'text-xl' : isCardLayout ? 'text-2xl md:text-3xl' : 'text-3xl'}`} style={{ color: 'var(--text)' }}>
                                {form.title}
                            </h1>
                            {form.description && (
                                <div className="prose prose-sm max-w-none mt-2" dangerouslySetInnerHTML={{ __html: sanitize(form.description) }} style={{ color: 'var(--text)', opacity: 0.8 }} />
                            )}
                            {form.settings?.collectEmail && !isCardLayout && (
                                <div className="mt-6 p-4 rounded-lg border transition-colors" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                                        {t('public.email_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        {...register('respondentEmail', { required: t('public.email_required'), pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('public.email_invalid') } })}
                                        className="w-full px-4 py-2 border outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[color:var(--primary)]/20 border-[color:var(--input-border)] focus:border-[color:var(--primary)]"
                                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text)', borderRadius: 'var(--radius)', ...(errors.respondentEmail ? { borderColor: '#ef4444' } : {}) }}
                                        placeholder={t('public.placeholder.email')}
                                    />
                                    {errors.respondentEmail && <p className="mt-1 text-xs text-red-500 font-medium">{errors.respondentEmail.message as string}</p>}
                                    <p className="mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--primary)', opacity: 0.8 }}><Lock className="w-3 h-3" />{t('public.email_collecting_notice')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={`${isCardLayout ? `flex-1 overflow-y-auto ${isMobileView ? 'p-4' : isTabletView ? 'p-5' : 'p-6'}` : `flex flex-col ${isMobileView ? 'p-4' : 'rounded-xl shadow-sm border p-6 md:p-8 backdrop-blur-md'}`} ${isMobileView ? 'min-h-[150px]' : 'min-h-[200px] md:min-h-[300px]'}`}
                    style={!isCardLayout && !isMobileView ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
                >
                    {isCardLayout ? (
                        <CardLayout currentField={currentField} currentCardIndex={currentCardIndex} register={register} errors={errors} watch={watch} setValue={setValue} control={control} form={form} />
                    ) : (
                        <ClassicLayout currentPageFields={currentPageFields} register={register} errors={errors} watch={watch} setValue={setValue} control={control} form={form} />
                    )}
                </div>

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
    </PublicFormLayout>
  );
}
