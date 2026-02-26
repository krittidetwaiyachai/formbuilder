import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormStore } from '@/store/formStore';
import { useFormShortcuts } from '@/hooks/form/useFormShortcuts';

export const useFormSave = (id: string | undefined) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentForm, saveForm } = useFormStore();

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const previousFormStrRef = useRef<string>('');
    const firstRenderRef = useRef(true);
    const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveTimestampRef = useRef<number>(0);
    const pendingNavigationRef = useRef<string | null>(null);

    const handleSave = useCallback(async (isAutoSave = false, silent = false, checkDebounce = false) => {
        if (!currentForm) return;

        const { updatedAt, createdAt, ...contentToTrack } = currentForm;
        const currentFormStr = JSON.stringify(contentToTrack);
        const hasChanges = currentFormStr !== previousFormStrRef.current;

        if (!hasChanges) return;

        if (checkDebounce) {
            const now = Date.now();
            const timeSinceLastSave = now - lastSaveTimestampRef.current;
            if (timeSinceLastSave < 1000) return;
            lastSaveTimestampRef.current = now;
        }

        setSaving(true);
        try {
            const savedForm = await saveForm();

            if (savedForm && savedForm.id !== id) {
                navigate(`/forms/${savedForm.id}/builder`, { replace: true });
            }

            await new Promise(r => setTimeout(r, 500));
            setLastSaved(new Date());

            previousFormStrRef.current = currentFormStr;

            if (!isAutoSave && !silent) {
                setMessage({ type: 'success', text: t('builder.toast.save_success') });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Error saving form:', error);
            setMessage({ type: 'error', text: t('builder.toast.save_error') });
        } finally {
            setSaving(false);
        }
    }, [currentForm, id, navigate, saveForm, t]);

    useFormShortcuts(handleSave);

    useEffect(() => {
        if (currentForm?.updatedAt && lastSaved === null) {
            setLastSaved(new Date(currentForm.updatedAt));
        }
    }, [currentForm?.updatedAt, lastSaved]);

    useEffect(() => {
        if (!currentForm) return;
        const { updatedAt, createdAt, ...contentToTrack } = currentForm;
        const currentFormStr = JSON.stringify(contentToTrack);

        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            previousFormStrRef.current = currentFormStr;
            return;
        }

        if (currentFormStr !== previousFormStrRef.current) {
            if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);

            pendingTimerRef.current = setTimeout(async () => {
                await handleSave(true);
                pendingTimerRef.current = null;
            }, 1000);

            return () => {
                if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
            };
        }
    }, [currentForm, handleSave]);

    useBeforeUnload(
        useCallback(() => {
            if (!currentForm) return false;
            const { updatedAt, createdAt, ...contentToTrack } = currentForm;
            const currentFormStr = JSON.stringify(contentToTrack);
            if (currentFormStr !== previousFormStrRef.current) {

                return 'You have unsaved changes.';
            }
        }, [currentForm])
    );


    useEffect(() => {
        const handleLinkClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (!link || !currentForm) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

            const hasPendingSave = pendingTimerRef.current !== null;
            const { updatedAt, createdAt, ...contentToTrack } = currentForm;
            const currentFormStr = JSON.stringify(contentToTrack);

            if ((hasPendingSave || currentFormStr !== previousFormStrRef.current) && !isNavigating) {
                e.preventDefault();
                e.stopPropagation();

                if (pendingTimerRef.current) {
                    clearTimeout(pendingTimerRef.current);
                    pendingTimerRef.current = null;
                }

                setIsNavigating(true);
                setSaving(true);
                pendingNavigationRef.current = href;

                try {
                    await saveForm();
                    previousFormStrRef.current = currentFormStr;
                    setLastSaved(new Date());
                    setMessage({ type: 'success', text: t('builder.toast.save_before_nav') });

                    setTimeout(() => {
                        navigate(href);
                        setIsNavigating(false);
                        setSaving(false);
                    }, 300);
                } catch (error) {
                    console.error('Failed to save before navigation:', error);
                    setMessage({ type: 'error', text: 'Failed to save' });
                    setIsNavigating(false);
                    setSaving(false);
                    pendingNavigationRef.current = null;
                }
            }
        };

        const handlePopState = async () => {
            if (!currentForm || isNavigating) return;

            const hasPendingSave = pendingTimerRef.current !== null;
            const { updatedAt, createdAt, ...contentToTrack } = currentForm;
            const currentFormStr = JSON.stringify(contentToTrack);

            if (hasPendingSave || currentFormStr !== previousFormStrRef.current) {
                window.history.pushState(null, '', window.location.href);

                if (pendingTimerRef.current) {
                    clearTimeout(pendingTimerRef.current);
                    pendingTimerRef.current = null;
                }

                setIsNavigating(true);
                setSaving(true);

                try {
                    await saveForm();
                    previousFormStrRef.current = currentFormStr;
                    setLastSaved(new Date());
                    setMessage({ type: 'success', text: 'Saved before navigation' });

                    setTimeout(() => {
                        setIsNavigating(false);
                        setSaving(false);
                        window.history.back();
                    }, 300);
                } catch (error) {
                    console.error('Failed to save before back navigation:', error);
                    setMessage({ type: 'error', text: 'Failed to save' });
                    setIsNavigating(false);
                    setSaving(false);
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
    }, [currentForm, isNavigating, navigate, saveForm, t]);

    useEffect(() => {
        const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
            if (!currentForm) return;

            const { updatedAt, createdAt, ...contentToTrack } = currentForm;
            const currentFormStr = JSON.stringify(contentToTrack);

            if (currentFormStr !== previousFormStrRef.current) {
                e.preventDefault();
                e.returnValue = '';
                try {
                    await saveForm();
                } catch (error) {
                    console.error('Failed to save before unload:', error);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentForm, saveForm]);

    return { saving, message, lastSaved, handleSave };
};
