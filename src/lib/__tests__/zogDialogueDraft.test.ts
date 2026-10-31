// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  DIALOGUE_DRAFT_KEY,
  DIALOGUE_DRAFT_MAX_AGE_MS,
  clearDialogueDraft,
  hasPlayerAnswer,
  hasUnfinishedDialogue,
  readDialogueDraft,
  writeDialogueDraft,
  type DraftMessage,
} from "@/lib/zogDialogueDraft";

const opening: DraftMessage = { role: "ai", text: "What do you lose track of time doing?" };
const answer: DraftMessage = { role: "player", text: "Untangling messy systems." };
const followUp: DraftMessage = { role: "ai", text: "What draws you to that?" };

describe("zogDialogueDraft: the unfinished Your AI dialogue (issue #281)", () => {
  beforeEach(() => window.localStorage.clear());

  it("has nothing before the first answer, and writes nothing for the opening alone", () => {
    expect(readDialogueDraft()).toBeNull();
    writeDialogueDraft([opening], "", false);
    expect(window.localStorage.getItem(DIALOGUE_DRAFT_KEY)).toBeNull();
    expect(hasUnfinishedDialogue()).toBe(false);
  });

  it("keeps the dialogue after an answer, and restores messages, notes and ready as they were", () => {
    writeDialogueDraft([opening, answer, followUp], "notes from my own AI", true);
    expect(hasUnfinishedDialogue()).toBe(true);
    const draft = readDialogueDraft();
    expect(draft?.messages).toEqual([opening, answer, followUp]);
    expect(draft?.ownAiNotes).toBe("notes from my own AI");
    expect(draft?.ready).toBe(true);
  });

  it("an opening-only write never overwrites a real draft (a reload before the first answer is safe)", () => {
    writeDialogueDraft([opening, answer], "", false);
    writeDialogueDraft([opening], "", false);
    expect(readDialogueDraft()?.messages).toEqual([opening, answer]);
  });

  it("clears once the reveal is made, or on Start over", () => {
    writeDialogueDraft([opening, answer], "", false);
    clearDialogueDraft();
    expect(readDialogueDraft()).toBeNull();
    expect(hasUnfinishedDialogue()).toBe(false);
  });

  it("drops a draft that has gone stale", () => {
    writeDialogueDraft([opening, answer], "", false);
    const savedAt = readDialogueDraft()?.savedAt ?? 0;
    expect(readDialogueDraft(savedAt + DIALOGUE_DRAFT_MAX_AGE_MS - 1)).not.toBeNull();
    expect(readDialogueDraft(savedAt + DIALOGUE_DRAFT_MAX_AGE_MS + 1)).toBeNull();
  });

  it("treats broken data as no draft", () => {
    window.localStorage.setItem(DIALOGUE_DRAFT_KEY, "{not json");
    expect(readDialogueDraft()).toBeNull();
    window.localStorage.setItem(DIALOGUE_DRAFT_KEY, JSON.stringify({ messages: "nope" }));
    expect(readDialogueDraft()).toBeNull();
    window.localStorage.setItem(
      DIALOGUE_DRAFT_KEY,
      JSON.stringify({ messages: [{ role: "robot", text: "x" }], savedAt: Date.now() }),
    );
    expect(readDialogueDraft()).toBeNull();
    // Messages without a player answer are not worth resuming.
    window.localStorage.setItem(
      DIALOGUE_DRAFT_KEY,
      JSON.stringify({ messages: [opening], ownAiNotes: "", ready: false, savedAt: Date.now() }),
    );
    expect(readDialogueDraft()).toBeNull();
  });

  it("counts a player answer only when it has text", () => {
    expect(hasPlayerAnswer([opening])).toBe(false);
    expect(hasPlayerAnswer([opening, { role: "player", text: "   " }])).toBe(false);
    expect(hasPlayerAnswer([opening, answer])).toBe(true);
  });
});
