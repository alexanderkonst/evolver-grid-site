import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { closedLine, emptyPlaceSave, placeSaveFromSheet, placeState, type PlaceSave } from "@/lib/placeState";
import {
  JOURNEY_MODULES,
  assetsResultText,
  getJourneyModule,
  isSliceStep,
  isValidRating,
  journeyStepOf,
  moduleClosedLine,
  moduleHasRequirements,
  moduleIntroState,
  moduleResultText,
  qolResultText,
  type ModuleResultSource,
} from "../journeyModules";

/** Same words the place tests ban: nothing a player reads may sound like a barrier (§14.3). */
const barrier = /\b(lock(s|ed|ing)?|gate|access denied|unlock(s|ed|ing)?|coming soon)\b/i;

const saveWith = (done: JourneyItemId[]): PlaceSave =>
  placeSaveFromSheet({ chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })) });

describe("journey modules (WP-5 module form)", () => {
  it("covers J1, J2, J4, J5, J6, J7 and nothing else yet", () => {
    expect(JOURNEY_MODULES.map((m) => m.id)).toEqual([
      "find-top-talent",
      "discover-mission",
      "assess-qol",
      "map-assets",
      "uniqueness-phrase",
      "tagline",
    ]);
  });

  it("every module is a Journey step, or a slice of one, living in a real village place", () => {
    const steps = new Set(JOURNEY_MAIN.map((i) => i.id));
    const places = new Set(VILLAGE_PLACES.map((p) => p.key));
    for (const m of JOURNEY_MODULES) {
      expect(steps.has(journeyStepOf(m.id)), m.id).toBe(true);
      expect(places.has(m.place), m.id).toBe(true);
      expect(getJourneyModule(m.id)).toBe(m);
    }
    expect(getJourneyModule("nope")).toBeUndefined();
  });

  it("the button is the result as a verb, never «Continue»", () => {
    for (const m of JOURNEY_MODULES) {
      expect(m.verb, m.id).not.toMatch(/^(continue|next|go|start|submit)\b/i);
      expect(m.verb.split(/\s+/).length, m.id).toBeLessThanOrEqual(5);
    }
  });

  it("no barrier words in anything a player reads", () => {
    for (const m of JOURNEY_MODULES) {
      const words = [
        m.eyebrow,
        m.headline,
        m.silhouette,
        m.verb,
        m.outro.done,
        m.outro.badge,
        m.outro.livesIn.text,
        m.outro.opened,
        m.outro.fallbackResult,
      ];
      for (const w of words) expect(w, `${m.id}: ${w}`).not.toMatch(barrier);
      expect(moduleClosedLine(m.id), m.id).not.toMatch(barrier);
    }
  });

  it("the Outro eyebrow starts «Done · » and the answer is asked on a 1–10 scale", () => {
    for (const m of JOURNEY_MODULES) expect(m.outro.done, m.id).toMatch(/^Done · \S/);
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(10)).toBe(true);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(11)).toBe(false);
    expect(isValidRating(7.5)).toBe(false);
    expect(isValidRating("7")).toBe(false);
    expect(isValidRating(null)).toBe(false);
  });
});

