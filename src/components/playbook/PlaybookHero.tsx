import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import PlaybookCircleInfographic from "./PlaybookCircleInfographic";
import { useJourneyProgression } from "@/hooks/useJourneyProgression";

/**
 * PlaybookHero — the animated circular infographic at the top of the landing.
 *
 * As of 2026-04-16, the hero is a pure inline SVG (PlaybookCircleInfographic),
 * not a Mux HLS stream. Benefits:
 *   • 0 KB network cost beyond the component itself — no CDN, no decoder
 *   • Each step is a real <button> (keyboard + screen-reader for free)
 *   • Crisp at any viewport (SVG viewBox)
 *   • Respects `prefers-reduced-motion`
 *   • Colors/labels pulled from PLAYBOOK_STEPS — single source of truth
 *
 * The circle itself is the store: each node routes to its playbook page.
 * All 7 steps are always visible (Open Blueprint Paradox) — upcoming steps
 * render dimmer but never gated.
 *
 * Layout (2026-04-20): primary CTAs render ABOVE the infographic so warm
 * traffic can act immediately. The circle below serves as depth / context
 * for visitors who want to see the whole path before choosing.
 */

type PlaybookHeroProps = {
  /**
   * Optional manual override for the unlock high-water mark. If provided,
   * this wins over the Supabase-derived step. Useful for demo/preview.
   * Otherwise the circle reads `onboarding_stage` via useJourneyProgression
   * and reacts to user progression automatically:
   *   new / zog_started       → step 1 active (free gift)
   *   zog_complete / qol_*    → step 2 active
   *   offer/recipe_complete   → step 3 active
   *   unlocked / complete     → step 4+
   */
  unlockedThroughStep?: number;
};

const PlaybookHero = ({ unlockedThroughStep }: PlaybookHeroProps) => {
  const navigate = useNavigate();
  // Pull live progression from Supabase. Falls back to step 1 for
  // unauthenticated visitors (the landing page's primary audience).
  const { currentStep } = useJourneyProgression();
  const unlock = unlockedThroughStep ?? currentStep;

  return (
    // Buttons first (above the fold for warm traffic), infographic below
    // as depth/context. Tightened vertical spacing so the primary CTA lands
    // above the fold on a 1280×720 viewport with sidebar open.
    <div className="mb-6 sm:mb-10">
      {/* ══════ CTAs (above the fold) ══════ */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 px-4 text-center mb-8 sm:mb-12">
        <div
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "rgba(231,233,229,0.55)" }}
        >
          Finding Your Top Talent is on us · Takes two minutes
        </div>

        <button
          type="button"
          onClick={() => navigate("/auth?claim=true&next=/zone-of-genius")}
          className={cn(
            "group relative px-8 sm:px-10 py-4 rounded-full",
            "text-sm sm:text-base font-semibold uppercase tracking-[0.18em]",
            "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            color: "rgba(231,233,229,0.98)",
            backgroundImage:
              "linear-gradient(135deg, rgba(132,96,234,0.85), rgba(41,84,159,0.85))",
            border: "1px solid rgba(231,233,229,0.35)",
            boxShadow:
              "0 20px 60px -16px rgba(132,96,234,0.75), inset 0 1px 1px rgba(255,255,255,0.25)",
          }}
        >
          <span className="inline-flex items-center gap-3">
            Claim your gift
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </button>

        {/* ══════ CTA 2: See the Exact Playbook ══════ */}
        <button
          type="button"
          onClick={() => navigate("/playbook")}
          className={cn(
            "group relative px-8 sm:px-10 py-3.5 rounded-full mt-2",
            "text-sm sm:text-base font-semibold uppercase tracking-[0.18em]",
            "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            color: "rgba(231,233,229,0.92)",
            background: "rgba(231,233,229,0.06)",
            border: "1px solid rgba(231,233,229,0.25)",
            boxShadow: "0 12px 40px -14px rgba(132,96,234,0.35)",
          }}
        >
          <span className="inline-flex items-center gap-3">
            See the exact playbook
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </button>
      </div>

      {/* ══════ Infographic (context, below the fold) ══════ */}
      <div>
        <PlaybookCircleInfographic unlockedThroughStep={unlock} />
      </div>
    </div>
  );
};

export default PlaybookHero;
