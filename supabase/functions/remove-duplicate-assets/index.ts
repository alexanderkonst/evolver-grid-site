import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Remove duplicates & synthesize — ME · Saved Assets.
 *
 * Assets accrete over multiple mapping passes, so the list fills with exact
 * and near-duplicate entries. This function takes the current list, merges
 * duplicates and near-duplicates, tightens wording, and returns a cleaned
 * list — WITHOUT dropping anything important. It is STATELESS: the client
 * sends its current assets and writes the returned set back itself (DB +
 * localStorage mirror), which keeps the one authority for the write on the
 * client and lets the UI offer Undo.
 *
 * Flagship model on purpose (openai/gpt-6-astra): this is a quality- and
 * data-sensitive synthesis over the person's real assets, not a bulk cheap
 * pass. (Sasha's call, 2026-10-09.)
 */

const SYSTEM_PROMPT = `You are the "Remove duplicates & synthesize" pass for a person's Saved Assets list.

Each asset has a category label (typeId / subTypeId / categoryId), a short title, and a longer description. The list has grown over several sessions, so it contains exact duplicates and near-duplicates (the same skill, tool, resource, relationship, or capability described more than once in slightly different words).

YOUR JOB:
- Merge exact duplicates and near-duplicates into ONE asset.
- When you merge, SYNTHESIZE: combine the richest, most specific details from every source into the single kept asset. Never drop a concrete detail (a name, a number, a method, an example, a proof point) that appeared in any source.
- Tighten wording lightly: remove repetition, keep it specific and concrete.
- Keep genuinely DISTINCT assets separate. When in doubt whether two are the same, KEEP THEM SEPARATE. Losing a real asset is worse than leaving a mild duplicate.

WHAT NOT TO DO:
- Do NOT invent new assets.
- Do NOT summarize the whole list down to a few generic lines.
- Do NOT strip specifics to make entries look cleaner.
- Do NOT invent new typeId / subTypeId / categoryId values. For each kept asset, reuse the ids from its most representative source asset exactly as given.

For every asset in your output, carry forward: typeId, subTypeId, categoryId, title, description.

OUTPUT STRICT JSON ONLY, no markdown, no code fences:
{
  "assets": [
    { "typeId": "...", "subTypeId": "...", "categoryId": "...", "title": "...", "description": "..." }
  ]
}`;

interface InAsset {
  typeId?: string;
  subTypeId?: string;
  categoryId?: string;
  title?: string;
  description?: string;
}

interface OutAsset {
  typeId: string;
  subTypeId: string | null;
  categoryId: string | null;
  title: string;
  description: string;
}

function stripCodeFence(content: string): string {
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

/** Only ids that appeared in the input survive — the model is told to reuse
 *  them, but validate anyway so a hallucinated id never reaches the DB. */
function parseAssets(content: string, validTypeIds: Set<string>): OutAsset[] {
  const cleaned = stripCodeFence(content);
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  const raw = Array.isArray(parsed?.assets) ? parsed.assets : [];
  const out: OutAsset[] = [];
  for (const a of raw) {
    const title = typeof a?.title === "string" ? a.title.trim() : "";
    if (!title) continue;
    const typeId =
      typeof a?.typeId === "string" && validTypeIds.has(a.typeId)
        ? a.typeId
        : "other";
    out.push({
      typeId,
      subTypeId: typeof a?.subTypeId === "string" && a.subTypeId ? a.subTypeId : null,
      categoryId: typeof a?.categoryId === "string" && a.categoryId ? a.categoryId : null,
      title,
      description: typeof a?.description === "string" ? a.description.trim() : "",
    });
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as { assets?: InAsset[] };
    const assets = Array.isArray(body?.assets) ? body.assets : [];
    if (assets.length === 0) {
      return new Response(JSON.stringify({ error: "No assets provided." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Nothing to do for a trivially short list — return as-is so the client
    // doesn't spend a flagship call on 1–2 assets.
    if (assets.length < 2) {
      return new Response(JSON.stringify({ assets }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validTypeIds = new Set(
      assets.map((a) => a.typeId).filter((v): v is string => typeof v === "string"),
    );

    const userMessage = `Here is the current Saved Assets list (${assets.length} assets) as JSON. Merge duplicates and near-duplicates, synthesize without losing any specific detail, and return the cleaned list.\n\n${JSON.stringify(
      assets.map((a) => ({
        typeId: a.typeId ?? "",
        subTypeId: a.subTypeId ?? "",
        categoryId: a.categoryId ?? "",
        title: a.title ?? "",
        description: a.description ?? "",
      })),
      null,
      2,
    )}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage },
          ],
          reasoning_effort: "medium",
        }),
      },
    );

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = parseAssets(content, validTypeIds);

    // Safety rail: never return an empty set from a non-empty input (that
    // would wipe the person's assets). If parsing yielded nothing, fail so
    // the client keeps the original list untouched.
    if (cleaned.length === 0) {
      throw new Error("Synthesis produced no assets; keeping the original list.");
    }

    return new Response(
      JSON.stringify({ assets: cleaned, before: assets.length, after: cleaned.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("remove-duplicate-assets error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
