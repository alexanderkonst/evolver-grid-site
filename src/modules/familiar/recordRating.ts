/**
 * recordRating — the 1–10 «How different is this?» of the reveal, written to `resonance_events`
 * the way `/ai-os` writes its own (AiOsSpotlight): `message_seen = "familiar reveal"`. Works for
 * guests too (anonymous client id). The question the player typed is never sent.
 */
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { getAnonClientId } from "@/lib/anonClientId";
import type { CompareResult, FamiliarState } from "./types";

export const FAMILIAR_MESSAGE_SEEN = "familiar reveal";

export const ratingTier = (rating: number): "resonant" | "partial" | "off" =>
  rating >= 8 ? "resonant" : rating >= 5 ? "partial" : "off";

export async function recordRating(
  rating: number,
  state: FamiliarState,
  mode: CompareResult["mode"] = "self",
): Promise<{ ok: boolean }> {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    const profileId = user ? await getOrCreateGameProfileId() : null;
    const { error } = await supabase.from("resonance_events").insert({
      profile_id: profileId,
      user_id: user?.id ?? null,
      client_session_id: getAnonClientId(),
      artifact_kind: "familiar_reveal",
      rating,
      tier: ratingTier(rating),
      message_seen: FAMILIAR_MESSAGE_SEEN,
      matrix_source: "master",
      context_json: {
        page: "/game/your-ai",
        mode,
        authenticated: !!user,
        gifts_lit: state.gifts.filter((g) => g.lit).map((g) => g.key),
        prompt_version: state.version,
      },
    });
    if (error) {
      console.error("[familiar] resonance_events insert failed:", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[familiar] rating failed:", e);
    return { ok: false };
  }
}
