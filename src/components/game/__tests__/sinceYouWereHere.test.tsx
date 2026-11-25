import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SinceYouWereHere from "@/components/game/SinceYouWereHere";
import { MAX_HOUSE_CHANGES, sinceYouWereHere } from "@/lib/instrument/glint";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import type { PlaceRequirement, PlaceSave } from "@/lib/placeState";

/**
 * Navigation instrument, WP6: Your House lists "since you were here" (sow.md WP6, #451).
 * The view is a list of at most three lines, each a link to its place, and nothing at all when nothing changed.
 */

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string, opts?: { defaultValue?: string }) => (key === "characterSheet.since.title" ? "Since you were here" : (opts?.defaultValue ?? key)) }),
}));

const NOW = new Date("2026-11-25T19:00:00Z");
const saveWith = (met: PlaceRequirement[]): PlaceSave => ({ met: Object.fromEntries(met.map((r) => [r, true])), now: NOW });
const render = (changes: Parameters<typeof SinceYouWereHere>[0]["changes"]) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <SinceYouWereHere changes={changes} />
    </MemoryRouter>,
  );

describe("DoD 4 · Your House lists 'since you were here' changes", () => {
  it("DoD 4 · lists each change as a link to its place, under the title", () => {
    const changes = sinceYouWereHere(VILLAGE_PLACES, new Set(VILLAGE_PLACES.map((p) => p.key).filter((k) => k !== "academy")), saveWith(["find-top-talent", "take-playbook"]));
    expect(changes.map((c) => c.key)).toEqual(["academy"]);
    const html = render(changes);
    expect(html).toContain("Since you were here");
    expect(html).toContain(`href="${changes[0].to}"`);
    expect(html).toContain(changes[0].line);
    expect(html.match(/<li /g)).toHaveLength(1);
  });

  it("DoD 4 · at most three lines, however much opened", () => {
    const changes = sinceYouWereHere(VILLAGE_PLACES, new Set(), saveWith(["find-top-talent", "take-playbook", "discover-mission", "map-assets", "offer-saved"]));
    expect(changes).toHaveLength(MAX_HOUSE_CHANGES);
    expect(render(changes).match(/<li /g)).toHaveLength(MAX_HOUSE_CHANGES);
  });

  it("DoD 4 · nothing changed renders nothing: no title, no filler", () => {
    expect(render([])).toBe("");
  });

  it("DoD 4 · Your House renders the list from its own hook, and the three locales carry the keys", () => {
    const house = readFileSync("src/pages/spaces/sections/ProfileOverview.tsx", "utf8");
    expect(house).toContain("useSinceYouWereHere(sheet.userId, save)");
    expect(house).toContain("<SinceYouWereHere changes={sinceChanges} />");
    for (const lang of ["en", "es", "ru"]) {
      const json = JSON.parse(readFileSync(`src/locales/${lang}/common.json`, "utf8"));
      expect(json.characterSheet.since.title, lang).toBeTruthy();
      expect(json.instrument.glint.label, lang).toBeTruthy();
    }
  });
});
