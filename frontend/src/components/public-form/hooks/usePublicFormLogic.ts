import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Form } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useFormLogic } from '@/hooks/form/useFormLogic';
import { useFormDraftPersistence } from '@/hooks/form/useFormDraftPersistence';
import { useFormSubmission } from '@/hooks/form/useFormSubmission';
import { useFormVerification } from '@/hooks/form/useFormVerification';
import { useFormNavigation } from './useFormNavigation';
import { useQuizTimer, useSubmissionCheck } from './useQuizFeatures';
import { splitIntoPages, flattenFields } from '../utils/formFieldUtils';
interface UsePublicFormLogicProps {
  form: Form | null;
  loading?: boolean;
  isPreview?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}
export function usePublicFormLogic({
  form,
  loading = false,
  isPreview = false
}: UsePublicFormLogicProps) {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const restoredFormIdRef = useRef<string | null>(null);
  const isAuthenticated = useAuthStore ?
  useAuthStore((state: {isAuthenticated: boolean;}) => state.isAuthenticated) :
  false;
  useEffect(() => {
    if (!form?.settings) return;
    const root = document.documentElement;
    const settings = form.settings;
    root.style.setProperty('--primary', settings.primaryColor || '#000000');
    root.style.setProperty('--background', settings.backgroundColor || '#ffffff');
    root.style.setProperty('--text', settings.textColor || '#1E293B');
    root.style.setProperty('--quiz-correct', settings.primaryColor || '#000000');
    root.style.setProperty('--quiz-incorrect', '#ef4444');
    root.style.setProperty(
      '--radius',
      settings.borderRadius === 'none' ?
      '0px' :
      settings.borderRadius === 'small' ?
      '0.25rem' :
      settings.borderRadius === 'large' ?
      '0.75rem' :
      '0.5rem'
    );
    root.style.setProperty('--font-family', settings.fontFamily || 'Inter');
    document.body.style.fontFamily = settings.fontFamily || 'Inter';
    document.body.style.backgroundColor = settings.backgroundColor || '#ffffff';
    document.documentElement.style.backgroundColor =
    settings.backgroundColor || '#ffffff';
    return () => {
      [
      '--primary',
      '--background',
      '--text',
      '--quiz-correct',
      '--quiz-incorrect',
      '--radius',
      '--font-family',
      '--card-bg',
      '--card-border',
      '--card-shadow',
      '--input-bg',
      '--input-border',
      '--divider',
      'color-scheme',
      'accent-color'].
      forEach((prop) => root.style.removeProperty(prop));
      document.body.style.fontFamily = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [form?.settings]);
  const getBrightness = (hexColor: string) => {
    const c = hexColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = rgb >> 16 & 0xff;
    const g = rgb >> 8 & 0xff;
    const b = rgb >> 0 & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const isTextLight = useMemo(() => {
    if (!form?.settings?.textColor) return false;
    return getBrightness(form.settings.textColor) > 150;
  }, [form?.settings?.textColor]);
  useEffect(() => {
    if (!form?.settings?.textColor) return;
    const root = document.documentElement;
    if (isTextLight) {
      root.style.setProperty('--card-bg', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty(
        '--card-shadow',
        '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
      );
      root.style.setProperty('--input-bg', 'rgba(0, 0, 0, 0.25)');
      root.style.setProperty('--input-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--divider', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--popover-bg', 'var(--background)');
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.05)');
      root.style.setProperty(
        '--card-shadow',
        '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
      );
      root.style.setProperty('--input-bg', 'rgba(240, 240, 246, 0.6)');
      root.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--divider', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--popover-bg', 'var(--background)');
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
        color-scheme: ${isTextLight ? 'dark' : 'light'} !important;
      }
    `;
    return () => {
      const tag = document.getElementById('theme-dynamic-styles');
      if (tag) tag.remove();
    };
  }, [form?.settings?.primaryColor, form?.settings?.textColor, isTextLight]);
  const cardStyleVars = useMemo(() => {
    if (isTextLight) {
      return {
        '--card-bg': 'rgba(0, 0, 0, 0.15)',
        '--card-border': 'rgba(255, 255, 255, 0.08)',
        '--card-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        '--input-bg': 'rgba(0, 0, 0, 0.25)',
        '--input-border': 'rgba(255, 255, 255, 0.1)',
        '--divider': 'rgba(255, 255, 255, 0.08)'
      } as React.CSSProperties;
    }
    return {
      '--card-bg': 'rgba(255, 255, 255, 0.85)',
      '--card-border': 'rgba(0, 0, 0, 0.05)',
      '--card-shadow': '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
      '--input-bg': 'rgba(240, 240, 246, 0.6)',
      '--input-border': 'rgba(0, 0, 0, 0.1)',
      '--divider': 'rgba(0, 0, 0, 0.08)'
    } as React.CSSProperties;
  }, [isTextLight]);
  const methods = useForm({ shouldUnregister: false });
  const { watch, setValue, trigger, getValues } = methods;
  const watchedValues = watch();
  const draftPersistence = useFormDraftPersistence(form?.id);
  useEffect(() => {
    if (!form?.id || !draftPersistence.draftState) {
      return;
    }
    if (restoredFormIdRef.current === form.id) {
      return;
    }
    restoredFormIdRef.current = form.id;
    Object.entries(draftPersistence.draftState.formValues).forEach(([key, value]) => {
      setValue(key, value);
    });
  }, [draftPersistence.draftState, form?.id, setValue]);
  const verification = useFormVerification({
    form,
    formValues: watchedValues || {},
    isPreview,
    draftState: draftPersistence.draftState,
    saveFormValues: draftPersistence.saveFormValues,
    updateVerificationState: draftPersistence.updateVerificationState,
    clearVerificationState: draftPersistence.clearVerificationState
  });
  const {
    submitting,
    submitted,
    submitForm,
    score,
    quizReview
  } = useFormSubmission({
    form: form as Form,
    isPreview,
    captchaToken: verification.captchaToken,
    onVerificationRequired: verification.markVerificationRequired,
    onSubmissionSuccess: () => {
      draftPersistence.clearDraft();
      verification.clearVerificationState();
    },
    onCaptchaConsumed: verification.consumeCaptchaToken
  });
  useEffect(() => {
    if (!form?.id || isPreview || submitted) {
      return;
    }
    const timeoutId = setTimeout(() => {
      draftPersistence.saveFormValues(watchedValues || {});
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [draftPersistence, form?.id, isPreview, submitted, watchedValues]);
  const { checkingSubmission, hasAlreadySubmitted } = useSubmissionCheck({
    formId: form?.id,
    isPreview,
    loading
  });
  const logicValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    if (!watchedValues) return values;
    Object.keys(watchedValues).forEach((key) => {
      if (key.startsWith('field_')) {
        values[key.replace('field_', '')] = watchedValues[key];
      }
    });
    return values;
  }, [watchedValues]);
  const { hiddenFieldIds } = useFormLogic({
    fields: form?.fields || [],
    logicRules: form?.logicRules || [],
    formValues: logicValues
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
        {
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
  const isWelcomeScreenActive = !!(
  form?.welcomeSettings && form?.welcomeSettings.isActive !== false);
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
    if (form.isQuiz && form.quizSettings?.shuffleQuestions && !isPreview) {
      const storageKey = `quiz_shuffle_${form.id}`;
      let savedOrder: string[] = [];
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored) savedOrder = JSON.parse(stored);
      } catch (error) {
        console.error(error);
      }
      const currentIds = new Set(ordered.map((field) => field.id));
      const isValidOrder =
      savedOrder.length > 0 &&
      savedOrder.every((id) => currentIds.has(id)) &&
      savedOrder.length === ordered.length;
      if (isValidOrder) {
        const fieldMap = new Map(ordered.map((field) => [field.id, field]));
        ordered = savedOrder.map((id) => fieldMap.get(id)!).filter(Boolean);
      } else {
        ordered = [...ordered].sort(() => Math.random() - 0.5);
        sessionStorage.setItem(
          storageKey,
          JSON.stringify(ordered.map((field) => field.id))
        );
      }
    }
    return ordered.filter(
      (field) =>
      !field.validation?.hidden &&
      !(field.options as Record<string, unknown>)?.hidden
    );
  }, [form?.fields, form?.id, form?.isQuiz, form?.quizSettings?.shuffleQuestions, isPreview]);
  const visibleFields = useMemo(
    () =>
    shuffledFields.filter(
      (field) =>
      !hiddenFieldIds.has(field.id) && (
      !field.groupId || !hiddenFieldIds.has(field.groupId))
    ),
    [hiddenFieldIds, shuffledFields]
  );
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
  }, [currentCardIndex, currentPageIndex]);
  const checkQuizAvailability = () => {
    if (!form?.isQuiz || isPreview) return { available: true, message: '' };
    const now = new Date();
    const startTime = form.quizSettings?.startTime ?
    new Date(form.quizSettings.startTime) :
    null;
    const endTime = form.quizSettings?.endTime ?
    new Date(form.quizSettings.endTime) :
    null;
    if (startTime && now < startTime) {
      return {
        available: false,
        message: t('public.quiz.available_from', {
          date: startTime.toLocaleString()
        })
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
    onSubmit: async (data: Record<string, unknown>) => submitForm(data),
    visibleFields,
    pages,
    totalPages,
    currentPageFields,
    currentField,
    isCardLayout,
    isWelcomeScreenActive,
    quizStartTime,
    availability,
    verification,
    navigation,
    handleTimeUp
  };
}