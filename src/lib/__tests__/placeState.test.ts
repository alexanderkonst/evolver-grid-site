import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { ORACLE_READING, VILLAGE_PLACES, getVillagePlace, type VillagePlaceKey } from "@/data/villagePlaces";
import { GROWTH_STEPS, growthStepClosedLine, growthStepPlace, growthStepState } from "@/modules/library/growthSteps";
import { PlaceState } from "@/components/game/PlaceState";
import {
  closedLine,
  emptyPlaceSave,
  nextJourneyStep,
  placeLine,
  placeSaveFromSheet,
  placeState,
  type PlaceEvent,
  type PlaceSaveSource,
  type PlaceStateName,
} from "../placeState";

const TUESDAY = new Date("2026-10-27T18:00:00Z");

const place = (key: VillagePlaceKey) => {
  const p = getVillagePlace(key);
  if (!p) throw new Error(`no place ${key}`);
  return p;
};

/** A save in which exactly these Journey steps are done. */
const saveWith = (
  done: JourneyItemId[],
  opts: { offerSaved?: boolean; events?: Partial<Record<PlaceEvent, boolean>>; now?: Date } = {},
) => {
  const sheet: PlaceSaveSource = {
    chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })),
    offerSaved: opts.offerSaved,
  };
  return placeSaveFromSheet(sheet, opts.now ?? TUESDAY, opts.events);
};

const statesOf = (save: ReturnType<typeof saveWith>) =>
  Object.fromEntries(VILLAGE_PLACES.map((p) => [p.key, placeState(p, save)])) as Record<VillagePlaceKey, PlaceStateName>;

describe("placeState: unlock order (§14.3)", () => {
  it("a guest sees Reception next, Academy and Fire Circle open, everything else closed", () => {
    const s = statesOf(saveWith([]));
    expect(s.reception).toBe("next");
    expect(s.academy).toBe("open");
    expect(s["fire-circle"]).toBe("open");
    for (const k of ["house", "quest-board", "oracle", "workshop", "cafe", "market", "coworking", "town-hall"] as const) {
      expect(s[k]).toBe("closed");
    }
  });

  it("an empty save is the same as a guest", () => {
    expect(placeState(place("house"), emptyPlaceSave(TUESDAY))).toBe("closed");
    expect(placeState(place("reception"), emptyPlaceSave(TUESDAY))).toBe("next");
  });

  it("Top Talent saved opens Your House, Quest Board and Oracle; Reception is done", () => {
    const s = statesOf(saveWith(["find-top-talent"]));
    expect(s.reception).toBe("done");
    expect(s.house).toBe("next"); // mission is the next move, and it lives in the House
    expect(s["quest-board"]).toBe("open");
    expect(s.oracle).toBe("open");
    expect(s.workshop).toBe("closed");
    expect(s.cafe).toBe("closed");
    expect(s.market).toBe("closed");
  });

  it("Mission saved opens Workshop and Café", () => {
    const s = statesOf(saveWith(["find-top-talent", "discover-mission"]));
    expect(s.workshop).toBe("open");
    expect(s.cafe).toBe("open");
    expect(s.house).toBe("next"); // QoL is next
    expect(s.market).toBe("closed");
    expect(s.coworking).toBe("closed");
  });

  it("the House is done when mission, QoL and assets are; then the Workshop is the next move", () => {
    const s = statesOf(saveWith(["find-top-talent", "discover-mission", "assess-qol", "map-assets"]));
    expect(s.house).toBe("done");
    expect(s.workshop).toBe("next");
  });

  it("an offer / tagline saved opens Market and Co-working and finishes the Workshop", () => {
    const s = statesOf(
      saveWith(["find-top-talent", "discover-mission", "assess-qol", "map-assets"], { offerSaved: true }),
    );
    expect(s.workshop).toBe("done");
    expect(s.market).toBe("open");
    expect(s.coworking).toBe("open");
    expect(s["town-hall"]).toBe("closed");
  });

  it("Town Hall stays closed until a first sale is recorded; nothing records one yet", () => {
    const save = saveWith(["find-top-talent", "discover-mission"], { offerSaved: true });
    expect(placeState(place("town-hall"), save)).toBe("closed");
    const sold = saveWith(["find-top-talent", "discover-mission"], { offerSaved: true, events: { "first-sale": true } });
    expect(placeState(place("town-hall"), sold)).toBe("open");
    expect(placeState(place("market"), sold)).toBe("done");
  });

  it("the single next move is the first step whose requirements are met", () => {
    expect(nextJourneyStep(saveWith([]))).toBe("find-top-talent");
    expect(nextJourneyStep(saveWith(["find-top-talent"]))).toBe("discover-mission");
    expect(nextJourneyStep(saveWith(["find-top-talent", "discover-mission"]))).toBe("assess-qol");
    expect(nextJourneyStep(saveWith(["find-top-talent", "discover-mission", "assess-qol"]))).toBe("map-assets");
  });

  it("at most one place is next", () => {
    for (const done of [[], ["find-top-talent"], ["find-top-talent", "discover-mission"]] as JourneyItemId[][]) {
      const s = statesOf(saveWith(done));
      expect(Object.values(s).filter((v) => v === "next")).toHaveLength(1);
    }
  });
});

