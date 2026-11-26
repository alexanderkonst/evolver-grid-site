/**
 * InkLine — one ink line from the player to the glowing place, then it fades (docs/specs/navigation-instrument/
 * architecture.md §6, phase 3; Okami brush). A bearing, never a route.
 *
 * It never shows by default. Two things draw it: choosing the next move on the ether face (the host passes a
 * `request`), and accepting the quiet offer that appears on clear signs of being lost (`LostOffer`: 3 entries
 * without the next move changing, or 60 s idle; the numbers live in `src/lib/instrument/inkLine.ts`).
 *
 * The line is a fixed SVG over the screen with pointer-events off. It starts at the instrument glyph (where the
 * player's hand just was) and ends just short of the glowing place, found in the page as the one place that
 * reads `next` (the map pin, the rail's glow mark or the top bar). If no glow is on screen there is nothing
 * honest to point at, so nothing is drawn. Reduced motion: a static dotted line, no drawing, no fade.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePlayerNextMove } from "@/hooks/usePlayerNextMove";
import {
  INK_DRAW_MS,
  INK_FADE_MS,
  INK_HOLD_MS,
  INK_STATIC_MS,
  LOST_IDLE_MS,
  clampToScreen,
  inkPath,
  lostInitial,
  lostReduce,
  moveSignature,
  placeKeyForPath,
  type Point,
} from "@/lib/instrument/inkLine";

const INK = "#e8eef2";
const ACCENT = "#bcd7e6";
const PANEL = "#0b0e13";
const HAIRLINE = "rgba(188,215,230,0.18)";

/** Where the glowing place can be on screen, best first: the map pin's dot, the rail's glow mark, any `next` place. */
const GLOW_SELECTORS = ['.vl-pin[data-place-state="next"] .vl-dot', '[data-next-move="true"]', '[data-place-state="next"]'];

const centreOf = (el: Element): Point | null => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
};
const onScreen = (p: Point): boolean => p.x >= 0 && p.y >= 0 && p.x <= window.innerWidth && p.y <= window.innerHeight;

/**
 * The centre of the glowing place, or null when the page has none. One that is on screen wins (best selector
 * first); otherwise the first one the page draws, off screen (a map wider than the window), is returned and
 * the layer aims at it along its line of sight.
 */
export const findGlow = (root: ParentNode = document): Point | null => {
  let offScreen: Point | null = null;
  for (const selector of GLOW_SELECTORS) {
    for (const el of Array.from(root.querySelectorAll(selector))) {
      if (el.closest("[inert], [aria-hidden='true'][role='dialog']")) continue;
      const at = centreOf(el);
      if (!at) continue;
      if (onScreen(at)) return at;
      offScreen ??= at;
    }
  }
  return offScreen;
};

/** Where the line starts: the instrument glyph, else the bottom-right corner it lives in. */
const findOrigin = (): Point => {
  const glyph = document.querySelector('[data-testid="instrument-glyph"]');
  const at = glyph && centreOf(glyph);
  return (at && onScreen(at) && at) || { x: window.innerWidth - 40, y: window.innerHeight - 100 };
};

type LineProps = {
  from: Point;
  to: Point;
  reduced: boolean;
  /** The line has finished fading (or, reduced, finished its hold). */
  onDone: () => void;
};

