/**
 * Appleseed generation — browser client.
 *
 * The prompt text, types and prompt builder live in ./appleseedPrompt (pure,
 * no browser imports) so the MCP server (src/lib/mcp) can reuse them. They are
 * re-exported here so every existing import of "./appleseedGenerator" keeps
 * working unchanged.
 */
export * from "./appleseedPrompt";
import { buildAppleseedPrompt, type AppleseedData, type TopTalentProfile } from "./appleseedPrompt";

// ---------------------------------------------------------------------------
// GENERATION FUNCTION (Lovable AI integration)
// ---------------------------------------------------------------------------

import { supabase } from "@/integrations/supabase/client";
import i18n from "@/i18n/config";

/**
 * If rawSignal is the structured JSON returned by `ZONE_OF_GENIUS_PROMPT`,
 * extract the 8 deep-profile fields. Returns undefined when the input
 * isn't that JSON (raw conversation text, partial fields, etc.) — caller
 * should treat undefined as "no deep profile available, render fallback."
 */
const tryExtractTopTalentProfile = (rawSignal: string): TopTalentProfile | undefined => {
  if (typeof rawSignal !== "string" || !rawSignal.trim()) return undefined;
  // The prompt asks for a JSON block; users sometimes paste with leading
  // prose or markdown fences. Try to locate the first `{...}` envelope.
  const fenceMatch = rawSignal.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : rawSignal;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return undefined;
  const jsonSlice = candidate.slice(firstBrace, lastBrace + 1);
  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") return undefined;
  // Validate the 8 expected keys are present + correctly shaped. Missing
  // any → not the prompt's output; bail.
  const required = [
    "archetype_title",
    "core_pattern",
    "top_three_talents",
    "how_genius_shows_up",
    "edge_and_traps",
    "ideal_environments",
    "career_sweet_spots",
    "flywheel_action",
  ];
  for (const k of required) {
    if (!(k in parsed)) return undefined;
  }
  if (!Array.isArray(parsed.top_three_talents)) return undefined;
  if (!Array.isArray(parsed.ideal_environments)) return undefined;
  if (!Array.isArray(parsed.career_sweet_spots)) return undefined;
  return {
    archetype_title: String(parsed.archetype_title || ""),
    core_pattern: String(parsed.core_pattern || ""),
    top_three_talents: parsed.top_three_talents.map((t: unknown) => String(t)).filter(Boolean),
    // Day 61 (Sasha 2026-05-04): compact form for the FIRST REVEAL card.
    // Optional — pre-Day-61 snapshots don't have it; the reveal block
    // hides cleanly when undefined.
    //
    // Day 61 (post-roast): warn loudly when the long form is present
    // but the compact form isn't or is wrong-shape — that's the model
    // partially complying with the new schema, and the operator
    // wondering "why isn't the new section showing up after a re-run?"
    // wants to see this in the console.
    top_three_talents_compact: (() => {
        if (Array.isArray(parsed.top_three_talents_compact)) {
            return parsed.top_three_talents_compact.map((t: unknown) => String(t)).filter(Boolean);
        }
        if (Array.isArray(parsed.top_three_talents) && parsed.top_three_talents.length > 0) {
            console.warn(
                "[appleseedGenerator] top_three_talents_compact missing or invalid — " +
                "model returned the long form but skipped the compact form. " +
                "The MY THREE TALENTS reveal block will not render for this snapshot.",
                { received: parsed.top_three_talents_compact }
            );
        }
        return undefined;
    })(),
    how_genius_shows_up: String(parsed.how_genius_shows_up || ""),
    edge_and_traps: String(parsed.edge_and_traps || ""),
    // Day 58 (Sasha 2026-05-02): synthesized form is optional in the
    // legacy schema — older snapshots won't have it; new snapshots will.
    top_shadow_one_sentence: parsed.top_shadow_one_sentence
        ? String(parsed.top_shadow_one_sentence)
        : undefined,
    shadow_currency: parsed.shadow_currency ? String(parsed.shadow_currency) : undefined,
    ideal_environments: parsed.ideal_environments.map((t: unknown) => String(t)).filter(Boolean),
    career_sweet_spots: parsed.career_sweet_spots.map((t: unknown) => String(t)).filter(Boolean),
    flywheel_action: String(parsed.flywheel_action || ""),
  };
};

/**
 * Generate an Appleseed from raw signal using Lovable AI.
 *
 * @param rawSignal - The user's pasted AI response about their genius
 * @returns Promise<AppleseedData> - The generated Appleseed
 */
export const generateAppleseed = async (rawSignal: string): Promise<AppleseedData> => {
  const prompt = buildAppleseedPrompt(rawSignal);

  const { data, error } = await supabase.functions.invoke('generate-appleseed', {
    body: { prompt, rawSignal, target_language: i18n.resolvedLanguage }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate Appleseed');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.appleseed) {
    throw new Error('No appleseed data in response');
  }

  const appleseed = data.appleseed as AppleseedData;

  // Day 58 (Sasha 2026-05-02): the appleseed prompt now produces the
  // 8-field topTalentProfile in the same call (canonical source). Only
  // use the legacy rawSignal-paste extractor as a fallback when the
  // model didn't include topTalentProfile — defensive for the rare
  // case where the model's JSON omits the block.
  if (!appleseed.topTalentProfile) {
    const deep = tryExtractTopTalentProfile(rawSignal);
    if (deep) appleseed.topTalentProfile = deep;
  }

  return appleseed;
};
