import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));

const locales = (l: string) => JSON.parse(readFileSync(join(__dirname, `../../../../locales/${l}/common.json`), "utf8"));
const lookup = (tree: unknown, key: string): string =>
  key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], tree) as string;
let lang = "en";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, string | number>) =>
      (lookup(locales(lang), key) ?? key).replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars?.[k] ?? "")),
  }),
}));

import { chainWith } from "@/lib/console/__tests__/fixtures";
import { CONSOLE_BUTTONS, writeChain, type ButtonId } from "@/lib/console/phoenixChain";
import ConsolePanel from "../ConsolePanel";

const stubStorage = () => {
  const m = new Map<string, string>();
  vi.stubGlobal("window", { sessionStorage: { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } });

};
afterEach(() => {
  vi.unstubAllGlobals();
});

const render = (language: string, owner = "u1") => {
  lang = language;
  return renderToStaticMarkup(
    <ConsolePanel ownerId={owner} language={language} messages={[]} getPlayerCard={() => null} onAskGoal={() => {}} onOpenConversation={() => {}} />,
  );
};
const state = (html: string, n: ButtonId) => html.match(new RegExp(`data-testid="console-button-${n}" data-state="(\\w+)"`))?.[1];
const decode = (s: string) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

describe("Console panel", () => {
  it("DoD 1 · five buttons, each label is the result it gives, in en/es/ru", () => {
    stubStorage();
    for (const language of ["en", "es", "ru"] as const) {
      const html = decode(render(language));
      for (const b of CONSOLE_BUTTONS) expect(html).toContain(b.label[language]);
    }
  });

  it("DoD 4 · a fresh chain: button 1 is open, 2 to 5 are locked and each shows «Opens when… Inside…»", () => {
    stubStorage();
    const html = decode(render("en"));
    expect([1, 2, 3, 4, 5].map((n) => state(html, n as ButtonId))).toEqual(["open", "locked", "locked", "locked", "locked"]);
    expect(html).toContain("Opens when you have your goal. Inside: the case for it, with its risks.");
    for (const n of ["3", "4", "5"]) expect(html).toContain(locales("en").yourAiConsole.locked[n]);
    // A locked button is not a button: nothing to press before its time.
    expect((html.match(/<button/g) ?? []).length).toBe(1);
  });

  it("DoD 4 · after a fresh mount with card 1 saved in the session, button 2 opens and 3 to 5 stay locked; card 1 shows with copy, re-run and Next", () => {
    stubStorage();
    writeChain("u1", chainWith(1));
    const html = decode(render("en"));
    expect([1, 2, 3, 4, 5].map((n) => state(html, n as ButtonId))).toEqual(["done", "open", "locked", "locked", "locked"]);
    expect(html).toContain("Launch my first paid cohort.");
    expect(html).toContain("Copy");
    expect(html).toContain("Run again");
    expect(html).toContain("Next: The case for your goal, with its risks");
    expect(html).toContain("Read all");
    expect(html).not.toContain('"goal"'); // never raw JSON
  });

  it("card 5 offers «Next: <label of button 1>» (the loop)", () => {
    stubStorage();
    writeChain("u1", chainWith(1, 2, 3, 4, 5));
    const html = decode(render("en"));
    expect([1, 2, 3, 4, 5].map((n) => state(html, n as ButtonId))).toEqual(["done", "done", "done", "done", "done"]);
    expect(html).toContain("Next: Your goal, clear and grounded");
  });

  it("another player on the same browser sees a fresh chain", () => {
    stubStorage();
    writeChain("u1", chainWith(1, 2));
    expect(state(render("en", "u2"), 2)).toBe("locked");
  });
});
