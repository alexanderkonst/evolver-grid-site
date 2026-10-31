import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ACTION_REVEAL, MAX_BUTTONS, YOUR_AI_CATALOG, catalogForPrompt, validateButtons } from "../yourAiCatalog";

describe("yourAiCatalog", () => {
  it("has unique ids and a label for each entry", () => {
    const ids = YOUR_AI_CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of YOUR_AI_CATALOG) expect(e.label.trim()).not.toBe("");
  });

  it("maps every non-action entry to a route declared in App.tsx", () => {
    const app = readFileSync(resolve(__dirname, "../../App.tsx"), "utf8");
    // Declared paths; `:param` segments match any single segment (e.g. /library/:stepId).
    const patterns = [...app.matchAll(/path="([^"]+)"/g)].map(
      (m) => new RegExp(`^${m[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:[A-Za-z]+/g, "[^/]+")}$`),
    );
    for (const e of YOUR_AI_CATALOG) {
      if (e.kind === "action") {
        expect(e.to).toBeUndefined();
        continue;
      }
      expect(e.to, e.id).toBeTruthy();
      expect(
        patterns.some((p) => p.test(e.to as string)),
        `${e.id} -> ${e.to}`,
      ).toBe(true);
    }
  });

  it("validates: drops unknown ids, dedupes, caps at primary + two secondary", () => {
    const out = validateButtons(["route:mission", "nope", "route:mission", "route:qol", "route:assets", "route:library"]);
    expect(out.map((b) => b.id)).toEqual(["route:mission", "route:qol", "route:assets"]);
    expect(out).toHaveLength(MAX_BUTTONS);
    expect(validateButtons(undefined)).toEqual([]);
    expect(validateButtons({ id: "route:mission" })).toEqual([]);
  });

  it("can restrict to an allowed set", () => {
    expect(validateButtons([ACTION_REVEAL, "route:mission"], new Set(["route:mission"])).map((b) => b.id)).toEqual(["route:mission"]);
  });

  it("lists every id for the model", () => {
    const text = catalogForPrompt();
    for (const e of YOUR_AI_CATALOG) expect(text).toContain(e.id);
  });
});
