/**
 * delete-account — permanently delete an authenticated user's account.
 *
 * Day 61 (Sasha 2026-05-04 18:30): created to back the "Delete My
 * Account" button in /game/settings → Danger Zone (see
 * src/components/settings/ProfileSettingsSection.tsx). Reset Progress
 * lives client-side because nothing it does requires a service role —
 * the user can update/delete their own rows under RLS. Account
 * deletion is different: `auth.admin.deleteUser` requires the
 * SUPABASE_SERVICE_ROLE_KEY, which can only live server-side.
 *
 * Flow:
 *   1. Verify the bearer token; resolve the caller's user_id.
 *   2. Look up profile_id from game_profiles where user_id matches.
 *      If no profile row exists, that's fine — skip the profile-keyed
 *      deletes and proceed to the user-keyed deletes + auth deletion.
 *   3. Delete profile-keyed rows (zog_snapshots, qol_snapshots,
 *      player_upgrades, vector_progress, then game_profiles itself).
 *   4. Delete user-keyed rows (user_business_artifacts,
 *      visibility_settings).
 *   5. Call admin.auth.admin.deleteUser(userId). This is the
 *      non-negotiable last step — if it fails, the user can still
 *      log in even though their data is gone, which is worse than
 *      either pure outcome. So we throw on error.
 *   6. Return { success: true } on green path.
 *
 * Each profile-keyed and user-keyed delete is best-effort logged but
 * doesn't fail the operation — partial wipes are recoverable
 * (a re-run picks up whatever didn't get cleaned the first time),
 * and the auth deletion at step 5 is what makes the account "gone."
 *
 * Reference: catalog of tables matches the client-side Reset Progress
 * handler in ProfileSettingsSection.tsx — keep them in sync if either
 * grows new tables.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }
    if (req.method !== "POST") {
        return json(405, { error: "method_not_allowed" });
    }

    try {
        // ─── Step 1: Verify caller ───────────────────────────────
        const authHeader = req.headers.get("authorization") ?? "";
        const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (!accessToken) {
            return json(401, { error: "unauthenticated" });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!supabaseUrl || !serviceRoleKey) {
            console.error("[delete-account] missing env vars");
            return json(500, { error: "server_misconfigured" });
        }

        const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: userResult, error: userError } =
            await admin.auth.getUser(accessToken);
        if (userError || !userResult?.user?.id) {
            return json(401, {
                error: "unauthenticated",
                detail: userError?.message ?? "no user",
            });
        }
        const userId = userResult.user.id;
        const userEmail = userResult.user.email ?? "(unknown)";

        console.log(`[delete-account] starting deletion for user_id=${userId} email=${userEmail}`);

        // ─── Step 2: Resolve profile_id ──────────────────────────
        const { data: profileRow, error: profileLookupError } = await admin
            .from("game_profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileLookupError) {
            console.warn(
                `[delete-account] profile lookup failed for user_id=${userId}: ${profileLookupError.message}`,
            );
            // Continue anyway — the user-keyed deletes + auth deletion
            // are independent of profile_id. We just won't be able to
            // clean profile-keyed rows for this user.
        }
        const profileId = profileRow?.id ?? null;

        // ─── Step 3: Profile-keyed deletes (best-effort) ────────
        if (profileId) {
            const profileTables = [
                "zog_snapshots",
                "qol_snapshots",
                "player_upgrades",
                "vector_progress",
            ] as const;
            for (const table of profileTables) {
                const { error, count } = await admin
                    .from(table)
                    .delete({ count: "exact" })
                    .eq("profile_id", profileId);
                if (error) {
                    console.warn(
                        `[delete-account] ${table} delete failed for profile_id=${profileId}: ${error.message}`,
                    );
                } else {
                    console.log(
                        `[delete-account] ${table}: deleted ${count ?? 0} rows for profile_id=${profileId}`,
                    );
                }
            }

            // game_profiles row itself — must come AFTER the profile-keyed
            // child deletes (so any FK constraint isn't tripped).
            const { error: gpError } = await admin
                .from("game_profiles")
                .delete()
                .eq("id", profileId);
            if (gpError) {
                console.warn(
                    `[delete-account] game_profiles delete failed for id=${profileId}: ${gpError.message}`,
                );
            } else {
                console.log(`[delete-account] game_profiles: deleted profile_id=${profileId}`);
            }
        }

        // ─── Step 4: User-keyed deletes (best-effort) ───────────
        const userTables = [
            "user_business_artifacts",
            "visibility_settings",
        ] as const;
        for (const table of userTables) {
            const { error, count } = await admin
                .from(table)
                .delete({ count: "exact" })
                .eq("user_id", userId);
            if (error) {
                console.warn(
                    `[delete-account] ${table} delete failed for user_id=${userId}: ${error.message}`,
                );
            } else {
                console.log(
                    `[delete-account] ${table}: deleted ${count ?? 0} rows for user_id=${userId}`,
                );
            }
        }

        // ─── Step 5: Delete the auth user (non-negotiable) ──────
        const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
        if (deleteUserError) {
            console.error(
                `[delete-account] auth.admin.deleteUser failed for user_id=${userId}: ${deleteUserError.message}`,
            );
            return json(500, {
                error: "auth_delete_failed",
                detail: deleteUserError.message,
            });
        }

        console.log(`[delete-account] completed: user_id=${userId} email=${userEmail}`);

        return json(200, { success: true });
    } catch (err) {
        console.error("[delete-account] unexpected error:", err);
        return json(500, {
            error: "internal_error",
            detail: err instanceof Error ? err.message : String(err),
        });
    }
});
