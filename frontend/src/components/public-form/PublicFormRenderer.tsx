import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, FormStatus, FieldType } from '@/types';
import { Lock, FileQuestion, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { getBrowserFingerprint } from '@/utils/fingerprint';
import Loader from '@/components/common/Loader';
import ThankYouScreen from '@/components/form-preview/ThankYouScreen';
import WelcomeScreen from '@/components/form-preview/WelcomeScreen';
import { useFormLogic } from '@/hooks/form/useFormLogic';
import { useFormSubmission } from '@/hooks/form/useFormSubmission';
import { ClassicLayout } from './ClassicLayout';
import { CardLayout } from './CardLayout';
import { FormProgressBar } from './FormProgressBar';
import { FormNavigation } from './FormNavigation';

interface PublicFormRendererProps {
  form: Form | null;
  loading?: boolean;
  isPreview?: boolean;
}

export default function PublicFormRenderer({ form, loading = false, isPreview = false }: PublicFormRendererProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  const {
    submitting,
    submitted,
    score,
    quizReview,
    submitForm,
  } = useFormSubmission({ form: form as Form, isPreview });

  // Load saved progress before initializing form
  const getDefaultValues = () => {
    if (!form?.id || isPreview) return {};
    try {
      const savedData = localStorage.getItem(`form_progress_${form.id}`);
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
      console.error('Failed to load saved progress', e);
      return {};
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    control
  } = useForm({
    shouldUnregister: false,
    defaultValues: getDefaultValues()
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

  // Check if user has already submitted
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!form?.id || isPreview || loading) {
        setCheckingSubmission(false);
        return;
      }

      try {
        const fingerprint = await getBrowserFingerprint();
        const response = await api.get(`/responses/check/${form.id}`, {
          params: { fingerprint },
        });

        if (response.data.hasSubmitted) {
          setHasAlreadySubmitted(true);
        }
      } catch (error) {
        console.error('Failed to check submission status:', error);
      } finally {
        setCheckingSubmission(false);
      }
    };

    checkSubmissionStatus();
  }, [form?.id, isPreview, loading]);

  const { hiddenFieldIds } = useFormLogic({
      fields: form?.fields || [],
      logicRules: form?.logicRules || [],
      formValues: logicValues
  });

  // Save progress to localStorage on change
  useEffect(() => {
    if (!form?.id || submitted || isPreview || !watchedValues) return;
    
    const timeoutId = setTimeout(() => {
        localStorage.setItem(`form_progress_${form.id}`, JSON.stringify(watchedValues));
    }, 500); // Debounce save

    return () => clearTimeout(timeoutId);
  }, [watchedValues, form?.id, submitted, isPreview]);
  
  // Clear progress on successful submission
  useEffect(() => {
    if (submitted && form?.id && !isPreview) {
        localStorage.removeItem(`form_progress_${form.id}`);
    }
  }, [submitted, form?.id, isPreview]);

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

  // Split fields into pages based on PAGE_BREAK
  const splitIntoPages = (fields: any[]) => {
    const pages: any[][] = [];
    let currentPage: any[] = [];
    
    fields.forEach(field => {
      if (field.type === 'PAGE_BREAK') {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
        }
      } else {
        currentPage.push(field);
      }
    });
    
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }
    
    return pages.length > 0 ? pages : [fields];
  };

  const isCardLayout = form?.settings?.formLayout === 'card';
  /* 
    Logic to flatten fields recursively:
    1. Group fields by ID for children lookup.
    2. Sort roots and children by 'order'.
    3. Recursively expand GROUP fields to their children, effectively removing the GROUP container 
       and placing children in the correct sorted position.
  */
  const visibleFields = useMemo(() => {
    if (!form?.fields) return [];

    const allFields = form.fields;
    const childrenMap = new Map<string, FieldType[]>(); 
    
    // Index children
    allFields.forEach(f => {
      if (f.groupId) {
        if (!childrenMap.has(f.groupId)) childrenMap.set(f.groupId, []);
        childrenMap.get(f.groupId)?.push(f as any);
      }
    });

    // Sort children
    childrenMap.forEach(list => list.sort((a: any, b: any) => a.order - b.order));

    const visit = (field: any): any[] => {
      // If it's a group, don't return the group itself, just its children recursively
      if (field.type === FieldType.GROUP) {
        const children = childrenMap.get(field.id) || [];
        return children.flatMap(visit);
      }
      return [field];
    };

    const roots = allFields.filter(f => !f.groupId).sort((a, b) => a.order - b.order);
    const ordered = roots.flatMap(visit);

    return ordered.filter((field) => 
        !field.validation?.hidden && 
        !(field.options as any)?.hidden && 
        !hiddenFieldIds.has(field.id)
    );
  }, [form?.fields, hiddenFieldIds]);

  const pages = splitIntoPages(visibleFields);
  const totalPages = pages.length;
  const currentPageFields = pages[currentPageIndex] || [];
  const inputFieldTypes = [
    FieldType.TEXT, FieldType.EMAIL, FieldType.PHONE, FieldType.NUMBER, 
    FieldType.TEXTAREA, FieldType.DROPDOWN, FieldType.RADIO, FieldType.CHECKBOX, 
    FieldType.DATE, FieldType.TIME, FieldType.RATE, FieldType.FULLNAME, 
    FieldType.ADDRESS
  ];

  const totalQuestions = visibleFields.filter(f => inputFieldTypes.includes(f.type)).length;
  const currentField = isCardLayout ? currentPageFields[currentCardIndex] : null;

  // Validate current field before moving next in card layout
  const validateCurrentField = async () => {
    if (isCardLayout && currentField) {
      const fieldName = `field_${currentField.id}`;
      // Verify if field is required
      if (currentField.validation?.required) {
         const result = await trigger(fieldName);
         return result;
      }
    }
    return true;
  };

  // Validate all fields on current page (Classic Layout)
  const validateCurrentPage = async () => {
    const fieldsToValidate = currentPageFields
        .filter(f => inputFieldTypes.includes(f.type))
        .map(f => `field_${f.id}`);
    
    if (fieldsToValidate.length === 0) return true;
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNextPage = async () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setCurrentCardIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setCurrentCardIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = async () => {
    if (isCardLayout) {
        const isValid = await validateCurrentField();
        if (!isValid) return;

        if (currentCardIndex < currentPageFields.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else if (currentPageIndex < totalPages - 1) {
             // Card layout transitions pages automatically when last card done?
             // Usually yes, but let's stick to explicit next button logic handling it.
             handleNextPage();
        }
    } else {
        // Classic Layout
        const isValid = await validateCurrentPage();
        if (!isValid) return;
        
        handleNextPage();
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    } else if (currentPageIndex > 0) {
        // Go to last card of previous page? 
        // For simplicity, just go to previous page start (or we'd need to calc last index)
        setCurrentPageIndex(prev => prev - 1);
        // We'd ideally find the last index of that page, but 0 is safe
        setCurrentCardIndex(0); 
    }
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
          <p className="text-gray-500 font-medium">Loading...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Already Submitted</h2>
          <p className="text-gray-600 mb-6">You have already submitted a response to this form. Multiple submissions are not allowed.</p>
          <div className="text-sm text-gray-500">
            Thank you for your participation! 🙏
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h2>
          <p className="text-gray-600">The form you are looking for does not exist or has been deleted.</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Not Available</h2>
          <p className="text-gray-600">This form is currently not accepting responses.</p>
        </motion.div>
      </div>
    );
  }

  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={`h-full w-full bg-white overflow-y-auto relative flex ${form?.isQuiz ? 'items-start pt-4 pb-0 px-4 sm:px-6 lg:px-8' : 'items-center p-4 sm:p-6 lg:p-8'} justify-center`}>
      <div className="w-full max-w-4xl flex items-center justify-center">
         {children}
      </div>
    </div>
  );

  // Welcome Screen
  // Show welcome screen if settings exist and isActive is not explicitly false
  if (showWelcome && form.welcomeSettings && form.welcomeSettings.isActive !== false) {
    return (
      <BackgroundWrapper>
        <WelcomeScreen 
            settings={form.welcomeSettings} 
            onStart={() => setShowWelcome(false)} 
        />
      </BackgroundWrapper>
    );
  }

  // Thank You Screen
  if (submitted) {
    // if (!form) return null; // Already checked
    const showScore = form.isQuiz && form.quizSettings?.showScore && form.quizSettings?.releaseScoreMode !== 'manual' && score;
    return (
      <BackgroundWrapper>
        <ThankYouScreen 
          settings={form.thankYouSettings} 
          globalSettings={form.settings}
          score={score}
          showScore={!!showScore}
          quizReview={quizReview}
          isQuiz={form.isQuiz}
        />
      </BackgroundWrapper>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col items-center overflow-y-auto py-6 px-0 sm:px-6 scrollbar-hide">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Progress Bar (Sticky Top) */}
        {form.settings?.showProgressBar && totalQuestions > 0 && (
          <FormProgressBar 
            visibleFields={visibleFields}
            watchedValues={watchedValues}
            isCardLayout={!!isCardLayout}
            currentCardIndex={currentCardIndex}
            totalQuestions={totalQuestions}
          />
        )}

        <form onSubmit={handleSubmit(submitForm)} className="w-full">
           <AnimatePresence mode='wait'>
             <motion.div
               key={isCardLayout ? currentCardIndex : currentPageIndex}
               initial={{ opacity: 0, y: 20, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -20, scale: 0.98 }}
               transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
               className="bg-white rounded-none md:rounded-2xl shadow-none md:shadow-2xl border-0 md:border border-gray-100 p-1 md:p-12"
             >
                {/* Header */}
                <div className="mb-8 pb-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                    {form.description && (
                       <p className="mt-2 text-gray-500 text-sm leading-relaxed">{form.description}</p>
                    )}
                    
                    {/* Collect Email Field */}
                    {form.settings?.collectEmail && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          {...register('respondentEmail', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
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
                          This form is collecting emails automatically.
                        </p>
                      </div>
                    )}
                </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-6 md:gap-y-10 min-h-[200px] md:min-h-[300px]">
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
                    handleNext={isCardLayout ? handleNext : handleNextPage}
                    submitting={submitting}
                    submitButtonText={form.settings?.submitButtonText || 'Submit'}
                />

             </motion.div>
           </AnimatePresence>
        </form>
        
        {/* Footer */}
        <div className="mt-8 text-center">
            {form.settings?.footerText && (
               <p className="text-sm text-gray-400 mb-2">{form.settings.footerText}</p>
            )}

        </div>
      </motion.div>
    </div>
  );
}
