import { useEffect, useCallback } from 'react';

interface UseFormProgressProps {
  formId: string | undefined;
  isPreview: boolean;
  submitted: boolean;
  watchedValues: Record<string, unknown>;
}

export function useFormProgress({
  formId,
  isPreview,
  submitted,
  watchedValues,
}: UseFormProgressProps) {

  const getDefaultValues = useCallback(() => {
    if (!formId || isPreview) return {};
    try {
      const savedData = localStorage.getItem(`form_progress_${formId}`);
      return savedData ? JSON.parse(savedData) : {};
    } catch {
      return {};
    }
  }, [formId, isPreview]);

  useEffect(() => {
    if (!formId || submitted || isPreview || !watchedValues) return;

    const timeoutId = setTimeout(() => {
      localStorage.setItem(`form_progress_${formId}`, JSON.stringify(watchedValues));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, formId, submitted, isPreview]);

  useEffect(() => {
    if (submitted && formId && !isPreview) {
      localStorage.removeItem(`form_progress_${formId}`);
    }
  }, [submitted, formId, isPreview]);

  return { getDefaultValues };
}
