import { describe, expect, it } from "vitest";
import { JOURNEY_MAIN } from "@/data/journeySequence";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import en from "@/locales/en/common.json";
import { closedLine, emptyPlaceSave, nextJourneyStep, placeSaveFromSheet, placeState } from "@/lib/placeState";
import { MAP_HOME, WHAT_YOU_CAN_DO, buildPossibilityMap, rayPoint } from "../possibilityMap";

const TUESDAY = new Date("2026-10-27T18:00:00Z");

const house = (map: ReturnType<typeof buildPossibilityMap>, key: string) => {
  const h = map.houses.find((x) => x.place.key === key);
  if (!h) throw new Error(`no house ${key}`);
  return h;
};

/** A save in which the first `n` Journey steps are done. */
const afterSteps = (n: number) =>
  placeSaveFromSheet({ chain: JOURNEY_MAIN.map((item, i) => ({ id: item.id, done: i < n })) }, TUESDAY);

describe("possibility map", () => {
  it("has a house for every village place except Your AI", () => {
    const map = buildPossibilityMap(emptyPlaceSave(TUESDAY));
    expect(map.houses.map((h) => h.place.key)).toEqual(VILLAGE_PLACES.map((p) => p.key).filter((k) => k !== MAP_HOME));
  });

  it("guest: houses are lit exactly where placeState says they are open", () => {
    const save = emptyPlaceSave(TUESDAY);
    const map = buildPossibilityMap(save);
    for (const h of map.houses) {
      expect(h.state).toBe(placeState(h.place, save));
      expect(h.lit).toBe(h.state !== "closed");
    }
    expect(house(map, "reception").lit).toBe(true);
    expect(house(map, "cafe").lit).toBe(true);
    expect(house(map, "house").lit).toBe(false);
    expect(house(map, "workshop").lit).toBe(false);
  });

  it("a dim house says what opens it; a lit house says what you can do", () => {
    const map = buildPossibilityMap(emptyPlaceSave(TUESDAY));
    const house1 = house(map, "house");
    expect(house1.line).toBe(closedLine(house1.place));
    expect(house1.line).toMatch(/^Opens when /);
    expect(house(map, "reception").line).toBe(WHAT_YOU_CAN_DO.reception);
  });

  it("guest: the first open next step is Reception", () => {
    const map = buildPossibilityMap(emptyPlaceSave(TUESDAY));
    expect(map.next?.place.key).toBe("reception");
    expect(map.next?.step).toBe("find-top-talent");
  });

  it("with the top talent saved, Your House lights and the next step moves on", () => {
    const save = afterSteps(1);
    const map = buildPossibilityMap(save);
    expect(house(map, "house").lit).toBe(true);
    expect(house(map, "quest-board").lit).toBe(true);
    expect(map.next?.step).toBe(nextJourneyStep(save));
    expect(map.next?.step).not.toBe("find-top-talent");
  });

  it("never offers a closed house as the next step", () => {
    for (const n of [0, 1, 2, 3, 4]) {
      const map = buildPossibilityMap(afterSteps(n));
      if (map.next) expect(placeState(map.next.place, afterSteps(n))).not.toBe("closed");
    }
  });

  it("puts the rays on a ring round the centre, the first one straight up", () => {
    const first = rayPoint(0, 10);
    expect(first.x).toBeCloseTo(50);
    expect(first.y).toBeLessThan(50);
    for (let i = 0; i < 10; i++) {
      const p = rayPoint(i, 10);
      expect(Math.hypot(p.x - 50, p.y - 50)).toBeCloseTo(38);
    }
  });

  it("has English for every «what you can do» line in the catalog", () => {
    const catalog = (en as { familiar: { map: { do: Record<string, string> } } }).familiar.map.do;
    for (const [key, line] of Object.entries(WHAT_YOU_CAN_DO)) expect(catalog[key], key).toBe(line);
  });
});
