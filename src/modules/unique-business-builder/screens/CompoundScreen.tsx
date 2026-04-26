/**
 * CompoundScreen — renders multiple sub-artifacts on one screen.
 *
 * Used for:
 *   /ubb/session         → [session_bridge]
 *   /ubb/marketing       → [core_belief, packaging, frictionless_purchase]
 *   /ubb/distribution    → [reach, delivery, spread]
 *   /ubb/communications  → [surface_inventory, tuning_fork, golden_dm]
 */

import { useLocation, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { ImproveButton } from "../components/ImproveButton";
import { SpecificityBadge } from "../components/SpecificityBadge";
import { ARTIFACT_LABELS, UBB_ROOT } from "../constants";
import { COMPOUND_GROUPING, type ArtifactKey, type CompoundScreenKey } from "../types";

const SLUG_TO_COMPOUND: Record<string, CompoundScreenKey> = {
  session: "session",
  marketing: "marketing",
  distribution: "distribution",
  communications: "communications",
};

const COMPOUND_TITLES: Record<CompoundScreenKey, { title: string; subtitle: string }> = {
  session: {
    title: "1st Session Design",
    subtitle:
      "Transformational Result → Trinity of Sub-Results → 1st Session that delivers guaranteed wins without overwhelm.",
  },
  marketing: {
    title: "Marketing — 3 Pillars",
    subtitle: "Core Belief · Packaging · Frictionless Purchase.",
  },
  distribution: {
    title: "Distribution — 3 Pillars",
    subtitle: "Reach · Delivery · Spread.",
  },
  communications: {
    title: "Communications",
    subtitle: "Surface Inventory · Tuning Fork · Golden DM.",
  },
};

export default function CompoundScreen() {
  const location = useLocation();
  const slug = location.pathname.split("/").pop() || "";
  const compound = SLUG_TO_COMPOUND[slug];

  if (!compound) {
    return (
      <div className="py-12 text-center">
        <div className="text-sm text-muted-foreground">Unknown section: {slug}</div>
        <Button asChild variant="outline" className="mt-4">
          <Link to={UBB_ROOT}>Back to Canvas</Link>
        </Button>
      </div>
    );
  }

  const subKeys = COMPOUND_GROUPING[compound];
  const meta = COMPOUND_TITLES[compound];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
      </header>

      <div className="space-y-4">
        {subKeys.map((key) => (
          <SubArtifactCard key={key} artifactKey={key} />
        ))}
      </div>
    </div>
  );
}

function SubArtifactCard({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts, generateArtifact, isGenerating, updateArtifactScore } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const latest = state?.latest;
  const thisIsGenerating = isGenerating === artifactKey;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">{ARTIFACT_LABELS[artifactKey]}</h2>
            {latest && (
              <SpecificityBadge
                score={latest.specificity_score}
                size="sm"
                onScoreChange={state?.latestLocked ? undefined : (s) => updateArtifactScore(artifactKey, s)}
              />
            )}
          </div>
          {latest && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              v{latest.version} · {state?.versionCount} version{state?.versionCount === 1 ? "" : "s"}
              {state?.latestLocked && <span className="ml-2 text-emerald-600">● locked</span>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        {!latest ? (
          <div className="py-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">Not generated yet.</p>
            <Button
              size="sm"
              onClick={() => generateArtifact(artifactKey)}
              disabled={thisIsGenerating}
              className="bg-[#0b2641] text-white hover:bg-[#16385c] disabled:bg-[#0b2641]/40 disabled:text-white/60"
            >
              {thisIsGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                `Generate ${ARTIFACT_LABELS[artifactKey]}`
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-md bg-muted/30 p-3">
              <CompactContent content={latest.content} />
            </div>
            <div className="flex items-center justify-end">
              <ImproveButton artifactKey={artifactKey} size="default" />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// Day 51 (Sasha 2026-04-25): recursive renderer — was rendering nested
// objects/arrays as raw JSON via JSON.stringify, which made compound
// artifacts (session/marketing/distribution/communications) unreadable.
function renderCompactValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return <span className="text-muted-foreground">(empty)</span>;
  if (typeof v === "string") return <span className="whitespace-pre-wrap">{v}</span>;
  if (typeof v === "number" || typeof v === "boolean") return <span>{String(v)}</span>;
  if (Array.isArray(v)) {
    const allStrings = v.every((x) => typeof x === "string");
    if (allStrings) {
      return (
        <ul className="list-disc space-y-0.5 pl-5">
          {v.map((s, i) => <li key={i}>{s as string}</li>)}
        </ul>
      );
    }
    return (
      <div className="space-y-1.5">
        {v.map((x, i) => (
          <div key={i} className="rounded border border-border/40 p-1.5">
            {renderCompactValue(x)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k}>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {k.replace(/[_-]+/g, " ")}:
            </span>{" "}
            <span className="text-xs">{renderCompactValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(v)}</span>;
}

function CompactContent({ content }: { content: unknown }) {
  if (content === null || content === undefined) return <span className="text-sm text-muted-foreground">(empty)</span>;
  if (typeof content === "string") return <div className="whitespace-pre-wrap text-sm">{content}</div>;
  if (typeof content === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.replace(/[_-]+/g, " ")}: </span>
            <span className="text-sm">{renderCompactValue(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-sm">{String(content)}</span>;
}
