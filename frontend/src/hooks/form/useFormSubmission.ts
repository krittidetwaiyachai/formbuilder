import { useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { FieldType } from '@/types';
import type { Form } from '@/types';
import { getBrowserFingerprint } from '@/utils/fingerprint';
import { useToast } from '@/components/ui/toaster';
import { getAxiosErrorMessage } from '@/utils/error';
import type { QuizReview } from '@/components/form-preview/QuizResults';
interface UseFormSubmissionProps {
  form: Form;
  isPreview?: boolean;
}
export function useFormSubmission({ form, isPreview = false }: UseFormSubmissionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{score: number;totalScore: number;} | null>(null);
  const [quizReview, setQuizReview] = useState<QuizReview | null>(null);
  const { toast } = useToast();
  const submitForm = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    if (isPreview) {
      setTimeout(() => {
        if (form.isQuiz) {
          let mockScore = 0;
          let total = 0;
          if (form.quizSettings?.showScore) {
            total = form.fields?.length || 0;
            mockScore = total;
          }
          setScore({ score: mockScore, totalScore: total });
        }
        setSubmitted(true);
        setSubmitting(false);
      }, 1000);
      return;
    }
    try {
      const answers = form.fields?.map((field) => {
        const fieldName = `field_${field.id}`;
        let value = data[fieldName];
        if (field.type === FieldType.FULLNAME) {
          const parts = [
          data[`${fieldName}_prefix`],
          data[`${fieldName}_first`],
          data[`${fieldName}_middle`],
          data[`${fieldName}_last`],
          data[`${fieldName}_suffix`]].
          filter(Boolean);
          value = parts.join(' ');
        } else if (field.type === FieldType.ADDRESS) {
          const parts = [
          data[`${fieldName}_street`],
          data[`${fieldName}_street2`],
          data[`${fieldName}_city`],
          data[`${fieldName}_state`],
          data[`${fieldName}_zip`],
          data[`${fieldName}_country`]].
          filter(Boolean);
          value = parts.join(', ');
        }
        const serializedValue = (() => {
          if (value === null || value === undefined || value === '') return '';
          if (Array.isArray(value)) return value.join(', ');
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })();
        return {
          fieldId: field.id,
          value: serializedValue
        };
      }) || [];
      const fingerprint = await getBrowserFingerprint();
      const attemptSubmit = async (attemptCount = 0) => {
        try {
          const response = await api.post('/responses', {
            formId: form.id,
            answers,
            respondentEmail: data.respondentEmail || undefined,
            fingerprint
          });
          if (form.isQuiz) {
            const submission = response.data.submission || response.data;
            if (submission?.score !== undefined) {
              setScore({
                score: submission.score || 0,
                totalScore: submission.totalScore || 0
              });
              if (submission.quizReview) {
                setQuizReview(submission.quizReview);
              }
            }
          }
          setSubmitted(true);
          setSubmitting(false);
        } catch (err: unknown) {
          if (isAxiosError(err) && err.response?.status === 429) {
            if (attemptCount < 20) {
              setTimeout(() => {
                attemptSubmit(attemptCount + 1);
              }, 3000);
              return;
            }
          }
          toast({
            title: "Submission Failed",
            description: getAxiosErrorMessage(err, 'Failed to submit form'),
            variant: "error"
          });
          setSubmitting(false);
        }
      };
      attemptSubmit();
    } catch (err) {
      console.error('Error preparing submission:', err);
      toast({
        title: "Preparation Failed",
        description: "Failed to prepare submission data. Please try again.",
        variant: "error"
      });
      setSubmitting(false);
    }
  };
  return {
    submitting,
    submitted,
    score,
    quizReview,
    submitForm
  };
}