import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GameShellV2 from "@/components/game/GameShellV2";
import { useLocalizedPlaybookSteps } from "@/data/playbookSteps";

/**
 * MyArtifactsPage — grouped view of the user's unique-business artifacts.
 *
 * Route: /my-artifacts  (RequireAuth in App.tsx)
 *
 * Reads rows from `public.user_business_artifacts` (RLS scoped to auth.uid()),
 * groups them by step_number, and renders a compact list showing:
 *   - artifact label (human-readable)
 *   - version (e.g. "v2.0")
 *   - precision score (e.g. "9.9/10")
 *   - content preview with expand/collapse
 *
 * Seeded for Sasha by the 2026-04-21 migration. New users see the empty state.
 *
 * When Lovable regenerates Supabase types, the `as any` cast on the `.from()`
 * call can be dropped — currently stubbed with a local interface.
 */

// ─── Local type (remove after Lovable regens types.ts) ─────────────────────

type ArtifactKey =
  | "talent_sentence"
  | "myth"
  | "tribe"
  | "promise"
  | "pain"
  | "journey"
  | "value_ladder"
  | "unique_product";

interface Artifact {
  id: string;
  user_id: string;
  artifact_key: string;
  step_number: number;
  content: string | null;
  version: string;
  precision_score: number | null;
  created_at: string;
  updated_at: string;
}

// Maps each DB artifact_key (persisted identifier) to its i18n label key.
// The map keys are DB values; the values are translation keys resolved via t().
const ARTIFACT_LABEL_KEYS: Record<ArtifactKey, string> = {
  talent_sentence: "myArtifacts.labels.talentSentence",
  myth: "myArtifacts.labels.myth",
  tribe: "myArtifacts.labels.tribe",
  promise: "myArtifacts.labels.promise",
  pain: "myArtifacts.labels.pain",
  journey: "myArtifacts.labels.journey",
  value_ladder: "myArtifacts.labels.valueLadder",
  unique_product: "myArtifacts.labels.uniqueProduct",
};

/** "core_belief" → "Core Belief": last-resort label for a key nobody has named yet. */
const humanizeKey = (key: string): string =>
  key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// ─── Component ─────────────────────────────────────────────────────────────

const MyArtifactsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Localized steps for the per-step section headers (step.subtitle).
  const playbookSteps = useLocalizedPlaybookSteps();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // getSession reads the stored session (no network round-trip, unlike getUser); RLS on
      // the table still scopes every row to the signed-in user.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || cancelled) {
        setLoading(false);
        return;
      }
      // RLS limits the result to the user's own rows; no need to filter client-side.
      // Cast to any until types.ts is regenerated for the new table.
      const { data, error } = await (supabase
        .from("user_business_artifacts" as never) as any)
        .select("*")
        .order("step_number", { ascending: true })
        .order("artifact_key", { ascending: true });

      if (!cancelled) {
        if (error) {
          console.error("Failed to load artifacts", error);
          setArtifacts([]);
        } else {
          setArtifacts((data ?? []) as Artifact[]);
        }
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group artifacts by step_number.
  const byStep: Record<number, Artifact[]> = {};
  for (const a of artifacts) {
    (byStep[a.step_number] ||= []).push(a);
  }
  const stepsWithArtifacts = Object.keys(byStep)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <GameShellV2>
      <div
        className="min-h-screen bg-[#08090c] text-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="relative z-10 max-w-[860px] mx-auto px-5 pt-10 pb-20">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 min-h-[44px] py-1.5 px-4 rounded-md border border-white/25 font-mono text-[11px] font-light uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/60 hover:text-white mb-8 focus-visible:ring-1 focus-visible:ring-white/60 outline-none"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            <span>{t("myArtifacts.back")}</span>
          </button>

          {/* Header */}
          <div
            className="font-mono text-[11px] font-light uppercase tracking-[0.2em] mb-4 text-white/60"
          >
            {t("myArtifacts.eyebrow")}
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium uppercase tracking-[0.18em] leading-[1.25] mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "rgba(231,233,229,0.98)",
            }}
          >
            {t("myArtifacts.heading")}
          </h1>
          <p
            className="text-[14px] leading-relaxed mb-10 max-w-xl"
            style={{ color: "rgba(231,233,229,0.65)" }}
          >
            {t("myArtifacts.intro")}
          </p>

          {loading ? (
            <div role="status" aria-live="polite" aria-busy="true" data-testid="artifacts-skeleton">
              <span className="sr-only">{t("myArtifacts.loading")}</span>
              <div className="space-y-6" aria-hidden="true">
                {[0, 1].map((n) => (
                  <div
                    key={n}
                    className="rounded-2xl overflow-hidden animate-pulse motion-reduce:animate-none"
                    style={{
                      background: "rgba(10, 12, 16, 0.6)",
                      border: "1px solid rgba(231,233,229,0.08)",
                    }}
                  >
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                      <div className="h-2.5 w-16 rounded bg-white/10 mb-2" />
                      <div className="h-4 w-48 rounded bg-white/10" />
                    </div>
                    {[0, 1, 2].map((m) => (
                      <div key={m} className="px-6 py-4 border-b border-white/[0.04] last:border-b-0">
                        <div className="h-3 w-32 rounded bg-white/10 mb-3" />
                        <div className="h-3 w-full max-w-md rounded bg-white/[0.06]" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : artifacts.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-2xl p-10 text-center"
              style={{
                background:
                  "rgba(10, 12, 16, 0.6)",
                border: "1px solid rgba(231,233,229,0.08)",
              }}
            >
              <p
                className="text-base mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "rgba(231,233,229,0.9)",
                }}
              >
                {t("myArtifacts.empty.title")}
              </p>
              <p
                className="text-sm mb-6 max-w-md mx-auto leading-relaxed"
                style={{ color: "rgba(231,233,229,0.6)" }}
              >
                {t("myArtifacts.empty.body")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="min-h-[44px] px-6 py-3 rounded-md border border-white/40 font-mono text-xs font-light uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white/5"
              >
                {t("myArtifacts.empty.cta")}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {stepsWithArtifacts.map((stepNumber) => {
                const step = playbookSteps.find(
                  (s) => s.number === stepNumber,
                );
                const items = byStep[stepNumber] ?? [];
                return (
                  <section
                    key={stepNumber}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background:
                        "rgba(10, 12, 16, 0.6)",
                      border: "1px solid rgba(231,233,229,0.08)",
                      boxShadow:
                        "none",
                      backdropFilter: "blur(14px)",
                    }}
                  >
                    {/* Step header */}
                    <div
                      className="px-6 py-4 border-b border-white/[0.06] flex items-baseline justify-between gap-4"
                    >
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-[0.28em] mb-1"
                          style={{ color: "rgba(231,233,229,0.6)" }}
                        >
                          {t("myArtifacts.step", { number: stepNumber })}
                        </div>
                        <h2
                          className="text-base sm:text-lg"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "rgba(231,233,229,0.95)",
                          }}
                        >
                          {step?.subtitle ?? ""}
                        </h2>
                      </div>
                      <div
                        className="text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(231,233,229,0.4)" }}
                      >
                        {t("myArtifacts.artifactCount", {
                          count: items.length,
                        })}
                      </div>
                    </div>

                    {/* Artifacts */}
                    <div className="divide-y divide-white/[0.04]">
                      {items.map((a) => {
                        const isOpen = expanded.has(a.id);
                        const labelKey = ARTIFACT_LABEL_KEYS[a.artifact_key as ArtifactKey];
                        // Keys the page does not name itself (core_belief, golden_dm, …) take
                        // their title from the dossier's artifact names; unknown ones are
                        // humanized rather than shown as raw snake_case.
                        const label = labelKey
                          ? t(labelKey)
                          : t(`publicDossier.artifact.${a.artifact_key}`, {
                              defaultValue: humanizeKey(a.artifact_key),
                            });
                        // No score yet: show nothing, not a dash.
                        const score = a.precision_score
                          ? `${Number(a.precision_score).toFixed(1)}/10`
                          : null;
                        const preview = a.content ?? "";
                        const isLong = preview.length > 120;
                        const shown =
                          !isLong || isOpen ? preview : preview.slice(0, 120) + "…";
                        return (
                          <div key={a.id} className="px-6 py-4">
                            <div className="flex items-baseline justify-between gap-4 mb-2">
                              <div
                                className="text-[13px] font-medium"
                                style={{ color: "rgba(231,233,229,0.92)" }}
                              >
                                {label}
                              </div>
                              <div
                                className="flex items-center gap-3 text-[11px]"
                                style={{ color: "rgba(231,233,229,0.55)" }}
                              >
                                {a.version && <span className="font-mono">{a.version}</span>}
                                {score && <span className="font-mono">{score}</span>}
                              </div>
                            </div>
                            {preview && (
                              <p
                                className="text-[14px] leading-relaxed"
                                style={{
                                  color: "rgba(231,233,229,0.78)",
                                  fontFamily: "'Cormorant Garamond', serif",
                                  fontStyle: "italic",
                                }}
                              >
                                &ldquo;{shown}&rdquo;
                              </p>
                            )}
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => toggle(a.id)}
                                className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white/80 transition-colors"
                              >
                                {isOpen
                                  ? t("myArtifacts.collapse")
                                  : t("myArtifacts.readMore")}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GameShellV2>
  );
};

export default MyArtifactsPage;
