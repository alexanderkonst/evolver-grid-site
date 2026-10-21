# MCP server: agent access to the platform

*Status: tools written and unit-tested against a fake Supabase client. Not deployed (the owner batches Lovable deploys) and not yet exercised against the live project. See "What is not verified" at the end.*

An external AI agent (Claude, ChatGPT, a script) can run the platform for a signed-in user over MCP: do the Top Talent, save the mission, map assets, fill Equilibrium, and build Unique Business artifacts. Every tool acts as that user. There is no admin path and no service-role key in the MCP code.

- Source: `src/lib/mcp/index.ts` and `src/lib/mcp/tools/*.ts`.
- Bundle: `@lovable.dev/mcp-js` (Vite plugin) compiles the source into `supabase/functions/mcp/index.ts` (auto-generated, do not edit). It regenerates on `vite dev` / `vite build`.
- Endpoint: `https://<project-ref>.supabase.co/functions/v1/mcp` (project ref is the `VITE_SUPABASE_PROJECT_ID` fallback in `src/lib/mcp/index.ts`).

## Auth flow for an external agent

1. The agent calls the endpoint with no token and gets `401` with a `WWW-Authenticate: Bearer resource_metadata="..."` challenge.
2. It reads the protected-resource metadata (`/.well-known/oauth-protected-resource` on the function). That names the authorization server: Supabase Auth at `https://<project-ref>.supabase.co/auth/v1`.
3. The agent's MCP client runs the OAuth authorization-code flow against Supabase Auth (`/auth/v1/oauth/authorize`, `/auth/v1/oauth/token`). The user signs in and approves the client.
4. The client sends the access token on every call: `Authorization: Bearer <token>`.
5. The server verifies the token (issuer `https://<project-ref>.supabase.co/auth/v1`, audience `authenticated`). Each tool then creates a Supabase client with that same bearer token, so row-level security decides what the tool can read and write.

Constraints that follow from this:

- The token must come from the OAuth flow. A plain app session JWT (for example from `signInWithPassword`) is rejected by default because it carries no `client_id` / `azp` claim.
- Supabase's OAuth server has to be enabled for the project, with the agent's client registered or dynamic registration on. That is a project setting, not code in this repo.
- Tokens expire; the client refreshes through Supabase Auth. A tool that hits an expired token returns "The session expired ... Re-authenticate and retry."

## Tools

Annotations: **R** = readOnly + idempotent. **W=** = write, idempotent (same input, same end state). **W+** = write that appends a new row on every call.

### Profile

| Tool | Kind | What it does | Same logic as the UI |
|---|---|---|---|
| `get_game_profile` | R | Mission statement, last Top Talent snapshot id, update time. | existing |
| `run_top_talent` | W+ | Creates the Top Talent from `mirror_text` (pasted AI answer) and/or `top_talents` (ranked talent names, first 3 are the core). Generates the 12-perspective Appleseed, saves it, makes it current. A retake keeps the earlier result in history. AI call, up to a minute. | `generate-appleseed` edge function + `saveAppleseed` (`saveToDatabase.ts`) |
| `get_top_talent` | R | Archetype, bullseye sentence, top three talents, deep profile. `include_full` adds all 12 perspectives. `completed:false` before a result exists. | Equilibrium Role line, ZoG pages |
| `save_mission` | W= | Saves the mission sentence; keeps the first discovery date. | `MissionDiscoveryLanding` |
| `get_mission` | R | Saved mission and its discovery date. | same |
| `add_assets` | W= | Adds up to 50 assets (`expertise`, `experiences`, `networks`, `resources`, `ip`, `influence`). Titles the user already has are skipped; nothing existing is changed. | `saveAssets` (`assetSync.ts`) |
| `list_assets` | R | Assets, optionally by type, with counts. | `loadAndSyncAssets` |
| `submit_quality_of_life` | W= | Eight domains (`wealth`, `health`, `happiness`, `love`, `impact`, `growth`, `socialTies`, `home`), stage 1 to 10 each. Skips the insert when the latest snapshot has identical answers. | QoL results page save |
| `redeem_activation_code` | W= | Redeems an activation code for the deeper Top Talent view. Wrong code returns `unlocked:false`. | `redeem-activation-coupon` edge function |

