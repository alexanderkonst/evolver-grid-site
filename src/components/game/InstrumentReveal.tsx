/**
 * InstrumentReveal — the first reveal (docs/specs/navigation-instrument/architecture.md §5.3, GoBY §25.10, WP7).
 *
 * Once, after the profile exists and the top talent result is in: the world dims; a point of air light
 * gathers into the octahedron; the water ring closes around it with today's moon; the instrument opens
 * itself once and the micro-onboarding of §25.10 lights each group of Your AI in turn, one line each;
 * the outlines of the three earthly bodies show "Opens on your path"; then the crystal settles into the
 * corner. One button throughout: "Continue".
 *
 * NOT WIRED IN. Nothing mounts this yet (WP7 step 3 wires it; core flow, on Sasha's explicit yes to this
 * exact sequence). When it is wired: render it only while `isRevealDue(...)` holds (`reveal.ts`), call
 * `markRevealSeen` in `onSettled`, unmount in `onDone`, and keep the corner glyph where it is (the crystal
 * lands on it).
 *
 * What the steps are, in what order, and what "Continue" does lives in `src/lib/instrument/reveal.ts`
 * (pure, unit-tested). This file draws. The view (`InstrumentRevealView`) holds no state and no hooks, so
 * a step can be rendered, and its button pressed, in a test; the wrapper adds the portal, focus, Esc, the
 * reduced-motion preference and the flight to the corner.
 *
 * Reduced motion (§25.11): nothing draws and nothing fades. Each step simply appears and Continue moves on;
 * at the last step the crystal is gone from the stage and the glyph in the corner is the only crystal left.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { QUARTER_DRAWINGS } from "@/components/game/QuarterSign";
import { getVillageElement } from "@/data/villagePlaces";
import { getVillageSky } from "@/lib/villageSky";
import { GLYPH_PX, RING_RADIUS, moonLitPolygon } from "@/lib/instrument/glyph";
import {
  REVEAL_CONTINUE_KEY,
  REVEAL_OPENS_ON_PATH_KEY,
  REVEAL_OUTLINES,
  REVEAL_STEPS,
  firstRevealStep,
  isLastRevealStep,
  nextRevealStep,
  revealLineKey,
  revealMotion,
  revealStepNumber,
  type RevealMotion,
  type RevealStepId,
} from "@/lib/instrument/reveal";
import { TOUR_GROUPS, type TourGroup } from "@/lib/yourAiInstrument";

// The glyph's drawing (InstrumentGlyph.tsx); the crystal lands on it.
const GLYPH_SELECTOR = '[data-testid="instrument-glyph-svg"]';

const PANEL = "#0b0e13";
const INK = "#e8eef2";
const HAIRLINE = "rgba(188,215,230,0.18)";
const SERIF = "'Cormorant Garamond', serif";
const AIR = getVillageElement("air").color;
const WATER = getVillageElement("water").color;

/** The stage is one square drawing; the crystal's ring is as wide as the glyph's ring, scaled. */
const VIEW = 240;
const CENTRE = VIEW / 2;
/** Scale of the 24-unit QuarterSign board for the big octahedron (its span is 18 units). */
const CRYSTAL_SCALE = 4.5;
const RING_R = 52;
const MOON_R = 5;
/** Where the crystal sits once the instrument has opened: raised, with Your AI's three groups under it. */
const OPEN_Y = 74;
const SCRIM_ALPHA = 0.6;
const STEP_MS = 650;
const DRAW_MS = 900;

// ---------------------------------------------------------------------------------------------
// What is on stage at each step (pure)
// ---------------------------------------------------------------------------------------------

export type RevealStage = {
  /** How dark the world behind is (0 to 1). */
  scrim: number;
  /** The point of air light, before it has gathered. */
  point: boolean;
  /** The octahedron is drawn. */
  crystal: boolean;
  /** The water ring is closed and carries today's moon. */
  ring: boolean;
  /** The instrument has opened: the crystal is raised and Your AI's three groups show under it. */
  opened: boolean;
  /** The group that is lit right now, one per tour step. */
  group: TourGroup | null;
  /** The three earthly outlines show "Opens on your path". */
  outlines: boolean;
  /** The crystal flies to the corner. */
  settled: boolean;
};

const at = (id: RevealStepId) => REVEAL_STEPS.indexOf(id);

export const revealStage = (id: RevealStepId): RevealStage => {
  const i = at(id);
  const tour = (TOUR_GROUPS as readonly string[]).includes(id) ? (id as TourGroup) : null;
  return {
    scrim: id === "settle" ? 0 : SCRIM_ALPHA,
    point: i >= at("dim") && i < at("gather"),
    crystal: i >= at("gather"),
    ring: i >= at("ring"),
    opened: i >= at("open") && i < at("settle"),
    group: tour,
    outlines: id === "outlines",
    settled: id === "settle",
  };
};

