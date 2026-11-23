import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { MirrorProfileState } from "@/hooks/useMirrorProfile";

const hook = vi.hoisted(() => ({ value: { status: "loading" } as MirrorProfileState }));
vi.mock("@/hooks/useMirrorProfile", () => ({ useMirrorProfile: () => hook.value }));

import MiniTrainingMirror from "../MiniTrainingMirror";

const render = (state: MirrorProfileState) => {
  hook.value = state;
  return renderToStaticMarkup(
    <MemoryRouter>
      <MiniTrainingMirror />
    </MemoryRouter>,
  );
};

// A profile with some empty fields: no mission, no priority area, no weakest area (a tie).
const profileWithGaps: MirrorProfileState = {
  status: "ready",
  userId: "u1",
  profile: {
    firstName: "Mira",
    topTalents: ["Designing Ideals", "Mastering Precision", "Crafting Visions"],
    archetype: "Experience-to-Direction Turning",
    masteryAction: null,
    mission: null,
    priorityArea: null,
    weakestArea: null,
  },
};

describe("mini-training 1 page", () => {
  it("renders all eight micro-modules, with a card for each button (#7 has two)", () => {
    const html = render(profileWithGaps);
    for (let n = 1; n <= 8; n++) expect(html).toContain(`id="module-${n}"`);
    for (const id of ["1", "2", "3", "4", "5", "6", "7a", "7b", "8"]) expect(html).toContain(`data-testid="card-${id}"`);
    expect(html).toContain("You already know your top talents");
    expect(html).toContain("Half an hour ago AI was a random helper");
    expect((html.match(/Read instead/g) ?? []).length).toBe(8);
  });

  it("drops the labels of empty fields and shows the ones it has", () => {
    const html = render(profileWithGaps);
    expect(html).toContain("My name: Mira.");
    expect(html).toContain("My archetype: Experience-to-Direction Turning.");
    expect(html).not.toContain("My mission:");
    expect(html).not.toContain("What I do best:");
    expect(html).not.toContain("My most important life area:");
    expect(html).not.toContain("My weakest life area now:");
  });

  it("has Send, Edit, Microphone and Copy on a card, and no stub notice once live", () => {
    const html = render(profileWithGaps);
    for (const label of ["Send", "Edit", "Microphone", "Copy"]) expect(html).toContain(label);
    expect(html).not.toContain('data-testid="stub-notice"');
  });

  it("#6 asks for step 1 first, and shows [LINE] until a line is tapped", () => {
    const html = render(profileWithGaps);
    expect(html).toContain('data-testid="line-picker"');
    expect(html).toContain("This line would fit anyone: [LINE].");
    expect(html).toContain("Press the button in step 1 first");
  });

  it("shows no video frame while the ids are empty", () => {
    const html = render(profileWithGaps);
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain('data-testid="video-');
  });

  it("starts at 0 of 8 and never says «course»", () => {
    const html = render(profileWithGaps);
    expect(html).toMatch(/0(<!-- -->)? of 8 steps done/);
    expect(html.toLowerCase()).not.toMatch(/\bcourse\b/);
  });

  it("gates a player without a Top Talent: one line, link to the existing reveal, no cards", () => {
    for (const status of ["guest", "no-talent"] as const) {
      const html = render({ status });
      expect(html).toContain('data-testid="mirror-gate"');
      expect(html).toContain('href="/zone-of-genius/entry"');
      expect(html).not.toContain('data-testid="card-');
    }
  });

  it("shows nothing but the title while loading", () => {
    const html = render({ status: "loading" });
    expect(html).not.toContain('data-testid="card-');
    expect(html).not.toContain('data-testid="mirror-gate"');
  });
});
