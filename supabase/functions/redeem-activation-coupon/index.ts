// redeem-activation-coupon — Day 95 (Sasha 2026-06-13).
//
// Server-side redemption of an activation coupon for the $37 deeper
// Top Talent view. Validates the code against a secret list (NOT the
// client bundle), then sets game_profiles.activation_unlocked_at for
// the authenticated caller via the service role — the one writer the
// protect_activation_unlocked_at trigger permits.
//
// Security: the code list is server-only; the flag is service-role-set;
// the caller must be authenticated (we resolve their profile from the
// JWT, never trusting a client-supplied profile id for the write).
//
// Codes come from the ACTIVATION_COUPON_CODES secret (comma-separated),
// falling back to the historical client codes so existing test flows
// keep working until the secret is set. Rotate via the secret — no
// redeploy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTIVATION_COUPON_CODES: string[] = (
  Deno.env.get("ACTIVATION_COUPON_CODES") ?? "guerishenko,appleseed"
)
  .split(",")
  .map((c) => c.trim().toLowerCase())
  .filter((c) => c.length > 0);

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { code } = await req.json().catch(() => ({ code: "" }));
    const entered = String(code ?? "").trim().toLowerCase();
    if (!entered) return json({ unlocked: false, error: "No code provided" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Resolve the caller from their JWT (never trust a client-passed id).
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ unlocked: false, error: "Not authenticated" }, 401);
    }

    // Validate the code server-side.
    if (!ACTIVATION_COUPON_CODES.includes(entered)) {
      return json({ unlocked: false, error: "Invalid code" }, 200);
    }

    // Set the durable flag via the service role (trigger permits this).
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileErr } = await admin
      .from("game_profiles")
      .select("id, activation_unlocked_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileErr || !profile) {
      return json({ unlocked: false, error: "Profile not found" }, 404);
    }

    // Idempotent — if already unlocked, report success without rewriting.
    if (profile.activation_unlocked_at) {
      return json({ unlocked: true, alreadyUnlocked: true });
    }

    // Authoritative write: select the column back and assert it moved.
    // Catches a trigger/RLS regression at runtime (silent no-op → loud)
    // instead of as "I redeemed a code but it's still locked" tickets.
    const { data: updated, error: updErr } = await admin
      .from("game_profiles")
      .update({ activation_unlocked_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select("activation_unlocked_at")
      .single();
    if (updErr) {
      console.error("[redeem-activation-coupon] update failed:", updErr);
      return json({ unlocked: false, error: "Failed to unlock" }, 500);
    }
    if (!updated?.activation_unlocked_at) {
      console.error("[redeem-activation-coupon] write no-op — column did not move (trigger/RLS?)");
      return json({ unlocked: false, error: "Unlock did not persist" }, 500);
    }

    return json({ unlocked: true });
  } catch (e) {
    console.error("[redeem-activation-coupon] unexpected:", e);
    return json({ unlocked: false, error: "Unexpected error" }, 500);
  }
});
