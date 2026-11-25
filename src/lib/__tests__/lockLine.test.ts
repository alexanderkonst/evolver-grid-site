import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInstance, type TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { JOURNEY_MAIN } from "@/data/journeySequence";
import { JOURNEY_MODULES, moduleClosedLine } from "@/data/journeyModules";
import { VILLAGE_PLACES, ORACLE_READING } from "@/data/villagePlaces";
import { houseBadges, houseRooms } from "@/lib/houseRooms";
import { placeRooms } from "@/lib/placeRooms";
import { closedLine, emptyPlaceSave, placeSaveFromSheet, type PlaceSave } from "@/lib/placeState";
import { journeyRows, questRows } from "@/lib/questBoard";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";

/**
 * GoBY §25.5 (epic #453, phase 4): every closed place, room, quest, module and badge says one line,
 * «Opens when <real event>. Inside: <result>.», on every surface that shows it, in en, es and ru,
 * and an open item never carries it.
 */
const SHAPE = /^Opens when .+\. Inside: .+\.$/;
const guest = (): PlaceSave => emptyPlaceSave(new Date("2026-11-25T12:00:00Z"));
const everythingDone = (): PlaceSave =>
  placeSaveFromSheet({
    chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: true })),
    offerSaved: true,
    victories: ["webinar", "mastermind", "mastery-practice", "first-price", "first-sale"],
  });

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

/** Every closed line the village can show for a guest, with where it comes from. */
const closedLines = (t?: TFunction): { where: string; line: string }[] => {
  const save = guest();
  const out: { where: string; line: string }[] = [];
  for (const p of VILLAGE_PLACES) {
    if (p.rule.closed) out.push({ where: `place ${p.key}`, line: closedLine(p, t) });
    const { rooms, order } = placeRooms(p, save, { t, signedIn: true });
    for (const r of rooms) if (r.state === "closed") out.push({ where: `pane ${p.key}/${r.id}`, line: r.line });
    for (const r of order?.journey ?? []) if (r.state === "closed") out.push({ where: `order ${r.id}`, line: r.line });
    for (const r of order?.world ?? []) if (r.state === "closed") out.push({ where: `order ${r.id}`, line: r.line });
  }
  for (const r of journeyRows(save, t)) if (r.state === "closed") out.push({ where: `journey ${r.id}`, line: r.line });
  for (const r of questRows(save, t)) if (r.state === "closed") out.push({ where: `quest ${r.id}`, line: r.line });
  for (const m of JOURNEY_MODULES) {
    const line = moduleClosedLine(m.id, t);
    if (line) out.push({ where: `module ${m.id}`, line });
  }
  for (const r of houseRooms(save, t)) if (r.state === "closed") out.push({ where: `house ${r.id}`, line: r.line });
  for (const b of houseBadges(save, t)) if (b.state === "closed") out.push({ where: `badge ${b.step}`, line: b.line });
  out.push({ where: "oracle reading", line: closedLine(ORACLE_READING, t) });
  return out;
};

describe("the lock line on every closed item", () => {
  it("covers places, pane rows, the quest order, quests, modules, Home rooms and badges", () => {
    const wheres = closedLines().map((l) => l.where);
    for (const prefix of ["place ", "pane ", "order ", "journey ", "quest ", "module ", "house ", "badge ", "oracle"]) {
      expect(wheres.some((w) => w.startsWith(prefix)), prefix).toBe(true);
    }
  });

  it("every one reads «Opens when … Inside: ….» in English", () => {
    for (const { where, line } of closedLines()) expect(line, where).toMatch(SHAPE);
  });

  it("the English catalog says what the data says", () => {
    const data = closedLines();
    const cat = closedLines(tEn);
    expect(cat.map((l) => l.line)).toEqual(data.map((l) => l.line));
  });

  for (const [name, getT] of [["es", () => tEs], ["ru", () => tRu]] as const) {
    it(`${name}: every one is translated (no missing key, not the English)`, () => {
      const english = new Map(closedLines().map((l) => [l.where, l.line]));
      for (const { where, line } of closedLines(getT())) {
        expect(line, where).not.toMatch(/MISSING:/);
        expect(line, where).not.toBe("");
        // Translated, not the English fallback.
        expect(line, where).not.toBe(english.get(where));
      }
    });
  }
});

describe("an open item never carries the lock line", () => {
  it("nothing is closed once everything is done: no pane row, Home room or badge says «Opens when»", () => {
    const save = everythingDone();
    for (const p of VILLAGE_PLACES) {
      const { rooms, order } = placeRooms(p, save, { signedIn: true });
      for (const r of [...rooms, ...(order?.journey ?? []), ...(order?.world ?? [])]) {
        expect(r.line, `${p.key}/${r.id}`).not.toMatch(/Opens when/);
      }
    }
    for (const r of houseRooms(save).filter((x) => x.id !== "colors")) expect(r.line, r.id).toBe("");
    for (const b of houseBadges(save)) expect(b.line, b.step).toBe("");
  });

  it("an open place's rooms and an open Journey step carry no lock line", () => {
    const save = placeSaveFromSheet({ chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: i.id === "find-top-talent" })) });
    for (const p of VILLAGE_PLACES.filter((x) => x.key === "cafe" || x.key === "oracle")) {
      for (const r of placeRooms(p, save, { signedIn: true }).rooms) expect(r.line, r.id).not.toMatch(/Opens when/);
    }
    for (const r of journeyRows(save).filter((x) => x.state !== "closed")) expect(r.line, r.id).toBe("");
  });
});

describe("surfaces that draw the line", () => {
  const read = (p: string) => readFileSync(resolve(__dirname, "../../..", p), "utf8");

  it("the shell's pane 2 shows a closed row's line in the row, in every space, not only in the hover popover", () => {
    const src = read("src/components/game/SectionsPanel.tsx");
    expect(src).toMatch(/isLocked && section\.lockedHint && \(/);
    expect(src).not.toMatch(/isLocked && activeSpaceId === "build" && section\.lockedHint/);
  });

  it("the Town Hall door reads its closed line in the reader's language", () => {
    expect(read("src/pages/spaces/CoopSpace.tsx")).toContain('placeLine(place, "closed", t)');
  });

  it("Home reads its rooms and badges through the catalog", () => {
    const src = read("src/pages/spaces/sections/ProfileOverview.tsx");
    expect(src).toContain("houseRooms(save, t)");
    expect(src).toContain("houseBadges(save, t)");
  });
});
