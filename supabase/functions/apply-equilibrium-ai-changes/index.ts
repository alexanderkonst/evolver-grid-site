import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = new Set(["alexanderkonst@gmail.com", "konst@alum.mit.edu", "me@sloan.mit.edu"]);

type ChangeType =
  | "add_synthesis_log"
  | "update_strategy"
  | "update_workstream"
  | "update_task";

interface AcceptedChange {
  change_type: ChangeType;
  target_id?: string;
  title?: string;
  body: string;
  reason?: string;
}

interface ApplyRequest {
  source?: string;
  lens_id?: string;
  accepted_changes?: AcceptedChange[];
}

const allowedChangeTypes = new Set<ChangeType>([
  "add_synthesis_log",
  "update_strategy",
  "update_workstream",
  "update_task",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function bearerToken(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  return auth.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

function cleanText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} cannot be empty.`);
  if (trimmed.length > maxLength) throw new Error(`${field} is too long.`);
  return trimmed;
}

function validateChange(value: unknown): AcceptedChange {
  if (!value || typeof value !== "object") throw new Error("Each accepted change must be an object.");
  const candidate = value as Partial<AcceptedChange>;
  if (!candidate.change_type || !allowedChangeTypes.has(candidate.change_type)) {
    throw new Error("Unsupported change_type.");
  }

  return {
    change_type: candidate.change_type,
    target_id: typeof candidate.target_id === "string" ? candidate.target_id.trim() : undefined,
    title: typeof candidate.title === "string" ? candidate.title.trim().slice(0, 140) : undefined,
    body: cleanText(candidate.body, "body", 4000),
    reason: typeof candidate.reason === "string" ? candidate.reason.trim().slice(0, 500) : undefined,
  };
}

async function requireAdmin(req: Request) {
  const token = bearerToken(req);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!token || !supabaseUrl || !anonKey) {
    return { ok: false as const, status: 401, error: "Unauthorized." };
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) {
    return { ok: false as const, status: 401, error: "Unauthorized." };
  }

  const email = String(data.user.email ?? "").toLowerCase();
  if (!ADMIN_EMAILS.has(email)) {
    return { ok: false as const, status: 403, error: "Forbidden." };
  }

  return { ok: true as const, token, userId: data.user.id, email };
}

function readingText(change: AcceptedChange, request: ApplyRequest) {
  const title = change.title ? `${change.title}\n\n` : "";
  const reason = change.reason ? `\n\nReason accepted: ${change.reason}` : "";
  return `${title}${change.body}${reason}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return jsonResponse({ error: auth.error }, auth.status);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Supabase environment is not configured." }, 500);
    }

    const body = (await req.json()) as ApplyRequest;
    const source = typeof body.source === "string" ? body.source.trim() : "founder_cockpit";
    const lensId = typeof body.lens_id === "string" ? body.lens_id.trim() : "unknown";
    const changes = Array.isArray(body.accepted_changes)
      ? body.accepted_changes.map(validateChange).slice(0, 3)
      : [];

    if (!changes.length) {
      return jsonResponse({ error: "No accepted changes provided." }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const applied: Array<{ change_type: ChangeType; target_id?: string; log_id?: string }> = [];

    for (const change of changes) {
      if (change.change_type === "add_synthesis_log") {
        const { data, error } = await admin
          .from("equilibrium_synthesis_log")
          .insert({
            user_id: auth.userId,
            reading_text: readingText(change, body),
            cycle_snapshot_json: {
              source,
              lens_id: lensId,
              accepted_at: new Date().toISOString(),
              accepted_by: auth.email,
              change_type: change.change_type,
              title: change.title ?? null,
            },
          })
          .select("id")
          .single();

        if (error) throw new Error(`Could not add synthesis log: ${error.message}`);

        await admin
          .from("equilibrium_state")
          .upsert({
            user_id: auth.userId,
            last_synthesis_text: readingText(change, body),
            last_synthesis_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        applied.push({ change_type: change.change_type, log_id: data?.id });
        continue;
      }

      if (!change.target_id) {
        throw new Error(`${change.change_type} requires target_id.`);
      }

      if (change.change_type === "update_strategy") {
        const position = Number(change.target_id);
        if (!Number.isInteger(position) || position < 1 || position > 3) {
          throw new Error("update_strategy target_id must be a strategy position from 1 to 3.");
        }
        const { error } = await admin
          .from("equilibrium_strategies")
          .update({ text: change.body, set_at: new Date().toISOString() })
          .eq("user_id", auth.userId)
          .eq("position", position);
        if (error) throw new Error(`Could not update strategy: ${error.message}`);
        applied.push({ change_type: change.change_type, target_id: change.target_id });
      }

      if (change.change_type === "update_workstream") {
        const { error } = await admin
          .from("equilibrium_workstreams")
          .update({ title: change.body })
          .eq("user_id", auth.userId)
          .eq("id", change.target_id);
        if (error) throw new Error(`Could not update workstream: ${error.message}`);
        applied.push({ change_type: change.change_type, target_id: change.target_id });
      }

      if (change.change_type === "update_task") {
        const { data: ownedTask, error: readError } = await admin
          .from("equilibrium_tasks")
          .select("id, equilibrium_workstreams!inner(user_id)")
          .eq("id", change.target_id)
          .eq("equilibrium_workstreams.user_id", auth.userId)
          .maybeSingle();
        if (readError) throw new Error(`Could not verify task ownership: ${readError.message}`);
        if (!ownedTask) throw new Error("Task not found or not owned by current user.");

        const { error } = await admin
          .from("equilibrium_tasks")
          .update({ text: change.body })
          .eq("id", change.target_id);
        if (error) throw new Error(`Could not update task: ${error.message}`);
        applied.push({ change_type: change.change_type, target_id: change.target_id });
      }

      const { error: logError } = await admin
        .from("equilibrium_synthesis_log")
        .insert({
          user_id: auth.userId,
          reading_text: `Applied ${change.change_type}: ${change.body}`,
          cycle_snapshot_json: {
            source,
            lens_id: lensId,
            accepted_at: new Date().toISOString(),
            accepted_by: auth.email,
            change_type: change.change_type,
            target_id: change.target_id,
            title: change.title ?? null,
          },
        });
      if (logError) throw new Error(`Could not audit writeback: ${logError.message}`);
    }

    return jsonResponse({
      source: "apply-equilibrium-ai-changes",
      applied_count: applied.length,
      applied,
    });
  } catch (error) {
    console.error("[apply-equilibrium-ai-changes] fatal", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error." }, 500);
  }
});
