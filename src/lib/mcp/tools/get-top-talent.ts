import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { hasRealArchetype } from "../../../modules/zone-of-genius/snapshotSentinel";
import { READ_ONLY, runForUser, unwrap, type Db } from "./_shared";

export const getTopTalentInput = {
  include_full: z
    .boolean()
    .default(false)
    .describe("Include the full Appleseed (all 12 perspectives). Default false: archetype, bullseye and top talents only."),
};

type SnapshotRow = {
  id: string;
  archetype_title: string | null;
  core_pattern: string | null;
  top_three_talents: string[] | null;
  top_ten_talents: string[] | null;
  mastery_action: string | null;
  appleseed_data: Record<string, any> | null;
  appleseed_generated_at: string | null;
  created_at: string;
};

const SNAPSHOT_COLUMNS =
  "id, archetype_title, core_pattern, top_three_talents, top_ten_talents, mastery_action, appleseed_data, appleseed_generated_at, created_at";

/** The user's current Top Talent snapshot: the profile's pointer first, newest snapshot as fallback (as the Equilibrium page does). */
export async function loadCurrentSnapshot(db: Db, userId: string): Promise<SnapshotRow | null> {
  const profile = unwrap(
    await db.from("game_profiles").select("id, last_zog_snapshot_id").eq("user_id", userId).maybeSingle(),
    "read the profile",
  ) as { id?: string; last_zog_snapshot_id?: string | null } | null;
  if (!profile?.id) return null;

  if (profile.last_zog_snapshot_id) {
    const pointed = unwrap(
      await db.from("zog_snapshots").select(SNAPSHOT_COLUMNS).eq("id", profile.last_zog_snapshot_id).maybeSingle(),
      "read the Top Talent snapshot",
    ) as SnapshotRow | null;
    if (pointed) return pointed;
  }

  const rows = (unwrap(
    await db
      .from("zog_snapshots")
      .select(SNAPSHOT_COLUMNS)
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1),
    "read the Top Talent snapshot",
  ) ?? []) as SnapshotRow[];
  return rows[0] ?? null;
}

export async function getTopTalent(db: Db, userId: string, input: { include_full?: boolean }) {
  const snapshot = await loadCurrentSnapshot(db, userId);
  if (!snapshot || !hasRealArchetype(snapshot.archetype_title)) {
    return { completed: false, hint: "No Top Talent result yet. Use run_top_talent to create one." };
  }

  const appleseed = snapshot.appleseed_data;
  const bullseye = appleseed?.bullseyeSentence?.trim() || snapshot.core_pattern || null;
  return {
    completed: true,
    snapshot_id: snapshot.id,
    archetype: snapshot.archetype_title,
    // Reads as "I <bullseye>", the form the Equilibrium Role line uses.
    bullseye,
    top_three_talents: snapshot.top_three_talents ?? appleseed?.threeLenses?.actions ?? [],
    top_ten_talents: snapshot.top_ten_talents ?? [],
    mastery_action: snapshot.mastery_action,
    deep_profile: appleseed?.topTalentProfile ?? null,
    generated_at: snapshot.appleseed_generated_at ?? snapshot.created_at,
    ...(input.include_full ? { appleseed } : {}),
  };
}

export default defineTool({
  name: "get_top_talent",
  title: "Get Top Talent",
  description:
    "Return the signed-in user's Top Talent result: archetype, bullseye sentence, top three talents and the deep profile (edge and traps, ideal environments, flywheel action). Reports completed=false when they have not done it yet. Optionally include the full 12-perspective Appleseed.",
  inputSchema: getTopTalentInput,
  annotations: READ_ONLY,
  handler: (input, ctx) => runForUser(ctx, "read the Top Talent", (db, userId) => getTopTalent(db, userId, input)),
});
