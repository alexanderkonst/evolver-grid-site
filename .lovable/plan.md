Task: make Delete Account actually delete the authenticated user and their owned data.
Roadmap status: net-new bugfix. Scope in: account deletion function, function CORS/JWT config, frontend deletion handler, verification. Scope out: auth provider settings, password rules, RLS policy changes, unrelated UI redesign.

Root cause / gaps found

1. The failed click most likely died before the function body ran.
   - Screenshot toast shows the Supabase client error: “Failed to send a request to the Edge Function”. That is a request/fetch-level failure, not an application-level `auth_delete_failed` response.
   - Recent backend logs had no real `delete-account` invocation from the failed click.
   - Safe probe confirmed the deployed function exists, but its CORS preflight currently returns only:
     `authorization, x-client-info, apikey, content-type`
   - Modern function calls can send extra client/platform headers, and the current function does not allow them. A browser can block the request at preflight, producing exactly this client-side error and no deletion.

2. `delete-account` is configured with gateway JWT verification and also manually verifies the user inside the function.
   - `supabase/config.toml` has `[functions.delete-account] verify_jwt = true`.
   - The function also reads the bearer token and calls `auth.getUser(accessToken)`.
   - This double gate means some failures happen before our function can return proper CORS/error JSON or log useful details. Security does not require the gateway gate because the function already validates the caller and deletes only that caller.

3. The deletion inventory is incomplete.
   - Current function explicitly deletes only: `zog_snapshots`, `qol_snapshots`, `player_upgrades`, `vector_progress`, `game_profiles`, `user_business_artifacts`, `visibility_settings`, then auth user.
   - The actual schema has more user/profile-owned data: `action_events`, `first_time_actions`, `missions`, `quests`, `canvas_snapshots`, `entitlement_grants`, `mission_participants`, `multiple_intelligences_results`, `genius_offer_requests`, `genius_offer_wizard_progress`, `product_builder_snapshots`, `marketplace_products`, `ai_boost_purchases`, `connections`, `event_rsvps`, `events`, `artifact_improvements`, `anonymous_genius_results`, `unique_business_dossiers`, `user_assets`, `user_roles`, storage files in `avatars` and `linkedin-profiles`, etc.
   - Many of these would cascade when the auth user or game profile is deleted, but not all. Two important blockers are `events.created_by` and `genius_offer_requests.user_id`, which reference auth users without `ON DELETE CASCADE`. If the user has rows there, `auth.admin.deleteUser(userId)` can fail and leave the account alive.

4. Storage files are not cleaned.
   - `avatars` and `linkedin-profiles` contain user-owned objects keyed by user id / owner id.
   - Current delete flow does not remove them.

5. Current backend errors are best-effort and too forgiving.
   - For full account deletion, silent partial cleanup is dangerous. The function should either complete the account deletion or return a precise failure before claiming success.

6. There is an unrelated build blocker already present.
   - `src/modules/zone-of-genius/Step4GenerateSnapshot.tsx` has JSX syntax errors around a comment inside a ternary branch. I will fix this first because it can block validation/release even though it is not the account-deletion root cause.

Definition of Done

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Existing TSX build blocker in `Step4GenerateSnapshot.tsx` is corrected without changing account deletion behavior | The broken ternary/comment block is valid JSX | pending |
| 2 | `delete-account` accepts browser function-call headers in CORS preflight | `Access-Control-Allow-Headers` includes modern function client headers such as `x-supabase-client-platform`, runtime/version headers, plus existing auth/content headers | pending |
| 3 | Gateway JWT verification is removed for this function while keeping in-function auth validation | `verify_jwt=false` for `delete-account`; function still rejects missing/invalid bearer token with 401 | pending |
| 4 | Frontend delete handler passes/validates an authenticated session explicitly before invoking deletion | If no session/access token exists, user gets a re-login message instead of a vague Edge Function error | pending |
| 5 | Function deletes or unlinks all known user-keyed rows that can block auth deletion | Explicit handling for `genius_offer_requests`, `events`, `connections`, RSVP/mission/product/offer/artifact/user-role tables | pending |
| 6 | Function deletes all profile-keyed rows and then the game profile | Covers current profile-owned tables, including snapshots, quests, missions, canvas, grants, action events, first-time actions, progress/upgrades | pending |
| 7 | Function removes user-owned storage objects | Deletes files under user-owned paths in `avatars` and `linkedin-profiles` where possible | pending |
| 8 | Function returns structured error codes and logs the failing step/table | Toast can show a useful message; logs identify the failing cleanup step | pending |
| 9 | Function is deployed after code/config changes | `delete-account` deployed successfully | pending |
| 10 | Non-destructive checks pass | OPTIONS preflight succeeds; unauthenticated POST returns JSON 401 with CORS instead of fetch failure | pending |
| 11 | Safe authenticated verification is run without touching your real account | Use a disposable/test account only; invoke delete-account; confirm auth user cannot fetch session afterward | pending |
| 12 | No unrelated auth provider settings, password rules, or RLS policies are changed | Diff contains only function/config/frontend syntax/handler changes needed for this bug | pending |

