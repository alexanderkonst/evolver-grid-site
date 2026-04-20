import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYBOOK_STEPS, PlaybookStep } from "@/data/playbookSteps";

/**
 * PlaybookShell — top-nav progression bar for the seven-step playbook.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  ← Back to landing                                           │
 *   │  1  ━  2  ━  3  ━  [4]  ━  5  ━  6  ━  7                     │
 *   │  discover package build TEST  launch grow  scale             │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * States (Apr 2026 — Open Blueprint Paradox: nothing is gated):
 *   - completed → dim pearl, tappable — steps already visited
 *   - active    → electric violet, glowing ring — current step
 *   - upcoming  → soft pearl, tappable — ALL later steps are free to preview
 *
 * `currentSlug` drives which node is active. Earlier steps show as
 * "completed" (visited), later steps show as "upcoming" — all clickable.
 */

export type StepVisualState = "completed" | "active" | "upcoming";

export type PlaybookShellProps = {
  currentSlug: string;
  /** Optional override. Default: position relative to currentSlug. */
  getStepState?: (step: PlaybookStep) => StepVisualState;
  children: ReactNode;
};

const defaultStateFor = (
  step: PlaybookStep,
  currentSlug: string,
): StepVisualState => {
  const currentIdx = PLAYBOOK_STEPS.findIndex((s) => s.slug === currentSlug);
  const stepIdx = PLAYBOOK_STEPS.findIndex((s) => s.slug === step.slug);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "upcoming";
};

const PlaybookShell = ({
  currentSlug,
  getStepState,
  children,
}: PlaybookShellProps) => {
  const navigate = useNavigate();
  const resolveState = (s: PlaybookStep) =>
    getStepState ? getStepState(s) : defaultStateFor(s, currentSlug);

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-6 pb-20">
      {/* ═══════ BACK TO LANDING ═══════ */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className={cn(
            "inline-flex items-center gap-2 py-1.5 px-3 rounded-full",
            "text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-medium",
            "transition-all duration-300 hover:scale-[1.02]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(231,233,229,0.08), rgba(231,233,229,0.02))",
            border: "1px solid rgba(231,233,229,0.18)",
            color: "rgba(231,233,229,0.75)",
          }}
          aria-label="Back to landing page"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" />
          <span>Back to landing</span>
        </button>
      </div>

      {/* ═══════ TOP NAV: 7 steps ═══════ */}
      <nav
        aria-label="Playbook progression"
        className="mb-5 sm:mb-6"
      >
        <ol className="flex items-start justify-between gap-1 sm:gap-2">
          {PLAYBOOK_STEPS.map((step, i) => {
            const state = resolveState(step);
            const isLast = i === PLAYBOOK_STEPS.length - 1;
            // Every step is clickable — Open Blueprint Paradox: nothing is gated.
            const clickable = true;

            return (
              <li
                key={step.slug}
                className="flex-1 flex flex-col items-center relative"
              >
                {/* Connector line to next step */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-[14px] left-1/2 w-full h-[1px] pointer-events-none"
                    style={{
                      backgroundImage:
                        state === "completed"
                          ? "linear-gradient(90deg, rgba(132,96,234,0.5), rgba(132,96,234,0.2))"
                          : "linear-gradient(90deg, rgba(231,233,229,0.15), rgba(231,233,229,0.05))",
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/playbook/${step.slug}`)}
                  className={cn(
                    "relative z-10 flex items-center justify-center",
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-semibold",
                    "transition-all duration-300",
                    "cursor-pointer hover:scale-110",
                    "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
                  )}
                  style={{
                    backgroundImage:
                      state === "active"
                        ? `radial-gradient(circle at 30% 30%, ${step.neonHsl}, rgba(132,96,234,0.75))`
                        : state === "completed"
                        ? "linear-gradient(135deg, rgba(231,233,229,0.7), rgba(200,183,216,0.5))"
                        : "linear-gradient(135deg, rgba(231,233,229,0.25), rgba(231,233,229,0.1))",
                    color: "#0a1628",
                    border:
                      state === "active"
                        ? `1px solid ${step.neonHsl}`
                        : "1px solid rgba(231,233,229,0.25)",
                    boxShadow:
                      state === "active"
                        ? `0 0 16px -2px ${step.neonHsl}, 0 0 32px -8px rgba(132,96,234,0.6)`
                        : "none",
                  }}
                  aria-current={state === "active" ? "step" : undefined}
                  aria-label={`Step ${step.number}: ${step.appName}`}
                >
                  {step.number}
                </button>

                <span
                  className={cn(
                    // Narrow-viewport (sidebar open on 1280px laptops)
                    // gives the content column ~1020px; with 7 chips that
                    // leaves each chip-label ~145px. 9px at narrow widths
                    // prevents label wrapping. 11px at sm: keeps the
                    // default crisp.
                    "mt-2 text-[9px] sm:text-[11px] uppercase",
                    "tracking-[0.14em] sm:tracking-[0.18em] font-medium text-center",
                    "transition-opacity duration-300",
                    state === "active" && "opacity-100",
                    state === "completed" && "opacity-65",
                    state === "upcoming" && "opacity-55",
                  )}
                  style={{ color: "rgba(231,233,229,0.85)" }}
                >
                  {step.appName}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ═══════ GRADIENT BRIDGE (nav → step card) ═══════
          Soft violet fade that converts the fold from a cut to a seam. */}
      <div
        aria-hidden="true"
        className="relative h-6 -mt-2 -mb-2 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 0%, rgba(132,96,234,0.08) 50%, transparent 100%)",
        }}
      />

      {/* ═══════ STEP CONTENT ═══════ */}
      <div>{children}</div>
    </div>
  );
};

export default PlaybookShell;
