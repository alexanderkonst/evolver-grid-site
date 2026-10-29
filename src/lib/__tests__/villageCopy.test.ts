import { beforeAll, describe, expect, it } from "vitest";
import { createInstance, type TFunction } from "i18next";
import en from "@/locales/en/common.json";
import { VILLAGE_MAP, VILLAGE_PLACES } from "@/data/villagePlaces";
import { JOURNEY_MODULES, moduleClosedLine, moduleText, questTaskText } from "@/data/journeyModules";
import { journeyResultText, journeyRows, questRows } from "@/lib/questBoard";
import {
  SAVE_CHARACTER_TITLE,
  closedLine,
  emptyPlaceSave,
  nextMove,
  nextMoveCopy,
  placeLine,
  whatChangedLine,
  type PlaceStateName,
} from "@/lib/placeState";
import { VILLAGE_SKY_MOODS, villageSkyMood, type VillageMoonPhase } from "@/lib/villageSky";
import { placeAlt, placeName, placeTagline, stateWordText, tr } from "@/lib/villageCopy";

/**
 * Issue #203: the village reads its English through the catalog, and the catalog says exactly
 * what the data files say. `strict` has no `defaultValue` safety net: a key missing from the
 * English catalog comes back as «MISSING:<key>», so a typo in a key fails here instead of
 * quietly falling back to the data file.
 */
let strict: TFunction;

beforeAll(async () => {
  const i18n = createInstance();
  await i18n.init({
    lng: "en",
    resources: { en: { common: en } },
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  strict = ((key: string, options?: Record<string, unknown>) =>
    i18n.exists(key) ? i18n.t(key, options) : `MISSING:${key}`) as unknown as TFunction;
});

const STATES: PlaceStateName[] = ["closed", "open", "next", "done", "live"];

describe("village places: the catalog is the data's English", () => {
  it("name, line and alt", () => {
    for (const p of VILLAGE_PLACES) {
      expect(placeName(p, strict), p.key).toBe(p.name);
      expect(placeTagline(p, strict), p.key).toBe(p.line);
      expect(placeAlt(p, strict), p.key).toBe(p.alt);
    }
    expect(strict("village.map.alt")).toBe(VILLAGE_MAP.alt);
  });

  it("the closed, live and plain line of every place in every state", () => {
    for (const p of VILLAGE_PLACES) {
      for (const s of STATES) expect(placeLine(p, s, strict), `${p.key} ${s}`).toBe(placeLine(p, s));
      expect(closedLine(p, strict), p.key).toBe(closedLine(p));
    }
  });

  it("Reception says «Welcome back» once a session exists, the others keep one line (issue #215)", () => {
    const reception = VILLAGE_PLACES[0];
    expect(placeTagline(reception, strict)).toBe("Welcome, guest. Discover your uniqueness.");
    expect(placeTagline(reception, strict, true)).toBe("Welcome back. Discover your uniqueness.");
    expect(placeLine(reception, "open", strict, true)).toBe(reception.lineReturning);
    for (const p of VILLAGE_PLACES.slice(1)) expect(placeTagline(p, strict, true), p.key).toBe(p.line);
  });

  it("the «opened» lines, and the default «<Name> is open.»", () => {
    for (const p of VILLAGE_PLACES) {
      expect(whatChangedLine([p], strict), p.key).toBe(whatChangedLine([p]));
    }
    expect(whatChangedLine([VILLAGE_PLACES[0]], strict)).toBe("Reception is open.");
  });
});

describe("journey modules: the catalog is the data's English", () => {
  it("eyebrow, headline, silhouette, verb, task", () => {
    for (const m of JOURNEY_MODULES) {
      for (const field of ["eyebrow", "headline", "silhouette", "verb"] as const) {
        expect(moduleText(m, field, strict), `${m.id}.${field}`).toBe(m[field]);
      }
      expect(questTaskText(m, strict), m.id).toBe(m.quest?.task ?? "");
    }
  });

  it("the closed line of every module", () => {
    for (const m of JOURNEY_MODULES) expect(moduleClosedLine(m.id, strict), m.id).toBe(moduleClosedLine(m.id));
  });

  it("the Quest Board rows", () => {
    const save = emptyPlaceSave();
    expect(journeyRows(save, strict)).toEqual(journeyRows(save));
    expect(questRows(save, strict)).toEqual(questRows(save));
    for (const row of journeyRows(save)) {
      expect(journeyResultText(row.id, strict), row.id).toBe(journeyResultText(row.id));
    }
  });
});

describe("the next move and the sky", () => {
  it("the next move reads the same words in English", () => {
    const guest = nextMove(VILLAGE_PLACES, emptyPlaceSave())!;
    expect(nextMoveCopy(guest, strict)).toEqual(nextMoveCopy(guest));
    expect(nextMoveCopy(guest)).toEqual({ place: guest.place.name, title: guest.title, result: guest.result });

    const awaiting = nextMove(VILLAGE_PLACES, { ...emptyPlaceSave(), met: { "guest-result": true } })!;
    expect(awaiting.title).toBe(SAVE_CHARACTER_TITLE);
    expect(nextMoveCopy(awaiting, strict)).toEqual({
      place: awaiting.place.name,
      title: awaiting.title,
      result: awaiting.result,
    });
  });

  it("the four moon moods", () => {
    for (const phase of Object.keys(VILLAGE_SKY_MOODS) as VillageMoonPhase[]) {
      expect(villageSkyMood(phase, strict), phase).toBe(VILLAGE_SKY_MOODS[phase]);
    }
  });

  it("the state words", () => {
    expect(stateWordText("closed", strict)).toBe("Not open yet");
    expect(stateWordText("next", strict)).toBe("Next");
    expect(stateWordText("done", strict)).toBe("Done");
    expect(stateWordText("live", strict)).toBe("Live");
    expect(stateWordText("open", strict)).toBeNull();
  });

  it("the single strings used by the pages", () => {
    const keys: Record<string, string> = {
      "village.title": "The Digital Village",
      "village.tabTitle": "The Digital Village · FindYourTopTalent",
      "village.eyebrow": "The Game of Being You",
      "village.mapAria": "Digital Village map",
      "village.choosePlace": "Choose a place",
      "village.backTitle": "← Title",
      "village.backVillage": "← Village",
      "village.nextMove": "Your next move",
      "village.enter": "ENTER",
      "village.enterWord": "Enter",
      "village.placesNav": "Places",
      "village.railAria": "Village",
      "village.lit": "Lit",
      "village.new": "New",
      "village.saveCharacter": "Save your character",
      "village.findTopTalent": "Find your top talent",
      "village.signIn": "I already live here → sign in",
      "village.quest.heading": "Your next quest",
      "village.quest.empty": "Nothing is waiting. Go and live the next thing.",
      "village.quest.journey": "The Journey",
      "village.quest.world": "In the world",
      "chatLauncher.title": "Chat with us",
      "chatLauncher.subtitle": "Choose the channel that feels easiest.",
      "chatLauncher.whatsappHint": "Open a private conversation",
    };
    for (const [key, english] of Object.entries(keys)) expect(tr(strict, key, "x"), key).toBe(english);
    expect(strict("spacesRail.homeAria", { brand: "Techstars" })).toBe("Techstars home");
    expect(strict("village.placeClosedAria", { name: "Oracle", line: "Opens when…" })).toBe("Oracle. Opens when…");
  });
});
