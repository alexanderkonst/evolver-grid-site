/**
 * PublicDossier — world-readable Dossier page served at /dossier/:slug.
 * (Legacy /ubd/:slug redirects here via App.tsx for back-compat.)
 *
 * Fetches the frozen artifact_snapshot from unique_business_dossiers,
 * renders all 19 artifacts grouped by phase. Read-access allowed for
 * anonymous users via RLS ("public view live dossiers").
 *
 * Day 53 (Sasha 2026-04-27): full editorial re-skin to match the
 * landing/playbook register. This is the manuscript a founder shares
 * with strangers — the visual register has to carry brand gravitas
 * so the founder's work reads as serious, not generic. Cream wash,
 * Cormorant headlines, gold ✦ phase rules, illuminated parchment
 * artifact blocks, DM Sans tabular nums for metadata.
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

// Day 53 night (Sasha 2026-04-27): public dossier headings are for
// STRANGERS, not the founder. Internal phase taxonomy ("Canvas" "Session
// Bridge" "Communications") is methodology jargon that means nothing to
// a visitor reading this for the first time. Replaced with plain-English
// chapter labels that describe what the visitor will read in each
// section. The founder still sees the full taxonomy inside `/ubb` (the
// in-app DossierScreen uses PHASE_LABELS from constants, not these
// labels). Keeping the keys aligned with PHASE_OF below.
const PHASE_LABELS: Record<string, string> = {
  canvas: "Foundation",         // was "Canvas"
  session: "First Session",     // was "Session Bridge"
  marketing: "Why · How · Buy",  // was "Marketing" — describes core_belief, packaging, frictionless_purchase
  distribution: "Where People Find It", // was "Distribution" — describes reach, delivery, spread
  communications: "How It Speaks",      // was "Communications" — surface_inventory, tuning_fork, golden_dm
  publication: "The Page",      // was "Publication"
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

// Cream wash matches Aurora's pane-3 wash so public dossiers feel like
// the same brand as the in-app surfaces. Gold sun-glow at top right.
const WASH_BG =
  "radial-gradient(ellipse 95% 105% at 95% 5%, rgba(255, 200, 130, 0.45) 0%, rgba(255, 218, 170, 0.35) 18%, rgba(252, 232, 200, 0.65) 38%, rgba(248, 240, 220, 0.88) 65%, rgba(245, 242, 235, 0.96) 88%)";

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
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: WASH_BG }}
      >
        <div
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontSize: "15px",
            color: "rgba(11, 42, 90, 0.55)",
          }}
        >
          Loading…
        </div>
      </div>
    );
  }

  if (notFound || !dossier) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: WASH_BG }}
      >
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "28px",
              color: "#0b2a5a",
            }}
          >
            Dossier not found
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontStyle: "italic",
              fontSize: "14px",
              color: "rgba(11, 42, 90, 0.62)",
            }}
          >
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
    <div className="min-h-screen" style={{ background: WASH_BG }}>
      <main className="mx-auto max-w-3xl space-y-10 px-5 py-16">
        {/* ═══ Header — manuscript title + glance row ═══ */}
        <header className="space-y-3 pb-6">
          <h1
            className="leading-[1.05]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "clamp(36px, 5vw, 52px)",
              letterSpacing: "-0.01em",
              color: "#0b2a5a",
              textShadow: "0 1px 2px rgba(255,255,255,0.7)",
            }}
          >
            {dossier.title}
          </h1>
          <div
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontStyle: "italic",
              fontSize: "14px",
              color: "rgba(11, 42, 90, 0.62)",
            }}
          >
            <span>
              <span
                className="not-italic"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums lining-nums",
                  color: "rgba(11, 42, 90, 0.85)",
                }}
              >
                {Number(dossier.specificity_avg || 0).toFixed(1)}
              </span>
              {" avg specificity"}
            </span>
            <span>·</span>
            <span>
              <span
                className="not-italic"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums lining-nums",
                  color: "rgba(11, 42, 90, 0.85)",
                }}
              >
                {Object.keys(snapshot).length}
              </span>
              {" artifacts"}
            </span>
            <span>·</span>
            <span>
              Published{" "}
              <span
                className="not-italic"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums lining-nums",
                  color: "rgba(11, 42, 90, 0.85)",
                }}
              >
                {new Date(dossier.published_at).toLocaleDateString()}
              </span>
            </span>
          </div>
          {/* Hairline beneath header */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(212, 175, 55, 0.55) 0%, rgba(212, 175, 55, 0.22) 25%, rgba(26, 30, 58, 0.10) 70%, rgba(26, 30, 58, 0) 100%)",
            }}
          />
        </header>

        {/* ═══ Phase sections ═══ */}
        {PHASE_ORDER.map((phase) => {
          const keys = byPhase[phase];
          if (!keys?.length) return null;
          return (
            <section key={phase} className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  style={{
                    color: "#b8860b",
                    textShadow: "0 0 10px rgba(240,194,127,0.6)",
                    fontSize: "13px",
                  }}
                >
                  ✦
                </span>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "13px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#b8860b",
                  }}
                >
                  {PHASE_LABELS[phase]}
                </h2>
              </div>
              <div
                className="h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(212, 175, 55, 0.45) 0%, rgba(212, 175, 55, 0.18) 25%, rgba(26, 30, 58, 0.08) 70%, rgba(26, 30, 58, 0) 100%)",
                }}
              />
              <div className="space-y-4">
                {keys.map((key) => (
                  <ArtifactBlock key={key} artifactKey={key} data={snapshot[key]} />
                ))}
              </div>
            </section>
          );
        })}

        {/* ═══ Footer ═══ */}
        <footer
          className="pt-10 text-center"
          style={{
            borderTop: "0.5px solid rgba(26, 30, 58, 0.10)",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "10.5px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(11, 42, 90, 0.45)",
            }}
          >
            <span style={{ color: "#b8860b", textShadow: "0 0 6px rgba(240,194,127,0.5)" }}>✦</span>
            {"  "}Find Your Top Talent
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ─── Artifact block — illuminated parchment ─────────────────────── */