/** The line itself, for two known points. */
export const InkLine = ({ from, to, reduced, onDone }: LineProps) => {
  const { d, end } = inkPath(from, to);
  // start: undrawn · draw: the stroke runs · fade: it lets go. Reduced motion has one phase: still.
  const [phase, setPhase] = useState<"start" | "draw" | "fade" | "still">(reduced ? "still" : "start");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(() => doneRef.current(), INK_STATIC_MS);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("draw")));
    timers.push(window.setTimeout(() => setPhase("fade"), INK_DRAW_MS + INK_HOLD_MS));
    timers.push(window.setTimeout(() => doneRef.current(), INK_DRAW_MS + INK_HOLD_MS + INK_FADE_MS));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduced]);

  const drawn = phase !== "start";
  const dotOn = reduced || phase === "fade" || phase === "draw";
  return (
    <svg
      aria-hidden="true"
      data-testid="ink-line"
      data-mode={reduced ? "dotted" : "draw"}
      data-phase={phase}
      width="100%"
      height="100%"
      className="pointer-events-none fixed inset-0 z-[82]"
      style={{ opacity: phase === "fade" ? 0 : 1, transition: reduced ? "none" : `opacity ${INK_FADE_MS}ms ease-out` }}
    >
      {reduced ? (
        <path d={d} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 9" />
      ) : (
        <path
          d={d}
          fill="none"
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={drawn ? 0 : 1}
          style={{ transition: `stroke-dashoffset ${INK_DRAW_MS}ms cubic-bezier(0.22, 0.8, 0.24, 1)` }}
        />
      )}
      <circle
        cx={end.x}
        cy={end.y}
        r={4}
        fill={INK}
        style={{ opacity: dotOn ? 1 : 0, transition: reduced ? "none" : `opacity 200ms ease-out ${INK_DRAW_MS - 200}ms` }}
      />
    </svg>
  );
};

/** One request to draw the line: a new `nonce` draws it once more. */
export type InkRequest = { nonce: number };

let lastNonce = 0;
/** A nonce that is larger than every one before it, so the latest request always wins. */
export const nextInkNonce = (): number => (lastNonce = Math.max(lastNonce + 1, Date.now()));

type LayerProps = {
  request: InkRequest | null;
  reduced: boolean;
  /** Said once to screen readers: the line points at this place. */
  placeName: string | null;
  onDrawn?: () => void;
  /** No glowing place was on screen after a short look (the player is inside a place, not on the map). */
  onMiss?: () => void;
};

/** How long to look for the glow before giving up, ms: a map that is still mounting needs a moment. */
const GLOW_LOOK_MS = 1500;

/**
 * Draws the line for each request. With no request it renders nothing at all. The points are measured when the
 * request arrives (after a frame, so the closing instrument has let go of the screen) and then held.
 */
export const InkLayer = ({ request, reduced, placeName, onDrawn, onMiss }: LayerProps) => {
  const { t } = useTranslation();
  const [line, setLine] = useState<{ nonce: number; from: Point; to: Point } | null>(null);
  const nonce = request?.nonce ?? null;

  useEffect(() => {
    if (nonce === null) return;
    let raf = 0;
    const until = performance.now() + GLOW_LOOK_MS;
    const look = () => {
      const to = findGlow();
      if (to) {
        const from = findOrigin();
        setLine({ nonce, from, to: clampToScreen(from, to, window.innerWidth, window.innerHeight) });
        onDrawn?.();
      } else if (performance.now() < until) {
        raf = requestAnimationFrame(look);
      } else {
        onMiss?.();
      }
    };
    // After a frame, so the closing instrument has let go of the screen.
    raf = requestAnimationFrame(look);
    return () => cancelAnimationFrame(raf);
    // The callbacks are read when a frame runs; a new identity must not restart the look or redraw the line.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  if (!line || typeof document === "undefined") return null;
  return createPortal(
    <>
      <InkLine key={line.nonce} from={line.from} to={line.to} reduced={reduced} onDone={() => setLine(null)} />
      <p role="status" className="sr-only" data-testid="ink-line-announce">
        {placeName ? t("inkLine.announce", { place: placeName }) : ""}
      </p>
    </>,
    document.body,
  );
};

type OfferProps = { onAccept: () => void; onDismiss: () => void };

/**
 * The quiet offer on signs of being lost: a small pill that sits just left of the instrument glyph, where
 * it covers nothing (the glyph itself lifts above the next-move card). Accepting draws the line.
 */
export const LostOffer = ({ onAccept, onDismiss }: OfferProps) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<{ right: number; bottom: number } | null>(null);

  useEffect(() => {
    const place = () => {
      const glyph = document.querySelector('[data-testid="instrument-glyph"]');
      const r = glyph?.getBoundingClientRect();
      if (!r) return;
      setAnchor({ right: Math.max(8, window.innerWidth - r.left + 6), bottom: Math.max(8, window.innerHeight - r.bottom + 6) });
    };
    place();
    window.addEventListener("resize", place);
    const timer = window.setInterval(place, 1000);
    return () => {
      window.removeEventListener("resize", place);
      window.clearInterval(timer);
    };
  }, []);

  if (!anchor || typeof document === "undefined") return null;
  return createPortal(
    <div
      role="group"
      aria-label={t("inkLine.offerLabel")}
      data-testid="ink-offer"
      className="fixed z-[81] flex max-w-[calc(100vw-5.5rem)] items-center gap-1 rounded-full py-0.5 pl-3 pr-0.5"
      style={{ right: anchor.right, bottom: anchor.bottom, backgroundColor: "rgba(11,14,19,0.94)", border: `1px solid ${HAIRLINE}`, color: INK }}
    >
      <button
        type="button"
        onClick={onAccept}
        className="min-h-11 rounded-full pr-2 text-[13px] leading-tight outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
        style={{ color: INK }}
      >
        {t("inkLine.offer")}
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("inkLine.dismiss")}
        className="inline-flex h-11 w-9 items-center justify-center rounded-full text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
        style={{ color: "#9fb2bd", backgroundColor: PANEL }}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>,
    document.body,
  );
};

