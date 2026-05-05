/**
 * ImproveButton — the ceremonial trigger for the 27-perspective roast.
 *
 * Day 53 (Sasha 2026-04-27): re-skinned to the landing-page CTA register.
 * Pressing Improve is the most consequential act in UBB — the AI is
 * about to roast and rewrite a piece of the founder's life-work. The
 * button now reflects that weight: liquid-glass-dark navy body, gold
 * halo, ✦ instead of the lightning bolt, Cormorant uppercase tracking.
 * Loading state pulses the same gold rather than spinning a generic
 * loader — the wait IS the rite.
 *
 * States: idle (subtle shimmer) / hover (bright gold ring) / loading
 * (gold halo pulse) / disabled (muted, no glow).
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import type { ArtifactKey } from "../types";

type Props = {
  artifactKey: ArtifactKey;
  disabled?: boolean;
  className?: string;
  size?: "default" | "lg";
};

export function ImproveButton({ artifactKey, disabled, className, size = "lg" }: Props) {
  const { improveArtifact, isImproving, artifacts } = useUniqueBusiness();
  const thisIsImproving = isImproving === artifactKey;
  const anyImproving = isImproving !== null;
  const hasContent = !!artifacts[artifactKey]?.latest;

  const atCeiling = (artifacts[artifactKey]?.latest?.specificity_score ?? 0) >= 10;
  const isDisabled = disabled || thisIsImproving || anyImproving || !hasContent || atCeiling;

  const padding = size === "lg" ? "px-6 py-3" : "px-5 py-2.5";

  return (
    <button
      onClick={() => improveArtifact(artifactKey)}
      disabled={isDisabled}
      aria-busy={thisIsImproving}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 rounded-full transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/60 focus-visible:ring-offset-2",
        padding,
        isDisabled
          ? "cursor-not-allowed opacity-50"
          : "hover:translate-y-[-1px] active:translate-y-0",
        className,
      )}
      style={{
        background: isDisabled
          ? "linear-gradient(135deg, rgba(10,22,40,0.42) 0%, rgba(18,28,56,0.38) 100%)"
          : "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
        color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
        border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
        boxShadow: isDisabled
          ? "none"
          : "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28), 0 10px 24px -10px rgba(10, 22, 40, 0.55))",
        textShadow:
          "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28), 0 1px 2px rgba(0,0,0,0.35))",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
      }}
    >
      {thisIsImproving ? (
        <>
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }}
          />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: size === "lg" ? "14px" : "12.5px",
            }}
          >
            Roasting…
          </span>
        </>
      ) : (
        <>
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{
              color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
              textShadow:
                "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8), 0 0 4px rgba(212,175,55,0.9))",
              fontSize: size === "lg" ? "16px" : "14px",
            }}
          >
            ✦
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: size === "lg" ? "14px" : "12.5px",
            }}
          >
            Improve
          </span>
        </>
      )}
    </button>
  );
}
