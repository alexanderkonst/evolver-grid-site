import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYBOOK_STEPS, PlaybookStep } from "@/data/playbookSteps";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

/**
 * PlaybookCircleInfographic — the 7-note / 7-color holonic circle that also
 * acts as the store.
 *
 * Click any node → a glass popover opens showing: step name, result promise,
 * price, and what's included. A primary CTA routes to the step page
 * (unlocked) or shows the gating requirement (locked). Progressive unlock:
 * step 1 is always open; steps 2–7 stay locked until the parent raises
 * `unlockedThroughStep`, but locked nodes are still clickable so the user
 * can peek at pricing and inclusions before completing earlier steps.
 *
 * Implementation notes:
 *   • Pure inline SVG — 0 KB runtime cost, crisp at every viewport.
 *   • Each node wraps a real <button> inside <foreignObject>, so keyboard
 *     navigation and screen readers get real semantics for free.
 *   • Radix Popover anchors to the HTML button inside foreignObject — the
 *     popper measures bounding rects via the DOM, which works transparently
 *     through the SVG → foreignObject boundary.
 *   • Colors per node come from PLAYBOOK_STEPS.neonHsl — one source of truth.
 *   • `prefers-reduced-motion` disables all animations.
 *
 * Layout geometry:
 *   - 480×480 viewBox, center at (240, 240), ring radius = 180, node r = 28
 *   - Node i angle: θ_i = -90° + i·(360°/7) (clockwise from 12 o'clock)
 */

type StepNodeState = "completed" | "active" | "locked";

export type PlaybookCircleInfographicProps = {
  /**
   * Highest step number the user has unlocked (default 1 — the free gift).
   * Steps < unlockedThroughStep render as `completed`;
   * the step == unlockedThroughStep is `active`;
   * everything beyond is `locked`.
   */
  unlockedThroughStep?: number;
  /** Optional callback when a node is clicked; defaults to route push. */
  onStepClick?: (step: PlaybookStep) => void;
  className?: string;
};

const CENTER = 240;
const RING_RADIUS = 180;
const NODE_RADIUS = 28;
const TOTAL = PLAYBOOK_STEPS.length; // 7

const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / TOTAL;
const nodeXY = (i: number) => {
  const a = angleFor(i);
  return { x: CENTER + RING_RADIUS * Math.cos(a), y: CENTER + RING_RADIUS * Math.sin(a) };
};

const stateFor = (stepNumber: number, unlockedThrough: number): StepNodeState => {
  if (stepNumber < unlockedThrough) return "completed";
  if (stepNumber === unlockedThrough) return "active";
  return "locked";
};

/* ═══════════════════════════════════════════════════════════════════
 * StepPreviewCard — the popover body.
 * Shown when a user clicks any node. Layout matches the liquid-glass
 * blueprint: ~16px padding, Cormorant serif title, tight tracked eyebrow,
 * and a primary CTA that varies by unlock state.
 * ═══════════════════════════════════════════════════════════════════ */
type StepPreviewCardProps = {
  step: PlaybookStep;
  state: StepNodeState;
  unlockedThroughStep: number;
  onOpenStep: (step: PlaybookStep) => void;
};

