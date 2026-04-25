/**
 * ImproveButton — the one-button trigger for the 27-perspective roast.
 *
 * States: idle (subtle pulse) / hover / active / loading (spinner) / disabled.
 * Honors prefers-reduced-motion.
 */

import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
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

  const isDisabled = disabled || thisIsImproving || anyImproving || !hasContent;

  return (
    <Button
      onClick={() => improveArtifact(artifactKey)}
      disabled={isDisabled}
      size={size}
      className={cn(
        "group relative gap-2 font-medium",
        // Day 51 (Sasha 2026-04-25): retired motion-safe:animate-pulse-slow —
        // Tailwind's pulse oscillates opacity to 0.5, dragging button text
        // into illegibility on light skins. If we want attention later, use
        // a box-shadow pulse so text stays at full opacity.
        className
      )}
      aria-busy={thisIsImproving}
    >
      {thisIsImproving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Improving…
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" />
          Improve
        </>
      )}
    </Button>
  );
}
