/**
 * LandingPageScreen — the public-facing sales page artifact.
 *
 * Improvable + versioned like every artifact, with an additional Publish action
 * that snapshots the current version into `unique_business_dossiers`.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { ArtifactView } from "./GenericArtifactScreen";
import { useUniqueBusiness } from "../UniqueBusinessContext";

export default function LandingPageScreen() {
  const { artifacts, publishLandingPage } = useUniqueBusiness();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const landing = artifacts.landing_page;
  const hasContent = !!landing?.latest;
  const isLocked = !!landing?.latestLocked;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await publishLandingPage();
      const url = `${window.location.origin}/ubl/${result.slug}`;
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

  return (
    <div className="space-y-4">
      <ArtifactView artifactKey="landing_page" />

      {hasContent && (
        <Card className="mx-auto max-w-2xl space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Publish this version</h2>
              <p className="text-xs text-muted-foreground">
                Makes the current landing page readable at a public URL.
                {!isLocked && " Tip: lock first if you want this version to feel final."}
              </p>
            </div>
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !hasContent}
              className="gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Publish v{landing?.latest?.version ?? "?"}
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
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                  Open ↗
                </a>
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
