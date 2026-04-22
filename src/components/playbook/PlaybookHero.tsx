import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * PlaybookHero — the CTAs below the landing's headline.
 *
 * Day 47 late pass (Sasha): buttons rewritten in Apple iOS 26 Liquid Glass
 * style. Both CTAs now use pure glass (no colored fill, no arrows) and rely
 * on text weight + glass tier to establish primary/secondary hierarchy. The
 * meta line between them is no longer uppercase and is allowed to flow
 * wider than the buttons so "Claim your gift · takes two minutes" reads
 * naturally.
 *
 *   [ Find your top talent     ]  ← primary  (liquid-glass-strong)
 *       ↑ Claim your gift · takes two minutes
 *   [ See the exact playbook   ]  ← secondary (liquid-glass)
 */

const PlaybookHero = () => {
  const navigate = useNavigate();

  // Both CTA buttons stretch to the same width inside this max-w wrapper.
  // Pill shape (rounded-full), Apple Liquid Glass texture via utility class.
  const buttonBase = cn(
    "relative w-full rounded-full",
    "px-6 py-4",
    "text-sm sm:text-base font-semibold tracking-wide",
    "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
    "focus-visible:ring-2 focus-visible:ring-[#0a1628]/30 outline-none",
  );

  return (
    <div className="mb-6 sm:mb-10">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        {/* Primary CTA — Day 47 iter 12 (GFOA v1.1):
            Replaced meh-glass pill with high-contrast dark-navy button +
            arrow. Must feel like a decision, not an option. */}
        <div className="w-full max-w-[380px]">
          <button
            type="button"
            onClick={() => navigate("/zone-of-genius")}
            className={cn(
              "group relative w-full rounded-full px-6 py-4",
              "text-sm sm:text-base font-semibold tracking-wide",
              "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-[#0a1628]/40 outline-none",
              "inline-flex items-center justify-center gap-3",
            )}
            style={{
              color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
              backgroundImage:
                "var(--skin-cta-bg, linear-gradient(135deg, #0a1628 0%, #1a1e3a 50%, #0a1628 100%))",
              border: "1px solid var(--skin-cta-border, rgba(255,255,255,0.12))",
              boxShadow:
                "var(--skin-cta-shadow, 0 20px 50px -18px rgba(10,22,40,0.65), 0 0 0 1px rgba(10,22,40,0.25), inset 0 1px 1px rgba(255,255,255,0.18))",
              textShadow:
                "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                color: "var(--skin-cta-icon, rgba(240,194,127,0.9))",
                textShadow:
                  "var(--skin-cta-icon-shadow, 0 0 10px rgba(240,194,127,0.6), 0 0 3px rgba(240,194,127,0.8))",
              }}
            >
              ✦
            </span>
            <span>Find your top talent</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </button>
        </div>

        {/* Meta line — subtle, under primary CTA */}
        <div
          className="text-xs inline-flex items-center justify-center gap-2 max-w-[460px] mt-1"
          style={{
            color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
            textShadow:
              "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
          }}
        >
          <span>Takes 2 minutes. No signup.</span>
        </div>

        {/* Secondary — Day 47 iter 15 (Sasha): restored as a button.
            The text-link treatment made the path feel under-weighted for
            its real importance (it IS the Open Blueprint Paradox's other
            door). Back to a liquid-glass pill, de-ranked via weight/tone
            rather than via scale. */}
        <div className="w-full max-w-[380px] mt-2">
          <button
            type="button"
            onClick={() => navigate("/playbook")}
            className={cn(buttonBase, "liquid-glass", "font-medium")}
            style={{
              color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
              textShadow:
                "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
            }}
          >
            See the exact playbook
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybookHero;
