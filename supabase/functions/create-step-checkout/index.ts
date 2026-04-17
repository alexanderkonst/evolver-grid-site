import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

/**
 * create-step-checkout
 *
 * Creates a Stripe Checkout Session (one-time payment) for a playbook step.
 * The client invokes this with { priceId, stepSlug, returnUrl, cancelUrl };
 * on success we return { url } and the client redirects to Stripe.
 *
 * After payment Stripe redirects to:
 *   {returnUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}
 *
 * The PlaybookPage client detects that query string on mount and calls
 * a follow-up verify-and-advance function (TODO) that flips
 * onboarding_stage via a webhook or direct verify. For now the session_id
 * arrives in the URL so the next layer is already addressable.
 *
 * Stripe dashboard setup required (one-time, per step):
 *   1. Create a Product for each paid step (Package, Build, Product, Test,
 *      Launch, Scale).
 *   2. Create a one-time Price per product.
 *   3. Copy each Price ID ("price_1ABC…") into playbookSteps.ts → priceId.
 *
 * Env vars required (already used by create-portal-session):
 *   - STRIPE_SECRET_KEY
 *
 * Modeled on: supabase/functions/create-portal-session/index.ts
 */

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
        if (!stripeKey) {
            console.error("STRIPE_SECRET_KEY not configured");
            return new Response(
                JSON.stringify({ error: "Stripe not configured" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        const { priceId, stepSlug, returnUrl, cancelUrl } = await req.json();

        if (!priceId) {
            return new Response(
                JSON.stringify({ error: "priceId is required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }
        if (!stepSlug) {
            return new Response(
                JSON.stringify({ error: "stepSlug is required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }
        if (!returnUrl) {
            return new Response(
                JSON.stringify({ error: "returnUrl is required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        // Resolve user from bearer token — same pattern as create-portal-session.
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        const token = authHeader.replace("Bearer ", "");
        let userEmail: string | undefined;
        let userId: string | undefined;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userEmail = payload.email;
            userId = payload.sub;
        } catch (_err) {
            return new Response(
                JSON.stringify({ error: "Invalid auth token" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        if (!userEmail || !userId) {
            return new Response(
                JSON.stringify({ error: "User identity not found in token" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                },
            );
        }

        // Find or create the Stripe customer by email — matches
        // create-portal-session so the same customer record is reused.
        const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1,
        });

        let customerId: string;
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: { supabase_user_id: userId },
            });
            customerId = customer.id;
        }

        // Build success URL. Stripe will append the session_id so the
        // client can verify + advance onboarding_stage on return.
        const separator = returnUrl.includes("?") ? "&" : "?";
        const successUrl =
            `${returnUrl}${separator}payment=success&step=${stepSlug}&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrlFinal = cancelUrl ?? `${returnUrl}${separator}payment=cancelled`;

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrlFinal,
            metadata: {
                step_slug: stepSlug,
                supabase_user_id: userId,
            },
            payment_intent_data: {
                metadata: {
                    step_slug: stepSlug,
                    supabase_user_id: userId,
                },
            },
            // Allow promo codes so Sasha can issue founder / early-access codes
            // without a separate flow.
            allow_promotion_codes: true,
        });

        return new Response(
            JSON.stringify({ url: session.url, sessionId: session.id }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    } catch (error: any) {
        console.error("Error creating step checkout session:", error);
        return new Response(
            JSON.stringify({
                error: error.message || "Failed to create step checkout session",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
};

serve(handler);
