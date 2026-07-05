import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getEquilibriumStateTool from "./tools/get-equilibrium-state";
import getGameProfileTool from "./tools/get-game-profile";

// Direct Supabase host — never the .lovable.cloud proxy. Read from
// VITE_SUPABASE_PROJECT_ID which Vite inlines at build time so this module
// stays import-safe (no runtime env reads at top level).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "genius-business-mcp",
  title: "Genius Business MCP",
  version: "0.1.0",
  instructions:
    "Read tools for the signed-in user's Genius Business state. Use `get_equilibrium_state` for strategies/workstreams/focus tasks, and `get_game_profile` for the mission statement.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getEquilibriumStateTool, getGameProfileTool],
});
