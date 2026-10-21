import { defineTool } from "@lovable.dev/mcp-js";
import { READ_ONLY, runForUser, unwrap, type Db } from "./_shared";

export async function getMission(db: Db, userId: string) {
  const row = unwrap(
    await db.from("game_profiles").select("mission_statement, mission_discovered_at").eq("user_id", userId).maybeSingle(),
    "read the mission",
  ) as { mission_statement: string | null; mission_discovered_at: string | null } | null;

  const mission = row?.mission_statement?.trim() || null;
  return {
    mission,
    discovered_at: row?.mission_discovered_at ?? null,
    ...(mission ? {} : { hint: "No mission saved yet. Use save_mission." }),
  };
}

export default defineTool({
  name: "get_mission",
  title: "Get mission",
  description: "Return the signed-in user's saved mission statement and the date it was first saved (null when none).",
  inputSchema: {},
  annotations: READ_ONLY,
  handler: (_input, ctx) => runForUser(ctx, "read the mission", (db, userId) => getMission(db, userId)),
});
