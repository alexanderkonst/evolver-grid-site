// claim-anonymous-zog
//
// Authenticated endpoint. Called by /auth/callback right after the user's
// magic-link sign-in settles. Finds the most recent unclaimed
// anonymous_genius_results row for this user's email, promotes it into a
// zog_snapshot tied to the user's game_profile, and marks the anonymous row
// as claimed. Idempotent: second call after the same row is claimed returns
// { claimed: false } and does nothing.

import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Mirrors src/lib/gameProfile.ts::getOrCreateGameProfileId, minus the
// localStorage-based anonymous-profile migration (which is browser-only).
const getOrCreateGameProfileId = async (
  admin: SupabaseClient,
  user: User,
): Promise<string> => {
  const { data: existing, error: fetchError } = await admin
    .from("game_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }
  if (existing) return existing.id as string;

  const firstName = (user.user_metadata?.first_name as string | undefined) ?? null;
  const lastName = (user.user_metadata?.last_name as string | undefined) ?? null;

  const { data: created, error: createError } = await admin
    .from("game_profiles")
    .insert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
    })
    .select("id")
    .single();

  if (createError || !created) {
    throw createError ?? new Error("game_profile insert returned no row");
  }
  return created.id as string;
};

// Pull the Appleseed-style summary fields out of the payload, with safe
// fallbacks for other assessment shapes so the NOT NULL columns on
// zog_snapshots are always satisfied.
const extractSnapshotFields = (payload: Record<string, unknown>) => {
  const get = (path: string[]): unknown => {
    let cursor: unknown = payload;
    for (const key of path) {
      if (cursor && typeof cursor === "object" && key in (cursor as Record<string, unknown>)) {
        cursor = (cursor as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return cursor;
  };

  const archetype = (get(["vibrationalKey", "name"]) as string | undefined)
    ?? (get(["archetype_title"]) as string | undefined)
    ?? "Discovered Genius";

  const corePattern = (get(["threeLenses", "primeDriver"]) as string | undefined)
    ?? (get(["core_pattern"]) as string | undefined)
    ?? "Unique Pattern";

  const topThree = Array.isArray(get(["top_three_talents"]))
    ? (get(["top_three_talents"]) as unknown[])
    : [];
  const topTen = Array.isArray(get(["top_ten_talents"]))
    ? (get(["top_ten_talents"]) as unknown[])
    : [];

  return {
    archetype_title: archetype,
    core_pattern: corePattern,
    top_three_talents: topThree,
    top_ten_talents: topTen,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) return json(401, { error: "unauthenticated" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("claim-anonymous-zog: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Resolve the caller.
    const { data: userResult, error: userError } = await admin.auth.getUser(accessToken);
    if (userError || !userResult?.user?.email) {
      return json(401, {
        error: "unauthenticated",
        detail: userError?.message ?? "no user",
      });
    }
    const user = userResult.user;
    const email = user.email!.trim().toLowerCase();

    // ── Find most recent unclaimed row for this email ───────────────
    const { data: anon, error: findError } = await admin
      .from("anonymous_genius_results")
      .select("id, result_payload, assessment_version")
      .ilike("email", email)
      .is("claimed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error("claim-anonymous-zog: lookup failed", findError);
      return json(500, { error: "lookup_failed", detail: findError.message });
    }

    // Nothing to claim — not an error, just a no-op.
    if (!anon) return json(200, { claimed: false });

    const resultPayload = anon.result_payload as Record<string, unknown>;

    // ── Resolve / create the user's game_profile ────────────────────
    let profileId: string;
    try {
      profileId = await getOrCreateGameProfileId(admin, user);
    } catch (err) {
      console.error("claim-anonymous-zog: profile resolution failed", err);
      return json(500, {
        error: "profile_resolution_failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    }

    // ── Insert zog_snapshot ─────────────────────────────────────────
    const snapshotFields = extractSnapshotFields(resultPayload);
    const { data: snapshot, error: snapshotError } = await admin
      .from("zog_snapshots")
      .insert({
        profile_id: profileId,
        archetype_title: snapshotFields.archetype_title,
        core_pattern: snapshotFields.core_pattern,
        top_three_talents: snapshotFields.top_three_talents,
        top_ten_talents: snapshotFields.top_ten_talents,
        appleseed_data: resultPayload,
        appleseed_generated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (snapshotError || !snapshot) {
      console.error("claim-anonymous-zog: snapshot insert failed", snapshotError);
      return json(500, {
        error: "snapshot_insert_failed",
        detail: snapshotError?.message ?? "no row returned",
      });
    }

    // Keep game_profiles.last_zog_snapshot_id fresh so downstream UI picks it up.
    await admin
      .from("game_profiles")
      .update({
        last_zog_snapshot_id: snapshot.id,
        zone_of_genius_completed: true,
      })
      .eq("id", profileId);

    // ── Mark the anonymous row as claimed ───────────────────────────
    const { error: claimMarkError } = await admin
      .from("anonymous_genius_results")
      .update({
        claimed_user_id: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", anon.id);

    if (claimMarkError) {
      // Log but don't fail — the snapshot is already in place.
      console.warn("claim-anonymous-zog: claim-mark failed", claimMarkError);
    }

    return json(200, {
      claimed: true,
      zog_snapshot_id: snapshot.id,
      game_profile_id: profileId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("claim-anonymous-zog: unexpected error", message);
    return json(500, { error: "internal_error", detail: message });
  }
});
