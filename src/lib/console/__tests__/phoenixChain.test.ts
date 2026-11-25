import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));

import {
  CONSOLE_BUTTONS,
  MAX_FULL_LAPS,
  buttonOf,
  clearAfter,
  emptyChain,
  isUnlocked,
  parseCardOutput,
  readChain,
  requestFor,
  setCard,
  startNextLap,
  survivorOf,
  writeChain,
  type ButtonId,
} from "../phoenixChain";
import { CARDS, chainWith, output, rec } from "./fixtures";

const en = JSON.parse(readFileSync(join(__dirname, "../../../locales/en/common.json"), "utf8")).yourAiConsole;

describe("Console v1 · the five buttons", () => {
  it("DoD 1 · labels are exactly the spec's, in en/es/ru", () => {
    expect(CONSOLE_BUTTONS.map((b) => b.label.en)).toEqual([
      "Your goal, clear and grounded",
      "The case for your goal, with its risks",
      "Your goal, version 2",
      "What is weak in your goal, and how to fix it",
      "What remains after the Phoenix burns",
    ]);
    expect(CONSOLE_BUTTONS.map((b) => b.label.ru)).toEqual([
      "Твоя цель, ясная и обоснованная",
      "Кейс за твою цель и её риски",
      "Твоя цель, версия 2",
      "Что слабо в твоей цели и как это исправить",
      "Что остаётся после сгорания Феникса",
    ]);
    for (const b of CONSOLE_BUTTONS) expect(b.label.es.trim().length).toBeGreaterThan(5);
    expect(new Set(CONSOLE_BUTTONS.map((b) => b.label.es)).size).toBe(5);
  });

  it("button record: id, label, result, prompt, card, tier, author, standard (app-store ready)", () => {
    for (const b of CONSOLE_BUTTONS) {
      expect(Object.keys(b).sort()).toEqual(["author", "card", "id", "label", "prompt", "result", "standard", "tier"]);
      expect(b.tier).toBe("free");
      expect(b.author).toBe("evolver");
      expect(b.standard).toBe("v0");
    }
  });
});

describe("Console v1 · order", () => {
  it("DoD 4 · button N is locked until card N-1 exists", () => {
    const none = emptyChain();
    expect([1, 2, 3, 4, 5].map((n) => isUnlocked(none, n as ButtonId))).toEqual([true, false, false, false, false]);
    expect([1, 2, 3, 4, 5].map((n) => isUnlocked(chainWith(1), n as ButtonId))).toEqual([true, true, false, false, false]);
    expect([1, 2, 3, 4, 5].map((n) => isUnlocked(chainWith(1, 2, 3, 4), n as ButtonId))).toEqual([true, true, true, true, true]);
  });

  it("DoD 4 · every locked button has its «Opens when… Inside…» line in en/es/ru", () => {
    for (const lang of ["en", "es", "ru"]) {
      const j = JSON.parse(readFileSync(join(__dirname, `../../../locales/${lang}/common.json`), "utf8")).yourAiConsole;
      for (const n of ["2", "3", "4", "5"]) expect(j.locked[n].length).toBeGreaterThan(20);
    }
    expect(en.locked["2"]).toBe("Opens when you have your goal. Inside: the case for it, with its risks.");
    for (const n of ["2", "3", "4", "5"]) expect(en.locked[n]).toMatch(/^Opens when .+ Inside: /);
  });

  it("re-running N clears the cards after N, and keeps N and before", () => {
    const c = clearAfter(chainWith(1, 2, 3, 4, 5), 2);
    expect(Object.keys(c.cards).sort()).toEqual(["1", "2"]);
    expect(Object.keys(clearAfter(chainWith(1, 2, 3), 1).cards)).toEqual(["1"]);
  });
});

