import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * RequireAuth — wraps routes that need an authenticated user.
 * Shows a spinner while checking auth, redirects to /auth if not logged in.
 * Passes `?redirect=<current_path>` so the user returns after login.
 *
 * Day 148 (Sasha 2026-08-07): a signed-in user was being bounced to the
 * signup gate from /mission-discovery, repeatedly. Root cause: the guard
 * flipped to "unauthed" on the FIRST null signal from either getSession OR
 * any onAuthStateChange event. But onAuthStateChange fires transient null
 * events — e.g. when a `supabase.auth.getUser()` call elsewhere on the page
 * (the mission page runs one on mount) races an in-flight token refresh.
 * That spurious null kicked a still-signed-in user to /auth.
 *
 * Fix: getSession() is the authoritative source of truth — it reads the
 * session from storage and transparently refreshes an expired access token.
 * We derive status from it, and on a null auth event we RE-VERIFY via
 * getSession before declaring the user unauthed, rather than bouncing on the
 * bare event. A genuine sign-out still redirects (getSession then returns
 * null); a transient blip no longer does.
 */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // Authoritative check: storage-backed, refreshes an expired token.
    const resolve = async (reason: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!session) {
        // Only fires on an actual bounce — low-noise breadcrumb for
        // diagnosing any future gate issues in production.
        console.warn("[RequireAuth] no session, redirecting to /auth", {
          reason,
          path: location.pathname,
        });
      }
      setStatus(session ? "authed" : "unauthed");
    };

    resolve("mount");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session) {
        // A live session on any event (SIGNED_IN, TOKEN_REFRESHED, …) is
        // definitive — trust it without a round-trip.
        setStatus("authed");
      } else {
        // A null on the event is NOT trusted on its own: re-verify against
        // getSession (which can still surface a valid/refreshable session)
        // before bouncing. This is what stops the transient-null bounce.
        resolve(`event:${event}`);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthed") {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirectPath}`} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
