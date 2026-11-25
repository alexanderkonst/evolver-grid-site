import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) } } }));

import type { PlayerCard } from "@/modules/zone-of-genius/yourAiCard";
import type { DialogueMessage } from "@/modules/zone-of-genius/yourAiTurn";
import { ConsoleError, runConsoleButton } from "../consoleClient";
import { GOAL_QUESTION, emptyChain, startNextLap } from "../phoenixChain";
import { runStep } from "../runStep";
import { CARDS, chainWith, output } from "./fixtures";

const card: PlayerCard = { card_version: "x", top_talent: { archetype: "Weaver", core_pattern: "Connects", talents: ["a"] }, traces: [] };
const said: DialogueMessage[] = [{ role: "player", text: "I want to teach a cohort." }];
const base = { ownerId: "u1", playerCard: card, messages: said, locale: "en" as const };

beforeEach(() => invoke.mockReset());

describe("Console v1 · empty profile", () => {
  it("DoD 9 · empty profile: button 1 asks the one question and invents nothing (no model call)", async () => {
    const call = vi.fn();
    const out = await runStep({ ...base, playerCard: null, messages: [], chain: emptyChain(), id: 1, call });
    expect(out.kind).toBe("ask-goal");
    expect(out.chain.cards[1]).toBeUndefined();
    expect(call).not.toHaveBeenCalled();
    expect(GOAL_QUESTION.en).toBe("What do you want to make real in the next 90 days?");
  });

  it("DoD 9 · the card with no top talent and only an AI line in the conversation still counts as empty", async () => {
    const call = vi.fn();
    const out = await runStep({ ...base, playerCard: { card_version: "x", top_talent: null, traces: [] }, messages: [{ role: "ai", text: "Hello" }], chain: emptyChain(), id: 1, call });
    expect(out.kind).toBe("ask-goal");
    expect(call).not.toHaveBeenCalled();
  });

  it("DoD 9 · when the model itself says needsGoal, no card is made up", async () => {
    const call = vi.fn().mockResolvedValue(output({ needsGoal: true }));
    const out = await runStep({ ...base, chain: emptyChain(), id: 1, call });
    expect(out.kind).toBe("ask-goal");
    expect(out.chain.cards[1]).toBeUndefined();
  });

  it("with material (a top talent, or something the player said) button 1 runs", async () => {
    const call = vi.fn().mockResolvedValue(output(CARDS[1], "Full."));
    const out = await runStep({ ...base, chain: emptyChain(), id: 1, call });
    expect(out.kind).toBe("card");
    expect(out.chain.cards[1]?.full).toBe("Full.");
    expect(call.mock.calls[0][0].context).toContain("I want to teach a cohort.");
  });
});

describe("Console v1 · the loop", () => {
  it("DoD 5 · button 5 → button 1: lap 2 runs with the survivor as input", async () => {
    const call = vi.fn().mockResolvedValue(output(CARDS[1]));
    const lap2 = startNextLap(chainWith(1, 2, 3, 4, 5));
    const out = await runStep({ ...base, playerCard: null, messages: [], chain: lap2, id: 1, call });
    // No profile and no conversation, yet the survivor is material: the model is called, not the question.
    expect(out.kind).toBe("card");
    const req = call.mock.calls[0][0];
    expect(req.button).toBe(1);
    expect(req.previousCards).toEqual([{ button: 5, lap: 1, card: CARDS[5] }]);
    expect(out.chain.lap).toBe(2);
  });

  it("re-running a button clears the cards after it", async () => {
    const call = vi.fn().mockResolvedValue(output(CARDS[2]));
    const out = await runStep({ ...base, chain: chainWith(1, 2, 3, 4), id: 2, call });
    expect(Object.keys(out.chain.cards).sort()).toEqual(["1", "2"]);
    expect(call.mock.calls[0][0].previousCards.map((p: { button: number }) => p.button)).toEqual([1]);
  });
});

describe("Console v1 · malformed output and errors", () => {
  it("DoD 3 · malformed output gives the retry problem and no card, never raw text", async () => {
    const call = vi.fn().mockResolvedValue('{"goal": "half a card"');
    const out = await runStep({ ...base, chain: emptyChain(), id: 1, call });
    expect(out).toMatchObject({ kind: "problem", problem: "malformed" });
    expect(out.chain.cards[1]).toBeUndefined();
    expect(JSON.stringify(out)).not.toContain("half a card");
  });

  it("a failed call is a calm «failed» problem", async () => {
    const call = vi.fn().mockRejectedValue(new Error("boom"));
    expect(await runStep({ ...base, chain: emptyChain(), id: 1, call })).toMatchObject({ kind: "problem", problem: "failed" });
  });
});

describe("Console v1 · signed out and the daily cap", () => {
  it("DoD 10 · a signed-out player cannot call the model", async () => {
    const call = vi.fn();
    const out = await runStep({ ...base, ownerId: null, chain: emptyChain(), id: 1, call });
    expect(out).toMatchObject({ kind: "problem", problem: "signin" });
    expect(call).not.toHaveBeenCalled();
    await expect(runConsoleButton({ button: 1, context: "", previousCards: [], locale: "en" }, false)).rejects.toMatchObject({ code: "sign_in_required" });
    expect(invoke).not.toHaveBeenCalled();
  });

  it("DoD 10 · the daily cap (429 from the function) returns a calm «cap» problem", async () => {
    const response = new Response(JSON.stringify({ error: "daily_cap_reached", cap: 20 }), { status: 429 });
    invoke.mockResolvedValue({ data: null, error: Object.assign(new Error("Edge Function returned a non-2xx status code"), { context: response }) });
    const out = await runStep({
      ...base,
      chain: emptyChain(),
      id: 1,
      call: (r) => runConsoleButton(r, true),
    });
    expect(out).toMatchObject({ kind: "problem", problem: "cap" });
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke.mock.calls[0][0]).toBe("your-ai-console");
    expect(Object.keys(invoke.mock.calls[0][1].body).sort()).toEqual(["button", "context", "locale", "previousCards"]);
  });

  it("returns the model text from the function", async () => {
    invoke.mockResolvedValue({ data: { text: "hello", turns_used: 1, cap: 20 }, error: null });
    await expect(runConsoleButton({ button: 1, context: "", previousCards: [], locale: "ru" }, true)).resolves.toBe("hello");
  });

  it("an empty reply is a failure, not a card", async () => {
    invoke.mockResolvedValue({ data: { text: "  " }, error: null });
    await expect(runConsoleButton({ button: 1, context: "", previousCards: [], locale: "en" }, true)).rejects.toBeInstanceOf(ConsoleError);
  });
});
