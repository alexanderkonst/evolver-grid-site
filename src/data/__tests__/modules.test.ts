import { describe, expect, it } from "vitest";
import {
  getModuleBySlug,
  getModulesByCategory,
  getRegistryModule,
  moduleOwner,
  moduleReferralParam,
  moduleSource,
  modules,
} from "@/data/modules";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { COURSE_SALES } from "@/data/courseSales";

describe("module registry (Module 2 · L2)", () => {
  it("every module id is unique", () => {
    const ids = modules.map((m) => m.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("every module slug is unique", () => {
    const slugs = modules.map((m) => m.slug);
    expect(slugs.filter((s, i) => slugs.indexOf(s) !== i)).toEqual([]);
  });

  it("every place is a valid VillagePlaceKey", () => {
    const keys = VILLAGE_PLACES.map((p) => p.key);
    for (const m of modules) {
      if (m.place !== undefined) expect(keys, `${m.slug}.place`).toContain(m.place);
    }
  });

  it("partner fields are filled: ours are owner evolver, source internal, no integration level", () => {
    for (const m of modules) {
      expect(m.owner, m.slug).toBe("evolver");
      expect(m.source, m.slug).toBe("internal");
      expect(m.integrationLevel, m.slug).toBeUndefined();
    }
  });

  it("defaults apply to a module that leaves the partner fields out", () => {
    const bare = { id: "x", title: "x", slug: "x", category: "LEARN", tagline: "", status: "Live", description: "" } as const;
    expect(moduleOwner(bare)).toBe("evolver");
    expect(moduleSource(bare)).toBe("internal");
    expect(moduleReferralParam(bare)).toBe("ref");
    expect(moduleReferralParam({ ...bare, referralParam: "via" })).toBe("via");
  });

  it("the landing page still lists exactly the ten modules it listed before the registry grew", () => {
    expect(getModulesByCategory("ALL").map((m) => m.slug)).toEqual([
      "destiny",
      "genius-layer-matching",
      "genius-offer",
      "intelligence-boost-for-your-ai-model",
      "mens-circle",
      "quality-of-life-map",
      "zone-of-genius",
      "intelligences",
      "heartcraft-game",
      "integral-mystery-school",
    ]);
    // Registry-only modules are not reachable through the landing-page lookups.
    expect(getModuleBySlug("founder-academy")).toBeUndefined();
    expect(getRegistryModule("founder-academy")).toBeDefined();
  });

  it("every Academy course sales page has a registry entry in the Academy", () => {
    for (const c of COURSE_SALES) {
      expect(getRegistryModule(c.slug)?.place, c.slug).toBe("academy");
    }
  });
});
