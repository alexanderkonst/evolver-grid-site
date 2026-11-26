import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import {
  LOST_ENTRIES,
  clampToScreen,
  LOST_IDLE_MS,
  inkPath,
  lostInitial,
  lostReduce,
  moveSignature,
  placeKeyForPath,
  type LostEvent,
  type LostState,
} from "@/lib/instrument/inkLine";

/**
 * Navigation instrument, WP5: the lost trigger and the ink line's geometry
 * (docs/specs/navigation-instrument/architecture.md §6, sow.md WP5). Pure functions, no DOM.
 */

const run = (events: LostEvent[], from: LostState = lostInitial): LostState => events.reduce(lostReduce, from);
const S = "step:map-assets@market";

describe("DoD 2 · ink line never shows by default", () => {
  it("the starting state offers nothing, and a move alone offers nothing", () => {
    expect(lostInitial.offered).toBe(false);
    expect(run([{ type: "move", sig: S }]).offered).toBe(false);
  });

  it("without a move there is nothing to point to: entries and idle never offer", () => {
    const events: LostEvent[] = [{ type: "move", sig: null }, { type: "entry" }, { type: "entry" }, { type: "entry" }, { type: "idle" }];
    expect(run(events).offered).toBe(false);
  });

  it("two non-advancing entries are not enough", () => {
    expect(run([{ type: "move", sig: S }, { type: "entry" }, { type: "entry" }]).offered).toBe(false);
  });
});

describe("DoD 3 · lost trigger after 3 non-advancing entries or 60 s idle", () => {
  it("the defaults are 3 entries and 60 s", () => {
    expect(LOST_ENTRIES).toBe(3);
    expect(LOST_IDLE_MS).toBe(60_000);
  });

  it("the third entry with the same next move offers the line", () => {
    const s = run([{ type: "move", sig: S }, { type: "entry" }, { type: "entry" }, { type: "entry" }]);
    expect(s.offered).toBe(true);
  });

  it("idle offers the line when there is a next move", () => {
    expect(run([{ type: "move", sig: S }, { type: "idle" }]).offered).toBe(true);
  });

  it("an advance (the next move changes) resets the count", () => {
    const s = run([{ type: "move", sig: S }, { type: "entry" }, { type: "entry" }, { type: "move", sig: "step:x@y" }, { type: "entry" }]);
    expect(s.entries).toBe(1);
    expect(s.offered).toBe(false);
  });

  it("the same move seen again (a re-render) does not reset the count", () => {
    const s = run([{ type: "move", sig: S }, { type: "entry" }, { type: "move", sig: S }, { type: "entry" }, { type: "move", sig: S }, { type: "entry" }]);
    expect(s.offered).toBe(true);
  });

  it("settling (drawn or dismissed) withdraws the offer and keeps it away until the move changes", () => {
    const offered = run([{ type: "move", sig: S }, { type: "idle" }]);
    const settled = run([{ type: "settle" }], offered);
    expect(settled.offered).toBe(false);
    expect(run([{ type: "idle" }, { type: "entry" }, { type: "entry" }, { type: "entry" }], settled).offered).toBe(false);
    expect(run([{ type: "move", sig: "step:x@y" }, { type: "idle" }], settled).offered).toBe(true);
  });
});

describe("the move signature and place entries", () => {
  it("is null without a move, and changes with the place or the step", () => {
    expect(moveSignature(null)).toBeNull();
    const a = moveSignature({ kind: "step", step: "find-top-talent", place: { key: "reception" } });
    const b = moveSignature({ kind: "step", step: "discover-mission", place: { key: "reception" } });
    const c = moveSignature({ kind: "step", step: "find-top-talent", place: { key: "house" } });
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it("reads a place from its village route and from its own route", () => {
    expect(placeKeyForPath("/village/academy")).toBe("academy");
    expect(placeKeyForPath("/village/academy/rooms")).toBe("academy");
    expect(placeKeyForPath("/game/learn")).toBe("academy");
    expect(placeKeyForPath("/village")).toBeNull();
    expect(placeKeyForPath("/")).toBeNull();
    for (const p of VILLAGE_PLACES) expect(placeKeyForPath(`/village/${p.key}`)).toBe(p.key);
  });
});

describe("inkPath", () => {
  it("is one quadratic stroke from the start to a point just short of the target", () => {
    const { d, end } = inkPath({ x: 300, y: 700 }, { x: 100, y: 100 });
    expect(d).toMatch(/^M300 700 Q[\d. -]+ [\d. -]+ [\d. -]+ [\d. -]+$/);
    expect(Math.hypot(end.x - 100, end.y - 100)).toBeGreaterThan(5);
    expect(Math.hypot(end.x - 100, end.y - 100)).toBeLessThan(30);
  });

  it("a target on top of the start gives a path that does not blow up", () => {
    const { d, end } = inkPath({ x: 10, y: 10 }, { x: 10, y: 10 });
    expect(d).not.toMatch(/NaN/);
    expect(Number.isFinite(end.x) && Number.isFinite(end.y)).toBe(true);
  });
});

describe("clampToScreen", () => {
  const from = { x: 700, y: 900 };
  it("leaves an on-screen target alone", () => {
    expect(clampToScreen(from, { x: 300, y: 400 }, 768, 1024)).toEqual({ x: 300, y: 400 });
  });

  it("aims at an off-screen target along the same line of sight, inside the edge", () => {
    const to = { x: -50, y: 570 };
    const at = clampToScreen(from, to, 768, 1024);
    expect(at.x).toBeCloseTo(24);
    expect(at.y).toBeGreaterThan(570);
    expect(at.y).toBeLessThan(900);
    // Same direction as the target: the three points are collinear.
    const cross = (at.x - from.x) * (to.y - from.y) - (at.y - from.y) * (to.x - from.x);
    expect(Math.abs(cross)).toBeLessThan(1e-6);
  });

  it("handles a target straight above or below, and never returns NaN", () => {
    const up = clampToScreen(from, { x: 700, y: -500 }, 768, 1024);
    expect(up.x).toBeCloseTo(700);
    expect(up.y).toBeCloseTo(24);
    const same = clampToScreen(from, from, 768, 1024);
    expect(Number.isFinite(same.x) && Number.isFinite(same.y)).toBe(true);
  });
});
