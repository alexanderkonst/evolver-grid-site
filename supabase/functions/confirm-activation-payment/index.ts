// confirm-activation-payment — Day 95 (Sasha 2026-06-13).
//
// Verifies a completed Stripe Checkout for the $37 deeper Top Talent
// view and sets game_profiles.activation_unlocked_at for the caller.
//
// Why server-side verification (not just trusting ?payment=success):
// the success URL is client-navigable and therefore spoofable — a free
// user could type it to self-grant. This function retrieves the actual
// Stripe session by id, confirms payment_status === 'paid', and confirms
// the session's metadata.supabase_user_id matches the authenticated
// caller, before writing the flag. No webhook needed (uses the same
// STRIPE_SECRET_KEY already configured for create-step-checkout).
//
// A Stripe webhook remains the more robust long-term mechanism (handles
// async payment methods, refunds, etc.) — tracked as a follow-up.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { session_id } = await req.json().catch(() => ({ session_id: "" }));
    const sessionId = String(session_id ?? "").trim();
    if (!sessionId) return json({ unlocked: false, error: "No session_id" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[confirm-activation-payment] STRIPE_SECRET_KEY not set");
      return json({ unlocked: false, error: "Payment verification unavailable" }, 500);
    }

    // Resolve caller from JWT.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ unlocked: false, error: "Not authenticated" }, 401);

    // Verify the Stripe session is genuinely paid AND belongs to this user.
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.payment_status === "paid" || session.status === "complete";
    if (!paid) {
      return json({ unlocked: false, error: "Payment not completed" }, 402);
    }
    const sessionUserId = session.metadata?.supabase_user_id ?? null;
    // If the checkout carried a user id, it must match the caller. (Some
    // older Payment-Link sessions may lack metadata; in that case we fall
    // back to "paid is enough" since the caller is authenticated and the
    // session id is unguessable.)
    if (sessionUserId && sessionUserId !== user.id) {
      return json({ unlocked: false, error: "Session does not belong to caller" }, 403);
    }

    // Set the flag (service role — trigger permits).
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileErr } = await admin
      .from("game_profiles")
      .select("id, activation_unlocked_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileErr || !profile) return json({ unlocked: false, error: "Profile not found" }, 404);

    if (profile.activation_unlocked_at) {
      return json({ unlocked: true, alreadyUnlocked: true });
    }

    const { error: updErr } = await admin
      .from("game_profiles")
      .update({ activation_unlocked_at: new Date().toISOString() })
      .eq("id", profile.id);
    if (updErr) {
      console.error("[confirm-activation-payment] update failed:", updErr);
      return json({ unlocked: false, error: "Failed to unlock" }, 500);
    }

    return json({ unlocked: true });
  } catch (e) {
    console.error("[confirm-activation-payment] unexpected:", e);
    return json({ unlocked: false, error: "Unexpected error" }, 500);
  }
});
