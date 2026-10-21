/**
 * Shared MCP tool plumbing: friendly errors, the auth + error wrapper, and a
 * registry check that every tool file is wired into index.ts with a zod schema
 * and correct read/write annotations.
 */

import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ tag: "user-scoped-client" })),
}));

import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { ToolError, friendlyDbError, runForUser, unwrap, unwrapFunction } from "../tools/_shared";
import { RAW_DB_MESSAGE } from "./fakeDb";

const ctxFor = (over: Partial<Record<keyof ToolContext, unknown>> = {}) =>
  ({
    isAuthenticated: () => true,
    getUserId: () => "user-1",
    getToken: () => "secret-bearer-token",
    ...over,
  }) as unknown as ToolContext;

describe("friendlyDbError", () => {
  const cases: [string, { code?: string; message?: string }, RegExp][] = [
    ["RLS denial by code", { code: "42501" }, /not allowed to do the thing/i],
    ["RLS denial by message", { message: 'new row violates row-level security policy for table "x"' }, /not allowed/i],
    ["expired session", { code: "PGRST301" }, /session expired/i],
    ["duplicate", { code: "23505" }, /already exists/i],
    ["check violation", { code: "23514" }, /rejected the values/i],
    ["missing column", { code: "42703" }, /not available on the current deployment/i],
    ["schema cache", { message: "Could not find the 'x' column in the schema cache" }, /not available on the current deployment/i],
    ["network", { message: "TypeError: fetch failed" }, /could not be reached/i],
    ["anything else", { code: "XX000" }, /try again/i],
  ];

  it.each(cases)("%s", (_name, err, expected) => {
    const message = friendlyDbError({ message: RAW_DB_MESSAGE, ...err }, "do the thing");
    expect(message).toMatch(expected);
    // Raw database text (table, policy and column names) never reaches the agent.
    expect(message).not.toContain("secret_table");
    expect(message).not.toContain("internal_policy_name");
  });

  it("copes with a missing or non-object error", () => {
    expect(friendlyDbError(undefined, "do the thing")).toMatch(/could not do the thing/i);
    expect(friendlyDbError("boom", "do the thing")).toMatch(/could not do the thing/i);
  });
});

describe("unwrap / unwrapFunction", () => {
  it("returns data on success and a ToolError on failure", () => {
    expect(unwrap({ data: [1], error: null }, "read it")).toEqual([1]);
    expect(() => unwrap({ data: null, error: { code: "42501", message: RAW_DB_MESSAGE } }, "read it")).toThrow(ToolError);
  });

  it("distinguishes rate limits, missing credit and generic failures", () => {
    const run = (res: { data: unknown; error: unknown }) => {
      try {
        unwrapFunction(res as { data: { error?: unknown } | null; error: unknown }, "do the thing");
        return "no error";
      } catch (e) {
        return (e as Error).message;
      }
    };
    expect(run({ data: null, error: { message: "429" } })).toMatch(/rate-limited/);
    expect(run({ data: null, error: { message: "402 Payment Required" } })).toMatch(/credit/);
    expect(run({ data: { error: "insufficient_credit" }, error: null })).toMatch(/credit/);
    expect(run({ data: null, error: { message: "internal stack trace" } })).toMatch(/briefly unavailable/);
    expect(run({ data: null, error: null })).toMatch(/empty response/);
    expect(run({ data: { ok: true }, error: null })).toBe("no error");
  });
});

