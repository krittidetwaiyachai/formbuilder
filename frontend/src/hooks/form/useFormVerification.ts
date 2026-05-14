import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { useToast } from '@/components/ui/toaster';
import type { Form, PublicFormDraftState, VerificationRequestResponse } from '@/types';
import {
  buildSubmissionAnswers,
  resolveCanonicalEmailContext } from
'./useFormSubmission';
import { useVerificationRecovery } from './useVerificationRecovery';
import i18n from '@/i18n';
interface UseFormVerificationProps {
  form: Form | null;
  formValues: Record<string, unknown>;
  isPreview?: boolean;
  draftState: PublicFormDraftState | null;
  saveFormValues: (formValues: Record<string, unknown>) => void;
  updateVerificationState: (patch: {
    verificationRequestId?: string | null;
    canonicalEmailSnapshot?: string | null;
    verificationStatus?: PublicFormDraftState['verificationStatus'];
    verificationMessage?: string | null;
  }) => void;
  clearVerificationState: (
  nextStatus?: PublicFormDraftState['verificationStatus'],
  message?: string | null)
  => void;
}
export function useFormVerification({
  form,
  formValues,
  isPreview = false,
  draftState,
  saveFormValues,
  updateVerificationState,
  clearVerificationState
}: UseFormVerificationProps) {
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const security = form?.settings?.security;
  const captchaRequired = security?.requireCaptcha === true;
  const verificationRequired = security?.requireEmailVerification === true;
  const answers = useMemo(
    () => form ? buildSubmissionAnswers(form, formValues) : [],
    [form, formValues]
  );
  const canonicalEmailContext = useMemo(
    () =>
    form ?
    resolveCanonicalEmailContext(form, formValues, answers) :
    { email: null, mismatch: false },
    [answers, form, formValues]
  );
  const verificationStatus = draftState?.verificationStatus ?? 'idle';
  const verificationMessage = draftState?.verificationMessage ?? null;
  const verificationRequestId = draftState?.verificationRequestId ?? null;
  const canonicalEmailSnapshot = draftState?.canonicalEmailSnapshot ?? null;
  const consumeCaptchaToken = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaResetSignal((value) => value + 1);
  }, []);
  const handleGrantVerified = useCallback(
    (payload: {message?: string | null;}) => {
      updateVerificationState({
        canonicalEmailSnapshot: canonicalEmailContext.email,
        verificationStatus: 'verified',
        verificationMessage:
        payload.message ?? i18n.t('error.email_verified.message')
      });
    },
    [canonicalEmailContext.email, updateVerificationState]
  );
  const handleGrantInvalidated = useCallback(
    (message?: string | null) => {
      clearVerificationState('expired', message ?? i18n.t('error.reverify.message'));
    },
    [clearVerificationState]
  );
  const { recovering } = useVerificationRecovery({
    formId: form?.id,
    verificationRequestId,
    enabled: verificationStatus === 'pending',
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
        canonicalEmailContext.email ?
        i18n.t('error.email_changed.message') :
        null
      );
    }
  }, [
  canonicalEmailContext.email,
  canonicalEmailSnapshot,
  clearVerificationState,
  verificationRequired]
  );
  const requestVerification = useCallback(async () => {
    if (!form?.id || isPreview || !verificationRequired) {
      return;
    }
    saveFormValues(formValues);
    if (canonicalEmailContext.mismatch) {
      const message = i18n.t('error.verification_blocked.message');
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: i18n.t('error.verification_blocked.title'),
        description: message,
        variant: 'error'
      });
      return;
    }
    if (!canonicalEmailContext.email) {
      const message = i18n.t('error.email_required.message');
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: i18n.t('error.email_required.title'),
        description: message,
        variant: 'error'
      });
      return;
    }
    if (captchaRequired && !captchaToken) {
      const message = i18n.t('error.captcha_required.message');
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: i18n.t('error.captcha_required.title'),
        description: message,
        variant: 'error'
      });
      return;
    }
    setRequesting(true);
    try {
      const response = await api.post<VerificationRequestResponse>(
        `/public/forms/${form.id}/verification-requests`,
        {
          respondentEmail:
          typeof formValues.respondentEmail === 'string' ?
          formValues.respondentEmail :
          undefined,
          captchaToken: captchaToken || undefined,
          answers
        }
      );
      updateVerificationState({
        verificationRequestId:
        response.data.verificationRequestId ?? verificationRequestId,
        canonicalEmailSnapshot: canonicalEmailContext.email,
        verificationStatus: 'pending',
        verificationMessage:
        i18n.t('error.verification_pending.message')
      });
      toast({
        title: i18n.t('error.verification_sent.title'),
        description: i18n.t('error.verification_sent.message'),
        variant: 'success'
      });
    } catch (error: unknown) {
      const message = isAxiosError(error) ?
      error.response?.data?.message || i18n.t('error.verification_failed.message') :
      i18n.t('error.verification_failed.message');
      updateVerificationState({
        verificationStatus: 'required',
        verificationMessage: message
      });
      toast({
        title: i18n.t('error.verification_failed.title'),
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
  canonicalEmailContext.email,
  canonicalEmailContext.mismatch,
  captchaRequired,
  captchaToken,
  consumeCaptchaToken,
  form?.id,
  formValues,
  isPreview,
  saveFormValues,
  toast,
  updateVerificationState,
  verificationRequestId,
  verificationRequired]
  );
  const markVerificationRequired = useCallback(() => {
    updateVerificationState({
      verificationStatus: 'required',
      verificationMessage: i18n.t('error.verification_required.message')
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
    verificationRequestId,
    setCaptchaToken,
    consumeCaptchaToken,
    requestVerification,
    markVerificationRequired,
    clearVerificationState
  };
}