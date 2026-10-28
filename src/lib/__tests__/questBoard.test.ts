import { describe, expect, it } from "vitest";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { QUEST_STEP_IDS } from "@/data/journeyModules";
import { emptyPlaceSave, placeSaveFromSheet } from "../placeState";
import { journeyRows, nextQuest, questRoute, questRows } from "../questBoard";

const saveWith = (done: JourneyItemId[], opts: { offerSaved?: boolean; victories?: string[] } = {}) =>
  placeSaveFromSheet({
    chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })),
    offerSaved: opts.offerSaved,
    victories: opts.victories,
  });

describe("Quest Board rows (WP-11)", () => {
  it("lists the Journey in JOURNEY_MAIN order, numbered from 1", () => {
    const rows = journeyRows(emptyPlaceSave());
    expect(rows.map((r) => r.id)).toEqual(JOURNEY_MAIN.map((i) => i.id));
    expect(rows.map((r) => r.no)).toEqual(rows.map((_, i) => i + 1));
  });

  it("a guest reads the whole board: the first step is next, the rest wait with their line", () => {
    const rows = journeyRows(emptyPlaceSave());
    expect(rows[0].state).toBe("next");
    for (const r of rows.slice(1)) {
      expect(r.state, r.id).toBe("closed");
      expect(r.line, r.id).toMatch(/^Opens when /);
    }
    const quests = questRows(emptyPlaceSave());
    expect(quests.map((q) => q.state)).toEqual(["open", "closed", "closed"]);
  });

  it("J10, J11, J12 come in that order, each with its own route", () => {
    const quests = questRows(emptyPlaceSave());
    expect(quests.map((q) => q.id)).toEqual([...QUEST_STEP_IDS]);
    expect(quests.map((q) => q.journey)).toEqual(["J10", "J11", "J12"]);
    expect(quests.map((q) => q.to)).toEqual([
      "/game/journey/quest/mastery-practice",
      "/game/journey/quest/first-price",
      "/game/journey/quest/first-sale",
    ]);
    expect(questRoute("first-sale")).toBe("/game/journey/quest/first-sale");
  });

  it("J11 and J12 open on a saved offer; a recorded victory marks the quest done", () => {
    const offer = saveWith(["find-top-talent", "discover-mission"], { offerSaved: true });
    expect(questRows(offer).map((q) => q.state)).toEqual(["open", "open", "open"]);

    const priced = saveWith(["find-top-talent", "discover-mission"], { offerSaved: true, victories: ["first-price"] });
    expect(questRows(priced).map((q) => q.state)).toEqual(["open", "done", "open"]);

    const sold = saveWith(["find-top-talent", "discover-mission"], {
      offerSaved: true,
      victories: ["mastery-practice", "first-price", "first-sale"],
    });
    expect(questRows(sold).map((q) => q.state)).toEqual(["done", "done", "done"]);
  });

  it("the next quest is the Journey's next step, then the first open real-world quest", () => {
    const first = nextQuest(emptyPlaceSave());
    expect(first?.kind).toBe("journey");
    expect(first?.row.id).toBe("find-top-talent");

    // Every Journey step done: the real-world quests are what is left.
    const allDone = saveWith(
      JOURNEY_MAIN.map((i) => i.id),
      { offerSaved: true },
    );
    const quest = nextQuest(allDone);
    expect(quest?.kind).toBe("quest");
    expect(quest?.row.id).toBe("mastery-practice");

    const afterPractice = saveWith(
      JOURNEY_MAIN.map((i) => i.id),
      { offerSaved: true, victories: ["mastery-practice"] },
    );
    expect(nextQuest(afterPractice)?.row.id).toBe("first-price");

    const everything = saveWith(
      JOURNEY_MAIN.map((i) => i.id),
      { offerSaved: true, victories: [...QUEST_STEP_IDS] },
    );
    expect(nextQuest(everything)).toBeNull();
  });
});
