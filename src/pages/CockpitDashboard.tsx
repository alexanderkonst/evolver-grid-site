import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  ClipboardList,
  Compass,
  Copy,
  Crosshair,
  Database,
  Gauge,
  Loader2,
  MessageSquareText,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Signal,
  Sparkles,
  Waves,
  Waypoints,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/isAdmin";
import {
  applyEquilibriumAiChanges,
  cockpitLenses,
  type CockpitLensId,
  type CockpitLensResult,
  runCockpitLens,
} from "@/lib/cockpitLenses";
import crmSnapshotRaw from "@/generated/crm-snapshot.json";
import pulseSnapshotRaw from "@/generated/project-pulse-snapshot.json";
import {
  calculateOffersBoardMetrics,
  normalizeOffers,
  type OutreachOffer,
} from "@/lib/offersBoard";

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
  summary?: {
    active_workstreams_count?: number;
    active_tasks_count?: number;
    focus_count?: number;
    top_next_actions?: string[];
    last_synthesis_at?: string | null;
  };
  state?: {
    mission_override_text?: string | null;
    role_override_text?: string | null;
    moon_focus_text?: string | null;
    last_synthesis_text?: string | null;
  } | null;
  strategies?: Array<{ position?: number; text?: string; alignment_score?: number | null }>;
  focus_tasks?: Array<{ id?: string; text?: string }>;
  warnings?: string[];
}

const crmSnapshot = crmSnapshotRaw as {
  generated_at?: string;
  contactsCount?: number;
  openItemsCount?: number;
  energyLeakCount?: number;
  cashReceivedUsd?: number;
  revShareContractsUsd?: number;
  stageDistribution?: Record<string, number>;
  segmentDistribution?: Record<string, number>;
  offers?: OutreachOffer[];
};

const pulseSnapshot = pulseSnapshotRaw as {
  generated_at?: string;
  eventsCount?: number;
  latestEvent?: {
    title?: string;
    what_happened?: string;
    next_action?: string;
    phase_shift_significance?: string;
  };
  openNextActions?: Array<{ title?: string; next_action?: string }>;
};

