import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PublicFormDraftState, VerificationStateStatus } from '@/types';
function generateSessionKey() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
function readDraft(storageKey: string): PublicFormDraftState | null {
  try {
    const rawDraft = sessionStorage.getItem(storageKey);
    return rawDraft ? JSON.parse(rawDraft) as PublicFormDraftState : null;
  } catch {
    return null;
  }
}
export function useFormDraftPersistence(formId?: string) {
  const storageKey = useMemo(
    () => formId ? `public-form:${formId}:draft` : null,
    [formId]
  );
  const sessionKeyStorageKey = useMemo(
    () => formId ? `public-form:${formId}:session-key` : null,
    [formId]
  );
  const [sessionKey, setSessionKey] = useState('');
  const [draftState, setDraftState] = useState<PublicFormDraftState | null>(null);
  const persistDraft = useCallback(
    (nextDraft: PublicFormDraftState) => {
      if (!storageKey) {
        return;
      }
      setDraftState(nextDraft);
      sessionStorage.setItem(storageKey, JSON.stringify(nextDraft));
    },
    [storageKey]
  );
  useEffect(() => {
    if (!storageKey || !sessionKeyStorageKey || typeof window === 'undefined') {
      return;
    }
    let resolvedSessionKey = sessionStorage.getItem(sessionKeyStorageKey);
    if (!resolvedSessionKey) {
      resolvedSessionKey = generateSessionKey();
      sessionStorage.setItem(sessionKeyStorageKey, resolvedSessionKey);
    }
    setSessionKey(resolvedSessionKey);
    const storedDraft = readDraft(storageKey);
    if (storedDraft) {
      setDraftState(storedDraft);
      return;
    }
    setDraftState({
      sessionKey: resolvedSessionKey,
      formValues: {},
      verificationRequestId: null,
      canonicalEmailSnapshot: null,
      verificationStatus: 'idle',
      verificationMessage: null,
      lastUpdatedAt: new Date().toISOString()
    });
  }, [sessionKeyStorageKey, storageKey]);
  const saveFormValues = useCallback(
    (formValues: Record<string, unknown>) => {
      if (!storageKey || !sessionKey) {
        return;
      }
      persistDraft({
        sessionKey,
        formValues,
        verificationRequestId: draftState?.verificationRequestId ?? null,
        canonicalEmailSnapshot: draftState?.canonicalEmailSnapshot ?? null,
        verificationStatus: draftState?.verificationStatus ?? 'idle',
        verificationMessage: draftState?.verificationMessage ?? null,
        lastUpdatedAt: new Date().toISOString()
      });
    },
    [draftState, persistDraft, sessionKey, storageKey]
  );
  const updateVerificationState = useCallback(
    (patch: {
      verificationRequestId?: string | null;
      canonicalEmailSnapshot?: string | null;
      verificationStatus?: VerificationStateStatus;
      verificationMessage?: string | null;
    }) => {
      if (!storageKey || !sessionKey) {
        return;
      }
      persistDraft({
        sessionKey,
        formValues: draftState?.formValues ?? {},
        verificationRequestId:
        patch.verificationRequestId !== undefined ?
        patch.verificationRequestId :
        draftState?.verificationRequestId ?? null,
        canonicalEmailSnapshot:
        patch.canonicalEmailSnapshot !== undefined ?
        patch.canonicalEmailSnapshot :
        draftState?.canonicalEmailSnapshot ?? null,
        verificationStatus:
        patch.verificationStatus ??
        draftState?.verificationStatus ??
        'idle',
        verificationMessage:
        patch.verificationMessage !== undefined ?
        patch.verificationMessage :
        draftState?.verificationMessage ?? null,
        lastUpdatedAt: new Date().toISOString()
      });
    },
    [draftState, persistDraft, sessionKey, storageKey]
  );
  const clearVerificationState = useCallback(
    (
    nextStatus: VerificationStateStatus = 'idle',
    message: string | null = null) =>
    {
      updateVerificationState({
        verificationRequestId: null,
        canonicalEmailSnapshot: null,
        verificationStatus: nextStatus,
        verificationMessage: message
      });
    },
    [updateVerificationState]
  );
  const clearDraft = useCallback(() => {
    if (!storageKey || !sessionKey) {
      return;
    }
    sessionStorage.removeItem(storageKey);
    setDraftState({
      sessionKey,
      formValues: {},
      verificationRequestId: null,
      canonicalEmailSnapshot: null,
      verificationStatus: 'idle',
      verificationMessage: null,
      lastUpdatedAt: new Date().toISOString()
    });
  }, [sessionKey, storageKey]);
  return {
    sessionKey,
    draftState,
    saveFormValues,
    updateVerificationState,
    clearVerificationState,
    clearDraft
  };
}