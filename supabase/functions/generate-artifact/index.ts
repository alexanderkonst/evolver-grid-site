/**
 * generate-artifact — Unique Business Builder v2.0
 *
 * Produces v1 of an artifact from the ZoG seed + any locked sibling artifacts.
 *
 * Spec: docs/specs/unique-business-builder/artifact_prompts_spec.md
 * Model: google/gemini-2.5-flash via Lovable AI Gateway
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  ARTIFACT_CONFIGS,
  SYNTHESIS_PROTOCOL_PROMPT,
  UBB_LANGUAGE_GUIDELINES,
  UBB_DISTILLATION_DIRECTIVE,
  MODEL,
  AI_GATEWAY_URL,
  type ArtifactKey,
} from "../_shared/ubb-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GenerateBody = {
  artifact_key: ArtifactKey;
  sibling_artifacts: Record<string, { content: unknown; specificity: number }>;
  root_context: {
    zog_snapshot: Record<string, unknown>;
    excalibur_data?: Record<string, unknown>;
  };
};

type GenerateResult = {
  content: unknown;
  initial_specificity: number;
  crystallized_action: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GenerateBody;
    const { artifact_key, sibling_artifacts, root_context } = body;

    if (!artifact_key) {
      return new Response(
        JSON.stringify({ error: "Missing artifact_key" }),
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

    const systemPrompt = `${UBB_LANGUAGE_GUIDELINES}

---

${UBB_DISTILLATION_DIRECTIVE}

---

You are generating the FIRST version of a unique business artifact for a founder.

Your output is a working draft — not a polished final. It's meant to be read and then refined via the Improve loop (which applies a 27-perspective holonic roast). Aim for initial specificity in the 5–7 range. The Improve loop will iterate it up from there.

Keep it honest. Don't perform thoroughness. If the seed context is thin, the draft will be thin — that's correct. The founder sharpens from there.

SOURCE PLAYBOOK: ${config.sourcePlaybook}

---

${SYNTHESIS_PROTOCOL_PROMPT}`;

    const siblingSummary = Object.entries(sibling_artifacts || {})
      .map(([k, v]) => `- ${k}: ${JSON.stringify(v.content).slice(0, 400)}`)
      .join("\n");

    const zog = root_context?.zog_snapshot || {};
    const rootSummary = [
      `- Top talent: ${(zog as any).top_three_talents || "—"}`,
      `- Archetype: ${(zog as any).archetype_title || "—"}`,
      `- Core pattern: ${(zog as any).core_pattern || "—"}`,
      `- How genius shows up: ${(zog as any).how_genius_shows_up || "—"}`,
      root_context?.excalibur_data ? `- Legacy business data: ${JSON.stringify(root_context.excalibur_data).slice(0, 400)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const userPrompt = `ARTIFACT: ${artifact_key} — ${config.label}

SPECIFICITY CRITERIA (what this artifact needs to become over iterations):
${config.specificityCriteria.map((c) => `• ${c}`).join("\n")}

GENERATION GUIDANCE:
${config.generationGuidance}

SIBLING LOCKED ARTIFACTS (context):
${siblingSummary || "(none yet — this is likely the first artifact)"}

ROOT CONTEXT (the founder's seed):
${rootSummary}

---

Produce a v1 draft. JSON only.

The "content" object MUST include "_energies" and "_distillation" fields per
the SYNTHESIS PROTOCOL above, ALONGSIDE this artifact's specific fields:

{
  "content": {
    "_energies": ["<kept signal-energy 1>", "<kept signal-energy 2>", ...],
    "_distillation": "<one sentence containing every _energies item>",
    ...${config.outputSchema.replace(/^\{|\}$/g, "").trim()}
  },
  "initial_specificity": <float 0-10, typically 5-7 for a first draft>,
  "crystallized_action": "<the ONE irreversible next action this draft names>"
}

Return ONLY the JSON. No explanation. The energies list and distillation are
mandatory, not optional.`;

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

    if (content.startsWith("```json")) content = content.slice(7);
    if (content.startsWith("```")) content = content.slice(3);
    if (content.endsWith("```")) content = content.slice(0, -3);
    content = content.trim();

    let result: GenerateResult;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse failed:", content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "invalid_json" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-artifact:", error);
    return new Response(
      JSON.stringify({
        error: "model_error",
        detail: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
