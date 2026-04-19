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
 * Progressive unlock: step 1 is always open (the free gift); 2–7 render
 * locked until the parent raises `unlockedThroughStep`.
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
    // Tightened vertical stack so CTA + explainer land above the fold on
    // a 1280×720 viewport with sidebar open (the most common laptop case).
    // Breakpoints:
    //   <sm  → mb-6 wrapper, mb-4 circle — compact
    //   sm+  → mb-10 wrapper, mb-6 circle — breathing room without pushing
    //          the CTA below the fold
    <div className="mb-6 sm:mb-10">
      <div className="mb-4 sm:mb-6">
        <PlaybookCircleInfographic unlockedThroughStep={unlock} />
      </div>

      {/* ══════ CTA: Claim your gift (Step 1 free) ══════ */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 px-4 text-center">
        <div
          className="text-[10px] uppercase tracking-[0.28em]"
          style={{ color: "rgba(231,233,229,0.55)" }}
        >
          Step 1 is on us · Takes two minutes
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

        <p
          className="text-xs sm:text-[13px] max-w-[380px]"
          style={{ color: "rgba(231,233,229,0.6)" }}
        >
          We'll email you a magic link so your Zone-of-Genius result stays
          safe — no password, no spam.
        </p>
      </div>
    </div>
  );
};

export default PlaybookHero;