const formatDate = (value?: string | null) => {
  if (!value) return "not loaded";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const clipped = (text?: string | null, max = 190) => {
  if (!text) return "Not set yet";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

const actionCards: Array<{
  id: CockpitAction;
  label: string;
  instrument: string;
  icon: typeof Activity;
}> = [
  { id: "movement", label: "What Moved", instrument: "Energy Ledger", icon: Activity },
  { id: "followups", label: "Generate Follow-Ups", instrument: "Opportunity Field", icon: MessageSquareText },
  { id: "bottlenecks", label: "Find Bottlenecks", instrument: "Strategic Oracle", icon: Search },
  { id: "leverage", label: "Name High-Leverage Moves", instrument: "Next Move Engine", icon: ArrowUpRight },
];

export default function CockpitDashboard() {
  // Founder-only data (crm/pulse snapshots, AI lenses, Founder Pulse briefs) is
  // gated behind this flag. Non-admin users see the same instrument shell with
  // graceful empty states instead of Sasha's build-time snapshots.
  const [isFounder, setIsFounder] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setIsFounder(isAdminEmail(data.user?.email));
    })();
  }, []);

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

  const [pulseBriefs, setPulseBriefs] = useState<Record<PulseBriefKind, PulseBrief | null>>({
    daily: null,
    weekly: null,
  });
  const [pulseGenKind, setPulseGenKind] = useState<PulseBriefKind | null>(null);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const [activePulseKind, setActivePulseKind] = useState<PulseBriefKind>("daily");
  const offers = useMemo(() => normalizeOffers(crmSnapshot.offers ?? []), []);
  const offerMetrics = useMemo(() => calculateOffersBoardMetrics(offers), [offers]);
  const offerRecent = useMemo(
    () => [...offers].sort((left, right) => right.dateSent.localeCompare(left.dateSent)).slice(0, 3),
    [offers],
  );

  const loadContext = async () => {
    setLoading(true);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke(
      "equilibrium-ai-context",
    );
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
      const { error: invokeError } = await supabase.functions.invoke("generate-pulse-brief", {
        body: { kind },
      });
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

  const runLens = async (lensId: CockpitLensId) => {
    setActiveLensId(lensId);
    setLensLoading(true);
    setLensError(null);
    setLensResult(null);
    setCopied(false);
    setReviewDecision(null);

    try {
      const liveEquilibrium = equilibrium ?? (await loadContextForLens());
      const result = await runCockpitLens({
        lensId,
        equilibrium: liveEquilibrium,
        crmSnapshot,
        pulseSnapshot,
      });
      setLensResult(result);
    } catch (runError) {
      setLensError(runError instanceof Error ? runError.message : "Could not run cockpit lens.");
    } finally {
      setLensLoading(false);
    }
  };

  const loadContextForLens = async () => {
    const { data, error: invokeError } = await supabase.functions.invoke("equilibrium-ai-context");
    if (invokeError) throw new Error(invokeError.message);
    setEquilibrium(data as EquilibriumContext);
    return data as EquilibriumContext;
  };

  const copyLensMarkdown = async () => {
    if (!lensResult) return;
    await navigator.clipboard.writeText(lensResult.markdown);
    setCopied(true);
  };

  const runPrimaryRead = async () => {
    setPrimaryLoading(true);
    setPrimaryError(null);
    setPrimaryResult(null);
    setPrimaryCopied(false);

    try {
      const liveEquilibrium = equilibrium ?? (await loadContextForLens());
      const result = await runCockpitLens({
        lensId: activeAction,
        equilibrium: liveEquilibrium,
        crmSnapshot,
        pulseSnapshot,
      });
      setPrimaryResult(result);
    } catch (runError) {
      setPrimaryError(runError instanceof Error ? runError.message : "Could not run live cockpit read.");
    } finally {
      setPrimaryLoading(false);
    }
  };

  const copyPrimaryMarkdown = async () => {
    if (!primaryResult) return;
    await navigator.clipboard.writeText(primaryResult.markdown);
    setPrimaryCopied(true);
  };

  const toggleEvidenceSelection = (index: number) => {
    setSelectedEvidence((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort(),
    );
  };

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

      if (!acceptedChanges.length) {
        throw new Error("Select at least one change to apply.");
      }

      await applyEquilibriumAiChanges({ lensId: activeLensId, acceptedChanges });
      setReviewDecision("accepted");
      await loadContext();
    } catch (applyIssue) {
      setApplyError(applyIssue instanceof Error ? applyIssue.message : "Could not write back into Equilibrium.");
    } finally {
      setApplyLoading(false);
    }
  };

  const model = useMemo(() => {
    // Sasha's committed build-time crm/pulse snapshots (and the hardcoded
    // relationship copy below, e.g. "Oyi", "Ariana", "$4K now") are
    // founder-only. Non-admins get a generic, empty-safe placeholder command
    // set instead — never his data, never his named relationships.
    if (!isFounder) {
      const placeholderCommand = {
        eyebrow: "Founder Cockpit",
        title: "Fills in as you build your venture.",
        body: "This instrument populates once you have relationships, pulses, and Equilibrium data of your own.",
        bullets: ["N/A — fills in as you build your venture."],
      };
      const command = {
        movement: placeholderCommand,
        followups: placeholderCommand,
        bottlenecks: placeholderCommand,
        leverage: placeholderCommand,
      } satisfies Record<CockpitAction, { eyebrow: string; title: string; body: string; bullets: string[] }>;

      return {
        latest: undefined as typeof pulseSnapshot.latestEvent,
        command,
        mission:
          equilibrium?.state?.mission_override_text ??
          "Help humanity evolve into conscious coordination through unique-value clarity.",
        strategy:
          equilibrium?.strategies?.[0]?.text ??
          "Fills in as you build your venture.",
        nextMove: "Choose the next move that is alive enough to do now.",
        openActions: equilibrium?.focus_tasks ?? [],
        topFocus: equilibrium?.summary?.top_next_actions ?? [],
      };
    }

    const latest = pulseSnapshot.latestEvent;
    const openActions = pulseSnapshot.openNextActions ?? [];
    const stageEntries = Object.entries(crmSnapshot.stageDistribution ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);
    const topFocus = equilibrium?.summary?.top_next_actions ?? [];
    const cashNowSignal = `Cash-now lane: book/convert warm individual calls; current focus asks for $4K now, then $7K.`;
    const communitySignal = `Community-infrastructure lane: Oyi and Ariana are proof/pilot doors, not instant-cash doors.`;

    const command = {
      movement: {
        eyebrow: "Energy Ledger",
        title: "The field split into two operating lanes.",
        body:
          "Immediate paid clarity calls and slower community-infrastructure pilots are both alive. Treating them as one strategy creates noise; flying them as two lanes creates leverage.",
        bullets: [
          `Latest pulse: ${latest?.title ?? "none"}`,
          `Open loops: ${crmSnapshot.openItemsCount ?? 0}; relationships tracked: ${crmSnapshot.contactsCount ?? 0}`,
          `Recent proof movement: Oyi proposal review, Ariana pilot interest, Patricia/Chris reactivation, Sloan signal sent.`,
        ],
      },
      followups: {
        eyebrow: "Opportunity Field",
        title: "Follow up by energy type, not by inbox order.",
        body:
          "Each relationship is a different kind of door. The cockpit should help you stop treating cash, proof, legitimacy, and optionality as the same action.",
        bullets: [
          "Oyi: proof + first community-node door. Ask what Billwon / AI review surfaced; offer a simple implementation map.",
          "Ariana: legitimacy + pilot door. Send the platform link, reflect her infrastructure-building frame, propose mid-October pilot design.",
          "Patricia / Chris: cash-now doors. Offer exploration around fit and business clarity, not marketing advice.",
          ...openActions.slice(0, 2).map((item) => `${item.title}: ${item.next_action}`),
        ],
      },
      bottlenecks: {
        eyebrow: "Strategic Oracle",
        title: "The bottleneck is over-open loops diluting crystallization energy.",
        body:
          "There is enough clarity to act. The risk is carrying too many doors as equally active, which turns a living field into cognitive weather.",
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
        body:
          "Do not clarify the whole field again. Pick one cash action, one community-proof action, and one product-infrastructure action, then let the rest stay warm.",
        bullets: [
          cashNowSignal,
          communitySignal,
          "Product lane: turn this cockpit output into reusable prompts/functions before adding more UI.",
          ...(topFocus.length ? topFocus.slice(0, 2).map((text) => `Equilibrium focus: ${text}`) : []),
        ],
      },
    } satisfies Record<CockpitAction, { eyebrow: string; title: string; body: string; bullets: string[] }>;

    const mission =
      equilibrium?.state?.mission_override_text ??
      "Help humanity evolve into conscious coordination through unique-value clarity.";
    const strategy = equilibrium?.strategies?.[0]?.text ?? "Community/ecosystem pilots first; warm upstream partners over cold acquisition.";
    const nextMove =
      command.leverage.bullets[0] ?? latest?.next_action ?? "Choose the next move that is alive enough to do now.";

    return {
      latest,
      command,
      mission,
      strategy,
      nextMove,
      openActions,
      topFocus,
    };
  }, [equilibrium, isFounder]);

  const instruments: Array<{
    label: string;
    value: string;
    signal: string;
    icon: typeof Activity;
    tone: "gold" | "teal" | "blue" | "rose";
  }> = [
    {
      label: "Mission Vector",
      value: "97%",
      signal: clipped(model.mission, 118),
      icon: Compass,
      tone: "gold",
    },
    {
      label: "Founder State",
      value: `${equilibrium?.summary?.focus_count ?? 0}/3`,
      signal: "Focus slots active; force must stay selective.",
      icon: Gauge,
      tone: "teal",
    },
    {
      label: "Opportunity Field",
      value: isFounder ? `${crmSnapshot.openItemsCount ?? 0}` : "N/A",
      signal: isFounder
        ? "Open loops need classification by cash, proof, infrastructure, optionality."
        : "Fills in as you build your venture.",
      icon: Radar,
      tone: "blue",
    },
    {
      label: "Energy Ledger",
      value: isFounder ? `$${crmSnapshot.cashReceivedUsd ?? 0}` : "N/A",
      signal: isFounder
        ? `${crmSnapshot.energyLeakCount ?? 0} marked leaks; $${crmSnapshot.revShareContractsUsd ?? 0} rev-share pending.`
        : "Fills in as you build your venture.",
      icon: Waves,
      tone: "rose",
    },
    {
      label: "Strategic Oracle",
      value: "2 lanes",
      signal: "Cash-now and community-infrastructure must fly separately.",
      icon: Sparkles,
      tone: "gold",
    },
    {
      label: "Readiness Signal",
      value: "Alive",
      signal: "The next move is not more theory; it is selective crystallization.",
      icon: Signal,
      tone: "teal",
    },
    {
      label: "Next Move Engine",
      value: "3 moves",
      signal: "One cash action, one proof action, one product action.",
      icon: Crosshair,
      tone: "blue",
    },
    {
      label: "Field Coherence",
      value: "Good",
      signal: "Mission, product, CRM, and pulse are converging around living-project navigation.",
      icon: Zap,
      tone: "gold",
    },
  ];

  const toneClass = {
    gold: "border-[#d6a84d]/45 bg-[#201608] text-[#f6d58a]",
    teal: "border-[#4ecdc4]/35 bg-[#071d1d] text-[#93f0e8]",
    blue: "border-[#6aa7ff]/35 bg-[#081527] text-[#a8cfff]",
    rose: "border-[#f0a37a]/35 bg-[#24100d] text-[#ffc0a5]",
  };

  const active = model.command[activeAction];

  return (
    <main className="min-h-screen bg-[#07090d] text-[#f6efe3]">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-5 flex flex-col gap-4 border-b border-[#d6a84d]/20 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#d6a84d]">
              <ShieldCheck className="h-4 w-4" />
              Founder Life's Work Navigation
            </p>
            <h1 className="font-serif text-4xl leading-none text-[#fff7e8] md:text-6xl">
              Navigate one living system.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#cfc4b5]">
              Founder Cockpit is the source of project self-awareness: mission, relationships, pulses,
              Equilibrium, and the next move that is alive now.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadContext()}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-[#d6a84d]/35 bg-[#15100a] px-4 text-sm font-medium text-[#f6d58a] transition hover:border-[#f6d58a]/70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </header>

        <section className="mb-5 rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
              <Radar className="h-4 w-4" />
              Founder Pulse · Autonomous Read
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {(["daily", "weekly"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setActivePulseKind(kind)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    activePulseKind === kind
                      ? "border-[#f6d58a] bg-[#f6d58a] text-[#111827]"
                      : "border-white/15 bg-[#07090d] text-[#cfc4b5] hover:border-[#d6a84d]/55"
                  }`}
                >
                  {kind === "daily" ? "Daily" : "Weekly"}
                </button>
              ))}
              {isFounder && (
                <button
                  type="button"
                  onClick={() => void generatePulse(activePulseKind)}
                  disabled={pulseGenKind !== null}
                  className="inline-flex items-center gap-2 rounded-full border border-[#4ecdc4]/35 bg-[#071d1d] px-3 py-1 text-xs text-[#93f0e8] transition hover:border-[#93f0e8]/70 disabled:opacity-60"
                >
                  {pulseGenKind ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                  Pulse now
                </button>
              )}
            </div>
          </div>

          {pulseError && (
            <p className="mb-3 rounded-lg border border-[#f0a37a]/35 bg-[#24100d] p-3 text-sm text-[#ffc0a5]">
              {pulseError}
            </p>
          )}

          {(() => {
            if (!isFounder) {
              return (
                <p className="text-sm leading-6 text-[#9ea7b3]">
                  Your pulse fills in as your venture grows.
                </p>
              );
            }
            const brief = pulseBriefs[activePulseKind];
            if (!brief) {
              return (
                <p className="text-sm leading-6 text-[#9ea7b3]">
                  No {activePulseKind} brief yet. The pulse runs on its own — daily at 8:00 and 20:00,
                  weekly on Monday mornings — or press Pulse now.
                </p>
              );
            }
            return (
              <div className="rounded-xl border border-white/10 bg-[#07090d] p-5">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-serif text-2xl leading-tight text-[#fff7e8]">{brief.title ?? "Founder Pulse"}</h2>
                  <span className="text-xs text-[#9ea7b3]">{formatDate(brief.created_at)}</span>
                </div>
                {brief.bottom_line && (
                  <p className="mb-4 border-l-2 border-[#d6a84d] pl-3 text-base leading-7 text-[#f6efe3]">
                    {brief.bottom_line}
                  </p>
                )}
                {(brief.content?.signals ?? []).length > 0 && (
                  <ul className="mb-4 space-y-2">
                    {(brief.content?.signals ?? []).map((signal, index) => (
                      <li key={index} className="text-sm leading-6 text-[#cfc4b5]">
                        — {signal}
                      </li>
                    ))}
                  </ul>
                )}
                {brief.content?.move && (
                  <p className="text-sm leading-6">
                    <span className="mr-2 text-xs uppercase tracking-[0.14em] text-[#93f0e8]">Move</span>
                    <span className="text-[#f6efe3]">{brief.content.move}</span>
                  </p>
                )}
              </div>
            );
          })()}
        </section>

        <section className="mb-5 rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
              <Crosshair className="h-4 w-4" />
              Offer Cadence · Controllable Input
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#9ea7b3]">
                Revenue is the lagging output. Offers made is the input you control.
              </span>
              {isFounder && (
                <Link
                  to="/build/cockpit/offers"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#93f0e8] transition hover:text-[#c7fffa]"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Open offers board
                </Link>
              )}
            </div>
          </div>

          {!isFounder ? (
            <p className="rounded-lg border border-white/10 bg-[#07090d] p-4 text-sm leading-6 text-[#9ea7b3]">
              Fills in as you build your venture.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[0.55fr_1fr]">
              <div className="rounded-xl border border-white/10 bg-[#07090d] p-5">
                <p className="text-sm text-[#9ea7b3]">Offers made · this week</p>
                <p className="mt-2 text-5xl font-semibold text-[#f6d58a]">{offerMetrics.thisWeek.total}</p>
                <p className="mt-2 text-xs text-[#9ea7b3]">
                  Last week: {offerMetrics.lastWeek.total}
                </p>
                {offerRecent.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                    {offerRecent.map((row) => (
                      <li key={`${row.dateSent}-${row.name}-${row.segmentOrCampaign}`} className="text-xs leading-5 text-[#cfc4b5]">
                        {row.segmentOrCampaign} → {row.name}
                        {row.quantity > 1 ? ` × ${row.quantity}` : ""} · {row.dateSent}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-[#07090d] p-5">
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-[#93f0e8]">Maintained by Pulse</p>
                <p className="text-sm leading-6 text-[#cfc4b5]">
                  Report a client movement once. Pulse updates the relationship state, offer ledger,
                  follow-up, and cockpit projection together.
                </p>
                <Link
                  to="/build/cockpit/offers"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#f6d58a] transition hover:text-[#fff7e8]"
                >
                  Review open offers <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </section>

        <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5 shadow-[0_0_50px_-30px_rgba(214,168,77,0.8)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d6a84d]">Center Screen · Living Venture</p>
              <span className="rounded-full border border-[#4ecdc4]/30 bg-[#071d1d] px-3 py-1 text-xs text-[#93f0e8]">
                {isFounder ? pulseSnapshot.latestEvent?.phase_shift_significance ?? "unscored" : "N/A"}
              </span>
            </div>
            <div className="grid min-h-[230px] place-items-center rounded-xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(214,168,77,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
              <div className="w-full max-w-3xl">
                <div className="mb-5 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-[0.16em] text-[#9fb7d7]">
                  <span>Mission</span>
                  <span>Relationships</span>
                  <span>Market</span>
                </div>
                <div className="relative h-24">
                  <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f6d58a] shadow-[0_0_50px_14px_rgba(246,213,138,0.45)]" />
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="absolute h-px origin-left bg-gradient-to-r from-[#f6d58a] to-transparent"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: `${120 + i * 28}px`,
                        transform: `rotate(${i * 31 - 80}deg)`,
                      }}
                    />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <span
                      key={i}
                      className="absolute h-2.5 w-2.5 rounded-full border border-[#f6d58a]/70 bg-[#0d1117]"
                      style={{
                        left: `${12 + (i % 4) * 24}%`,
                        top: `${18 + Math.floor(i / 4) * 48}%`,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-5 text-center font-serif text-2xl text-[#fff7e8]">
                  {isFounder ? pulseSnapshot.latestEvent?.title ?? "Awaiting next pulse" : "Fills in as you build your venture"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">Mission Vector</p>
            <div className="rounded-xl border border-white/10 bg-[#07090d] p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-[#9ea7b3]">True north alignment</p>
                  <p className="mt-2 text-5xl font-semibold text-[#f6d58a]">97%</p>
                </div>
                <Compass className="h-16 w-16 text-[#f6d58a]" />
              </div>
              <p className="mt-4 text-sm leading-6 text-[#cfc4b5]">{clipped(model.strategy, 250)}</p>
            </div>
          </section>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {instruments.map((instrument) => {
            const Icon = instrument.icon;
            return (
              <section key={instrument.label} className={`rounded-2xl border p-4 ${toneClass[instrument.tone]}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-80">{instrument.label}</p>
                  <Icon className="h-5 w-5 opacity-90" />
                </div>
                <p className="text-3xl font-semibold">{instrument.value}</p>
                <p className="mt-3 min-h-[66px] text-sm leading-6 text-[#f6efe3]/72">{instrument.signal}</p>
              </section>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">Command Surface</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {actionCards.map((action) => {
                const Icon = action.icon;
                const isActive = action.id === activeAction;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setActiveAction(action.id)}
                    className={`min-h-[116px] rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-[#f6d58a] bg-[#f6d58a] text-[#111827] shadow-[0_0_34px_-16px_rgba(246,213,138,0.9)]"
                        : "border-white/10 bg-[#07090d] text-[#f6efe3] hover:border-[#d6a84d]/55"
                    }`}
                  >
                    <Icon className="mb-3 h-5 w-5" />
                    <p className="font-semibold">{action.label}</p>
                    <p className={`mt-1 text-xs uppercase tracking-[0.14em] ${isActive ? "text-[#4b3820]" : "text-[#9ea7b3]"}`}>
                      {action.instrument}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
                  <Sparkles className="h-4 w-4" />
                  {active.eyebrow}
                </p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-[#fff7e8]">{active.title}</h2>
              </div>
              <span className="w-fit rounded-full border border-[#4ecdc4]/30 bg-[#071d1d] px-3 py-1 text-xs text-[#93f0e8]">
                {activeAction === "leverage" ? "act now" : "read field"}
              </span>
            </div>
            <p className="text-base leading-7 text-[#cfc4b5]">{active.body}</p>
            <div className="mt-5 space-y-3">
              {active.bullets.map((bullet, index) => (
                <div key={`${bullet}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-[#07090d] p-4 text-sm leading-6 text-[#e9ddca]">
                  <Waypoints className="mt-1 h-4 w-4 shrink-0 text-[#f6d58a]" />
                  <p>{bullet}</p>
                </div>
              ))}
            </div>
            {isFounder ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void runPrimaryRead()}
                  disabled={primaryLoading}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d6a84d]/35 bg-[#15100a] px-4 text-sm font-medium text-[#f6d58a] transition hover:border-[#f6d58a]/70 disabled:cursor-wait disabled:opacity-65"
                >
                  {primaryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                  Run live AI read
                </button>
                <button
                  type="button"
                  onClick={() => void copyPrimaryMarkdown()}
                  disabled={!primaryResult}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-[#07090d] px-4 text-sm font-medium text-[#cfc4b5] transition hover:border-[#d6a84d]/45 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Copy className="h-4 w-4" />
                  {primaryCopied ? "Copied" : "Copy read"}
                </button>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-white/10 bg-[#07090d] p-4 text-sm leading-6 text-[#9ea7b3]">
                N/A — available as your venture data grows.
              </p>
            )}

            {isFounder && primaryError && (
              <p className="mt-4 rounded-xl border border-[#f0a37a]/30 bg-[#24100d] p-3 text-sm leading-6 text-[#ffc0a5]">
                {primaryError}
              </p>
            )}

            {isFounder && primaryResult && (
              <div className="mt-4 space-y-3 rounded-xl border border-[#4ecdc4]/25 bg-[#071d1d] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#93f0e8]">Live AI Read</p>
                <h3 className="font-serif text-2xl leading-tight text-[#fff7e8]">{primaryResult.title}</h3>
                <p className="text-sm leading-6 text-[#d8fffb]">{primaryResult.bottomLine}</p>
                <div className="grid gap-2">
                  {primaryResult.evidence.slice(0, 3).map((item, index) => (
                    <p key={`${item}-${index}`} className="rounded-lg border border-white/10 bg-[#07090d] p-3 text-sm leading-6 text-[#e9ddca]">
                      {item}
                    </p>
                  ))}
                </div>
                <p className="text-sm leading-6 text-[#cfc4b5]">
                  <span className="text-[#f6d58a]">Move:</span> {primaryResult.recommendedMove}
                </p>
              </div>
            )}
          </section>
        </div>

        {!isFounder ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
              <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
                <BrainCircuit className="h-4 w-4" />
                AI Lens Lab
              </p>
              <p className="rounded-xl border border-white/10 bg-[#07090d] p-5 text-sm leading-6 text-[#9ea7b3]">
                N/A — available as your venture data grows.
              </p>
            </section>
            <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d6a84d]">Review Screen</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight text-[#fff7e8]">Fills in as you build your venture.</h2>
              <p className="mt-4 rounded-xl border border-white/10 bg-[#07090d] p-5 text-sm leading-6 text-[#9ea7b3]">
                N/A — available as your venture data grows.
              </p>
            </section>
          </div>
        ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
              <BrainCircuit className="h-4 w-4" />
              AI Lens Lab
            </p>
            <div className="grid gap-3">
              {cockpitLenses.map((lens) => {
                const isActive = lens.id === activeLensId;
                return (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => void runLens(lens.id)}
                    disabled={lensLoading}
                    className={`rounded-xl border p-4 text-left transition disabled:cursor-wait disabled:opacity-70 ${
                      isActive
                        ? "border-[#f6d58a] bg-[#201608] text-[#fff7e8] shadow-[0_0_34px_-18px_rgba(246,213,138,0.85)]"
                        : "border-white/10 bg-[#07090d] text-[#f6efe3] hover:border-[#d6a84d]/55"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{lens.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#9ea7b3]">{lens.instrument}</p>
                      </div>
                      {lensLoading && isActive ? <Loader2 className="h-4 w-4 animate-spin text-[#f6d58a]" /> : <Sparkles className="h-4 w-4 text-[#f6d58a]" />}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#cfc4b5]">{lens.question}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-[#4ecdc4]/25 bg-[#071d1d] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#93f0e8]">Equilibrium Upgrade</p>
              <h3 className="mt-2 font-serif text-2xl leading-tight text-[#fff7e8]">Refine My Operating System</h3>
              <p className="mt-2 text-sm leading-6 text-[#cfc4b5]">
                Suggest the top three changes that preserve signal and remove noise from current strategies, workstreams, and tasks.
              </p>
              <button
                type="button"
                onClick={() => void runLens("refine-operating-system")}
                disabled={lensLoading}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#4ecdc4]/35 bg-[#071d1d] px-4 text-sm font-medium text-[#93f0e8] transition hover:border-[#93f0e8]/70 disabled:cursor-wait disabled:opacity-65"
              >
                {lensLoading && activeLensId === "refine-operating-system" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                Review top 3 changes
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#d6a84d]">Review Screen</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-[#fff7e8]">
                  {lensResult?.title ?? "Run a lens to read the field."}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void copyLensMarkdown()}
                disabled={!lensResult}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-[#d6a84d]/35 bg-[#15100a] px-4 text-sm font-medium text-[#f6d58a] transition hover:border-[#f6d58a]/70 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy as markdown"}
              </button>
            </div>

            {lensLoading && (
              <div className="grid min-h-[260px] place-items-center rounded-xl border border-white/10 bg-[#07090d] p-6 text-[#cfc4b5]">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#f6d58a]" />
                  <p>Reading Equilibrium, pulse, CRM, and holomap context...</p>
                </div>
              </div>
            )}

            {!lensLoading && lensError && (
              <div className="rounded-xl border border-[#f0a37a]/30 bg-[#24100d] p-4 text-sm leading-6 text-[#ffc0a5]">
                {lensError}
              </div>
            )}

            {!lensLoading && !lensError && lensResult && (
              <div className="space-y-4">
                <p className="rounded-xl border border-[#4ecdc4]/30 bg-[#071d1d] p-4 text-base leading-7 text-[#d8fffb]">
                  {lensResult.bottomLine}
                </p>
                <div className="grid gap-3">
                  {lensResult.evidence.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-[#07090d] p-4 text-sm leading-6 text-[#e9ddca]">
                      {activeLensId === "refine-operating-system" ? (
                        <button
                          type="button"
                          onClick={() => toggleEvidenceSelection(index)}
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs transition ${
                            selectedEvidence.includes(index)
                              ? "border-[#93f0e8] bg-[#071d1d] text-[#93f0e8]"
                              : "border-[#f6d58a]/45 text-[#f6d58a]"
                          }`}
                          aria-label={`Select change ${index + 1}`}
                        >
                          {selectedEvidence.includes(index) ? "✓" : index + 1}
                        </button>
                      ) : (
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#f6d58a]/45 text-xs text-[#f6d58a]">
                          {index + 1}
                        </span>
                      )}
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#07090d] p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#d6a84d]">Consequence</p>
                    <p className="text-sm leading-6 text-[#cfc4b5]">{lensResult.consequence}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#07090d] p-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#d6a84d]">Recommended Move</p>
                    <p className="text-sm leading-6 text-[#cfc4b5]">{lensResult.recommendedMove}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#07090d] p-4">
                  <button
                    type="button"
                    onClick={() => void acceptSelectedChanges()}
                    disabled={applyLoading || activeLensId !== "refine-operating-system"}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#4ecdc4]/35 bg-[#071d1d] px-4 text-sm font-medium text-[#93f0e8] transition hover:border-[#93f0e8]/70 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {applyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Accept selected changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision("later")}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d6a84d]/35 bg-[#15100a] px-4 text-sm font-medium text-[#f6d58a] transition hover:border-[#f6d58a]/70"
                  >
                    Apply later
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision("skipped")}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 text-sm font-medium text-[#cfc4b5] transition hover:border-white/25"
                  >
                    Skip
                  </button>
                  <p className="text-sm leading-6 text-[#9ea7b3]">
                    {reviewDecision === "accepted" && "Changes applied to Equilibrium."}
                    {reviewDecision === "later" && "Marked for later review. Nothing has been written back yet."}
                    {reviewDecision === "skipped" && "Skipped locally. Nothing has been written back."}
                    {!reviewDecision && activeLensId === "refine-operating-system" && "Select the changes to save. AI proposes; Sasha decides before anything writes back."}
                    {!reviewDecision && activeLensId !== "refine-operating-system" && "Review only. Writeback is enabled for Refine My Operating System first."}
                  </p>
                </div>
                {applyError && (
                  <p className="rounded-xl border border-[#f0a37a]/30 bg-[#24100d] p-3 text-sm leading-6 text-[#ffc0a5]">
                    {applyError}
                  </p>
                )}
              </div>
            )}

            {!lensLoading && !lensError && !lensResult && (
              <p className="rounded-xl border border-white/10 bg-[#07090d] p-5 text-sm leading-6 text-[#cfc4b5]">
                These buttons call the live AI lens. They do not write back into Equilibrium yet.
              </p>
            )}
          </section>
        </div>
        )}

        <footer className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
              <Database className="h-4 w-4" />
              Context Feed
            </p>
            <div className="grid gap-3 text-sm text-[#cfc4b5] sm:grid-cols-3">
              <p>Pulse: <span className="text-[#fff7e8]">{isFounder ? formatDate(pulseSnapshot.generated_at) : "N/A"}</span></p>
              <p>CRM: <span className="text-[#fff7e8]">{isFounder ? formatDate(crmSnapshot.generated_at) : "N/A"}</span></p>
              <p>Equilibrium: <span className={error ? "text-[#ffc0a5]" : "text-[#fff7e8]"}>{error ? "not loaded" : formatDate(equilibrium?.generated_at)}</span></p>
            </div>
            {error && (
              <p className="mt-3 rounded-xl border border-[#f0a37a]/30 bg-[#24100d] p-3 text-sm leading-6 text-[#ffc0a5]">
                {error}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">FMC · Next Move Engine</p>
            <p className="font-serif text-2xl text-[#fff7e8]">Call the next door that can become real.</p>
            <p className="mt-2 text-sm leading-6 text-[#cfc4b5]">{model.nextMove}</p>
          </section>
        </footer>
      </section>
    </main>
  );
}
