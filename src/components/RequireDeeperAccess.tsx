/**
 * RequireDeeperAccess — Day 95 (Sasha 2026-06-13): content gate for the
 * paid $37 deeper Top Talent view.
 *
 * Wraps the deeper-view routes (/game/me/zone-of-genius + every
 * /:perspectiveId subpage + start-here). Renders INSIDE MeGate, so the
 * caller is always authenticated by the time this runs (MeGate redirects
 * guests to /zone-of-genius). This gate then enforces the paywall:
 *
 *   • activated (paid / coupon / tier) → render children
 *   • authed but NOT activated          → redirect to /activate-top-talent
 *
 * It ALSO completes activation on arrival. A buyer / coupon-redeemer
 * lands here with `?payment=success` (and, for real Stripe payments, a
 * `session_id`). Before deciding to bounce them, this component invokes
 * the appropriate server-side confirmation:
 *   • session_id present → confirm-activation-payment (verifies with
 *     Stripe that it's genuinely paid before setting the flag)
 *   • pending coupon in sessionStorage → redeem-activation-coupon
 * then refetches access. This covers the already-authenticated buyer.
 * (Guests who must sign up first are confirmed inside MeGate's
 * post-payment onSuccess; this is the belt-and-suspenders path.)
 *
 * Fail-open: useDeeperAccess grants access if the access read errors
 * (e.g. before the migration is applied), so this gate can never lock
 * anyone out ahead of the DB change.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDeeperAccess } from "@/hooks/useDeeperAccess";

const PENDING_COUPON_KEY = "pending_activation_coupon";

const Spinner = () => (
  <div className="h-screen flex items-center justify-center bg-[#0a0a1a]">
    <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
  </div>
);

const RequireDeeperAccess = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { hasAccess, isLoading, refetch } = useDeeperAccess();
  const [confirming, setConfirming] = useState(false);
  const confirmRanRef = useRef(false);

  // On arrival, complete activation if this is a post-payment / post-
  // coupon landing. Runs exactly once.
  useEffect(() => {
    if (confirmRanRef.current) return;
    confirmRanRef.current = true;

    const params = new URLSearchParams(location.search);
    const isPaymentReturn = params.get("payment") === "success";
    const sessionId = params.get("session_id");
    let pendingCoupon: string | null = null;
    try {
      pendingCoupon = window.sessionStorage.getItem(PENDING_COUPON_KEY);
    } catch {
      pendingCoupon = null;
    }

    // Nothing to confirm → let the normal access read decide.
    if (!isPaymentReturn && !pendingCoupon) return;

    setConfirming(true);
    (async () => {
      try {
        if (sessionId) {
          await supabase.functions.invoke("confirm-activation-payment", {
            body: { session_id: sessionId },
          });
        } else if (pendingCoupon) {
          await supabase.functions.invoke("redeem-activation-coupon", {
            body: { code: pendingCoupon },
          });
        }
      } catch (err) {
        console.warn("[RequireDeeperAccess] activation confirm failed:", err);
      } finally {
        try {
          window.sessionStorage.removeItem(PENDING_COUPON_KEY);
        } catch {
          /* private mode — ignore */
        }
        refetch();
        setConfirming(false);
      }
    })();
    // location.search is the only input; run-once guard handles re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hold the gate decision until both the access read AND any in-flight
  // confirmation have settled — prevents a flash of the sales-page
  // redirect for a legitimate buyer mid-confirmation.
  if (isLoading || confirming) return <Spinner />;

  if (!hasAccess) {
    return <Navigate to="/activate-top-talent" replace />;
  }

  return <>{children}</>;
};

export default RequireDeeperAccess;
