/**
 * delete-account — permanently delete an authenticated user's account.
 *
 * Day 62 (Sasha 2026-05-05) hardening pass:
 *   • Wider CORS headers (modern @supabase/functions-js sends extra
 *     x-supabase-client-* headers that the original allow-list blocked,
 *     producing "Failed to send a request to the Edge Function" at the
 *     client before any backend code ran).
 *   • Auth is enforced inside the function only; the project-level
 *     verify_jwt is now false so the gateway can't swallow our error
 *     responses before they get CORS headers and structured JSON.
 *   • Cleanup inventory expanded to cover every user/profile-keyed
 *     table that doesn't already cascade from auth.users / game_profiles
 *     deletion. Two known blockers — events.created_by and
 *     genius_offer_requests.user_id — have NO ON DELETE CASCADE; if we
 *     don't pre-delete those rows, auth.admin.deleteUser fails with a
 *     foreign-key error and the account stays alive.
 *   • Storage objects under avatars/${userId}/ and
 *     linkedin-profiles/${userId}/ are removed.
 *   • Final auth deletion is the success criterion. We only return 200
 *     when admin.deleteUser succeeds. Cleanup-step failures are logged
 *     as warnings so a transient failure on a rarely-used table doesn't
 *     trap a user with a half-deleted record — but the auth-delete error
 *     itself is reported with detail so the toast can show why.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
            return json(401, { error: "unauthenticated", detail: "missing bearer token" });
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

        console.log(`[delete-account] starting for user_id=${userId} email=${userEmail}`);

        // ─── Step 2: Resolve all profile_ids for this user ───────
        const { data: profileRows, error: profileLookupError } = await admin
            .from("game_profiles")
            .select("id")
            .eq("user_id", userId);
        if (profileLookupError) {
            console.warn(
                `[delete-account] profile lookup failed: ${profileLookupError.message}`,
            );
        }
        const profileIds: string[] = (profileRows ?? []).map((r: { id: string }) => r.id);

        const warnings: { step: string; table: string; detail: string }[] = [];
        const wipe = async (
            table: string,
            column: string,
            values: string | string[],
        ) => {
            try {
                const q = admin.from(table).delete({ count: "exact" });
                const { error, count } = Array.isArray(values)
                    ? await q.in(column, values)
                    : await q.eq(column, values);
                if (error) {
                    console.warn(
                        `[delete-account] ${table}.${column} delete failed: ${error.message}`,
                    );
                    warnings.push({ step: "wipe", table, detail: error.message });
                } else {
                    console.log(
                        `[delete-account] ${table}.${column}: deleted ${count ?? 0} rows`,
                    );
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`[delete-account] ${table}.${column} threw: ${msg}`);
                warnings.push({ step: "wipe", table, detail: msg });
            }
        };

        // ─── Step 3: Profile-keyed deletes ───────────────────────
        if (profileIds.length > 0) {
            const profileTables: { table: string; column: string }[] = [
                { table: "action_events", column: "profile_id" },
                { table: "first_time_actions", column: "profile_id" },
                { table: "player_upgrades", column: "profile_id" },
                { table: "vector_progress", column: "profile_id" },
                { table: "missions", column: "profile_id" },
                { table: "quests", column: "profile_id" },
                { table: "canvas_snapshots", column: "profile_id" },
                { table: "entitlement_grants", column: "profile_id" },
                { table: "qol_snapshots", column: "profile_id" },
                { table: "zog_snapshots", column: "profile_id" },
                { table: "nurture_email_queue", column: "profile_id" },
                { table: "resonance_events", column: "profile_id" },
            ];
            for (const { table, column } of profileTables) {
                await wipe(table, column, profileIds);
            }
        }

        // ─── Step 4: User-keyed deletes ──────────────────────────
        const userTables: { table: string; column: string }[] = [
            // No-CASCADE FKs to auth.users — these BLOCK auth deletion if non-empty:
            { table: "events", column: "created_by" },
            { table: "genius_offer_requests", column: "user_id" },
            // CASCADE FKs to auth.users — safe but cleaned for completeness/storage:
            { table: "ai_boost_purchases", column: "user_id" },
            { table: "artifact_improvements", column: "user_id" },
            { table: "event_rsvps", column: "user_id" },
            { table: "genius_offer_wizard_progress", column: "user_id" },
            { table: "marketplace_products", column: "user_id" },
            { table: "mission_participants", column: "user_id" },
            { table: "multiple_intelligences_results", column: "user_id" },
            { table: "product_builder_snapshots", column: "user_id" },
            { table: "unique_business_dossiers", column: "user_id" },
            { table: "user_assets", column: "user_id" },
            { table: "user_business_artifacts", column: "user_id" },
            { table: "user_roles", column: "user_id" },
            { table: "visibility_settings", column: "user_id" },
            { table: "canvas_snapshots", column: "user_id" },
            { table: "resonance_events", column: "user_id" },
        ];
        for (const { table, column } of userTables) {
            await wipe(table, column, userId);
        }

        // connections — two-column user reference
        try {
            const { error } = await admin
                .from("connections")
                .delete()
                .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);
            if (error) {
                console.warn(`[delete-account] connections delete failed: ${error.message}`);
                warnings.push({ step: "wipe", table: "connections", detail: error.message });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            warnings.push({ step: "wipe", table: "connections", detail: msg });
        }

        // anonymous_genius_results.claimed_user_id is ON DELETE SET NULL,
        // but unlink explicitly so the row no longer ties back to this person.
        try {
            const { error } = await admin
                .from("anonymous_genius_results")
                .update({ claimed_user_id: null })
                .eq("claimed_user_id", userId);
            if (error) {
                warnings.push({
                    step: "unlink",
                    table: "anonymous_genius_results",
                    detail: error.message,
                });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            warnings.push({ step: "unlink", table: "anonymous_genius_results", detail: msg });
        }

        // ─── Step 5: Delete game_profiles ────────────────────────
        if (profileIds.length > 0) {
            const { error: gpError } = await admin
                .from("game_profiles")
                .delete()
                .in("id", profileIds);
            if (gpError) {
                console.warn(
                    `[delete-account] game_profiles delete failed: ${gpError.message}`,
                );
                warnings.push({
                    step: "wipe",
                    table: "game_profiles",
                    detail: gpError.message,
                });
            }
        }

        // ─── Step 6: Storage cleanup ─────────────────────────────
        const removeBucketFolder = async (bucket: string) => {
            try {
                const { data: list, error: listError } = await admin.storage
                    .from(bucket)
                    .list(userId, { limit: 1000 });
                if (listError) {
                    warnings.push({ step: "storage_list", table: bucket, detail: listError.message });
                    return;
                }
                if (!list || list.length === 0) return;
                const paths = list.map((o: { name: string }) => `${userId}/${o.name}`);
                const { error: rmError } = await admin.storage.from(bucket).remove(paths);
                if (rmError) {
                    warnings.push({ step: "storage_remove", table: bucket, detail: rmError.message });
                } else {
                    console.log(`[delete-account] storage ${bucket}: removed ${paths.length} files`);
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                warnings.push({ step: "storage", table: bucket, detail: msg });
            }
        };
        await removeBucketFolder("avatars");
        await removeBucketFolder("linkedin-profiles");

        // ─── Step 7: Delete the auth user (success criterion) ────
        const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
        if (deleteUserError) {
            console.error(
                `[delete-account] auth.admin.deleteUser failed: ${deleteUserError.message}`,
            );
            return json(500, {
                error: "auth_delete_failed",
                detail: deleteUserError.message,
                warnings,
            });
        }

        console.log(`[delete-account] completed user_id=${userId} email=${userEmail} warnings=${warnings.length}`);
        return json(200, { success: true, warnings });
    } catch (err) {
        console.error("[delete-account] unexpected error:", err);
        return json(500, {
            error: "internal_error",
            detail: err instanceof Error ? err.message : String(err),
        });
    }
});
