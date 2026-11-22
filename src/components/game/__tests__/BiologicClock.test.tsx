import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { getAllCyclesV2, MOON_PHASES, PLANETARY_DAYS } from "@/lib/equilibrium-cycles";
import { BiologicClockFace, formatTimeLeft, moonMeaning, phaseWord } from "../BiologicClock";

// English fallbacks, with the {{vars}} filled like i18next does.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, unknown>) =>
      String(opts?.defaultValue ?? "").replace(/\{\{(\w+)\}\}/g, (_m, k: string) => String(opts?.[k])),
  }),
}));

// The connected wrapper reads Supabase; these tests drive the view (BiologicClockFace) directly.
vi.mock("@/modules/equilibrium/hooks/useEquilibriumV2", () => ({
  useEquilibriumV2: () => ({ birthday: null, loading: false, user: null, refresh: async () => {} }),
}));

// BirthdayPrompt imports the Supabase client (needs a browser); the view tests never open it.
vi.mock("@/modules/equilibrium/components/BirthdayPrompt", () => ({ default: () => null, BirthdayPrompt: () => null }));

// Saturday 2026-11-21, 16:38 local, built in local time so the test holds in any zone.
// Birthday 1985-01-04 (Sasha's): the year is ≈ 88% lived, so the season is Harvest.
const NOW = new Date(2026, 10, 21, 16, 38).getTime();
const BIRTHDAY = "1985-01-04";

const render = (birthday: string | null, extra: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <BiologicClockFace cycles={getAllCyclesV2(NOW, birthday ?? undefined)} nowMs={NOW} birthday={birthday} {...extra} />
    </MemoryRouter>,
  );

const texts = (html: string) => [...html.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

describe("engine words (spec «Words»)", () => {
  it("Waxing Gibbous reads Readying, Sunday reads Threshold & Celebration", () => {
    expect(MOON_PHASES[3].energy).toBe("Readying · Prep for harvest · Set up infrastructure · Get the help");
    const sunday = PLANETARY_DAYS[6];
    expect(sunday.name).toBe("Sunday");
    expect(sunday.energy).toBe("Threshold & Celebration");
    expect(sunday.description.startsWith("Between weeks: vision, ceremony, sharing with community. Write, don't send; seed Monday.")).toBe(true);
  });

  it("phase word = first word of energy, meaning = the rest", () => {
    expect(MOON_PHASES.map((p) => phaseWord(p.energy))).toEqual([
      "Clearing", "Gathering", "Seeing", "Readying", "Harvesting", "Celebrating", "Planning", "Planting",
    ]);
    expect(PLANETARY_DAYS.map((d) => phaseWord(d.energy))).toEqual([
      "Intuition", "Action", "Clarity", "Expansion", "Beauty", "Structure", "Threshold",
    ]);
    expect(moonMeaning(MOON_PHASES[3].energy)).toBe("Prep for harvest · Set up infrastructure · Get the help");
  });

  it("time left reads «1 d 21 h», «7 h», «under 1 h»", () => {
    expect(formatTimeLeft(1 + 21 / 24)).toBe("1 d 21 h");
    expect(formatTimeLeft(7 / 24)).toBe("7 h");
    expect(formatTimeLeft(0.01)).toBe("under 1 h");
    expect(formatTimeLeft(2)).toBe("2 d 0 h");
  });
});

describe("BiologicClock v5: two rings from one engine", () => {
  it("default: Moon and Week only, no Year, no day arc", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-ring="(year|moon|week|day)"/g)).toEqual(['data-ring="moon"', 'data-ring="week"']);
    expect(html).toContain('data-expanded="false"');
    expect(html).not.toContain('data-readout="year"');
  });

  it("moon: eight moons, earlier lit, later dim, now (Waxing Gibbous = 3) larger", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-moon-segment=/g)).toHaveLength(8);
    expect(html).toMatch(/data-moon-segment="3" class="bio-clock__moon is-now"/);
    expect(html.match(/bio-clock__moon is-lit/g)).toHaveLength(3);
    expect(html.match(/bio-clock__moon is-dim/g)).toHaveLength(4);
    expect(html).toContain('data-moon="3"');
  });

  it("moon track: a lit arc from the top to lunar.progress", () => {
    const { lunar } = getAllCyclesV2(NOW, BIRTHDAY);
    const html = render(BIRTHDAY);
    expect(html).toMatch(/class="bio-clock__track-lit"[^>]* d="M100\.00 20\.00 A80 80 /);
    const a = lunar.progress * 2 * Math.PI - Math.PI / 2;
    const [x, y] = [100 + 80 * Math.cos(a), 100 + 80 * Math.sin(a)].map((n) => n.toFixed(2));
    expect(html).toContain(`${x} ${y}"`);
  });

  it("week: seven planet photos Monday→Sunday, Saturday today, Saturn drawn larger", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-week-segment=/g)).toHaveLength(7);
    expect(html.match(/data-week-track=/g)).toHaveLength(7);
    expect(html).toMatch(/data-week-segment="5" class="bio-clock__planet is-today"/);
    for (const p of ["moon", "mars", "mercury", "jupiter", "venus", "saturn", "sun"]) {
      expect(html).toContain(`/assets/equilibrium/planets/${p}.png`);
    }
    // today's planet r 9.2 × Saturn 1.7 = a 31.28 px box; the other days are 12 px (Mon, Tue, ...) at r 6
    expect(html).toMatch(/saturn\.png"[^>]* width="31\.28"/);
    expect(html).toMatch(/mars\.png"[^>]* width="12\.00"/);
    expect(html.match(/class="bio-clock__seg is-today"/g)).toHaveLength(1);
  });

  it("week track: chakra colours per day", () => {
    const html = render(BIRTHDAY);
    for (const c of ["#5b4fc4", "#c9483c", "#3f84d0", "#9a62d6", "#e48a3c", "#e8c447", "#4fb06e"]) {
      expect(html).toContain(`--bc-seg:${c}`);
    }
  });

  it("centre: moon phase word over the day word, no moon, no clock time", () => {
    const html = render(BIRTHDAY);
    expect(texts(html)).toEqual(["Readying", "Structure"]);
    expect(html).not.toMatch(/\d{1,2}:\d{2}/);
    expect(html).toContain('aria-label="Readying · Waxing Gibbous · Saturday · Structure"');
  });

  it("readout: prev › current › next with the phase name, meaning and time to the next moon phase", () => {
    const html = render(BIRTHDAY);
    const moon = /data-readout="moon".*?<\/section>/s.exec(html)![0];
    expect(moon).toMatch(/Seeing.*Readying.*Harvesting/s);
    expect(moon).toContain("Waxing Gibbous");
    expect(moon).toContain("Prep for harvest · Set up infrastructure · Get the help");
    const { lunar } = getAllCyclesV2(NOW, BIRTHDAY);
    expect(moon).toContain(`Full Moon in ${formatTimeLeft(lunar.daysRemainingInPhase)}`);
    expect(lunar.nextPhaseName).toBe("Full Moon");

    const week = /data-readout="week".*?<\/section>/s.exec(html)![0];
    expect(week).toMatch(/Beauty.*Structure.*Threshold/s);
    expect(week).toContain("Saturday · Saturn");
    expect(week).toContain(PLANETARY_DAYS[5].description);
    expect(week).not.toMatch(/ in \d/); // the week shows no time left
  });

  it("readout wraps around the week: Sunday reads Structure › Threshold › Intuition", () => {
    const sunday = new Date(2026, 10, 22, 11, 15).getTime();
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <BiologicClockFace cycles={getAllCyclesV2(sunday, BIRTHDAY)} nowMs={sunday} birthday={BIRTHDAY} />
      </MemoryRouter>,
    );
    const week = /data-readout="week".*?<\/section>/s.exec(html)![0];
    expect(week).toMatch(/Structure.*Threshold.*Intuition/s);
    expect(week).toContain("Between weeks: vision, ceremony, sharing with community.");
    expect(texts(html)[1]).toBe("Threshold");
  });

  it("toggle: «+ Year and day» when collapsed", () => {
    expect(render(BIRTHDAY, { onToggleExpanded: () => {} })).toContain("+ Year and day");
    expect(render(BIRTHDAY)).not.toContain("Year and day");
  });
});

