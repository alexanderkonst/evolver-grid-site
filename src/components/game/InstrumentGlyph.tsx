/**
 * InstrumentGlyph — the closed instrument (docs/specs/navigation-instrument/architecture.md §4):
 * the air octahedron inside a thin water ring that shows today's moon, with the quarters the
 * player has lit glowing faintly inside it as their QuarterSign solids.
 *
 * The SVG holds the glass, moon, and lit bodies. CSS animates the haze and ring.
 * The button also opens on Enter or a swipe up.
 */
import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { QUARTER_DRAWINGS } from "@/components/game/QuarterSign";
import { getVillageElement, type ElementKey } from "@/data/villagePlaces";
import { getVillageSky } from "@/lib/villageSky";
import { SWIPE_OPEN_PX } from "@/lib/yourAiInstrument";
import { GLYPH_PX, MOON_RADIUS, RING_RADIUS, innerBodies, liftAbove, moonLitPolygon } from "@/lib/instrument/glyph";
import type { Glints } from "@/lib/instrument/glint";
import "./InstrumentGlyph.css";

const WATER = getVillageElement("water").color;
const MOON_REFRESH_MS = 15 * 60 * 1000;
const CENTER = GLYPH_PX / 2;
const FACES = [
  { points: "53,10 11,54 58,63", from: "#9cc3e3", to: "#eaf4fb" },
  { points: "53,10 58,63 93,53", from: "#eaf4fb", to: "#9cc3e3" },
  { points: "11,54 58,63 51,94", from: "#b5d2e9", to: "#5f9fd6" },
  { points: "58,63 93,53 51,94", from: "#9cc3e3", to: "#5f9fd6" },
];

type Props = {
  /** `litQuarters` for this player. */
  lit: Record<ElementKey, boolean>;
  /** Bodies whose face changed since the player was here (WP6): a glint on each, nothing else. */
  glints?: Glints;
  /** The crystal is in the glyph (false while it is raised in the open instrument). */
  carried: boolean;
  open: boolean;
  reduced: boolean;
  label: string;
  /** CSS selector of elements the glyph must never cover (the next-move card): it lifts above them. */
  avoid?: string;
  onToggle: () => void;
  onSwipeUp: () => void;
};

const NO_GLINTS: Glints = {};

