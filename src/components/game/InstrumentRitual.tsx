/**
 * InstrumentRitual — the body-lit ritual (docs/specs/navigation-instrument/architecture.md §5.2).
 *
 * When a quarter has lit (its first place opened) and the player has not been shown it, the ritual
 * waits for a calm moment and plays once: the quarter sign in the world flares, a thread of light
 * flies from it to the glyph, the body draws itself edge by edge inside the crystal and settles into
 * its place, one tone in the element's voice sounds, and one line says what opened. Tap (or Esc) skips.
 * It is recorded in `litSeen` (WP1, `litSeenStore.ts`), so a returning player never sees it twice.
 *
 * Reduced motion: no flare, no thread, no drawing. The body fades in inside the glyph; tone and line stay.
 *
 * What plays, and when, is decided in `src/lib/instrument/ritual.ts` (pure, unit-tested); the tone is
 * `src/lib/instrument/sound.ts`. This file draws. It reads the world (`[data-quarter-sign]`, the glyph)
 * and never changes it: everything it paints is a fixed overlay that ignores the pointer, and a tap on the
 * world only skips the sequence, it is not held back.
 */
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { QUARTER_DRAWINGS } from "@/components/game/QuarterSign";
import { VILLAGE_ELEMENTS, getVillageElement, type ElementKey } from "@/data/villagePlaces";
import { GLYPH_PX, innerBodies } from "@/lib/instrument/glyph";
import {
  LINE_AT_MS,
  LINE_FADE_MS,
  REDUCED_FADE_MS,
  REDUCED_TOTAL_MS,
  RITUAL_STEPS,
  RITUAL_TOTAL_MS,
  isCalmMoment,
  isCalmPath,
  lineVisibleAt,
  moduleFormMounted,
  nextRitual,
  ritualLineKey,
  stepProgress,
} from "@/lib/instrument/ritual";
import { instrumentSound } from "@/lib/instrument/sound";
import { useLitSeen } from "@/lib/instrument/litSeenStore";

/** The player lands, then it plays: a short rest, also long enough for a signed-in save to merge. */
const SETTLE_MS = 1200;
// The glyph's drawing (InstrumentGlyph.tsx); #502 renamed it from `-canvas` and this lookup went stale.
const GLYPH_SELECTOR = '[data-testid="instrument-glyph-svg"]';

const PANEL = "#0b0e13";
const INK = "#e8eef2";
const HAIRLINE = "rgba(188,215,230,0.18)";
const SERIF = "'Cormorant Garamond', serif";

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
};

const easeOut = (p: number) => 1 - (1 - p) ** 3;
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

type Pt = { x: number; y: number };
type Geometry = { from: Pt; to: Pt; scale: number };

const centre = (r: DOMRect): Pt => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

/** Where the quarter sign is (the first one on screen) and where the glyph is, right now. */
const measure = (element: ElementKey): Geometry | null => {
  const glyph = document.querySelector(GLYPH_SELECTOR)?.getBoundingClientRect();
  if (!glyph || glyph.width === 0) return null;
  const sign = Array.from(document.querySelectorAll(`[data-quarter-sign="${element}"]`))
    .map((n) => n.getBoundingClientRect())
    .find((r) => r.width > 0 && r.height > 0);
  const to = centre(glyph);
  // A screen without that sign (a place pane that does not carry the rail): the thread rises from the lower middle.
  const from = sign ? centre(sign) : { x: window.innerWidth / 2, y: window.innerHeight * 0.7 };
  return { from, to, scale: glyph.width / GLYPH_PX };
};

const bezier = (a: Pt, c: Pt, b: Pt, p: number): Pt => ({
  x: (1 - p) ** 2 * a.x + 2 * (1 - p) * p * c.x + p * p * b.x,
  y: (1 - p) ** 2 * a.y + 2 * (1 - p) * p * c.y + p * p * b.y,
});

const THREAD_TAIL = 0.35;

type SceneProps = {
  element: ElementKey;
  reduced: boolean;
  /** The body has settled (the tone), or the player skipped: record it as seen. */
  onSettled: () => void;
  /** Nothing of the ritual is on screen any more. */
  onDone: () => void;
};

