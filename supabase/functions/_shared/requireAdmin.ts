// Shared admin gate for edge functions.
//
// Mirrors the pattern used in admin-send-magic-link: the caller's JWT is
// verified server-side (never trusting client claims) and the resolved user
// is checked against public.has_role(uid, 'admin').
//
// Usage:
//   const denied = await requireAdmin(req);
//   if (denied) return denied;

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function requireAdmin(
  req: Request,
  corsHeaders: Record<string, string> = {},
): Promise<Response | null> {
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Missing Authorization bearer token" }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return json({ error: "Invalid or expired session" }, 401);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (roleErr) {
    console.error("has_role error", roleErr);
    return json({ error: "Role check failed" }, 500);
  }
  if (!isAdmin) {
    return json({ error: "Forbidden: admin role required" }, 403);
  }

  return null;
}
