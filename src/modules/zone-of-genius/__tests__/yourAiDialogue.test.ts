import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
import { buildRawSignal, buildTurnPrompt, countAnswers, parseTurn, transcriptOf } from "../yourAiDialogue";

const msgs = [
  { role: "ai" as const, text: "When does time disappear?" },
  { role: "player" as const, text: "When I untangle a messy idea for a friend." },
];

describe("yourAiDialogue", () => {
  it("parses a JSON turn, fenced or with prose", () => {
    expect(parseTurn('{"reply":"Tell me more.","ready":false}')).toEqual({ reply: "Tell me more.", ready: false, buttons: [] });
    expect(parseTurn('```json\n{"text":"Enough.","ready":true}\n```')).toEqual({ reply: "Enough.", ready: true, buttons: [] });
    expect(parseTurn("Plain question?")).toEqual({ reply: "Plain question?", ready: false, buttons: [] });
  });

  it("keeps catalog buttons in order and drops unknown ids", () => {
    const turn = parseTurn(
      'Sure:\n{"text":"Ready.","ready":true,"buttons":["action:reveal","made:up",{"id":"route:mission"},"action:reveal","route:qol","route:assets"]}',
    );
    expect(turn.ready).toBe(true);
    expect(turn.buttons.map((b) => b.id)).toEqual(["action:reveal", "route:mission", "route:qol"]);
    expect(turn.buttons[0].label).toBe("Reveal my top talent");
  });

  it("falls back to plain text with no buttons when buttons or JSON are malformed", () => {
    expect(parseTurn('{"text":"Hi","buttons":"route:mission"}').buttons).toEqual([]);
    expect(parseTurn('{"text":"Hi","buttons":[42,null,{"nope":1}]}').buttons).toEqual([]);
    const broken = parseTurn('{"text":"Hi", "buttons": [');
    expect(broken.buttons).toEqual([]);
    expect(broken.reply).toContain("Hi");
  });

  it("puts the catalog and the player card into the turn prompt", () => {
    const p = buildTurnPrompt(msgs, "", "en", {
      card_version: "abc",
      top_talent: { archetype: "The Weaver", core_pattern: null, talents: [] },
      traces: [],
    });
    expect(p).toContain("route:mission");
    expect(p).toContain("PLAYER CARD (vabc");
    expect(p).toContain("The Weaver");
    expect(buildTurnPrompt(msgs, "", "en")).not.toContain("PLAYER CARD");
  });

  it("counts only player answers and keeps pasted notes in the transcript", () => {
    expect(countAnswers(msgs)).toBe(1);
    const tr = transcriptOf(msgs, "My AI says I teach.");
    expect(tr).toContain("ME: When I untangle");
    expect(tr).toContain("My AI says I teach.");
  });

  it("asks in the player's language and never names a model", () => {
    const p = buildTurnPrompt(msgs, "", "ru");
    expect(p).toContain("Russian");
    expect(p).toContain("ONE short");
  });

  it("fences the profile JSON so the deep profile can be extracted, then appends the conversation", () => {
    const sig = buildRawSignal('Here:\n{"archetype_title":"X","core_pattern":"Y"}', msgs, "");
    expect(sig.startsWith("```json\n{")).toBe(true);
    expect(sig).toContain("--- My conversation with my AI ---");
    expect(buildRawSignal("", msgs, "")).toContain("ME: When I untangle");
  });
});
