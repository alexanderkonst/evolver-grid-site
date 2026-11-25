import { describe, expect, it } from "vitest";
import {
  CAFE_ROUTE,
  FMF_ROUTE,
  MAX_WATER_ITEMS,
  buildWaterItems,
  cycleToday,
  fmfNext,
  itemRoute,
  nextGathering,
  readCycleChanges,
  type CafeRow,
  type Gathering,
} from "@/lib/instrument/waterFace";
import { FMF_PAGE_PATH } from "@/data/fmfSession";
import { VILLAGE_PLACES } from "@/data/villagePlaces";

const at = (iso: string) => Date.parse(iso);
const GATHERING: Gathering = { id: "g1", title: "Sunday circle", date: "2026-11-29", time: "10:00", timezone: "America/Mexico_City" };
const row = (over: Partial<CafeRow> & { id: string; event_date: string; event_time: string }): CafeRow => ({
  title: "Circle",
  timezone: "America/Mexico_City",
  ...over,
});

// Fixed instants, from the app's own lunar math (the same engine the village sky and FMF dates are tested against):
// new moon 2026-12-09 00:52 UTC, full moon 2026-11-24 14:58 UTC, last quarter 2026-12-01 00:08 -06:00 (src/data/fmfSession.ts).
describe("DoD 1 · cycle math against fixed dates", () => {
  it("DoD 1 · just after the new moon: New Moon, day 1", () => {
    expect(cycleToday(at("2026-12-09T05:00:00Z"))).toMatchObject({ segmentIndex: 0, day: 1 });
  });

  it("DoD 1 · just before the new moon: Waning Crescent, day 30", () => {
    expect(cycleToday(at("2026-12-08T23:00:00Z"))).toMatchObject({ segmentIndex: 7, day: 30 });
  });

  it("DoD 1 · the full moon: Full Moon from the instant, day 15 (cycle 0.5)", () => {
    const full = cycleToday(at("2026-11-24T16:00:00Z"));
    expect(full).toMatchObject({ segmentIndex: 4, day: 15 });
    expect(full.cycle).toBeCloseTo(0.5, 2);
    // An hour earlier the moon is not full yet.
    expect(cycleToday(at("2026-11-24T13:00:00Z")).segmentIndex).toBe(3);
  });

  it("DoD 1 · the last quarter that opens Planning: Last Quarter, day 23 (cycle 0.75)", () => {
    const lq = cycleToday(at("2026-12-01T00:08:00-06:00") + 3 * 3_600_000);
    expect(lq).toMatchObject({ segmentIndex: 6, day: 23 });
    expect(lq.cycle).toBeCloseTo(0.75, 2);
  });

  it("DoD 1 · a waxing day between: Waxing Crescent, day 8", () => {
    expect(cycleToday(at("2026-12-17T00:00:00Z"))).toMatchObject({ segmentIndex: 1, day: 8 });
  });

  it("DoD 1 · day is always 1 to 30 across a year, and a Date and a number agree", () => {
    for (let d = 0; d < 365; d += 1) {
      const ms = at("2026-11-25T12:00:00Z") + d * 86_400_000;
      const { day, segmentIndex } = cycleToday(ms);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(30);
      expect(segmentIndex).toBeGreaterThanOrEqual(0);
      expect(segmentIndex).toBeLessThanOrEqual(7);
    }
    expect(cycleToday(new Date("2026-12-17T00:00:00Z"))).toEqual(cycleToday(at("2026-12-17T00:00:00Z")));
  });

  it("DoD 1 · next FMF is read from the single source; live from Monday to Wednesday", () => {
    expect(fmfNext(at("2026-11-25T12:00:00-06:00"))).toEqual({ monday: "2026-12-07", wednesday: "2026-12-09", live: false });
    expect(fmfNext(at("2026-12-08T12:00:00-06:00"))).toEqual({ monday: "2026-12-07", wednesday: "2026-12-09", live: true });
    // The Wednesday is over: the next cycle's FMF.
    expect(fmfNext(at("2026-12-10T00:00:00-06:00"))).toEqual({ monday: "2027-01-04", wednesday: "2027-01-06", live: false });
  });
});

