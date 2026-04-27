// Seed founder unique-business artifacts from canonical .md files into user_business_artifacts.
//
// Pilot/admin tool — gated by SEED_FOUNDER_TOKEN header. Not used by the app runtime.
//
// Request body: { founder_slug: string, artifact_key: ArtifactKey, dry_run: boolean }
// Response:     { extracted: object, action: "dry_run"|"replaced"|"inserted", rows_deleted?: number, new_row_id?: string }

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  ARTIFACT_CONFIGS,
  type ArtifactKey,
  SYNTHESIS_PROTOCOL_PROMPT,
  AI_GATEWAY_URL,
} from "../_shared/ubb-prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-seed-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Founder slug -> { user_id, md_path, default_specificity }
// Only Alexander wired now; expand when others are migrated.
const FOUNDERS: Record<string, { user_id: string; md_path: string; default_specificity: number }> = {
  alexander: {
    user_id: "39e554f8-90ef-48f5-ae0a-9e20d375d57f",
    md_path: "docs/02-strategy/unique-businesses/alexanders_unique_business.md",
    default_specificity: 9.5,
  },
};

const STEP_NUMBER_BY_KEY: Record<ArtifactKey, number> = {
  uniqueness: 1, myth: 2, tribe: 3, pain: 4, promise: 5,
  lead_magnet: 6, value_ladder: 7, specificity_matrix: 8, session_bridge: 9,
  core_belief: 10, packaging: 11, frictionless_purchase: 12, reach: 13,
  delivery: 14, spread: 15, surface_inventory: 16, tuning_fork: 17,
  golden_dm: 18, landing_page: 19,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Token gate
  const expectedToken = Deno.env.get("SEED_FOUNDER_TOKEN");
  const providedToken = req.headers.get("x-seed-token");
  if (!expectedToken || providedToken !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { founder_slug, artifact_key, dry_run = true, source_md_text } = await req.json();

    const founder = FOUNDERS[founder_slug];
    if (!founder) {
      return jsonError(400, `Unknown founder_slug: ${founder_slug}. Known: ${Object.keys(FOUNDERS).join(", ")}`);
    }
    const config = ARTIFACT_CONFIGS[artifact_key as ArtifactKey];
    if (!config) {
      return jsonError(400, `Unknown artifact_key: ${artifact_key}`);
    }

    // The .md is in the repo, not the function bundle. Caller passes its text.
    if (!source_md_text || typeof source_md_text !== "string" || source_md_text.length < 1000) {
      return jsonError(400, "source_md_text must be passed (read the .md from repo and POST it).");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonError(500, "LOVABLE_API_KEY not configured");

    // Build extraction prompt
    const systemPrompt = `You are extracting a single artifact from a founder's canonical Unique Business Builder document.

The document is the GROUND TRUTH for this founder. It supersedes any prior database content.

Your task: read the entire document, then extract the "${config.label}" artifact (key: ${artifact_key}).

EXTRACTION RULES:
- Use ONLY content present in the document. Do not invent or paraphrase.
- If the document has multiple framings of this artifact, synthesize the latest / most refined.
- Preserve the founder's exact voice and signature phrases.
- If a required schema field is genuinely absent from the document, use the closest semantically-equivalent content. Never leave a field empty.

OUTPUT SCHEMA (the structured fields):
${config.outputSchema}

PLUS — the SYNTHESIS PROTOCOL fields:
${SYNTHESIS_PROTOCOL_PROMPT}

Return a single JSON object combining the structured fields above AND the _energies + _distillation fields from the synthesis protocol. No prose outside the JSON.`;

    const userPrompt = `FOUNDER DOCUMENT (canonical .md):

\`\`\`markdown
${source_md_text}
\`\`\`

Extract the "${config.label}" artifact (key: ${artifact_key}) per the schema and synthesis protocol above.`;

    const aiRes = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) return jsonError(429, "AI rate limit. Retry shortly.");
    if (aiRes.status === 402) return jsonError(402, "AI credits exhausted.");
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return jsonError(502, `AI gateway error ${aiRes.status}: ${txt.slice(0, 500)}`);
    }

    const aiData = await aiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) return jsonError(502, "AI returned no content");

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(rawContent);
    } catch (_e) {
      return jsonError(502, `AI returned non-JSON: ${rawContent.slice(0, 500)}`);
    }

    // Stamp migration provenance
    extracted._migration_source = `${founder.md_path} @ 2026-04-26`;
    extracted._migration_method = "seed-founder-docs edge function (google/gemini-2.5-flash)";

    if (dry_run) {
      return new Response(
        JSON.stringify({
          extracted,
          action: "dry_run",
          founder: founder_slug,
          artifact_key,
          would_replace_user_id: founder.user_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Live: delete old rows for this user + key, insert new locked v1.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: oldRows, error: selErr } = await supabase
      .from("user_business_artifacts")
      .select("id")
      .eq("user_id", founder.user_id)
      .eq("artifact_key", artifact_key);
    if (selErr) return jsonError(500, `Select failed: ${selErr.message}`);

    const rows_deleted = oldRows?.length ?? 0;
    if (rows_deleted > 0) {
      const { error: delErr } = await supabase
        .from("user_business_artifacts")
        .delete()
        .eq("user_id", founder.user_id)
        .eq("artifact_key", artifact_key);
      if (delErr) return jsonError(500, `Delete failed: ${delErr.message}`);
    }

    const { data: inserted, error: insErr } = await supabase
      .from("user_business_artifacts")
      .insert({
        user_id: founder.user_id,
        artifact_key,
        version: "v1",
        step_number: STEP_NUMBER_BY_KEY[artifact_key as ArtifactKey] ?? 1,
        is_locked: true,
        specificity_score: founder.default_specificity,
        content_json: extracted,
        what_changed: "Migrated from canonical .md (one-time founder docs seed).",
      })
      .select("id")
      .single();
    if (insErr) return jsonError(500, `Insert failed: ${insErr.message}`);

    return new Response(
      JSON.stringify({
        extracted,
        action: "replaced",
        founder: founder_slug,
        artifact_key,
        rows_deleted,
        new_row_id: inserted.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("seed-founder-docs error:", e);
    return jsonError(500, e instanceof Error ? e.message : "Unknown error");
  }
});

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