describe("runForUser", () => {
  it("refuses unauthenticated calls without touching the database", async () => {
    vi.mocked(createClient).mockClear();
    const run = vi.fn();

    const result = await runForUser(ctxFor({ isAuthenticated: () => false }), "do the thing", run);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/not authenticated/i);
    expect(run).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("refuses a token without a user id", async () => {
    const result = await runForUser(ctxFor({ getUserId: () => undefined }), "do the thing", vi.fn());
    expect(result.isError).toBe(true);
  });

  it("runs as the user: forwards their token only to Supabase and returns text + structured content", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    vi.mocked(createClient).mockClear();
    const run = vi.fn(async (db: unknown, userId: string) => ({ ok: true, who: userId, client: (db as { tag: string }).tag }));

    const result = await runForUser(ctxFor(), "do the thing", run);

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      expect.objectContaining({ global: { headers: { Authorization: "Bearer secret-bearer-token" } } }),
    );
    expect(run).toHaveBeenCalledWith({ tag: "user-scoped-client" }, "user-1");
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toEqual({ ok: true, who: "user-1", client: "user-scoped-client" });
    expect(JSON.parse(result.content[0].text)).toEqual(result.structuredContent);
    expect(result.content[0].text).not.toContain("secret-bearer-token");
  });

  it("passes a ToolError message through and hides anything unexpected", async () => {
    const safe = await runForUser(ctxFor(), "do the thing", async () => {
      throw new ToolError("Workstream is full.");
    });
    expect(safe).toMatchObject({ isError: true, content: [{ type: "text", text: "Workstream is full." }] });

    vi.spyOn(console, "error").mockImplementation(() => {});
    const hidden = await runForUser(ctxFor(), "do the thing", async () => {
      throw new Error(`select * from secret_table failed with token secret-bearer-token`);
    });
    expect(hidden.isError).toBe(true);
    expect(hidden.content[0].text).toMatch(/could not do the thing/i);
    expect(hidden.content[0].text).not.toContain("secret_table");
    expect(hidden.content[0].text).not.toContain("secret-bearer-token");
  });
});

describe("tool registry", () => {
  const toolsDir = new URL("../tools/", import.meta.url);
  const index = readFileSync(new URL("../index.ts", import.meta.url), "utf8");
  const files = readdirSync(toolsDir).filter((f) => f.endsWith(".ts") && !f.startsWith("_") && f !== "ubb-shared.ts");
  const sources = Object.fromEntries(files.map((f) => [f, readFileSync(new URL(f, toolsDir), "utf8")]));
  const nameOf = (source: string) => /name:\s*"([a-z0-9_]+)"/.exec(source)?.[1];

  it("wires every tool file into index.ts", () => {
    expect(files.length).toBeGreaterThanOrEqual(19);
    for (const file of files) {
      expect(index, `${file} is not imported by index.ts`).toContain(`./tools/${file.replace(/\.ts$/, "")}"`);
    }
  });

  it("exposes the tools the owner asked for, with unique snake_case names", () => {
    const names = files.map((f) => nameOf(sources[f]));
    expect(names.every(Boolean)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
    for (const wanted of [
      "get_equilibrium_state",
      "get_game_profile",
      "run_top_talent",
      "get_top_talent",
      "save_mission",
      "get_mission",
      "add_assets",
      "list_assets",
      "submit_quality_of_life",
      "set_focus",
      "set_strategies",
      "set_workstreams",
      "set_tasks",
      "get_cycle",
      "ubb_generate_artifact",
      "ubb_improve_artifact",
      "ubb_lock_artifact",
      "ubb_list_artifacts",
      "redeem_activation_code",
    ]) {
      expect(names).toContain(wanted);
    }
  });

  it("gives every tool a zod input schema and annotations, read-only only for read tools", () => {
    for (const file of files) {
      const source = sources[file];
      const name = nameOf(source)!;
      expect(source, `${name} has no inputSchema`).toMatch(/inputSchema:/);
      const annotations = /annotations:\s*([^\n]+)/.exec(source)?.[1] ?? "";
      expect(annotations, `${name} has no annotations`).not.toBe("");
      const isRead = /^(get_|list_|ubb_list_)/.test(name);
      expect(annotations.includes("READ_ONLY"), `${name} read/write annotation`).toBe(isRead);
    }
  });

  it("never reaches for the service-role key: every tool runs under the user's token", () => {
    for (const [file, source] of Object.entries(sources)) {
      expect(source, file).not.toMatch(/SERVICE_ROLE/);
    }
    expect(readFileSync(new URL("../tools/_shared.ts", import.meta.url), "utf8")).not.toMatch(/SERVICE_ROLE/);
  });

  it("keeps the OAuth issuer fallback that the regression test relies on", () => {
    expect(index).toContain('import.meta.env.VITE_SUPABASE_PROJECT_ID || "jypjttotvastdhanwvrx"');
  });
});
