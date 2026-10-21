import { defineTool } from "@lovable.dev/mcp-js";
import { READ_ONLY, runForUser, unwrap } from "./_shared";

export default defineTool({
  name: "get_game_profile",
  title: "Get game profile",
  description:
    "Return the signed-in user's game profile: mission statement, last ZoG snapshot id, and recent update timestamps.",
  inputSchema: {},
  annotations: READ_ONLY,
  handler: (_input, ctx) =>
    runForUser(ctx, "read the profile", async (db, userId) => {
      const data = unwrap(
        await db
          .from("game_profiles")
          .select("mission_statement, last_zog_snapshot_id, updated_at")
          .eq("user_id", userId)
          .maybeSingle(),
        "read the profile",
      );
      return { profile: data };
    }),
});