### Equilibrium

| Tool | Kind | What it does |
|---|---|---|
| `get_equilibrium_state` | R | Existing. State row, strategies, workstreams with active tasks, focus tasks, synthesis log. Now reports read errors instead of returning an empty snapshot. |
| `get_cycle` | R | Current lunar phase of the 8-phase cycle (Planning, Planting, Clearing, Gathering, Seeing, Leading, Harvesting, Celebrating), what it asks, when it ends, readiness of each layer (`filled` / `due_empty` / `not_due`) and which tool fills each due layer. Uses `getLunarState` and `phasePlan.ts`, the same inputs as the page's readiness strip. |
| `set_focus` | W= | Sets or clears the Moon Focus (`equilibrium_state.moon_focus_text`). |
| `set_strategies` | W= | Up to 3 strategies in priority order. Replaces the list: unlisted slots are cleared (annotated destructive). Unchanged slots are not rewritten, so `set_at` and alignment scores survive a repeat. |
| `set_workstreams` | W= | Up to 3 active workstreams, matched by title, created if missing, ordered as listed. Never deletes. `archive_unlisted:true` soft-archives the rest (reversible in the app, tasks kept). |
| `set_tasks` | W= | Up to 3 active tasks for one workstream (id or title), matched by text, added if missing, ordered as listed. Never deletes or completes tasks. |

Caps (3 workstreams, 3 active tasks per workstream, 3 strategies) match the app. Hitting one returns a message that names what is in the way. Completing tasks, DO NOW, and deleting are done in the app.

### Unique Business Builder (18 artifact types)

Types: `uniqueness`, `myth`, `tribe`, `pain`, `promise`, `lead_magnet`, `value_ladder`, `specificity_matrix`, `session_bridge`, `core_belief`, `packaging`, `frictionless_purchase`, `reach`, `delivery`, `spread`, `surface_inventory`, `tuning_fork`, `golden_dm`, `landing_page`.

| Tool | Kind | What it does |
|---|---|---|
| `ubb_list_artifacts` | R | Status per type (`empty` / `draft` / `locked`), latest version, specificity 0 to 10, version count, whether newer unlocked changes sit on a locked version. Reports the hard-gate artifacts still to lock and the next type to generate. `include_content` adds the latest content. |
| `ubb_generate_artifact` | W= | Generates v1 from the user's Top Talent, mission, assets and locked siblings (the same context the page builds). If any version exists, generates nothing and returns it. AI call. |
| `ubb_improve_artifact` | W+ | One Improve pass (27-perspective roast). Saved as a new unlocked version with a parent link and a log row; older versions stay. `apply:false` previews without saving. Skips at 10/10 and on diminishing returns. AI call. |
| `ubb_lock_artifact` | W= | Locks the latest version (or unlocks with `locked:false`). Returns locked downstream artifacts that may now be stale. |

Generate and improve call the same `generate-artifact` / `improve-artifact` edge functions as the page, with the user's token, and write the same `user_business_artifacts` rows (prompt and input version stamps included).

### Not included yet

- `get_cockpit`: waits for #102.
- DO NOW promote/demote, completing or deleting tasks and workstreams, unparking: use the app (or the owner-only `equilibrium-agent-write` function).
- Excalibur, Dossier publishing, matching.
- XP awards, celebration events, `onboarding_stage` changes. The tools save the data; they do not move the user through onboarding.

## Behavior rules

- **Scoped by RLS.** Tools read and write with the caller's token. Queries also filter by `user_id` where the table has one.
- **Friendly errors.** A failure returns one sentence naming the action ("Could not save the strategies. ..."). Raw database messages (table, column, policy names) never reach the agent; the operator log gets the error code only. See `friendlyDbError` in `tools/_shared.ts`.
- **Idempotent writes** are marked in the annotations and covered by tests. `run_top_talent` and `ubb_improve_artifact` are the two that append on every call.
- **AI tools take up to a minute** and spend the owner's AI credits. A rate-limit or credit failure comes back as a plain message.

