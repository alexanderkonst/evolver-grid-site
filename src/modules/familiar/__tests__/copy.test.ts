import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import en from "@/locales/en/common.json";

/**
 * Every `t("familiar.…")` in the module must have its English in the catalog, so a typo in a key
 * fails here instead of quietly showing the default. (Template-literal keys are checked by the
 * parts they are built from.)
 */
const root = new URL("../", import.meta.url);

const sources = (dir: URL): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "__tests__") return [];
    const child = new URL(e.name + (e.isDirectory() ? "/" : ""), dir);
    return e.isDirectory() ? sources(child) : /\.tsx?$/.test(e.name) ? [readFileSync(child, "utf8")] : [];
  });

const lookup = (path: string): unknown => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], en);

describe("My AI copy", () => {
  const code = sources(root).join("\n");
  const keys = [...code.matchAll(/\bt\(\s*"(familiar\.[A-Za-z0-9.]+)"/g)].map((m) => m[1]);

  it("finds the keys it is meant to check", () => {
    expect(keys.length).toBeGreaterThan(15);
  });

  it("has every key in the English catalog, as a string", () => {
    for (const k of new Set(keys)) expect(typeof lookup(k), k).toBe("string");
  });

  it("has the dynamic gift and example keys", () => {
    for (const k of ["knowsYou", "activated", "knowsYourWork"]) expect(typeof lookup(`familiar.gift.${k}`), k).toBe("string");
  });

  it("carries no comparison or rating copy, and no retired screens", () => {
    const f = lookup("familiar") as Record<string, unknown>;
    for (const k of ["intro", "ask", "reveal"]) expect(f[k], k).toBeUndefined();
    expect(JSON.stringify(f)).not.toMatch(/both answers|same model|notice the difference|1 to 10|of 10/i);
  });

  it("keeps a space before the gift chip parenthetical", () => {
    const g = lookup("familiar.gifts") as Record<string, string>;
    for (const k of ["lit", "dim"]) expect(g[k], k).toMatch(/^\(/);
    expect(readFileSync(new URL("GiftChips.tsx", root), "utf8")).toMatch(/\{" "\}\s*<span className="sr-only">/);
  });

  it("names the place «My AI» in the village catalog", () => {
    expect(lookup("village.place.oracle.name")).toBe("My AI");
  });

  it("uses no em or en dashes in what a player reads", () => {
    const strings: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") strings.push(v);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk((en as Record<string, unknown>).familiar);
    for (const s of strings) expect(s, s).not.toMatch(/[—–]/);
  });
});
