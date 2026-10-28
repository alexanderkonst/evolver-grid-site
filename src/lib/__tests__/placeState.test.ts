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
  houseLit,
  isLiveNow,
  liveWindowNow,
  liveWindows,
  nextJourneyStep,
  nextMove,
  openPlaceKeys,
  placeLine,
  placeSaveFromSheet,
  placeState,
  whatChanged,
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
  opts: { offerSaved?: boolean; victories?: string[]; events?: Partial<Record<PlaceEvent, boolean>>; now?: Date } = {},
) => {
  const sheet: PlaceSaveSource = {
    chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })),
    offerSaved: opts.offerSaved,
    victories: opts.victories,
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

  it("Town Hall stays closed until a first sale is recorded", () => {
    const save = saveWith(["find-top-talent", "discover-mission"], { offerSaved: true });
    expect(placeState(place("town-hall"), save)).toBe("closed");
    const sold = saveWith(["find-top-talent", "discover-mission"], { offerSaved: true, events: { "first-sale": true } });
    expect(placeState(place("town-hall"), sold)).toBe("open");
    expect(placeState(place("market"), sold)).toBe("done");
  });

  it("the first-sale victory the player recorded (J12) opens Town Hall and lights the house; no other victory does", () => {
    const base = ["find-top-talent", "discover-mission"] as JourneyItemId[];
    const none = saveWith(base, { offerSaved: true, victories: [] });
    expect(houseLit(none)).toBe(false);

    for (const other of ["mastery-practice", "first-price", "journey-step", "academy-welcome"]) {
      const save = saveWith(base, { offerSaved: true, victories: [other] });
      expect(placeState(place("town-hall"), save), other).toBe("closed");
      expect(houseLit(save), other).toBe(false);
    }

    const sold = saveWith(base, { offerSaved: true, victories: ["first-price", "first-sale"] });
    expect(placeState(place("town-hall"), sold)).toBe("open");
    expect(placeState(place("market"), sold)).toBe("done");
    expect(houseLit(sold)).toBe(true);
  });

  it("J10 and J11 victories are read into the save as their own events", () => {
    const save = saveWith(["find-top-talent"], { victories: ["mastery-practice", "first-price"] });
    expect(save.met["mastery-practice"]).toBe(true);
    expect(save.met["first-price"]).toBe(true);
    expect(save.met["first-sale"]).toBeUndefined();
    // A guest, or a save with no victories table, has none of them.
    expect(placeSaveFromSheet({ chain: [] }).met).toEqual({});
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

  it("the Fire Circle is also live during the webinar it announces, Wed Nov 4, 9:00 Mexico City (WP-10)", () => {
    const fire = place("fire-circle");
    const during = saveWith([], { now: new Date("2026-11-04T15:30:00Z") });
    expect(placeState(fire, during)).toBe("live");
    expect(placeLine(fire, "live", during.now)).toBe("Live now: Webinar, Wed Nov 4.");
    expect(placeState(fire, saveWith([], { now: new Date("2026-11-04T14:59:00Z") }))).toBe("open");
    expect(placeState(fire, saveWith([], { now: new Date("2026-11-04T17:00:00Z") }))).toBe("open");
    // Between the two windows nothing is live.
    expect(placeState(fire, saveWith([], { now: new Date("2026-11-07T18:00:00Z") }))).toBe("open");
  });

  it("a place with two windows speaks the one that is open", () => {
    const fire = place("fire-circle");
    expect(placeLine(fire, "live", new Date("2026-11-09T18:00:00Z"))).toBe("Live now: Mastermind, Nov 9–10.");
    expect(placeLine(fire, "live", new Date("2026-11-04T15:30:00Z"))).toBe("Live now: Webinar, Wed Nov 4.");
    // Asked outside both windows, it falls back to the first rather than going blank.
    expect(placeLine(fire, "live", TUESDAY)).toBe("Live now: Webinar, Wed Nov 4.");
  });

  it("a rule may give one window or a list", () => {
    const one = { from: "2026-11-04T09:00:00-06:00", until: "2026-11-04T10:30:00-06:00", line: "Live now." };
    const two = { from: "2026-11-09T00:00:00-06:00", until: "2026-11-11T00:00:00-06:00", line: "Live now, too." };
    expect(liveWindows(undefined)).toEqual([]);
    expect(liveWindows(one)).toEqual([one]);
    expect(liveWindows([one, two])).toEqual([one, two]);
    expect(isLiveNow(one, new Date("2026-11-04T15:30:00Z"))).toBe(true);
    expect(isLiveNow([one, two], new Date("2026-11-10T18:00:00Z"))).toBe(true);
    expect(isLiveNow([one, two], TUESDAY)).toBe(false);
    expect(isLiveNow(undefined, TUESDAY)).toBe(false);
    expect(liveWindowNow([one, two], new Date("2026-11-10T18:00:00Z"))).toBe(two);
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
  const events: PlaceEvent[] = ["offer-saved", "mastery-practice", "first-price", "first-sale", "productize-session", "founder-academy", "deeper-access"];
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
      for (const w of liveWindows(p.rule.live)) expect(w.line, p.key).not.toMatch(barrier);
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

describe("nextMove: one next move (§14.6)", () => {
  const move = (done: JourneyItemId[], opts: Parameters<typeof saveWith>[1] = {}) =>
    nextMove(VILLAGE_PLACES, saveWith(done, opts));

  it("a guest is sent to Reception, with the result of the test and the real route", () => {
    const m = move([]);
    expect(m?.kind).toBe("step");
    expect(m?.place.key).toBe("reception");
    expect(m?.step).toBe("find-top-talent");
    expect(m?.to).toBe("/zone-of-genius/entry");
    expect(m?.result).toBeTruthy();
  });

  it("follows the Journey: Reception → Your House (mission, QoL, assets) → Workshop", () => {
    expect(move(["find-top-talent"])?.place.key).toBe("house");
    expect(move(["find-top-talent"])?.step).toBe("discover-mission");
    expect(move(["find-top-talent", "discover-mission"])?.step).toBe("assess-qol");
    expect(move(["find-top-talent", "discover-mission", "assess-qol"])?.step).toBe("map-assets");
    const m = move(["find-top-talent", "discover-mission", "assess-qol", "map-assets"]);
    expect(m?.place.key).toBe("workshop");
    expect(m?.to).toBe("/ubb");
  });

  it("agrees with the place that glows: its state is next", () => {
    for (const done of [[], ["find-top-talent"], ["find-top-talent", "discover-mission"]] as JourneyItemId[][]) {
      const save = saveWith(done);
      const m = nextMove(VILLAGE_PLACES, save);
      expect(m && placeState(m.place, save)).toBe("next");
    }
  });

  it("marks the optional step as optional", () => {
    expect(move(["find-top-talent", "discover-mission"])?.optional).toBe(true);
    expect(move(["find-top-talent"])?.optional).toBe(false);
  });

  it("every Journey step names what it gives", () => {
    for (const item of JOURNEY_MAIN) expect(item.result, item.id).toBeTruthy();
  });

  it("with the Journey done, a place that is live comes first, else the Quest Board", () => {
    const all = JOURNEY_MAIN.map((i) => i.id);
    const during = move(all, { offerSaved: true, now: new Date("2026-11-04T15:30:00Z") });
    expect(during?.kind).toBe("live");
    // The webinar makes the Academy and the Fire Circle live together (WP-10); the first in map order speaks.
    expect(during?.place.key).toBe("fire-circle");
    expect(during?.title).toBe("Live now: Webinar, Wed Nov 4.");
    const quiet = move(all, { offerSaved: true, now: TUESDAY });
    expect(quiet?.kind).toBe("quests");
    expect(quiet?.place.key).toBe("quest-board");
  });

  it("a live window does not push aside the next Journey step", () => {
    const m = move(["find-top-talent"], { now: new Date("2026-11-04T15:30:00Z") });
    expect(m?.kind).toBe("step");
    expect(m?.step).toBe("discover-mission");
  });
});

describe("whatChanged: what is new since the last visit (§14.6)", () => {
  const seen = (...keys: VillagePlaceKey[]) => new Set<string>(keys);
  const guestOpen: VillagePlaceKey[] = ["reception", "academy", "fire-circle"];

  it("names nothing when nothing opened", () => {
    const r = whatChanged(VILLAGE_PLACES, seen(...guestOpen), saveWith([]));
    expect(r.fresh).toEqual([]);
    expect(r.line).toBeNull();
  });

  it("Top Talent saved: Your House, Quest Board and Oracle are new; the line is Your House", () => {
    const r = whatChanged(VILLAGE_PLACES, seen(...guestOpen), saveWith(["find-top-talent"]));
    expect(r.fresh.map((p) => p.key)).toEqual(["house", "quest-board", "oracle"]);
    expect(r.line).toBe("Your House is open.");
  });

  it("Mission saved: Café and Workshop are new; the Workshop speaks", () => {
    const before: VillagePlaceKey[] = [...guestOpen, "house", "quest-board", "oracle"];
    const r = whatChanged(VILLAGE_PLACES, seen(...before), saveWith(["find-top-talent", "discover-mission"]));
    expect(r.fresh.map((p) => p.key).sort()).toEqual(["cafe", "workshop"]);
    expect(r.line).toBe("The Workshop is open.");
  });

  it("Offer saved: the stall stands in the Market", () => {
    const done: JourneyItemId[] = ["find-top-talent", "discover-mission", "assess-qol", "map-assets"];
    const before: VillagePlaceKey[] = [...guestOpen, "house", "quest-board", "oracle", "cafe", "workshop"];
    const r = whatChanged(VILLAGE_PLACES, seen(...before), saveWith(done, { offerSaved: true }));
    expect(r.fresh.map((p) => p.key).sort()).toEqual(["coworking", "market"]);
    expect(r.line).toBe("Your stall stands in the Market.");
  });

  it("a place without its own line says «<Name> is open.»", () => {
    const r = whatChanged([place("cafe")], seen(), saveWith(["find-top-talent", "discover-mission"]));
    expect(r.line).toBe("Café is open.");
  });

  it("a place the village has already seen open is not new again", () => {
    const save = saveWith(["find-top-talent"]);
    const open = openPlaceKeys(VILLAGE_PLACES, save);
    expect(whatChanged(VILLAGE_PLACES, new Set(open), save).line).toBeNull();
  });
});

describe("a guest with a finished test (WP-7b: result first, account only to save)", () => {
  const guest = (done: JourneyItemId[] = []) => saveWith(done, { events: { "guest-result": true } });

  it("the next move is «Save your character», at Your House, which stays closed", () => {
    const save = guest();
    const m = nextMove(VILLAGE_PLACES, save);
    expect(m?.kind).toBe("step");
    expect(m?.title).toBe("Save your character");
    expect(m?.place.key).toBe("house");
    expect(m?.to).toBe("/village/house");
    expect(m?.result).toBeTruthy();
    // The unlock order is untouched: the House opens when the top talent is saved to an account.
    expect(placeState(place("house"), save)).toBe("closed");
  });

  it("Reception is no longer the glowing next move, and nothing else claims it", () => {
    const s = statesOf(guest());
    expect(s.reception).toBe("open");
    expect(Object.values(s)).not.toContain("next");
  });

  it("once saved, the next move is the mission at Your House (J2)", () => {
    const save = guest(["find-top-talent"]);
    const m = nextMove(VILLAGE_PLACES, save);
    expect(m?.step).toBe("discover-mission");
    expect(m?.place.key).toBe("house");
    expect(m?.title).not.toBe("Save your character");
    expect(placeState(place("house"), save)).toBe("next");
    expect(placeState(place("reception"), save)).toBe("done");
  });

  it("without a result on the device, a guest still starts at Reception", () => {
    const m = nextMove(VILLAGE_PLACES, saveWith([], { events: { "guest-result": false } }));
    expect(m?.place.key).toBe("reception");
    expect(m?.step).toBe("find-top-talent");
  });

  it("changes nothing for callers that do not pass the event", () => {
    expect(nextMove(VILLAGE_PLACES, saveWith([]))?.place.key).toBe("reception");
  });
});
