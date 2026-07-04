import { supabase } from "@/integrations/supabase/client";

export type CockpitLensId =
  | "movement"
  | "followups"
  | "bottlenecks"
  | "leverage"
  | "project-becoming"
  | "founder-shadow"
  | "attention-leaks"
  | "key-relationships"
  | "outdated-strategy"
  | "refine-operating-system";

export interface CockpitLensResult {
  title: string;
  bottomLine: string;
  evidence: string[];
  consequence: string;
  recommendedMove: string;
  confidence: "low" | "medium" | "high";
  markdown: string;
}

export const cockpitLenses: Array<{
  id: CockpitLensId;
  label: string;
  instrument: string;
  question: string;
}> = [
  {
    id: "project-becoming",
    label: "What Is the Project Becoming?",
    instrument: "Becoming Lens",
    question: "What deeper form is emerging through current movement?",
  },
  {
    id: "founder-shadow",
    label: "Current Founder Shadow",
    instrument: "Shadow Lens",
    question: "What is the current key founder shadow at play in blocking progress?",
  },
  {
    id: "attention-leaks",
    label: "Attention Leaks",
    instrument: "Focus Lens",
    question: "Where is attention leaking away from the real next move?",
  },
  {
    id: "key-relationships",
    label: "Key Relationships Now",
    instrument: "Relationship Lens",
    question: "Which relationship(s) matter most now, and why?",
  },
  {
    id: "outdated-strategy",
    label: "Outdated Strategy",
    instrument: "Strategy Decay Lens",
    question: "Which strategy is outdated, and what concrete change is becoming more obvious?",
  },
];

export const holomapContextSummary = `
The morphogenetic holomap is the project's strategic oracle. It reads the venture as a living system whose form changes through exchanges of energy: payments, proposals, referrals, silence, sessions, public artifacts, relationship openings, and product commitments.

Core stack:
- Mind: holomap reads meaning, phase, pattern, contradiction, and hero's-journey position.
- Heart: CRM records relationship energy, trust, proposals, money, referrals, silence, reciprocity, and open loops.
- Gut: dashboard/admin layer turns pulses into metrics, next actions, reminders, exports, and operational truth.

Current product meaning:
- Founder Cockpit / Living Project Holograph is becoming an AI-readable navigation system for the living relationship between founder and life's work.
- The cockpit should distinguish actual movement from cognitive weather.
- The project should route incoming pulses to the right surface: CRM for relationship energy, holomap for system meaning, roadmap for priority changes, product docs for crystallized product ideas, and pulse log for continuity.

Current known risk pattern:
- Too many live doors can be carried as equally active.
- Over-clarifying the whole field can delay crystallizing the few moves that would create cash, proof, or infrastructure now.
- The cockpit must help preserve signal while removing noise.
`.trim();

export async function runCockpitLens(params: {
  lensId: CockpitLensId;
  equilibrium: unknown;
  crmSnapshot: unknown;
  pulseSnapshot: unknown;
}): Promise<CockpitLensResult> {
  const { data, error } = await supabase.functions.invoke("cockpit-ai-lens", {
    body: {
      lensId: params.lensId,
      context: {
        equilibrium: params.equilibrium,
        crmSnapshot: params.crmSnapshot,
        pulseSnapshot: params.pulseSnapshot,
        holomapContext: holomapContextSummary,
      },
    },
  });

  if (error) {
    const status = typeof error === "object" && error && "context" in error
      ? (error as { context?: { status?: number } }).context?.status
      : undefined;
    if (status === 404) {
      throw new Error("The cockpit AI lens function is not deployed yet.");
    }
    if (status === 401) {
      throw new Error("You need Sasha/admin access to run this cockpit AI lens.");
    }
    throw new Error(error.message);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Cockpit lens returned an empty response.");
  }

  const result = data as Partial<CockpitLensResult>;
  if (!result.title || !result.bottomLine) {
    throw new Error("Cockpit lens returned an unreadable response.");
  }

  return {
    title: result.title,
    bottomLine: result.bottomLine,
    evidence: Array.isArray(result.evidence) ? result.evidence : [],
    consequence: result.consequence ?? "No consequence returned.",
    recommendedMove: result.recommendedMove ?? "No recommended move returned.",
    confidence: result.confidence ?? "medium",
    markdown: result.markdown ?? `# ${result.title}\n\n${result.bottomLine}`,
  };
}
