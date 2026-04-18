import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/isAdmin";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

/**
 * Renders `children` only if the current session belongs to an admin email.
 * Unauthenticated → redirect to /auth. Authenticated non-admin → redirect to /.
 *
 * Used by FoundersIndex, FounderDetail, Dashboard (Phase 1 nav-loop).
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "admin" | "guest" | "denied">(
    "loading",
  );
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.user) {
        setStatus("guest");
        return;
      }
      setStatus(isAdminEmail(session.user.email) ? "admin" : "denied");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PremiumLoader />
      </div>
    );
  }
  if (status === "guest") {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (status === "denied") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
