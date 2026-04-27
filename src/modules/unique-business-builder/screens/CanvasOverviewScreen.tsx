/**
 * CanvasOverviewScreen — entry screen of v2.0.
 *
 * Lists all 18 artifacts grouped by phase, each with specificity + version count + lock state.
 * CTA: continue with the next unlocked artifact.
 */

import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleDashed, Circle, CheckCircle2, BookOpen } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { SpecificityBadge } from "../components/SpecificityBadge";
import {
  ALL_ARTIFACT_KEYS,
  PHASE_A_CANVAS,
  PHASE_B_SESSION,
  PHASE_C_MARKET,
  PHASE_D_PUBLICATION,
} from "../types";
import { ARTIFACT_LABELS, ARTIFACT_URL_SLUGS, UBB_ROOT, ROUTES } from "../constants";
import type { ArtifactKey } from "../types";
import { getStepForArtifact } from "@/data/playbookArtifactMap";

export default function CanvasOverviewScreen() {
  const { artifacts, lockedCount, avgSpecificity, stalenessWarnings } = useUniqueBusiness();
  const navigate = useNavigate();

  // Find first unlocked artifact
  const firstUnlocked = ALL_ARTIFACT_KEYS.find((k) => !artifacts[k]?.latestLocked) as
    | ArtifactKey
    | undefined;

  return (
    // Day 52 (Sasha 2026-04-26): max-w-5xl + mx-auto so the canvas grid
    // doesn't sprawl across ultra-wide pane 3. Inner phase grids cap at
    // 3 columns; this width keeps them scannable.
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero summary */}
      <section className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Your Unique Business Canvas</h1>
        <p className="text-sm text-muted-foreground">
          18 artifacts. Press Improve on each until specificity feels enough. Every improvement becomes a new version — nothing is ever lost.
        </p>
        <div className="flex items-center gap-4 pt-2">
          <div className="text-sm">
            <span className="font-medium">{lockedCount}</span>
            <span className="text-muted-foreground"> of 18 locked</span>
          </div>
          {avgSpecificity > 0 && (
            <div className="text-sm text-muted-foreground">
              avg specificity <span className="font-medium text-foreground">{avgSpecificity.toFixed(1)}</span>
            </div>
          )}
        </div>
      </section>

      {stalenessWarnings.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-50/30 p-4 dark:bg-amber-900/10">
          <div className="text-sm font-medium">Some artifacts may be stale</div>
          <ul className="mt-1 text-xs text-muted-foreground">
            {stalenessWarnings.map((w) => (
              <li key={w.artifact}>
                • {ARTIFACT_LABELS[w.artifact]} — {w.reason}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Phase A — Canvas */}
      <PhaseSection title="Canvas" keys={PHASE_A_CANVAS as readonly ArtifactKey[]} />

      {/* Phase B — Session bridge */}
      <PhaseSection title="Session Bridge" keys={PHASE_B_SESSION as readonly ArtifactKey[]} />

      {/* Phase C — Market path */}
      <PhaseSection title="Market Path" keys={PHASE_C_MARKET as readonly ArtifactKey[]} />

      {/* Phase D — Publication */}
      <PhaseSection title="Publication" keys={PHASE_D_PUBLICATION as readonly ArtifactKey[]} />

      {/* Dossier card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Your Dossier</div>
            <div className="text-xs text-muted-foreground">
              Composed overview of all 18 artifacts. {lockedCount === 18 ? "Ready to publish." : `${18 - lockedCount} more to lock first.`}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to={ROUTES.dossier}>Open Dossier</Link>
          </Button>
        </div>
      </Card>

      {/* CTA */}
      {firstUnlocked && (
        <div className="pt-4">
          <Button
            size="lg"
            onClick={() => navigate(`${UBB_ROOT}/${ARTIFACT_URL_SLUGS[firstUnlocked]}`)}
          >
            Continue with {ARTIFACT_LABELS[firstUnlocked]} →
          </Button>
        </div>
      )}
    </div>
  );
}

function PhaseSection({ title, keys }: { title: string; keys: readonly ArtifactKey[] }) {
  // Day 51 (Sasha 2026-04-25): show ALL Playbook steps this phase spans.
  // Phase A (Canvas) actually spans Step 3 (foundation: uniqueness/myth/
  // tribe/pain/promise) AND Step 4 (productization: lead_magnet/
  // value_ladder/specificity_matrix). Showing only the first step misled —
  // now we render one chip per unique step in display order.
  const stepLinks = (() => {
    const seen = new Set<number>();
    const out: { slug: string; number: number; appName: string }[] = [];
    for (const k of keys) {
      const s = getStepForArtifact(k);
      if (s && !seen.has(s.number)) {
        seen.add(s.number);
        out.push(s);
      }
    }
    return out.sort((a, b) => a.number - b.number);
  })();

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h2>
        {stepLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {stepLinks.map((sl) => (
              <Link
                key={sl.number}
                to={`/playbook/${sl.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={`This phase implements Playbook Step ${sl.number} — ${sl.appName}`}
              >
                <BookOpen className="h-3 w-3" aria-hidden="true" />
                Step {sl.number} · {sl.appName}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {keys.map((k) => (
          <ArtifactCard key={k} artifactKey={k} />
        ))}
      </div>
    </section>
  );
}

function ArtifactCard({ artifactKey }: { artifactKey: ArtifactKey }) {
  const { artifacts } = useUniqueBusiness();
  const state = artifacts[artifactKey];
  const hasLatest = !!state?.latest;
  const isLocked = !!state?.latestLocked;
  const latestSpec = state?.latest?.specificity_score;

  const href = `${UBB_ROOT}/${ARTIFACT_URL_SLUGS[artifactKey]}`;

  return (
    <Link
      to={href}
      className="group block rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <StateIcon hasLatest={hasLatest} isLocked={isLocked} />
            <div className="truncate text-sm font-medium">{ARTIFACT_LABELS[artifactKey]}</div>
          </div>
          {state?.versionCount ? (
            <div className="mt-0.5 text-xs text-muted-foreground">
              v{state.latest?.version ?? 1} · {state.versionCount} version{state.versionCount === 1 ? "" : "s"}
            </div>
          ) : (
            <div className="mt-0.5 text-xs text-muted-foreground">Not started</div>
          )}
        </div>
        {typeof latestSpec === "number" && latestSpec > 0 && (
          <SpecificityBadge score={latestSpec} size="sm" />
        )}
      </div>
    </Link>
  );
}

function StateIcon({ hasLatest, isLocked }: { hasLatest: boolean; isLocked: boolean }) {
  if (isLocked) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (hasLatest) return <Circle className="h-3.5 w-3.5 fill-blue-500/20 text-blue-600" />;
  return <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />;
}
