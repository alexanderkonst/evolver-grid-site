import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { getAllCyclesV2, MOON_PHASES, PLANETARY_DAYS } from "@/lib/equilibrium-cycles";
import {
  BiologicClockFace, LEGACY_EXPANDED_KEY, VIEW_KEY, WEEK_TEXT_COLOURS, contrastRatio, daysToBirthday, formatTimeLeft, isActivationKey, loadView, moonMeaning,
  nextView, phaseWord, readableOnDark, saveView,
  type ClockView,
} from "../BiologicClock";

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

// Trimmed: the centre texts end in a space SVG never draws; it gives axe word breaks in the dial's visible text (#460).
const texts = (html: string) => [...html.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1].trim());
// The same two texts, untrimmed: the word break must stay, or axe label-in-name flags the dial again.
const rawCentreTexts = (html: string) => [...html.matchAll(/<text[^>]*(?:bio-clock__address|bio-clock__word)[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

describe("engine words (spec «Words»)", () => {
  it("Waxing Gibbous reads Prepping, Sunday reads Threshold & Celebration", () => {
    expect(MOON_PHASES[3].energy).toBe("Prepping · Prep for harvest · Set up infrastructure · Get the help");
    const sunday = PLANETARY_DAYS[6];
    expect(sunday.name).toBe("Sunday");
    expect(sunday.energy).toBe("Threshold & Celebration");
    expect(sunday.description.startsWith("Between weeks: vision, ceremony, sharing with community. Write, don't send; seed Monday.")).toBe(true);
  });

  it("Fixes v6.2 item 5: Full Moon and Tuesday copy (engine, so Equilibrium shows it too)", () => {
    expect(MOON_PHASES[4].energy).toBe("Harvesting · Reap what's ripe. Receive the fruits of your work.");
    expect(moonMeaning(MOON_PHASES[4].energy)).toBe("Reap what's ripe. Receive the fruits of your work.");
    expect(PLANETARY_DAYS[1].name).toBe("Tuesday");
    expect(PLANETARY_DAYS[1].description).toBe("Massive action. Sends, invites, asks. The week's day to move.");
    expect(PLANETARY_DAYS.map((d) => d.description).join(" ")).not.toContain("kinetic");
  });

  it("phase word = first word of energy, meaning = the rest", () => {
    expect(MOON_PHASES.map((p) => phaseWord(p.energy))).toEqual([
      "Clearing", "Gathering", "Seeing", "Prepping", "Harvesting", "Celebrating", "Planning", "Planting",
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
  it("default (view 1): Moon and Week only, no Year, no day arc, no readout", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-ring="(year|moon|week|day)"/g)).toEqual(['data-ring="moon"', 'data-ring="week"']);
    expect(html).toContain('data-view="1"');
    expect(html).not.toContain("data-readout=");
    expect(html).not.toContain("bio-clock__readout");
  });

  it("moon: eight moons, lived dim, ahead bright, now (Waxing Gibbous = 3) one large symbol", () => {
    const html = render(BIRTHDAY);
    expect(html.match(/data-moon-segment=/g)).toHaveLength(8);
    expect(html).toMatch(/data-moon-segment="3" class="bio-clock__moon is-now"/);
    expect(html.match(/bio-clock__moon is-lived/g)).toHaveLength(3);
    expect(html.match(/bio-clock__moon is-ahead/g)).toHaveLength(4);
    expect(html).toContain('data-moon="3"');
  });

  it("current moon and today's planet are ~2.5× the others (r 15.5 vs 6 on the 200 viewBox)", () => {
    const html = render(BIRTHDAY);
    // MoonOrb box = 2r / 0.92: now 33.70, the others 13.04 (in the ring; the centre icon is 11.5 r)
    const now = /data-moon-segment="3"[^>]*>.*?<\/g><\/g>/s.exec(html)![0];
    expect(now).toMatch(/width="33\.69/);
    expect(/data-moon-segment="2"[^>]*>.*?<\/g><\/g>/s.exec(html)![0]).toMatch(/width="13\.04/);
    // today's planet (Saturn, ×1.7): 15.5 × 1.7 × 2 = 52.70; Mars 12.00
    expect(html).toMatch(/saturn\.png"[^>]* width="52\.70"/);
    expect(html).toMatch(/mars\.png"[^>]* width="12\.00"/);
  });

  it("moon track: a dim lived arc from the top to lunar.progress, a bright ahead arc from there on", () => {
    const { lunar } = getAllCyclesV2(NOW, BIRTHDAY);
    const html = render(BIRTHDAY);
    expect(html).toMatch(/class="bio-clock__track-lived"[^>]* d="M100\.00 20\.00 A80 80 /);
    expect(html).toMatch(/class="bio-clock__track-ahead"[^>]* d="M\d/);
    expect(html).not.toContain("bio-clock__track-lit");
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
    expect(html.match(/class="bio-clock__seg is-today"/g)).toHaveLength(1);
    // one grammar: days before Saturday are lived, Sunday is ahead
    expect(html.match(/bio-clock__planet is-lived/g)).toHaveLength(5);
    expect(html.match(/bio-clock__planet is-ahead/g)).toHaveLength(1);
  });

  it("week track: chakra colours per day", () => {
    const html = render(BIRTHDAY);
    for (const c of ["#5b4fc4", "#c9483c", "#3f84d0", "#9a62d6", "#e48a3c", "#e8c447", "#4fb06e"]) {
      expect(html).toContain(`--bc-seg:${c}`);
    }
  });

  it("centre: two addressed words (moon + phase word in moon colour, planet + day word in the chakra colour), same size, no clock time", () => {
    const html = render(BIRTHDAY);
    // each word sits under its cycle's name in small caps (Fixes v6.2 item 1)
    expect(texts(html)).toEqual(["WAXING GIBBOUS", "Prepping", "SATURDAY", "Structure"]);
    expect(html).not.toMatch(/\d{1,2}:\d{2}/);
    expect(html).toContain('aria-label="Waxing Gibbous, Prepping, Saturday, Structure"');
    const centre = html.slice(html.indexOf('data-ring="centre"'));
    expect(centre.match(/data-centre-line/g)).toHaveLength(2);
    expect(centre).toMatch(/fill:#fff4dc/); // the moon word: warm white
    expect(centre).toMatch(/fill:#e8c447/); // Saturday: solar plexus yellow
    const words = [...centre.matchAll(/class="bio-clock__word"[^>]*font-size:([\d.]+)px/g)].map((m) => Number(m[1]));
    expect(words).toHaveLength(2);
    expect(words[0]).toBe(words[1]);
    expect(words[0]).toBeGreaterThanOrEqual(12); // never below 12 (the dial is >= 200 px)
    // the addresses: >= 11 px (the dial is >= 200 px on a phone, 1 unit = 1 px), in their ring's colour
    const addresses = [...centre.matchAll(/data-centre-address[^>]*font-size:([\d.]+)px;fill:(#[0-9a-f]{6})/g)];
    expect(addresses.map((m) => Number(m[1]))).toEqual([11, 11]);
    expect(addresses.map((m) => m[2])).toEqual(["#fff4dc", "#e8c447"]);
    expect(centre).toContain("saturn.png"); // the small planet of the day
  });

  it("card: one grid per ring — label with address and time left, symbol + word + was/next, meaning", () => {
    const html = render(BIRTHDAY, { view: 2 });
    const moon = /data-readout="moon".*?<\/section>/s.exec(html)![0];
    expect(moon).toMatch(/bio-clock__label">Moon · Waxing Gibbous</);
    expect(moon).toMatch(/bio-clock__name">Prepping</);
    const { lunar } = getAllCyclesV2(NOW, BIRTHDAY);
    const left = formatTimeLeft(lunar.daysRemainingInPhase);
    // v6.3 item 2: «next» is said once, in the head line, with its time; the line below keeps only «before …»
    expect(moon).toContain("before Seeing<");
    expect(moon).not.toContain("next Harvesting");
    expect(moon.match(/next/gi)).toHaveLength(1);
    expect(moon).toContain("Prep for harvest · Set up infrastructure · Get the help");
    expect(moon).toMatch(new RegExp(`bio-clock__time">Next: Full Moon in ${left}<`));
    expect(lunar.nextPhaseName).toBe("Full Moon");

    const week = /data-readout="week".*?<\/section>/s.exec(html)![0];
    expect(week).toMatch(/bio-clock__label">Week · Saturday, Saturn</);
    expect(week).toMatch(/bio-clock__name">Structure</);
    expect(week).toContain("before Beauty · next Threshold, tomorrow");
    expect(week).toContain(PLANETARY_DAYS[5].description);
    expect(week).not.toContain("bio-clock__time"); // the week shows no time left
  });

  it("card wraps around the week: Sunday reads before Structure · next Intuition, tomorrow", () => {
    const sunday = new Date(2026, 10, 22, 11, 15).getTime();
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <BiologicClockFace cycles={getAllCyclesV2(sunday, BIRTHDAY)} nowMs={sunday} birthday={BIRTHDAY} view={2} />
      </MemoryRouter>,
    );
    const week = /data-readout="week".*?<\/section>/s.exec(html)![0];
    expect(week).toContain("before Structure · next Intuition, tomorrow");
    expect(week).toContain("Week · Sunday, Sun");
    expect(week).toContain("bio-clock__sun"); // the Sun image is masked round
    expect(week).toContain("Between weeks: vision, ceremony, sharing with community.");
    expect(texts(html)).toEqual(["WAXING GIBBOUS", "Prepping", "SUNDAY", "Threshold"]);
    // the Sun on the dial: a circular mask (disc 88% of the image) and our own glow
    const dial = html.slice(0, html.indexOf("bio-clock__readout"));
    expect(dial).toContain('data-sun-mask="true"');
    expect(dial).toContain('clip-path="url(#bc-sun-clip-');
    expect(dial).toContain('<circle cx="0.5" cy="0.5" r="0.44"');
    expect(dial).toMatch(/fill="url\(#bc-glow-sun-/);
    // Sunday green on the day word
    expect(dial.slice(dial.indexOf('data-ring="centre"'))).toContain("fill:#4fb06e");
  });

});

describe("three views, one tap cycles them (#385)", () => {
  it("nextView: 1 → 2 → 3 → 1", () => {
    const seen: ClockView[] = [];
    let v: ClockView = 1;
    for (let i = 0; i < 4; i++) {
      seen.push(v);
      v = nextView(v);
    }
    expect(seen).toEqual([1, 2, 3, 1]);
  });

  it("centre texts keep a trailing word break so the dial's visible text reads as words (#460, axe label-in-name)", () => {
    const raw = rawCentreTexts(render(BIRTHDAY, { view: 1, onCycleView: () => {} }));
    expect(raw).toHaveLength(4);
    for (const s of raw) expect(s).toMatch(/\S $/);
  });

  it("view 1: the dial and its two addressed centre words, no card, no real control besides the dial", () => {
    const html = render(BIRTHDAY, { view: 1, onCycleView: () => {} });
    expect(texts(html)).toEqual(["WAXING GIBBOUS", "Prepping", "SATURDAY", "Structure"]);
    expect(html).not.toContain("bio-clock__readout");
    expect(html).not.toContain("bio-clock__more");
  });

  it("click cue (item 2): a «+ tap» chip under the dial in view 1 only; out of the tab order and the accessibility tree", () => {
    const v1 = render(BIRTHDAY, { view: 1, onCycleView: () => {} });
    expect(v1).toMatch(/<button type="button" class="bio-clock__cue"[^>]*tabindex="-1"[^>]*aria-hidden="true"/);
    expect(v1).toContain(">+</span> <span>tap</span>");
    expect(v1.indexOf("</svg>")).toBeLessThan(v1.indexOf("bio-clock__cue")); // under the dial
    expect(v1.match(/<button/g)).toHaveLength(1);
    expect(render(BIRTHDAY, { view: 2, onCycleView: () => {} })).not.toContain("bio-clock__cue");
    expect(render(BIRTHDAY, { view: 3, onCycleView: () => {} })).not.toContain("bio-clock__cue");
    expect(render(BIRTHDAY, { view: 1 })).not.toContain("bio-clock__cue"); // a static dial has nothing to tap
    const css = readFileSync(new URL("../BiologicClock.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.bio-clock__dial\.is-tappable \{[^}]*cursor: pointer/);
    expect(css).toMatch(/is-tappable:hover[^{]*\{[^}]*drop-shadow/s);
    expect(css).toMatch(/is-tappable:focus-visible[^{]*\{[^}]*drop-shadow/s);
    expect(css).toMatch(/\.bio-clock__cue \{[^}]*min-height: 24px/);
  });

  it("the dial itself is the control: role button, focusable, aria-label names the summary and the next view", () => {
    const v1 = render(BIRTHDAY, { view: 1, onCycleView: () => {} });
    expect(v1).toMatch(/<svg[^>]*role="button"[^>]*tabindex="0"/);
    expect(v1).toContain('aria-label="Waxing Gibbous, Prepping, Saturday, Structure. Show the text: meaning, previous and next"');
    expect(render(BIRTHDAY, { view: 2, onCycleView: () => {} })).toContain(". Show Year and day\"");
    expect(render(BIRTHDAY, { view: 3, onCycleView: () => {} })).toContain(". Back to the dial only\"");
  });

  it("keyboard: Enter and Space activate the dial; other keys do not", () => {
    expect(isActivationKey("Enter")).toBe(true);
    expect(isActivationKey(" ")).toBe(true);
    expect(isActivationKey("Tab")).toBe(false);
    expect(isActivationKey("a")).toBe(false);
  });

  it("view 2: dial + Moon and Week blocks, no Year, no Day ring", () => {
    const html = render(BIRTHDAY, { view: 2, onCycleView: () => {} });
    expect(html.match(/data-readout="(moon|week|year)"/g)).toEqual(['data-readout="moon"', 'data-readout="week"']);
    expect(html.match(/data-ring="(year|moon|week|day)"/g)).toEqual(['data-ring="moon"', 'data-ring="week"']);
    expect(html).toContain('viewBox="0 0 200 200"');
  });

  it("view 3: Day and Year rings outside, Moon and Week keep size and place; Day block with the day left", () => {
    const v2 = render(BIRTHDAY, { view: 2, onCycleView: () => {} });
    const v3 = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    expect(v3.match(/data-readout="(moon|week|year|day)"/g)).toEqual(['data-readout="moon"', 'data-readout="week"', 'data-readout="year"', 'data-readout="day"']);
    expect(v3.match(/data-ring="(year|moon|week|day)"/g)).toHaveLength(4);
    // the viewBox grows outward by the same pad on every side: the 0..200 inner geometry is untouched
    expect(v3).toContain('viewBox="-14 -14 228 228"');
    const ring = (html: string, name: string) => new RegExp(`data-ring="${name}".*?(?=data-ring=)`, "s").exec(html)![0];
    expect(ring(v3, "moon").replace(/<title>.*?<\/title>/, "")).toBe(ring(v2, "moon").replace(/<title>.*?<\/title>/, ""));
    expect(/data-ring="week".*?(?=data-ring="day"|data-ring="centre")/s.exec(v3)![0]).toBe(/data-ring="week".*?(?=data-ring="centre")/s.exec(v2)![0]);
    // Day (gold) at r 102, Year (silver) at r 111: both outside the Moon ring (r 80 + the 15.5 current moon)
    expect(ring(v3, "day")).toMatch(/A102 102/);
    expect(/data-ring="year".*?(?=data-ring="day")/s.exec(v3)![0]).toMatch(/A111 111/);
    // day arc: lived dim then what is left bright
    expect(v3).toContain("bio-clock__day-lived");
    expect(v3).toContain("bio-clock__day-ahead");
    expect(v3).not.toContain("bio-clock__day-lit");
    // the Day block (v6.3 item 3): its own «Day» label, the day left in gold under it (Saturday 16:38 → 31% left)
    const year = /data-readout="day".*?<\/section>/s.exec(v3)![0];
    expect(year).toMatch(/bio-clock__label">Day</);
    // item 6: the line starts with a dot in the Day ring's colour (gold)
    expect(year).toContain('<p class="bio-clock__today"><span class="bio-clock__today-dot" aria-hidden="true"></span> Today: 31% of the day left</p>');
  });

  it("the Moon Focus line (children) shows from view 2, never in view 1", () => {
    const focus = <p>Moon Focus line</p>;
    expect(render(BIRTHDAY, { view: 1, children: focus })).not.toContain("Moon Focus line");
    expect(render(BIRTHDAY, { view: 2, children: focus })).toContain("Moon Focus line");
    expect(render(BIRTHDAY, { view: 3, children: focus })).toContain("Moon Focus line");
  });

  it("placement: inline (character sheet) and card (village) are one component", () => {
    expect(render(BIRTHDAY, { view: 2 })).toContain("bio-clock--inline");
    expect(render(BIRTHDAY, { view: 2, placement: "card" })).toContain("bio-clock--card");
  });

  it("no control and no tap target without onCycleView: a static group", () => {
    const html = render(BIRTHDAY, { view: 2 });
    expect(html).not.toContain('role="button"');
    expect(html).toContain('role="group"');
    expect(html).not.toContain("is-tappable");
  });
});

describe("the remembered view (localStorage)", () => {
  const memory = (initial: Record<string, string> = {}) => {
    const data = { ...initial };
    return {
      data,
      getItem: (k: string) => (k in data ? data[k] : null),
      setItem: (k: string, v: string) => { data[k] = v; },
      removeItem: (k: string) => { delete data[k]; },
    };
  };

  it("nothing stored → view 1 (dial only)", () => {
    expect(loadView(memory())).toBe(1);
    expect(loadView(null)).toBe(1);
  });

  it("saves each step of the cycle and reads it back", () => {
    const store = memory();
    let v: ClockView = loadView(store);
    for (const expected of [2, 3, 1] as ClockView[]) {
      v = nextView(v);
      saveView(store, v);
      expect(v).toBe(expected);
      expect(loadView(store)).toBe(expected);
    }
    expect(store.data[VIEW_KEY]).toBe("1");
  });

  it("ignores a junk value", () => {
    expect(loadView(memory({ [VIEW_KEY]: "9" }))).toBe(1);
  });

  it("migrates the v5 flag: expanded «1» → view 3, «0» → view 2; the old key goes", () => {
    const open = memory({ [LEGACY_EXPANDED_KEY]: "1" });
    expect(loadView(open)).toBe(3);
    expect(open.data[VIEW_KEY]).toBe("3");
    expect(LEGACY_EXPANDED_KEY in open.data).toBe(false);

    const closed = memory({ [LEGACY_EXPANDED_KEY]: "0" });
    expect(loadView(closed)).toBe(2);
    expect(closed.data[VIEW_KEY]).toBe("2");
  });

  it("the new key wins over a leftover old one", () => {
    expect(loadView(memory({ [VIEW_KEY]: "2", [LEGACY_EXPANDED_KEY]: "1" }))).toBe(2);
  });

  it("village and profile remember their own view", () => {
    const store = memory();
    saveView(store, 3, "village");
    saveView(store, 2, "profile");
    expect(loadView(store, "village")).toBe(3);
    expect(loadView(store, "profile")).toBe(2);
    expect(store.data["bioclock:view:village"]).toBe("3");
    expect(store.data["bioclock:view:profile"]).toBe("2");
    saveView(store, 1, "village");
    expect(loadView(store, "profile")).toBe(2); // the other place does not move
  });

  it("a place with no key of its own starts from the shared key, then from the v5 flag", () => {
    expect(loadView(memory({ [VIEW_KEY]: "2" }), "village")).toBe(2);
    const legacy = memory({ [LEGACY_EXPANDED_KEY]: "1" });
    expect(loadView(legacy, "profile")).toBe(3);
    expect(legacy.data["bioclock:view:profile"]).toBe("3");
    expect(LEGACY_EXPANDED_KEY in legacy.data).toBe(false);
    expect(loadView(memory({ [VIEW_KEY]: "2", "bioclock:view:village": "3" }), "village")).toBe(3);
  });

  it("blocked storage never throws", () => {
    const blocked = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(loadView(blocked)).toBe(1);
    expect(() => saveView(blocked, 3)).not.toThrow();
  });
});

describe("view 3: Year and day", () => {
  it("Year ring (four seasons, current = Harvest), gold Day ring, still no clock time", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    expect(html.match(/data-ring="(year|moon|week|day)"/g)).toEqual([
      'data-ring="year"', 'data-ring="day"', 'data-ring="moon"', 'data-ring="week"',
    ]);
    expect(html.match(/data-season=/g)).toHaveLength(4);
    expect(html).toMatch(/data-season="3" class="bio-clock__year is-now"/);
    expect(html.match(/bio-clock__year is-lived/g)).toHaveLength(3);
    expect(html).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it("Year names are energy names only: «Your year, from your birthday», no calendar season", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    const year = /data-readout="year".*?<\/section>/s.exec(html)![0];
    expect(year).toMatch(/bio-clock__label">Your year · From your birthday</);
    expect(year).toMatch(/bio-clock__name">Harvest</);
    expect(year).toContain("before Fruiting · next Seeding, in 44 days");
    expect(year).toContain("Gather what grew.");
    expect(html).toContain("Your year, from your birthday: Harvest"); // the ring's title
    for (const calendar of ["Equinox", "Solstice", "Autumn", "Winter", "Spring", "Summer"]) {
      expect(html).not.toContain(calendar);
    }
    // time left to the next birthday, right-aligned
    expect(year).toMatch(/bio-clock__time">44 days to 4 Jan</);
  });

  it("days to the next birthday", () => {
    expect(daysToBirthday("1985-01-04", NOW)).toEqual({ days: 44, label: "4 Jan" });
    expect(daysToBirthday("1990-11-21", NOW)).toEqual({ days: 0, label: "21 Nov" });
    expect(daysToBirthday("1990-11-20", NOW)?.days).toBe(364);
    expect(daysToBirthday("garbage", NOW)).toBeNull();
  });

  it("no birthday: an empty year track; signed in → the birthday prompt link, signed out → no invitation here (item 7)", () => {
    const guest = render(null, { view: 3 });
    expect(guest).not.toContain("Add your birthday");
    expect(guest).not.toContain('href="/build/equilibrium"');
    expect(guest).not.toContain("<button");
    expect(guest).not.toContain("data-season=");
    expect(guest).toContain("Today: "); // the day-left line sits in its own Day block (v6.3 item 3)
    const signedIn = render(null, { view: 3, onAskBirthday: () => {} });
    expect(signedIn).toContain("<button");
    expect(signedIn).toContain("Add your birthday to see your year");
    expect(signedIn).not.toContain('href="/build/equilibrium"');
  });

  it("while the birthday is still loading there is no invitation", () => {
    expect(render(null, { view: 3, birthdayLoading: true })).not.toContain("Add your birthday");
  });
});

describe("Fixes v6.2 (#434)", () => {
  it("item 6: «YEAR» and «DAY» labels on the two outer rings, in view 3 only", () => {
    const v3 = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    expect(v3).toMatch(/data-ring-label="year"[^>]*>.*?<textPath[^>]*>YEAR<\/textPath>/s);
    expect(v3).toMatch(/data-ring-label="day"[^>]*>.*?<textPath[^>]*>DAY<\/textPath>/s);
    expect(v3).toContain("bio-clock__ring-label--day");
    expect(v3).toContain("bio-clock__ring-label--year");
    for (const view of [1, 2] as ClockView[]) expect(render(BIRTHDAY, { view })).not.toContain("data-ring-label");
    // the labels do not change the ring count or order
    expect(v3.match(/data-ring="(year|moon|week|day)"/g)).toHaveLength(4);
  });

  it("item 8: every weekday's word colour reaches WCAG AA (4.5:1) on the night background; readable colours stay as they were", () => {
    expect(WEEK_TEXT_COLOURS).toHaveLength(7);
    for (const c of WEEK_TEXT_COLOURS) expect(contrastRatio(c, "#070b16")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#fff4dc", "#070b16")).toBeGreaterThanOrEqual(4.5); // the moon's warm white
    expect(contrastRatio("#5b4fc4", "#070b16")).toBeLessThan(4.5); // the pure Monday indigo did not
    expect(WEEK_TEXT_COLOURS[0]).not.toBe("#5b4fc4");
    expect(readableOnDark("#e8c447")).toBe("#e8c447"); // already reads
    // the track keeps the pure chakra colour; only the words are lightened
    expect(render(BIRTHDAY)).toContain("--bc-seg:#5b4fc4");
    const monday = new Date(2026, 10, 23, 10, 0).getTime();
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <BiologicClockFace cycles={getAllCyclesV2(monday, BIRTHDAY)} nowMs={monday} birthday={BIRTHDAY} view={2} />
      </MemoryRouter>,
    );
    expect(html).toContain(`fill:${WEEK_TEXT_COLOURS[0]}`);
    expect(html).toContain("--bc-ring:" + WEEK_TEXT_COLOURS[0]);
    const css = readFileSync(new URL("../BiologicClock.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.bio-clock__readout \{[^}]*text-shadow/s);
  });

  it("item 9: adjacent label / word pairs are separated by a space, so a screen reader does not read «Harvestingwas»", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    const readout = html.slice(html.indexOf("bio-clock__readout"));
    // v6.3 item 5: the rows are flex containers, which drop plain spaces, so every pair is split by a visually hidden «, »
    expect(readout).toMatch(/bio-clock__label">[^<]*<\/span><span class="bio-clock__sr">, <\/span><span class="bio-clock__time"/);
    expect(readout).toMatch(/bio-clock__name">[^<]*<\/span><span class="bio-clock__sr">, <\/span><span class="bio-clock__around"/);
    // text content: no two words glued together
    const text = readout.replace(/<[^>]+>/g, "|");
    expect(text).not.toMatch(/[a-z]\|[a-z]/);
  });

  it("item 10: opening view 2 or 3 scrolls the WHOLE card into view (end when it fits, start when taller than the screen)", () => {
    const src = readFileSync(new URL("../BiologicClock.tsx", import.meta.url), "utf8");
    expect(src).toContain('rect.height <= screen ? "end" : "start"');
    expect(src).toContain("requestAnimationFrame");
    expect(src).toContain("already all in view");
    expect(readFileSync(new URL("../BiologicClock.css", import.meta.url), "utf8")).toContain("scroll-margin-block");
  });
});

describe("Fixes v6.3 (#448)", () => {
  const css = readFileSync(new URL("../BiologicClock.css", import.meta.url), "utf8");

  it("item 1: the open card is fully opaque", () => {
    const card = /\.bio-clock--card \.bio-clock__readout \{[^}]*\}/s.exec(css)![0];
    expect(card).toMatch(/background: #070b16;/);
    expect(card).not.toMatch(/rgba\(7, 11, 22, 0\.\d+\)\s*;?\s*border/);
  });

  it("item 2: «next» once — moon says it in the head only; the week (no head time) and the year (head is the birthday) keep theirs", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    const moon = /data-readout="moon".*?<\/section>/s.exec(html)![0];
    expect(moon).toMatch(/bio-clock__time">Next: Full Moon in /);
    expect(moon).toMatch(/bio-clock__around">before Seeing</);
    expect(moon.match(/next/gi)).toHaveLength(1);
    expect(/data-readout="week".*?<\/section>/s.exec(html)![0]).toContain("before Beauty · next Threshold, tomorrow");
    expect(/data-readout="year".*?<\/section>/s.exec(html)![0]).toContain("before Fruiting · next Seeding, in 44 days");
  });

  it("item 3: a guest's view 3 has no year header; the day line sits under its own «Day» label", () => {
    const guest = render(null, { view: 3, onCycleView: () => {} });
    expect(guest).not.toContain("Your year · From your birthday"); // the block header (the empty ring's hover title stays)
    expect(guest).not.toContain("bio-clock__label\">Your year");
    expect(guest).not.toContain('data-readout="year"');
    const day = /data-readout="day".*?<\/section>/s.exec(guest)![0];
    expect(day).toMatch(/bio-clock__label">Day</);
    expect(day).toContain("Today: 31% of the day left");
    // the empty year track is still on the dial
    expect(guest).toContain("bio-clock__year--empty");
  });

  it("item 3: signed in with a birthday — year block unchanged, the day line is not inside it; signed in without one — invite in Year, day in Day", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    const year = /data-readout="year".*?<\/section>/s.exec(html)![0];
    expect(year).not.toContain("Today:");
    expect(year).not.toContain("bio-clock__extra");
    expect(/data-readout="day".*?<\/section>/s.exec(html)![0]).toContain("Today: 31% of the day left");
    const noBirthday = render(null, { view: 3, onAskBirthday: () => {} });
    expect(/data-readout="year".*?<\/section>/s.exec(noBirthday)![0]).toContain("Add your birthday to see your year");
    expect(/data-readout="year".*?<\/section>/s.exec(noBirthday)![0]).not.toContain("Today:");
    expect(/data-readout="day".*?<\/section>/s.exec(noBirthday)![0]).toContain("Today:");
    // while the birthday loads: no year block, the day block stays
    const loading = render(null, { view: 3, birthdayLoading: true, onAskBirthday: () => {} });
    expect(loading).not.toContain('data-readout="year"');
    expect(loading).toContain('data-readout="day"');
  });

  it("item 4: YEAR and DAY sit on their own rings at different angles, ≥ 11 px, with the ring stroke cut under the letters", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    const turn = (name: string) => Number(new RegExp(`data-ring-label="${name}" data-label-turn="([\\d.]+)"`).exec(html)![1]);
    const [day, year] = [turn("day"), turn("year")];
    const apart = Math.abs(day - year);
    expect(Math.min(apart, 1 - apart)).toBeGreaterThan(0.1); // not stacked at 12 o'clock
    for (const t of [day, year]) expect(t >= 0.5 ? t : 1 - t).toBeGreaterThanOrEqual(0.5); // upper half: the text is upright
    expect(/data-ring="day".*?(?=data-ring="moon")/s.exec(html)![0]).toContain('id="bc-label-day-');
    expect(/data-ring="year".*?(?=data-ring="day")/s.exec(html)![0]).toContain('id="bc-label-year-');
    // each label runs on its own ring's radius
    expect(/id="bc-label-year-[^"]*" d="M[\d. -]+ A111 111/.exec(html)).not.toBeNull();
    expect(/id="bc-label-day-[^"]*" d="M[\d. -]+ A102 102/.exec(html)).not.toBeNull();
    // 11 viewBox units = 11 px (the 228-unit dial is drawn 228 px wide on the card)
    expect(html.match(/bio-clock__ring-label [^"]*" style="font-size:(\d+(?:\.\d+)?)px"/g)!.every((m) => Number(/font-size:([\d.]+)px/.exec(m)![1]) >= 11)).toBe(true);
    // the ring stroke leaves a gap under the label: the day arc is not one unbroken arc any more
    const dayRing = /data-ring="day".*?(?=data-ring="moon")/s.exec(html)![0];
    expect(dayRing.match(/ M/g)?.length ?? 0).toBeGreaterThanOrEqual(1);
  });

  it("item 4: the labels keep clear of their ring's own dot", () => {
    for (const hour of [3, 9, 12, 15, 21]) {
      const t = new Date(2026, 10, 21, hour, 0).getTime();
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <BiologicClockFace cycles={getAllCyclesV2(t, BIRTHDAY)} nowMs={t} birthday={BIRTHDAY} view={3} />
        </MemoryRouter>,
      );
      const label = Number(/data-ring-label="day" data-label-turn="([\d.]+)"/.exec(html)![1]);
      const dot = hour / 24;
      const d = Math.abs(label - dot);
      expect(Math.min(d, 1 - d)).toBeGreaterThan(0.045);
    }
  });

  it("item 5: the centre words are hidden from the tree (the dial's name carries them); card rows separate their pieces", () => {
    const html = render(BIRTHDAY, { view: 3, onCycleView: () => {} });
    expect(html).toMatch(/data-ring="centre" class="bio-clock__centre" aria-hidden="true"/);
    expect(html).toContain('aria-label="Waxing Gibbous, Prepping, Saturday, Structure.');
    expect(css).toMatch(/\.bio-clock__sr \{[^}]*clip/s);
  });
});