describe("placeState: live", () => {
  it("the Academy is live during the webinar, Wed Nov 4, 9:00 Mexico City", () => {
    const during = saveWith([], { now: new Date("2026-11-04T15:30:00Z") });
    expect(placeState(place("academy"), during)).toBe("live");
    expect(placeLine(place("academy"), "live")).toBe("Live now: Webinar, Wed Nov 4.");
    const after = saveWith([], { now: new Date("2026-11-04T17:00:00Z") });
    expect(placeState(place("academy"), after)).toBe("open");
    const before = saveWith([], { now: new Date("2026-11-04T14:59:00Z") });
    expect(placeState(place("academy"), before)).toBe("open");
  });

  it("the Fire Circle is live on the Mastermind days, Nov 9 and 10", () => {
    expect(placeState(place("fire-circle"), saveWith([], { now: new Date("2026-11-09T18:00:00Z") }))).toBe("live");
    expect(placeState(place("fire-circle"), saveWith([], { now: new Date("2026-11-10T18:00:00Z") }))).toBe("live");
    expect(placeState(place("fire-circle"), saveWith([], { now: new Date("2026-11-11T07:00:00Z") }))).toBe("open");
  });
});

describe("closed lines come from data (§14.3)", () => {
  it("reads «Opens when <real event>. Inside: <result>.»", () => {
    expect(closedLine(place("house"))).toBe(
      "Opens when your top talent is saved to your account. Inside: your crystal, mission and save file.",
    );
    expect(closedLine(place("workshop"))).toBe(
      "Opens when your mission is saved. Inside: your offer, built from your top talent.",
    );
    expect(placeLine(place("town-hall"), "closed")).toMatch(/^Opens when your first sale is recorded\. Inside: .+\.$/);
  });

  it("every place that can be closed has a line, and always-open places have none", () => {
    for (const p of VILLAGE_PLACES) {
      if (p.rule.opens) expect(closedLine(p), p.key).toMatch(/^Opens when .+\. Inside: .+\.$/);
      else expect(closedLine(p), p.key).toBe("");
    }
  });

  it("only Reception, Academy and Fire Circle are open for a guest", () => {
    const open = VILLAGE_PLACES.filter((p) => !p.rule.opens).map((p) => p.key);
    expect(open.sort()).toEqual(["academy", "fire-circle", "reception"]);
  });
});

