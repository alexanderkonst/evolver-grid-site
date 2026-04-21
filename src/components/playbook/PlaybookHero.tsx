import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * PlaybookHero — the CTAs below the landing's headline.
 *
 * As of 2026-04-21 (Sasha): the 7-step circle infographic was retired.
 * The landing is now hero headline + two buttons. The step-in-line
 * navigation lives at the top of /playbook (PlaybookShell), not here.
 *
 * Layout:
 *   [ Find your top talent → ]         ← primary (was "Claim your gift")
 *     ↑ Claim your gift · Takes two minutes  ← meta, small, arrow up
 *
 *   [ See the exact playbook →  ]       ← secondary
 */

const PlaybookHero = () => {
  const navigate = useNavigate();

  // Both CTA buttons stretch to the same width inside this max-w wrapper —
  // Sasha, 2026-04-21: the two buttons must feel equal in weight.
  const buttonBase = cn(
    "group relative w-full rounded-full",
    "px-6 py-4",
    "text-sm sm:text-base font-semibold uppercase tracking-[0.18em]",
    "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
  );

  return (
    <div className="mb-6 sm:mb-10">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        {/* Fixed-width container so both buttons are identical in size */}
        <div className="flex flex-col items-stretch gap-3 w-full max-w-[380px]">
          {/* Primary CTA — marine blue → royal purple gradient */}
          <button
            type="button"
            onClick={() => navigate("/auth?claim=true&next=/zone-of-genius")}
            className={buttonBase}
            style={{
              color: "rgba(245,245,250,0.98)",
              backgroundImage:
                "linear-gradient(135deg, #1a2f7a 0%, #2a3d95 55%, #5b21b6 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "0 22px 60px -18px rgba(26,47,122,0.65), inset 0 1px 1px rgba(255,255,255,0.18)",
            }}
          >
            <span className="inline-flex items-center justify-center gap-3">
              Find your top talent
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </button>

          {/* Meta line — BELOW the button with an up-arrow pointing to it.
              Dark text now that Panel 3 is light. */}
          <div
            className="text-[10px] uppercase tracking-[0.28em] inline-flex items-center justify-center gap-2"
            style={{ color: "rgba(26,30,58,0.6)" }}
          >
            <span aria-hidden="true">↑</span>
            <span>Claim your gift · Takes two minutes</span>
          </div>

          {/* Secondary — same width, glass look, unchanged palette */}
          <button
            type="button"
            onClick={() => navigate("/playbook")}
            className={buttonBase}
            style={{
              color: "rgba(26,30,58,0.88)",
              background: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(26,30,58,0.25)",
              boxShadow:
                "0 12px 40px -14px rgba(26,30,58,0.2), inset 0 1px 1px rgba(255,255,255,0.5)",
            }}
          >
            <span className="inline-flex items-center justify-center gap-3">
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
      </div>
    </div>
  );
};

export default PlaybookHero;
