import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Terminal page in the magic-link flow. Supabase's client parses the tokens
// out of the URL fragment (detectSessionInUrl: true in client.ts), we wait for
// the session to materialise, then call claim-anonymous-zog to attach any
// anonymous ZoG result to the fresh user, and finally route onward.

const PENDING_CLAIM_EMAIL_KEY = "pending_claim_email";
const SESSION_WAIT_MS = 5000;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const handledRef = useRef(false);

  // Day 61 (Sasha 2026-05-04 15:15): default `next` shifted from
  // `/playbook/discover` (a platform-adjacent page that pulled free
  // auth'd users INTO platform exploration) to `/zone-of-genius` —
  // the canonical reveal. ZoneOfGeniusEntry's authed-user mode picks
  // up the just-claimed snapshot from `game_profile.last_zog_snapshot_id`
  // and renders the reveal directly (same artifact, no platform leak).
  // Callers can still override via the `?next=` query param when they
  // genuinely need to land somewhere else (paid post-session activation,
  // admin links, etc.).
  const next = searchParams.get("next") || "/zone-of-genius";

  useEffect(() => {
    let timeoutId: number | undefined;

    const proceed = async () => {
      if (handledRef.current) return;
      handledRef.current = true;
      if (timeoutId) window.clearTimeout(timeoutId);

      // Day 61 (Sasha 2026-05-04): explicit awaited claim RESTORED.
      // The Day 60 "centralization" that moved this to the global
      // SIGNED_IN listener in postAuthSideEffects.ts was fire-and-
      // forget — AuthCallback navigated immediately while the claim
      // was still in flight. The destination is now
      // /game/me/zone-of-genius/* which renders snapshot pages
      // directly, creating a race: page reads `last_zog_snapshot_id`
      // before the claim completes, sees null, spins on "Loading…"
      // forever (or shows empty state). The Day 60 comment claimed
      // "the destination doesn't render the user's snapshot
      // directly" — that was true for the old /playbook/discover
      // default but FALSE for the current Top Talent flow.
      //
      // Awaiting the claim before navigate restores the working
      // pre-Day-60 behavior. The global listener still fires too
      // (idempotent — claim returns `{ claimed: false }` if no row
      // to claim), serving as a safety net for any future entry
      // point that forgets to await explicitly. Dedup set in
      // postAuthSideEffects prevents duplicate work for the same
      // user.
      try {
        const { error } = await supabase.functions.invoke("claim-anonymous-zog");
        if (error) {
          console.warn("[AuthCallback] claim-anonymous-zog returned error", error);
        }
      } catch (err) {
        console.warn("[AuthCallback] claim-anonymous-zog threw", err);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(PENDING_CLAIM_EMAIL_KEY);
      }

      navigate(next, { replace: true });
    };

    // 1. If the session is already there (e.g. the user already signed in
    //    in another tab), short-circuit immediately.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) proceed();
    });

    // 2. Otherwise, listen for the SIGNED_IN event the Supabase client emits
    //    once it finishes parsing the URL-fragment tokens.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) proceed();
    });

    // 3. If nothing happens in 5 s, show a friendly error — usually means the
    //    magic link expired, was truncated by a corporate mail scanner, or the
    //    URL fragment was stripped somewhere along the way.
    timeoutId = window.setTimeout(() => {
      if (!handledRef.current) {
        setStatus("error");
      }
    }, SESSION_WAIT_MS);

    return () => {
      authListener.subscription.unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [navigate, next]);

  if (status === "error") {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 py-24 bg-gradient-to-br from-[#e7e9e5] via-[#dcdde2] to-[#c8b7d8]">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>We couldn't verify your sign-in link</CardTitle>
            <CardDescription>
              The link may have expired, or your email provider may have stripped the verification token. Request a fresh one from the sign-in page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/auth")}>
              Go back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-24 bg-gradient-to-br from-[#e7e9e5] via-[#dcdde2] to-[#c8b7d8]">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#8460ea] animate-spin mx-auto" />
        <p className="text-[#2c3150] font-medium">Signing you in…</p>
        <p className="text-sm text-[#6b6a8a]">Attaching your Top Talent result.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