const StepPreviewCard = ({
  step,
  state,
  unlockedThroughStep,
  onOpenStep,
}: StepPreviewCardProps) => {
  const isLocked = state === "locked";
  const priceLabel = step.price ?? "Pricing coming soon";
  const included =
    step.included && step.included.length > 0
      ? step.included
      : ["Full step walkthrough", "Three substeps, each with one proven strategy"];

  return (
    <div className="flex flex-col gap-4">
      {/* ═══ Header: eyebrow + subtitle + price ═══ */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: step.neonHsl }}
          >
            Step {step.number} · {step.appName}
            {step.bundleWith?.length ? (
              <span className="opacity-70">
                {" · Bundled with Step "}
                {step.bundleWith.join(", ")}
              </span>
            ) : null}
          </span>
          <h4
            className="text-lg leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "rgba(231,233,229,0.98)",
            }}
          >
            {step.subtitle}
          </h4>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{
            color: step.price ? step.neonHsl : "rgba(231,233,229,0.55)",
            border: `1px solid ${step.price ? step.neonHsl : "rgba(231,233,229,0.18)"}`,
            background: step.price
              ? `hsla(${step.neonHsl.slice(4, -1)}, 0.1)`
              : "rgba(231,233,229,0.04)",
          }}
        >
          {priceLabel}
        </span>
      </div>

      {/* ═══ Result promise ═══ */}
      <p
        className="text-[13px] italic leading-snug"
        style={{ color: "rgba(231,233,229,0.72)" }}
      >
        &ldquo;{step.transformationalResult}&rdquo;
      </p>

      {/* ═══ Here's what you get (renamed from "What's included" —
           Sasha 2026-04-17, "Вот" prefix) ═══ */}
      <div className="flex flex-col gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.22em]"
          style={{ color: "rgba(231,233,229,0.45)" }}
        >
          Here's what you get
        </span>
        <ul className="flex flex-col gap-1.5">
          {included.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-[12px] leading-snug"
              style={{ color: "rgba(231,233,229,0.82)" }}
            >
              <Check
                className="mt-[3px] h-3 w-3 shrink-0"
                style={{ color: step.neonHsl }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ═══ Primary CTA ═══ */}
      {isLocked ? (
        <button
          type="button"
          disabled
          className={cn(
            "w-full rounded-full px-4 py-2.5",
            "text-[11px] font-semibold uppercase tracking-[0.18em]",
            "cursor-not-allowed opacity-70",
          )}
          style={{
            color: "rgba(231,233,229,0.55)",
            border: "1px solid rgba(231,233,229,0.14)",
            background: "rgba(231,233,229,0.04)",
          }}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Lock className="h-3 w-3" />
            {unlockedThroughStep === 0
              ? "Start with step 1"
              : `Complete step ${unlockedThroughStep} first`}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpenStep(step)}
          className={cn(
            "group w-full rounded-full px-4 py-2.5",
            "text-[11px] font-semibold uppercase tracking-[0.18em] leading-snug",
            "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            color: "rgba(231,233,229,0.98)",
            backgroundImage:
              "linear-gradient(135deg, rgba(132,96,234,0.85), rgba(41,84,159,0.85))",
            border: "1px solid rgba(231,233,229,0.3)",
            boxShadow: "0 12px 36px -12px rgba(132,96,234,0.5)",
          }}
        >
          <span className="inline-flex items-center justify-center gap-2 text-center">
            {step.ctaText ?? "Open this step"}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 shrink-0"
              aria-hidden="true"
            />
          </span>
        </button>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
 * PlaybookCircleInfographic — the main SVG composition.
 * ═══════════════════════════════════════════════════════════════════ */
const PlaybookCircleInfographic = ({
  unlockedThroughStep = 1,
  onStepClick,
  className,
}: PlaybookCircleInfographicProps) => {
  const navigate = useNavigate();

  const openStep = (step: PlaybookStep) => {
    if (onStepClick) onStepClick(step);
    else navigate(`/playbook/${step.slug}`);
  };

  return (
    <figure
      className={cn("relative mx-auto w-full max-w-[640px]", className)}
      aria-label="The seven-step journey — holonic completion circle"
    >
      <svg
        // viewBox is expanded horizontally (~-80 → 560) and vertically
        // (~-30 → 510) beyond the 480×480 ring so multi-line step labels
        // sitting outside the ring have breathing room. Center stays at
        // (240, 240) — only the canvas around it grows.
        viewBox="-80 -30 640 540"
        className="w-full h-auto block"
        role="img"
        aria-labelledby="playbook-circle-title playbook-circle-desc"
      >
        <title id="playbook-circle-title">
          Seven-step journey from talent to thriving business
        </title>
        <desc id="playbook-circle-desc">
          A circle with seven luminous nodes, each labeled with one step of the
          playbook. Click a node to see the step's price, inclusions, and
          result. Light travels clockwise from the first step at the top;
          completing all seven stabilizes the circle as a whole.
        </desc>

        {/* ═══ DEFS — gradients, glow filter, drawing primitives ═══ */}
        <defs>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(132,96,234,0.55)" />
            <stop offset="55%" stopColor="rgba(41,84,159,0.22)" />
            <stop offset="100%" stopColor="rgba(10,22,40,0)" />
          </radialGradient>

          <linearGradient id="ring-arc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(132,96,234,0.6)" />
            <stop offset="50%" stopColor="rgba(164,163,208,0.35)" />
            <stop offset="100%" stopColor="rgba(41,84,159,0.55)" />
          </linearGradient>

          <filter id="soft-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {PLAYBOOK_STEPS.map((step) => (
            <radialGradient
              key={`node-grad-${step.number}`}
              id={`node-grad-${step.number}`}
              cx="30%"
              cy="30%"
              r="70%"
            >
              <stop offset="0%" stopColor={step.neonHsl} stopOpacity="0.95" />
              <stop offset="70%" stopColor={step.neonHsl} stopOpacity="0.55" />
              <stop offset="100%" stopColor={step.neonHsl} stopOpacity="0.15" />
            </radialGradient>
          ))}
        </defs>

        {/* ═══ CENTER ATMOSPHERIC GLOW ═══ */}
        <circle cx={CENTER} cy={CENTER} r={RING_RADIUS + 60} fill="url(#center-glow)" />

        {/* ═══ RING BACKDROP ═══ */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(231,233,229,0.08)"
          strokeWidth={1}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke="url(#ring-arc)"
          strokeWidth={1.5}
          strokeDasharray="2 6"
          className="playbook-ring-rotate"
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />

        {/* ═══ 7 SEGMENT ARCS (connectors, tinted per step) ═══ */}
        {PLAYBOOK_STEPS.map((step, i) => {
          const next = (i + 1) % TOTAL;
          const a1 = angleFor(i);
          const a2 = angleFor(next);
          const x1 = CENTER + RING_RADIUS * Math.cos(a1);
          const y1 = CENTER + RING_RADIUS * Math.sin(a1);
          const x2 = CENTER + RING_RADIUS * Math.cos(a2);
          const y2 = CENTER + RING_RADIUS * Math.sin(a2);
          return (
            <path
              key={`arc-${step.number}`}
              d={`M ${x1} ${y1} A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={step.neonHsl}
              strokeWidth={2}
              strokeOpacity={0.35}
              strokeLinecap="round"
            />
          );
        })}

        {/* ═══ CENTER FLOW MARK (dragonfly stand-in: three nested rings) ═══ */}
        <g
          className="playbook-center-pulse"
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={28}
            fill="none"
            stroke="rgba(164,163,208,0.35)"
            strokeWidth={1}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={16}
            fill="none"
            stroke="rgba(132,96,234,0.55)"
            strokeWidth={1.25}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={6}
            fill="rgba(231,233,229,0.85)"
            filter="url(#soft-bloom)"
          />
        </g>

        {/* ═══ NODES — one per step. Each wraps a Popover for price/inclusions ═══ */}
        {PLAYBOOK_STEPS.map((step, i) => {
          const { x, y } = nodeXY(i);
          const state = stateFor(step.number, unlockedThroughStep);
          const isActive = state === "active";
          const isLocked = state === "locked";
          return (
            <g
              key={step.slug}
              className="playbook-node-enter"
              style={{
                ["--stagger" as string]: `${i * 120}ms`,
                transformOrigin: `${x}px ${y}px`,
              }}
            >
              {/* Halo (only for active node) */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_RADIUS + 10}
                  fill="none"
                  stroke={step.neonHsl}
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  className="playbook-node-halo"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}

              {/* Node body */}
              <circle
                cx={x}
                cy={y}
                r={NODE_RADIUS}
                fill={
                  isLocked ? "rgba(231,233,229,0.06)" : `url(#node-grad-${step.number})`
                }
                stroke={isLocked ? "rgba(231,233,229,0.2)" : step.neonHsl}
                strokeWidth={isActive ? 2 : 1}
                filter={isLocked ? undefined : "url(#soft-bloom)"}
              />

              {/* Step number / lock icon */}
              {isLocked ? (
                <g transform={`translate(${x - 8}, ${y - 8})`}>
                  <foreignObject width={16} height={16} aria-hidden="true">
                    <Lock
                      // @ts-expect-error — lucide-react supports className fine inside foreignObject
                      className="w-4 h-4"
                      color="rgba(231,233,229,0.5)"
                    />
                  </foreignObject>
                </g>
              ) : (
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontFamily="'Cormorant Garamond', serif"
                  fontSize={20}
                  fontWeight={600}
                  fill="rgba(231,233,229,0.98)"
                >
                  {step.number}
                </text>
              )}

              {/* Keyboard-accessible click target wrapped in a Popover trigger.
                  All nodes are clickable — locked ones open the popover so the
                  user can peek at price/inclusions before completing prior steps. */}
              <foreignObject
                x={x - NODE_RADIUS - 6}
                y={y - NODE_RADIUS - 6}
                width={(NODE_RADIUS + 6) * 2}
                height={(NODE_RADIUS + 6) * 2}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full h-full rounded-full bg-transparent",
                        "focus-visible:ring-2 focus-visible:ring-white/60 outline-none",
                        "transition-transform duration-300 cursor-pointer",
                        !isLocked && "hover:scale-110",
                        isLocked && "hover:scale-105",
                      )}
                      aria-label={`Step ${step.number}: ${step.subtitle}${
                        isLocked ? " (locked — click to see price and inclusions)" : ""
                      }`}
                      aria-current={isActive ? "step" : undefined}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    align="center"
                    sideOffset={16}
                    className={cn(
                      "w-80 border-0 p-5",
                      "shadow-[0_32px_80px_-24px_rgba(0,0,0,0.65)]",
                    )}
                    style={{
                      // Liquid-glass override — sidesteps shadcn's --popover
                      // variable, which can get overridden inside GameShell.
                      background: "rgba(10, 22, 40, 0.82)",
                      backdropFilter: "blur(50px) saturate(160%)",
                      WebkitBackdropFilter: "blur(50px) saturate(160%)",
                      border: "1px solid rgba(231,233,229,0.12)",
                      color: "rgba(231,233,229,0.98)",
                    }}
                  >
                    <StepPreviewCard
                      step={step}
                      state={state}
                      unlockedThroughStep={unlockedThroughStep}
                      onOpenStep={openStep}
                    />
                  </PopoverContent>
                </Popover>
              </foreignObject>
            </g>
          );
        })}

        {/* ═══ NODE LABELS (always visible — multi-line, canonical titles) ═══
            Rendered OUTSIDE the ring, placed radially by each node's angle.
            - `labelLines` (preferred) is a pre-split 2-line version of the
              subtitle, authored in playbookSteps.ts to avoid naive word wrap.
            - textAnchor:    start | end | middle   (horizontal side of ring)
            - dominantBaseline: hanging | auto | middle (vertical side)
            Anchoring keeps each label's INNER edge at the same distance
            from the ring regardless of how many words it has.            */}
        {PLAYBOOK_STEPS.map((step, i) => {
          const a = angleFor(i);
          const cosA = Math.cos(a);
          const sinA = Math.sin(a);
          // Outer label radius — past the node's outer edge + breathing room
          const labelRadius = RING_RADIUS + NODE_RADIUS + 18;
          const x = CENTER + labelRadius * cosA;
          const y = CENTER + labelRadius * sinA;
          const state = stateFor(step.number, unlockedThroughStep);
          const lines = step.labelLines ?? [step.appName];

          // Side of ring → anchor. Narrow band at top/bottom (|cosA| < 0.22)
          // gets center-anchored so labels stay legible at 12 / 6 o'clock.
          const textAnchor: "start" | "middle" | "end" =
            Math.abs(cosA) < 0.22 ? "middle" : cosA > 0 ? "start" : "end";
          // Vertical anchor — above ring → baseline ends at point (auto);
          // below ring → baseline hangs; near horizontal → middle.
          const dominantBaseline: "hanging" | "middle" | "auto" =
            Math.abs(sinA) < 0.22 ? "middle" : sinA > 0 ? "hanging" : "auto";

          const lineHeight = 13; // px at 11px font — tight but legible

          return (
            <text
              key={`label-${step.slug}`}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline={dominantBaseline}
              fontFamily="'Poppins', system-ui, sans-serif"
              fontSize={11}
              letterSpacing="0.08em"
              fontWeight={state === "active" ? 700 : 600}
              fill="rgba(231,233,229,0.92)"
              opacity={state === "locked" ? 0.45 : state === "active" ? 1 : 0.8}
              aria-hidden="true"
              style={{
                textShadow:
                  "0 1px 6px rgba(10,22,40,0.9), 0 0 2px rgba(10,22,40,0.7)",
              }}
            >
              {lines.map((line, idx) => (
                <tspan
                  key={idx}
                  x={x}
                  // First line sits on the anchor; subsequent lines push down
                  // by one lineHeight. When anchored to `auto` (above ring)
                  // we lift the stack so the LAST line lands on the anchor.
                  dy={
                    idx === 0
                      ? dominantBaseline === "auto"
                        ? -(lines.length - 1) * lineHeight
                        : 0
                      : lineHeight
                  }
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      {/* ═══ COMPONENT-LOCAL ANIMATION CSS ═══ */}
      <style>{`
        /* Clockwise ring shimmer — 40s full rotation */
        .playbook-ring-rotate {
          animation: pb-ring-spin 40s linear infinite;
        }
        @keyframes pb-ring-spin {
          to { transform: rotate(360deg); }
        }

        /* Center gentle pulse */
        .playbook-center-pulse {
          animation: pb-pulse 4s ease-in-out infinite;
        }
        @keyframes pb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.06); opacity: 1; }
        }

        /* Active halo breath */
        .playbook-node-halo {
          animation: pb-halo 2.6s ease-in-out infinite;
        }
        @keyframes pb-halo {
          0%, 100% { transform: scale(1);    opacity: 0.55; }
          50%      { transform: scale(1.14); opacity: 0.85; }
        }

        /* Staggered clockwise mount */
        .playbook-node-enter {
          animation: pb-node-in 700ms cubic-bezier(.22,1,.36,1) both;
          animation-delay: var(--stagger, 0ms);
        }
        @keyframes pb-node-in {
          0%   { transform: scale(0.2); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }

        /* Accessibility: respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .playbook-ring-rotate,
          .playbook-center-pulse,
          .playbook-node-halo,
          .playbook-node-enter {
            animation: none !important;
          }
          .playbook-node-enter { opacity: 1; transform: none; }
        }
      `}</style>
    </figure>
  );
};

export default PlaybookCircleInfographic;
