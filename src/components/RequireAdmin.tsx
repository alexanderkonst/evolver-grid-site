import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/isAdmin";

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "allowed" | "unauthed" | "denied">("loading");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setStatus("unauthed");
        return;
      }
      setStatus(isAdminEmail(session.user.email) ? "allowed" : "denied");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setStatus("unauthed");
        return;
      }
      setStatus(isAdminEmail(session.user.email) ? "allowed" : "denied");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthed") {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirectPath}`} replace />;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
