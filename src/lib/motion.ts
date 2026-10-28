import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

/**
 * Motion — one transition language for the Journey (WP-15 part 1).
 * Design: docs/02-strategy/game_of_being_you.md §14.8 (WP-15), §14.11, §14.6.
 *
 * The look of every transition lives in CSS, on the `--motion-*` tokens in src/index.css
 * (duration fast/base/slow/reveal, easing in/out/inout, the zoom and settle scales, the
 * `motion-enter` / `motion-settle` keyframes). Those tokens go to 0 under
 * `prefers-reduced-motion: reduce`, so a CSS-only transition collapses by itself.
 *
 * This file is the other half: the few moments where the code has to wait for a transition
 * before it can move on (leave a screen, then navigate). `MOTION` mirrors the CSS tokens in
 * milliseconds; src/lib/__tests__/motion.test.ts fails if the two drift apart.
 *
 *   village → place      the map zooms toward the place while the scene settles in (CSS)
 *   place → Intro        ENTER pushes the scene in and fades it, then the route changes
 *   Intro → module       the one button fades the Intro out, then the module opens
 *   Outro → village      the one button fades the Outro out; the village fades in
 *   a place that opened  the colour fills into it (§14.11), once, on the visit that shows it
 *
 * Nothing here moves layout: opacity, `scale` and `filter` only.
 */

/** Milliseconds of each step. Keep equal to `--motion-*` in src/index.css. */
export const MOTION = {
  fast: 200,
  base: 400,
  slow: 900,
  reveal: 1800,
} as const;

export type MotionStep = keyof typeof MOTION;

/**
 * True when the player asked for less motion. Also true where it cannot be asked
 * (no `matchMedia`: server render, tests): then nothing waits for a transition.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/** How long to wait for a step: its token in milliseconds, or 0 under reduced motion. */
export const motionMs = (step: MotionStep): number => (prefersReducedMotion() ? 0 : MOTION[step]);

/**
 * The keys in `now` that are not in `seen`, in `now` order. `seen === null` means nothing was
 * remembered for this player, so everything in `now` is new.
 */
export const unseenKeys = (seen: readonly string[] | null, now: readonly string[]): string[] => {
  const known = new Set(seen ?? []);
  return now.filter((k) => !known.has(k));
};

/**
 * Leave a screen with a transition, then go on.
 *
 *   const { leaving, leave } = useLeave("base");
 *   <Link to={to} onClick={(e) => leave(() => navigate(to), e)} />
 *
 * `leaving` flips on at the click so the screen can play its exit (class `is-leaving`);
 * `go` runs when the step has passed. Under reduced motion, `go` runs at once. A click the
 * browser should keep (new tab, modifier key on a link) is left alone. A second click while
 * leaving does nothing.
 */
export function useLeave(step: MotionStep) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | null>(null);
  const busy = useRef(false);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const leave = useCallback(
    (go: () => void, e?: MouseEvent<HTMLElement>) => {
      if (e) {
        const el = e.currentTarget;
        const isLink = el instanceof HTMLAnchorElement;
        if (isLink && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
        e.preventDefault();
      }
      if (busy.current) return;
      const ms = motionMs(step);
      if (ms === 0) {
        go();
        return;
      }
      busy.current = true;
      setLeaving(true);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        busy.current = false;
        go();
        // The screen is normally gone by now; if it stayed (same route), it comes back.
        setLeaving(false);
      }, ms);
    },
    [step],
  );

  return { leaving, leave };
}
