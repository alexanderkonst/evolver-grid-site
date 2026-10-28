/**
 * JourneySlice — a UBB artifact screen as a Journey module (WP-9, J6 and J7).
 * Design: docs/02-strategy/game_of_being_you.md §14.4, §14.8 row WP-9.
 *
 *   no artifact yet  →  ModuleIntro (one button)  →  the existing screen (children)
 *   Lock & Continue  →  ModuleOutro (ritual, 1–10)  →  /village
 *
 * A player who already has the artifact goes straight to the screen, as before, and a
 * locked artifact on arrival is not a new victory. The screen itself is untouched.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import ModuleIntro from "@/components/game/ModuleIntro";
import ModuleOutro from "@/components/game/ModuleOutro";
import type { JourneyModuleDef } from "@/data/journeyModules";
import { useUniqueBusiness } from "./UniqueBusinessContext";
import { firstSlicePhase, lockedHere, slicePhrase, type SlicePhase } from "./journeySlices";
import type { ArtifactKey } from "./types";

type Props = {
  artifactKey: ArtifactKey;
  module: JourneyModuleDef;
  /** The existing UBB screen for this artifact. */
  children: ReactNode;
};

export default function JourneySlice({ artifactKey, module, children }: Props) {
  const { artifacts, isInitializing } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const hasArtifact = !!state?.latest;
  const isLocked = !!state?.latestLocked;
  const [phase, setPhase] = useState<SlicePhase | null>(null);
  const sawUnlocked = useRef(false);

  useEffect(() => {
    if (isInitializing) return;
    if (phase === null) {
      sawUnlocked.current = !isLocked;
      setPhase(firstSlicePhase(hasArtifact));
      return;
    }
    if (!isLocked) sawUnlocked.current = true;
    else if (lockedHere(phase, sawUnlocked.current, isLocked)) setPhase("outro");
  }, [isInitializing, phase, hasArtifact, isLocked]);

  // Loading: the screen's own skeleton. Between load and the first phase, nothing, so the
  // empty «Generate» state never flashes before the Intro.
  if (phase === null) return isInitializing ? <>{children}</> : null;

  if (phase === "intro") return <ModuleIntro module={module} onStart={() => setPhase("screen")} />;

  if (phase === "outro") {
    return <ModuleOutro module={module} result={slicePhrase(artifactKey, state?.latestLocked?.content)} />;
  }

  return <>{children}</>;
}
