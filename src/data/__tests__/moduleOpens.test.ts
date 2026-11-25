import { readFileSync } from "node:fs";
import { createInstance, type TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { ACADEMY_WELCOME_MODULE } from "@/data/academyModule";
import { JOURNEY_MODULES, moduleText, type JourneyModuleDef } from "@/data/journeyModules";
import { moduleOpens, moduleOpensText } from "@/data/moduleOpens";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { placeName } from "@/lib/villageCopy";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";

/**
 * GoBY §25.6 (epic #453, phase 5): every module Intro says two things, one line each: what you
 * get (`silhouette`) and what it opens next on the path (read from the village rules and the
 * path order, `moduleOpensText`), in en, es and ru.
 */
const MODULES: JourneyModuleDef[] = [...JOURNEY_MODULES, ACADEMY_WELCOME_MODULE];
const barrier = /\b(lock(s|ed|ing)?|gate|access denied|unlock(s|ed|ing)?|coming soon)\b/i;

const tFor = async (lng: "en" | "es" | "ru", res: object): Promise<TFunction> => {
  const i18n = createInstance();
  await i18n.init({
    lng,
    resources: { [lng]: { common: res } },
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  // No defaultValue safety net: a missing key shows as MISSING:<key>, never as the English.
  return ((key: string, options?: Record<string, unknown>) =>
    i18n.exists(key) ? i18n.t(key, options) : `MISSING:${key}`) as unknown as TFunction;
};

let tEn: TFunction;
let tEs: TFunction;
let tRu: TFunction;
beforeAll(async () => {
  tEn = await tFor("en", en);
  tEs = await tFor("es", es);
  tRu = await tFor("ru", ru);
});

const langs = () => [
  { lng: "en", t: tEn },
  { lng: "es", t: tEs },
  { lng: "ru", t: tRu },
];

describe("DoD 1 · each module intro has get + opens lines", () => {
  it("covers every Journey module, every quest and the Academy lesson", () => {
    expect(MODULES.map((m) => m.id)).toEqual([...JOURNEY_MODULES.map((m) => m.id), "academy-welcome"]);
  });

  it("the get line: present in en, es and ru, one line, translated, never a lookup miss", () => {
    for (const m of MODULES) {
      const english = moduleText(m, "silhouette", tEn);
      expect(english, m.id).toBe(m.silhouette);
      for (const { lng, t } of langs()) {
        const line = moduleText(m, "silhouette", t);
        expect(line, `${m.id} ${lng}`).not.toMatch(/MISSING:/);
        expect(line.trim().length, `${m.id} ${lng}`).toBeGreaterThan(10);
        expect(line, `${m.id} ${lng}`).not.toMatch(/\n/);
        expect(line, `${m.id} ${lng}`).not.toMatch(barrier);
        // One sentence: a single full stop, at the end.
        expect(line.replace(/\.$/, ""), `${m.id} ${lng}`).not.toMatch(/\.\s/);
        if (lng !== "en") expect(line, `${m.id} ${lng} is the English`).not.toBe(english);
      }
      expect(english, m.id).toMatch(/^You get /);
    }
  });

  it("the opens line: present in en, es and ru, one line, names a place or a step, never a lookup miss", () => {
    for (const m of MODULES) {
      const english = moduleOpensText(m, tEn);
      expect(english, m.id).toBe(moduleOpensText(m));
      expect(english.length, m.id).toBeGreaterThan(10);
      for (const { lng, t } of langs()) {
        const line = moduleOpensText(m, t);
        expect(line, `${m.id} ${lng}`).not.toMatch(/MISSING:|\{\{/);
        expect(line, `${m.id} ${lng}`).not.toMatch(/\n/);
        expect(line, `${m.id} ${lng}`).not.toMatch(barrier);
        const { places, next } = moduleOpens(m);
        for (const p of places) expect(line, `${m.id} ${lng}`).toContain(placeName(p, t));
        if (next?.module) expect(line, `${m.id} ${lng}`).toContain(moduleText(next.module, "headline", t));
        if (next?.label) expect(line, `${m.id} ${lng}`).toContain(next.label);
        if (lng !== "en") expect(line, `${m.id} ${lng} is the English frame`).not.toMatch(/\bOpens\b|\bNext on\b/);
      }
    }
  });

  it("every module opens something: a place, or a next step", () => {
    for (const m of MODULES) {
      const { places, next } = moduleOpens(m);
      expect(places.length + (next ? 1 : 0), m.id).toBeGreaterThan(0);
    }
  });
});

describe("the opens line is read from the registry, not typed per module", () => {
  const opens = (id: string) => moduleOpens(MODULES.find((m) => m.id === id)!);

  it("the places are exactly those whose rule waits on the module's event", () => {
    expect(opens("find-top-talent").places.map((p) => p.key)).toEqual(["house", "quest-board"]);
    expect(opens("discover-mission").places.map((p) => p.key)).toEqual(["workshop"]);
    expect(opens("map-assets").places.map((p) => p.key)).toEqual(["coworking"]); // the triad is whole
    expect(opens("tagline").places.map((p) => p.key)).toEqual(["market"]); // the offer is saved
    expect(opens("first-sale").places.map((p) => p.key)).toEqual(["town-hall"]);
    for (const id of ["assess-qol", "uniqueness-phrase", "webinar", "mastermind", "mastery-practice", "first-price"]) {
      expect(opens(id).places, id).toEqual([]);
    }
  });

  it("every place a module opens waits on it in VILLAGE_PLACES", () => {
    for (const m of MODULES) {
      for (const p of moduleOpens(m).places) expect(p.rule.opens, `${m.id} → ${p.key}`).toBeDefined();
    }
  });

  it("the next step is the next module in path order; the last quest has none; the Academy lesson names its own", () => {
    JOURNEY_MODULES.slice(0, -1).forEach((m, i) => {
      expect(moduleOpens(m).next?.module?.id, m.id).toBe(JOURNEY_MODULES[i + 1].id);
    });
    expect(opens("first-sale").next).toBeUndefined();
    const lesson = moduleOpens(ACADEMY_WELCOME_MODULE).next;
    expect(lesson?.module).toBeUndefined();
    expect(lesson?.label).toBe(ACADEMY_WELCOME_MODULE.opensNext?.label);
    expect(lesson?.place.key).toBe("academy");
  });

  it("reads like this in English", () => {
    expect(moduleOpensText(MODULES[0])).toBe("Opens: Home and Quest Board. Next on your path: Discover your mission.");
    expect(moduleOpensText(MODULES.find((m) => m.id === "assess-qol")!)).toBe(
      "Next on your path: Home · Map everything you can build with.",
    );
    expect(moduleOpensText(MODULES.find((m) => m.id === "first-sale")!)).toBe("Opens: Town Hall.");
    expect(moduleOpensText(MODULES.find((m) => m.id === "tagline")!)).toBe(
      "Opens: Market. Next on your path: Academy · Join the free FMF session (Nov 4).",
    );
    // A place that already starts the step's name is not said twice.
    expect(moduleOpensText(MODULES.find((m) => m.id === "webinar")!)).toBe(
      "Next on your path: FMF: Discover Founder-Market Fit in Three Days.",
    );
  });

  it("only places that exist are named", () => {
    const keys = new Set(VILLAGE_PLACES.map((p) => p.key));
    for (const m of MODULES) {
      const { places, next } = moduleOpens(m);
      for (const p of places) expect(keys.has(p.key), m.id).toBe(true);
      if (next) expect(keys.has(next.place.key), m.id).toBe(true);
    }
  });
});

describe("the Intro shows both lines", () => {
  const src = readFileSync("src/components/game/ModuleIntro.tsx", "utf8");

  it("renders the get line, then the opens line, in flow", () => {
    const get = src.indexOf('moduleText(module, "silhouette", t)');
    const opens = src.indexOf("moduleOpensText(module, t)");
    expect(get).toBeGreaterThan(0);
    expect(opens).toBeGreaterThan(get);
  });

  it("the opens line is plain text in flow: no positioning, no control over it", () => {
    const css = readFileSync("src/components/game/ModuleForm.css", "utf8");
    const rule = css.match(/\.mf__opens \{[^}]*\}/)?.[0] ?? "";
    expect(rule).not.toBe("");
    expect(rule).not.toMatch(/position\s*:\s*(absolute|fixed|sticky)/);
  });
});
