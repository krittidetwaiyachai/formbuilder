import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface UseSmoothScrollOptions {
    enabled?: boolean;
    duration?: number;
    orientation?: 'vertical' | 'horizontal';
}

interface UseSmoothScrollReturn {
    scrollTo: (target: HTMLElement | number, options?: { offset?: number; duration?: number }) => void;
}

export const useSmoothScroll = (
    targetId?: string | null,
    options: UseSmoothScrollOptions = {}
): UseSmoothScrollReturn => {
    const {
        enabled = true,
        duration = 0.5,
        orientation = 'vertical',
    } = options;

    const lenisRef = useRef<Lenis | null>(null);
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
                orientation,
                gestureOrientation: orientation,
                smoothWheel: true,
                wheelMultiplier: 0.8,
                touchMultiplier: 1.5,
            });

            lenisRef.current = lenis;

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
            };
        };

        const cleanup = initLenis();
        return cleanup;
    }, [enabled, targetId, duration, orientation]);

    const scrollTo = (target: HTMLElement | number, scrollOptions?: { offset?: number; duration?: number }) => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(target, {
                offset: scrollOptions?.offset ?? 0,
                duration: scrollOptions?.duration ?? 1,
            });
        }
    };

    return { scrollTo };
};
