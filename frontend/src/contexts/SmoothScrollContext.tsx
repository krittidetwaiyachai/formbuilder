import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";

interface SmoothScrollContextValue {
  scrollTo: (
    target: HTMLElement | number,
    options?: { offset?: number; duration?: number },
  ) => void;
  resize: () => void;
  isReady: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(
  null,
);

interface SmoothScrollProviderProps {
  children: ReactNode;
  targetId?: string;
  enabled?: boolean;
  duration?: number;
}

export function SmoothScrollProvider({
  children,
  targetId,
  enabled = true,
  duration = 0.5,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [isReady, setIsReady] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const initLenis = () => {
      const element = targetId ? document.getElementById(targetId) : undefined;
      if (targetId && !element) {
        setTimeout(initLenis, 50);
        return;
      }

      const lenis = new Lenis({
        wrapper: element || undefined,
        duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;
      setIsReady(true);

      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      if (element) {
        observerRef.current = new MutationObserver(() => {
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }
          resizeTimeoutRef.current = setTimeout(() => {
            if (lenisRef.current) {
              lenisRef.current.resize();
            }
          }, 100);
        });

        observerRef.current.observe(element, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false,
        });
      }

      return () => {
        cancelAnimationFrame(rafId);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        lenis.destroy();
        lenisRef.current = null;
        setIsReady(false);
      };
    };

    const cleanup = initLenis();
    return cleanup;
  }, [enabled, targetId, duration]);

  const scrollTo = useCallback(
    (
      target: HTMLElement | number,
      options?: { offset?: number; duration?: number },
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? 0,
          duration: options?.duration ?? 1,
        });
      }
    },
    [],
  );

  const resize = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.resize();
    }
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, resize, isReady }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useBuilderScroll() {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    return {
      scrollTo: () => {},
      resize: () => {},
      isReady: false,
    };
  }
  return context;
}
