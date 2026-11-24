import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getAllCyclesV2 } from "@/lib/equilibrium-cycles";

// No paid generate-* calls in tests: the Supabase client is a stub that records invokes.
const invoke = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));

import { SynthesisCard } from "../components/SynthesisCard";

const cycles = getAllCyclesV2(new Date(2026, 10, 21, 16, 38).getTime(), "1985-01-04");
const base = {
  cycles, mission: null, role: null, moonFocus: null, onPersist: () => {},
};
const staleAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

describe("SynthesisCard (#415: generation is user-initiated)", () => {
  it("shows the cached reading, even a stale one, with an explicit refresh button", () => {
    const html = renderToStaticMarkup(
      <SynthesisCard {...base} cachedReading="Gathering energy — Saturday." cachedAt={staleAt} />,
    );
    expect(html).toContain("Gathering energy — Saturday.");
    expect(html).toContain("Refresh reading");
    expect(invoke).not.toHaveBeenCalled();
  });

  it("with no cache shows a «Generate reading» button and does not call the edge function", () => {
    const html = renderToStaticMarkup(<SynthesisCard {...base} cachedReading={null} cachedAt={null} />);
    expect(html).toContain("Generate reading");
    expect(invoke).not.toHaveBeenCalled();
  });
});
