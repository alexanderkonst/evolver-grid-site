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

    // httpClient: required on the Deno edge runtime (matches
    // create-step-checkout / create-portal-session). Without it the
    // default Stripe HTTP client targets Node's http and can throw.
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Retrieve with line items so we can verify the PRODUCT, not just that
    // *some* session was paid (audit: a $555 / playbook session id must
    // NOT unlock the $37 product).
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // (1) Genuinely paid. Require payment_status === 'paid' ONLY — NOT the
    // looser status === 'complete', which a $0 / 100%-off promo session can
    // satisfy with no actual payment.
    if (session.payment_status !== "paid") {
      return json({ unlocked: false, error: "Payment not completed" }, 402);
    }

    // (2) Right product. Prefer an explicit price id when configured;
    // otherwise fall back to the known $37 amount. Fails closed if neither
    // matches (an unrelated paid session cannot unlock).
    const expectedPriceId = Deno.env.get("STRIPE_ACTIVATION_PRICE_ID") ?? "";
    const lineItems = (session.line_items?.data ?? []) as Array<{ price?: { id?: string } }>;
    const priceMatch = expectedPriceId
      ? lineItems.some((li) => li.price?.id === expectedPriceId)
      : null;
    const amountMatch = session.amount_total === 3700; // $37.00
    if (expectedPriceId ? !priceMatch : !amountMatch) {
      return json({ unlocked: false, error: "Session is not the activation product" }, 403);
    }

    // (3) Ownership when the session carries it. Static Payment Links
    // cannot stamp this per-buyer; when present (client_reference_id or
    // metadata.supabase_user_id), it MUST match the caller. When absent we
    // rely on (1)+(2) plus one-time consumption (4) below.
    const boundUserId =
      (session.client_reference_id as string | null) ??
      (session.metadata?.supabase_user_id as string | undefined) ??
      null;
    if (boundUserId && boundUserId !== user.id) {
      return json({ unlocked: false, error: "Session does not belong to caller" }, 403);
    }

    // Set the flag (service role — trigger permits).
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileErr } = await admin
      .from("game_profiles")
      .select("id, activation_unlocked_at, activation_stripe_session_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileErr || !profile) return json({ unlocked: false, error: "Profile not found" }, 404);

    if (profile.activation_unlocked_at) {
      return json({ unlocked: true, alreadyUnlocked: true });
    }

    // (4) One-time consumption: stamp the session id. The partial UNIQUE
    // index on activation_stripe_session_id makes a paid session usable for
    // exactly one account — a leaked/shared session id cannot be replayed
    // across profiles. A unique violation (23505) means it was already
    // consumed elsewhere.
    const { data: updated, error: updErr } = await admin
      .from("game_profiles")
      .update({
        activation_unlocked_at: new Date().toISOString(),
        activation_stripe_session_id: sessionId,
      })
      .eq("id", profile.id)
      .select("activation_unlocked_at")
      .single();
    if (updErr) {
      const code = (updErr as { code?: string }).code;
      if (code === "23505") {
        return json({ unlocked: false, error: "This payment was already used to unlock another account" }, 409);
      }
      console.error("[confirm-activation-payment] update failed:", updErr);
      return json({ unlocked: false, error: "Failed to unlock" }, 500);
    }
    // (5) Authoritative write check: confirm the column actually moved.
    // Catches a trigger/RLS regression at runtime (silent no-op → loud).
    if (!updated?.activation_unlocked_at) {
      console.error("[confirm-activation-payment] write no-op — column did not move (trigger/RLS?)");
      return json({ unlocked: false, error: "Unlock did not persist" }, 500);
    }

    return json({ unlocked: true });
  } catch (e) {
    console.error("[confirm-activation-payment] unexpected:", e);
    return json({ unlocked: false, error: "Unexpected error" }, 500);
  }
});
