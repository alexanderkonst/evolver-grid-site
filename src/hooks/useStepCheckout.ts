import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlaybookStep } from "@/data/playbookSteps";

/**
 * useStepCheckout — launches a Stripe Checkout Session for a playbook step.
 *
 * Flow:
 *   1. Check if the step has a `priceId`. If not, show a "Pricing coming
 *      soon" toast and bail — this is the expected state until Sasha fills
 *      in Stripe price IDs per step.
 *   2. Pull the active Supabase session. If unauthenticated, redirect the
 *      user to /auth first with a return path back to this step.
 *   3. Invoke the `create-step-checkout` edge function.
 *   4. Redirect the browser to the returned Stripe URL.
 *
 * Modeled on: src/hooks/use-stripe-portal.ts
 */
export function useStepCheckout() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const startCheckout = async (step: PlaybookStep) => {
        // ═══ Gate 1: no priceId set yet → friendly placeholder ═══
        if (!step.priceId) {
            toast({
                title: "Pricing coming soon",
                description:
                    `${step.appName} opens shortly. Step 1 (Zone of Genius) is free to start now.`,
            });
            return;
        }

        setIsLoading(true);

        try {
            // ═══ Gate 2: auth required for Stripe customer lookup ═══
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                const returnPath = `/playbook/${step.slug}`;
                toast({
                    title: "Sign in to continue",
                    description:
                        "Claim your free Step 1 first — we'll bring you right back here.",
                });
                window.location.href =
                    `/auth?redirect=${encodeURIComponent(returnPath)}`;
                return;
            }

            // ═══ Invoke the edge function ═══
            const returnUrl =
                `${window.location.origin}/playbook/${step.slug}`;
            const cancelUrl = returnUrl;

            const response = await supabase.functions.invoke(
                "create-step-checkout",
                {
                    body: {
                        priceId: step.priceId,
                        stepSlug: step.slug,
                        returnUrl,
                        cancelUrl,
                    },
                },
            );

            if (response.error) {
                throw new Error(response.error.message);
            }

            const { url } = response.data ?? {};

            if (url) {
                // Full-page redirect to Stripe — leaves our app cleanly.
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: any) {
            toast({
                title: "Couldn't open checkout",
                description:
                    error.message ||
                    "Something went wrong starting the checkout. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
        // If redirect succeeds we unmount before reaching here, so we
        // deliberately don't setIsLoading(false) in that branch.
    };

    return { startCheckout, isLoading };
}
