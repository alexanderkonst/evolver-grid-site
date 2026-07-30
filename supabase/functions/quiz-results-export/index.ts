// quiz-results-export
//
// Token-gated read endpoint so the AI partner can pull the Transition Quiz
// dataset without Sasha needing Supabase dashboard access (he doesn't have
// it — see docs/specs/lovable_redeploy_prompt.md). Mirrors the agent-token
// pattern used by equilibrium-ai-context / sync-founder-corpus.
//
// GET, with a valid token, returns JSON:
//   { transition_quiz_results: [...], quiz_email_signups: [...] }
// newest first. Optional query params:
//   ?limit=N     — cap rows per table (default 500, max 2000)
//   ?since=ISO   — only rows with created_at/completed_at >= this timestamp
//
// No/invalid token => 401.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-token",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const bearerToken = (req: Request) => {
  const auth = req.headers.get("Authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  try {
    const expectedToken = Deno.env.get("QUIZ_RESULTS_EXPORT_TOKEN");
    const token = req.headers.get("x-agent-token") ?? bearerToken(req);

    if (!expectedToken || !token || token !== expectedToken) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const url = new URL(req.url);
    const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 2000) : 500;
    const since = url.searchParams.get("since");

    let resultsQuery = admin
      .from("transition_quiz_results")
      .select("*")
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (since) resultsQuery = resultsQuery.gte("completed_at", since);

    let emailQuery = admin
      .from("quiz_email_signups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (since) emailQuery = emailQuery.gte("created_at", since);

    const [{ data: results, error: resultsError }, { data: emails, error: emailError }] =
      await Promise.all([resultsQuery, emailQuery]);

    if (resultsError || emailError) {
      console.error("quiz-results-export: query failed", resultsError, emailError);
      return json({ error: "query_failed", detail: (resultsError ?? emailError)?.message }, 500);
    }

    return json({
      transition_quiz_results: results ?? [],
      quiz_email_signups: emails ?? [],
      meta: {
        limit,
        since: since ?? null,
        counts: {
          transition_quiz_results: (results ?? []).length,
          quiz_email_signups: (emails ?? []).length,
        },
      },
    });
  } catch (err) {
    console.error("quiz-results-export: unexpected error", err);
    return json({ error: "unexpected_error" }, 500);
  }
});