describe("Console v1 · laps", () => {
  it("DoD 5 · button 5 → button 1 starts lap 2 with the survivor as input", () => {
    const done = chainWith(1, 2, 3, 4, 5);
    const next = startNextLap(done);
    expect(next.lap).toBe(2);
    expect(next.cards).toEqual({});
    expect(survivorOf(next)).toEqual({ lap: 1, card: CARDS[5] });
    const req = requestFor(next, 1, "ctx", "en");
    expect(req.button).toBe(1);
    expect(req.previousCards).toEqual([{ button: 5, lap: 1, card: CARDS[5] }]);
  });

  it("starting a lap without card 5 changes nothing", () => {
    const c = chainWith(1, 2, 3, 4);
    expect(startNextLap(c)).toBe(c);
  });

  it("keeps the last 3 laps in full; older laps fold into one line each", () => {
    let c = emptyChain();
    for (let i = 0; i < 5; i++) {
      for (const id of [1, 2, 3, 4, 5] as ButtonId[]) c = setCard(c, id, rec(id));
      c = startNextLap(c);
    }
    expect(c.lap).toBe(6);
    expect(c.laps.map((l) => l.lap)).toEqual([3, 4, 5]);
    expect(c.laps.length).toBe(MAX_FULL_LAPS);
    expect(c.folded).toHaveLength(2);
    for (const line of c.folded) {
      expect(line).not.toContain("\n");
      expect(line.length).toBeLessThanOrEqual(280);
    }
    expect(c.folded[0]).toMatch(/^Lap 1/);
    // Button 1 on lap 6 sees the folded lines and only the last lap's survivor.
    const req = requestFor(c, 1, "ctx", "en");
    expect(req.context).toContain("EARLIER LAPS");
    expect(req.previousCards).toHaveLength(1);
  });

  it("each button reads the cards the spec says", () => {
    const c = chainWith(1, 2, 3, 4);
    const from = (n: ButtonId) => requestFor(c, n, "", "en").previousCards.map((p) => p.button);
    expect([1, 2, 3, 4, 5].map((n) => from(n as ButtonId))).toEqual([[], [1], [1, 2], [3], [3, 4]]);
  });
});

describe("Console v1 · parsing", () => {
  it("DoD 3 · output is parsed to each card's shape, and the full text is kept apart from the JSON", () => {
    for (const id of [1, 2, 3, 4, 5] as ButtonId[]) {
      const p = parseCardOutput(id, output(CARDS[id], "My full reasoning."));
      expect(p.ok).toBe(true);
      if (p.ok && p.kind === "card") {
        expect(p.data).toEqual(CARDS[id]);
        expect(p.full).toBe("My full reasoning.");
      }
    }
  });

  it("DoD 3 · malformed output is not ok (the UI shows one retry line, never the raw text)", () => {
    expect(parseCardOutput(1, "just prose, no card").ok).toBe(false);
    expect(parseCardOutput(1, "```json\n{not json}\n```").ok).toBe(false);
    expect(parseCardOutput(1, output({ goal: "x", why: ["a", "b"], notThis: "y" })).ok).toBe(false); // 2 reasons, spec says 3
    expect(parseCardOutput(2, output({ ...(CARDS[2] as object), mistakes: [{ mistake: "a" }, {}, {}] })).ok).toBe(false);
    expect(parseCardOutput(3, output(CARDS[1])).ok).toBe(false); // card of another button
    expect(parseCardOutput(5, output([1, 2])).ok).toBe(false);
  });

  it("accepts a trailing JSON object without a fence", () => {
    const p = parseCardOutput(3, `Some words.\n${JSON.stringify(CARDS[3])}`);
    expect(p.ok && p.kind === "card" && p.full).toBe("Some words.");
  });

  it("button 1 may answer needsGoal instead of inventing one", () => {
    expect(parseCardOutput(1, output({ needsGoal: true }, "I see no goal yet."))).toEqual({ ok: true, kind: "needsGoal", full: "I see no goal yet." });
    expect(parseCardOutput(2, output({ needsGoal: true })).ok).toBe(false);
  });
});

describe("Console v1 · chain state storage", () => {
  const store = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
  };

  it("round-trips per player and never mixes two players", () => {
    const s = store();
    writeChain("a", chainWith(1, 2), s);
    expect(Object.keys(readChain("a", s).cards)).toEqual(["1", "2"]);
    expect(Object.keys(readChain("b", s).cards)).toEqual([]);
    expect(readChain(null, s).lap).toBe(1);
  });

  it("corrupted or foreign data reads as a fresh chain", () => {
    const s = store();
    s.setItem("fytt:console-phoenix-chain:v1:a", "{broken");
    expect(readChain("a", s).lap).toBe(1);
    s.setItem("fytt:console-phoenix-chain:v1:a", JSON.stringify({ lap: "x" }));
    expect(readChain("a", s).lap).toBe(1);
    s.setItem("fytt:console-phoenix-chain:v1:a", JSON.stringify({ lap: 2, cards: { 1: { data: { nope: 1 }, full: "" } }, laps: [], folded: [] }));
    expect(readChain("a", s).cards[1]).toBeUndefined();
    expect(readChain("a", null).lap).toBe(1);
  });

  it("buttonOf gives the record by id", () => {
    expect(buttonOf(4).prompt).toBe("ROAST_AND_ANOTHER_ROUND");
    expect(buttonOf(5).prompt).toBe("CRUCIBLE_POST_MORTEM");
  });
});
