import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form, FormStatus, FieldType } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useFormLogic } from '@/hooks/form/useFormLogic';
import { useFormSubmission } from '@/hooks/form/useFormSubmission';
import { useFormProgress } from './useFormProgress';
import { useFormNavigation } from './useFormNavigation';
import { useQuizTimer, useSubmissionCheck } from './useQuizFeatures';
import { splitIntoPages, flattenFields } from '../utils/formFieldUtils';

interface UsePublicFormLogicProps {
  form: Form | null;
  loading?: boolean;
  isPreview?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

export function usePublicFormLogic({ form, loading = false, isPreview = false }: UsePublicFormLogicProps) {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const isAuthenticated = useAuthStore ? useAuthStore((state: any) => state.isAuthenticated) : false;

  useEffect(() => {
    if (!form?.settings) return;
    
    const root = document.documentElement;
    const settings = form.settings;
    
    root.style.setProperty('--primary', settings.primaryColor || '#000000');
    root.style.setProperty('--background', settings.backgroundColor || '#ffffff');
    root.style.setProperty('--text', settings.textColor || '#1E293B');
    root.style.setProperty('--quiz-correct', settings.primaryColor || '#000000');
    root.style.setProperty('--quiz-incorrect', '#ef4444');
    root.style.setProperty('--radius', 
      settings.borderRadius === 'none' ? '0px' :
      settings.borderRadius === 'small' ? '0.25rem' :
      settings.borderRadius === 'large' ? '0.75rem' : '0.5rem'
    );
    root.style.setProperty('--font-family', settings.fontFamily || 'Inter');
    
    document.body.style.fontFamily = settings.fontFamily || 'Inter';
    document.body.style.backgroundColor = settings.backgroundColor || '#ffffff';
    document.documentElement.style.backgroundColor = settings.backgroundColor || '#ffffff';
    
    return () => {
      ['--primary', '--background', '--text', '--quiz-correct', '--quiz-incorrect', 
       '--radius', '--font-family', '--card-bg', '--card-border', '--card-shadow',
       '--input-bg', '--input-border', '--divider', 'color-scheme', 'accent-color']
       .forEach(prop => root.style.removeProperty(prop));
       
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [form?.settings]);

  const getBrightness = (hexColor: string) => {
    const c = hexColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const isTextLight = useMemo(() => {
      if (!form?.settings?.textColor) return false;
      return getBrightness(form.settings.textColor) > 150;
  }, [form?.settings?.textColor]);

  useEffect(() => {
    if (!form?.settings?.textColor) return;
    const root = document.documentElement;
    const isLight = isTextLight;
    
    if (isLight) {
      root.style.setProperty('--card-bg', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--card-shadow', '0 25px 50px -12px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--input-bg', 'rgba(0, 0, 0, 0.25)');
      root.style.setProperty('--input-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--divider', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--popover-bg', 'var(--background)');
      root.style.setProperty('--color-scheme', 'dark');
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--card-shadow', '0 20px 40px -10px rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--input-bg', 'rgba(240, 240, 246, 0.6)');
      root.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--divider', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--popover-bg', 'var(--background)');
      root.style.setProperty('--color-scheme', 'light');
      root.style.setProperty('color-scheme', 'light');
    }
    root.style.setProperty('accent-color', 'var(--primary)');

    let styleTag = document.getElementById('theme-dynamic-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-dynamic-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
      input[type="date"], input[type="time"], input[type="datetime-local"] {
        accent-color: ${form.settings.primaryColor} !important;
        color-scheme: ${isLight ? 'dark' : 'light'} !important;
      }
    `;

    return () => {
      const tag = document.getElementById('theme-dynamic-styles');
      if (tag) tag.remove();
    };
  }, [form?.settings?.textColor, form?.settings?.primaryColor, isTextLight]);

  const cardStyleVars = useMemo(() => {
     if (isTextLight) {
        return {
            '--card-bg': 'rgba(0, 0, 0, 0.15)',
            '--card-border': 'rgba(255, 255, 255, 0.08)',
            '--card-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            '--input-bg': 'rgba(0, 0, 0, 0.25)', 
            '--input-border': 'rgba(255, 255, 255, 0.1)',
            '--divider': 'rgba(255, 255, 255, 0.08)',
        } as React.CSSProperties;
     } else {
        return {
            '--card-bg': 'rgba(255, 255, 255, 0.85)',
            '--card-border': 'rgba(0, 0, 0, 0.05)',
            '--card-shadow': '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
            '--input-bg': 'rgba(240, 240, 246, 0.6)', 
            '--input-border': 'rgba(0, 0, 0, 0.1)',
            '--divider': 'rgba(0, 0, 0, 0.08)',
        } as React.CSSProperties;
     }
  }, [isTextLight]);

  const { submitting, submitted, submitForm, score, quizReview } = useFormSubmission({ form: form as Form, isPreview });
  const { checkingSubmission, hasAlreadySubmitted } = useSubmissionCheck({ formId: form?.id, isPreview, loading });
  
  const methods = useForm({ shouldUnregister: false });
  const { watch, setValue, trigger, getValues } = methods;
  const watchedValues = watch();

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
        await submitForm(watchedValues || {});
      } catch (error) {
        console.error('Force submit error:', error);
      }
    }
  };

  const isWelcomeScreenActive = !!(form?.welcomeSettings && form?.welcomeSettings.isActive !== false);

  const { quizStartTime } = useQuizTimer({
    formId: form?.id,
    isQuiz: !!form?.isQuiz,
    isPreview,
    submitted,
    submitting,
    showWelcome,
    welcomeIsActive: isWelcomeScreenActive,
    endTime: form?.quizSettings?.endTime,
    onTimeUp: handleTimeUp
  });

  const shuffledFields = useMemo(() => {
    if (!form?.fields) return [];
    let ordered = flattenFields(form.fields);

    if (form.quizSettings?.shuffleQuestions && !isPreview) {
        const storageKey = `quiz_shuffle_${form.id}`;
        let savedOrder: string[] = [];
        try {
          const stored = sessionStorage.getItem(storageKey);
          if (stored) savedOrder = JSON.parse(stored);
        } catch (e) { console.error(e); }

        const currentIds = new Set(ordered.map(f => f.id));
        const isValidOrder = savedOrder.length > 0 && savedOrder.every(id => currentIds.has(id)) && savedOrder.length === ordered.length;

        if (isValidOrder) {
           const fieldMap = new Map(ordered.map(f => [f.id, f]));
           ordered = savedOrder.map(id => fieldMap.get(id)!).filter(Boolean);
        } else {
           ordered = [...ordered].sort(() => Math.random() - 0.5);
           const newOrder = ordered.map(f => f.id);
           sessionStorage.setItem(storageKey, JSON.stringify(newOrder));
        }
    }

    return ordered.filter((field) => 
        !field.validation?.hidden && 
        !(field.options as any)?.hidden && 
        field.type !== FieldType.GROUP
    );
  }, [form?.fields, form?.quizSettings?.shuffleQuestions, isPreview, form?.id]);

  const visibleFields = useMemo(() => {
      return shuffledFields.filter(field => 
          !hiddenFieldIds.has(field.id) &&
          (!field.groupId || !hiddenFieldIds.has(field.groupId))
      );
  }, [shuffledFields, hiddenFieldIds]);

  const pages = splitIntoPages(visibleFields);
  const totalPages = pages.length;
  const currentPageFields = pages[currentPageIndex] || [];
  const isCardLayout = form?.settings?.formLayout === 'card';
  const currentField = isCardLayout ? currentPageFields[currentCardIndex] : null;

  const navigation = useFormNavigation({
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageIndex, currentCardIndex]);

  const checkQuizAvailability = () => {
    if (!form?.isQuiz || isPreview) return { available: true, message: '' };
    
    const now = new Date();
    const startTime = form.quizSettings?.startTime ? new Date(form.quizSettings.startTime) : null;
    const endTime = form.quizSettings?.endTime ? new Date(form.quizSettings.endTime) : null;

    if (startTime && now < startTime) {
      return { 
        available: false, 
        message: t('public.quiz.available_from', { date: startTime.toLocaleString() })
      };
    }

    if (endTime && now > endTime) {
      return { 
        available: false, 
        message: t('public.quiz.closed_on', { date: endTime.toLocaleString() })
      };
    }

    return { available: true, message: '' };
  };

  const availability = checkQuizAvailability();

  return {
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
    isTextLight,
    
    methods,
    watchedValues,
    errors: methods.formState.errors,
    submitForm,
    onSubmit: async (data: any) => await submitForm(data),
    
    visibleFields,
    pages,
    totalPages,
    currentPageFields,
    currentField,
    isCardLayout,
    isWelcomeScreenActive,
    quizStartTime,
    availability,
    
    navigation,
    handleTimeUp,
  };
}
