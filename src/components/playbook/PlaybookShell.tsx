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
      {/* ═══════ BACK (→ "/" Start Here) ═══════ */}
      {/* Day 47 later-same-day (Sasha): "BACK TO LANDING" → just "BACK".
          Destination unchanged — still navigates to "/" (Start Here). */}
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
              "linear-gradient(135deg, rgba(26,30,58,0.08), rgba(26,30,58,0.02))",
            border:
              "1px solid var(--skin-rule-strong, rgba(26,30,58,0.2))",
            color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
          }}
          aria-label="Back to landing page"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" />
          <span>Back</span>
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
                    // Day 47 iter 9 (Sasha): line now passes through the EXACT
                    // vertical center of each step sphere. Button is w-7 h-7
                    // (28px) on mobile and sm:w-8 sm:h-8 (32px) on desktop —
                    // centers at 14px and 16px respectively. A 2px line
                    // positioned at top-[13px]/sm:top-[15px] spans y=13..15
                    // and y=15..17, centered ON the sphere midlines.
                    className="absolute top-[13px] sm:top-[15px] left-1/2 h-[2px] pointer-events-none w-[calc(100%+0.25rem)] sm:w-[calc(100%+0.5rem)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, var(--skin-rule-strong, rgba(26,30,58,0.22)), var(--skin-rule-medium, rgba(26,30,58,0.12)))",
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
                    // Rainbow UV→IR octave preserved in BOTH skins — Sasha's rule:
                    // "the seven round steps on top of the playbook keep the
                    // colors they have". Only the number glyph color adapts.
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${step.neonHsl}, rgba(132,96,234,0.6))`,
                    // Day 48 (Sasha, mobile readability): pure navy on pale
                    // neon read washed out at small mobile scale. Color-mix
                    // with deeper navy for a bold readable digit.
                    color: `color-mix(in srgb, var(--skin-text-primary, #0a1628) 85%, #000 15%)`,
                    fontWeight: 700,
                    border: isActive
                      ? `1.5px solid ${step.neonHsl}`
                      : "1px solid var(--skin-rule-strong, rgba(26,30,58,0.2))",
                    boxShadow: isActive
                      // Day 48 (Sasha): tightened the active-step halo so
                      // it doesn't render as a diffuse "malformed cloud"
                      // above the stepper — smaller white ring (2px vs 3px),
                      // shorter neon glow (12px vs 18px), outer violet halo
                      // retired entirely.
                      ? `0 0 0 2px rgba(255,255,255,0.55), 0 0 12px -2px ${step.neonHsl}`
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
                    color: isActive
                      ? "var(--skin-text-primary, #0a1628)"
                      : "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                  }}
                >
                  {step.subtitle}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Gradient bridge retired Day 48 (Sasha): the soft violet fade
          between nav and step card was reading as a malformed glow cloud
          above the step box. Removed — the spacing between nav and card
          now does the "seam" work on its own. */}

      {/* ═══════ STEP CONTENT ═══════ */}
      <div className="mt-4">{children}</div>

      {/* Day 51 (Sasha 2026-04-25): quiet "this is open" footer.
          The playbook itself is the methodology; the codebase running it
          is forkable. Forks of the entire system are the actual goal of
          the Integration Layer Manifesto. Subtle by design — utility,
          not promotion. */}
      <div
        className="mt-12 pt-6 text-center"
        style={{
          borderTop: "1px solid var(--skin-rule-soft, rgba(26,30,58,0.1))",
        }}
      >
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))" }}
        >
          The method is open to read. The platform is forkable.
          <br />
          Run it for your own community — under your own brand. 10% to commons if you go commercial.
        </p>
        <a
          href="https://github.com/alexanderkonst/evolver-grid-site"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs underline-offset-4 hover:underline transition-colors"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "0.78rem",
            letterSpacing: "0.06em",
            color: "var(--skin-link-secondary, rgba(26,30,58,0.75))",
          }}
        >
          Fork it on GitHub →
        </a>
      </div>
    </div>
  );
};

export default PlaybookShell;
