import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { getAllCyclesV2, PLANETARY_DAYS } from "@/lib/equilibrium-cycles";
import { BiologicClockFace } from "../BiologicClock";

// English fallbacks, with the {{vars}} filled like i18next does.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, unknown>) =>
      String(opts?.defaultValue ?? "").replace(/\{\{(\w+)\}\}/g, (_m, k: string) => String(opts?.[k])),
  }),
}));

// The connected wrapper reads Supabase; these tests drive the drawing (BiologicClockFace) directly.
vi.mock("@/modules/equilibrium/hooks/useEquilibriumV2", () => ({ useEquilibriumV2: () => ({ birthday: null, loading: false }) }));

// Saturday 2026-11-21, 16:38 local (the issue's America/Mazatlan example), built in local time so the
// test holds in any zone. Birthday 1985-01-04 (Sasha's): the year is ≈ 88% lived.
const NOW = new Date(2026, 10, 21, 16, 38).getTime();
const BIRTHDAY = "1985-01-04";

const render = (birthday: string | null, extra: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <BiologicClockFace cycles={getAllCyclesV2(NOW, birthday ?? undefined)} nowMs={NOW} birthday={birthday} {...extra} />
    </MemoryRouter>,
  );

describe("BiologicClock (A9, #377): four rings from one engine", () => {
  it("renders Year, Moon, Week, Day and the centre moon", () => {
    const html = render(BIRTHDAY);
    for (const ring of ["year", "moon", "week", "day", "centre"]) {
      expect(html).toContain(`data-ring="${ring}"`);
    }
    expect(html.match(/data-ring="(year|moon|week|day)"/g)).toHaveLength(4);
  });

  it("week: seven planet segments Monday→Sunday, Saturday lit", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-week-segment=/g)).toHaveLength(7);
    for (const d of PLANETARY_DAYS) expect(html).toContain(d.symbol);
    expect(html).toMatch(/data-week-segment="5" class="bio-clock__seg is-today"/);
    // Mon–Fri are past, Sunday is still to come
    expect(html.match(/bio-clock__seg is-past/g)).toHaveLength(5);
  });

  it("moon: eight moons, tonight's is segment 3 and the larger one", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-moon-segment=/g)).toHaveLength(8);
    expect(html).toMatch(/data-moon-segment="3" class="bio-clock__moon is-tonight"/);
    expect(html.match(/bio-clock__moon is-past/g)).toHaveLength(3);
    expect(html).toContain('data-moon="3"');
  });

  it("year: ≈ 0.88 lived, birthday dot and now arrow, four quarter arcs", () => {
    const html = render(BIRTHDAY);
    const year = Number(/data-year="([\d.]+)"/.exec(html)?.[1]);
    expect(year).toBeGreaterThan(0.87);
    expect(year).toBeLessThan(0.89);
    expect(html).toContain("bio-clock__birthday");
    expect(html).toContain("bio-clock__arrow");
    expect(html.match(/class="bio-clock__quarter"/g)).toHaveLength(4);
    expect(html).not.toContain('href="/build/equilibrium"');
  });

  it("day: the Sun sits at local time / 24h", () => {
    const a = ((16 * 60 + 38) / 1440) * 2 * Math.PI - Math.PI / 2;
    const [x, y] = [100 + 43 * Math.cos(a), 100 + 43 * Math.sin(a)].map((n) => n.toFixed(2));
    expect(render(BIRTHDAY)).toContain(`bio-clock__sunglow" cx="${x}" cy="${y}"`);
  });

  it("has one aria-label that sums up all four rings, and no text on the dial but the glyphs", () => {
    const html = render(BIRTHDAY);
    expect(html).toMatch(/aria-label="Year 88% lived, 43 days to your birthday · Waxing Gibbous · Saturday, Saturn · 31% of today left"/);
    expect(html.match(/<title>/g)).toHaveLength(5); // year, moon, week, day, centre
    const texts = [...html.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    expect(texts).toEqual(PLANETARY_DAYS.map((d) => d.symbol));
  });

  it("a guest (no birthday) sees real day/week/moon and an empty year track linking to Equilibrium", () => {
    const html = render(null);
    expect(html).toContain('href="/build/equilibrium"');
    expect(html).toContain("Add your birthday to see your year");
    expect(html).not.toContain("bio-clock__birthday");
    expect(html).not.toContain("bio-clock__arrow");
    expect(html).toMatch(/data-week-segment="5" class="bio-clock__seg is-today"/);
    expect(html).toMatch(/data-moon-segment="3" class="bio-clock__moon is-tonight"/);
  });

  it("while the birthday is still loading the empty track has no link", () => {
    expect(render(null, { birthdayLoading: true })).not.toContain('href="/build/equilibrium"');
  });
});