## Example session

An agent connected for a new user. Calls shown as `tool(args)` with trimmed results.

```text
get_cycle()
  -> phase: Planting (position 2), asks: "Capture the 1-3 strategies as they reveal themselves."
     due: focus -> set_focus, strategies -> set_strategies

run_top_talent({ mirror_text: "People thank me for making a messy situation make sense ..." })
  -> saved: true, archetype: "Fog to Framework Building",
     bullseye: "turn fog into frameworks people can act on"

save_mission({ sentence: "Help founders ship work that matters." })
  -> mission: "Help founders ship work that matters.", discovered_at: "2026-10-21T..."

add_assets({ assets: [
  { type: "expertise", title: "Workshop facilitation", description: "10 years, 200+ sessions" },
  { type: "networks",  title: "Founder circle" } ] })
  -> saved: 2, skipped: 0

set_focus({ text: "Ship the pilot" })
set_strategies({ strategies: ["Close 3 pilot teams", "Publish the playbook"] })
set_workstreams({ workstreams: ["Pilot", "Playbook"] })
set_tasks({ workstream: "Pilot", tasks: ["Send the brief to 10 teams"] })
  -> created: ["Send the brief to 10 teams"]

ubb_generate_artifact({ type: "uniqueness" })       // ~30-60 s
  -> generated: true, artifact: { version: 1, specificity: 5.5, content: { ... } }
ubb_improve_artifact({ type: "uniqueness" })
  -> improved: true, version: 2, proposal: { specificity_delta: 1.4, what_changed: "..." }
ubb_lock_artifact({ type: "uniqueness" })
  -> locked: true, rederive_suggested: []
ubb_list_artifacts()
  -> totals: { locked: 1, drafts: 0, empty: 17 }, next_to_generate: "myth"
```

Repeating any `W=` call with the same input changes nothing. Calling `ubb_generate_artifact` for `uniqueness` again returns `generated:false, reason:"already_exists"`.

## Deploy and bundle notes

- Nothing here is deployed. `supabase/functions/mcp/index.ts` in the repo is still the previous bundle (2 tools, version 0.1.0). It regenerates from `src/lib/mcp/index.ts` on the next `vite dev` / `vite build` or Lovable commit pipeline; the owner then deploys with the next Lovable batch.
- The bundler follows relative imports only. The tools import shared pure modules by relative path (`phasePlan.ts`, `equilibrium-cycles`, UBB constants and `promptVersions.ts`, `appleseedPrompt.ts`, `assetTypes.ts`). Do not import `@/integrations/supabase/client`, anything that imports React, or `localStorage` code into `src/lib/mcp/`.
- `appleseedPrompt.ts` was split out of `appleseedGenerator.ts` for this: the prompt text, types and `buildAppleseedPrompt` live in the pure file, and `appleseedGenerator.ts` re-exports them so existing imports are unchanged.
- The edge functions the tools call (`generate-appleseed`, `generate-artifact`, `improve-artifact`, `redeem-activation-coupon`) are existing functions; no new function or migration is needed.

## Tests

`src/lib/mcp/__tests__/`: `equilibriumTools.test.ts`, `ubbTools.test.ts`, `profileTools.test.ts`, `toolsShared.test.ts`, plus the in-memory client in `fakeDb.ts`. They check table writes per user, idempotency, caps, no deletes, friendly errors, the context sent to the edge functions, and that every tool file is registered with a zod schema and correct annotations. Run with `npx vitest run src/lib/mcp`.

## What is not verified

- The tests run against a fake client, not Postgres. RLS policies, unique indexes and the edge functions' real responses are not exercised. A first live pass with a real token is still needed: one read tool, one Equilibrium write, one UBB generate.
- Whether Supabase's OAuth server is enabled for the project and registers external MCP clients is not confirmed from this repo.
- `redeem_activation_code` forwards guesses to `redeem-activation-coupon`, which has no rate limit. An agent could brute-force codes through it, the same as a browser can today. Worth a limit in that function before the MCP endpoint is shared widely.
