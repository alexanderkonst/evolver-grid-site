import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaybookStep, Substep } from "@/data/playbookSteps";
// useStepCheckout was used by the per-step CTA block that was removed
// 2026-04-21. The commercial flow now lives at /path + /game/settings.

/**
 * StepCard — renders one of the 7 playbook steps.
 *
 * Disclosure hierarchy (per Sasha's 2026-04-16 sketch):
 *
 *   ┌─ STEP HEADER ───────────────────────────────────┐
 *   │ Step N of 7 · APPNAME                           │
 *   │ {subtitle}                                      │
 *   │                                                 │
 *   │   [ See how ▼ ]       ← step-level disclosure   │
 *   │                                                 │
 *   │   ↓ (when open) ↓                               │
 *   │                                                 │
 *   │   1 · {substep.name}                            │
 *   │       {substep.description}                     │
 *   │       [ See one proven strategy ▶ ]             │
 *   │       ↓ (when open)                             │
 *   │       ONE PROVEN STRATEGY                       │
 *   │       {substep.oneProvenStrategy}               │
 *   │                                                 │
 *   │   2 · ...                                       │
 *   │   3 · ...                                       │
 *   │                                                 │
 *   │ Transformational result · phase shift           │
 *   │ ["{step.transformationalResult}"]               │
 *   └─────────────────────────────────────────────────┘
 *
 * URL hash deep-linking (shareable links):
 *   /playbook/discover                 → all collapsed
 *   /playbook/discover#how             → "See how" open, substeps collapsed
 *   /playbook/discover#how-2           → "See how" open, substep 2 strategy open
 *
 * Opening any substep's strategy auto-opens "See how" so the deep link lands
 * on visible content.
 */

export type StepCardProps = {
  step: PlaybookStep;
};

/** Triangle button adornment with soft radial glow per step color. */
const Triangle = ({
  open,
  neonHsl,
  neonRgb,
}: {
  open: boolean;
  neonHsl: string;
  neonRgb: string;
}) => (
  <span
    aria-hidden="true"
    className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300"
    style={{
      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(${neonRgb},0.45), rgba(${neonRgb},0.08))`,
      boxShadow: open
        ? `0 0 14px -2px ${neonHsl}, 0 0 26px -6px rgba(${neonRgb},0.5)`
        : `0 0 6px -2px rgba(${neonRgb},0.4)`,
    }}
  >
    <ChevronRight
      className={cn(
        "w-3 h-3 transition-transform duration-300",
        open && "rotate-90",
      )}
      // Day 47 iter 6 (Sasha): darken the chevron to readable saturation.
      // Raw neonHsl is 68-72% lightness — too pale on light Panel 3.
      style={{ color: `color-mix(in srgb, ${neonHsl} 45%, #0a1628 55%)` }}
    />
  </span>
);

/** Substep row — number + name + description always visible (once "See how" is
 *  open). The "See one proven strategy" button reveals the short paragraph. */
const SubstepRow = ({
  substep,
  neonHsl,
  neonRgb,
  open,
  onToggle,
}: {
  substep: Substep;
  neonHsl: string;
  neonRgb: string;
  open: boolean;
  onToggle: () => void;
}) => {
  return (
    // Consistent vertical rhythm — every substep block gets the same
    // top/bottom breathing regardless of whether it has a description
    // (Sasha, 2026-04-21).
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.28), rgba(${neonRgb},0.08))`,
            border: `1px solid rgba(${neonRgb},0.5)`,
            // Day 47 iter 6 (Sasha): darken the substep number to readable
            // saturation (was raw pale neonHsl, ~68-72% lightness).
            color: `color-mix(in srgb, ${neonHsl} 45%, #0a1628 55%)`,
            boxShadow: `0 0 10px -4px rgba(${neonRgb},0.5)`,
          }}
        >
          {substep.number}
        </div>
        <div className="flex-1 pt-1 space-y-3">
          {/* ══ Substep name — dark navy, light halo for Panel 3 */}
          <h3
            className="text-base sm:text-lg font-semibold leading-snug"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#0a1628",
              textShadow: "0 1px 2px rgba(255,255,255,0.6)",
            }}
          >
            {substep.name}
          </h3>

          {/* ══ Description — only rendered if present */}
          {substep.description && (
            <p
              className="text-sm sm:text-[15px] leading-relaxed"
              style={{ color: "rgba(26,30,58,0.78)" }}
            >
              {substep.description}
            </p>
          )}

          {/* ══ Recommended How-To button — Day 47 iter 6 (Sasha): centered */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "inline-flex items-center gap-2 py-2 px-4 rounded-full",
                "text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold",
                "transition-all duration-300 hover:scale-[1.02]",
                "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
              )}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.22), rgba(${neonRgb},0.08))`,
                border: `1px solid rgba(${neonRgb},0.45)`,
                // Day 47 iter 6: darken label for readability on light Panel 3.
                color: `color-mix(in srgb, ${neonHsl} 45%, #0a1628 55%)`,
                boxShadow: open ? `0 0 18px -4px ${neonHsl}` : "none",
              }}
              aria-expanded={open}
            >
              <Triangle open={open} neonHsl={neonHsl} neonRgb={neonRgb} />
              <span>Recommended How-To</span>
            </button>
          </div>

          {/* ══ One Proven Strategy reveal — centered */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-500 ease-out",
              open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div
              className="rounded-2xl p-4 sm:p-5 mx-auto max-w-2xl"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.1), rgba(${neonRgb},0.03))`,
                border: `1px solid rgba(${neonRgb},0.25)`,
              }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-2"
                // Day 47 iter 6: darken the label for readability.
                style={{ color: `color-mix(in srgb, ${neonHsl} 45%, #0a1628 55%)` }}
              >
                One Proven Strategy
              </div>
              <p
                className="text-sm sm:text-[15px] leading-relaxed"
                style={{ color: "rgba(26,30,58,0.88)" }}
              >
                {substep.oneProvenStrategy}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Separator lines between substeps removed 2026-04-21 per Sasha —
          vertical rhythm alone carries the structure. */}
    </div>
  );
};

