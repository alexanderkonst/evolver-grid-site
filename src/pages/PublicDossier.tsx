/**
 * PublicDossier — world-readable Dossier page served at /ubd/:slug.
 *
 * Fetches the frozen artifact_snapshot from unique_business_dossiers,
 * renders all 18 artifacts grouped by phase.
 * Read-access allowed for anonymous users via RLS ("public view live dossiers").
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type DossierRow = {
  id: string;
  slug: string;
  title: string;
  artifact_snapshot: Record<string, { version: number; content: unknown; specificity_score: number }>;
  specificity_avg: number;
  published_at: string;
  is_live: boolean;
};

const PHASE_LABELS: Record<string, string> = {
  canvas: "Canvas",
  session: "Session Bridge",
  marketing: "Marketing",
  distribution: "Distribution",
  communications: "Communications",
  publication: "Publication",
};

const ARTIFACT_LABELS: Record<string, string> = {
  uniqueness: "Uniqueness",
  myth: "Myth",
  tribe: "Tribe",
  pain: "Pain",
  promise: "Promise",
  lead_magnet: "Lead Magnet",
  value_ladder: "Value Ladder",
  specificity_matrix: "Specificity Matrix",
  session_bridge: "1st Session Design",
  core_belief: "Core Belief",
  packaging: "Packaging",
  frictionless_purchase: "Frictionless Purchase",
  reach: "Reach",
  delivery: "Delivery",
  spread: "Spread",
  surface_inventory: "Surface Inventory",
  tuning_fork: "Tuning Fork",
  golden_dm: "Golden DM",
  landing_page: "Landing Page",
};

const PHASE_OF: Record<string, string> = {
  uniqueness: "canvas", myth: "canvas", tribe: "canvas", pain: "canvas",
  promise: "canvas", lead_magnet: "canvas", value_ladder: "canvas",
  session_bridge: "session",
  core_belief: "marketing", packaging: "marketing", frictionless_purchase: "marketing",
  reach: "distribution", delivery: "distribution", spread: "distribution",
  surface_inventory: "communications", tuning_fork: "communications", golden_dm: "communications",
  landing_page: "publication",
};

const PHASE_ORDER = ["canvas", "session", "marketing", "distribution", "communications", "publication"];

export default function PublicDossier() {
  const { slug } = useParams<{ slug: string }>();
  const [dossier, setDossier] = useState<DossierRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("unique_business_dossiers")
        .select("*")
        .eq("slug", slug)
        .eq("is_live", true)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setDossier(data as DossierRow);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (notFound || !dossier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium">Dossier not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dossier may have been unpublished or never existed.
          </p>
        </div>
      </div>
    );
  }

  const snapshot = dossier.artifact_snapshot || {};

  // Group artifacts by phase
  const byPhase: Record<string, string[]> = {};
  for (const key of Object.keys(snapshot)) {
    const phase = PHASE_OF[key] || "canvas";
    byPhase[phase] = byPhase[phase] || [];
    byPhase[phase].push(key);
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        <header className="space-y-2 border-b border-border/40 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{dossier.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Specificity avg: {Number(dossier.specificity_avg || 0).toFixed(1)}</span>
            <span>{Object.keys(snapshot).length} artifacts</span>
            <span>Published {new Date(dossier.published_at).toLocaleDateString()}</span>
          </div>
        </header>

        {PHASE_ORDER.map((phase) => {
          const keys = byPhase[phase];
          if (!keys?.length) return null;
          return (
            <section key={phase} className="space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {PHASE_LABELS[phase]}
              </h2>
              <div className="space-y-4">
                {keys.map((key) => (
                  <ArtifactBlock
                    key={key}
                    artifactKey={key}
                    data={snapshot[key]}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function ArtifactBlock({
  artifactKey,
  data,
}: {
  artifactKey: string;
  data: { version: number; content: unknown; specificity_score: number };
}) {
  return (
    <article className="space-y-2 rounded-lg border border-border/40 bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-medium">
          {ARTIFACT_LABELS[artifactKey] || artifactKey}
        </h3>
        <div className="text-xs tabular-nums text-muted-foreground">
          v{data.version} · specificity {Number(data.specificity_score).toFixed(1)}
        </div>
      </div>
      <ContentRenderer content={data.content} />
    </article>
  );
}

function ContentRenderer({ content }: { content: unknown }) {
  if (content === null || content === undefined) {
    return <div className="text-sm text-muted-foreground">(empty)</div>;
  }
  if (typeof content === "string") {
    return <div className="whitespace-pre-wrap text-base leading-relaxed">{content}</div>;
  }
  if (typeof content === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {k.replace(/_/g, " ")}
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
              {typeof v === "string"
                ? v
                : Array.isArray(v)
                ? v.map((item, i) => (
                    <div key={i}>
                      • {typeof item === "string" ? item : JSON.stringify(item)}
                    </div>
                  ))
                : typeof v === "object" && v !== null
                ? (
                  <pre className="overflow-x-auto text-xs">{JSON.stringify(v, null, 2)}</pre>
                )
                : String(v)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="text-sm">{String(content)}</div>;
}
