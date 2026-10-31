import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
import { AI_OS_PROMPT, AI_OS_VERSION } from "@/modules/familiar/aiOsSource";
import { buildFamiliarPrompt } from "@/modules/familiar/buildFamiliarPrompt";
import { buildTurnPrompt, MAX_NOTES_CHARS, MAX_REQUEST_CHARS, trimOldestToFit, type DialogueMessage } from "../yourAiTurn";

const msgs: DialogueMessage[] = [
  { role: "ai", text: "When does time disappear for you?" },
  { role: "player", text: "When I untangle a messy idea for a friend." },
];

const long = (n: number, tag: string): DialogueMessage[] =>
  Array.from({ length: n }, (_, i) => ({ role: i % 2 ? ("ai" as const) : ("player" as const), text: `${tag}${i} ${"x".repeat(2000)}` }));

describe("Your AI turn prompt with the AI OS (issue #275)", () => {
  it("a guest gets the AI OS alone, first, then the ZoG job on top, then the conversation", () => {
    const os = { prompt: buildFamiliarPrompt({ aiOs: AI_OS_PROMPT }) };
    const p = buildTurnPrompt(msgs, "", "en", null, os);
    expect(AI_OS_VERSION).toBe("5.2");
    expect(p.startsWith(AI_OS_PROMPT.trim())).toBe(true);
    const job = p.indexOf("=== CURRENT JOB");
    expect(job).toBeGreaterThan(AI_OS_PROMPT.trim().length - 1);
    expect(p.indexOf("TOP TALENT", job)).toBeGreaterThan(job);
    expect(p.indexOf("CONVERSATION SO FAR:")).toBeGreaterThan(job);
    expect(p).toContain("ME: When I untangle a messy idea");
    // Layered, not replaced: the job no longer discards the OS role.
    expect(p).not.toContain("Ignore any earlier role");
    expect(p).toContain("who you are, how you think");
  });

  it("a known player's talent, mission and work ride inside the OS block", () => {
    const os = {
      prompt: buildFamiliarPrompt({
        aiOs: AI_OS_PROMPT,
        talent: { archetypeTitle: "The Weaver", corePattern: "Connects what others keep apart" },
        mission: "Make founders legible to each other",
        artifacts: [{ key: "uniqueness", label: "Uniqueness", text: "I translate between worlds." }],
      }),
    };
    const p = buildTurnPrompt(msgs, "", "ru", null, os);
    expect(p).toContain("My top talent: The Weaver");
    expect(p).toContain("My mission: Make founders legible to each other");
    expect(p).toContain("I translate between worlds.");
    expect(p.indexOf("My top talent")).toBeLessThan(p.indexOf("=== CURRENT JOB"));
    expect(p).toContain("Russian");
  });

  it("keeps the buttons-first contract: catalog, 1 primary + at most 2 alternatives, JSON output", () => {
    const p = buildTurnPrompt(msgs, "", "en", null, { prompt: AI_OS_PROMPT });
    expect(p).toContain("route:mission");
    expect(p).toContain("up to 3 buttons");
    expect(p).toContain("(at most two)");
    expect(p).toContain("Output ONLY valid JSON");
    expect(p).toContain("Never offer action:reveal unless");
  });

  it("without an OS the prompt is the unchanged plain ZoG gathering prompt", () => {
    const plain = buildTurnPrompt(msgs, "", "en");
    expect(plain).toContain("Ignore any earlier role you were given.");
    expect(plain).not.toContain("=== CURRENT JOB");
    expect(buildTurnPrompt(msgs, "", "en", null, { prompt: "  " })).toBe(plain);
    expect(buildTurnPrompt(msgs, "", "en", null, null)).toBe(plain);
  });

  it("over budget: oldest turns go first, the OS and the newest turn stay whole", () => {
    const history = long(80, "T");
    const p = buildTurnPrompt(history, "", "en", null, { prompt: AI_OS_PROMPT, maxChars: 60_000 });
    expect(p).toContain(AI_OS_PROMPT.trim());
    expect(p.length).toBeLessThanOrEqual(60_000);
    expect(p).toContain("T79 ");
    expect(p).not.toContain("T0 ");
    const kept = history.filter((m) => p.includes(m.text));
    // what survives is a contiguous newest block
    expect(kept[kept.length - 1]).toBe(history[79]);
  });

  it("default budget leaves the full OS plus a rich about-me untouched", () => {
    const artifacts = Array.from({ length: 19 }, (_, i) => ({ key: `k${i}`, label: `Piece ${i}`, text: "y".repeat(5000) }));
    const prompt = buildFamiliarPrompt({ aiOs: AI_OS_PROMPT, talent: { archetypeTitle: "A" }, artifacts });
    const p = buildTurnPrompt(long(10, "H"), "", "en", null, { prompt });
    expect(p).toContain(AI_OS_PROMPT.trim());
    expect(p.length).toBeLessThan(MAX_REQUEST_CHARS);
    expect(p).toContain("H0 ");
  });

  it("when the OS alone fills the budget, the newest message still goes through", () => {
    const p = buildTurnPrompt(msgs, "", "en", null, { prompt: AI_OS_PROMPT, maxChars: 100 });
    expect(p).toContain(AI_OS_PROMPT.trim());
    expect(p).toContain("ME: When I untangle");
  });

  it("caps pasted notes in OS mode", () => {
    const p = buildTurnPrompt(msgs, "n".repeat(MAX_NOTES_CHARS + 5000), "en", null, { prompt: "OS" });
    expect(p.match(/n{100}/g)?.join("").length).toBeLessThanOrEqual(MAX_NOTES_CHARS);
  });

  it("trimOldestToFit keeps order and never returns an empty list for a non-empty history", () => {
    const m = long(5, "Q");
    expect(trimOldestToFit(m, 1_000_000)).toEqual(m);
    expect(trimOldestToFit(m, 0)).toEqual([m[4]]);
    expect(trimOldestToFit([], 10)).toEqual([]);
  });
});
