import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import type {
  VerifiedSubmissionStatusResponse,
  VerifyEmailResponse
} from '@/types';

interface UseVerificationRecoveryProps {
  formId?: string;
  redirectBindingId?: string | null;
  redirectToken?: string | null;
  activeBindingId?: string | null;
  grantToken?: string | null;
  onGrantVerified: (payload: {
    bindingId: string;
    grantToken: string;
    grantExpiresAt: string;
    message?: string | null;
  }) => void;
  onGrantInvalidated: (message?: string | null) => void;
}

interface VerificationBroadcastPayload {
  type: 'VERIFIED_GRANT' | 'INVALIDATED_GRANT';
  formId: string;
  bindingId: string | null;
  grantToken?: string;
  grantExpiresAt?: string;
  message?: string | null;
}

function clearVerificationQueryParams() {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete('bindingId');
  url.searchParams.delete('token');
  window.history.replaceState({}, document.title, url.toString());
}

export function useVerificationRecovery({
  formId,
  redirectBindingId,
  redirectToken,
  activeBindingId,
  grantToken,
  onGrantVerified,
  onGrantInvalidated
}: UseVerificationRecoveryProps) {
  const [recovering, setRecovering] = useState(false);
  const channelName = useMemo(
    () => (formId ? `public-form-verification:${formId}` : null),
    [formId]
  );

  useEffect(() => {
    if (!channelName || typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel(channelName);
    const handleMessage = (event: MessageEvent<VerificationBroadcastPayload>) => {
      const payload = event.data;

      if (payload.formId !== formId) {
        return;
      }

      if (activeBindingId && payload.bindingId && payload.bindingId !== activeBindingId) {
        return;
      }

      if (
        payload.type === 'VERIFIED_GRANT' &&
        payload.bindingId &&
        payload.grantToken &&
        payload.grantExpiresAt
      ) {
        onGrantVerified({
          bindingId: payload.bindingId,
          grantToken: payload.grantToken,
          grantExpiresAt: payload.grantExpiresAt,
          message: payload.message
        });
      }

      if (payload.type === 'INVALIDATED_GRANT') {
        onGrantInvalidated(payload.message ?? null);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [
    activeBindingId,
    channelName,
    formId,
    onGrantInvalidated,
    onGrantVerified
  ]);

  useEffect(() => {
    if (!formId || !redirectBindingId || !redirectToken) {
      return;
    }

    let cancelled = false;
    const channel =
      channelName && typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(channelName)
        : null;

    setRecovering(true);

    api
      .post<VerifyEmailResponse>(`/forms/${formId}/verify-email`, {
        bindingId: redirectBindingId,
        token: redirectToken
      })
      .then((response) => {
        if (cancelled) {
          return;
        }

        const payload = {
          bindingId: response.data.bindingId,
          grantToken: response.data.grantToken,
          grantExpiresAt: response.data.grantExpiresAt,
          message: 'Email verified. You can now submit the form.'
        };

        onGrantVerified(payload);
        channel?.postMessage({
          type: 'VERIFIED_GRANT',
          formId,
          bindingId: payload.bindingId,
          grantToken: payload.grantToken,
          grantExpiresAt: payload.grantExpiresAt,
          message: payload.message
        } satisfies VerificationBroadcastPayload);
      })
      .catch(() => {
        if (!cancelled) {
          const message = 'Verification link is invalid or expired.';
          onGrantInvalidated(message);
          channel?.postMessage({
            type: 'INVALIDATED_GRANT',
            formId,
            bindingId: redirectBindingId,
            message
          } satisfies VerificationBroadcastPayload);
        }
      })
      .finally(() => {
        clearVerificationQueryParams();

        if (!cancelled) {
          setRecovering(false);
        }

        channel?.close();
      });

    return () => {
      cancelled = true;
      channel?.close();
    };
  }, [
    channelName,
    formId,
    onGrantInvalidated,
    onGrantVerified,
    redirectBindingId,
    redirectToken
  ]);

  useEffect(() => {
    if (!formId || !grantToken) {
      return;
    }

    let cancelled = false;

    api
      .post<VerifiedSubmissionStatusResponse>(
        `/forms/${formId}/verified-submission-status`,
        { grantToken }
      )
      .then((response) => {
        if (cancelled || response.data.status === 'VALID') {
          return;
        }

        const message =
          response.data.status === 'CONSUMED'
            ? 'This verification has already been used.'
            : 'Your email verification has expired. Please verify again.';

        onGrantInvalidated(message);
      })
      .catch(() => {
        if (!cancelled) {
          onGrantInvalidated('Failed to recover verification status.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [formId, grantToken, onGrantInvalidated]);

  return {
    recovering
  };
}