Implementation plan

1. Fix the unrelated JSX syntax blocker
   - In `Step4GenerateSnapshot.tsx`, replace the invalid JSX comment placement inside the `saveState === "saved" ? (...)` branch with a valid fragment or move the comment outside the returned node.
   - No behavioral change to the Zone of Genius page.

2. Harden `delete-account` CORS
   - Replace the narrow `Access-Control-Allow-Headers` value with the full supported browser/client header list:
     - `authorization`
     - `x-client-info`
     - `apikey`
     - `content-type`
     - `x-supabase-client-platform`
     - `x-supabase-client-platform-version`
     - `x-supabase-client-runtime`
     - `x-supabase-client-runtime-version`
   - Keep CORS on every response path, including errors and OPTIONS.

3. Move auth enforcement fully into the function
   - Set `[functions.delete-account] verify_jwt = false` in `supabase/config.toml`.
   - Keep the existing bearer-token validation inside `delete-account`:
     - missing token -> 401
     - invalid/expired token -> 401
     - valid token -> resolve `userId` from the token only
   - This preserves security but prevents the gateway from swallowing errors before our CORS/logging runs.

4. Make the frontend invocation more deterministic
   - Before invoking, call `supabase.auth.getSession()`.
   - If no access token exists, stop and ask user to log in again.
   - Invoke with explicit `Authorization: Bearer <access_token>` header.
   - Improve the toast for known backend error codes while keeping the current irreversible-confirmation flow.

5. Expand backend cleanup inventory
   - Resolve all profile ids for the current user, not just one row defensively.
   - Delete profile-owned data before deleting profiles:
     - `action_events`
     - `first_time_actions`
     - `player_upgrades`
     - `vector_progress`
     - `missions`
     - `quests`
     - `canvas_snapshots`
     - `entitlement_grants`
     - `qol_snapshots`
     - `zog_snapshots`
     - `nurture_email_queue` if present/accessible
   - Delete user-owned data before auth deletion:
     - `user_business_artifacts`
     - `visibility_settings`
     - `ai_boost_purchases`
     - `multiple_intelligences_results`
     - `genius_offer_requests`
     - `genius_offer_wizard_progress`
     - `product_builder_snapshots`
     - `marketplace_products`
     - `artifact_improvements`
     - `mission_participants`
     - `connections` where requester or receiver is user
     - `event_rsvps`
     - `events` created by user
     - `anonymous_genius_results` claimed by user
     - `unique_business_dossiers`
     - `user_assets`
     - `user_roles`
   - Then delete `game_profiles` and finally `auth.admin.deleteUser(userId)`.

6. Remove storage objects
   - For `avatars` and `linkedin-profiles`, list/remove objects under `${userId}/`.
   - Treat storage cleanup failures as logged warnings unless they block account deletion; the auth user deletion remains the final success criterion.

7. Improve failure semantics
   - Do not return success unless `auth.admin.deleteUser(userId)` succeeds.
   - Return structured JSON like `{ error: "cleanup_failed", step, table, detail }` when a required cleanup step fails.
   - Keep logs concise but useful: user id, step, table, row count/error.

8. Deploy and verify
   - Deploy `delete-account`.
   - Verify OPTIONS preflight from the published domain returns the full allowed headers.
   - Verify unauthenticated POST returns JSON 401 with CORS, not a fetch-level failure.
   - Create/use a disposable authenticated test account, run the full delete flow against that account only, then verify:
     - function returns `{ success: true }`
     - the test user can no longer fetch `/user`
     - owned rows/files for the test identity are gone or no longer linked.

Notes

- I will not change Email provider settings, password restrictions, auth confirmation settings, or RLS policies.
- I will not run the delete flow against your current account.
- The key structural fix is: full CORS + function-level auth + complete cleanup of tables that can block `deleteUser`.