describe("«+ Year and day» expanded", () => {
  it("adds the Year ring (four seasons, current = Harvest) and the gold day arc, still no clock time", () => {
    const html = render(BIRTHDAY, { expanded: true, onToggleExpanded: () => {} });
    expect(html.match(/data-ring="(year|moon|week|day)"/g)).toEqual([
      'data-ring="year"', 'data-ring="moon"', 'data-ring="week"', 'data-ring="day"',
    ]);
    expect(html.match(/data-season=/g)).toHaveLength(4);
    expect(html).toMatch(/data-season="3" class="bio-clock__year is-now"/);
    expect(html).toContain("bio-clock__day-lit");
    expect(html).toContain("− Year and day");
    expect(html).not.toMatch(/\d{1,2}:\d{2}/);
    const year = /data-readout="year".*?<\/section>/s.exec(html)![0];
    expect(year).toMatch(/Fruiting.*Harvest.*Seeding/s);
    expect(year).toContain("Autumn Equinox");
  });

  it("no birthday: an empty year track and an invitation (guest → Equilibrium, signed in → the prompt)", () => {
    const guest = render(null, { expanded: true });
    expect(guest).toContain("Add your birthday to see your year");
    expect(guest).toContain('href="/build/equilibrium"');
    expect(guest).not.toContain("data-season=");
    const signedIn = render(null, { expanded: true, onAskBirthday: () => {} });
    expect(signedIn).toContain("<button");
    expect(signedIn).not.toContain('href="/build/equilibrium"');
  });

  it("while the birthday is still loading there is no invitation", () => {
    expect(render(null, { expanded: true, birthdayLoading: true })).not.toContain("Add your birthday");
  });
});
