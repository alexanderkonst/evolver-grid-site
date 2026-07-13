import { memo, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MoonOrb } from "./MoonOrb";

/**
 * Canonical visual for v2 cycle sections (boxes 4-7):
 *   • Rainbow arc (red→violet) — fill % = display-aligned position
 *   • Row of orbs underneath (variable count: 8 lunar / 7 week / 12 zodiac / 8 solar)
 *   • Current orb glows in its own identity color (NOT arc-position color)
 *   • Three-pill stack below: prev / current / next, current elevated and rainbow-glowed
 *
 * Sasha 2026-05-19 — major refactor against the design wall:
 *   1. **Progress bar fill is DISPLAY-aligned** (not raw cycle progress).
 *      The fill reaches the center of the current orb, so users read
 *      "how many phases have been activated" by glance. For cycles like
 *      lunar that rotate the display order vs. astronomical order, the
 *      fill matches the visual orb sequence, not the underlying math.
 *   2. **Active pill carries the FULL active state**: emoji + phase name
 *      + description, in one place. The separate "glanceable guidance"
 *      line below the pill stack is retired — repetition with the pill
 *      created cognitive friction (Sasha: "decide one home for the
 *      content").
 *   3. **Phase NAME is visually distinct from description**: bold serif
 *      for the name; lighter weight for the description; `·` between
 *      them. So "Gathering" reads as the identity, the verb list reads
 *      as the unpack.
 *   4. **Prev / next pills dimmer + further back**: lighter text + lower
 *      opacity so the active pill dominates the read.
 *   5. **Orbs no longer overlap the arc**: vertical spacing bumped so
 *      the arc lives above the orbs cleanly.
 *
 * See docs/specs/equilibrium/equilibrium_v2_spec.md §3.1.
 */

export interface CycleSegmentSpec {
  /** Emoji or symbol rendered inside the orb (fallback when no custom renderer). */
  icon: string;
  /** Hex color used for the orb's glow when current (fallback when no gradient). */
  identityColor: string;
  /** Accessible label for the orb (announced + tooltip). */
  label: string;
  /**
   * Optional per-position liquid-glass gradient (Sasha 2026-05-18 brief).
   * When provided, the orb's liquid-glass backdrop is painted with this
   * gradient instead of the flat identityColor. Lit-up orbs (this and
   * all prior in display order) render full saturation; orbs AFTER
   * `currentIndex` render in grayscale (the cycle hasn't reached them
   * yet). Glow stays contained inside the orb — no bloom.
   *
   * Lunar palette progresses through the natural prism-refraction
   * sequence: ruby → red → orange → yellow → green → blue → purple →
   * pink, closing the loop back to ruby.
   */
  litGradient?: { from: string; to: string };
  /**
   * For lunar: astronomical phase index (0-7) so the orb renders the
   * REAL photographic moon with phase-correct illumination via
   * `<MoonOrb>`. When undefined, the orb falls back to the emoji glyph
   * stored in `icon` (used by zodiac, day-of-week, etc.).
   */
  moonPhaseIndex?: number;
  /**
   * Optional — when true, the orb remains subtly lit even when not current
   * (used for cycle landmarks like Full Moon).
   */
  isLandmark?: boolean;
  /**
   * Optional caption rendered under each orb. Used for day-of-week to
   * show "Mon", "Tue", ... so the planet emoji isn't asked to do the
   * whole job (Sasha 2026-05-19: "show the day name — even with planet
   * emojis, the name is needed for grok-ability").
   */
  caption?: string;
}

export interface CycleEnergyBarProps {
  segments: CycleSegmentSpec[];
  /** Zero-based index of the segment currently active (display order). */
  currentIndex: number;
  /**
   * Progress through the full cycle, 0–1. Used only as a fallback for
   * sub-phase progress; the bar fill itself is now ANCHORED to the
   * current orb's display position (Sasha 2026-05-19: "lunar progress
   * bar must correspond to how many phases have been activated").
   */
  progress: number;
  /** Pill labels — `current` is elevated and glowed. */
  prevLabel: string;
  currentLabel: string;
  nextLabel: string;
  /**
   * Optional emoji rendered INSIDE the active pill, preceding the title
   * (Sasha 2026-05-19: element emoji belongs IN the middle pill so it
   * reads with the active state, not as a detached eyebrow).
   */
  activePillEmoji?: string;
  /** Optional tooltip on the active-pill emoji. */
  activePillEmojiTooltip?: string;
  /**
   * Optional small line directly UNDER the active pill, e.g.
   * "ends Tue May 19 · 2.3 days remaining". Turns a vibe into a window.
   */
  activePillSubLabel?: string;
  /** Override container className. */
  className?: string;
}