describe("next Café gathering", () => {
  const now = at("2026-11-25T12:00:00-06:00");

  it("is the soonest one that has not ended, by start time", () => {
    const rows = [
      row({ id: "later", title: "Later", event_date: "2026-12-02", event_time: "18:00" }),
      row({ id: "past", title: "Past", event_date: "2026-11-20", event_time: "18:00" }),
      row({ id: "soon", title: "Soon", event_date: "2026-11-29", event_time: "10:00" }),
    ];
    expect(nextGathering(rows, now)?.id).toBe("soon");
  });

  it("skips cancelled rows and FMF rows (FMF has its own item)", () => {
    const rows = [
      row({ id: "x", event_date: "2026-11-27", event_time: "10:00", cancelled_at: "2026-11-26T00:00:00Z" }),
      row({ id: "m", event_date: "2026-11-28", event_time: "10:00", kind: "mastermind" }),
      row({ id: "ok", event_date: "2026-11-30", event_time: "10:00" }),
    ];
    expect(nextGathering(rows, now)?.id).toBe("ok");
  });

  it("is null when there is nothing ahead", () => {
    expect(nextGathering([], now)).toBeNull();
    expect(nextGathering([row({ id: "p", event_date: "2026-11-01", event_time: "10:00" })], now)).toBeNull();
  });
});

describe("DoD 2 · at most three items", () => {
  const now = at("2026-11-25T12:00:00-06:00");

  it("DoD 2 · moon, FMF and the Café gathering are three items", () => {
    const items = buildWaterItems({ now, gathering: GATHERING, changes: [] });
    expect(items.map((i) => i.kind)).toEqual(["moon", "fmf", "gathering"]);
  });

  it("DoD 2 · with this-cycle changes there are still three: the changes take the third place", () => {
    const items = buildWaterItems({ now, gathering: GATHERING, changes: ["a", "b", "c", "d", "e"] });
    expect(items).toHaveLength(MAX_WATER_ITEMS);
    expect(items.map((i) => i.kind)).toEqual(["moon", "fmf", "changes"]);
    const changes = items[2];
    expect(changes.kind === "changes" && changes.lines.length).toBeLessThanOrEqual(2);
  });

  it("DoD 2 · never more than three, for any mix of inputs", () => {
    for (const gathering of [null, GATHERING]) {
      for (const changes of [[], ["one"], ["one", "two", "three"]]) {
        expect(buildWaterItems({ now, gathering, changes }).length).toBeLessThanOrEqual(MAX_WATER_ITEMS);
      }
    }
  });

  it("DoD 2 · the changes item is hidden while phase 6 has written nothing", () => {
    expect(readCycleChanges()).toEqual([]);
    expect(buildWaterItems({ now, gathering: null, changes: readCycleChanges() }).some((i) => i.kind === "changes")).toBe(false);
  });
});

describe("DoD 3 · links go to the right routes", () => {
  it("DoD 3 · FMF goes to the FMF page, the gathering to the Café's own route", () => {
    expect(FMF_ROUTE).toBe(FMF_PAGE_PATH);
    expect(FMF_ROUTE).toBe("/build/fmf");
    expect(CAFE_ROUTE).toBe(VILLAGE_PLACES.find((p) => p.key === "cafe")?.to);
    expect(CAFE_ROUTE).toBe("/game/meet");
    const items = buildWaterItems({ now: at("2026-11-25T12:00:00-06:00"), gathering: null, changes: [] });
    const route = (kind: string) => itemRoute(items.find((i) => i.kind === kind)!);
    expect(route("fmf")).toBe("/build/fmf");
    expect(route("gathering")).toBe("/game/meet");
  });

  it("DoD 3 · the moon and the changes are read, not visited: no route", () => {
    expect(itemRoute({ kind: "moon", segmentIndex: 0, day: 1, cycle: 0 })).toBeNull();
    expect(itemRoute({ kind: "changes", lines: ["x"] })).toBeNull();
  });
});
