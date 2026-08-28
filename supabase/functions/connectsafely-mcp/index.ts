// Commercial OS ↔ ConnectSafely MCP bridge (Phase 1: READ ONLY).
//
// The frontend (static Commercial OS app served at /commercial-os/) never sees
// the ConnectSafely credential. It posts { op, input } here; this function
// translates the operation into a ConnectSafely MCP JSON-RPC tool call over
// the secret Streamable HTTP URL held in CONNECTSAFELY_MCP_URL.
//
// verify_jwt = false because we validate the caller's JWT in code (shared
// requireAdmin helper) and need full control over CORS + error shapes.
// Only the Commercial OS owner (admin role) may reach LinkedIn data.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireAdmin } from "../_shared/requireAdmin.ts";

const MCP_URL = Deno.env.get("CONNECTSAFELY_MCP_URL") ?? "";
const PROTOCOL_VERSION = "2025-06-18";

/** Phase 1 allow-list. Every entry is a pure read; nothing here mutates LinkedIn. */
const READ_TOOLS: Record<string, string> = {
  listAccounts: "list-linkedin-accounts",
  accountStatus: "get-account-status-by-id",
  accountQuota: "get-account-quota",
  accountPremium: "get-account-premium-status",
  searchPeople: "search-people",
  getConnections: "get-connections",
  listConversations: "list-conversations",
  getConversationMessages: "get-conversation-messages",
  conversationExists: "conversation-exists",
};

/** Explicitly rejected even if the frontend asks — Phase 1 is read only. */
const MUTATION_OPS = new Set([
  "sendConnectionRequest",
  "sendMessage",
  "conversationsSendMessage",
  "createPost",
  "commentOnPost",
  "reactToPost",
  "followUser",
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Strip anything that could carry the secret URL or a token out of an error. */
function sanitize(message: unknown): string {
  const text = String(message ?? "Unknown error");
  const withoutUrls = text.replace(/https?:\/\/[^\s"']+/g, "[redacted-url]");
  return withoutUrls.replace(/(bearer\s+)\S+/gi, "$1[redacted]").slice(0, 400);
}

type RpcResult = { result?: Record<string, unknown>; error?: { message?: string; code?: number } };

/** Parse a Streamable HTTP response body: either plain JSON or SSE frames. */
function parseRpcBody(body: string): RpcResult {
  const trimmed = body.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed) as RpcResult;
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith("data:")) {
      const payload = line.slice(5).trim();
      if (payload && payload !== "[DONE]") return JSON.parse(payload) as RpcResult;
    }
  }
  throw new Error("Upstream returned an unreadable MCP response");
}

async function rpc(
  payload: Record<string, unknown>,
  sessionId: string | null,
  timeoutMs = 45000,
): Promise<{ result: RpcResult; sessionId: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(MCP_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        // Required by the MCP Streamable HTTP spec; without it servers 406.
        "Accept": "application/json, text/event-stream",
        "MCP-Protocol-Version": PROTOCOL_VERSION,
        ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
      },
      body: JSON.stringify(payload),
    });
    const nextSession = response.headers.get("mcp-session-id") || sessionId;
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Upstream MCP ${response.status}: ${sanitize(text)}`);
    }
    return { result: parseRpcBody(text), sessionId: nextSession };
  } finally {
    clearTimeout(timer);
  }
}

/** Stateless-friendly handshake: initialize, keep any session id the server hands back. */
async function handshake(): Promise<string | null> {
  const { result, sessionId } = await rpc(
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: "commercial-os", version: "1.0.0" },
      },
    },
    null,
  );
  if (result.error) throw new Error(sanitize(result.error.message));
  if (sessionId) {
    // Best-effort; stateless servers ignore or 202 this notification.
    try {
      await rpc({ jsonrpc: "2.0", method: "notifications/initialized" }, sessionId, 10000);
    } catch { /* notification failures are not fatal */ }
  }
  return sessionId;
}

/** Unwrap an MCP tool result into the plain payload the Commercial OS expects. */
function unwrap(result: Record<string, unknown> | undefined): unknown {
  if (!result) return {};
  if (result.isError) {
    const content = result.content as Array<{ text?: string }> | undefined;
    throw new Error(sanitize(content?.[0]?.text || "MCP tool reported an error"));
  }
  if (result.structuredContent !== undefined) return result.structuredContent;
  const content = result.content as Array<{ text?: string }> | undefined;
  const text = content?.[0]?.text;
  if (text) {
    try { return JSON.parse(text); } catch { return { text }; }
  }
  return result;
}

async function callTool(tool: string, input: Record<string, unknown>): Promise<unknown> {
  let sessionId: string | null = null;
  try { sessionId = await handshake(); } catch { sessionId = null; }
  const attempt = async (session: string | null) =>
    rpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: tool, arguments: input } }, session);
  try {
    const { result } = await attempt(sessionId);
    if (result.error) throw new Error(sanitize(result.error.message));
    return unwrap(result.result);
  } catch (error) {
    // A stale/expired session is the common stateless failure: retry once clean.
    if (!sessionId) throw error;
    const { result } = await attempt(await handshake().catch(() => null));
    if (result.error) throw new Error(sanitize(result.error.message));
    return unwrap(result.result);
  }
}

async function status() {
  const configured = Boolean(MCP_URL);
  const report = {
    configured,
    reachable: false,
    toolsDiscovered: 0,
    readToolsAvailable: [] as string[],
    ready: false,
    writesEnabled: false,
    gmailEnabled: false,
    error: null as string | null,
  };
  if (!configured) {
    report.error = "CONNECTSAFELY_MCP_URL is not configured";
    return report;
  }
  try {
    const sessionId = await handshake().catch(() => null);
    const { result } = await rpc({ jsonrpc: "2.0", id: 3, method: "tools/list", params: {} }, sessionId);
    if (result.error) throw new Error(sanitize(result.error.message));
    report.reachable = true;
    const tools = (result.result?.tools as Array<{ name: string }> | undefined) ?? [];
    report.toolsDiscovered = tools.length;
    const names = new Set(tools.map((t) => t.name));
    report.readToolsAvailable = Object.values(READ_TOOLS).filter((name) => names.has(name));
    report.ready = report.readToolsAvailable.length === Object.keys(READ_TOOLS).length;
  } catch (error) {
    report.error = sanitize(error instanceof Error ? error.message : error);
  }
  return report;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const denied = await requireAdmin(req, corsHeaders);
  if (denied) return denied;

  let body: { op?: string; input?: Record<string, unknown> } = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { body = {}; }
  }
  const op = String(body.op || new URL(req.url).searchParams.get("op") || "");

  if (!op || op === "status") return json(await status());

  if (MUTATION_OPS.has(op) || /send|create|post|delete|withdraw|react|follow|comment|endorse|upload|repost/i.test(op)) {
    return json({ error: "Phase 1 is read only. Write operations are disabled server-side." }, 403);
  }

  const tool = READ_TOOLS[op];
  if (!tool) return json({ error: `Unsupported operation: ${op}` }, 403);

  if (!MCP_URL) return json({ error: "CONNECTSAFELY_MCP_URL is not configured" }, 503);

  try {
    const payload = await callTool(tool, body.input ?? {});
    return json({ ok: true, op, tool, payload });
  } catch (error) {
    const message = sanitize(error instanceof Error ? error.message : error);
    console.error("connectsafely-mcp failure", { op, tool, message });
    return json({ error: message, op, tool }, 502);
  }
});
