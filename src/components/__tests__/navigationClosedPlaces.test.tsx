// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { RAIL_PLACES } from "@/lib/railPlaces";

/**
 * Issue #443 wave 3 (items 3 and 4), the top bar: a closed place is a focusable `aria-disabled`
 * button (never `disabled`, never a dead span), and the place the player stands in is current,
 * never locked.
 */
vi.mock("@/hooks/usePlaceStates", () => ({
  usePlaceStates: () => ({ states: RAIL_PLACES.map(() => "closed"), ready: true }),
}));

import Navigation from "@/components/Navigation";

const render = (path: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Navigation />
    </MemoryRouter>,
  );

describe("Navigation, closed places", () => {
  it("renders every closed place as a focusable aria-disabled button, not `disabled`", () => {
    const html = render("/village");
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons.length).toBe(RAIL_PLACES.length);
    for (const b of buttons) {
      expect(b).toContain('aria-disabled="true"');
      expect(b).not.toMatch(/\sdisabled(=|\s|>)/);
      expect(b).toContain("title=");
    }
  });

  it("renders the place the player is in as a current link, not a locked button", () => {
    const place = RAIL_PLACES.find((p) => p.key === "workshop")!;
    const html = render(place.to);
    const current = html.match(new RegExp(`<a[^>]*href="${place.to}"[^>]*>`));
    expect(current?.[0]).toContain('aria-current="page"');
    expect((html.match(/<button[^>]*>/g) ?? []).length).toBe(RAIL_PLACES.length - 1);
  });
});
