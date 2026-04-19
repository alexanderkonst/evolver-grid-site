import { supabase } from "@/integrations/supabase/client";

/**
 * Persist a 1-10 resonance rating onto the latest `zog_snapshots` row for
 * a given game profile.
 *
 * The ResonanceRating component fires on user click; we update the most
 * recent snapshot for the profile (tracked via `game_profiles.last_zog_snapshot_id`).
 * If there's no profile or no snapshot yet (rare — the rating UI only
 * appears after a reveal, which implies a snapshot exists), we no-op
 * silently. This function never throws into the UI — resonance capture
 * is a nice-to-have, not a blocker.
 *
 * @param profileId  The `game_profiles.id` UUID, or null/undefined for
 *                   pre-profile (anonymous guest) flow.
 * @param kind       Which column to write. `"appleseed"` → resonance_rating.
 *                   `"excalibur"` → excalibur_resonance_rating.
 * @param rating     Integer 1-10. Values outside the range are clamped.
 */
export async function saveResonanceRating(
  profileId: string | null | undefined,
  kind: "appleseed" | "excalibur",
  rating: number,
): Promise<void> {
  if (!profileId) return;

  const clamped = Math.max(1, Math.min(10, Math.round(rating)));
  const column =
    kind === "appleseed" ? "resonance_rating" : "excalibur_resonance_rating";

  try {
    // Find the latest snapshot for this profile. Prefer the one the
    // profile's pointer tracks; fall back to newest by created_at.
    const { data: profile } = await supabase
      .from("game_profiles")
      .select("last_zog_snapshot_id")
      .eq("id", profileId)
      .maybeSingle();

    let snapshotId = profile?.last_zog_snapshot_id as string | undefined;

    if (!snapshotId) {
      const { data: latest } = await supabase
        .from("zog_snapshots")
        .select("id")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      snapshotId = latest?.id;
    }

    if (!snapshotId) return;

    // Cast at the `.update()` boundary only — the new columns aren't in
    // the generated types yet (types.ts will be regenerated on the next
    // Supabase type sync).
    await supabase
      .from("zog_snapshots")
      .update({ [column]: clamped } as never)
      .eq("id", snapshotId);
  } catch (err) {
    // Never break the UI for a telemetry write.
    console.warn("[saveResonanceRating] non-fatal:", err);
  }
}
