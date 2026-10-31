import { describe, expect, it } from "vitest";
import { MAX_CARD_TRACES, buildPlayerCard, cardToPrompt, readTraces, writeTrace } from "../yourAiCard";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

describe("yourAiCard", () => {
  it("writes a trace per tap and reads it back, scoped by owner", () => {
    const s = memoryStorage();
    writeTrace({ kind: "route", payload_id: "route:mission", outcome: "tapped", at: "2026-10-31T10:00:00.000Z" }, "u1", s);
    writeTrace({ kind: "action", payload_id: "action:reveal", outcome: "tapped" }, "u1", s);
    writeTrace({ kind: "route", payload_id: "route:qol", outcome: "tapped" }, null, s);
    const u1 = readTraces("u1", s);
    expect(u1.map((t) => t.payload_id)).toEqual(["route:mission", "action:reveal"]);
    expect(readTraces(null, s).map((t) => t.payload_id)).toEqual(["route:qol"]);
    expect(readTraces("u2", s)).toEqual([]);
  });

  it("survives corrupted storage and missing storage", () => {
    const s = memoryStorage();
    s.setItem("fytt:your-ai-traces:v1:guest", "{not json");
    expect(readTraces(null, s)).toEqual([]);
    expect(readTraces(null, null)).toEqual([]);
    expect(() => writeTrace({ kind: "route", payload_id: "x", outcome: "tapped" }, null, null)).not.toThrow();
  });

  it("builds a compact card from a snapshot and the last traces; any change is a new version", () => {
    const traces = Array.from({ length: 10 }, (_, i) => ({
      at: `2026-10-${String(10 + i).padStart(2, "0")}T00:00:00.000Z`,
      kind: "route" as const,
      payload_id: `route:${i}`,
      outcome: "tapped",
    }));
    const card = buildPlayerCard({ archetypeTitle: "The Weaver", corePattern: "Joins what was apart", topThreeTalentsLong: ["a", "b", "c", "d"] }, traces);
    expect(card.traces).toHaveLength(MAX_CARD_TRACES);
    expect(card.traces[MAX_CARD_TRACES - 1].payload_id).toBe("route:9");
    expect(card.top_talent?.talents).toHaveLength(3);
    const again = buildPlayerCard({ archetypeTitle: "The Weaver", corePattern: "Joins what was apart", topThreeTalentsLong: ["a", "b", "c", "d"] }, traces);
    expect(again.card_version).toBe(card.card_version);
    expect(buildPlayerCard(null, traces.slice(0, 2)).card_version).not.toBe(card.card_version);
  });

  it("renders nothing for an empty card and a readable block otherwise", () => {
    expect(cardToPrompt(buildPlayerCard(null, []))).toBe("");
    const text = cardToPrompt(buildPlayerCard({ archetypeTitle: "The Weaver", corePattern: null, topThreeTalentsLong: null }, []));
    expect(text).toContain("Archetype: The Weaver");
    expect(text).toContain("Has a saved top talent result");
  });
});
