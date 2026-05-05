import { useEffect, useRef, useState } from "react";

/**
 * CustomCursor — soft accent-tinted cursor blob that follows the mouse.
 *
 * Day 62 (Sasha 2026-05-05): responsiveness pass. Two safe perf wins
 * over the original implementation, no behavior change for desktop
 * mouse users:
 *
 *   1. **Skip mount entirely on touch devices.** The cursor is
 *      invisible anyway on touch (no real cursor → blob never appears
 *      in any meaningful way), so attaching `mousemove` / `mouseover`
 *      listeners + maintaining state for nothing is pure waste. Detect
 *      via `(hover: none) and (pointer: coarse)` media query.
 *
 *   2. **rAF-throttle the position update.** The original called
 *      `setPosition` on every mousemove pixel — on a high-Hz mouse
 *      that's 120-240 React re-renders per second of rapid motion,
 *      each one re-running the hover-tree to commit the new transform.
 *      Now we coalesce to one update per animation frame (max ~60/sec),
 *      which is the most we can paint anyway. Visually identical;
 *      main thread freed up for legitimate interaction work.
 *
 * No change to:
 *   • The cursor's visual appearance (same blur-xl accent blob)
 *   • The cursor-type detection (still highlights anchors + buttons)
 *   • The fixed positioning + scale-on-pointer behavior
 *   • Z-index, transition, easing — all preserved
 */
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(hover: none) and (pointer: coarse)").matches ?? false;
  });
  // rAF coalescing — store the latest mouse position in a ref and
  // schedule a single state update per animation frame, rather than
  // one setState per mousemove event (which can fire 120-240 times/sec
  // on high-refresh-rate mice).
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTouchDevice) return;

    const flushPosition = () => {
      rafIdRef.current = null;
      if (pendingPosRef.current) {
        setPosition(pendingPosRef.current);
        pendingPosRef.current = null;
      }
    };

    const updatePosition = (e: MouseEvent) => {
      pendingPosRef.current = { x: e.clientX, y: e.clientY };
      if (rafIdRef.current === null) {
        rafIdRef.current = window.requestAnimationFrame(flushPosition);
      }
    };

    const updateCursorType = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") !== null ||
        target.closest("button") !== null
      );
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", updateCursorType);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateCursorType);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      className="fixed pointer-events-none z-cursor transition-transform duration-150 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${isPointer ? 2 : 1})`,
      }}
    >
      <div className="w-12 h-12 rounded-full bg-accent/20 blur-xl" />
    </div>
  );
};

export default CustomCursor;