function ArtifactBlock({
  artifactKey,
  data,
}: {
  artifactKey: string;
  data: { version: number; content: unknown; specificity_score: number };
}) {
  return (
    <article
      className="rounded-2xl px-5 py-5"
      style={{
        background: "rgba(255, 255, 255, 0.68)",
        border: "0.5px solid rgba(26, 30, 58, 0.08)",
        boxShadow:
          "0 4px 16px -8px rgba(10, 22, 40, 0.10), 0 16px 40px -20px rgba(10, 22, 40, 0.15)",
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 pb-3">
        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "22px",
            letterSpacing: "-0.005em",
            color: "#0b2a5a",
          }}
        >
          {ARTIFACT_LABELS[artifactKey] || artifactKey}
        </h3>
        <div
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: "10.5px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(11, 42, 90, 0.55)",
            fontVariantNumeric: "tabular-nums lining-nums",
          }}
        >
          v{data.version} · specificity {Number(data.specificity_score).toFixed(1)}
        </div>
      </div>
      <ContentRenderer content={data.content} />
    </article>
  );
}

/* ─── Content renderer ───────────────────────────────────────────── */
//
// Public dossier prose register: Source Serif 4 for body, Cormorant
// tracked-uppercase for field labels, gold middot bullets for arrays.

function ContentRenderer({ content }: { content: unknown }) {
  if (content === null || content === undefined) {
    return (
      <div
        className="italic"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "14px",
          color: "rgba(11, 42, 90, 0.45)",
        }}
      >
        (empty)
      </div>
    );
  }
  if (typeof content === "string") {
    return (
      <div
        className="whitespace-pre-wrap"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "16px",
          lineHeight: 1.6,
          color: "rgba(11, 42, 90, 0.85)",
        }}
      >
        {content}
      </div>
    );
  }
  if (typeof content === "object") {
    return (
      <div className="space-y-4">
        {Object.entries(content as Record<string, unknown>).map(([k, v]) => {
          // Skip protocol tracer fields (synthesis protocol audit trail)
          if (k.startsWith("_")) return null;
          return (
            <div key={k}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  letterSpacing: "0.20em",
                  textTransform: "uppercase",
                  color: "#b8860b",
                }}
              >
                {k.replace(/[_-]+/g, " ")}
              </div>
              <div className="mt-1.5">{renderValue(v)}</div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ fontFamily: "'Source Serif 4', serif", color: "rgba(11, 42, 90, 0.85)" }}>
      {String(content)}
    </div>
  );
}

function renderValue(v: unknown): React.ReactNode {
  const proseStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    fontSize: "15.5px",
    lineHeight: 1.6,
    color: "rgba(11, 42, 90, 0.85)",
  };

  if (v === null || v === undefined) {
    return (
      <span
        className="italic"
        style={{ ...proseStyle, color: "rgba(11, 42, 90, 0.45)" }}
      >
        (empty)
      </span>
    );
  }
  if (typeof v === "string") {
    return <div className="whitespace-pre-wrap" style={proseStyle}>{v}</div>;
  }
  if (typeof v === "number" || typeof v === "boolean") {
    return (
      <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", ...proseStyle }}>
        {String(v)}
      </span>
    );
  }
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === "string")) {
      return (
        <ul className="space-y-1.5 pl-0">
          {v.map((s, i) => (
            <li key={i} className="flex gap-2" style={proseStyle}>
              <span
                aria-hidden="true"
                className="flex-shrink-0"
                style={{
                  color: "#b8860b",
                  textShadow: "0 0 6px rgba(240,194,127,0.5)",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                ·
              </span>
              <span>{s as string}</span>
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className="space-y-2">
        {v.map((x, i) => (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{
              background: "rgba(255, 255, 255, 0.45)",
              border: "0.5px solid rgba(26, 30, 58, 0.08)",
            }}
          >
            {renderValue(x)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof v === "object") {
    return (
      <div className="space-y-2.5">
        {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
          <div key={k}>
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(11, 42, 90, 0.55)",
              }}
            >
              {k.replace(/[_-]+/g, " ")}:
            </span>{" "}
            <span style={proseStyle}>{renderValue(val)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span style={proseStyle}>{String(v)}</span>;
}
