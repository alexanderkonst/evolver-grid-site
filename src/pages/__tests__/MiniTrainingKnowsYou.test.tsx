import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { MirrorProfileState } from "@/hooks/useMirrorProfile";

const hook = vi.hoisted(() => ({ value: { status: "loading" } as MirrorProfileState }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
vi.mock("@/hooks/useMirrorProfile", () => ({ useMirrorProfile: () => hook.value }));

import MiniTrainingKnowsYou from "../MiniTrainingKnowsYou";

const render = (state: MirrorProfileState) => {
  hook.value = state;
  return renderToStaticMarkup(
    <MemoryRouter>
      <MiniTrainingKnowsYou />
    </MemoryRouter>,
  );
};

// A profile with gaps: no mission, no priority area.
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

describe("mini-training 2 page", () => {
  it("renders all seven micro-modules, with a card for each button (#1 and #6 have two, #7 copies)", () => {
    const html = render(profileWithGaps);
    for (let n = 1; n <= 7; n++) expect(html).toContain(`id="module-${n}"`);
    for (const id of ["1a", "1b", "2", "3", "4", "5", "6a", "6b", "7"]) expect(html).toContain(`data-testid="card-${id}"`);
    expect(html).toContain("In the last mini-training, AI got to know you through the game");
    expect(html).toContain("Half an hour ago a new AI met you as a stranger");
    expect((html.match(/Read instead/g) ?? []).length).toBe(7);
  });

  it("fills the profile after a colon and drops empty labels; #1b falls back to talents", () => {
    const html = render(profileWithGaps);
    expect(html).toContain("My top talents: Designing Ideals, Mastering Precision, Crafting Visions. Now give me advice for my week.");
    expect(html).toContain("My archetype: Experience-to-Direction Turning.");
    expect(html).not.toContain("My mission:");
    expect(html).not.toContain("My most important life area:");
    expect(html).not.toContain("My plan:");
  });

  it("#5 waits for the person's own words; #6 waits for a saved profile", () => {
    const html = render(profileWithGaps);
    expect(html).toContain("Here is something I want: (say it).");
    expect(html).toContain("Press the microphone and say what you want");
    expect(html).toContain("Save your profile in step 3 first");
  });

  it("shows no video while there is none, and starts at 0 of 7", () => {
    const html = render(profileWithGaps);
    expect(html).not.toContain('data-testid="video-');
    expect(html).not.toContain("youtube");
    expect(html).toMatch(/0(<!-- -->)? of (<!-- -->)?7(<!-- -->)? steps done/);
    expect(html.toLowerCase()).not.toMatch(/\bcourse\b/);
  });

  it("ends with the profile slot and the way back to My AI", () => {
    const html = render(profileWithGaps);
    expect(html).toContain('data-testid="no-profile-yet"');
    expect(html).toContain('href="/game/your-ai"');
    expect(html).toContain("Keep talking in My AI");
  });

  it("gates a player without a Top Talent: link to the existing reveal, no cards", () => {
    for (const status of ["guest", "no-talent"] as const) {
      const html = render({ status });
      expect(html).toContain('data-testid="knows-you-gate"');
      expect(html).toContain('href="/zone-of-genius/entry"');
      expect(html).not.toContain('data-testid="card-');
    }
  });

  it("shows nothing but the title while loading", () => {
    const html = render({ status: "loading" });
    expect(html).not.toContain('data-testid="card-');
    expect(html).not.toContain('data-testid="knows-you-gate"');
  });
});
