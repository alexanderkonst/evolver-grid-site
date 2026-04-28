// Admin-only endpoint that sends a magic link to a target email using the service role.
// Only callers with the 'admin' role (per public.has_role) may invoke.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    )!;
    const SITE_URL =
      Deno.env.get("SITE_URL") ?? "https://findyourtoptalent.com";

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing Authorization bearer token" }, 401);
    }

    // Validate caller via anon client + their JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    // Service-role client for admin checks + magic link generation
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

    let body: { email?: string; redirectTo?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Valid 'email' is required" }, 400);
    }

    const redirectTo = body.redirectTo ?? SITE_URL;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (error) {
      console.error("generateLink error", error);
      return json({ error: error.message }, 500);
    }

    return json({
      ok: true,
      email,
      action_link: data.properties?.action_link ?? null,
    });
  } catch (e) {
    console.error("admin-send-magic-link unexpected error", e);
    return json({ error: (e as Error).message ?? "Unknown error" }, 500);
  }
});
