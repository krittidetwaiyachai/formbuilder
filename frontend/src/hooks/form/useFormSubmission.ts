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
  sessionKey?: string;
  bindingId?: string | null;
  grantToken?: string | null;
  captchaToken?: string | null;
  onVerificationRequired?: () => void;
  onSubmissionSuccess?: () => void;
  onCaptchaConsumed?: () => void;
}

function serializeFieldValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function buildSubmissionAnswers(form: Form, data: Record<string, unknown>) {
  return (
    form.fields?.map((field) => {
      const fieldName = `field_${field.id}`;
      let value = data[fieldName];

      if (field.type === FieldType.FULLNAME) {
        const parts = [
          data[`${fieldName}_prefix`],
          data[`${fieldName}_first`],
          data[`${fieldName}_middle`],
          data[`${fieldName}_last`],
          data[`${fieldName}_suffix`]
        ].filter(Boolean);
        value = parts.join(' ');
      } else if (field.type === FieldType.ADDRESS) {
        const parts = [
          data[`${fieldName}_street`],
          data[`${fieldName}_street2`],
          data[`${fieldName}_city`],
          data[`${fieldName}_state`],
          data[`${fieldName}_zip`],
          data[`${fieldName}_country`]
        ].filter(Boolean);
        value = parts.join(', ');
      }

      return {
        fieldId: field.id,
        value: serializeFieldValue(value)
      };
    }) || []
  );
}

export function resolveCanonicalEmailContext(
  form: Form,
  data: Record<string, unknown>,
  answers: { fieldId: string; value: string }[]
) {
  const normalize = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;

  const topLevelEmail = normalize(data.respondentEmail);
  const source = form.settings?.security?.canonicalEmailSource;
  const emailFields = (form.fields || []).filter((field) => field.type === FieldType.EMAIL);

  if (source?.mode === 'field') {
    const fieldEmail = normalize(
      answers.find((answer) => answer.fieldId === source.fieldId)?.value
    );

    return {
      email: fieldEmail || topLevelEmail,
      mismatch: !!fieldEmail && !!topLevelEmail && fieldEmail !== topLevelEmail
    };
  }

  if (source?.mode === 'top_level') {
    const mismatch = emailFields
      .map((field) => normalize(answers.find((answer) => answer.fieldId === field.id)?.value))
      .filter(Boolean)
      .some((value) => value !== topLevelEmail);

    return {
      email: topLevelEmail,
      mismatch
    };
  }

  if (topLevelEmail) {
    return {
      email: topLevelEmail,
      mismatch: false
    };
  }

  if (emailFields.length === 1) {
    return {
      email: normalize(
        answers.find((answer) => answer.fieldId === emailFields[0].id)?.value
      ),
      mismatch: false
    };
  }

  return {
    email: null,
    mismatch: false
  };
}

export function useFormSubmission({
  form,
  isPreview = false,
  sessionKey,
  bindingId,
  grantToken,
  captchaToken,
  onVerificationRequired,
  onSubmissionSuccess,
  onCaptchaConsumed
}: UseFormSubmissionProps) {
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
      const answers = buildSubmissionAnswers(form, data);
      const fingerprint = await getBrowserFingerprint();
      const response = await api.post(`/forms/${form.id}/submit`, {
        answers,
        email:
          typeof data.respondentEmail === 'string' ? data.respondentEmail : undefined,
        captchaToken: captchaToken || undefined,
        sessionKey: sessionKey || undefined,
        fingerprint,
        bindingId: bindingId || undefined,
        grantToken: grantToken || undefined
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
      onSubmissionSuccess?.();
    } catch (err) {
      if (
        isAxiosError(err) &&
        err.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED'
      ) {
        onVerificationRequired?.();
        toast({
          title: 'Email verification required',
          description: 'Verify your email before submitting this form.',
          variant: 'warning'
        });
      } else {
        toast({
          title: "Submission Failed",
          description: getAxiosErrorMessage(err, 'Failed to submit form'),
          variant: "error"
        });
      }
    } finally {
      if (captchaToken) {
        onCaptchaConsumed?.();
      }

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
