import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFormStore } from '@/store/formStore';
import { useAuthStore } from '@/store/authStore';
import { useFormShortcuts } from '@/hooks/form/useFormShortcuts';
import { buildFormSavePayload } from '@/store/slices/createFormSlice';
const AUTOSAVE_DELAY_MS = 1000;
const UNDO_REDO_SAVE_DELAY_MS = 3000;
const SAVE_INDICATOR_SHOW_DELAY_MS = 180;
const SAVE_INDICATOR_MIN_VISIBLE_MS = 700;
export const useFormSave = (id: string | undefined) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentForm, saveForm, isUndoRedoAction, clearUndoRedoFlag } = useFormStore();
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error';text: string;} | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const previousFormStrRef = useRef<string>('');
  const currentFormRef = useRef(currentForm);
  const firstRenderRef = useRef(true);
  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimestampRef = useRef<number>(0);
  const pendingNavigationRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const savingRef = useRef(false);
  const savingIndicatorShowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savingIndicatorHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savingIndicatorVisibleSinceRef = useRef<number | null>(null);
  const cancelInflightSave = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  const clearSavingIndicatorTimers = useCallback(() => {
    if (savingIndicatorShowTimerRef.current) {
      clearTimeout(savingIndicatorShowTimerRef.current);
      savingIndicatorShowTimerRef.current = null;
    }
    if (savingIndicatorHideTimerRef.current) {
      clearTimeout(savingIndicatorHideTimerRef.current);
      savingIndicatorHideTimerRef.current = null;
    }
  }, []);
  const showSavingIndicator = useCallback(() => {
    if (savingIndicatorHideTimerRef.current) {
      clearTimeout(savingIndicatorHideTimerRef.current);
      savingIndicatorHideTimerRef.current = null;
    }
    if (savingRef.current || savingIndicatorShowTimerRef.current) {
      return;
    }
    savingIndicatorShowTimerRef.current = setTimeout(() => {
      savingIndicatorShowTimerRef.current = null;
      savingIndicatorVisibleSinceRef.current = Date.now();
      savingRef.current = true;
      setSaving(true);
    }, SAVE_INDICATOR_SHOW_DELAY_MS);
  }, []);
  const hideSavingIndicator = useCallback(() => {
    if (savingIndicatorShowTimerRef.current) {
      clearTimeout(savingIndicatorShowTimerRef.current);
      savingIndicatorShowTimerRef.current = null;
    }
    if (!savingRef.current) {
      return;
    }
    const visibleSince = savingIndicatorVisibleSinceRef.current;
    const elapsed = visibleSince ? Date.now() - visibleSince : SAVE_INDICATOR_MIN_VISIBLE_MS;
    const remaining = Math.max(0, SAVE_INDICATOR_MIN_VISIBLE_MS - elapsed);
    if (savingIndicatorHideTimerRef.current) {
      clearTimeout(savingIndicatorHideTimerRef.current);
    }
    savingIndicatorHideTimerRef.current = setTimeout(() => {
      savingIndicatorHideTimerRef.current = null;
      savingIndicatorVisibleSinceRef.current = null;
      savingRef.current = false;
      setSaving(false);
    }, remaining);
  }, []);
  const buildCurrentFormString = useCallback((form = currentFormRef.current) => {
    if (!form) {
      return null;
    }
    return JSON.stringify(buildFormSavePayload(form));
  }, []);
  const flushPendingTimer = useCallback(() => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);
  const persistKeepaliveSave = useCallback(() => {
    const form = currentFormRef.current;
    const token = useAuthStore.getState().token;
    if (!form || !token || form.id.startsWith('temp-')) {
      return;
    }
    const currentFormStr = buildCurrentFormString(form);
    if (!currentFormStr || currentFormStr === previousFormStrRef.current) {
      return;
    }
    const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined || `${window.location.origin}/api`;
    try {
      fetch(`${apiBaseUrl}/forms/${form.id}`, {
        method: 'PATCH',
        keepalive: true,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(buildFormSavePayload(form))
      });
    } catch (error) {
      console.error('Keepalive save failed:', error);
    }
  }, [buildCurrentFormString]);
  const handleSave = useCallback(async (isAutoSave = false, silent = false, checkDebounce = false) => {
    if (!currentForm) return;
    const currentFormStr = JSON.stringify(buildFormSavePayload(currentForm));
    const hasChanges = currentFormStr !== previousFormStrRef.current;
    if (!hasChanges) return;
    if (checkDebounce) {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimestampRef.current;
      if (timeSinceLastSave < 1000) return;
      lastSaveTimestampRef.current = now;
    }
    cancelInflightSave();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    showSavingIndicator();
    try {
      const savedForm = await saveForm(controller.signal);
      if (savedForm && savedForm.id !== id) {
        navigate(`/forms/${savedForm.id}/builder`, { replace: true });
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      previousFormStrRef.current = currentFormStr;
      clearUndoRedoFlag();
      if (!isAutoSave && !silent) {
        setMessage({ type: 'success', text: t('builder.toast.save_success') });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error('Error saving form:', error);
      setMessage({ type: 'error', text: t('builder.toast.save_error') });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      hideSavingIndicator();
    }
  }, [currentForm, id, navigate, saveForm, cancelInflightSave, clearUndoRedoFlag, hideSavingIndicator, showSavingIndicator, t]);
  useFormShortcuts(handleSave);
  useEffect(() => {
    currentFormRef.current = currentForm;
  }, [currentForm]);
  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);
  useEffect(() => {
    if (currentForm?.updatedAt && lastSaved === null) {
      setLastSaved(new Date(currentForm.updatedAt));
    }
  }, [currentForm?.updatedAt, lastSaved]);
  useEffect(() => {
    if (!currentForm) return;
    const currentFormStr = JSON.stringify(buildFormSavePayload(currentForm));
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      previousFormStrRef.current = currentFormStr;
      setHasUnsavedChanges(false);
      return;
    }
    if (currentFormStr !== previousFormStrRef.current) {
      setHasUnsavedChanges(true);
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      const delay = isUndoRedoAction ? UNDO_REDO_SAVE_DELAY_MS : AUTOSAVE_DELAY_MS;
      pendingTimerRef.current = setTimeout(async () => {
        await handleSave(true);
        pendingTimerRef.current = null;
      }, delay);
    } else {
      setHasUnsavedChanges(false);
    }
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, [currentForm, handleSave, isUndoRedoAction]);
  useBeforeUnload(
    useCallback(() => {
      if (!currentForm) return false;
      const currentFormStr = buildCurrentFormString(currentForm);
      if (currentFormStr !== previousFormStrRef.current) {
        flushPendingTimer();
        persistKeepaliveSave();
        return 'You have unsaved changes.';
      }
    }, [currentForm, buildCurrentFormString, flushPendingTimer, persistKeepaliveSave])
  );
  useEffect(() => {
    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link || !currentForm) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      const hasPendingSave = pendingTimerRef.current !== null;
      const currentFormStr = JSON.stringify(buildFormSavePayload(currentForm));
      if ((hasPendingSave || currentFormStr !== previousFormStrRef.current) && !isNavigating) {
        e.preventDefault();
        e.stopPropagation();
        flushPendingTimer();
        setIsNavigating(true);
        showSavingIndicator();
        pendingNavigationRef.current = href;
        try {
          await saveForm();
          previousFormStrRef.current = currentFormStr;
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          setMessage({ type: 'success', text: t('builder.toast.save_before_nav') });
          setTimeout(() => {
            navigate(href);
            setIsNavigating(false);
            hideSavingIndicator();
          }, 300);
        } catch (error) {
          console.error('Failed to save before navigation:', error);
          setMessage({ type: 'error', text: 'Failed to save' });
          setIsNavigating(false);
          hideSavingIndicator();
          pendingNavigationRef.current = null;
        }
      }
    };
    const handlePopState = async () => {
      if (!currentForm || isNavigating) return;
      const hasPendingSave = pendingTimerRef.current !== null;
      const currentFormStr = JSON.stringify(buildFormSavePayload(currentForm));
      if (hasPendingSave || currentFormStr !== previousFormStrRef.current) {
        window.history.pushState(null, '', window.location.href);
        flushPendingTimer();
        setIsNavigating(true);
        showSavingIndicator();
        try {
          await saveForm();
          previousFormStrRef.current = currentFormStr;
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          setMessage({ type: 'success', text: 'Saved before navigation' });
          setTimeout(() => {
            setIsNavigating(false);
            hideSavingIndicator();
            window.history.back();
          }, 300);
        } catch (error) {
          console.error('Failed to save before back navigation:', error);
          setMessage({ type: 'error', text: 'Failed to save' });
          setIsNavigating(false);
          hideSavingIndicator();
        }
      }
    };
    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentForm, flushPendingTimer, hideSavingIndicator, isNavigating, navigate, saveForm, showSavingIndicator, t]);
  useEffect(() => {
    return () => {
      clearSavingIndicatorTimers();
    };
  }, [clearSavingIndicatorTimers]);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentFormStr = buildCurrentFormString();
      if (currentFormStr !== previousFormStrRef.current) {
        flushPendingTimer();
        persistKeepaliveSave();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    const handlePageHide = () => {
      const currentFormStr = buildCurrentFormString();
      if (currentFormStr !== previousFormStrRef.current) {
        flushPendingTimer();
        persistKeepaliveSave();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [buildCurrentFormString, flushPendingTimer, persistKeepaliveSave]);
  return { saving, hasUnsavedChanges, message, lastSaved, handleSave };
};