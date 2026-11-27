/**
 * WP7 step 3b: the first reveal is wired into the shell and the village map, once, never before the top
 * talent result. No jsdom here, so first paint is checked with a server render (effects do not run) and the
 * mounting with the source of the two hosts.
 */
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) }) },
}));

import { InstrumentRevealGate, useInstrumentReveal, REVEAL_SETTLE_MS, type InstrumentRevealInput } from "@/lib/instrument/useInstrumentReveal";
import { useLitSeen } from "@/lib/instrument/litSeenStore";
import { REVEAL_STEPS, isRevealDue, revealLineKey, REVEAL_CONTINUE_KEY, REVEAL_OPENS_ON_PATH_KEY } from "@/lib/instrument/reveal";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";

const dueEverything: InstrumentRevealInput = { enabled: true, ownerId: null, profileCreated: true, topTalentDone: true };

const render = (node: React.ReactElement, path = "/village") => renderToStaticMarkup(<MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>);

describe("first paint", () => {
  it("renders nothing in the render that mounts it, even when everything is due", () => {
    expect(render(<InstrumentRevealGate {...dueEverything} />)).toBe("");
  });

  it("the hook starts not playing, with a rest before it can", () => {
    const Probe = () => <i>{String(useInstrumentReveal(dueEverything).playing)}</i>;
    expect(render(<Probe />)).toBe("<i>false</i>");
    expect(REVEAL_SETTLE_MS).toBeGreaterThan(0);
  });

  it("a signed-in save counts as not read yet at first paint; a guest has nothing to wait for", () => {
    const Probe = ({ ownerId }: { ownerId: string | null }) => <i>{String(useLitSeen(ownerId)[2])}</i>;
    expect(render(<Probe ownerId="user-1" />)).toBe("<i>false</i>");
    expect(render(<Probe ownerId={null} />)).toBe("<i>true</i>");
  });
});

describe("once, and never before the top talent result", () => {
  const base = { profileCreated: true, topTalentDone: true, seen: {}, seenLoaded: true, calm: true, playing: false };
  it("is due only with a profile and a top talent result", () => {
    expect(isRevealDue(base)).toBe(true);
    expect(isRevealDue({ ...base, topTalentDone: false })).toBe(false);
    expect(isRevealDue({ ...base, profileCreated: false })).toBe(false);
  });
  it("is not due again once the air entry is recorded, nor before the save is read", () => {
    expect(isRevealDue({ ...base, seen: { air: true } })).toBe(false);
    expect(isRevealDue({ ...base, seenLoaded: false })).toBe(false);
  });
});

describe("mounted in the shell and the village map, and nowhere else", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  const shell = read("src/components/game/GameShellV2.tsx");
  const village = read("src/pages/Village.tsx");

  it("is mounted once in the shell and once in the village map, not behind the glyph's gate", () => {
    expect(shell.match(/<InstrumentRevealGate/g)).toHaveLength(1);
    expect(village.match(/<InstrumentRevealGate/g)).toHaveLength(1);
    expect(shell).toContain("topTalentDone={topTalentComplete}");
    expect(village).toContain("topTalentDone={!!sheet.topTalent}");
    // Not tied to the glyph's gate: right after the top talent result, the crystal settles to where the glyph will be.
    expect(shell).toMatch(/<InstrumentRevealGate\s+enabled\s/);
    expect(village).toMatch(/<InstrumentRevealGate\s+enabled=\{!introOn\}/);
    expect(shell).not.toMatch(/<InstrumentRevealGate\s+enabled=\{tmaComplete/);
  });

  it("is not mounted by the title, the game intro, the talent reveal or a theme", () => {
    for (const f of ["src/pages/Index.tsx", "src/pages/IntroSequence.tsx", "src/components/game/IntroSequence.tsx"]) {
      try {
        expect(read(f)).not.toContain("InstrumentRevealGate");
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      }
    }
    expect(read("src/lib/instrument/useInstrumentReveal.tsx")).toContain("isCalmMoment");
  });
});

describe("en / es / ru", () => {
  const keys = [...REVEAL_STEPS.map(revealLineKey), REVEAL_CONTINUE_KEY, REVEAL_OPENS_ON_PATH_KEY];
  const at = (bundle: unknown, key: string): unknown =>
    key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), bundle);
  it.each([
    ["en", en],
    ["es", es],
    ["ru", ru],
  ])("%s has every reveal string", (_l, bundle) => {
    for (const k of keys) expect(at(bundle, k), k).toBeTruthy();
  });
});