const RitualScene = ({ element, reduced, onSettled, onDone }: SceneProps) => {
  const { t } = useTranslation();
  const { color } = getVillageElement(element);
  const total = reduced ? REDUCED_TOTAL_MS : RITUAL_TOTAL_MS;
  const toneAt = reduced ? 0 : LINE_AT_MS;
  const startRef = useRef(0);
  const toneRef = useRef(false);
  const settledRef = useRef(false);
  const [frame, setFrame] = useState<{ elapsed: number; geo: Geometry | null }>({ elapsed: 0, geo: null });

  const settle = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled();
  }, [onSettled]);

  // One frame loop for the whole sequence (about 30 a second; it is a 2.5 s overlay, not a scene).
  useEffect(() => {
    startRef.current = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      // The player left for somewhere that is not calm, or the tab went away: stop where we are.
      if (document.hidden || moduleFormMounted(document)) {
        onDone();
        return;
      }
      const elapsed = performance.now() - startRef.current;
      if (elapsed >= total) {
        settle();
        onDone();
        return;
      }
      if (!toneRef.current && elapsed >= toneAt) {
        toneRef.current = true;
        instrumentSound().play(element);
        settle();
      }
      if (now - last >= 33) {
        last = now;
        setFrame({ elapsed, geo: measure(element) });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [element, total, toneAt, settle, onDone]);

  // A tap anywhere, or Esc, skips the sequence: no tone if it had not sounded, the body is recorded, the line fades out.
  // The tap is only listened to, never caught: it still reaches whatever the player touched, so the ritual holds nothing.
  const skip = useCallback(() => {
    toneRef.current = true;
    settle();
    const fadeStart = total - LINE_FADE_MS;
    if (performance.now() - startRef.current < fadeStart) startRef.current = performance.now() - fadeStart;
  }, [settle, total]);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", skip, { capture: true, passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", skip, { capture: true });
    };
  }, [skip]);

  const { elapsed, geo } = frame;
  const showLine = lineVisibleAt(elapsed, reduced);
  const lineStart = reduced ? 0 : LINE_AT_MS;
  const lineOpacity = Math.min(1, (elapsed - lineStart) / 300, (total - elapsed) / LINE_FADE_MS);

  // 1. the quarter sign flares
  const flare = stepProgress("flare", elapsed);
  // 2. the thread: a short bright stretch flying from the sign to the glyph along a gentle curve
  const thread = stepProgress("thread", elapsed);
  // 3. the body draws itself, edge by edge, then settles into its place in the crystal
  const draw = stepProgress("draw", elapsed);
  const body = innerBodies({ [element]: true } as Record<ElementKey, boolean>).find((b) => b.element === element);
  const drawing = body ? QUARTER_DRAWINGS[body.solid] : null;
  const edges = drawing ? [drawing.outline, ...drawing.faces] : [];
  // The overlay arrives and leaves softly; the glyph underneath already carries the lit body, so it is left there.
  const bodyOpacity = reduced
    ? Math.max(0, Math.min(1, elapsed / REDUCED_FADE_MS, (REDUCED_FADE_MS * 2.5 - elapsed) / REDUCED_FADE_MS))
    : Math.max(0, Math.min(1, 1 - (elapsed - (RITUAL_STEPS[2].at + RITUAL_STEPS[2].ms)) / 400));

  // The line sits just above the glyph wherever it is (it lifts itself above the next-move card), so it never covers it.
  const lineBottom = geo ? Math.max(8, window.innerHeight - (geo.to.y - (GLYPH_PX * geo.scale) / 2) + 12) : "calc(max(1rem, env(safe-area-inset-bottom)) + 12rem)";

  const ctrl = geo ? { x: (geo.from.x + geo.to.x) / 2, y: Math.min(geo.from.y, geo.to.y) - 80 } : null;
  const head = geo && ctrl ? bezier(geo.from, ctrl, geo.to, easeInOut(thread)) : null;

  const glyphBox = geo ? { left: geo.to.x - (GLYPH_PX * geo.scale) / 2, top: geo.to.y - (GLYPH_PX * geo.scale) / 2, size: GLYPH_PX * geo.scale } : null;
  const settleP = reduced ? 1 : easeOut(Math.max(0, (draw - 0.55) / 0.45));
  const slot = body ? { x: body.x, y: body.y } : { x: 0, y: 0 };
  const bodyX = GLYPH_PX / 2 + slot.x * settleP;
  const bodyY = GLYPH_PX / 2 + slot.y * settleP;
  const bodyScale = (1.9 - 0.9 * settleP) * (body ? body.size / 24 : 1);

  return createPortal(
    <div data-testid="instrument-ritual" data-element={element} data-variant={reduced ? "reduced" : "full"} className="pointer-events-none fixed inset-0 z-[82]">
      {!reduced && geo && flare > 0 && flare < 1 ? (
        <div
          aria-hidden="true"
          data-testid="instrument-ritual-flare"
          className="absolute rounded-full"
          style={{
            left: geo.from.x,
            top: geo.from.y,
            width: 44,
            height: 44,
            marginLeft: -22,
            marginTop: -22,
            border: `2px solid ${color}`,
            boxShadow: `0 0 18px ${color}`,
            opacity: 1 - flare,
            transform: `scale(${0.5 + easeOut(flare) * 1.1})`,
          }}
        />
      ) : null}

      {!reduced && geo && ctrl && head && thread > 0 && elapsed < RITUAL_STEPS[2].at + 200 ? (
        <svg aria-hidden="true" data-testid="instrument-ritual-thread" className="absolute inset-0" width="100%" height="100%" focusable="false">
          <path
            d={`M ${geo.from.x} ${geo.from.y} Q ${ctrl.x} ${ctrl.y} ${geo.to.x} ${geo.to.y}`}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${THREAD_TAIL} 1`}
            strokeDashoffset={THREAD_TAIL - easeInOut(thread)}
            opacity={thread < 1 ? 0.9 : 0.9 * Math.max(0, 1 - (elapsed - (RITUAL_STEPS[1].at + RITUAL_STEPS[1].ms)) / 200)}
          />
          <circle cx={head.x} cy={head.y} r={4} fill={color} opacity={thread < 1 ? 1 : 0} />
        </svg>
      ) : null}

      {glyphBox && drawing && body && (reduced || draw > 0 || elapsed >= RITUAL_STEPS[3].at) ? (
        <svg
          aria-hidden="true"
          data-testid="instrument-ritual-body"
          className="absolute"
          style={{ left: glyphBox.left, top: glyphBox.top, opacity: bodyOpacity }}
          width={glyphBox.size}
          height={glyphBox.size}
          viewBox={`0 0 ${GLYPH_PX} ${GLYPH_PX}`}
          focusable="false"
        >
          <g transform={`translate(${bodyX} ${bodyY}) scale(${reduced ? body.size / 24 : bodyScale}) translate(-12 -12)`}>
            {edges.map((pts, i) => {
              // Each edge starts a little after the one before it and runs to the end of the step.
              const p = reduced ? 1 : Math.max(0, Math.min(1, (draw * (edges.length + 2) - i) / 2));
              return (
                <polyline
                  key={pts}
                  points={pts}
                  pathLength={1}
                  fill={i === 0 && p >= 1 ? color : "none"}
                  fillOpacity={0.16}
                  stroke={color}
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={1}
                  strokeDashoffset={1 - p}
                />
              );
            })}
          </g>
        </svg>
      ) : null}

      {/* The one line, read aloud politely; the region exists from the first frame so the text is announced when it arrives. */}
      <div
        role="status"
        aria-live="polite"
        className="absolute inset-x-0 flex justify-center px-4"
        style={{ bottom: lineBottom }}
      >
        {showLine ? (
          <p
            data-testid="instrument-ritual-line"
            className="max-w-[min(92vw,28rem)] rounded-xl px-4 py-3 text-center text-[1.05rem] leading-snug"
            style={{ background: PANEL, color: INK, border: `1px solid ${HAIRLINE}`, fontFamily: SERIF, fontWeight: 600, opacity: Math.max(0, lineOpacity) }}
          >
            {t(ritualLineKey(element))}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

type Props = {
  /** The same gate as the glyph: only a player who carries the instrument sees its rituals. */
  enabled: boolean;
  /** Signed-in player id, or null for a guest (`litSeen` lives in the save, or in this browser). */
  ownerId: string | null;
  /** `litQuarters` for this player. */
  lit: Record<ElementKey, boolean>;
  /** The instrument is open (or a face is): the player is in it, so nothing plays. */
  raised: boolean;
};

/**
 * The queue. Mounted once beside the glyph; renders nothing until a body is lit and unseen and the
 * moment is calm. Also gives the open and close of the instrument their breath (§5.4).
 */
const InstrumentRitual = ({ enabled, ownerId, lit, raised }: Props) => {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [seen, markSeen] = useLitSeen(ownerId);
  const [playing, setPlaying] = useState<ElementKey | null>(null);
  // Bumped when the moment turned out not to be calm after all (a module form is on the page): look again.
  const [recheck, bump] = useReducer((n: number) => n + 1, 0);
  const playedThisVisit = useRef(false);
  const litRef = useRef(lit);
  litRef.current = lit;
  // The quarters as a string: `litQuarters` makes a new object every render, and a new object must not restart the wait.
  const litKey = VILLAGE_ELEMENTS.map((e) => (lit[e.key] ? "1" : "0")).join("");

  // One body per calm visit: leaving for somewhere that is not calm opens the next turn.
  const calmPath = isCalmPath(pathname);
  useEffect(() => {
    if (!calmPath) playedThisVisit.current = false;
  }, [calmPath]);

  useEffect(() => {
    if (!enabled) return;
    const calm = isCalmMoment({ pathname, raised, inModuleForm: false });
    const next = nextRitual({ lit: litRef.current, seen, calm, playing: playing !== null, playedThisVisit: playedThisVisit.current });
    if (!next) return;
    const timer = window.setTimeout(() => {
      if (document.hidden || moduleFormMounted(document)) {
        bump();
        return;
      }
      playedThisVisit.current = true;
      setPlaying(next);
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, pathname, raised, litKey, seen, playing, recheck]);

  // Opening the instrument stops a ritual that was playing.
  useEffect(() => {
    if (raised) setPlaying(null);
  }, [raised]);

  // The breath of air on open and close (§5.1, §5.4). Not on first paint: only when it changes.
  const wasRaised = useRef(raised);
  useEffect(() => {
    if (wasRaised.current === raised) return;
    wasRaised.current = raised;
    instrumentSound().play("breath");
  }, [raised]);

  const onSettled = useCallback(() => {
    if (playing) markSeen(playing);
  }, [playing, markSeen]);
  const onDone = useCallback(() => setPlaying(null), []);

  if (!enabled || !playing) return null;
  return <RitualScene key={playing} element={playing} reduced={reduced} onSettled={onSettled} onDone={onDone} />;
};

export default InstrumentRitual;
