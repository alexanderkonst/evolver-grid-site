import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";

/**
 * W1 (docs/specs/cult/cult_spec.md §5 #1–3): the strings that break the spell for a guest in
 * the first ten minutes. The first half scans the catalog of every guest-facing screen in
 * en/es/ru; the second half pins the code that used to put them on screen.
 */

type Tree = { [key: string]: Tree | string | unknown };

const catalogs: Record<string, Tree> = { en, es, ru };

/** Spell-breakers in the three languages. */
const SPELL_BREAKERS: Record<string, RegExp> = {
  price: /\$\s?\d|\d\s?(USD|usd|MXN)\b/,
  "Genius Business": /genius business/i,
  "profile for matching": /profile for matching|perfil para (el )?(matchmaking|emparejamiento)|профиль для (метчинга|матчинга)/i,
};

/** Key paths a guest meets before a character is saved: the village, Reception and its gate. */
const GUEST_NAMESPACES = [
  "village",
  "zogEntry",
  "journeySteps",
  "rail.journey.quizStep0",
  "rail.journey.startHere",
];

/** zogEntry keys that belong to the build path (`?path=build`), a pre-game landing kept by §14.13. */
const GUEST_EXEMPT = [/^zogEntry\.build/i];

const get = (tree: Tree, path: string): unknown =>
  path.split(".").reduce<unknown>((node, key) => (node && typeof node === "object" ? (node as Tree)[key] : undefined), tree);

const strings = (node: unknown, path: string): [string, string][] => {
  if (typeof node === "string") return [[path, node]];
  if (node && typeof node === "object") {
    return Object.entries(node as Tree).flatMap(([key, value]) => strings(value, `${path}.${key}`));
  }
  return [];
};

describe("W1 · spell-breakers on guest-facing screens (en/es/ru)", () => {
  for (const [locale, tree] of Object.entries(catalogs)) {
    for (const [name, pattern] of Object.entries(SPELL_BREAKERS)) {
      it(`${locale}: no «${name}» in the guest catalog`, () => {
        const hits = GUEST_NAMESPACES.flatMap((ns) => strings(get(tree, ns), ns))
          .filter(([key]) => !GUEST_EXEMPT.some((re) => re.test(key)))
          .filter(([, text]) => pattern.test(text))
          .map(([key, text]) => `${key}: ${text}`);
        expect(hits).toEqual([]);
      });
    }

    it(`${locale}: Reception speaks the village line`, () => {
      const line = get(tree, "zogEntry.receptionLine");
      expect(typeof line).toBe("string");
      expect((line as string).length).toBeGreaterThan(10);
      expect(get(tree, "zogEntry.matchPreambleLine1")).toBeUndefined();
      expect(get(tree, "zogEntry.matchPreambleLine2")).toBeUndefined();
      expect(get(tree, "zogEntry.matchPreambleLine3")).toBeUndefined();
    });
  }

  it("the guest catalog scan really matches the strings it guards", () => {
    expect(SPELL_BREAKERS.price.test("Activate — $37")).toBe(true);
    expect(SPELL_BREAKERS.price.test("Aprovecha — $37")).toBe(true);
    expect(SPELL_BREAKERS["Genius Business"].test("Check out my Genius Business")).toBe(true);
    expect(SPELL_BREAKERS["profile for matching"].test("Let's create your profile for matching.")).toBe(true);
    expect(SPELL_BREAKERS["profile for matching"].test("Vamos a crear tu perfil para el matchmaking.")).toBe(true);
    expect(SPELL_BREAKERS["profile for matching"].test("Давайте создадим ваш профиль для метчинга.")).toBe(true);
  });
});

describe("W1 · the code that used to show them", () => {
  const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

  it("the guided-test layout carries the game frame, not the Genius Business logo", () => {
    const layout = source("src/modules/zone-of-genius/ZoneOfGeniusAssessmentLayout.tsx");
    expect(layout).not.toMatch(/ignite-logo/);
    expect(layout).not.toMatch(/alt="Genius Business"/);
    expect(layout).toMatch(/you-be-original-main-lockup/);
  });

  it("Reception no longer reads the «profile for matching» preamble", () => {
    const entry = source("src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx");
    expect(entry).not.toMatch(/matchPreamble/);
    expect(entry).toMatch(/zogEntry\.receptionLine/);
  });

  it("W5: the guest's email field opens only after the reveal card, on tap", () => {
    const keep = source("src/components/game/KeepItLit.tsx");
    // The form is mounted only once `open` is true; the first paint is a button.
    expect(keep).toMatch(/if \(open\)/);
    expect(keep).toMatch(/useState\(false\)/);
    for (const file of [
      "src/modules/zone-of-genius/ZoneOfGeniusEntry.tsx",
      "src/modules/zone-of-genius/Step4GenerateSnapshot.tsx",
    ]) {
      const text = source(file);
      expect(text, file).toMatch(/<KeepItLit/);
      expect(text, file).not.toMatch(/<TopTalentAuthGate/);
    }
  });

  it("W5: the keep-it-lit and next-move copy never says «window» (out of scope, held by Sasha)", () => {
    const WINDOW = /window|ventana|окн[оаые]/i;
    for (const [locale, tree] of Object.entries(catalogs)) {
      const keys = [
        "zogEntry.saveCharacterModalTitle",
        "zogEntry.keepLitBody",
        "zogEntry.keepLitButton",
        "zogEntry.keepLitHint",
        "zogEntry.keepLitNotNow",
        "zogEntry.keepLitSent",
        "village.saveCharacter",
        "village.saveResult",
      ];
      for (const key of keys) {
        const text = get(tree, key);
        expect(typeof text, `${locale} ${key}`).toBe("string");
        expect(text as string, `${locale} ${key}`).not.toMatch(WINDOW);
      }
    }
  });

  it("W2: rail, Home, Reception and the card all read the one displayName()", () => {
    for (const file of [
      "src/components/game/GameShellV2.tsx",
      "src/pages/spaces/sections/ProfileOverview.tsx",
      "src/pages/Village.tsx",
      "src/hooks/useShareIdentity.ts",
      "src/components/game/MyStall.tsx",
    ]) {
      expect(source(file), file).toMatch(/from "@\/lib\/displayName"/);
    }
    // No surface keeps its own «guest» word for a signed-in or signed-out player.
    expect(source("src/data/villagePlaces.ts")).not.toMatch(/Welcome, guest/);
  });

  it("the $37 power-up row on the rail waits for a signed-in player", () => {
    const rail = source("src/components/game/SectionsPanel.tsx");
    expect(rail).toMatch(/signedIn && !activationRow\.locked/);
    // The route itself stays reachable (§14.13).
    expect(source("src/App.tsx")).toMatch(/\/activate-top-talent/);
  });
});
