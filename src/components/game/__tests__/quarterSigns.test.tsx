// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { RAIL_PLACES } from "@/lib/railPlaces";
import { VILLAGE_PLACES } from "@/data/villagePlaces";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve(),
    },
  },
}));
vi.mock("@/components/SoundCloudMinimalPlayer", () => ({ default: () => null }));
vi.mock("@/components/game/MoonMedallion", () => ({ default: () => null }));
vi.mock("@/hooks/useSoulColors", () => ({
  useSoulColors: () => ({ hasSoulColors: false, ringGradient: null, glowColor: null }),
}));
vi.mock("@/contexts/SkinContext", () => ({ useSkin: () => ({ skin: "lunar", setSkin: () => {} }) }));

import SpacesRail from "@/components/game/SpacesRail";
import QuarterSign from "@/components/game/QuarterSign";

const rail = (props: Partial<Parameters<typeof SpacesRail>[0]> = {}) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={["/village"]}>
      <SpacesRail {...props} />
    </MemoryRouter>,
  );

const signs = (html: string) => [...html.matchAll(/<svg[^>]*data-quarter-sign="(\w+)"[^>]*>/g)];

describe("quarter signs (§25.14)", () => {
  it("DoD 1 · each place has one quarter sign", () => {
    // Closed everywhere but the open places: the rail still gives every place exactly one sign.
    const states = VILLAGE_PLACES.map((p) => (p.rule.opens ? ("closed" as const) : ("open" as const)));
    const html = rail({ placeStates: states });
    const chips = [...html.matchAll(/<button[^>]*data-place="([\w-]+)"[^>]*>([\s\S]*?)<\/button>/g)];
    expect(chips.map((m) => m[1])).toEqual(RAIL_PLACES.map((p) => p.key));
    for (const [, key, inner] of chips) {
      const place = VILLAGE_PLACES.find((p) => p.key === key)!;
      const found = signs(inner);
      expect(found, key).toHaveLength(1);
      expect(found[0][1], key).toBe(place.element);
    }
    expect(signs(html)).toHaveLength(RAIL_PLACES.length);
  });

  it("names every sign «<Element> quarter»", () => {
    const html = rail();
    for (const [el, name] of [["ether", "Ether quarter"], ["water", "Water quarter"], ["fire", "Fire quarter"], ["earth", "Earth quarter"]]) {
      expect(html).toContain(`aria-label="${name}"`);
      expect(html).toContain(`data-quarter-sign="${el}"`);
    }
  });

  it("shows a closed quarter as an outline only, and lights it once a place of it is open", () => {
    const closedEarth = VILLAGE_PLACES.map((p) => (p.element === "earth" ? ("closed" as const) : ("open" as const)));
    const html = rail({ placeStates: closedEarth });
    const lit = (el: string) => html.match(new RegExp(`<svg[^>]*data-quarter-sign="${el}"[^>]*data-lit="(\\w+)"`))?.[1];
    expect(lit("earth")).toBe("false");
    expect(lit("air")).toBeUndefined();
    const opened = VILLAGE_PLACES.map((p) => (p.key === "workshop" ? ("open" as const) : p.element === "earth" ? ("closed" as const) : ("open" as const)));
    expect(rail({ placeStates: opened }).match(/data-quarter-sign="earth"[^>]*data-lit="(\w+)"/)?.[1]).toBe("true");
  });

  it("lights nothing while the save loads", () => {
    const html = rail({ placesLoading: true });
    expect(signs(html)).toHaveLength(RAIL_PLACES.length);
    expect(html).not.toContain('data-lit="true"');
  });

  it("is a sign, not a door: no tab stop, no tap, no animation", () => {
    const html = renderToStaticMarkup(<QuarterSign element="fire" lit />);
    expect(html).toContain('role="img"');
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('focusable="false"');
    expect(html).not.toMatch(/tabindex|<animate|animation|onclick/i);
  });

  it("draws a lit solid in full and an unlit one as a faint outline", () => {
    const lit = renderToStaticMarkup(<QuarterSign element="earth" lit />);
    const dim = renderToStaticMarkup(<QuarterSign element="earth" lit={false} />);
    expect(lit).toContain('fill-opacity="0.16"');
    expect(dim).toContain('fill="none"');
    expect(dim).toContain('stroke-opacity="0.55"');
  });
});
