import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBundleEditorStore } from "@/store/bundleEditorStore";

const AUTOSAVE_DELAY_MS = 1000;
const UNDO_REDO_SAVE_DELAY_MS = 3000;
const SAVE_INDICATOR_SHOW_DELAY_MS = 180;
const SAVE_INDICATOR_MIN_VISIBLE_MS = 700;

export const useBundleSave = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { bundle, isDirty, isUndoRedoAction, saveBundle, clearUndoRedoFlag } =
    useBundleEditorStore();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bundleRef = useRef(bundle);
  const isDirtyRef = useRef(isDirty);
  const currentPathRef = useRef(`${location.pathname}${location.search}${location.hash}`);
  const isNavigatingRef = useRef(false);
  const savingRef = useRef(false);
  const savingIndicatorShowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savingIndicatorHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savingIndicatorVisibleSinceRef = useRef<number | null>(null);

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

  const clearPendingTimer = useCallback(() => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  }, []);

  const handleSave = useCallback(
    async (isAutoSave = false, showSuccessToast = !isAutoSave) => {
      if (!bundleRef.current || !isDirtyRef.current) {
        return;
      }

      showSavingIndicator();
      try {
        await saveBundle();
        setLastSaved(new Date());
        clearUndoRedoFlag();
        if (showSuccessToast) {
          setMessage({ type: "success", text: t("builder.toast.save_success") });
          setTimeout(() => setMessage(null), 2500);
        }
      } catch (error) {
        console.error("Failed to save bundle:", error);
        setMessage({ type: "error", text: t("builder.toast.save_error") });
      } finally {
        hideSavingIndicator();
      }
    },
    [clearUndoRedoFlag, hideSavingIndicator, saveBundle, showSavingIndicator, t],
  );

  useEffect(() => {
    bundleRef.current = bundle;
  }, [bundle]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    currentPathRef.current = `${location.pathname}${location.search}${location.hash}`;
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (!bundle?.updatedAt || lastSaved !== null) {
      return;
    }
    setLastSaved(new Date(bundle.updatedAt));
  }, [bundle?.updatedAt, lastSaved]);

  useEffect(() => {
    if (!isDirty) {
      clearPendingTimer();
      return;
    }
    clearPendingTimer();
    const delay = isUndoRedoAction ? UNDO_REDO_SAVE_DELAY_MS : AUTOSAVE_DELAY_MS;
    pendingTimerRef.current = setTimeout(() => {
      void handleSave(true);
      pendingTimerRef.current = null;
    }, delay);
    return () => {
      clearPendingTimer();
    };
  }, [clearPendingTimer, handleSave, isDirty, isUndoRedoAction]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        clearPendingTimer();
        void handleSave(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearPendingTimer, handleSave]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    const resolveInternalPath = (rawHref: string) => {
      if (!rawHref || rawHref.startsWith("#")) {
        return null;
      }
      if (rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:")) {
        return null;
      }
      try {
        const parsed = new URL(rawHref, window.location.origin);
        if (parsed.origin !== window.location.origin) {
          return null;
        }
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return rawHref;
      }
    };

    const handleLinkClick = async (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link) {
        return;
      }
      if (link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }
      const nextPath = resolveInternalPath(link.getAttribute("href") || "");
      if (!nextPath || nextPath === currentPathRef.current) {
        return;
      }
      if ((!isDirtyRef.current && !pendingTimerRef.current) || isNavigatingRef.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      isNavigatingRef.current = true;
      clearPendingTimer();
      await handleSave(true, false);
      navigate(nextPath);
      isNavigatingRef.current = false;
    };

    const handlePopState = async () => {
      if ((!isDirtyRef.current && !pendingTimerRef.current) || isNavigatingRef.current) {
        return;
      }
      const destinationPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const currentPath = currentPathRef.current;
      if (destinationPath === currentPath) {
        return;
      }

      window.history.pushState(null, "", currentPath);
      isNavigatingRef.current = true;
      clearPendingTimer();
      await handleSave(true, false);
      navigate(destinationPath);
      isNavigatingRef.current = false;
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [clearPendingTimer, handleSave, navigate]);

  useEffect(() => {
    return () => {
      clearPendingTimer();
      clearSavingIndicatorTimers();
    };
  }, [clearPendingTimer, clearSavingIndicatorTimers]);

  return {
    saving,
    hasUnsavedChanges: isDirty,
    message,
    lastSaved,
    handleSave,
  };
};