const InstrumentGlyph = forwardRef<HTMLButtonElement, Props>(({ lit, glints = NO_GLINTS, carried, open, reduced, label, avoid, onToggle, onSwipeUp }, ref) => {
  const svgId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const setButton = useCallback(
    (el: HTMLButtonElement | null) => {
      buttonRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );
  // The lift is written straight to the element (not through React state), so it lands in the same
  // frame the card appears: no frame where the glyph sits on the card and no render lag.
  const liftRef = useRef(0);
  const openRef = useRef(open);
  openRef.current = open;

  const applyLift = useCallback((px: number) => {
    liftRef.current = px;
    const el = buttonRef.current;
    if (el) el.style.translate = px && !openRef.current ? `0 ${-px}px` : "";
  }, []);

  // Home is the bottom-right corner. Where a screen keeps something there (the next-move card spans the
  // foot of the village on a phone), the glyph rises above it, so it never covers content or controls.
  useEffect(() => {
    if (!avoid) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = buttonRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // Where it sits now is home plus whatever lift is applied (none while the instrument is open).
      const applied = openRef.current ? 0 : liftRef.current;
      const home = { left: r.left, right: r.right, top: r.top + applied, bottom: r.bottom + applied };
      const rects = Array.from(document.querySelectorAll(avoid))
        .map((n) => n.getBoundingClientRect())
        .filter((a) => a.width > 0 && a.height > 0);
      const next = liftAbove(home, rects);
      if (next !== liftRef.current) applyLift(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    // The card arrives (the save loads) and grows without a scroll or a resize: watch for it. The
    // observer callback measures at once, before the next paint; the frame is only for scroll and resize.
    const touches = (n: Node) => n instanceof Element && (n.matches(avoid) || !!n.querySelector(avoid));
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure());
    const watched = new Set<Element>();
    const watch = () => {
      document.querySelectorAll(avoid).forEach((n) => {
        if (!watched.has(n)) {
          watched.add(n);
          ro?.observe(n);
        }
      });
    };
    const mo = new MutationObserver((records) => {
      if (!records.some((m) => Array.from(m.addedNodes).some(touches) || Array.from(m.removedNodes).some(touches))) return;
      watch();
      measure();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    watch();
    measure();
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    // A slow safety net for anything the observers cannot see (a class change that moves the card).
    const timer = window.setInterval(() => {
      if (!document.hidden) schedule();
    }, 1000);
    return () => {
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.clearInterval(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [avoid, applyLift]);

  // Open drops the lift (the open instrument keeps the corner for its own panel); closing brings it back.
  useEffect(() => {
    applyLift(liftRef.current);
  }, [open, applyLift]);

  const [moon, setMoon] = useState(() => getVillageSky().cycle);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  // The moon moves slowly: look again every quarter of an hour and when the tab comes back.
  useEffect(() => {
    const look = () => setMoon(getVillageSky().cycle);
    const timer = window.setInterval(look, MOON_REFRESH_MS);
    document.addEventListener("visibilitychange", look);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", look);
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    if (start.y - t.clientY >= SWIPE_OPEN_PX && Math.abs(t.clientX - start.x) < start.y - t.clientY) {
      e.preventDefault();
      onSwipeUp();
    }
  };

  return (
    <button
      ref={setButton}
      type="button"
      onClick={onToggle}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={label}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-keyshortcuts="I ."
      data-testid="instrument-glyph"
      data-open={open ? "true" : "false"}
      data-glints={Object.keys(glints).join(",")}
      style={{
        width: GLYPH_PX,
        height: GLYPH_PX,
        touchAction: "manipulation",
      }}
      className="fixed right-2 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.75rem)] z-[81] isolate grid place-items-center rounded-full outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#bcd7e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e13] motion-safe:hover:scale-105 motion-safe:active:scale-95 sm:bottom-[5.5rem] sm:right-5"
    >
      {carried && <span aria-hidden="true" className="instrument-glyph-haze" />}
      <svg
        aria-hidden="true"
        data-testid="instrument-glyph-svg"
        width={GLYPH_PX}
        height={GLYPH_PX}
        viewBox={`0 0 ${GLYPH_PX} ${GLYPH_PX}`}
        className="relative block"
      >
        <defs>
          {FACES.map(({ from, to }, i) => (
            <linearGradient key={i} id={`${svgId}-face-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop stopColor={from} />
              <stop offset="1" stopColor={to} />
            </linearGradient>
          ))}
          <clipPath id={`${svgId}-cloud-clip`}><polygon points={FACES[0].points} /></clipPath>
          <filter id={`${svgId}-cloud-blur`} x="-50%" y="-150%" width="200%" height="400%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={RING_RADIUS} fill="none" stroke={WATER} strokeOpacity=".6" strokeWidth="1.25" />
        {!reduced && (
          <circle className="instrument-glyph-sweep" cx={CENTER} cy={CENTER} r={RING_RADIUS} fill="none"
            stroke={WATER} strokeWidth="2" strokeOpacity=".95" pathLength="100" strokeDasharray="8.75 91.25" />
        )}
        <g transform={`translate(${CENTER} ${CENTER - RING_RADIUS})`}>
          <circle r={MOON_RADIUS} fill="#0b0e13" stroke={WATER} />
          <polygon points={moonLitPolygon(moon, MOON_RADIUS - 0.5).map((point) => point.join(",")).join(" ")} fill="#f2f6f8" />
        </g>
        {carried && (
          <>
            {FACES.map(({ points }, i) => (
              <polygon key={i} points={points} fill={`url(#${svgId}-face-${i})`} fillOpacity=".75" />
            ))}
            <g clipPath={`url(#${svgId}-cloud-clip)`}>
              <ellipse cx="43" cy="41" rx="13" ry="4" transform="rotate(18 43 41)" fill="white" opacity=".52"
                filter={`url(#${svgId}-cloud-blur)`} />
            </g>
            <path d="M53 10 93 53 51 94 11 54Z M53 10 58 63 51 94 M11 54 58 63 93 53"
              fill="none" stroke="white" strokeWidth="1" strokeOpacity=".8" strokeLinejoin="round" />
            {innerBodies(lit).map(({ element, solid, size, x, y, color }) => {
              const { outline, faces } = QUARTER_DRAWINGS[solid];
              return (
                <g key={element} transform={`translate(${CENTER + x - size / 2} ${CENTER + y - size / 2}) scale(${size / 24})`}
                  stroke={color} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
                  <polygon points={outline} fill={color} fillOpacity=".16" strokeOpacity=".6" />
                  {faces.map((face) => <polyline key={face} points={face} fill="none" strokeOpacity=".45" />)}
                  {glints[element] && (
                    <circle className="motion-safe:animate-pulse" cx="21" cy="3" r="3" fill="#f2f6f8" stroke="#0b0e13" />
                  )}
                </g>
              );
            })}
          </>
        )}
      </svg>
    </button>
  );
});
InstrumentGlyph.displayName = "InstrumentGlyph";

export default InstrumentGlyph;
