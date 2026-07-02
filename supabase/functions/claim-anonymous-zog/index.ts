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

  const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "name" in item) {
          const name = (item as { name?: unknown }).name;
          return typeof name === "string" ? name : "";
        }
        return "";
      })
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const archetype = (get(["vibrationalKey", "name"]) as string | undefined)
    ?? (get(["archetype_title"]) as string | undefined)
    ?? (get(["topTalentProfile", "archetype_title"]) as string | undefined)
    ?? "Discovered Genius";

  const corePattern = (get(["threeLenses", "primeDriver"]) as string | undefined)
    ?? (get(["core_pattern"]) as string | undefined)
    ?? (get(["topTalentProfile", "core_pattern"]) as string | undefined)
    ?? (get(["bullseyeSentence"]) as string | undefined)
    ?? "Unique Pattern";

  const topThree =
    asStringArray(get(["top_three_talents"])).length > 0
      ? asStringArray(get(["top_three_talents"]))
      : asStringArray(get(["topTalentProfile", "top_three_talents_compact"])).length > 0
        ? asStringArray(get(["topTalentProfile", "top_three_talents_compact"]))
        : asStringArray(get(["threeLenses", "actions"])).slice(0, 3);
  const topTen = asStringArray(get(["top_ten_talents"]));

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

    // Reserve this anonymous row before inserting the snapshot. AuthCallback
    // and the global SIGNED_IN listener can both invoke this function around
    // the same time; the conditional update makes the claim idempotent so
    // only one caller can promote the row.
    const claimedAt = new Date().toISOString();
    const { data: reservedAnon, error: reserveError } = await admin
      .from("anonymous_genius_results")
      .update({
        claimed_user_id: user.id,
        claimed_at: claimedAt,
      })
      .eq("id", anon.id)
      .is("claimed_at", null)
      .select("id")
      .maybeSingle();

    if (reserveError) {
      console.error("claim-anonymous-zog: claim reservation failed", reserveError);
      return json(500, {
        error: "claim_reservation_failed",
        detail: reserveError.message,
      });
    }

    if (!reservedAnon) {
      return json(200, { claimed: false });
    }

    const restoreClaimReservation = async () => {
      const { error: restoreError } = await admin
        .from("anonymous_genius_results")
        .update({
          claimed_user_id: null,
          claimed_at: null,
        })
        .eq("id", anon.id);
      if (restoreError) {
        console.warn("claim-anonymous-zog: failed to restore claim reservation", restoreError);
      }
    };

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
      await restoreClaimReservation();
      return json(500, {
        error: "snapshot_insert_failed",
        detail: snapshotError?.message ?? "no row returned",
      });
    }

    // Keep game_profiles.last_zog_snapshot_id fresh so downstream UI picks it up.
    const { error: profileUpdateError } = await admin
      .from("game_profiles")
      .update({
        last_zog_snapshot_id: snapshot.id,
        zone_of_genius_completed: true,
        onboarding_stage: "zog_complete",
      })
      .eq("id", profileId);

    if (profileUpdateError) {
      console.error("claim-anonymous-zog: profile pointer update failed", profileUpdateError);
      await admin.from("zog_snapshots").delete().eq("id", snapshot.id);
      await restoreClaimReservation();
      return json(500, {
        error: "profile_update_failed",
        detail: profileUpdateError.message,
      });
    }

    // Promote the two-email sequence from anonymous "result waiting" rows to
    // claimed-profile rows. This prevents duplicate sends and lets the Day-1
    // template use the claimed/opened copy.
    try {
      const { data: optOut } = await admin
        .from("nurture_opt_outs")
        .select("email")
        .eq("email", email)
        .maybeSingle();
      const { data: existingNurtureRows } = await admin
        .from("nurture_email_queue")
        .select("email_type, status, profile_id, scheduled_for")
        .eq("email", email)
        .in("email_type", ["day1", "day2"]);

      const sentTypes = new Set(
        (existingNurtureRows ?? [])
          .filter((row) => row.status === "sent")
          .map((row) => row.email_type as string),
      );
      const pendingAnonymousSchedule = new Map(
        (existingNurtureRows ?? [])
          .filter((row) => row.status === "pending" && !row.profile_id)
          .map((row) => [row.email_type as string, row.scheduled_for as string]),
      );

      await admin
        .from("nurture_email_queue")
        .update({ status: "cancelled", last_error: "claimed_result_promoted_to_profile" })
        .eq("email", email)
        .is("profile_id", null)
        .eq("status", "pending");

      if (!optOut) {
        const now = new Date();
        const day1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const day2 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const nurturePayload = {
          archetype: snapshotFields.archetype_title,
          bullseye: snapshotFields.core_pattern,
          top_talents: snapshotFields.top_three_talents,
          claim_state: "claimed",
          intent: "journey",
        };
        const rowsToUpsert: Record<string, unknown>[] = [];
        if (!sentTypes.has("day1")) {
          rowsToUpsert.push({
            email,
            profile_id: profileId,
            email_type: "day1",
            scheduled_for: pendingAnonymousSchedule.get("day1") ?? day1.toISOString(),
            payload: nurturePayload,
          });
        }
        if (!sentTypes.has("day2")) {
          rowsToUpsert.push({
            email,
            profile_id: profileId,
            email_type: "day2",
            scheduled_for: pendingAnonymousSchedule.get("day2") ?? day2.toISOString(),
            payload: nurturePayload,
          });
        }

        if (rowsToUpsert.length > 0) {
          await admin
            .from("nurture_email_queue")
            .upsert(rowsToUpsert, { onConflict: "profile_id,email_type", ignoreDuplicates: false });
        }
      }
    } catch (nurtureErr) {
      console.warn("claim-anonymous-zog: nurture promotion failed (non-fatal)", nurtureErr);
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