// ───── Hash parsing (deep-link support) ─────
// #how             → see-how open
// #how-1 / #how-2 / #how-3  → see-how open + that substep's strategy open
const HASH_RE = /^#how(?:-(\d+))?$/;
const parseHash = (raw: string): { seeHow: boolean; substep: number | null } => {
  const m = HASH_RE.exec(raw);
  if (!m) return { seeHow: false, substep: null };
  const n = m[1] ? Number.parseInt(m[1], 10) : null;
  return { seeHow: true, substep: n };
};

const StepCard = ({ step }: StepCardProps) => {
  // Step-level "See how" is gone (Sasha, 2026-04-21) but seeHowOpen is kept
  // as a compat flag — always true — in case hash-based deep links reference it.
  const [seeHowOpen, setSeeHowOpen] = useState(true);
  // Substep-level "Recommended How-To" — all CLOSED by default so the three
  // substeps read cleanly first. User opens what they want to explore.
  const [openSubsteps, setOpenSubsteps] = useState<Set<number>>(new Set());

  // Re-seed state whenever the step slug changes (navigating 1 → 2 → …)
  // Default: all substep strategies closed. Hash #how-N opens that one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { substep } = parseHash(window.location.hash);
    setSeeHowOpen(true);
    setOpenSubsteps(
      substep !== null && step.substeps.some((s) => s.number === substep)
        ? new Set([substep])
        : new Set(),
    );

    const onHashChange = () => {
      const { substep: ss } = parseHash(window.location.hash);
      if (ss !== null && step.substeps.some((s) => s.number === ss)) {
        setOpenSubsteps((prev) => {
          const next = new Set(prev);
          next.add(ss);
          return next;
        });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [step.slug, step.substeps]);

  const writeHash = (seeHow: boolean, lastOpenSubstep: number | null) => {
    if (typeof window === "undefined") return;
    const bare = `${window.location.pathname}${window.location.search}`;
    if (!seeHow) {
      window.history.replaceState(null, "", bare);
    } else if (lastOpenSubstep !== null) {
      window.history.replaceState(null, "", `${bare}#how-${lastOpenSubstep}`);
    } else {
      window.history.replaceState(null, "", `${bare}#how`);
    }
  };

  const toggleSeeHow = () => {
    setSeeHowOpen((prev) => {
      const next = !prev;
      // Closing "See how" also collapses every substep.
      if (!next) setOpenSubsteps(new Set());
      writeHash(
        next,
        next && openSubsteps.size ? Math.max(...openSubsteps) : null,
      );
      return next;
    });
  };

  const toggleSubstep = (substepNumber: number) => {
    // Opening any substep auto-opens "See how" so the content is visible.
    setOpenSubsteps((prev) => {
      const next = new Set(prev);
      if (next.has(substepNumber)) next.delete(substepNumber);
      else next.add(substepNumber);
      const seeHowNext = seeHowOpen || next.size > 0;
      setSeeHowOpen(seeHowNext);
      writeHash(
        seeHowNext,
        next.size ? Math.max(...next) : null,
      );
      return next;
    });
  };

  return (
    <article
      className="relative rounded-3xl p-6 sm:p-10 transition-all duration-500 liquid-glass-strong"
    >
      {/* ══ STEP HEADER — Day 47 iter 5 (Sasha): "purple too faint" fix.
          Previous approach used a `neonHsl → #0a1628 → neonHsl` gradient
          bg-clipped to the text. At small sizes the navy center dominated
          and the step color barely read. New approach: SOLID darkened
          step color (via color-mix with navy) + neon text-shadow glow in
          the step's hue. Letter fills with readable ink, glow provides
          the neon aura. No more bg-clip gymnastics. */}
      <header className="mb-8">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.15]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#0a1628",
            textShadow:
              "0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75)",
          }}
        >
          <span
            style={{
              // Blend the step's pale neon with navy so the letters are
              // SATURATED and READABLE rather than a washed-out gradient.
              // 55% step color + 45% deep navy lands at ~40% lightness.
              color: `color-mix(in srgb, ${step.neonHsl} 55%, #0a1628 45%)`,
              // Neon aura — stronger than the hero words because "Step N."
              // is the signature accent of the page. Two layered glows in
              // the step's hue for depth without shouting.
              textShadow: `0 0 14px rgba(${step.neonRgb}, 0.45), 0 0 3px rgba(${step.neonRgb}, 0.55), 0 1px 2px rgba(255,255,255,0.7)`,
            }}
          >
            Step {step.number}.
          </span>{" "}
          {step.subtitle}
        </h1>
      </header>

      {/* ══ 3 SUBSTEPS — always visible */}
      <section
        id={`step-${step.number}-substeps`}
        aria-label="Substeps"
        className="mb-10"
      >
        {step.substeps.map((ss) => (
          <SubstepRow
            key={ss.number}
            substep={ss}
            neonHsl={step.neonHsl}
            neonRgb={step.neonRgb}
            open={openSubsteps.has(ss.number)}
            onToggle={() => toggleSubstep(ss.number)}
          />
        ))}
      </section>

      {/* The "Here's your result" + CTA + "Pay as you progress" block was
          removed 2026-04-21 per Sasha — every step's substeps stand alone.
          Commercial layer lives on /path, not inside each step card. */}
    </article>
  );
};

export default StepCard;
