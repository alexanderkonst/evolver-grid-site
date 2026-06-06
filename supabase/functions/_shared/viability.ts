/**
 * viability.ts — Vision ↔ Viability axis (Domain 93)
 *
 * The SECOND adversarial axis, beside the fidelity roast. Where roasting refines
 * an artifact toward essence-truth, the viability crash-test asks whether the
 * artifact survives contact with real, busy, defensive humans.
 *
 * Design (per Sasha, 2026-06-05): a SECOND, INDEPENDENT pass. The burner is not
 * the lover — the crash-test runs in a fresh adversarial context so it cannot
 * grade its own homework. It is best-effort: if it fails, it returns null and
 * never breaks the artifact generation/improvement that precedes it.
 *
 * Refs:
 *   docs/01-vision/phase_shift_technology_library.md  (Domain 93)
 *   docs/05-reference/roasting_protocol.md            (the fidelity axis)
 *   docs/specs/vision-viability/planning_sow.md       (this build's SOW + DoD)
 */

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Matches the platform default. Tunable: bump to a sharper model for a tougher
// adversary if the crash-test reads soft.
const DEFAULT_VIABILITY_MODEL = "google/gemini-2.5-flash-lite";

// The category-error guard. Essence-class artifacts are exempt: crash-testing a
// founder's soul-signal against "will a stranger buy this" is the wrong axis on
// the wrong object. Everything else (offer, positioning, pain, distribution,
// outreach, landing) is market-facing and gets the viability pass.
const VIABILITY_EXEMPT = new Set<string>(["uniqueness", "myth", "specificity_matrix"]);

export const isViabilityApplicable = (artifactKey: string): boolean =>
  !VIABILITY_EXEMPT.has(artifactKey);

export type ViabilityFinding = {
  // One of: trust | timing | language | cost | inertia | proof | action-friction
  dimension: string;
  risk: string;
};

export type Viability = {
  applicable: boolean;
  findings: ViabilityFinding[];
  // 0-10: "small enough to try AND real enough to matter."
  kinetic_calm: number;
  // The one buyer-native action that would make it real this week.
  next_move: string;
  // The most-exposed part rewritten to what survives the crash-test (may be "").
  surviving_seed: string;
};

// The crash-test instruction (the three-question loop of Domain 93, adapted to
// a single artifact). Verbatim-derived from Sasha's three questions.
export const CRASH_TEST_PROTOCOL = `THE VIABILITY CRASH-TEST (Vision ↔ Viability, Domain 93)

You are NOT refining this artifact for truth. The truth pass already ran.
You are testing it for SURVIVAL in the real world. Default to "it failed" unless it earns otherwise.

Run three moves on the artifact exactly as given:

1. STATE THE ASK. If a real, busy, slightly skeptical member of this founder's tribe met this artifact in the wild, what exactly are they being asked to believe, want, or do? Say it in one plain sentence, in THEIR words, not the founder's.

2. PRE-MORTEM. Assume that ask failed. It is six months later and no one acted. Explain why, concretely. Name the reasons a tired, busy, defensive, under-resourced human did not move. Use ONLY these dimensions: trust, timing, language, cost, inertia, proof, action-friction.

3. THE ASHES. What survived? Which part still holds, and what is the smallest, most buyer-native version of the ask that a stranger could act on THIS WEEK?

Then score KINETIC CALM, how close this is to "small enough to try AND real enough to matter":
- High (8-10): a stranger could act this week, the ask is concrete and in their language, and it still carries the founder's signal.
- Mid (4-7): real but with friction, or true but still a little intoxicated.
- Low (0-3): either manic (beautiful, but no one would move) or vague (movable, but generic and the signal is lost).

OUTPUT QUARANTINE: every string is plain founder/tribe language. No framework vocabulary anywhere except the "dimension" values.`;

const VIABILITY_SYSTEM_PROMPT = `You are a viability crash-tester: a seasoned operator who has watched hundreds of beautiful strategies die on contact with real, busy, defensive humans. Your loyalty is to what will actually survive next Tuesday, not to what is elegant. You are independent from whoever wrote this artifact; you did not make it and you owe it nothing. Be honest the way a pre-mortem is honest: assume failure first, then explain it. You output ONLY valid JSON, no markdown, no code fences.`;

/**
 * Run the viability crash-test as an independent second pass.
 * Best-effort: returns null on any failure so the caller's primary result stands.
 */
export async function runViabilityPass(args: {
  label: string;
  content: unknown;
  contextSummary: string;
  apiKey: string;
  model?: string;
}): Promise<Viability | null> {
  try {
    const userPrompt = `ARTIFACT UNDER CRASH-TEST: ${args.label}
${JSON.stringify(args.content, null, 2)}

WHO IT IS FOR (the founder's tribe and seed context):
${args.contextSummary || "(infer the implied audience from the artifact itself)"}

${CRASH_TEST_PROTOCOL}

Return STRICT JSON only, exactly this shape:
{
  "findings": [
    { "dimension": "trust|timing|language|cost|inertia|proof|action-friction", "risk": "<one sentence, plain buyer language>" }
  ],
  "kinetic_calm": <number 0-10>,
  "next_move": "<the one buyer-native action that makes it real this week>",
  "surviving_seed": "<the most-exposed part rewritten to what survives, or empty string>"
}
Return ONLY the JSON. 2 to 4 findings.`;

    const res = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model || DEFAULT_VIABILITY_MODEL,
        messages: [
          { role: "system", content: VIABILITY_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[viability] gateway not ok:", res.status);
      return null;
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    if (content.startsWith("```json")) content = content.slice(7);
    if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);
    content = content.trim();

    const parsed = JSON.parse(content);

    return {
      applicable: true,
      findings: Array.isArray(parsed.findings)
        ? parsed.findings
            .filter((f: unknown) => f && typeof f === "object")
            .slice(0, 5)
            .map((f: { dimension?: unknown; risk?: unknown }) => ({
              dimension: typeof f.dimension === "string" ? f.dimension : "proof",
              risk: typeof f.risk === "string" ? f.risk : "",
            }))
        : [],
      kinetic_calm:
        typeof parsed.kinetic_calm === "number"
          ? Math.max(0, Math.min(10, parsed.kinetic_calm))
          : 0,
      next_move: typeof parsed.next_move === "string" ? parsed.next_move : "",
      surviving_seed: typeof parsed.surviving_seed === "string" ? parsed.surviving_seed : "",
    };
  } catch (e) {
    console.error("[viability] pass failed (non-fatal):", e instanceof Error ? e.message : e);
    return null;
  }
}
