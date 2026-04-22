import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const WARNING_BEFORE = 2 * 60 * 1000;
export function useInactivityLogout(onWarning?: () => void) {
  const { logout, isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutDurationRef = useRef(INACTIVITY_TIMEOUT);
  const warningDurationRef = useRef(WARNING_BEFORE);
  useEffect(() => {
    let mounted = true;
    const loadPolicy = async () => {
      try {
        const response = await api.get<{
          authPolicy?: {
            sessionIdleTimeoutMinutes?: number;
          };
        }>('/system/public-settings');
        if (!mounted) return;
        const timeoutMinutes = Number(response.data?.authPolicy?.sessionIdleTimeoutMinutes);
        if (!Number.isFinite(timeoutMinutes) || timeoutMinutes <= 0) {
          return;
        }
        const nextTimeoutMs = timeoutMinutes * 60 * 1000;
        timeoutDurationRef.current = nextTimeoutMs;
        warningDurationRef.current = Math.min(WARNING_BEFORE, Math.max(nextTimeoutMs - 1000, 1000));
      } catch (error) {
        console.error('Failed to load auth policy settings:', error);
      }
    };
    void loadPolicy();
    return () => {
      mounted = false;
    };
  }, []);
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    clearTimers();
    const timeoutMs = timeoutDurationRef.current;
    const warningMs = warningDurationRef.current;
    warningRef.current = setTimeout(() => {
      onWarning?.();
    }, Math.max(timeoutMs - warningMs, 1000));
    timeoutRef.current = setTimeout(() => {
      logout();
      window.location.href = '/';
    }, timeoutMs);
  }, [isAuthenticated, logout, clearTimers, onWarning]);
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetTimer();
    };
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    resetTimer();
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [isAuthenticated, resetTimer, clearTimers]);
  return { resetTimer };
}