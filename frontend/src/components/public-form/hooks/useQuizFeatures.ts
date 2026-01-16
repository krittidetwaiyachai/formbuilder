import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { getBrowserFingerprint } from '@/utils/fingerprint';

interface UseQuizTimerProps {
  formId: string | undefined;
  isQuiz: boolean;
  isPreview: boolean;
  submitted: boolean;
  submitting: boolean;
  showWelcome: boolean;
  welcomeIsActive: boolean;
  endTime: string | undefined;
  onTimeUp: () => void;
}

export function useQuizTimer({
  formId,
  isQuiz,
  isPreview,
  submitted,
  submitting,
  showWelcome,
  welcomeIsActive,
  endTime,
  onTimeUp,
}: UseQuizTimerProps) {
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const autoSubmitAttempted = useRef(false);

  useEffect(() => {
    const isShowingWelcome = showWelcome && welcomeIsActive;

    if (isQuiz && !isShowingWelcome && !quizStartTime && !isPreview && !submitted) {
      const savedStartTime = formId ? localStorage.getItem(`quiz_start_time_${formId}`) : null;
      if (savedStartTime) {
        setQuizStartTime(new Date(savedStartTime));
      } else if (formId) {
        const startTime = new Date();
        setQuizStartTime(startTime);
        localStorage.setItem(`quiz_start_time_${formId}`, startTime.toISOString());
      }
    }
  }, [formId, isQuiz, showWelcome, welcomeIsActive, quizStartTime, isPreview, submitted]);

  useEffect(() => {
    if (submitted && formId) {
      localStorage.removeItem(`quiz_start_time_${formId}`);
    }
  }, [submitted, formId]);

  useEffect(() => {
    if (!isQuiz || isPreview || submitted || submitting || !endTime) {
      return;
    }

    const endDate = new Date(endTime);
    const now = new Date();

    if (now >= endDate) {
      if (!autoSubmitAttempted.current) {
        autoSubmitAttempted.current = true;
        onTimeUp();
      }
      return;
    }

    const timeUntilEnd = endDate.getTime() - now.getTime();
    const timeoutId = setTimeout(() => {
      if (!autoSubmitAttempted.current) {
        autoSubmitAttempted.current = true;
        onTimeUp();
      }
    }, timeUntilEnd);

    return () => clearTimeout(timeoutId);
  }, [isQuiz, endTime, isPreview, submitted, submitting, onTimeUp]);

  return { quizStartTime, setQuizStartTime };
}

interface UseSubmissionCheckProps {
  formId: string | undefined;
  isPreview: boolean;
  loading: boolean;
}

export function useSubmissionCheck({
  formId,
  isPreview,
  loading,
}: UseSubmissionCheckProps) {
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!formId || isPreview || loading) {
        setCheckingSubmission(false);
        return;
      }

      try {
        const fingerprint = await getBrowserFingerprint();
        const response = await api.get(`/responses/check/${formId}`, {
          params: { fingerprint },
        });

        if (response.data.hasSubmitted) {
          setHasAlreadySubmitted(true);
        }
      } catch {
        // Silent fail
      } finally {
        setCheckingSubmission(false);
      }
    };

    checkSubmissionStatus();
  }, [formId, isPreview, loading]);

  return { hasAlreadySubmitted, checkingSubmission };
}
