import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, BrainCircuit, Copy, Loader2, RefreshCw, Search, Sparkles, Zap, Activity, MessageSquareText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  applyEquilibriumAiChanges,
  cockpitLenses,
  type CockpitLensId,
  type CockpitLensResult,
  runCockpitLens,
} from "@/lib/cockpitLenses";
import { crmSnapshot, formatDate, pulseSnapshot } from "./data";
import { ctaStyle, inset, notice, pillButton, text } from "./ui";

/**
 * Founder-only tools that live inside the Operations layer: Founder Pulse brief,
 * the founder brief (command surface) and the AI lens lab. The page mounts this only
 * for the founder; nothing here reads the build-time snapshots for anyone else.
 */

type CockpitAction = "movement" | "followups" | "bottlenecks" | "leverage";
type PulseBriefKind = "daily" | "weekly";

interface PulseBrief {
  id: string;
  kind: PulseBriefKind;
  title: string | null;
  bottom_line: string | null;
  content: { signals?: string[]; move?: string } | null;
  markdown: string;
  created_at: string;
}

interface EquilibriumContext {
  generated_at?: string;
  summary?: { focus_count?: number; top_next_actions?: string[] };
  strategies?: Array<{ position?: number; text?: string; alignment_score?: number | null }>;
  focus_tasks?: Array<{ id?: string; text?: string }>;
}

const actionCards: Array<{ id: CockpitAction; label: string; instrument: string; icon: typeof Activity }> = [
  { id: "movement", label: "What Moved", instrument: "Energy Ledger", icon: Activity },
  { id: "followups", label: "Generate Follow-Ups", instrument: "Opportunity Field", icon: MessageSquareText },
  { id: "bottlenecks", label: "Find Bottlenecks", instrument: "Strategic Oracle", icon: Search },
  { id: "leverage", label: "Name High-Leverage Moves", instrument: "Next Move Engine", icon: ArrowUpRight },
];

