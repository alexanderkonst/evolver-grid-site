import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * RequireAuth — wraps routes that need an authenticated user.
 * Shows a spinner while checking auth, redirects to /auth if not logged in.
 * Passes `?redirect=<current_path>` so the user returns after login.
 */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setStatus(session ? "authed" : "unauthed");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setStatus(session ? "authed" : "unauthed");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
