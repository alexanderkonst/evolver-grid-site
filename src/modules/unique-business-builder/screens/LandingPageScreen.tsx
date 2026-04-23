/**
 * LandingPageScreen — the public-facing sales page artifact.
 *
 * Improvable + versioned like every artifact, with an additional Publish action
 * that snapshots the current version into `unique_business_dossiers`.
 *
 * Publish action is stubbed for Phase 4 continuation.
 */

import { ArtifactView } from "./GenericArtifactScreen";

export default function LandingPageScreen() {
  return (
    <div className="space-y-4">
      <ArtifactView artifactKey="landing_page" />
      <div className="mx-auto max-w-2xl rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        Publish flow arrives with Phase 4 continuation — current version is
        improvable and versioned already.
      </div>
    </div>
  );
}
