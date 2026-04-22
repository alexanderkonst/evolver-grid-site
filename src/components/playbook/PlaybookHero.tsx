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
        {/* Primary CTA — heavy Apple Liquid Glass, no arrow, normal case. */}
        <div className="w-full max-w-[380px]">
          <button
            type="button"
            onClick={() => navigate("/zone-of-genius")}
            className={cn(buttonBase, "liquid-glass-strong")}
            style={{
              color: "#0a1628",
              textShadow: "0 1px 2px rgba(255,255,255,0.75)",
            }}
          >
            Find your top talent
          </button>
        </div>

        {/* Meta line — Day 47 iter 10 (Sasha + GFOA v2.0):
            "Claim your gift · takes two minutes" → "Takes 2 minutes. No signup."
            Sharper, no ask, removes friction anxiety up front. */}
        <div
          className="text-xs inline-flex items-center justify-center gap-2 max-w-[460px]"
          style={{
            color: "rgba(26,30,58,0.65)",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          <span aria-hidden="true">↑</span>
          <span>Takes 2 minutes. No signup.</span>
        </div>

        {/* Secondary — lighter Apple Liquid Glass, no arrow. */}
        <div className="w-full max-w-[380px]">
          <button
            type="button"
            onClick={() => navigate("/playbook")}
            className={cn(buttonBase, "liquid-glass", "font-medium")}
            style={{
              color: "rgba(26,30,58,0.85)",
              textShadow: "0 1px 2px rgba(255,255,255,0.6)",
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
