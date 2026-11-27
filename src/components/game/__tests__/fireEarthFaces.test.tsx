import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VILLAGE_PLACES, type VillagePlace } from "@/data/villagePlaces";
import { emptyPlaceSave, placeState, type PlaceRequirement, type PlaceSave } from "@/lib/placeState";
import { getFace, hasFace } from "@/lib/instrument/faces";
import { EarthFaceView, earthFaceItems } from "@/components/game/faces/EarthFace";
import { FireFaceView, fireFaceItems } from "@/components/game/faces/FireFace";

/**
 * Navigation instrument, WP4: the fire and earth faces (docs/specs/navigation-instrument/architecture.md §6,
 * sow.md WP4). A face is a lens: at most three items, each a place that is not closed, never a list of the
 * whole village.
 */

// The registered faces read the save through this hook; these tests hand the views a save instead.
vi.mock("@/hooks/useCharacterSheet", () => ({ useCharacterSheet: () => ({}) }));

// The English is the source (`tr` falls back to it), so the markup is readable without the catalog.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: string | { defaultValue?: string; place?: string }) =>
      typeof opts === "string" ? opts : (opts?.defaultValue ?? key).replace("{{place}}", (opts as { place?: string })?.place ?? ""),
  }),
}));

const NOW = new Date("2026-11-25T19:00:00Z");
/** A Monday inside the FMF window (Dec 7 to Dec 9, 2026, Mexico City). */
const FMF_DAY = new Date("2026-12-08T18:00:00Z");

const saveWith = (met: PlaceRequirement[], now: Date = NOW): PlaceSave => ({
  met: Object.fromEntries(met.map((r) => [r, true])),
  now,
});

const byKey = (key: string) => VILLAGE_PLACES.find((p) => p.key === key)!;

/** A place in a quarter, closed until `opens` is met; used where the real village has no closed place in that quarter. */
const synthetic = (key: string, element: VillagePlace["element"], opens?: PlaceRequirement): VillagePlace => ({
  ...byKey("academy"),
  key: key as VillagePlace["key"],
  element,
  name: `Synthetic ${key}`,
  line: `Line of ${key}.`,
  to: `/synthetic/${key}`,
  rule: opens ? { opens, closed: { event: "the door is opened", inside: `secret of ${key}` } } : {},
});

const noop = () => undefined;
const handlers = { reduced: true, closeMs: 0, active: true, onBack: noop, onClose: noop, onNavigate: noop };

describe("DoD 1 · a face never shows a closed place's content", () => {
  it("earth, nothing opened: no item, and no name, line or lock line of Workshop, Market or Town Hall in the markup", () => {
    const save = emptyPlaceSave(NOW);
    for (const key of ["workshop", "market", "town-hall"]) expect(placeState(byKey(key), save)).toBe("closed");
    expect(earthFaceItems(save)).toEqual([]);

    const html = renderToStaticMarkup(<EarthFaceView save={save} {...handlers} />);
    for (const p of VILLAGE_PLACES.filter((x) => x.element === "earth")) {
      expect(html).not.toContain(p.name);
      expect(html).not.toContain(p.line);
      expect(html).not.toContain(p.rule.closed!.inside);
      expect(html).not.toContain(p.rule.closed!.event);
    }
    expect(html).not.toContain("Opens when");
    expect(html).not.toContain("<li");
  });

  it("earth, mission saved: only the Workshop shows; Market and Town Hall stay out of the markup", () => {
    const save = saveWith(["discover-mission"]);
    expect(earthFaceItems(save).map((i) => i.place.key)).toEqual(["workshop"]);
    const html = renderToStaticMarkup(<EarthFaceView save={save} {...handlers} />);
    expect(html).toContain("Collective");
    for (const key of ["market", "town-hall"]) {
      expect(html).not.toContain(byKey(key).name);
      expect(html).not.toContain(byKey(key).line);
      expect(html).not.toContain(byKey(key).rule.closed!.inside);
    }
  });

  it("earth, offer saved: the Market opens, Town Hall (waits on the first sale) does not show", () => {
    const save = saveWith(["offer-saved", "build-business", "discover-mission"]);
    const items = earthFaceItems(save);
    expect(items.map((i) => i.place.key).sort()).toEqual(["market", "workshop"]);
    // The Workshop is done (its offer is saved), so it comes after the Market, which is still to do.
    expect(items.find((i) => i.place.key === "workshop")!.state).toBe("done");
    expect(items[items.length - 1].place.key).toBe("workshop");
    const html = renderToStaticMarkup(<EarthFaceView save={save} {...handlers} />);
    expect(html).not.toContain("Town Hall");
    expect(html).not.toContain(byKey("town-hall").rule.closed!.inside);
  });

  it("earth, first sale: all three places, each a door to /village/<key>", () => {
    const save = saveWith(["offer-saved", "build-business", "discover-mission", "first-sale"]);
    expect(earthFaceItems(save).map((i) => i.place.key).sort()).toEqual(["market", "town-hall", "workshop"]);
  });

  it("fire, a closed place of the quarter is never shown (synthetic closed place)", () => {
    const closed = synthetic("sealed-hall", "fire", "first-sale");
    const places = [byKey("fire-circle"), byKey("academy"), closed];
    const save = emptyPlaceSave(NOW);
    expect(placeState(closed, save)).toBe("closed");
    expect(fireFaceItems(save, places).map((i) => i.place.key).sort()).toEqual(["academy", "fire-circle"]);
    expect(fireFaceItems(save, places).some((i) => (i.place.key as string) === "sealed-hall")).toBe(false);

    const html = renderToStaticMarkup(<FireFaceView save={save} places={places} {...handlers} />);
    expect(html).not.toContain(closed.name);
    expect(html).not.toContain(closed.line);
    expect(html).not.toContain("secret of sealed-hall");
    expect(html).not.toContain("the door is opened");
    // The open ones of the quarter are there.
    expect(html).toContain("Academy");
    expect(html).toContain("FMF");
  });

  it("fire shows only fire places, earth only earth places", () => {
    const save = saveWith(["offer-saved", "build-business", "discover-mission", "first-sale"]);
    expect(fireFaceItems(save).every((i) => i.place.element === "fire")).toBe(true);
    expect(earthFaceItems(save).every((i) => i.place.element === "earth")).toBe(true);
  });

  it("an item is a door to its place in the village, never to a module route", () => {
    const save = saveWith(["discover-mission"]);
    const items = [...fireFaceItems(save), ...earthFaceItems(save)];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) expect(item.to).toBe(`/village/${item.place.key}`);
    const html = renderToStaticMarkup(<FireFaceView save={save} {...handlers} />);
    expect(html).toContain('data-place="academy"');
    expect(html).toContain('data-place="fire-circle"');
  });
});

