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
        !isDisabled && "motion-safe:animate-pulse-slow",
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
