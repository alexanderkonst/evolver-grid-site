import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { moonPhaseName } from "@/lib/moonPhaseNames";
import { MoonOrb } from "./MoonOrb";

/**
 * Canonical visual for v2 cycle sections (boxes 4-7):
 *
 * Issue #443 (village master style): monochrome. The arc is one stroke in the page's foreground
 * (track at low alpha, fill at full), the orbs are thin-ring discs tinted from the foreground,
 * and the emoji glyphs keep their meaning but render grey (`grayscale`). The prism rainbow of
 * the 2026-05 design wall is retired from this page; `litGradient` stays on the segment data
 * for any consumer that wants it. The notes below describe the layout, which is unchanged.
 *
 *   • Arc — fill % = display-aligned position
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
          className="block w-full h-12 sm:h-14 text-foreground"
          aria-hidden="true"
        >
          {/* Background arc (clear glass track) */}
          <path
            d="M 10 40 Q 100 -10 190 40"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Filled portion — one stroke. dashLength now anchored to
              the current orb's display position (see fillPosition above). */}
          <path
            d="M 10 40 Q 100 -10 190 40"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${dashLength} 100`}
            style={{ transition: "stroke-dasharray 400ms ease-out" }}
          />
        </svg>

        {/* Orbs below arc. Spaced ABOVE the orbs so the arc and orbs read
            as two distinct layers (Sasha 2026-05-19: no overlap). */}
        <div className="mt-1 flex w-full items-end justify-between px-1 sm:px-2">
          {segments.map((seg, i) => {
            const isCurrent = i === currentIndex;
            const isLit = i <= currentIndex;
            const isLandmark = seg.isLandmark;

            // Village register: a thin ring and a foreground tint, no gradient, no glow.
            // current → full ring · lit → soft ring · unlit → faint ring.
            const orbTone = isCurrent
              ? "border-foreground bg-foreground/20"
              : isLit
                ? "border-foreground/40 bg-foreground/10"
                : isLandmark
                  ? "border-foreground/25 bg-foreground/5"
                  : "border-foreground/15 bg-transparent";

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  role="img"
                  aria-label={`${seg.moonPhaseIndex !== undefined ? moonPhaseName(seg.moonPhaseIndex) : seg.label}${isCurrent ? " — current" : ""}`}
                  className={cn(
                    "relative flex items-center justify-center rounded-full border",
                    "overflow-hidden",
                    "transition-colors duration-300",
                    "w-9 h-9 sm:w-11 sm:h-11",
                    orbTone,
                  )}
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
                      // `grayscale`: the glyph keeps its meaning, the colour goes (issue #443).
                      className={cn(
                        "text-sm sm:text-base leading-none select-none grayscale",
                        !isLit && "opacity-50",
                      )}
                    >
                      {seg.icon}
                    </span>
                  )}
                </div>
                {/* Caption under each orb (day-of-week shows "Mon"/"Tue"/... here). */}
                {seg.caption && (
                  <span
                    className={cn(
                      "select-none font-mono text-[10px] font-light uppercase tracking-[0.2em] transition",
                      isCurrent
                        ? "text-foreground"
                        : isLit
                          ? "text-foreground/70"
                          : "text-foreground/40",
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
          <div className="-mt-1 px-3 text-center font-mono text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground">
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
  <div className="rounded-md border border-foreground/15 px-6 py-1.5 text-center text-xs text-muted-foreground">
    {phasePosition && (
      <span className="mr-1.5 font-mono text-[9px] font-light uppercase tracking-[0.2em] text-muted-foreground">
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
    <div className="rounded-md border border-foreground/40 px-5 py-3 text-center text-foreground">
      <div className="flex items-baseline justify-center gap-2">
        {emoji && (
          <span
            role="img"
            aria-label={emojiTooltip ?? emoji}
            title={emojiTooltip}
            className="select-none text-lg leading-none grayscale"
          >
            {emoji}
          </span>
        )}
        <span className="font-serif text-lg font-medium uppercase tracking-[0.14em] sm:text-xl">
          {name}
        </span>
      </div>
      {description && (
        <div className="mt-1 text-sm font-normal text-muted-foreground">
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
