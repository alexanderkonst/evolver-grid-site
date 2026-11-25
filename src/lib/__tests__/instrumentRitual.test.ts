import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VILLAGE_ELEMENTS, VILLAGE_PLACES, type ElementKey } from "@/data/villagePlaces";
import {
  CALM_PATHS,
  LINE_AT_MS,
  LINE_FADE_MS,
  LINE_HOLD_MS,
  MODULE_FORM_SELECTOR,
  REDUCED_TOTAL_MS,
  RITUAL_MS,
  RITUAL_STEPS,
  RITUAL_TOTAL_MS,
  isCalmMoment,
  isCalmPath,
  lineVisibleAt,
  moduleFormMounted,
  nextRitual,
  ritualLineKey,
  ritualStepAt,
  stepProgress,
} from "../instrument/ritual";
import { emptyLitSeen, markLitSeen, readLitSeen, writeLitSeen, type LitSeen } from "../instrument/state";
import en from "../../locales/en/common.json";
import es from "../../locales/es/common.json";
import ru from "../../locales/ru/common.json";

const litOf = (...on: ElementKey[]): Record<ElementKey, boolean> =>
  Object.fromEntries(VILLAGE_ELEMENTS.map((e) => [e.key, on.includes(e.key)])) as Record<ElementKey, boolean>;

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

const calm = { pathname: "/village", raised: false, inModuleForm: false };

/** The queue as the component runs it: one calm visit plays one body, then the player leaves and returns. */
const playAllVisits = (lit: Record<ElementKey, boolean>, seen: LitSeen) => {
  const played: ElementKey[] = [];
  for (let visit = 0; visit < 10; visit++) {
    const next = nextRitual({ lit, seen, calm: true, playing: false, playedThisVisit: false });
    if (!next) break;
    played.push(next);
    seen = markLitSeen(seen, next);
  }
  return { played, seen };
};

