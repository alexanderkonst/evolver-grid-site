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
  "specificity-matrix": "specificity_matrix",
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
            className="bg-[#0b2641] text-white hover:bg-[#16385c] disabled:bg-[#0b2641]/40 disabled:text-white/60"
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

// Day 51 (Sasha 2026-04-25): renderValue extracted as recursive helper so
// arrays render as bullet lists and nested objects get nested labeled blocks
// instead of raw JSON.stringify dump. Was: a value object showed as
// {"attack": "..."} JSON; now: clean nested presentation.
function renderValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return <span className="text-muted-foreground">(empty)</span>;
  if (typeof v === "string") {
    return <span className="whitespace-pre-wrap">{v}</span>;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return <span>{String(v)}</span>;
  }
  if (Array.isArray(v)) {
    // Array of strings → bullet list. Array of objects → nested cards.
    const allStrings = v.every((x) => typeof x === "string");
    if (allStrings) {
      return (
        <ul className="list-disc space-y-1 pl-5">
          {v.map((s, i) => (
            <li key={i} className="leading-relaxed">{s as string}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="space-y-2">
        {v.map((x, i) => (
          <div key={i} className="rounded border border-border/40 p-2">
            {renderValue(x)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k}>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {k.replace(/[_-]+/g, " ")}
            </div>
            <div className="mt-0.5 text-sm leading-relaxed">{renderValue(val)}</div>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(v)}</span>;
}

function ArtifactContentView({ content }: { content: unknown }) {
  if (content === null || content === undefined) {
    return <div className="text-sm text-muted-foreground">(empty)</div>;
  }
  if (typeof content === "string") {
    return <div className="whitespace-pre-wrap text-base leading-relaxed">{content}</div>;
  }
  // Specificity Matrix has its own table layout
  if (isSpecificityMatrix(content)) {
    return <SpecificityMatrixView content={content} />;
  }
  // Render JSON object with keys as labeled blocks; values use recursive renderer
  if (typeof content === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {/* Handle both underscore AND hyphen separators — AI sometimes
                  returns "why_this-names_it" mixed; now clean uppercase
                  display regardless of separator. */}
              {k.replace(/[_-]+/g, " ")}
            </div>
            <div className="mt-1 text-sm leading-relaxed">
              {renderValue(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="text-sm">{String(content)}</div>;
}

// ─── Specificity Matrix renderer ─────────────────────────────────
//
// Day 51 (Sasha 2026-04-25): the Specificity Matrix is a content
// shape unique to one artifact (specificity_matrix). It needs a
// table layout (6 stages × 3 tiers) instead of the generic key:value
// dump that other artifacts use. Detection is structural — we look
// for a `stages` object whose values match the {resonant, partial, off}
// triple. This avoids binding the renderer to any artifact_key, so
// future per-funnel matrices with different stage sets still render.

type MatrixStageRow = { resonant: string; partial: string; off: string };
type MatrixContent = {
  stages: Record<string, MatrixStageRow>;
  meta_question?: string;
  voice_signature?: string;
};

function isSpecificityMatrix(content: unknown): content is MatrixContent {
  if (!content || typeof content !== "object") return false;
  const c = content as Record<string, unknown>;
  if (!c.stages || typeof c.stages !== "object") return false;
  const stages = Object.values(c.stages as Record<string, unknown>);
  if (stages.length === 0) return false;
  return stages.every((row) => {
    if (!row || typeof row !== "object") return false;
    const r = row as Record<string, unknown>;
    return typeof r.resonant === "string" && typeof r.partial === "string" && typeof r.off === "string";
  });
}

function SpecificityMatrixView({ content }: { content: MatrixContent }) {
  return (
    <div className="space-y-5">
      {content.meta_question && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            The question every reveal asks beneath the words
          </div>
          <div className="mt-1 italic text-sm leading-relaxed">{content.meta_question}</div>
        </div>
      )}
      {content.voice_signature && (
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Voice signature</div>
          <div className="mt-1 text-sm leading-relaxed">{content.voice_signature}</div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2 font-medium">Stage</th>
              <th className="px-3 py-2 font-medium">Resonant (8–10)</th>
              <th className="px-3 py-2 font-medium">Partial (5–7)</th>
              <th className="px-3 py-2 font-medium">Off (1–4)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(content.stages).map(([stage, row]) => (
              <tr key={stage} className="border-b align-top last:border-b-0">
                <td className="px-3 py-3 font-medium uppercase tracking-wider text-xs text-muted-foreground">
                  {stage}
                </td>
                <td className="px-3 py-3 italic leading-relaxed">{row.resonant}</td>
                <td className="px-3 py-3 italic leading-relaxed text-muted-foreground">{row.partial}</td>
                <td className="px-3 py-3 italic leading-relaxed text-muted-foreground">{row.off}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
