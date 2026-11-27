import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONSOLE_SUITES,
  TOUR_GROUPS,
  TOUR_SEEN_KEY,
  isToggleKey,
  readTourSeen,
  writeTourSeen,
} from "../yourAiInstrument";

const key = (over: Partial<Parameters<typeof isToggleKey>[0]> = {}) => ({
  key: ".",
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  defaultPrevented: false,
  isComposing: false,
  target: { matches: () => false } as unknown as EventTarget,
  ...over,
});

describe("My AI instrument: the period key", () => {
  it("toggles on a bare period outside text fields", () => {
    expect(isToggleKey(key())).toBe(true);
  });
  it("toggles on a bare I, either case (the navigation instrument's key), outside text fields", () => {
    expect(isToggleKey(key({ key: "i" }))).toBe(true);
    expect(isToggleKey(key({ key: "I" }))).toBe(true);
    expect(isToggleKey(key({ key: "i", target: { matches: () => true } as unknown as EventTarget }))).toBe(false);
    expect(isToggleKey(key({ key: "i", metaKey: true }))).toBe(false);
    expect(isToggleKey(key({ key: "o" }))).toBe(false);
  });
  it("stays a period while typing, with a modifier, mid-composition, or when already handled", () => {
    expect(isToggleKey(key({ target: { matches: () => true } as unknown as EventTarget }))).toBe(false);
    expect(isToggleKey(key({ ctrlKey: true }))).toBe(false);
    expect(isToggleKey(key({ metaKey: true }))).toBe(false);
    expect(isToggleKey(key({ isComposing: true }))).toBe(false);
    expect(isToggleKey(key({ defaultPrevented: true }))).toBe(false);
    expect(isToggleKey(key({ key: "," }))).toBe(false);
  });
});

describe("My AI instrument: the tour is shown once", () => {
  const store = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  };
  it("is unseen until written, then seen", () => {
    const s = store();
    expect(readTourSeen(s)).toBe(false);
    writeTourSeen(s);
    expect(s.getItem(TOUR_SEEN_KEY)).toBe("true");
    expect(readTourSeen(s)).toBe(true);
  });
  it("never throws when storage is unavailable", () => {
    expect(readTourSeen(null)).toBe(false);
    expect(() => writeTourSeen(null)).not.toThrow();
  });
  it("introduces the header, conversation, and Console", () => {
    expect(TOUR_GROUPS).toEqual(["header", "conversation", "console"]);
  });
});

describe("My AI instrument: the Console and the labels", () => {
  const root = join(__dirname, "..", "..", "..");
  const app = readFileSync(join(root, "src/App.tsx"), "utf8");
  it("opens only routes that exist in App.tsx", () => {
    for (const s of CONSOLE_SUITES) expect(app).toContain(`path="${s.to}"`);
  });
  it("has en / ru / es labels for every string the component uses", () => {
    const source = readFileSync(join(root, "src/components/game/YourAiInstrument.tsx"), "utf8");
    const used = new Set([...source.matchAll(/t\("yourAiInstrument\.([a-zA-Z.]+)"/g)].map((m) => m[1]));
    for (const g of TOUR_GROUPS) used.add(`tour.${g}`);
    for (const lang of ["en", "ru", "es"]) {
      const json = JSON.parse(readFileSync(join(root, `src/locales/${lang}/common.json`), "utf8"));
      for (const k of used) {
        if (k === "turnsRemaining") {
          for (const category of new Intl.PluralRules(lang).resolvedOptions().pluralCategories) {
            expect(json.yourAiInstrument[`turnsRemaining_${category}`]).toContain("{{count}}");
          }
          continue;
        }
        const v = k.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown> | undefined)?.[p], json.yourAiInstrument);
        expect(typeof v, `${lang}: yourAiInstrument.${k}`).toBe("string");
      }
      for (const s of CONSOLE_SUITES) expect(typeof json.aiOsPage.suites[s.category]).toBe("string");
    }
  });
});
