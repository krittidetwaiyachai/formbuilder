import { useState } from 'react';
import api from '@/lib/api';
import { Form } from '@/types';
import { getBrowserFingerprint } from '@/utils/fingerprint';
import { useToast } from '@/components/ui/toaster';

interface UseFormSubmissionProps {
  form: Form;
  isPreview?: boolean;
}

export function useFormSubmission({ form, isPreview = false }: UseFormSubmissionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ score: number; totalScore: number } | null>(null);
  const [quizReview, setQuizReview] = useState<any>(null);
  const { toast } = useToast();

  const submitForm = async (data: any) => {
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
        const value = data[fieldName];
        return {
          fieldId: field.id,
          value: Array.isArray(value) ? value.join(', ') : String(value || ''),
        };
      }) || [];

      const fingerprint = await getBrowserFingerprint();

      const response = await api.post('/responses', {
        formId: form.id,
        answers,
        respondentEmail: data.respondentEmail || undefined,
        fingerprint,
      });

      if (form.isQuiz) {
        const submission = response.data.submission || response.data;
        if (submission?.score !== undefined) {
          setScore({
            score: submission.score || 0,
            totalScore: submission.totalScore || 0,
          });
          if (submission.quizReview) {
            setQuizReview(submission.quizReview);
          }
        }
      }

      setSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || 'Failed to submit form',
        variant: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    submitted,
    score,
    quizReview,
    submitForm,
  };
}
