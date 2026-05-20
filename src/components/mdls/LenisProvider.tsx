import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * MDLS · LenisProvider
 *
 * Activates Lenis smooth-scroll for the wrapped subtree. Lenis is the same
 * scroll engine that ~90% of Awwwards-winning sites used in 2024-2025 —
 * butter-smooth scrolljacking with proper momentum, anchored to RAF.
 *
 * Scoped per-route (not site-wide) — global Lenis would alter scroll
 * behavior across the entire app, which is invasive. We mount it only on
 * MDLS surfaces (/mdls-preview, /build/equilibrium) where the visual
 * register requires that level of polish.
 *
 * Respects `prefers-reduced-motion: reduce` — disables smoothing when the
 * user has expressed that preference at the OS level.
 *
 * v1.0 — 2026-05-19 — Wave 1 of the MDLS octave shift.
 */
interface LenisProviderProps {
  children: ReactNode;
  /** Override smoothness duration (seconds). Default 1.2 for premium feel. */
  duration?: number;
}

export const LenisProvider = ({ children, duration = 1.2 }: LenisProviderProps) => {
  useEffect(() => {
    // Respect OS-level reduced-motion preference. If user opts out of
    // motion, do not initialize Lenis — native scroll is the fallback.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      duration,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices use native momentum scrolling — overriding it
      // tends to feel WORSE than native iOS scroll, so we keep it native.
      syncTouch: false,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [duration]);

  return <>{children}</>;
};

export default LenisProvider;
