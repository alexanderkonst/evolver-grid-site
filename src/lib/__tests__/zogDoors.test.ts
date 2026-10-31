import { describe, expect, it } from "vitest";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { NEW_GAME_PATH, wantsFirstQuestion } from "@/lib/firstVisit";
import { houseRooms } from "../houseRooms";
import { journeyRows } from "../questBoard";
import { nextMove, placeSaveFromSheet } from "../placeState";

/**
 * Issue #281: every door to the test, for a player with no result yet, opens on the first
 * question (NEW_GAME_PATH). Onboarding and redo keep their own flows.
 */

const NOW = new Date("2026-10-31T09:00:00Z");

const saveWith = (done: JourneyItemId[]) =>
  placeSaveFromSheet({ chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })), offerSaved: false }, NOW);

const asParams = (path: string) => new URLSearchParams(path.split("?")[1] ?? "");

describe("the doors to the test", () => {
  it("the Quest Board's «Start by finding your top talent» goes straight to the first question", () => {
    const row = journeyRows(saveWith([])).find((r) => r.id === "find-top-talent");
    expect(row?.to).toBe(NEW_GAME_PATH);
    expect(wantsFirstQuestion(asParams(row?.to ?? ""))).toBe(true);
  });

  it("the village Reception door (the place list and /village/reception) does the same", () => {
    const reception = VILLAGE_PLACES.find((p) => p.key === "reception");
    expect(reception?.to).toBe(NEW_GAME_PATH);
  });

  it("«Your next move» for a fresh guest enters Reception at the first question", () => {
    const move = nextMove(VILLAGE_PLACES, saveWith([]));
    expect(move?.place.key).toBe("reception");
    expect(move?.to).toBe(NEW_GAME_PATH);
  });

  it("Home's top-talent room starts at the first question, and its retake keeps the bare door", () => {
    const talent = houseRooms(saveWith([])).find((r) => r.id === "talent");
    expect(talent?.to?.start).toBe(NEW_GAME_PATH);
    expect(talent?.to?.again).toBe("/zone-of-genius/entry");
  });

  it("onboarding and redo keep their flows: the begin flag never applies to them", () => {
    expect(wantsFirstQuestion(asParams("/zone-of-genius/entry?return=/start&begin=1"))).toBe(false);
    // A redo link carries no begin flag, so it opens on the route choice as before.
    expect(wantsFirstQuestion(asParams("/zone-of-genius/entry?redo=true"))).toBe(false);
  });
});
