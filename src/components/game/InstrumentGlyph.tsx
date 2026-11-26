/**
 * InstrumentGlyph — the closed instrument (docs/specs/navigation-instrument/architecture.md §4):
 * the air octahedron inside a thin water ring that shows today's moon, with the quarters the
 * player has lit glowing faintly inside it as their QuarterSign solids.
 *
 * One canvas, 2D, no library. The loop (`src/lib/instrument/loop.ts`) runs at most 30 fps, stops
 * while the tab is hidden, and never turns the crystal under prefers-reduced-motion. The element
 * is also the control: click or Enter opens (native button), a swipe up from it opens on touch.
 * The shell owns the `I` key and the rest of the open/close choreography.
 */
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { drawOctahedron } from "@/components/game/AirOctahedron";
import { QUARTER_DRAWINGS } from "@/components/game/QuarterSign";
import { getVillageElement, type ElementKey } from "@/data/villagePlaces";
import { getVillageSky } from "@/lib/villageSky";
import { SWIPE_OPEN_PX } from "@/lib/yourAiInstrument";
import { GLYPH_PX, MOON_RADIUS, OCTAHEDRON_SCALE, RING_RADIUS, innerBodies, liftAbove, moonLitPolygon, type InnerBody } from "@/lib/instrument/glyph";
import { createFrameLoop, glyphPose, ringSweep } from "@/lib/instrument/loop";
import type { Glints } from "@/lib/instrument/glint";

const WATER = getVillageElement("water").color;
const MOON_REFRESH_MS = 15 * 60 * 1000;

type Pt = [number, number];
const points = (s: string): Pt[] => s.split(" ").map((p) => p.split(",").map(Number) as Pt);

const drawBody = (ctx: CanvasRenderingContext2D, c: number, b: InnerBody) => {
  const drawing = QUARTER_DRAWINGS[b.solid];
  const k = b.size / 24;
  ctx.save();
  ctx.translate(c + b.x - b.size / 2, c + b.y - b.size / 2);
  ctx.scale(k, k);
  ctx.strokeStyle = b.color;
  ctx.fillStyle = b.color;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const outline = points(drawing.outline);
  ctx.beginPath();
  outline.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.globalAlpha = 0.16;
  ctx.fill();
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 0.45;
  for (const f of drawing.faces) {
    ctx.beginPath();
    points(f).forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
  }
  ctx.restore();
};

const drawGlint = (ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#f2f6f8";
  ctx.strokeStyle = "rgba(11,14,19,0.9)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
};

type Frame = { spin: number; reduced: boolean; lit: Record<ElementKey, boolean>; glints: Glints; carried: boolean; moon: number };

const drawGlyph = (ctx: CanvasRenderingContext2D, { spin, reduced, lit, glints, carried, moon }: Frame) => {
  const size = GLYPH_PX;
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  // The water ring, with a short brighter stretch travelling round it: the time layer is alive.
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = WATER;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(c, c, RING_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  if (!reduced) {
    const a = ringSweep(spin, reduced) - Math.PI / 2;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(c, c, RING_RADIUS, a, a + 0.55);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Today's moon, sitting on the ring at twelve o'clock.
  ctx.save();
  ctx.translate(c, c - RING_RADIUS);
  ctx.fillStyle = "rgba(11,14,19,0.92)";
  ctx.beginPath();
  ctx.arc(0, 0, MOON_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  const lunes = moonLitPolygon(moon, MOON_RADIUS - 0.5);
  if (lunes.length) {
    ctx.fillStyle = "#f2f6f8";
    ctx.beginPath();
    lunes.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = WATER;
  ctx.beginPath();
  ctx.arc(0, 0, MOON_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // The crystal and the bodies inside it. While the instrument is raised the crystal is up in the
  // centre of the screen, so the glyph keeps only its ring.
  if (carried) {
    for (const b of innerBodies(lit)) drawBody(ctx, c, b);
    drawOctahedron(ctx, size, glyphPose(spin, reduced), OCTAHEDRON_SCALE, false);
    // WP6: a glint on the body whose face changed, and only there. A static dot under reduced motion; it breathes otherwise.
    for (const b of innerBodies(lit)) {
      if (glints[b.element]) drawGlint(ctx, c + b.x + b.size / 2 - 3, c + b.y - b.size / 2 + 3, reduced ? 1 : 0.7 + 0.3 * Math.sin(spin * 2.4));
    }
  }
};

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  const frameRef = useRef<Frame>({ spin: 0, reduced, lit, glints, carried, moon });
  frameRef.current = { ...frameRef.current, reduced, lit, glints, carried, moon };
  const redrawRef = useRef<() => void>(() => {});
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(GLYPH_PX * dpr);
    canvas.height = Math.round(GLYPH_PX * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const loop = createFrameLoop({
      reduced,
      isHidden: () => document.hidden,
      draw: (spin) => drawGlyph(ctx, { ...frameRef.current, spin }),
    });
    redrawRef.current = loop.redraw;
    loop.sync();
    const onVisibility = () => loop.sync();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      redrawRef.current = () => {};
      loop.dispose();
    };
  }, [reduced]);

  // A change of inputs while the loop is stopped (reduced motion, hidden tab) still repaints.
  useEffect(() => {
    redrawRef.current();
  }, [lit, glints, carried, moon]);

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
      aria-keyshortcuts="I"
      data-testid="instrument-glyph"
      data-open={open ? "true" : "false"}
      data-glints={Object.keys(glints).join(",")}
      style={{
        width: GLYPH_PX,
        height: GLYPH_PX,
        touchAction: "manipulation",
      }}
      className="fixed right-2 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.75rem)] z-[81] grid place-items-center rounded-full outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#bcd7e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e13] motion-safe:hover:scale-105 motion-safe:active:scale-95 sm:bottom-[5.5rem] sm:right-5"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-testid="instrument-glyph-canvas"
        width={GLYPH_PX}
        height={GLYPH_PX}
        style={{ width: GLYPH_PX, height: GLYPH_PX, display: "block" }}
      />
    </button>
  );
});
InstrumentGlyph.displayName = "InstrumentGlyph";

export default InstrumentGlyph;
