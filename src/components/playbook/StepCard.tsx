import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaybookStep, Substep } from "@/data/playbookSteps";

/**
 * StepCard — renders one of the 7 playbook steps.
 *
 * Each substep has ONE disclosure level:
 *
 *   Level 0 (default):
 *     1  — Description text, 1–2 lines, always visible.
 *          [ ONE GOOD STRATEGY ▶ ]    (glowing triangle trigger)
 *
 *   Level 1 (on triangle click):
 *     1  — Description text, 1–2 lines.
 *          [ ONE GOOD STRATEGY ▾ ]
 *            • Bullet one
 *            • Bullet two
 *            • Bullet three
 *
 * Below all three substeps: the TRANSFORMATIONAL RESULT button — the
 * phrase the user says to themselves after the step lands.
 */

export type StepCardProps = {
  step: PlaybookStep;
};

/** Triangle with soft radial glow per step color. */
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

/** A single substep row — number + description always visible, one-level disclosure for bullets. */
const SubstepRow = ({
  substep,
  neonHsl,
  neonRgb,
}: {
  substep: Substep;
  neonHsl: string;
  neonRgb: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      {/* ══ Row: number + description always visible */}
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
          <p
            className="text-sm sm:text-[15px] leading-relaxed mb-3"
            style={{ color: "rgba(231,233,229,0.88)" }}
          >
            {substep.description}
          </p>

          {/* ══ ONE GOOD STRATEGY trigger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
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
            <span>ONE GOOD STRATEGY</span>
          </button>

          {/* ══ Bullets reveal */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-500 ease-out",
              open ? "max-h-[600px] opacity-100 mt-4" : "max-h-0 opacity-0",
            )}
          >
            <ul className="space-y-2 py-1">
              {substep.oneGoodStrategyBullets.map((bullet, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                  style={{ color: "rgba(231,233,229,0.8)" }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-[9px] inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: neonHsl,
                      boxShadow: `0 0 8px -1px ${neonHsl}`,
                    }}
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hair-line divider between substeps */}
      <div
        aria-hidden="true"
        className="h-[1px] w-full mt-5"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(231,233,229,0.02), rgba(231,233,229,0.12), rgba(231,233,229,0.02))",
        }}
      />
    </div>
  );
};

const StepCard = ({ step }: StepCardProps) => {
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
      {/* ══ STEP HEADER */}
      <header className="mb-8">
        <div
          className="text-[10px] uppercase tracking-[0.32em] mb-3"
          style={{ color: step.neonHsl }}
        >
          Step {step.number} of 7 · {step.appName}
        </div>
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

      {/* ══ 3 SUBSTEPS */}
      <section aria-label="Substeps" className="mb-10">
        {step.substeps.map((ss) => (
          <SubstepRow
            key={ss.number}
            substep={ss}
            neonHsl={step.neonHsl}
            neonRgb={step.neonRgb}
          />
        ))}
      </section>

      {/* ══ TRANSFORMATIONAL RESULT BUTTON */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "rgba(231,233,229,0.45)" }}
        >
          Transformational result · phase shift
        </div>
        <button
          type="button"
          className={cn(
            "px-6 sm:px-8 py-3 sm:py-4 rounded-full",
            "text-sm sm:text-base font-semibold leading-tight",
            "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
            "max-w-[480px] text-center",
          )}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "rgba(231,233,229,0.98)",
            backgroundImage: `linear-gradient(135deg, rgba(${step.neonRgb},0.28), rgba(132,96,234,0.2))`,
            border: `1px solid ${step.neonHsl}`,
            boxShadow: `0 0 24px -6px ${step.neonHsl}, inset 0 1px 1px rgba(255,255,255,0.1)`,
            letterSpacing: "0.01em",
          }}
        >
          “{step.transformationalResult}”
        </button>
      </div>
    </article>
  );
};

export default StepCard;
