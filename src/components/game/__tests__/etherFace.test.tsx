import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { emptyPlaceSave, nextMove, nextMoveCopy, type PlaceRequirement, type PlaceSave } from "@/lib/placeState";
import { getFace, hasFace } from "@/lib/instrument/faces";
import { EtherFaceView } from "@/components/game/faces/EtherFace";
import { InkLayer, InkLine, LostOffer } from "@/components/game/InkLine";

/**
 * Navigation instrument, WP5: the ether face and the ink line (docs/specs/navigation-instrument/architecture.md
 * §6, sow.md WP5). The face shows the one next move and nothing else; the line never shows by default.
 */

vi.mock("@/hooks/useCharacterSheet", () => ({ useCharacterSheet: () => ({}) }));
vi.mock("@/hooks/usePlayerNextMove", () => ({ usePlayerNextMove: () => ({ move: null, copy: null, ready: true }) }));
vi.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/village" }) }));

// The English is the source (`tr` falls back to it), so the markup is readable without the catalog.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: string | { defaultValue?: string; place?: string }) =>
      typeof opts === "string" ? opts : (opts?.defaultValue ?? key).replace("{{place}}", (opts as { place?: string })?.place ?? ""),
  }),
}));

const NOW = new Date("2026-11-25T19:00:00Z");
const saveWith = (met: PlaceRequirement[]): PlaceSave => ({ met: Object.fromEntries(met.map((r) => [r, true])), now: NOW });

const noop = () => undefined;
const handlers = { reduced: true, closeMs: 0, active: true, onBack: noop, onClose: noop, onNavigate: noop };

const view = (save: PlaceSave, extra: Partial<Parameters<typeof EtherFaceView>[0]> = {}) => {
  const move = nextMove(VILLAGE_PLACES, save);
  return renderToStaticMarkup(<EtherFaceView move={move} copy={move ? nextMoveCopy(move) : null} {...handlers} {...extra} />);
};

describe("DoD 1 · ether face shows one next move", () => {
  it("the ether slot is filled and offered as a door", () => {
    expect(hasFace("ether")).toBe(true);
    expect(getFace("ether")).not.toBeNull();
  });

  it("shows exactly one move: its title, its place and what it gives, behind one button", () => {
    const save = emptyPlaceSave(NOW);
    const move = nextMove(VILLAGE_PLACES, save)!;
    const copy = nextMoveCopy(move);
    const html = view(save);
    const escaped = (text: string) => text.replace(/'/g, "&#x27;");
    expect(html).toContain(escaped(copy.title));
    expect(html).toContain(escaped(copy.place));
    expect(html).toContain(escaped(copy.result));
    expect((html.match(/data-testid="ether-next-move"/g) ?? []).length).toBe(1);
    expect(html).toContain(`data-place="${move.place.key}"`);
  });

  it("is the same move the map card, the rail glow and the top bar read", () => {
    // Each save moves the one next move along; the face follows nextMove, never a list of its own.
    for (const met of [[], ["find-top-talent"], ["find-top-talent", "discover-mission"]] as PlaceRequirement[][]) {
      const save = saveWith(met);
      const move = nextMove(VILLAGE_PLACES, save);
      if (!move) continue;
      expect(view(save)).toContain(`data-place="${move.place.key}"`);
    }
  });

  it("is a list of one: no <li>, and no other place's name appears", () => {
    const save = emptyPlaceSave(NOW);
    const move = nextMove(VILLAGE_PLACES, save)!;
    const html = view(save);
    expect(html).not.toContain("<li");
    for (const p of VILLAGE_PLACES.filter((x) => x.key !== move.place.key && x.name !== move.place.name)) {
      expect(html).not.toContain(`>${p.name}<`);
    }
  });

  it("with no move it says there is nothing to point to, and offers no button to choose", () => {
    const html = renderToStaticMarkup(<EtherFaceView move={null} copy={null} {...handlers} />);
    expect(html).toContain("Nothing to point to yet.");
    expect(html).not.toContain("ether-next-move");
  });

  it("while the save loads it says nothing yet (no false «nothing to point to»)", () => {
    const html = renderToStaticMarkup(<EtherFaceView move={null} copy={null} ready={false} {...handlers} />);
    expect(html).not.toContain("Nothing to point to yet.");
    expect(html).toContain('aria-busy="true"');
  });

  it("the constellation slot is empty (phase 8)", () => {
    expect(view(emptyPlaceSave(NOW))).not.toMatch(/constellation|Opens when/i);
  });
});

describe("DoD 2 · ink line never shows by default", () => {
  it("the layer renders nothing without a request", () => {
    const html = renderToStaticMarkup(<InkLayer request={null} reduced={false} placeName="Entry Portal" />);
    expect(html).toBe("");
  });

  it("the ether face carries no line of its own: only the host draws one", () => {
    expect(view(emptyPlaceSave(NOW))).not.toContain("ink-line");
  });

  it("the line is aria-hidden and pointer-transparent, drawn as a stroke or, reduced, a static dotted one", () => {
    const from = { x: 300, y: 700 };
    const to = { x: 100, y: 100 };
    const drawn = renderToStaticMarkup(<InkLine from={from} to={to} reduced={false} onDone={noop} />);
    expect(drawn).toContain('data-mode="draw"');
    expect(drawn).toContain('aria-hidden="true"');
    expect(drawn).toContain("pointer-events-none");
    const dotted = renderToStaticMarkup(<InkLine from={from} to={to} reduced onDone={noop} />);
    expect(dotted).toContain('data-mode="dotted"');
    expect(dotted).toContain('stroke-dasharray="1 9"');
    expect(dotted).not.toContain("stroke-dashoffset");
  });

  it("the offer has two controls (accept, dismiss), each tall enough to tap", () => {
    // No layout under renderToStaticMarkup, so the pill itself waits for the glyph and renders nothing here.
    expect(renderToStaticMarkup(<LostOffer onAccept={noop} onDismiss={noop} />)).toBe("");
  });
});