const Disclosure = ({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) => (
  <details open={open} className="group rounded-xl" style={inset}>
    <summary
      className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium"
      style={text.primary}
    >
      {title}
      <span aria-hidden="true" className="text-xs transition group-open:rotate-90" style={text.faint}>
        ›
      </span>
    </summary>
    <div className="px-4 pb-4">{children}</div>
  </details>
);

const Button = ({
  children,
  onClick,
  disabled,
  primary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
    style={primary ? ctaStyle : pillButton(false)}
  >
    {children}
  </button>
);

const Note = ({ children }: { children: ReactNode }) => (
  <p className="rounded-lg p-3 text-sm leading-6" style={notice}>
    {children}
  </p>
);

export default function OperationsTools() {
  const [activeAction, setActiveAction] = useState<CockpitAction>("leverage");
  const [equilibrium, setEquilibrium] = useState<EquilibriumContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLensId, setActiveLensId] = useState<CockpitLensId | null>(null);
  const [lensResult, setLensResult] = useState<CockpitLensResult | null>(null);
  const [lensLoading, setLensLoading] = useState(false);
  const [lensError, setLensError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<"accepted" | "skipped" | "later" | null>(null);
  const [primaryResult, setPrimaryResult] = useState<CockpitLensResult | null>(null);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primaryError, setPrimaryError] = useState<string | null>(null);
  const [primaryCopied, setPrimaryCopied] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<number[]>([]);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [pulseBriefs, setPulseBriefs] = useState<Record<PulseBriefKind, PulseBrief | null>>({ daily: null, weekly: null });
  const [pulseGenKind, setPulseGenKind] = useState<PulseBriefKind | null>(null);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const [activePulseKind, setActivePulseKind] = useState<PulseBriefKind>("daily");

  const loadContext = async () => {
    setLoading(true);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke("equilibrium-ai-context");
    if (invokeError) {
      setError(invokeError.message);
      setEquilibrium(null);
    } else {
      setEquilibrium(data as EquilibriumContext);
    }
    setLoading(false);
  };

  const loadPulseBriefs = async () => {
    const [daily, weekly] = await Promise.all(
      (["daily", "weekly"] as const).map(async (kind) => {
        const { data } = await supabase
          .from("pulse_briefs")
          .select("id, kind, title, bottom_line, content, markdown, created_at")
          .eq("kind", kind)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return (data as PulseBrief | null) ?? null;
      }),
    );
    setPulseBriefs({ daily, weekly });
  };

  const generatePulse = async (kind: PulseBriefKind) => {
    setPulseGenKind(kind);
    setPulseError(null);
    try {
      const { error: invokeError } = await supabase.functions.invoke("generate-pulse-brief", { body: { kind } });
      if (invokeError) throw new Error(invokeError.message);
      await loadPulseBriefs();
      setActivePulseKind(kind);
    } catch (genError) {
      setPulseError(genError instanceof Error ? genError.message : "Could not generate pulse brief.");
    } finally {
      setPulseGenKind(null);
    }
  };

  useEffect(() => {
    void loadContext();
    void loadPulseBriefs();
  }, []);

  useEffect(() => {
    setPrimaryResult(null);
    setPrimaryError(null);
    setPrimaryCopied(false);
  }, [activeAction]);

  useEffect(() => {
    setSelectedEvidence(lensResult ? lensResult.evidence.slice(0, 3).map((_, index) => index) : []);
    setApplyError(null);
  }, [lensResult]);

  const loadContextForLens = async () => {
    const { data, error: invokeError } = await supabase.functions.invoke("equilibrium-ai-context");
    if (invokeError) throw new Error(invokeError.message);
    setEquilibrium(data as EquilibriumContext);
    return data as EquilibriumContext;
  };

  const runLens = async (lensId: CockpitLensId) => {
    setActiveLensId(lensId);
    setLensLoading(true);
    setLensError(null);
    setLensResult(null);
    setCopied(false);
    setReviewDecision(null);
    try {
      const liveEquilibrium = equilibrium ?? (await loadContextForLens());
      setLensResult(await runCockpitLens({ lensId, equilibrium: liveEquilibrium, crmSnapshot, pulseSnapshot }));
    } catch (runError) {
      setLensError(runError instanceof Error ? runError.message : "Could not run cockpit lens.");
    } finally {
      setLensLoading(false);
    }
  };

  const runPrimaryRead = async () => {
    setPrimaryLoading(true);
    setPrimaryError(null);
    setPrimaryResult(null);
    setPrimaryCopied(false);
    try {
      const liveEquilibrium = equilibrium ?? (await loadContextForLens());
      setPrimaryResult(
        await runCockpitLens({ lensId: activeAction, equilibrium: liveEquilibrium, crmSnapshot, pulseSnapshot }),
      );
    } catch (runError) {
      setPrimaryError(runError instanceof Error ? runError.message : "Could not run live cockpit read.");
    } finally {
      setPrimaryLoading(false);
    }
  };

  const copyText = async (value: string | undefined, done: (value: boolean) => void) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    done(true);
  };

  const toggleEvidenceSelection = (index: number) =>
    setSelectedEvidence((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort(),
    );

  const acceptSelectedChanges = async () => {
    if (!lensResult || !activeLensId) return;
    setApplyLoading(true);
    setApplyError(null);
    setReviewDecision(null);
    try {
      const acceptedChanges = selectedEvidence
        .map((index) => lensResult.evidence[index])
        .filter(Boolean)
        .map((body, index) => ({
          change_type: "add_synthesis_log" as const,
          title: `${lensResult.title} · Change ${index + 1}`,
          body,
          reason: lensResult.recommendedMove,
        }));
      if (!acceptedChanges.length) throw new Error("Select at least one change to apply.");
      await applyEquilibriumAiChanges({ lensId: activeLensId, acceptedChanges });
      setReviewDecision("accepted");
      await loadContext();
    } catch (applyIssue) {
      setApplyError(applyIssue instanceof Error ? applyIssue.message : "Could not write back into Equilibrium.");
    } finally {
      setApplyLoading(false);
    }
  };

  // Founder brief. Relationship lines use role words; names render only from gated data.
  const command = useMemo(() => {
    const latest = pulseSnapshot.latestEvent;
    const openActions = pulseSnapshot.openNextActions ?? [];
    const topFocus = equilibrium?.summary?.top_next_actions ?? [];
    const stageEntries = Object.entries(crmSnapshot.stageDistribution ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    return {
      movement: {
        eyebrow: "Energy Ledger",
        title: "The field split into two operating lanes.",
        body: "Immediate paid clarity calls and slower community-infrastructure pilots are both alive. Treating them as one strategy creates noise; flying them as two lanes creates leverage.",
        bullets: [
          `Latest pulse: ${latest?.title ?? "none"}`,
          `Open loops: ${crmSnapshot.openItemsCount ?? 0}; relationships tracked: ${crmSnapshot.contactsCount ?? 0}`,
          "Recent proof movement: a community pilot partner's proposal review, pilot interest from an infrastructure builder, warm individual reactivations, one signal sent.",
        ],
      },
      followups: {
        eyebrow: "Opportunity Field",
        title: "Follow up by energy type, not by inbox order.",
        body: "Each relationship is a different kind of door. The cockpit should help you stop treating cash, proof, legitimacy, and optionality as the same action.",
        bullets: [
          "Community pilot partners: proof + first community-node door. Ask what the AI review surfaced; offer a simple implementation map.",
          "Infrastructure-builder partners: legitimacy + pilot door. Send the platform link, reflect their infrastructure-building frame, propose a pilot design.",
          "Warm individual calls: cash-now doors. Offer exploration around fit and business clarity, not marketing advice.",
          ...openActions.slice(0, 2).map((item) => `${item.title}: ${item.next_action}`),
        ],
      },
      bottlenecks: {
        eyebrow: "Strategic Oracle",
        title: "The bottleneck is over-open loops diluting crystallization energy.",
        body: "There is enough clarity to act. The risk is carrying too many doors as equally active, which turns a living field into cognitive weather.",
        bullets: [
          `${crmSnapshot.energyLeakCount ?? 0} energy leaks are currently marked in the CRM snapshot.`,
          `Top relationship stages: ${stageEntries.map(([stage, count]) => `${stage} ${count}`).join(" · ") || "not available"}`,
          `Equilibrium focus slots loaded: ${equilibrium?.summary?.focus_count ?? 0}`,
          "Primary constraint: choose the few doors that can become cash, proof, or infrastructure now.",
        ],
      },
      leverage: {
        eyebrow: "Next Move Engine",
        title: "Selective crystallization is the move.",
        body: "Do not clarify the whole field again. Pick one cash action, one community-proof action, and one product-infrastructure action, then let the rest stay warm.",
        bullets: [
          "Cash-now lane: book and convert warm individual calls.",
          "Community-infrastructure lane: community pilot partners are proof/pilot doors, not instant-cash doors.",
          "Product lane: turn this cockpit output into reusable prompts/functions before adding more UI.",
          ...topFocus.slice(0, 2).map((item) => `Equilibrium focus: ${item}`),
        ],
      },
    } satisfies Record<CockpitAction, { eyebrow: string; title: string; body: string; bullets: string[] }>;
  }, [equilibrium]);

  const active = command[activeAction];
  const brief = pulseBriefs[activePulseKind];

  return (
    <div className="mt-5 space-y-3">
      <Disclosure title="Founder pulse · autonomous read" open>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["daily", "weekly"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setActivePulseKind(kind)}
              className="rounded-full px-3 py-1 text-xs transition"
              style={pillButton(activePulseKind === kind)}
            >
              {kind === "daily" ? "Daily" : "Weekly"}
            </button>
          ))}
          <Button onClick={() => void generatePulse(activePulseKind)} disabled={pulseGenKind !== null}>
            {pulseGenKind ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            Pulse now
          </Button>
        </div>
        {pulseError && <Note>{pulseError}</Note>}
        {!brief ? (
          <p className="text-sm leading-6" style={text.muted}>
            No {activePulseKind} brief yet. The pulse runs on its own (daily at 8:00 and 20:00, weekly on Monday mornings), or press Pulse now.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-xl" style={text.primary}>
                {brief.title ?? "Founder Pulse"}
              </h3>
              <span className="text-xs" style={text.faint}>
                {formatDate(brief.created_at)}
              </span>
            </div>
            {brief.bottom_line && (
              <p
                className="pl-3 text-base leading-7"
                style={{ ...text.body, borderLeft: "2px solid var(--surface-selected-border)" }}
              >
                {brief.bottom_line}
              </p>
            )}
            {(brief.content?.signals ?? []).length > 0 && (
              <ul className="space-y-1.5">
                {(brief.content?.signals ?? []).map((signal, index) => (
                  <li key={index} className="text-sm leading-6" style={text.muted}>
                    — {signal}
                  </li>
                ))}
              </ul>
            )}
            {brief.content?.move && (
              <p className="text-sm leading-6" style={text.body}>
                <span className="mr-2 text-xs uppercase tracking-[0.14em]" style={text.accent}>
                  Move
                </span>
                {brief.content.move}
              </p>
            )}
          </div>
        )}
      </Disclosure>

      <Disclosure title="Founder brief · command surface">
        <div className="grid gap-2 sm:grid-cols-2">
          {actionCards.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setActiveAction(action.id)}
                className="rounded-xl p-3 text-left transition"
                style={pillButton(action.id === activeAction)}
              >
                <Icon className="mb-2 h-4 w-4" />
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em]" style={text.faint}>
                  {action.instrument}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]" style={text.accent}>
          {active.eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-2xl leading-tight" style={text.primary}>
          {active.title}
        </h3>
        <p className="mt-2 text-sm leading-6" style={text.muted}>
          {active.body}
        </p>
        <ul className="mt-3 space-y-2">
          {active.bullets.map((bullet, index) => (
            <li key={`${bullet}-${index}`} className="rounded-lg p-3 text-sm leading-6" style={{ ...inset, ...text.body }}>
              {bullet}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button primary onClick={() => void runPrimaryRead()} disabled={primaryLoading}>
            {primaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Run live AI read
          </Button>
          <Button
            onClick={() => void copyText(primaryResult?.markdown, setPrimaryCopied)}
            disabled={!primaryResult}
          >
            <Copy className="h-4 w-4" />
            {primaryCopied ? "Copied" : "Copy read"}
          </Button>
        </div>
        {primaryError && (
          <div className="mt-3">
            <Note>{primaryError}</Note>
          </div>
        )}
        {primaryResult && (
          <div className="mt-3 space-y-2 rounded-xl p-4" style={inset}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={text.accent}>
              Live AI read
            </p>
            <h4 className="font-serif text-xl" style={text.primary}>
              {primaryResult.title}
            </h4>
            <p className="text-sm leading-6" style={text.body}>
              {primaryResult.bottomLine}
            </p>
            {primaryResult.evidence.slice(0, 3).map((item, index) => (
              <p key={`${item}-${index}`} className="rounded-lg p-3 text-sm leading-6" style={{ ...inset, ...text.muted }}>
                {item}
              </p>
            ))}
            <p className="text-sm leading-6" style={text.muted}>
              <span style={text.accent}>Move:</span> {primaryResult.recommendedMove}
            </p>
          </div>
        )}
      </Disclosure>

      <Disclosure title="AI lens lab">
        <div className="grid gap-2">
          {cockpitLenses.map((lens) => (
            <button
              key={lens.id}
              type="button"
              onClick={() => void runLens(lens.id)}
              disabled={lensLoading}
              className="rounded-xl p-3 text-left transition disabled:cursor-wait disabled:opacity-70"
              style={pillButton(lens.id === activeLensId)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{lens.label}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em]" style={text.faint}>
                    {lens.instrument}
                  </p>
                </div>
                {lensLoading && lens.id === activeLensId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <p className="mt-2 text-sm leading-6" style={text.muted}>
                {lens.question}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-xl p-4" style={inset}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={text.accent}>
            Equilibrium upgrade
          </p>
          <h3 className="mt-1 font-serif text-xl" style={text.primary}>
            Refine My Operating System
          </h3>
          <p className="mt-1 text-sm leading-6" style={text.muted}>
            Suggest the top three changes that preserve signal and remove noise from current strategies, workstreams, and tasks.
          </p>
          <div className="mt-3">
            <Button onClick={() => void runLens("refine-operating-system")} disabled={lensLoading}>
              {lensLoading && activeLensId === "refine-operating-system" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              Review top 3 changes
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif text-xl" style={text.primary}>
              {lensResult?.title ?? "Run a lens to read the field."}
            </h3>
            <Button onClick={() => void copyText(lensResult?.markdown, setCopied)} disabled={!lensResult}>
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy as markdown"}
            </Button>
          </div>

          {lensLoading && (
            <p className="flex items-center gap-2 text-sm" style={text.muted}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading Equilibrium, pulse, CRM, and holomap context...
            </p>
          )}
          {!lensLoading && lensError && <Note>{lensError}</Note>}
          {!lensLoading && !lensError && !lensResult && (
            <p className="text-sm leading-6" style={text.muted}>
              These buttons call the live AI lens. They do not write back into Equilibrium yet.
            </p>
          )}

          {!lensLoading && !lensError && lensResult && (
            <>
              <p className="rounded-xl p-4 text-base leading-7" style={{ ...inset, ...text.body }}>
                {lensResult.bottomLine}
              </p>
              {lensResult.evidence.map((item, index) => (
                <div key={`${item}-${index}`} className="flex gap-3 rounded-xl p-3 text-sm leading-6" style={{ ...inset, ...text.body }}>
                  {activeLensId === "refine-operating-system" ? (
                    <button
                      type="button"
                      onClick={() => toggleEvidenceSelection(index)}
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs transition"
                      style={pillButton(selectedEvidence.includes(index))}
                      aria-label={`Select change ${index + 1}`}
                      aria-pressed={selectedEvidence.includes(index)}
                    >
                      {selectedEvidence.includes(index) ? "✓" : index + 1}
                    </button>
                  ) : (
                    <span
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs"
                      style={pillButton(false)}
                    >
                      {index + 1}
                    </span>
                  )}
                  <p>{item}</p>
                </div>
              ))}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl p-3" style={inset}>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.14em]" style={text.accent}>
                    Consequence
                  </p>
                  <p className="text-sm leading-6" style={text.muted}>
                    {lensResult.consequence}
                  </p>
                </div>
                <div className="rounded-xl p-3" style={inset}>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.14em]" style={text.accent}>
                    Recommended move
                  </p>
                  <p className="text-sm leading-6" style={text.muted}>
                    {lensResult.recommendedMove}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-xl p-3" style={inset}>
                <Button
                  primary
                  onClick={() => void acceptSelectedChanges()}
                  disabled={applyLoading || activeLensId !== "refine-operating-system"}
                >
                  {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Accept selected changes
                </Button>
                <Button onClick={() => setReviewDecision("later")}>Apply later</Button>
                <Button onClick={() => setReviewDecision("skipped")}>Skip</Button>
                <p className="text-sm leading-6" style={text.faint}>
                  {reviewDecision === "accepted" && "Changes applied to Equilibrium."}
                  {reviewDecision === "later" && "Marked for later review. Nothing has been written back yet."}
                  {reviewDecision === "skipped" && "Skipped locally. Nothing has been written back."}
                  {!reviewDecision && activeLensId === "refine-operating-system" && "Select the changes to save. AI proposes; you decide before anything writes back."}
                  {!reviewDecision && activeLensId !== "refine-operating-system" && "Review only. Writeback is enabled for Refine My Operating System first."}
                </p>
              </div>
              {applyError && <Note>{applyError}</Note>}
            </>
          )}
        </div>
      </Disclosure>

      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs" style={text.faint}>
        <span>
          Context feed · Pulse {formatDate(pulseSnapshot.generated_at)} · CRM {formatDate(crmSnapshot.generated_at)} · Equilibrium{" "}
          {error ? "not loaded" : formatDate(equilibrium?.generated_at)}
        </span>
        <button
          type="button"
          onClick={() => void loadContext()}
          className="inline-flex items-center gap-1.5 transition hover:opacity-80"
          style={text.muted}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>
      {error && <Note>{error}</Note>}
    </div>
  );
}
