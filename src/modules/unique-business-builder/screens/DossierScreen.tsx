/**
 * DossierScreen — composed view of all 18 artifacts at their latest-locked versions.
 *
 * Auto-composed from state (not improved directly).
 * Publish action is stubbed for Phase 4 continuation.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Copy, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { ARTIFACT_LABELS, UBB_ROOT, ARTIFACT_URL_SLUGS, phaseOf, PHASE_LABELS } from "../constants";
import { ALL_ARTIFACT_KEYS } from "../types";
import type { ArtifactKey } from "../types";

export default function DossierScreen() {
  const { artifacts, lockedCount, avgSpecificity, publishDossier } = useUniqueBusiness();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await publishDossier();
      const url = `${window.location.origin}/ubd/${result.slug}`;
      setPublishedUrl(url);
    } catch (e: any) {
      toast.error(e?.message || "Publish failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopy = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      toast.success("URL copied.");
    }
  };

  const byPhase: Record<string, ArtifactKey[]> = {};
  for (const key of ALL_ARTIFACT_KEYS) {
    const p = phaseOf(key);
    byPhase[p] = byPhase[p] || [];
    byPhase[p].push(key);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your Unique Business Dossier</h1>
        <p className="text-sm text-muted-foreground">
          {lockedCount} of 18 locked · avg specificity {avgSpecificity.toFixed(1)}
        </p>
      </header>

      {lockedCount < 18 && (
        <Card className="border-amber-500/40 bg-amber-50/30 p-4 text-sm dark:bg-amber-900/10">
          {18 - lockedCount} artifact{18 - lockedCount === 1 ? "" : "s"} not yet locked. Gaps are shown below — finish them before publishing.
        </Card>
      )}

      {(Object.keys(PHASE_LABELS) as Array<keyof typeof PHASE_LABELS>).map((phase) => {
        const keys = byPhase[phase] || [];
        if (keys.length === 0) return null;
        return (
          <section key={phase} className="space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {PHASE_LABELS[phase]}
            </h2>
            <div className="space-y-3">
              {keys.map((k) => (
                <DossierRow key={k} artifactKey={k} />
              ))}
            </div>
          </section>
        );
      })}

      <Card className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">Publish this Dossier</h2>
            <p className="text-xs text-muted-foreground">
              Creates a shareable snapshot of your current 18 artifacts.
            </p>
          </div>
          <Button onClick={handlePublish} disabled={isPublishing || lockedCount === 0} className="gap-2">
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Publish Dossier
              </>
            )}
          </Button>
        </div>
        {publishedUrl && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-50/40 p-3 dark:bg-emerald-900/10">
            <code className="flex-1 text-xs">{publishedUrl}</code>
            <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-1">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer">Open ↗</a>
            </Button>
          </div>
        )}
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link to={UBB_ROOT}>← Back to Canvas</Link>
        </Button>
      </div>
    </div>
  );
}

function DossierRow({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const locked = state?.latestLocked;

  if (!locked) {
    return (
      <Card className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium">{ARTIFACT_LABELS[artifactKey]}</div>
          <div className="mt-0.5 text-xs text-amber-600">Gap — not yet locked.</div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[artifactKey]}`}>Start</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">{ARTIFACT_LABELS[artifactKey]}</div>
            <SpecificityBadge score={locked.specificity_score} size="sm" />
          </div>
          <div className="mt-2 text-sm">
            <CompactDossierContent content={locked.content} />
          </div>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[artifactKey]}`}>Edit</Link>
        </Button>
      </div>
    </Card>
  );
}

function CompactDossierContent({ content }: { content: unknown }) {
  if (content === null || content === undefined) return null;
  if (typeof content === "string") return <div className="whitespace-pre-wrap">{content}</div>;
  if (typeof content === "object") {
    const entries = Object.entries(content as Record<string, unknown>);
    return (
      <div className="space-y-1 text-sm">
        {entries.slice(0, 4).map(([k, v]) => (
          <div key={k}>
            {/* Day 51 (Sasha 2026-04-25): handle hyphen+underscore separators
                + render arrays/objects compactly instead of raw JSON. */}
            <span className="text-xs text-muted-foreground">{k.replace(/[_-]+/g, " ")}: </span>
            {typeof v === "string"
              ? v
              : Array.isArray(v) && v.every((x) => typeof x === "string")
                ? <span className="text-xs">{v.join(" · ")}</span>
                : <code className="text-xs">{JSON.stringify(v).slice(0, 120)}</code>}
          </div>
        ))}
        {entries.length > 4 && (
          <div className="text-xs text-muted-foreground">+ {entries.length - 4} more field{entries.length - 4 === 1 ? "" : "s"}</div>
        )}
      </div>
    );
  }
  return <span>{String(content)}</span>;
}
