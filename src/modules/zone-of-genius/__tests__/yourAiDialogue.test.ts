import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
import { buildRawSignal, buildTurnPrompt, countAnswers, parseTurn, transcriptOf } from "../yourAiDialogue";

const msgs = [
  { role: "ai" as const, text: "When does time disappear?" },
  { role: "player" as const, text: "When I untangle a messy idea for a friend." },
];

describe("yourAiDialogue", () => {
  it("parses a JSON turn, fenced or with prose", () => {
    expect(parseTurn('{"reply":"Tell me more.","ready":false}')).toEqual({ reply: "Tell me more.", ready: false });
    expect(parseTurn('```json\n{"reply":"Enough.","ready":true}\n```')).toEqual({ reply: "Enough.", ready: true });
    expect(parseTurn("Plain question?")).toEqual({ reply: "Plain question?", ready: false });
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
