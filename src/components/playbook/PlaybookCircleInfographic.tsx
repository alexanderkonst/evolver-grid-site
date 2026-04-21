import { cn } from "@/lib/utils";
import { PLAYBOOK_STEPS, PlaybookStep } from "@/data/playbookSteps";

/**
 * PlaybookCircleInfographic — the 7-note / 7-color holonic circle.
 *
 * Clean infographic mode: shows the 7-step ring with step numbers and
 * always-visible labels. No lock icons — Open Blueprint Paradox says
 * show everything. Upcoming steps are visible but dimmer; no gating.
 *
 * Implementation notes:
 *   • Pure inline SVG — 0 KB runtime cost, crisp at every viewport.
 *   • Colors per node come from PLAYBOOK_STEPS.neonHsl — one source of truth.
 *   • `prefers-reduced-motion` disables all animations.
 *
 * Layout geometry:
 *   - 480×480 viewBox, center at (240, 240), ring radius = 180, node r = 28
 *   - Node i angle: θ_i = -90° + i·(360°/7) (clockwise from 12 o'clock)
 */

type StepNodeState = "completed" | "active" | "upcoming";

export type PlaybookCircleInfographicProps = {
  /**
   * Highest step number the user is currently on (default 1 — the free gift).
   * Steps < unlockedThroughStep render as `completed`;
   * the step == unlockedThroughStep is `active`;
   * everything beyond is `upcoming` (visible but dimmer — never gated).
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
  return "upcoming";
};

/* ═══════════════════════════════════════════════════════════════════
 * PlaybookCircleInfographic — the main SVG composition.
 * Clean infographic mode: nodes show step numbers/locks and labels.
 * No popover cards — the circle is purely a visual map.
 * ═══════════════════════════════════════════════════════════════════ */
const PlaybookCircleInfographic = ({
  unlockedThroughStep = 1,
  onStepClick: _onStepClick,
  className,
}: PlaybookCircleInfographicProps) => {

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
          const isUpcoming = state === "upcoming";
          return (
            <g
              key={step.slug}
              className="playbook-node-enter"
              style={{
                ["--stagger" as string]: `${i * 120}ms`,
                transformOrigin: `${x}px ${y}px`,
              }}
              opacity={isUpcoming ? 0.55 : 1}
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

              {/* Node body — every step is visible; upcoming = dimmer via group opacity */}
              <circle
                cx={x}
                cy={y}
                r={NODE_RADIUS}
                fill={`url(#node-grad-${step.number})`}
                stroke={step.neonHsl}
                strokeWidth={isActive ? 2 : 1}
                filter="url(#soft-bloom)"
              />

              {/* Step number — always visible. No lock icons (Open Blueprint Paradox). */}
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

              {/* Clean infographic — no popover, just a transparent hit area
                  for accessibility. The circle is a visual map, not a store. */}
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
              opacity={state === "upcoming" ? 0.6 : state === "active" ? 1 : 0.8}
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
