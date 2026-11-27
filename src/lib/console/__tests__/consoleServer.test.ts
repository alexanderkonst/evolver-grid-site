import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));

import { ITERATE_STRATEGY_CRUCIBLE_V2_PROMPT } from "@/prompts";
import { CONSOLE_PROMPTS as SRC_PROMPTS, GOAL_SYNTHESIS_PROMPT } from "@/prompts/user/consolePhoenixPrompts";
import { ANOTHER_ROUND_PROMPT, ROAST_THE_RESULT_PROMPT } from "@/prompts/user/roastPrompts";
import { AI_OS_PROMPT } from "@/modules/familiar/aiOsSource";
import { assemble, BUTTON_PROMPT_KEYS, localeLine } from "../../../../supabase/functions/your-ai-console/assemble";
import { DAILY_CAP, MAX_CONTEXT_CHARS, MODEL, handle, type Deps } from "../../../../supabase/functions/your-ai-console/handler";
import * as generated from "../../../../supabase/functions/your-ai-console/prompts";
import { CONSOLE_BUTTONS } from "../phoenixChain";

const root = join(__dirname, "../../../..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("your-ai-console · prompt assembly (server)", () => {
  const cards = [{ button: 1, lap: 1, card: { goal: "G", why: ["a", "b", "c"], notThis: "n" } }];

  it("DoD 2 · each button's prompt = AI OS v6.0 (system) + its prompt + profile + previous cards + locale line", () => {
    for (const b of CONSOLE_BUTTONS) {
      const { system, user } = assemble({ button: b.id, context: "PLAYER-CTX-LINE", previousCards: cards, locale: "en" });
      if (b.id === 1) {
        expect(system).toContain("Do not ask follow-up questions.");
      } else {
        expect(system).toBe(AI_OS_PROMPT);
      }
      expect(user.startsWith(SRC_PROMPTS[b.prompt])).toBe(true);
      expect(user).toContain("PLAYER-CTX-LINE");
      expect(user).toContain(JSON.stringify(cards, null, 2));
      expect(user.endsWith("Answer in English.")).toBe(true);
      // The order: prompt, then context, then cards, then the locale line.
      expect(user.indexOf(b.id === 1 ? "=== STATED GOAL ===" : "=== PLAYER CONTEXT ===")).toBe(SRC_PROMPTS[b.prompt].length + 2);
      expect(user.indexOf("=== PREVIOUS CARDS (JSON) ===")).toBeGreaterThan(user.indexOf("PLAYER-CTX-LINE"));
    }
  });

  it("DoD 2 · every prompt ends with «Answer in <player locale>» (en/es/ru)", () => {
    expect(localeLine("en")).toBe("Answer in English.");
    expect(localeLine("es")).toBe("Answer in Spanish.");
    expect(localeLine("ru")).toBe("Answer in Russian.");
    expect(assemble({ button: 3, context: "", previousCards: [], locale: "ru" }).user.endsWith("Answer in Russian.")).toBe(true);
  });

  it("an unknown button is refused", () => {
    expect(() => assemble({ button: 9, context: "", previousCards: [], locale: "en" })).toThrow();
  });

  it("the server's button→prompt map matches the client's button records", () => {
    for (const b of CONSOLE_BUTTONS) expect(BUTTON_PROMPT_KEYS[b.id]).toBe(b.prompt);
  });

  it("the server's copy of the prompt text is exactly the sources (run scripts/sync-console-prompts.mjs if this fails)", () => {
    expect(generated.AI_OS_PROMPT).toBe(AI_OS_PROMPT);
    expect(generated.AI_OS_VERSION).toBe("6.0");
    expect(generated.CONSOLE_PROMPTS).toEqual(SRC_PROMPTS);
    expect(AI_OS_PROMPT.length).toBeGreaterThan(10_000);
  });
});

describe("your-ai-console · prompts 4 and 5 are reused, not copied", () => {
  it("DoD 6 · button 4 = the /ai-os ROAST + ANOTHER ROUND text, button 5 = the crucible, byte for byte", () => {
    expect(SRC_PROMPTS.ROAST_AND_ANOTHER_ROUND.startsWith(`${ROAST_THE_RESULT_PROMPT}\n\n---\n\n${ANOTHER_ROUND_PROMPT}`)).toBe(true);
    expect(SRC_PROMPTS.CRUCIBLE_POST_MORTEM.startsWith(ITERATE_STRATEGY_CRUCIBLE_V2_PROMPT)).toBe(true);
  });

  it("DoD 6 · /ai-os imports the moved roast prompts and no longer holds their text; the Console file holds neither", () => {
    const page = read("src/modules/ai-os/AiOsPage.tsx");
    expect(page).toContain('from "@/prompts/user/roastPrompts"');
    expect(page).toContain("content: ROAST_THE_RESULT_PROMPT");
    expect(page).toContain("content: ANOTHER_ROUND_PROMPT");
    expect(page).not.toContain("HOLONIC ROAST PROCEDURE");
    expect(page).not.toContain("THE RECURSIVE BIRTH — Perspectives 14–25:\n\nThe 13th — the Logos — is itself a holon. It has an interior and an exterior. The moment it exists, it can be seen. This second roast");
    const mine = read("src/prompts/user/consolePhoenixPrompts.ts");
    expect(mine).not.toContain("HOLONIC ROAST PROCEDURE");
    expect(mine).not.toContain("Strategy Iteration Button");
    expect(mine).toContain('from "./roastPrompts"');
    expect(mine).toContain('from "./iterateStrategyCruciblePrompt"');
  });

  it("the three new prompts ask for the card keys the parser reads", () => {
    expect(GOAL_SYNTHESIS_PROMPT).toContain('"needsGoal": true');
    for (const key of ["goal", "why", "notThis"]) expect(SRC_PROMPTS.GOAL_SYNTHESIS).toContain(`"${key}"`);
    for (const key of ["case", "risks", "mistakes", "sign"]) expect(SRC_PROMPTS.CASE_AND_RISKS).toContain(`"${key}"`);
    for (const key of ["goalV2", "moves", "whatChanged"]) expect(SRC_PROMPTS.NEXT_VERSION).toContain(`"${key}"`);
    for (const key of ["weak", "fixes", "thirteenth"]) expect(SRC_PROMPTS.ROAST_AND_ANOTHER_ROUND).toContain(`"${key}"`);
    for (const key of ["survived", "burned", "nextMove"]) expect(SRC_PROMPTS.CRUCIBLE_POST_MORTEM).toContain(`"${key}"`);
  });
});

