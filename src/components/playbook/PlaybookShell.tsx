import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYBOOK_STEPS, PlaybookStep } from "@/data/playbookSteps";

/**
 * PlaybookShell — top-nav progression bar for the seven-step playbook.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  1  ━  2  ━  3  ━  [4]  ━  5🔒 ━  6🔒 ━  7🔒                 │
 *   │  discover package build TEST  launch grow  scale             │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * States:
 *   - completed → dim pearl, tappable (returns to earlier step)
 *   - active    → electric violet, glowing ring
 *   - locked    → ghost with lock icon, not tappable yet
 *
 * `currentSlug` drives which node is active. Anything earlier is
 * considered completed; anything later is locked.
 *
 * For v1 we treat the progression purely by position in PLAYBOOK_STEPS.
 * When a real progression hook is wired (e.g. useJourneyProgression),
 * pass `getStepState` in as a prop to override.
 */

export type StepVisualState = "completed" | "active" | "locked";

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
  return "locked";
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
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-10 pb-20">
      {/* ═══════ TOP NAV: 7 steps ═══════ */}
      <nav
        aria-label="Playbook progression"
        className="mb-10"
      >
        <ol className="flex items-start justify-between gap-1 sm:gap-2">
          {PLAYBOOK_STEPS.map((step, i) => {
            const state = resolveState(step);
            const isLast = i === PLAYBOOK_STEPS.length - 1;
            const clickable = state !== "locked";

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
                  disabled={!clickable}
                  onClick={() =>
                    clickable && navigate(`/playbook/${step.slug}`)
                  }
                  className={cn(
                    "relative z-10 flex items-center justify-center",
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-semibold",
                    "transition-all duration-300",
                    clickable
                      ? "cursor-pointer hover:scale-110"
                      : "cursor-not-allowed",
                    "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
                  )}
                  style={{
                    backgroundImage:
                      state === "active"
                        ? `radial-gradient(circle at 30% 30%, ${step.neonHsl}, rgba(132,96,234,0.75))`
                        : state === "completed"
                        ? "linear-gradient(135deg, rgba(231,233,229,0.7), rgba(200,183,216,0.5))"
                        : "linear-gradient(135deg, rgba(231,233,229,0.12), rgba(231,233,229,0.05))",
                    color:
                      state === "locked"
                        ? "rgba(231,233,229,0.45)"
                        : "#0a1628",
                    border:
                      state === "active"
                        ? `1px solid ${step.neonHsl}`
                        : "1px solid rgba(231,233,229,0.15)",
                    boxShadow:
                      state === "active"
                        ? `0 0 16px -2px ${step.neonHsl}, 0 0 32px -8px rgba(132,96,234,0.6)`
                        : "none",
                  }}
                  aria-current={state === "active" ? "step" : undefined}
                  aria-label={`Step ${step.number}: ${step.appName}${
                    state === "locked" ? " (locked)" : ""
                  }`}
                >
                  {state === "locked" ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    step.number
                  )}
                </button>

                <span
                  className={cn(
                    "mt-2 text-[10px] sm:text-[11px] uppercase",
                    "tracking-[0.18em] font-medium text-center",
                    "transition-opacity duration-300",
                    state === "active" && "opacity-100",
                    state === "completed" && "opacity-60",
                    state === "locked" && "opacity-35",
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

      {/* ═══════ STEP CONTENT ═══════ */}
      <div>{children}</div>
    </div>
  );
};

export default PlaybookShell;
