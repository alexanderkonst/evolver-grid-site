/**
 * LandingPageScreen — the public-facing sales page artifact (Phase D).
 *
 * Improvable + versioned like every artifact, with an additional Publish
 * action that snapshots the current version into `unique_business_dossiers`.
 *
 * Day 53 (Sasha 2026-04-27): publish panel re-skinned to match the
 * landing/playbook editorial register. Cormorant headline, ceremonial
 * gold-haloed Publish CTA, illuminated success URL row. The artifact
 * body itself is rendered by ArtifactView (already reskinned in
 * GenericArtifactScreen on Day 53 morning).
 */

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
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
      const url = `${window.location.origin}/page/${result.slug}`;
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
    <div className="space-y-6">
      <ArtifactView artifactKey="landing_page" />

      {hasContent && (
        <div
          className="mx-auto max-w-3xl space-y-4 rounded-2xl px-5 py-5"
          style={{
            background: "var(--skin-card-bg, rgba(255, 255, 255, 0.68))",
            border: "0.5px solid rgba(212, 175, 55, 0.45)",
            boxShadow:
              "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "20px",
                  letterSpacing: "-0.005em",
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                Publish this version
              </div>
              <p
                className="mt-1"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontStyle: "italic",
                  fontSize: "13.5px",
                  lineHeight: 1.5,
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                }}
              >
                Makes the current landing page readable at a public URL.
                {!isLocked && " Tip: lock first if you want this version to feel final."}
              </p>
            </div>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !hasContent}
              className="group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
                color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
                border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
                boxShadow:
                  "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
                backdropFilter: "blur(14px) saturate(160%)",
                WebkitBackdropFilter: "blur(14px) saturate(160%)",
              }}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--skin-cta-icon)" }} />
                  <span style={ceremonialLabel}>Publishing…</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true" style={ceremonialIcon}>✦</span>
                  <span style={ceremonialLabel}>
                    Publish v{landing?.latest?.version ?? "?"}
                  </span>
                </>
              )}
            </button>
          </div>

          {publishedUrl && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(212, 175, 55, 0.08)",
                border: "0.5px solid rgba(212, 175, 55, 0.45)",
                boxShadow: "inset 0 0 12px -4px rgba(244, 212, 114, 0.30)",
              }}
            >
              <code
                className="flex-1 truncate"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "12px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                {publishedUrl}
              </code>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors duration-200 hover:bg-white/30"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full px-3 py-1 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  background: "rgba(255, 255, 255, 0.68)",
                  border: "0.5px solid rgba(212, 175, 55, 0.55)",
                }}
              >
                Open ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Ceremonial typography presets ──────────────────────────────── */

const ceremonialLabel: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "13px",
  textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
};

const ceremonialIcon: React.CSSProperties = {
  color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
  textShadow: "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8))",
  fontSize: "16px",
};
