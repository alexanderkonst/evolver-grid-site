/**
 * improve-artifact — Unique Business Builder v2.0
 *
 * Applies the 27-perspective holonic roast to a single artifact and returns
 * an improved version. Enforces the monotonic specificity invariant.
 *
 * Spec: docs/specs/unique-business-builder/improve_roast_prompt.md
 * Model: google/gemini-2.5-flash via Lovable AI Gateway
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  ARTIFACT_CONFIGS,
  ROAST_PROTOCOL,
  MODEL,
  AI_GATEWAY_URL,
  type ArtifactKey,
} from "../_shared/ubb-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ImproveBody = {
  artifact_key: ArtifactKey;
  current_content: unknown;
  current_specificity: number;
  sibling_artifacts: Record<string, { content: unknown; specificity: number }>;
  root_context: {
    zog_snapshot: Record<string, unknown>;
    excalibur_data?: Record<string, unknown>;
  };
  previous_versions?: unknown[];
};

type ImproveResult = {
  roast_findings: Array<{ quadrant: string; weakness: string }>;
  improved_content: unknown;
  what_changed: string;
  specificity_score: number;
  specificity_delta: number;
  crystallized_action: string;
  diminishing_returns: boolean;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ImproveBody;
    const {
      artifact_key,
      current_content,
      current_specificity,
      sibling_artifacts,
      root_context,
      previous_versions = [],
    } = body;

    if (!artifact_key || current_content === undefined || current_specificity === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = ARTIFACT_CONFIGS[artifact_key];
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Unknown artifact_key: ${artifact_key}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system + user prompts
    const systemPrompt = `You are applying the 27-perspective holonic roast to a unique business artifact.
Your goal: identify what the current version is missing, and produce an improved version that holds MORE specificity.

Specificity means: the version reads less like something generic and more like something only THIS founder, for THIS tribe, at THIS moment, could have said. Specificity is distinguishability from noise.

You are NOT a copywriter. You are a holonic seeing instrument. You check architecture, surface blind spots, sharpen the signal.

You have ONE job: produce a version with higher specificity. If you cannot, admit it cleanly with diminishing_returns: true.

SOURCE PLAYBOOK: ${config.sourcePlaybook}`;

    const siblingSummary = Object.entries(sibling_artifacts || {})
      .map(([k, v]) => `- ${k} (specificity ${v.specificity}): ${JSON.stringify(v.content).slice(0, 400)}`)
      .join("\n");

    const zog = root_context?.zog_snapshot || {};
    const rootSummary = [
      `- Top talent: ${(zog as any).top_three_talents || "—"}`,
      `- Archetype: ${(zog as any).archetype_title || "—"}`,
      `- Core pattern: ${(zog as any).core_pattern || "—"}`,
      root_context?.excalibur_data ? `- Legacy business: ${JSON.stringify(root_context.excalibur_data).slice(0, 400)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const previousSummary = previous_versions.length
      ? previous_versions
          .slice(0, 3)
          .map((v, i) => `v${i + 1}: ${JSON.stringify(v).slice(0, 300)}`)
          .join("\n---\n")
      : "(none)";

    const userPrompt = `ARTIFACT: ${artifact_key} — ${config.label}

SPECIFICITY CRITERIA FOR THIS ARTIFACT:
${config.specificityCriteria.map((c) => `• ${c}`).join("\n")}

CURRENT CONTENT (specificity ${current_specificity}):
${JSON.stringify(current_content, null, 2)}

SIBLING LOCKED ARTIFACTS (context — preserve coherence):
${siblingSummary || "(none yet)"}

ROOT CONTEXT (the founder's seed):
${rootSummary}

PREVIOUS VERSIONS (what was already tried — don't repeat):
${previousSummary}

---

${ROAST_PROTOCOL}

---

RETURN STRICT JSON matching this shape:

{
  "roast_findings": [
    { "quadrant": "UL|UR|LL|LR|13|depth|27", "weakness": "<one sentence>" }
    // 2-5 findings, each must map to a concrete change
  ],
  "improved_content": ${config.outputSchema},
  "what_changed": "<one sentence describing the delta>",
  "specificity_score": <float 0-10, MUST be > ${current_specificity} unless diminishing_returns=true>,
  "specificity_delta": <float, new minus ${current_specificity}>,
  "crystallized_action": "<the ONE irreversible next action this artifact names>",
  "diminishing_returns": <boolean>
}

Return ONLY the JSON. No explanation.`;

    // Call Lovable AI Gateway
    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "insufficient_credit" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "model_error", detail: `${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return new Response(
        JSON.stringify({ error: "model_error", detail: "empty response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strip common code fences
    if (content.startsWith("```json")) content = content.slice(7);
    if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);
    content = content.trim();

    let result: ImproveResult;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse failed:", content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "invalid_json" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enforce monotonic invariant — override if model lied
    if (
      typeof result.specificity_delta === "number" &&
      result.specificity_delta < 0 &&
      !result.diminishing_returns
    ) {
      result.diminishing_returns = true;
    }

    // If diminishing returns, zero out the delta to be explicit
    if (result.diminishing_returns) {
      result.specificity_score = current_specificity;
      result.specificity_delta = 0;
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in improve-artifact:", error);
    return new Response(
      JSON.stringify({
        error: "model_error",
        detail: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
