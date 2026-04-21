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
      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(${neonRgb},0.35), rgba(${neonRgb},0.05))`,
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
      style={{ color: neonHsl }}
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
    <div className="py-5">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.2), rgba(${neonRgb},0.05))`,
            border: `1px solid rgba(${neonRgb},0.4)`,
            color: neonHsl,
            boxShadow: `0 0 10px -4px rgba(${neonRgb},0.5)`,
          }}
        >
          {substep.number}
        </div>
        <div className="flex-1 pt-1">
          {/* ══ Substep name */}
          <h3
            className="text-base sm:text-lg font-semibold leading-tight mb-1.5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "rgba(231,233,229,0.98)",
            }}
          >
            {substep.name}
          </h3>

          {/* ══ Description (one line) — hidden if empty so rows stay tight */}
          {substep.description && (
            <p
              className="text-sm sm:text-[15px] leading-relaxed mb-3"
              style={{ color: "rgba(231,233,229,0.8)" }}
            >
              {substep.description}
            </p>
          )}

          {/* ══ "See one proven strategy" button */}
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "inline-flex items-center gap-2 py-2 px-3 rounded-full",
              "text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold",
              "transition-all duration-300 hover:scale-[1.02]",
              "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
            )}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.18), rgba(${neonRgb},0.06))`,
              border: `1px solid rgba(${neonRgb},0.35)`,
              color: neonHsl,
              boxShadow: open ? `0 0 18px -4px ${neonHsl}` : "none",
            }}
            aria-expanded={open}
          >
            <Triangle open={open} neonHsl={neonHsl} neonRgb={neonRgb} />
            <span>See one proven strategy</span>
          </button>

          {/* ══ One Proven Strategy reveal */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-500 ease-out",
              open ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0",
            )}
          >
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.08), rgba(${neonRgb},0.02))`,
                border: `1px solid rgba(${neonRgb},0.18)`,
              }}
            >
              <div
                className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-2"
                style={{ color: neonHsl }}
              >
                One Proven Strategy
              </div>
              <p
                className="text-sm sm:text-[15px] leading-relaxed"
                style={{ color: "rgba(231,233,229,0.9)" }}
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
  // Step-level "See how" disclosure — wraps the 3 substeps. Open by default.
  const [seeHowOpen, setSeeHowOpen] = useState(true);
  // Substep-level "See one proven strategy" — all open by default.
  const [openSubsteps, setOpenSubsteps] = useState<Set<number>>(
    new Set(step.substeps.map((s) => s.number)),
  );
  // Payment CTA — launches Stripe one-time checkout when step.priceId is set,
  // otherwise shows a "pricing coming soon" toast.

  // Re-seed state whenever the step slug changes (navigating 1 → 2 → …)
  // Default: everything open. Hash can override to collapse.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { seeHow, substep } = parseHash(window.location.hash);
    // If no hash, default to all open
    const hasHash = window.location.hash.length > 0;
    setSeeHowOpen(hasHash ? seeHow : true);
    setOpenSubsteps(
      hasHash
        ? substep !== null && step.substeps.some((s) => s.number === substep)
          ? new Set([substep])
          : new Set()
        : new Set(step.substeps.map((s) => s.number)),
    );

    const onHashChange = () => {
      const { seeHow: sh, substep: ss } = parseHash(window.location.hash);
      setSeeHowOpen(sh);
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
      className="relative rounded-3xl p-6 sm:p-10 transition-all duration-500"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,25,45,0.65), rgba(20,15,40,0.55))",
        border: "1px solid rgba(231,233,229,0.08)",
        boxShadow: `0 24px 80px -32px rgba(${step.neonRgb},0.35), inset 0 1px 1px rgba(255,255,255,0.05)`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {/* ══ STEP HEADER — only the subtitle remains.
          "Step N of 7 · [appName]" was redundant with the top nav chips.
          "See how" button removed — content is always open (Sasha, 2026-04-21). */}
      <header className="mb-6">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.15]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "rgba(231,233,229,0.98)",
          }}
        >
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
