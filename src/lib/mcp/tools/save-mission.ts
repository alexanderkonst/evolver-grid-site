import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, ToolError, getOrCreateProfileId, runForUser, unwrap, type Db } from "./_shared";

export const saveMissionInput = {
  sentence: z
    .string()
    .trim()
    .min(5)
    .max(1000)
    .describe("The user's mission as one clear sentence. Replaces the saved mission."),
};

/**
 * Same two writes as the Mission Discovery page: `mission_statement` always
 * (overwrite), `mission_discovered_at` only the first time (the moment of discovery).
 */
export async function saveMission(db: Db, userId: string, input: { sentence: string }) {
  const sentence = input.sentence.trim();
  const profileId = await getOrCreateProfileId(db, userId);

  // `.select("id")` because an RLS denial on UPDATE filters the row silently instead of raising.
  const updated = (unwrap(
    await db
      .from("game_profiles")
      .update({ mission_statement: sentence, updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .select("id"),
    "save the mission",
  ) ?? []) as { id: string }[];
  if (updated.length === 0) {
    throw new ToolError("Not allowed to save the mission. The signed-in account cannot update this profile.");
  }

  unwrap(
    await db
      .from("game_profiles")
      .update({ mission_discovered_at: new Date().toISOString() })
      .eq("id", profileId)
      .is("mission_discovered_at", null),
    "stamp the mission date",
  );

  const row = unwrap(
    await db.from("game_profiles").select("mission_statement, mission_discovered_at").eq("id", profileId).maybeSingle(),
    "read back the mission",
  ) as { mission_statement: string | null; mission_discovered_at: string | null } | null;

  return { mission: row?.mission_statement ?? sentence, discovered_at: row?.mission_discovered_at ?? null };
}

export default defineTool({
  name: "save_mission",
  title: "Save mission",
  description:
    "Save the signed-in user's mission statement (one sentence) on their profile. Overwrites the previous mission; the original discovery date is kept. Safe to repeat with the same sentence.",
  inputSchema: saveMissionInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) => runForUser(ctx, "save the mission", (db, userId) => saveMission(db, userId, input)),
});
