import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYBOOK_STEPS, PlaybookStep } from "@/data/playbookSteps";

/**
 * PlaybookCircleInfographic — the 7-note / 7-color holonic circle.
 *
 * This replaces the Mux HLS video that used to live in PlaybookHero. It's
 * rendered as a single inline SVG so it:
 *   • scales crisp on every viewport via `viewBox`
 *   • ships as ~0KB runtime cost (no hls.js, no video decode, no Mux CDN)
 *   • exposes each step as a real <button> (keyboard + ARIA for free)
 *   • pulls its colors directly from PLAYBOOK_STEPS.neonHsl so one source
 *     of truth drives both the infographic and the step cards
 *   • respects `prefers-reduced-motion` (falls back to a static render)
 *
 * Layout geometry:
 *   - 480×480 viewBox
 *   - Center at (240, 240)
 *   - Ring radius = 180
 *   - 7 nodes at evenly spaced angles, starting at 12 o'clock and
 *     walking clockwise. Each node sits on the ring.
 *
 *   Node i angle:
 *     θ_i = -90° + i·(360°/7)
 *
 *   Node i position:
 *     x_i = 240 + 180·cos(θ_i)
 *     y_i = 240 + 180·sin(θ_i)
 *
 * Progressive unlock:
 *   - step 1 is always unlocked (the free gift)
 *   - steps 2–7 render locked by default
 *   - `unlockedThroughStep` prop lets the parent raise the unlock high-water
 *     mark once user progression is wired in
 */

type StepNodeState = "completed" | "active" | "locked";

export type PlaybookCircleInfographicProps = {
  /**
   * Highest step number the user has unlocked (default 1 — the free gift).
   * Steps ≤ unlockedThroughStep render as `completed` or `active`;
   * the step immediately after is `active`; everything beyond is `locked`.
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

const PlaybookCircleInfographic = ({
  unlockedThroughStep = 1,
  onStepClick,
  className,
}: PlaybookCircleInfographicProps) => {
  const navigate = useNavigate();

  const handleClick = (step: PlaybookStep, state: StepNodeState) => {
    if (state === "locked") return;
    if (onStepClick) onStepClick(step);
    else navigate(`/playbook/${step.slug}`);
  };

  return (
    <figure
      className={cn("relative mx-auto w-full max-w-[480px]", className)}
      aria-label="The seven-step journey — holonic completion circle"
    >
      <svg
        viewBox="0 0 480 480"
        className="w-full h-auto block"
        role="img"
        aria-labelledby="playbook-circle-title playbook-circle-desc"
      >
        <title id="playbook-circle-title">
          Seven-step journey from talent to thriving business
        </title>
        <desc id="playbook-circle-desc">
          A circle with seven luminous nodes, each labeled with one step of the
          playbook. Light travels clockwise through the nodes from the first step
          at the top; completing all seven stabilizes the circle as a whole.
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
        <g className="playbook-center-pulse" style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}>
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

        {/* ═══ NODES — one per step, rendered as foreignObject for true button a11y ═══ */}
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
                // Stagger the mount animation clockwise
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
                fill={isLocked ? "rgba(231,233,229,0.06)" : `url(#node-grad-${step.number})`}
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

              {/* Invisible, keyboard-accessible click target */}
              <foreignObject
                x={x - NODE_RADIUS - 6}
                y={y - NODE_RADIUS - 6}
                width={(NODE_RADIUS + 6) * 2}
                height={(NODE_RADIUS + 6) * 2}
              >
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleClick(step, state)}
                  className={cn(
                    "w-full h-full rounded-full bg-transparent",
                    "focus-visible:ring-2 focus-visible:ring-white/60 outline-none",
                    "transition-transform duration-300",
                    !isLocked && "hover:scale-110 cursor-pointer",
                    isLocked && "cursor-not-allowed",
                  )}
                  aria-label={`Step ${step.number}: ${step.subtitle}${isLocked ? " (locked)" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                />
              </foreignObject>
            </g>
          );
        })}

        {/* ═══ NODE LABELS (appName) ═══ */}
        {PLAYBOOK_STEPS.map((step, i) => {
          const a = angleFor(i);
          // Push the label out past the node
          const labelRadius = RING_RADIUS + NODE_RADIUS + 22;
          const x = CENTER + labelRadius * Math.cos(a);
          const y = CENTER + labelRadius * Math.sin(a);
          const state = stateFor(step.number, unlockedThroughStep);
          return (
            <text
              key={`label-${step.slug}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="'Poppins', system-ui, sans-serif"
              fontSize={10.5}
              letterSpacing="0.28em"
              fontWeight={600}
              fill="rgba(231,233,229,0.85)"
              opacity={state === "locked" ? 0.4 : state === "active" ? 1 : 0.75}
              aria-hidden="true"
            >
              {step.appName}
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