describe("your-ai-console · the handler (signed-in only, capped, bounded)", () => {
  const deps = (over: Partial<Deps> = {}): Deps & { complete: ReturnType<typeof vi.fn>; takeTurn: ReturnType<typeof vi.fn>; getUserId: ReturnType<typeof vi.fn> } =>
    ({
      corsHeaders: { "Access-Control-Allow-Origin": "*" },
      getUserId: vi.fn().mockResolvedValue("user-1"),
      takeTurn: vi.fn().mockResolvedValue(1),
      complete: vi.fn().mockResolvedValue({ status: 200, text: " the answer " }),
      ...over,
    }) as never;
  const post = (body: unknown, headers: Record<string, string> = { Authorization: "Bearer t" }) =>
    new Request("https://x.test/your-ai-console", { method: "POST", headers, body: JSON.stringify(body) });
  const good = { button: 2, context: "ctx", previousCards: [], locale: "es" };

  it("the model is the cheapest gateway model and the cap is the mini-training-chat pool", () => {
    expect(MODEL).toBe("google/gemini-3.1-flash-lite");
    expect(DAILY_CAP).toBe(20);
    expect(read("supabase/functions/mini-training-chat/index.ts")).toContain("const DAILY_CAP = 20;");
    expect(read("supabase/functions/your-ai-console/index.ts")).toContain('rpc("your_ai_take_turn"');
  });

  it("a good request returns the model text with AI OS as the system message", async () => {
    const d = deps();
    const res = await handle(post(good), d);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ text: "the answer", turns_used: 1, cap: 20 });
    const [system, user] = d.complete.mock.calls[0];
    expect(system).toBe(AI_OS_PROMPT);
    expect(user.endsWith("Answer in Spanish.")).toBe(true);
    expect(d.takeTurn).toHaveBeenCalledWith("user-1", 20);
  });

  it("DoD 10 · no Authorization header: 401 and the model is never called", async () => {
    const d = deps();
    const res = await handle(post(good, {}), d);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "sign_in_required" });
    expect(d.complete).not.toHaveBeenCalled();
    expect(d.takeTurn).not.toHaveBeenCalled();
  });

  it("DoD 10 · a bearer token with no user (a guest's anon key): 401, no model call, no turn taken", async () => {
    const d = deps({ getUserId: vi.fn().mockResolvedValue(null) });
    const res = await handle(post(good), d);
    expect(res.status).toBe(401);
    expect(d.complete).not.toHaveBeenCalled();
    expect(d.takeTurn).not.toHaveBeenCalled();
  });

  it("DoD 10 · the daily cap answers 429 daily_cap_reached and the model is not called", async () => {
    const d = deps({ takeTurn: vi.fn().mockResolvedValue(-1) });
    const res = await handle(post(good), d);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "daily_cap_reached", cap: 20 });
    expect(d.complete).not.toHaveBeenCalled();
  });

  it("refuses a bad body before spending a turn: button range, context size, previous-cards size", async () => {
    for (const bad of [
      { ...good, button: 0 },
      { ...good, button: 6 },
      { ...good, button: "1" },
      { ...good, context: "x".repeat(MAX_CONTEXT_CHARS + 1) },
      { ...good, context: 5 },
      { ...good, previousCards: "no" },
      { ...good, previousCards: new Array(7).fill({}) },
      { ...good, previousCards: [{ big: "x".repeat(25_000) }] },
    ]) {
      const d = deps();
      const res = await handle(post(bad), d);
      expect(res.status).toBe(400);
      expect(d.takeTurn).not.toHaveBeenCalled();
      expect(d.complete).not.toHaveBeenCalled();
    }
    const d = deps();
    expect((await handle(new Request("https://x.test", { method: "POST", headers: { Authorization: "Bearer t" }, body: "not json" }), d)).status).toBe(400);
  });

  it("unknown locale falls back to English; gateway errors map to calm codes", async () => {
    const d = deps();
    await handle(post({ ...good, locale: "fr" }), d);
    expect(d.complete.mock.calls[0][1].endsWith("Answer in English.")).toBe(true);
    expect((await handle(post(good), deps({ complete: vi.fn().mockResolvedValue({ status: 429, text: "" }) }))).status).toBe(429);
    expect((await handle(post(good), deps({ complete: vi.fn().mockResolvedValue({ status: 402, text: "" }) }))).status).toBe(402);
    expect((await handle(post(good), deps({ complete: vi.fn().mockResolvedValue({ status: 500, text: "" }) }))).status).toBe(500);
    expect((await handle(post(good), deps({ complete: vi.fn().mockResolvedValue({ status: 200, text: "  " }) }))).status).toBe(500);
  });

  it("answers CORS preflight and rejects other methods", async () => {
    const d = deps();
    expect((await handle(new Request("https://x.test", { method: "OPTIONS" }), d)).status).toBe(200);
    expect((await handle(new Request("https://x.test", { method: "GET" }), d)).status).toBe(405);
  });
});
