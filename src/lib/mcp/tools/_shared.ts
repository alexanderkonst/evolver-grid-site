import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * Shared plumbing for the MCP tools.
 *
 * Every tool runs as the signed-in user: the bearer token from the MCP call
 * is forwarded to Supabase, so RLS decides what a tool can read or write.
 * No tool uses the service-role key.
 *
 * Pattern: each tool exports a pure core `(db, userId, input) => payload`
 * (unit-testable with a fake client) and a `defineTool` default export that
 * wires auth + error handling around it via `runForUser`.
 */

// The generated Database types lag the schema (many tables are cast through
// `any` elsewhere in the repo), so the tools talk to an untyped client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = { from: (table: string) => any; functions: { invoke: (name: string, opts?: any) => Promise<any> } };

export type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export const READ_ONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false } as const;
/** A write that converges on the same state when repeated with the same input. */
export const WRITE_IDEMPOTENT = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;
/** A write that appends something new on every call (e.g. a new artifact version). */
export const WRITE_APPEND = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

/** An error whose message is safe to show to the agent. Anything else is replaced by a generic one. */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

export function supabaseForUser(ctx: ToolContext): Db {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as Db;
}

type PgLikeError = { code?: string; message?: string; status?: number } | null | undefined;

/**
 * Turn a PostgREST / fetch / functions error into one sentence for the agent.
 * Never forwards the raw message (it can leak table, column and policy names).
 */
export function friendlyDbError(err: unknown, action: string): string {
  const e = (err ?? {}) as NonNullable<PgLikeError>;
  const code = typeof e.code === "string" ? e.code : "";
  const msg = typeof e.message === "string" ? e.message : "";

  if (code === "42501" || /row-level security|permission denied/i.test(msg)) {
    return `Not allowed to ${action}. The signed-in account has no access to this data.`;
  }
  if (code === "PGRST301" || code === "PGRST303" || /jwt|token.*expired/i.test(msg)) {
    return `The session expired while trying to ${action}. Re-authenticate and retry.`;
  }
  if (code === "23505") {
    return `Could not ${action}: an identical entry already exists.`;
  }
  if (["23502", "23503", "23514", "22P02", "22001", "22003"].includes(code)) {
    return `Could not ${action}: the platform rejected the values as invalid.`;
  }
  if (["42P01", "42703", "PGRST204", "PGRST205"].includes(code) || /schema cache/i.test(msg)) {
    return `Could not ${action}: this feature is not available on the current deployment yet (a database update is pending). Ask the owner.`;
  }
  if (/fetch failed|network|timed? ?out|ECONN/i.test(msg)) {
    return `Could not ${action}: the platform could not be reached. Try again in a moment.`;
  }
  return `Could not ${action}. Try again; if it keeps failing, tell the owner.`;
}

/** Throws a safe ToolError when a Supabase response carries an error; returns `data` otherwise. */
export function unwrap<T>(res: { data: T; error: unknown }, action: string): T {
  if (res.error) {
    const e = res.error as NonNullable<PgLikeError>;
    // Operator log: code only, never the token or row contents.
    console.error(`[mcp] ${action} failed`, e?.code ?? "no-code");
    throw new ToolError(friendlyDbError(res.error, action));
  }
  return res.data;
}

/**
 * Map an edge-function invocation failure to a safe ToolError.
 * `functions.invoke` reports non-2xx as `error`, and AI-gateway problems as `data.error`.
 */
export function unwrapFunction<T extends { error?: unknown } | null>(
  res: { data: T; error: unknown },
  action: string,
): NonNullable<T> {
  const payloadError = (res.data as { error?: unknown } | null)?.error;
  if (res.error || payloadError) {
    const text = `${(res.error as PgLikeError)?.message ?? ""} ${typeof payloadError === "string" ? payloadError : ""}`;
    console.error(`[mcp] ${action} edge function failed`, (res.error as PgLikeError)?.status ?? "n/a");
    if (/429|rate limit/i.test(text)) {
      throw new ToolError(`Could not ${action}: the AI service is rate-limited. Retry in a minute.`);
    }
    if (/402|credit|payment/i.test(text) || payloadError === "insufficient_credit") {
      throw new ToolError(`Could not ${action}: the AI credit limit is reached. The owner needs to top up.`);
    }
    throw new ToolError(`Could not ${action}: the AI service is briefly unavailable. Try again in a minute.`);
  }
  if (!res.data) throw new ToolError(`Could not ${action}: the platform returned an empty response.`);
  return res.data as NonNullable<T>;
}

export function ok(payload: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

export function fail(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

/**
 * Auth check + user-scoped client + uniform error handling.
 * `action` is a verb phrase used in messages: "save the mission".
 */
export async function runForUser(
  ctx: ToolContext,
  action: string,
  run: (db: Db, userId: string) => Promise<Record<string, unknown>>,
): Promise<ToolResult> {
  if (!ctx.isAuthenticated()) {
    return fail("Not authenticated. Sign in through the MCP client and retry.");
  }
  const userId = ctx.getUserId();
  if (!userId) return fail("Not authenticated. Sign in through the MCP client and retry.");
  try {
    return ok(await run(supabaseForUser(ctx), userId));
  } catch (err) {
    if (err instanceof ToolError) return fail(err.message);
    console.error(`[mcp] ${action} crashed`, err instanceof Error ? err.name : typeof err);
    return fail(`Could not ${action}. Try again; if it keeps failing, tell the owner.`);
  }
}

/** Trim, collapse whitespace, lowercase — the dedupe key the UI uses for titles. */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Find the user's game_profiles row, creating it when missing (same behaviour
 * as getOrCreateGameProfileId in the browser, minus the guest/localStorage paths).
 */
export async function getOrCreateProfileId(db: Db, userId: string): Promise<string> {
  const existing = unwrap(
    await db.from("game_profiles").select("id").eq("user_id", userId).maybeSingle(),
    "load the profile",
  ) as { id: string } | null;
  if (existing?.id) return existing.id;

  const created = await db.from("game_profiles").insert({ user_id: userId }).select("id").single();
  if (created.error) {
    // Lost a race with another caller creating the same profile — read theirs.
    if ((created.error as NonNullable<PgLikeError>).code === "23505") {
      const winner = unwrap(
        await db.from("game_profiles").select("id").eq("user_id", userId).maybeSingle(),
        "load the profile",
      ) as { id: string } | null;
      if (winner?.id) return winner.id;
    }
    throw new ToolError(friendlyDbError(created.error, "create the profile"));
  }
  return (created.data as { id: string }).id;
}
