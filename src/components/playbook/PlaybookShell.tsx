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
            // Dark navy text + subtle light glass background for Panel 3's
            // now-light look (Sasha, 2026-04-21).
            backgroundImage:
              "linear-gradient(135deg, rgba(26,30,58,0.08), rgba(26,30,58,0.02))",
            border: "1px solid rgba(26,30,58,0.2)",
            color: "rgba(26,30,58,0.85)",
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
            const isActive = state === "active";

            return (
              <li
                key={step.slug}
                className="flex-1 flex flex-col items-center relative"
              >
                {/* Connector line to next step — now centered vertically on
                    the number chip (14 / 16 = mobile / desktop button radius)
                    and widened by one gap-step so the line doesn't break
                    between chips. */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-[13px] sm:top-[15px] left-1/2 h-[1px] pointer-events-none w-[calc(100%+0.25rem)] sm:w-[calc(100%+0.5rem)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, rgba(26,30,58,0.22), rgba(26,30,58,0.12))",
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => navigate(step.number === 1 ? "/playbook" : `/playbook/${step.slug}`)}
                  className={cn(
                    "relative z-10 flex items-center justify-center",
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-semibold",
                    "transition-all duration-300",
                    "cursor-pointer",
                    "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
                    // Active steps sit slightly larger for clear UI hierarchy
                    // without greying everything else.
                    isActive ? "scale-[1.18] hover:scale-[1.22]" : "hover:scale-110",
                  )}
                  style={{
                    // Every step carries its own neon color — no more grey
                    // "upcoming" state (Sasha, 2026-04-21). Active is
                    // distinguished by scale + glow ring, not by color delta.
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${step.neonHsl}, rgba(132,96,234,0.6))`,
                    color: "#0a1628",
                    border: isActive
                      ? `1.5px solid ${step.neonHsl}`
                      : "1px solid rgba(26,30,58,0.2)",
                    boxShadow: isActive
                      ? `0 0 0 3px rgba(255,255,255,0.5), 0 0 18px -2px ${step.neonHsl}, 0 0 32px -8px rgba(132,96,234,0.6)`
                      : `0 1px 3px rgba(26,30,58,0.15)`,
                  }}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${step.number}: ${step.subtitle}`}
                >
                  {step.number}
                </button>

                <span
                  className={cn(
                    // Dark, sans-serif, non-italic per Sasha (2026-04-21).
                    // Full vetted step name; wraps inside the narrow column.
                    "mt-2 text-[10px] sm:text-[11px]",
                    "leading-[1.25] text-center",
                    "max-w-[110px] sm:max-w-[130px]",
                    isActive ? "font-semibold" : "font-medium",
                  )}
                  style={{
                    color: isActive ? "#0a1628" : "rgba(26,30,58,0.85)",
                  }}
                >
                  {step.subtitle}
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
