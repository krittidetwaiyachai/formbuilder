import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { VerifiedSubmissionStatusResponse } from '@/types';
interface UseVerificationRecoveryProps {
  formId?: string;
  verificationRequestId?: string | null;
  enabled?: boolean;
  onGrantVerified: (payload: {message?: string | null;}) => void;
  onGrantInvalidated: (message?: string | null) => void;
}
const POLL_INTERVAL_MS = 5000;
export function useVerificationRecovery({
  formId,
  verificationRequestId,
  enabled = true,
  onGrantVerified,
  onGrantInvalidated
}: UseVerificationRecoveryProps) {
  const [recovering, setRecovering] = useState(false);
  useEffect(() => {
    if (!formId || !verificationRequestId || !enabled) {
      return;
    }
    let cancelled = false;
    let intervalId: number | null = null;
    const pollStatus = async () => {
      setRecovering(true);
      try {
        const response = await api.get<VerifiedSubmissionStatusResponse>(
          `/public/forms/${formId}/verification-requests/${verificationRequestId}`
        );
        if (cancelled) {
          return;
        }
        if (response.data.status === 'VERIFIED_READY') {
          onGrantVerified({
            message: 'Email verified. You can now submit the form.'
          });
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          return;
        }
        if (response.data.status === 'EXPIRED') {
          onGrantInvalidated('Your email verification has expired. Please verify again.');
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          return;
        }
        if (response.data.status === 'CONSUMED') {
          onGrantInvalidated('This verification has already been used.');
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          return;
        }
        if (response.data.status === 'INVALID') {
          onGrantInvalidated('Failed to recover verification status.');
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
        }
      } catch {
        if (!cancelled) {
          onGrantInvalidated('Failed to recover verification status.');
        }
        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
      } finally {
        if (!cancelled) {
          setRecovering(false);
        }
      }
    };
    void pollStatus();
    intervalId = window.setInterval(() => {
      void pollStatus();
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [
  enabled,
  formId,
  onGrantInvalidated,
  onGrantVerified,
  verificationRequestId]
  );
  return {
    recovering
  };
}