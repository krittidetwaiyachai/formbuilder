import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toaster';
import type { Form, PublicFormDraftState, VerificationRequestResponse } from '@/types';
import {
  buildSubmissionAnswers,
  resolveCanonicalEmailContext
} from './useFormSubmission';
import { useVerificationRecovery } from './useVerificationRecovery';

interface UseFormVerificationProps {
  form: Form | null;
  formValues: Record<string, unknown>;
  isPreview?: boolean;
  sessionKey?: string;
  draftState: PublicFormDraftState | null;
  saveFormValues: (formValues: Record<string, unknown>) => void;
  updateVerificationState: (patch: {
    bindingId?: string | null;
    grantToken?: string | null;
    grantExpiresAt?: string | null;
    canonicalEmailSnapshot?: string | null;
    verificationStatus?: PublicFormDraftState['verificationStatus'];
    verificationMessage?: string | null;
  }) => void;
  clearVerificationState: (
    nextStatus?: PublicFormDraftState['verificationStatus'],
    message?: string | null
  ) => void;
  redirectBindingId?: string | null;
  redirectToken?: string | null;
}

export function useFormVerification({
  form,
  formValues,
  isPreview = false,
  sessionKey,
  draftState,
  saveFormValues,
  updateVerificationState,
  clearVerificationState,
  redirectBindingId,
  redirectToken
}: UseFormVerificationProps) {
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const security = form?.settings?.security;
  const captchaRequired = security?.requireCaptcha === true;
  const verificationRequired = security?.requireEmailVerification === true;

  const answers = useMemo(
    () => (form ? buildSubmissionAnswers(form, formValues) : []),
    [form, formValues]
  );

  const canonicalEmailContext = useMemo(
    () =>
      form
        ? resolveCanonicalEmailContext(form, formValues, answers)
        : { email: null, mismatch: false },
    [answers, form, formValues]
  );

  const verificationStatus = draftState?.verificationStatus ?? 'idle';
  const verificationMessage = draftState?.verificationMessage ?? null;
  const bindingId = draftState?.bindingId ?? null;
  const grantToken = draftState?.grantToken ?? null;
  const grantExpiresAt = draftState?.grantExpiresAt ?? null;
  const canonicalEmailSnapshot = draftState?.canonicalEmailSnapshot ?? null;

  const consumeCaptchaToken = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaResetSignal((value) => value + 1);
  }, []);

  const handleGrantVerified = useCallback(
    (payload: {
      bindingId: string;
      grantToken: string;
      grantExpiresAt: string;
      message?: string | null;
    }) => {
      updateVerificationState({
        bindingId: payload.bindingId,
        grantToken: payload.grantToken,
        grantExpiresAt: payload.grantExpiresAt,
        canonicalEmailSnapshot: canonicalEmailContext.email,
        verificationStatus: 'verified',
        verificationMessage:
          payload.message ?? 'Email verified. You can now submit the form.'
      });
    },
    [canonicalEmailContext.email, updateVerificationState]
  );

  const handleGrantInvalidated = useCallback(
    (message?: string | null) => {
      clearVerificationState('expired', message ?? 'Please verify your email again.');
    },
    [clearVerificationState]
  );

  const { recovering } = useVerificationRecovery({
    formId: form?.id,
    redirectBindingId,
    redirectToken,
    activeBindingId: bindingId,
    grantToken,
    onGrantVerified: handleGrantVerified,
    onGrantInvalidated: handleGrantInvalidated
  });

  useEffect(() => {
    if (!verificationRequired || !canonicalEmailSnapshot) {
      return;
    }

    if (canonicalEmailSnapshot !== canonicalEmailContext.email) {
      clearVerificationState(
        'idle',
        canonicalEmailContext.email
          ? 'Email changed. Please verify the new email address.'
          : null
      );
    }
  }, [
    canonicalEmailContext.email,
    canonicalEmailSnapshot,
    clearVerificationState,
    verificationRequired
  ]);

  const requestVerification = useCallback(async () => {
    if (!form?.id || isPreview || !verificationRequired) {
      return;
    }

    saveFormValues(formValues);

    if (canonicalEmailContext.mismatch) {
      const message = 'Email values do not match. Please review the email fields.';
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: 'Verification blocked',
        description: message,
        variant: 'error'
      });
      return;
    }

    if (!canonicalEmailContext.email) {
      const message = 'Enter a valid email address before requesting verification.';
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: 'Email required',
        description: message,
        variant: 'error'
      });
      return;
    }

    if (captchaRequired && !captchaToken) {
      const message = 'Complete the captcha before requesting verification.';
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: 'Captcha required',
        description: message,
        variant: 'error'
      });
      return;
    }

    setRequesting(true);

    try {
      const response = await api.post<VerificationRequestResponse>(
        `/forms/${form.id}/request-email-verification`,
        {
          email:
            typeof formValues.respondentEmail === 'string'
              ? formValues.respondentEmail
              : undefined,
          captchaToken: captchaToken || undefined,
          sessionKey,
          answers
        }
      );

      updateVerificationState({
        bindingId: response.data.bindingId ?? bindingId,
        grantToken: null,
        grantExpiresAt: null,
        canonicalEmailSnapshot: canonicalEmailContext.email,
        verificationStatus: 'pending',
        verificationMessage:
          'Verification email sent. Open the link in your inbox to continue.'
      });

      toast({
        title: 'Verification email sent',
        description: 'Check your inbox to verify the email address.',
        variant: 'success'
      });
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Failed to request email verification.'
        : 'Failed to request email verification.';

      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });

      toast({
        title: 'Verification failed',
        description: message,
        variant: 'error'
      });
    } finally {
      setRequesting(false);

      if (captchaRequired) {
        consumeCaptchaToken();
      }
    }
  }, [
    answers,
    bindingId,
    canonicalEmailContext.email,
    canonicalEmailContext.mismatch,
    captchaRequired,
    captchaToken,
    consumeCaptchaToken,
    form?.id,
    formValues,
    isPreview,
    saveFormValues,
    sessionKey,
    toast,
    updateVerificationState,
    verificationRequired
  ]);

  const markVerificationRequired = useCallback(() => {
    updateVerificationState({
      verificationStatus: 'required',
      verificationMessage: 'Verify your email before submitting this form.'
    });
  }, [updateVerificationState]);

  return {
    captchaRequired,
    verificationRequired,
    requesting,
    recovering,
    captchaToken,
    captchaResetSignal,
    canonicalEmail: canonicalEmailContext.email,
    emailMismatch: canonicalEmailContext.mismatch,
    verificationStatus,
    verificationMessage,
    bindingId,
    grantToken,
    grantExpiresAt,
    setCaptchaToken,
    consumeCaptchaToken,
    requestVerification,
    markVerificationRequired,
    clearVerificationState
  };
}