type GuideProps = {
  /** The instrument is on screen (open or a face): no offer then, and the player is not idle. */
  raised: boolean;
  reduced: boolean;
  /** A request from the ether face. */
  request: InkRequest | null;
};

/**
 * The host's one piece: the line, the lost signs and the offer. Renders nothing until the line is drawn or the
 * player shows a clear sign of being lost.
 */
export const InkGuide = ({ raised, reduced, request }: GuideProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { move, copy } = usePlayerNextMove();
  const [lost, dispatch] = useReducer(lostReduce, lostInitial);
  const [own, setOwn] = useState<InkRequest | null>(null);
  const moveKey = move?.place.key ?? null;
  const latest = request && (!own || request.nonce > own.nonce) ? request : own;
  const sig = moveSignature(move);

  // The next move as it is now: a change is an advance and clears the count.
  useEffect(() => {
    dispatch({ type: "move", sig });
  }, [sig]);

  // A place entered that is not the next move's own place, without the move changing. The first route seen is
  // where the player already was, not an entry.
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const key = placeKeyForPath(pathname);
    if (key && key !== moveKey) dispatch({ type: "entry" });
  }, [pathname, moveKey]);

  // 60 s with no input. Any input, or the instrument being up, starts the minute again.
  useEffect(() => {
    if (sig === null || raised || lost.settled || lost.offered) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!document.hidden) dispatch({ type: "idle" });
        else arm();
      }, LOST_IDLE_MS);
    };
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true, capture: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm, true));
    };
  }, [sig, raised, lost.settled, lost.offered]);

  // The glow lives on the map. From inside a place there is none on screen, so go back to the map once and look again.
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const mapTried = useRef(false);
  const onMiss = useCallback(() => {
    if (mapTried.current) {
      mapTried.current = false; // the map had no glow either: nothing honest to point at
      return;
    }
    if (pathRef.current === "/village") return;
    mapTried.current = true;
    navigate("/village");
    setOwn({ nonce: nextInkNonce() });
  }, [navigate]);
  const onDrawn = useCallback(() => {
    mapTried.current = false;
    dispatch({ type: "settle" });
  }, []);

  const accept = useCallback(() => {
    dispatch({ type: "settle" });
    setOwn({ nonce: nextInkNonce() });
  }, []);
  const dismiss = useCallback(() => dispatch({ type: "settle" }), []);

  return (
    <>
      <InkLayer request={latest} reduced={reduced} placeName={copy?.place ?? null} onDrawn={onDrawn} onMiss={onMiss} />
      {lost.offered && !raised && <LostOffer onAccept={accept} onDismiss={dismiss} />}
      {/* The offer is also said once, quietly, to screen readers. */}
      <p role="status" className="sr-only" data-testid="ink-offer-announce">
        {lost.offered && !raised ? t("inkLine.offerLabel") : ""}
      </p>
    </>
  );
};

export default InkGuide;
