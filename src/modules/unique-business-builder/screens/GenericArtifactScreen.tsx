/**
 * GenericArtifactScreen — a single artifact view.
 *
 * Used for uniqueness, myth, tribe, pain, promise, lead_magnet, value_ladder,
 * landing_page. Gets artifact_key from the route.
 *
 * Phase B (session) and Phase C (marketing/distribution/communications) use
 * a separate CompoundScreen to stack multiple sub-artifacts.
 */

import { useLocation, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { ImproveButton } from "../components/ImproveButton";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { ARTIFACT_LABELS, UBB_ROOT, ARTIFACT_URL_SLUGS } from "../constants";
import { ALL_ARTIFACT_KEYS } from "../types";
import type { ArtifactKey } from "../types";

// Map URL slug → artifact_key (reverse of ARTIFACT_URL_SLUGS, excluding compound slugs)
const SLUG_TO_KEY: Record<string, ArtifactKey> = {
  uniqueness: "uniqueness",
  myth: "myth",
  tribe: "tribe",
  pain: "pain",
  promise: "promise",
  "lead-magnet": "lead_magnet",
  "value-ladder": "value_ladder",
  "landing-page": "landing_page",
};

export default function GenericArtifactScreen() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop() || "";
  const artifactKey = SLUG_TO_KEY[slug];

  if (!artifactKey) {
    return (
      <div className="py-12 text-center">
        <div className="text-sm text-muted-foreground">Unknown artifact: {slug}</div>
        <Button asChild variant="outline" className="mt-4">
          <Link to={UBB_ROOT}>Back to Canvas</Link>
        </Button>
      </div>
    );
  }

  return <ArtifactView artifactKey={artifactKey} />;
}

export function ArtifactView({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts, generateArtifact, isGenerating, lockArtifact, unlockArtifact } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const latest = state?.latest;
  const isLocked = !!state?.latestLocked;
  const thisIsGenerating = isGenerating === artifactKey;

  const nextKey = findNextUnlocked(artifactKey, artifacts);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{ARTIFACT_LABELS[artifactKey]}</h1>

      {!latest ? (
        <Card className="space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing here yet. Generate your first version to start iterating.
          </p>
          <Button
            size="lg"
            onClick={() => generateArtifact(artifactKey)}
            disabled={thisIsGenerating}
          >
            {thisIsGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>Generate {ARTIFACT_LABELS[artifactKey]}</>
            )}
          </Button>
        </Card>
      ) : (
        <>
          <Card className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  v{latest.version} · {state?.versionCount} version{state?.versionCount === 1 ? "" : "s"}
                </div>
                <div className="mt-2">
                  <ArtifactContentView content={latest.content} />
                </div>
              </div>
              <SpecificityBadge score={latest.specificity_score} />
            </div>
          </Card>

          <div className="flex items-center justify-between gap-2">
            <ImproveButton artifactKey={artifactKey} />
            {!isLocked ? (
              <Button variant="outline" onClick={() => lockArtifact(artifactKey)}>
                Lock & Continue →
              </Button>
            ) : nextKey ? (
              <Button asChild>
                <Link to={`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[nextKey]}`}>
                  Continue to {ARTIFACT_LABELS[nextKey]} →
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to={`${UBB_ROOT}/dossier`}>Open Dossier →</Link>
              </Button>
            )}
          </div>

          {isLocked && (
            <div className="text-center">
              <button
                onClick={() => unlockArtifact(artifactKey)}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Unlock to improve again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArtifactContentView({ content }: { content: unknown }) {
  if (content === null || content === undefined) {
    return <div className="text-sm text-muted-foreground">(empty)</div>;
  }
  if (typeof content === "string") {
    return <div className="whitespace-pre-wrap text-base leading-relaxed">{content}</div>;
  }
  // Render JSON object with keys as simple labeled blocks
  if (typeof content === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {k.replace(/_/g, " ")}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
              {typeof v === "string" ? v : JSON.stringify(v, null, 2)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="text-sm">{String(content)}</div>;
}

function findNextUnlocked(
  after: ArtifactKey,
  artifacts: Partial<Record<ArtifactKey, { latestLocked: unknown }>>
): ArtifactKey | null {
  const idx = ALL_ARTIFACT_KEYS.indexOf(after);
  for (let i = idx + 1; i < ALL_ARTIFACT_KEYS.length; i++) {
    const k = ALL_ARTIFACT_KEYS[i];
    if (!artifacts[k]?.latestLocked) return k;
  }
  return null;
}