describe("DoD 2 · at most three items per face", () => {
  const five = (element: VillagePlace["element"]) => Array.from({ length: 5 }, (_, i) => synthetic(`${element}-${i}`, element));

  it("five open places in a quarter give three items, in the markup too", () => {
    const save = emptyPlaceSave(NOW);
    expect(fireFaceItems(save, five("fire"))).toHaveLength(3);
    expect(earthFaceItems(save, five("earth"))).toHaveLength(3);
    const fire = renderToStaticMarkup(<FireFaceView save={save} places={five("fire")} {...handlers} />);
    const earth = renderToStaticMarkup(<EarthFaceView save={save} places={five("earth")} {...handlers} />);
    expect((fire.match(/<li/g) ?? []).length).toBe(3);
    expect((earth.match(/<li/g) ?? []).length).toBe(3);
  });

  it("the real village never exceeds three, whatever the save", () => {
    const everything = saveWith(["offer-saved", "build-business", "discover-mission", "first-sale", "find-top-talent", "map-assets"]);
    for (const save of [emptyPlaceSave(NOW), everything, saveWith([], FMF_DAY)]) {
      expect(fireFaceItems(save).length).toBeLessThanOrEqual(3);
      expect(earthFaceItems(save).length).toBeLessThanOrEqual(3);
    }
  });

  it("what is live or next comes before what is only open", () => {
    const places = [synthetic("a-open", "fire"), byKey("fire-circle")];
    const items = fireFaceItems(saveWith([], FMF_DAY), places);
    expect(items[0].place.key).toBe("fire-circle");
    expect(items[0].state).toBe("live");
  });
});

describe("registration", () => {
  it("both faces fill their slots in the registry, and no other slot", () => {
    expect(hasFace("fire")).toBe(true);
    expect(hasFace("earth")).toBe(true);
    expect(getFace("fire")).not.toBe(getFace("earth"));
  });
});

describe("WP8 polish · the earth face is never a blank card while the save loads", () => {
  const savedWithWorkshop = saveWith(["discover-mission"]);

  it("not ready: a skeleton of rows, no «nothing yet» line, no items", () => {
    const html = renderToStaticMarkup(<EarthFaceView save={emptyPlaceSave(NOW)} ready={false} {...handlers} />);
    expect(html).toContain('data-testid="earth-face-skeleton"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("Opens on your path");
    expect(html).not.toContain("data-place=");
  });

  it("not ready: even a save that has items shows only the skeleton, so the card never flips from blank to full", () => {
    expect(earthFaceItems(savedWithWorkshop).length).toBeGreaterThan(0);
    const html = renderToStaticMarkup(<EarthFaceView save={savedWithWorkshop} ready={false} {...handlers} />);
    expect(html).toContain('data-testid="earth-face-skeleton"');
    expect(html).not.toContain("data-place=");
  });

  it("ready: the skeleton is gone and the content is there", () => {
    const html = renderToStaticMarkup(<EarthFaceView save={savedWithWorkshop} ready {...handlers} />);
    expect(html).not.toContain("earth-face-skeleton");
    expect(html).toContain("data-place=");
    const empty = renderToStaticMarkup(<EarthFaceView save={emptyPlaceSave(NOW)} ready {...handlers} />);
    expect(empty).not.toContain("earth-face-skeleton");
    expect(empty).toContain("Opens on your path");
  });

  it("the skeleton pulses only when motion is allowed", () => {
    const html = renderToStaticMarkup(<EarthFaceView save={emptyPlaceSave(NOW)} ready={false} {...handlers} />);
    expect(html).toContain("motion-safe:animate-pulse");
    expect(html).not.toMatch(/class="[^"]*(?<!motion-safe:)animate-pulse/);
  });
});