/** What a key does while the reveal is up: Esc finishes it (a dialog must be leavable), Tab stays on the one button. */
export const revealKeyAction = (key: string): "finish" | "hold" | null => (key === "Escape" ? "finish" : key === "Tab" ? "hold" : null);

// ---------------------------------------------------------------------------------------------
// The view (stateless)
// ---------------------------------------------------------------------------------------------

type ViewProps = {
  step: RevealStepId;
  /** Reduced motion: nothing draws, nothing fades. */
  reduced: boolean;
  /** `getVillageSky().cycle` for today: 0 (new) … 1. */
  moonCycle: number;
  /** Translation of `t`. */
  t: (key: string, opts?: Record<string, unknown>) => string;
  onContinue: () => void;
  /** Wrapper hooks: the stage element (to measure the flight) and the button (to focus it). */
  stageRef?: (el: HTMLDivElement | null) => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  /** The flight to the corner at the last step: a translate (px) and a scale of the stage. */
  fly?: { x: number; y: number; scale: number } | null;
};

const ease = (m: RevealMotion, ms: number, props: string) => (m.animate ? `${props} ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none");

/** The three groups of Your AI as quiet bands under the crystal; the lit one is larger and bright. */
const BANDS: Record<TourGroup, { y: number; h: number }> = {
  header: { y: 132, h: 20 },
  conversation: { y: 158, h: 38 },
  console: { y: 202, h: 24 },
};

export const InstrumentRevealView = ({ step, reduced, moonCycle, t, onContinue, stageRef, buttonRef, fly = null }: ViewProps) => {
  const motion = revealMotion(reduced);
  const stage = revealStage(step);
  const crystal = QUARTER_DRAWINGS.octahedron;
  const edges = [crystal.outline, ...crystal.faces];
  const moon = moonLitPolygon(moonCycle, MOON_R - 0.5);
  const crystalY = stage.opened ? OPEN_Y : CENTRE;
  const total = REVEAL_STEPS.length;
  const last = isLastRevealStep(step);
  // Reduced motion has no flight: at the last step the stage is simply gone and the corner glyph remains.
  const stageHidden = stage.settled && reduced;
  const stageStyle: CSSProperties = {
    transform: fly ? `translate(${fly.x}px, ${fly.y}px) scale(${fly.scale})` : undefined,
    opacity: stageHidden ? 0 : stage.settled && fly ? 0 : 1,
    // The crystal lands on the glyph, then the copy on stage fades out over it.
    transition: motion.animate ? `transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease ${stage.settled ? 700 : 0}ms` : "none",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("instrument.reveal.label")}
      data-testid="instrument-reveal"
      data-step={step}
      data-variant={reduced ? "reduced" : "full"}
      className="fixed inset-0 z-[85] flex flex-col items-center justify-center gap-4 px-4"
      style={{ pointerEvents: stage.settled && fly ? "none" : "auto" }}
    >
      {/* The world dims behind it and stays live (it is a scrim, never a screen). */}
      <div
        aria-hidden="true"
        data-testid="instrument-reveal-scrim"
        className="absolute inset-0"
        style={{ background: "#05080c", opacity: stage.scrim, transition: motion.fade ? `opacity ${STEP_MS}ms ease` : "none" }}
      />

      <div
        ref={stageRef}
        data-testid="instrument-reveal-stage"
        className="relative"
        style={{ width: "min(88vw, 18rem, 42vh)", aspectRatio: "1 / 1", ...stageStyle }}
      >
        <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" height="100%" data-testid="instrument-reveal-svg" style={{ overflow: "visible" }}>
          {/* Your AI's three groups: where the micro-onboarding looks. */}
          <g data-testid="instrument-reveal-groups" style={{ opacity: stage.opened ? 1 : 0, transition: ease(motion, STEP_MS, "opacity") }}>
            {TOUR_GROUPS.map((group) => {
              const lit = stage.group === group;
              const { y, h } = BANDS[group];
              return (
                <g
                  key={group}
                  data-testid={`instrument-reveal-group-${group}`}
                  data-lit={lit ? "true" : "false"}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    transform: lit ? "scale(1.12)" : "scale(1)",
                    opacity: stage.group === null || lit ? 1 : 0.28,
                    transition: ease(motion, STEP_MS, "transform, opacity"),
                  }}
                >
                  <rect
                    x={44}
                    y={y}
                    width={152}
                    height={h}
                    rx={6}
                    fill={lit ? AIR : "none"}
                    fillOpacity={lit ? 0.18 : 0}
                    stroke={lit ? AIR : INK}
                    strokeOpacity={lit ? 0.95 : 0.4}
                    strokeWidth={lit ? 1.6 : 1}
                    style={{ filter: lit ? `drop-shadow(0 0 6px ${AIR})` : "none", transition: ease(motion, STEP_MS, "fill-opacity, stroke-opacity") }}
                  />
                </g>
              );
            })}
          </g>

          {/* The point of air light that gathers into the crystal. */}
          <circle
            data-testid="instrument-reveal-point"
            cx={CENTRE}
            cy={CENTRE}
            r={stage.point ? 3 : 0}
            fill={AIR}
            style={{ filter: `drop-shadow(0 0 8px ${AIR})`, opacity: stage.point ? 1 : 0, transition: ease(motion, STEP_MS, "opacity, r") }}
          />

          {/* The water ring, closing around the crystal, with today's moon on it. */}
          <g
            data-testid="instrument-reveal-ring"
            data-closed={stage.ring ? "true" : "false"}
            style={{ transform: `translateY(${crystalY - CENTRE}px)`, transition: ease(motion, STEP_MS, "transform") }}
          >
            <circle
              cx={CENTRE}
              cy={CENTRE}
              r={RING_R}
              fill="none"
              stroke={WATER}
              strokeOpacity={0.7}
              strokeWidth={1.5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={stage.ring ? 0 : 1}
              transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
              style={{ transition: ease(motion, DRAW_MS, "stroke-dashoffset") }}
            />
            <g
              data-testid="instrument-reveal-moon"
              transform={`translate(${CENTRE} ${CENTRE - RING_R})`}
              style={{ opacity: stage.ring ? 1 : 0, transition: motion.fade ? `opacity ${STEP_MS}ms ease ${stage.ring ? DRAW_MS - 200 : 0}ms` : "none" }}
            >
              <circle r={MOON_R} fill={PANEL} stroke={WATER} />
              {moon.length > 0 ? <polygon points={moon.map((p) => p.join(",")).join(" ")} fill="#f2f6f8" /> : null}
            </g>
          </g>

          {/* The air octahedron: its edges draw themselves; the faces fill in behind them. */}
          <g
            data-testid="instrument-reveal-crystal"
            data-drawn={stage.crystal ? "true" : "false"}
            style={{
              transform: `translateY(${crystalY - CENTRE}px)`,
              transition: ease(motion, STEP_MS, "transform"),
            }}
          >
            <g transform={`translate(${CENTRE} ${CENTRE}) scale(${CRYSTAL_SCALE}) translate(-12 -12)`} stroke={INK} strokeWidth={0.28} strokeLinejoin="round" strokeLinecap="round">
              <polygon
                points={crystal.outline}
                fill={AIR}
                fillOpacity={stage.crystal ? 0.3 : 0}
                stroke="none"
                style={{ transition: motion.fade ? `fill-opacity ${DRAW_MS}ms ease ${DRAW_MS / 2}ms` : "none" }}
              />
              {edges.map((points) => (
                <polyline
                  key={points}
                  points={points}
                  fill="none"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={stage.crystal ? 0 : 1}
                  style={{ transition: ease(motion, DRAW_MS, "stroke-dashoffset") }}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>

      {/* The three earthly bodies, as outlines: faint, named, "Opens on your path". */}
      {stage.outlines ? (
        <ul data-testid="instrument-reveal-outlines" aria-label={t("instrument.bodies")} className="relative flex w-full max-w-[22rem] list-none items-start justify-between gap-2 p-0">
          {REVEAL_OUTLINES.map((element) => {
            const { color, solid } = getVillageElement(element);
            const { outline, faces } = QUARTER_DRAWINGS[solid];
            return (
              <li key={element} data-testid={`instrument-reveal-outline-${element}`} className="flex w-1/3 flex-col items-center gap-1 text-center">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width={44} height={44} fill="none" stroke={color} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" strokeOpacity={0.7} strokeDasharray="2 2">
                  <polygon points={outline} />
                  {faces.map((face) => (
                    <polyline key={face} points={face} strokeOpacity={0.5} />
                  ))}
                </svg>
                <span className="text-[0.95rem] leading-tight" style={{ color: INK, fontFamily: SERIF, fontWeight: 600 }}>
                  {t(`instrument.body.${element}`)}
                </span>
                <span className="text-[0.8rem] leading-tight" style={{ color: "#b9c6cf" }}>
                  {t(REVEAL_OPENS_ON_PATH_KEY)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* The one line, read aloud politely; the region exists from the first frame, so each new line is announced. */}
      <div
        role="status"
        aria-live="polite"
        data-testid="instrument-reveal-card"
        className="relative w-full max-w-[min(92vw,28rem)] rounded-xl px-4 py-3 text-center"
        style={{ background: PANEL, color: INK, border: `1px solid ${HAIRLINE}` }}
      >
        <p data-testid="instrument-reveal-line" className="text-[1.05rem] leading-snug" style={{ fontFamily: SERIF, fontWeight: 600 }}>
          {t(revealLineKey(step))}
        </p>
        <p data-testid="instrument-reveal-count" className="mt-1 text-[0.8rem]" style={{ color: "#b9c6cf" }}>
          {t("instrument.reveal.step", { n: revealStepNumber(step), total })}
        </p>
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={onContinue}
        data-testid="instrument-reveal-continue"
        data-last={last ? "true" : "false"}
        className="relative min-h-[44px] min-w-[44px] rounded-full px-8 py-2 text-[1rem] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e13]"
        style={{ background: INK, color: PANEL, touchAction: "manipulation" }}
      >
        {t(REVEAL_CONTINUE_KEY)}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// The wrapper: portal, focus, Esc, motion preference, flight to the corner
// ---------------------------------------------------------------------------------------------

const usePrefersReducedMotion = (): boolean => {
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

type Fly = { x: number; y: number; scale: number };

/** Where the stage has to go so its crystal lands on the corner glyph (or where the glyph lives, if it is not mounted). */
const measureFlight = (stage: HTMLElement): Fly => {
  const from = stage.getBoundingClientRect();
  const glyph = document.querySelector(GLYPH_SELECTOR)?.getBoundingClientRect();
  const to = glyph && glyph.width > 0 ? { x: glyph.left + glyph.width / 2, y: glyph.top + glyph.height / 2, ring: (RING_RADIUS * 2 * glyph.width) / GLYPH_PX } : { x: window.innerWidth - 60, y: window.innerHeight - 140, ring: RING_RADIUS * 2 };
  const ringNow = (RING_R * 2 * from.width) / VIEW;
  return { x: to.x - (from.left + from.width / 2), y: to.y - (from.top + from.height / 2), scale: to.ring / ringNow };
};

type Props = {
  /** The player reached the last step: record the reveal as seen (`markRevealSeen`). Called once. */
  onSettled?: () => void;
  /** Nothing of the reveal is on screen any more: unmount it. Called once. */
  onDone: () => void;
  /** Overrides the OS preference (tests, a settings switch). */
  reducedMotion?: boolean;
  /** Overrides today's moon (0 new … 1), for tests. */
  moonCycle?: number;
};

const InstrumentReveal = ({ onSettled, onDone, reducedMotion, moonCycle }: Props) => {
  const { t } = useTranslation();
  const prefersReduced = usePrefersReducedMotion();
  const reduced = reducedMotion ?? prefersReduced;
  const [step, setStep] = useState<RevealStepId>(firstRevealStep);
  const [fly, setFly] = useState<Fly | null>(null);
  const [moon] = useState(() => moonCycle ?? getVillageSky().cycle);
  const stageEl = useRef<HTMLDivElement | null>(null);
  const buttonEl = useRef<HTMLButtonElement | null>(null);
  const returnTo = useRef<Element | null>(null);
  const settledRef = useRef(false);
  const doneRef = useRef(false);

  const settle = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [onSettled]);
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    settle();
    onDone();
  }, [settle, onDone]);

  // Focus goes to the one button and returns to where it was when the reveal ends.
  useEffect(() => {
    returnTo.current = document.activeElement;
    buttonEl.current?.focus();
    return () => {
      if (returnTo.current instanceof HTMLElement && returnTo.current.isConnected) returnTo.current.focus();
    };
  }, []);

  // The last step: the crystal flies to the corner (measured before it moves), and the reveal counts as seen.
  useLayoutEffect(() => {
    if (step !== "settle") return;
    settle();
    if (!reduced && stageEl.current) setFly(measureFlight(stageEl.current));
  }, [step, reduced, settle]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = revealKeyAction(e.key);
      if (action === "finish") finish();
      else if (action === "hold") {
        e.preventDefault();
        buttonEl.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish]);

  const onContinue = useCallback(() => {
    const next = nextRevealStep(step);
    if (next) setStep(next);
    else finish();
  }, [step, finish]);

  return createPortal(
    <InstrumentRevealView
      step={step}
      reduced={reduced}
      moonCycle={moon}
      t={t as ViewProps["t"]}
      onContinue={onContinue}
      stageRef={(el) => {
        stageEl.current = el;
      }}
      buttonRef={(el) => {
        buttonEl.current = el;
      }}
      fly={fly}
    />,
    document.body,
  );
};

export default InstrumentReveal;
