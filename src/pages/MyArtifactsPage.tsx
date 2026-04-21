import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GameShellV2 from "@/components/game/GameShellV2";
import { PLAYBOOK_STEPS } from "@/data/playbookSteps";

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
  artifact_key: ArtifactKey;
  step_number: number;
  content: string | null;
  version: string;
  precision_score: number | null;
  created_at: string;
  updated_at: string;
}

const ARTIFACT_LABELS: Record<ArtifactKey, string> = {
  talent_sentence: "Top Talent — one sentence",
  myth: "Myth",
  tribe: "Tribe",
  promise: "Transformational Promise",
  pain: "Pain",
  journey: "User Journey",
  value_ladder: "Value Ladder",
  unique_product: "First Unique Product",
};

// ─── Component ─────────────────────────────────────────────────────────────

const MyArtifactsPage = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
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
        className="min-h-screen bg-[#0a0e1a] text-white"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full opacity-[0.04]"
            style={{
              background:
                "radial-gradient(circle, #8460ea 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{
              background:
                "radial-gradient(circle, #6894d0 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[860px] mx-auto px-5 pt-10 pb-20">
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-medium transition-all duration-300 hover:scale-[1.02] mb-8 focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(231,233,229,0.08), rgba(231,233,229,0.02))",
              border: "1px solid rgba(231,233,229,0.18)",
              color: "rgba(231,233,229,0.75)",
            }}
          >
            <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            <span>Back to landing</span>
          </button>

          {/* Header */}
          <div
            className="text-[10px] uppercase tracking-[0.32em] mb-4"
            style={{ color: "rgba(132,96,234,0.85)" }}
          >
            My Artifacts
          </div>
          <h1
            className="text-3xl sm:text-4xl font-medium leading-[1.15] mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "rgba(231,233,229,0.98)",
            }}
          >
            Your unique business, in your own words.
          </h1>
          <p
            className="text-[14px] leading-relaxed mb-10 max-w-xl"
            style={{ color: "rgba(231,233,229,0.65)" }}
          >
            Each artifact below is one piece of your business, captured at a
            version and a precision score. As you iterate, create new versions
            — nothing is ever overwritten.
          </p>

          {loading ? (
            <div className="py-20 text-center text-white/50 text-sm">
              Loading your artifacts…
            </div>
          ) : artifacts.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-2xl p-10 text-center"
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,25,45,0.65), rgba(20,15,40,0.55))",
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
                No artifacts yet.
              </p>
              <p
                className="text-sm mb-6 max-w-md mx-auto leading-relaxed"
                style={{ color: "rgba(231,233,229,0.6)" }}
              >
                Start with Step 1 — name your top talent in a couple of
                minutes. Everything else grows from there.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.22em] transition-all hover:scale-[1.03]"
                style={{
                  color: "rgba(231,233,229,0.98)",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(132,96,234,0.9), rgba(41,84,159,0.9))",
                  border: "1px solid rgba(231,233,229,0.4)",
                  boxShadow: "0 20px 60px -18px rgba(132,96,234,0.7)",
                }}
              >
                Find Your Top Talent
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {stepsWithArtifacts.map((stepNumber) => {
                const step = PLAYBOOK_STEPS.find(
                  (s) => s.number === stepNumber,
                );
                const items = byStep[stepNumber] ?? [];
                return (
                  <section
                    key={stepNumber}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(15,25,45,0.65), rgba(20,15,40,0.55))",
                      border: "1px solid rgba(231,233,229,0.08)",
                      boxShadow:
                        "0 24px 80px -32px rgba(132,96,234,0.25), inset 0 1px 1px rgba(255,255,255,0.04)",
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
                          style={{ color: "rgba(132,96,234,0.85)" }}
                        >
                          Step {stepNumber}
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
                        {items.length} artifact{items.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    {/* Artifacts */}
                    <div className="divide-y divide-white/[0.04]">
                      {items.map((a) => {
                        const isOpen = expanded.has(a.id);
                        const label =
                          ARTIFACT_LABELS[a.artifact_key] ?? a.artifact_key;
                        const score = a.precision_score
                          ? `${Number(a.precision_score).toFixed(1)}/10`
                          : "—";
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
                                <span className="font-mono">{a.version}</span>
                                <span className="font-mono">{score}</span>
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
                                {isOpen ? "Collapse" : "Read more"}
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