const CycleEnergyBarBase = ({
  segments,
  currentIndex,
  progress,
  prevLabel,
  currentLabel,
  nextLabel,
  activePillEmoji,
  activePillEmojiTooltip,
  activePillSubLabel,
  className,
}: CycleEnergyBarProps) => {
  const gradId = `eq-arc-grad-${useId().replace(/:/g, "")}`;

  // Sasha 2026-05-19: bar fill is ANCHORED to the current orb's
  // display-order position, not raw cycle progress. Reading it: "how
  // many phases have been activated" — N orbs lit = fill reaches the
  // Nth orb's center. Phases are unevenly weighted in real time (e.g.
  // New Moon is short, Waning Crescent is long), so trying to interpolate
  // sub-phase progress through `progress` desyncs the bar from the orbs.
  // Anchoring to orb-center keeps the visual gestalt honest: orbs ARE
  // the units of progress, the bar simply shows how many you've crossed.
  const segmentCount = Math.max(1, segments.length);
  const safeIndex = Math.max(0, Math.min(segmentCount - 1, currentIndex));
  const fillPosition = (safeIndex + 0.5) / segmentCount;
  const dashLength = fillPosition * 100;
  // `progress` retained for future use (transitional sub-phase pulse);
  // suppress unused-var warning.
  void progress;

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      {/* Arc on top — extra bottom padding (mb-3) so orbs sit clean below
          the arc with no overlap (Sasha 2026-05-19: "zodiac bar overlaps
          with blobs"). */}
      <div className="relative w-full max-w-md mb-2">
        <svg
          viewBox="0 0 200 50"
          preserveAspectRatio="none"
          className="block w-full h-12 sm:h-14"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2="200"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="14%" stopColor="#f59e0b" />
              <stop offset="28%" stopColor="#facc15" />
              <stop offset="42%" stopColor="#84cc16" />
              <stop offset="57%" stopColor="#22d3ee" />
              <stop offset="71%" stopColor="#3b82f6" />
              <stop offset="85%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>

          {/* Background arc (clear glass track) */}
          <path
            d="M 10 40 Q 100 -10 190 40"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Filled portion — rainbow gradient. dashLength now anchored to
              the current orb's display position (see fillPosition above). */}
          <path
            d="M 10 40 Q 100 -10 190 40"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${dashLength} 100`}
            style={{
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))",
              transition: "stroke-dasharray 400ms ease-out",
            }}
          />
        </svg>

        {/* Orbs below arc. Spaced ABOVE the orbs so the arc and orbs read
            as two distinct layers (Sasha 2026-05-19: no overlap). */}
        <div className="mt-1 flex w-full items-end justify-between px-1 sm:px-2">
          {segments.map((seg, i) => {
            const isCurrent = i === currentIndex;
            const isLit = i <= currentIndex;
            const isLandmark = seg.isLandmark;

            // Liquid-glass background:
            // • lit + has gradient  → render the gradient
            // • lit, no gradient    → glassy white (legacy look)
            // • unlit (after cur)   → cool gray (cycle not reached)
            const background = !isLit
              ? "linear-gradient(135deg, rgba(180,184,196,0.45), rgba(160,165,180,0.55))"
              : seg.litGradient
                ? `linear-gradient(135deg, ${seg.litGradient.from}, ${seg.litGradient.to})`
                : isCurrent
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.65)";

            const boxShadow = isCurrent
              ? [
                  "inset 0 0 14px 2px rgba(255,255,255,0.55)",
                  "inset 0 1px 0 0 rgba(255,255,255,0.9)",
                  "0 0 0 2px rgba(255,255,255,0.85)",
                  "0 4px 14px rgba(0,0,0,0.10)",
                ].join(", ")
              : isLit
                ? [
                    "inset 0 0 8px 1px rgba(255,255,255,0.35)",
                    "inset 0 1px 0 0 rgba(255,255,255,0.7)",
                    "0 2px 6px rgba(0,0,0,0.06)",
                  ].join(", ")
                : isLandmark
                  ? "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.04)"
                  : "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 1px 3px rgba(0,0,0,0.04)";

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  role="img"
                  aria-label={`${seg.label}${isCurrent ? " — current" : ""}`}
                  className={cn(
                    "relative flex items-center justify-center rounded-full",
                    "overflow-hidden",  // glow contained
                    "transition-all duration-300",
                    "w-9 h-9 sm:w-11 sm:h-11",
                  )}
                  style={{
                    background,
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow,
                  }}
                >
                  {seg.moonPhaseIndex !== undefined ? (
                    // Real photographic moon with phase-correct illumination
                    // (Sasha 2026-05-18 brief — replaces the emoji glyph).
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        !isLit && "opacity-50",
                      )}
                    >
                      <MoonOrb phaseIndex={seg.moonPhaseIndex} size={36} />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "text-sm sm:text-base leading-none select-none",
                        !isLit && "opacity-60",
                      )}
                      style={{
                        textShadow: isLit
                          ? "0 0 6px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.15)"
                          : "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      {seg.icon}
                    </span>
                  )}
                </div>
                {/* Caption under each orb (day-of-week shows "Mon"/"Tue"/... here). */}
                {seg.caption && (
                  <span
                    className={cn(
                      "eq-text-halo select-none text-[10px] font-semibold uppercase tracking-wider transition",
                      isCurrent
                        ? "text-[#0a1628]"
                        : isLit
                          ? "text-[#0a1628]/70"
                          : "text-[#0a1628]/40",
                    )}
                  >
                    {seg.caption}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pill stack: prev (dim) / active (loud) / next (dim).
          Sasha 2026-05-19: prev/next pulled WAY back so the active pill
          owns the visual hierarchy. Active pill carries emoji + name +
          description in one place (no separate guidance line beneath). */}
      <div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-2">
        <DimPill phasePosition="PREVIOUS">{prevLabel}</DimPill>
        <ActivePill
          emoji={activePillEmoji}
          emojiTooltip={activePillEmojiTooltip}
        >
          {currentLabel}
        </ActivePill>

        {/* Time-to-next-phase sub-label (sits flush under active pill) */}
        {activePillSubLabel && (
          <div className="-mt-1 px-3 text-center text-[11px] font-medium uppercase tracking-wider text-[#0a1628]/75 eq-text-halo">
            {activePillSubLabel}
          </div>
        )}

        <DimPill phasePosition="UPCOMING">{nextLabel}</DimPill>
      </div>
    </div>
  );
};

/**
 * Dimmer prev/next pill (Sasha 2026-05-19: "make prev/next text more
 * opaque so the middle stands out"). Background quieter, text quieter,
 * border lighter — they recede into the visual background.
 */
const DimPill = ({
  children,
  phasePosition,
}: {
  children: ReactNode;
  phasePosition?: "PREVIOUS" | "UPCOMING";
}) => (
  <div
    className="eq-text-halo rounded-full px-6 py-1.5 text-center text-xs font-medium text-[#0a1628]/55"
    style={{
      background: "rgba(255,255,255,0.30)",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255,255,255,0.30)",
    }}
  >
    {phasePosition && (
      <span className="mr-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a1628]/55">
        {phasePosition}:
      </span>
    )}
    {children}
  </div>
);

/**
 * Active pill — the loud one. Carries the FULL current state in one
 * place: optional element emoji, phase NAME (bold), description (lighter).
 *
 * Sasha 2026-05-19 voice rules:
 *   • Format: `[emoji] NAME · description`
 *   • NAME bold serif larger; description smaller + softer
 *   • Splits on the FIRST " · " when the children is a string (lunar
 *     case). When no separator, the whole label renders as the title
 *     (zodiac/day-of-week case where labels are 2-word energies like
 *     "Curiosity & Connection").
 */
const ActivePill = ({
  children,
  emoji,
  emojiTooltip,
}: {
  children: ReactNode;
  emoji?: string;
  emojiTooltip?: string;
}) => {
  // Split label into name + description when a " · " separator exists.
  let name: ReactNode = children;
  let description: ReactNode = null;
  if (typeof children === "string" && children.includes(" · ")) {
    const idx = children.indexOf(" · ");
    name = children.slice(0, idx);
    description = children.slice(idx + 3);
  }

  return (
    <div
      className="eq-text-halo rounded-2xl px-5 py-3 text-center text-[#0a1628]"
      style={{
        background:
          "linear-gradient(135deg, rgba(252,231,197,0.94) 0%, rgba(212,212,255,0.94) 50%, rgba(224,197,252,0.94) 100%)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow:
          "0 0 24px rgba(212,180,255,0.50), inset 0 1px 0 0 rgba(255,255,255,0.90), 0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-baseline justify-center gap-2">
        {emoji && (
          <span
            role="img"
            aria-label={emojiTooltip ?? emoji}
            title={emojiTooltip}
            className="select-none text-lg leading-none"
          >
            {emoji}
          </span>
        )}
        <span className="font-serif text-lg font-semibold sm:text-xl">
          {name}
        </span>
      </div>
      {description && (
        <div className="mt-1 text-sm font-normal text-[#0a1628]/80">
          {description}
        </div>
      )}
    </div>
  );
};

/**
 * Memoized export — only re-renders when its primitive props change.
 * Segments are module-level constants (LUNAR_SEGMENTS, ZODIAC_SEGMENTS,
 * etc.) so their array reference is stable. Sasha 2026-05-19
 * responsiveness pass: prevents cycle-tick state changes from
 * re-rendering bars whose cycle didn't actually advance.
 */
export const CycleEnergyBar = memo(CycleEnergyBarBase);

export default CycleEnergyBar;
