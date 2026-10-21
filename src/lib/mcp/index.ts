import { auth, defineMcp } from "@lovable.dev/mcp-js";
import addAssetsTool from "./tools/add-assets";
import getCycleTool from "./tools/get-cycle";
import getEquilibriumStateTool from "./tools/get-equilibrium-state";
import getGameProfileTool from "./tools/get-game-profile";
import getMissionTool from "./tools/get-mission";
import getTopTalentTool from "./tools/get-top-talent";
import listAssetsTool from "./tools/list-assets";
import redeemActivationCodeTool from "./tools/redeem-activation-code";
import runTopTalentTool from "./tools/run-top-talent";
import saveMissionTool from "./tools/save-mission";
import setFocusTool from "./tools/set-focus";
import setStrategiesTool from "./tools/set-strategies";
import setTasksTool from "./tools/set-tasks";
import setWorkstreamsTool from "./tools/set-workstreams";
import submitQualityOfLifeTool from "./tools/submit-quality-of-life";
import ubbGenerateArtifactTool from "./tools/ubb-generate-artifact";
import ubbImproveArtifactTool from "./tools/ubb-improve-artifact";
import ubbListArtifactsTool from "./tools/ubb-list-artifacts";
import ubbLockArtifactTool from "./tools/ubb-lock-artifact";

// Direct Supabase host — never the .lovable.cloud proxy. Read from
// VITE_SUPABASE_PROJECT_ID which Vite inlines at build time so this module
// stays import-safe (no runtime env reads at top level).
// The Lovable bundler can replace an unavailable build-time value with an
// empty string. Use a known-safe project fallback so the generated function
// never ships an invalid `https://.supabase.co` OAuth issuer.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID || "jypjttotvastdhanwvrx";

export default defineMcp({
  name: "genius-business-mcp",
  title: "Genius Business MCP",
  version: "0.2.0",
  instructions: [
    "Tools for the signed-in user's Genius Business platform state. Every tool acts as that user (their token, row-level security).",
    "Suggested order for a new user: run_top_talent -> save_mission -> add_assets -> submit_quality_of_life -> set_focus / set_strategies / set_workstreams / set_tasks -> ubb_generate_artifact / ubb_improve_artifact / ubb_lock_artifact.",
    "Read tools: get_top_talent, get_mission, list_assets, get_game_profile, get_equilibrium_state, get_cycle (lunar phase and which Equilibrium layers are due), ubb_list_artifacts.",
    "AI tools (run_top_talent, ubb_generate_artifact, ubb_improve_artifact) can take up to a minute. Equilibrium writes converge on the list you send and never delete workstreams or tasks. redeem_activation_code unlocks the deeper Top Talent view.",
  ].join(" "),
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    // Read
    getEquilibriumStateTool,
    getGameProfileTool,
    getTopTalentTool,
    getMissionTool,
    listAssetsTool,
    getCycleTool,
    ubbListArtifactsTool,
    // Write
    runTopTalentTool,
    saveMissionTool,
    addAssetsTool,
    submitQualityOfLifeTool,
    setFocusTool,
    setStrategiesTool,
    setWorkstreamsTool,
    setTasksTool,
    ubbGenerateArtifactTool,
    ubbImproveArtifactTool,
    ubbLockArtifactTool,
    redeemActivationCodeTool,
  ],
});