describe("rules point at the Journey, they do not restate it", () => {
  const events: PlaceEvent[] = ["offer-saved", "first-sale", "productize-session", "founder-academy", "deeper-access"];
  const known = new Set<string>([...JOURNEY_MAIN.map((i) => i.id), ...events]);

  it("every requirement names a Journey step or a known event", () => {
    const rules = [...VILLAGE_PLACES.map((p) => p.rule), ORACLE_READING.rule, ...GROWTH_STEPS.map((s) => s.rule ?? {})];
    for (const r of rules) {
      if (r.opens) expect(known.has(r.opens), r.opens).toBe(true);
      for (const s of r.steps ?? []) expect(known.has(s), s).toBe(true);
    }
  });

  it("the House opens on the step that the mission step itself requires", () => {
    const mission = JOURNEY_MAIN.find((i) => i.id === "discover-mission");
    expect(mission?.requires).toContain(place("house").rule.opens);
  });
});

describe("rooms below place level", () => {
  it("the Oracle Reading is closed until the top talent is saved, done once the deeper view is bought", () => {
    expect(placeState(ORACLE_READING, emptyPlaceSave(TUESDAY))).toBe("closed");
    expect(placeState(ORACLE_READING, { met: { "find-top-talent": true }, now: TUESDAY })).toBe("open");
    expect(
      placeState(ORACLE_READING, { met: { "find-top-talent": true, "deeper-access": true }, now: TUESDAY }),
    ).toBe("done");
  });

  it("Founder Academy and Mystery School are closed, with their lines; the rest are open", () => {
    const states = Object.fromEntries(GROWTH_STEPS.map((s) => [s.id, growthStepState(s)]));
    expect(states["founder-academy"]).toBe("closed");
    expect(states["integral-mystery-school"]).toBe("closed");
    expect(states["foundational-videos"]).toBe("open");
    const founder = GROWTH_STEPS.find((s) => s.id === "founder-academy")!;
    expect(growthStepClosedLine(founder)).toMatch(/^Opens when .+Productize Yourself Session\. Inside: .+\.$/);
    expect(growthStepPlace(founder).line).toBe(founder.description);
  });
});

describe("no barrier words in anything a player reads", () => {
  const barrier = /\b(lock(s|ed|ing)?|gate|access denied|unlock(s|ed|ing)?|coming soon)\b/i;
  it("place lines, closed lines and live lines", () => {
    for (const p of VILLAGE_PLACES) {
      expect(p.line, p.key).not.toMatch(barrier);
      expect(closedLine(p), p.key).not.toMatch(barrier);
      expect(p.rule.live?.line ?? "", p.key).not.toMatch(barrier);
    }
    expect(closedLine(ORACLE_READING)).not.toMatch(barrier);
    for (const s of GROWTH_STEPS) expect(growthStepClosedLine(s), s.id).not.toMatch(barrier);
  });
});

describe("PlaceState component", () => {
  const render = (state: PlaceStateName) =>
    renderToStaticMarkup(
      createElement(PlaceState, {
        state,
        scene: "scene",
        line: state === "closed" ? "Opens when your mission is saved. Inside: your offer." : undefined,
        action: createElement("a", { href: "/enter" }, "ENTER"),
      }),
    );

  it("exposes the state for skins to map", () => {
    for (const s of ["closed", "open", "next", "done", "live"] as PlaceStateName[]) {
      expect(render(s)).toContain(`data-place-state="${s}"`);
    }
  });

  it("closed has no ENTER, is aria-disabled and carries its line as text", () => {
    const html = render("closed");
    expect(html).not.toContain("ENTER");
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Opens when your mission is saved. Inside: your offer.");
  });

  it("every other state keeps ENTER and is not aria-disabled", () => {
    for (const s of ["open", "next", "done", "live"] as PlaceStateName[]) {
      const html = render(s);
      expect(html, s).toContain("ENTER");
      expect(html, s).not.toContain("aria-disabled");
    }
  });

  it("next, done and live name themselves in words, not only colour", () => {
    expect(render("next")).toContain(">Next<");
    expect(render("done")).toContain(">Done<");
    expect(render("live")).toContain(">Live<");
  });
});