describe("moduleIntroState", () => {
  it("the first step is open to everyone: the single next move", () => {
    expect(moduleHasRequirements("find-top-talent")).toBe(false);
    expect(moduleIntroState("find-top-talent", emptyPlaceSave())).toBe("next");
  });

  it("a step is closed until what it needs is done, with its «Opens when…» line", () => {
    expect(moduleHasRequirements("discover-mission")).toBe(true);
    expect(moduleIntroState("discover-mission", emptyPlaceSave())).toBe("closed");
    expect(moduleIntroState("assess-qol", saveWith(["find-top-talent"]))).toBe("closed");
    expect(moduleIntroState("map-assets", saveWith(["find-top-talent"]))).toBe("closed");
    for (const id of ["discover-mission", "assess-qol", "map-assets"] as const) {
      expect(moduleClosedLine(id), id).toMatch(/^Opens when .+\. Inside: .+\.$/);
    }
  });

  it("opens, becomes the next move, then is done, following the Journey order", () => {
    expect(moduleIntroState("discover-mission", saveWith(["find-top-talent"]))).toBe("next");
    const afterMission = saveWith(["find-top-talent", "discover-mission"]);
    expect(moduleIntroState("discover-mission", afterMission)).toBe("done");
    expect(moduleIntroState("assess-qol", afterMission)).toBe("next");
    // Assets is open too, but QoL comes first in the Journey, so it is not «next».
    expect(moduleIntroState("map-assets", afterMission)).toBe("open");
    expect(moduleIntroState("assess-qol", saveWith(["find-top-talent", "discover-mission", "assess-qol"]))).toBe("done");
  });

  it("J6 and J7 are slices of build-business: closed until it opens, never next or done on their own", () => {
    for (const id of ["uniqueness-phrase", "tagline"] as const) {
      expect(isSliceStep(id), id).toBe(true);
      expect(journeyStepOf(id), id).toBe("build-business");
      expect(moduleHasRequirements(id), id).toBe(true);
      expect(moduleIntroState(id, emptyPlaceSave()), id).toBe("closed");
      expect(moduleIntroState(id, saveWith(["find-top-talent", "discover-mission"])), id).toBe("closed");
      expect(moduleClosedLine(id), id).toBe(JOURNEY_MAIN.find((i) => i.id === "build-business")?.lockedHint);
      const ready = saveWith(["find-top-talent", "discover-mission", "map-assets"]);
      expect(moduleIntroState(id, ready), id).toBe("open");
      expect(moduleIntroState(id, saveWith(["find-top-talent", "discover-mission", "map-assets", "build-business"])), id).toBe("open");
    }
    expect(isSliceStep("map-assets")).toBe(false);
    expect(journeyStepOf("map-assets")).toBe("map-assets");
  });

  it("the Market opens on a saved offer, which is what J7 saves", () => {
    const market = VILLAGE_PLACES.find((p) => p.key === "market")!;
    const chain = JOURNEY_MAIN.map((i) => ({ id: i.id, done: false }));
    expect(placeState(market, placeSaveFromSheet({ chain, offerSaved: false }))).toBe("closed");
    expect(placeState(market, placeSaveFromSheet({ chain, offerSaved: true }))).not.toBe("closed");
  });

  it("agrees with the village: the closed line is the one the Journey data carries", () => {
    const journeyLine = JOURNEY_MAIN.find((i) => i.id === "discover-mission")?.lockedHint;
    expect(moduleClosedLine("discover-mission")).toBe(journeyLine);
    // and it has the same shape as a village place's closed line
    const house = VILLAGE_PLACES.find((p) => p.key === "house");
    expect(closedLine(house!)).toMatch(/^Opens when /);
  });
});

describe("moduleResultText", () => {
  const sheet = (over: Partial<ModuleResultSource> = {}): ModuleResultSource => ({
    topTalent: null,
    missionTitle: null,
    qol: null,
    assets: { count: 0, top: [] },
    ...over,
  });

  it("is null until the step has a result, so the Outro falls back", () => {
    for (const m of JOURNEY_MODULES) expect(moduleResultText(m.id, sheet()), m.id).toBeNull();
  });

  it("reads each result from the save, in the player's words where there are words", () => {
    expect(moduleResultText("find-top-talent", sheet({ topTalent: "  Pattern Architecting " }))).toBe("Pattern Architecting");
    expect(moduleResultText("discover-mission", sheet({ missionTitle: "Help founders say what they do" }))).toBe(
      "Help founders say what they do",
    );
    expect(moduleResultText("assess-qol", sheet({ qol: { level: 4 } }))).toBe("Level 4 of 10");
    expect(moduleResultText("map-assets", sheet({ assets: { count: 12, top: [] } }))).toBe("12 assets mapped");
  });

  it("counts one asset in the singular and none as nothing", () => {
    expect(assetsResultText(1)).toBe("1 asset mapped");
    expect(assetsResultText(0)).toBeNull();
    expect(qolResultText(10)).toBe("Level 10 of 10");
  });
});

describe("ModuleForm.css", () => {
  const css = readFileSync(new URL("../../components/game/ModuleForm.css", import.meta.url), "utf8");

  it("uses theme tokens only, so every skin (Lunar included) renders both screens", () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\brgba?\(\s*\d/);
    expect(css).not.toMatch(/\bhsla?\(\s*\d/);
    expect(css).not.toMatch(/\b(white|black)\b/);
  });
});