describe("body-lit ritual", () => {
  it("DoD 1 · ritual plays once per body", () => {
    const lit = litOf("ether", "air", "water", "fire");
    const first = playAllVisits(lit, emptyLitSeen());
    // Every lit body but air, once, in village order. Air is lit with the first reveal and has no ritual.
    expect(first.played).toEqual(["ether", "water", "fire"]);
    expect(first.played).not.toContain("air");

    // The record is written to the save; a returning player reads it back and sees nothing again.
    const s = store();
    writeLitSeen("p1", first.seen, s);
    const returning = readLitSeen("p1", s);
    expect(playAllVisits(lit, returning).played).toEqual([]);

    // A quarter that lights later plays its own ritual once, and only that one.
    const later = litOf("ether", "air", "water", "fire", "earth");
    expect(playAllVisits(later, returning).played).toEqual(["earth"]);
  });

  it("DoD 1 · one body per calm visit, never two at once", () => {
    const lit = litOf("ether", "water", "fire");
    expect(nextRitual({ lit, seen: emptyLitSeen(), calm: true, playing: true, playedThisVisit: false })).toBeNull();
    expect(nextRitual({ lit, seen: emptyLitSeen(), calm: true, playing: false, playedThisVisit: true })).toBeNull();
    expect(nextRitual({ lit, seen: emptyLitSeen(), calm: true, playing: false, playedThisVisit: false })).toBe("ether");
  });

  it("DoD 1 · a body that is not lit never plays", () => {
    expect(nextRitual({ lit: litOf("air"), seen: emptyLitSeen(), calm: true, playing: false, playedThisVisit: false })).toBeNull();
    expect(nextRitual({ lit: litOf(), seen: emptyLitSeen(), calm: true, playing: false, playedThisVisit: false })).toBeNull();
  });

  it("DoD 2 · never inside a module form", () => {
    expect(isCalmMoment(calm)).toBe(true);
    // A module form on the page, whatever the route says.
    expect(isCalmMoment({ ...calm, inModuleForm: true })).toBe(false);
    // The queue gives nothing while the moment is not calm: the body waits.
    const lit = litOf("fire");
    expect(nextRitual({ lit, seen: emptyLitSeen(), calm: isCalmMoment({ ...calm, inModuleForm: true }), playing: false, playedThisVisit: false })).toBeNull();
    // Module routes (the ones the village places open) are not calm paths.
    for (const place of VILLAGE_PLACES) {
      if (place.to.startsWith("/village")) continue;
      expect(isCalmPath(place.to), place.key).toBe(CALM_PATHS.includes(place.to));
    }
    expect(isCalmPath("/ubb")).toBe(false);
    expect(isCalmPath("/game/me/zone-of-genius")).toBe(false);
    expect(isCalmPath("/zone-of-genius/entry")).toBe(false);
    expect(isCalmPath("/game/settings")).toBe(false);
  });

  it("DoD 2 · a module form on the page is detected by its own class, and an empty page is calm", () => {
    const withForm = { querySelector: (sel: string) => (sel === MODULE_FORM_SELECTOR ? {} : null) } as unknown as ParentNode;
    const without = { querySelector: () => null } as unknown as ParentNode;
    expect(moduleFormMounted(withForm)).toBe(true);
    expect(moduleFormMounted(without)).toBe(false);
    // The selector names the real module form root (ModuleForm.css) and is the one the component asks.
    expect(MODULE_FORM_SELECTOR.split(",").map((s) => s.trim())).toContain(".mf");
    expect(readFileSync("src/components/game/ModuleForm.css", "utf8")).toMatch(/^\.mf \{/m);
    const component = readFileSync("src/components/game/InstrumentRitual.tsx", "utf8");
    expect(component).toContain("moduleFormMounted(document)");
    expect(component).toContain("isCalmMoment(");
  });

  it("DoD 2 · not while the instrument is open, the tab is hidden, or the player is off the calm paths", () => {
    expect(isCalmMoment({ ...calm, raised: true })).toBe(false);
    expect(isCalmMoment({ ...calm, hidden: true })).toBe(false);
    expect(isCalmMoment({ ...calm, pathname: "/ubb/offer" })).toBe(false);
    for (const p of ["/village", "/village/reception", "/game/journey", "/game/learn"]) expect(isCalmPath(p), p).toBe(true);
    // Look-alikes are not the village.
    expect(isCalmPath("/villagers")).toBe(false);
    expect(isCalmPath("/game/learn/some-course")).toBe(false);
  });

  it("the sequence is about 2.5 s in four steps, then one line that holds and fades", () => {
    expect(RITUAL_MS).toBe(2500);
    expect(RITUAL_STEPS.map((s) => s.id)).toEqual(["flare", "thread", "draw", "tone"]);
    // Steps follow each other without a gap and end at RITUAL_MS.
    RITUAL_STEPS.reduce((at, s) => {
      expect(s.at).toBe(at);
      return s.at + s.ms;
    }, 0);
    const last = RITUAL_STEPS[RITUAL_STEPS.length - 1];
    expect(last.at + last.ms).toBe(RITUAL_MS);
    expect(RITUAL_TOTAL_MS).toBe(LINE_AT_MS + LINE_HOLD_MS + LINE_FADE_MS);

    expect(ritualStepAt(0)).toBe("flare");
    expect(ritualStepAt(500)).toBe("thread");
    expect(ritualStepAt(1200)).toBe("draw");
    expect(ritualStepAt(2000)).toBe("tone");
    expect(ritualStepAt(RITUAL_MS)).toBeNull();
    expect(stepProgress("draw", 0)).toBe(0);
    expect(stepProgress("draw", 1400)).toBeCloseTo(0.5, 5);
    expect(stepProgress("draw", 9999)).toBe(1);

    expect(lineVisibleAt(LINE_AT_MS - 1)).toBe(false);
    expect(lineVisibleAt(LINE_AT_MS)).toBe(true);
    expect(lineVisibleAt(RITUAL_TOTAL_MS - 1)).toBe(true);
    expect(lineVisibleAt(RITUAL_TOTAL_MS)).toBe(false);
  });

  it("reduced motion: the line is there from the first moment and the variant is shorter than the full one", () => {
    expect(lineVisibleAt(0, true)).toBe(true);
    expect(lineVisibleAt(REDUCED_TOTAL_MS - 1, true)).toBe(true);
    expect(lineVisibleAt(REDUCED_TOTAL_MS, true)).toBe(false);
    expect(REDUCED_TOTAL_MS).toBeLessThan(RITUAL_TOTAL_MS);
  });

  it("every body with a ritual has its line in en, es and ru, and the fire line is the spec's", () => {
    const get = (locale: unknown, key: string) =>
      key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], locale);
    for (const element of VILLAGE_ELEMENTS.map((e) => e.key).filter((k) => k !== "air")) {
      for (const [name, locale] of [["en", en], ["es", es], ["ru", ru]] as const) {
        const line = get(locale, ritualLineKey(element));
        expect(typeof line, `${name} ${element}`).toBe("string");
        expect((line as string).length).toBeGreaterThan(10);
      }
    }
    expect(get(en, ritualLineKey("fire"))).toBe("Fire is lit. The Academy and FMF are open to you.");
  });
});
