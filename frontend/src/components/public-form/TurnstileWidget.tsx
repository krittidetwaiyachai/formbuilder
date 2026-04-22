import { useEffect, useRef, useState } from 'react';
declare global {
  interface Window {
    turnstile?: {
      render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        theme?: 'light' | 'dark' | 'auto';
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      })
      => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}
const SCRIPT_ID = 'cloudflare-turnstile-script';
const SCRIPT_SRC =
'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
interface TurnstileWidgetProps {
  onTokenChange: (token: string | null) => void;
  resetSignal?: number;
  theme?: 'light' | 'dark' | 'auto';
}
function ensureTurnstileScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is unavailable'));
      return;
    }
    if (window.turnstile) {
      resolve();
      return;
    }
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('failed')), {
        once: true
      });
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('failed'));
    document.head.appendChild(script);
  });
}
export default function TurnstileWidget({
  onTokenChange,
  resetSignal = 0,
  theme = 'auto'
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as
  string |
  undefined;
  useEffect(() => {
    let cancelled = false;
    if (!siteKey) {
      setLoadError('Captcha is not configured.');
      return;
    }
    ensureTurnstileScript().
    then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onTokenChange(token),
        'expired-callback': () => onTokenChange(null),
        'error-callback': () => onTokenChange(null)
      });
    }).
    catch(() => {
      if (!cancelled) {
        setLoadError('Failed to load captcha widget.');
        onTokenChange(null);
      }
    });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, siteKey, theme]);
  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);
  if (loadError) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">        {loadError}      </div>);
  }
  return <div ref={containerRef} className="min-h-[65px]" />;
}