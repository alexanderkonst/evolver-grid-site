/**
 * FMF (renamed from the Founder-Market Fit Discovery Mastermind, Sasha 2026-11-24):
 * "Discover Founder-Market Fit in Three Days, Guaranteed".
 * Single source for the FMF dates, the page path and the "meet me first" booking link, read by
 * the FMF page (src/pages/Mastermind.tsx), the Café event card (src/pages/spaces/EventsSpace.tsx)
 * and the village place's live windows (src/data/villagePlaces.ts).
 *
 * Dates rule (Sasha, 2026-11-24, re-based the same day on the Equilibrium user manual,
 * docs/04-products/equilibrium_user_manual.md): one FMF per Equilibrium lunar cycle. A new cycle
 * begins at Planning = the astronomical Last Quarter moon, right after Celebrating closes
 * (America/Mexico_City). FMF meets live on the first Monday on or after the Last Quarter, and on the
 * Wednesday after it (three days: Mon, Tue, Wed).
 * Last Quarter instants computed with PyEphem and cross-checked with Skyfield + JPL DE421 (same minute);
 * weekdays and the app's own lunar math (getLunarState: Planning opens at the stated instant) checked
 * in src/lib/__tests__/fmfDates.test.ts. Extend the list before 2027-05.
 */

/** Generic booking page to meet Sasha first (undated). */
export const FMF_MEET_FIRST_URL = "https://cal.com/aleksandrkonstantinov/1-hour-co-working";

/** The FMF page. /build/mastermind and /mastermind redirect here. */
export const FMF_PAGE_PATH = "/build/fmf";
/** @deprecated old name. */
export const MASTERMIND_PAGE_PATH = FMF_PAGE_PATH;

export const FMF_NAME = "FMF";
export const FMF_TAGLINE = "Discover Founder-Market Fit in Three Days, Guaranteed";

export type FmfDates = {
  /** Last Quarter moon = start of Planning (new Equilibrium cycle), Mexico City local time (UTC-06:00, no DST since 2022). */
  lastQuarter: string;
  /** First live day: the first Monday on/after the Last Quarter (YYYY-MM-DD, Mexico City). */
  monday: string;
  /** Second live day: the Wednesday after it. */
  wednesday: string;
};

export const FMF_DATES: readonly FmfDates[] = [
  { lastQuarter: "2026-12-01T00:08-06:00", monday: "2026-12-07", wednesday: "2026-12-09" },
  { lastQuarter: "2026-12-30T12:59-06:00", monday: "2027-01-04", wednesday: "2027-01-06" },
  { lastQuarter: "2027-01-29T04:55-06:00", monday: "2027-02-01", wednesday: "2027-02-03" },
  { lastQuarter: "2027-02-27T23:16-06:00", monday: "2027-03-01", wednesday: "2027-03-03" },
  { lastQuarter: "2027-03-29T18:53-06:00", monday: "2027-03-29", wednesday: "2027-03-31" },
  { lastQuarter: "2027-04-28T14:17-06:00", monday: "2027-05-03", wednesday: "2027-05-05" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mon Dec 7 + Wed Dec 9, 2026", read straight from the date strings (no timezone shift). */
export const formatFmfDates = (d: FmfDates): string => {
  const [y1, m1, d1] = d.monday.split("-").map(Number);
  const [y2, m2, d2] = d.wednesday.split("-").map(Number);
  const mon = `Mon ${MONTHS[m1 - 1]} ${d1}`;
  const wed = `Wed ${MONTHS[m2 - 1]} ${d2}`;
  return y1 === y2 ? `${mon} + ${wed}, ${y2}` : `${mon}, ${y1} + ${wed}, ${y2}`;
};

/** Each FMF as a live window, Monday 00:00 to Thursday 00:00 Mexico City (the three days). */
export const fmfLiveWindows = (): { from: string; until: string }[] =>
  FMF_DATES.map((d) => {
    const end = new Date(`${d.wednesday}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    return { from: `${d.monday}T00:00:00-06:00`, until: `${end.toISOString().slice(0, 10)}T00:00:00-06:00` };
  });

/** The next FMF whose Wednesday has not passed yet (Mexico City), or the last listed one. */
export const nextFmfDates = (now: Date = new Date()): FmfDates => {
  const windows = fmfLiveWindows();
  const i = windows.findIndex((w) => now.getTime() < Date.parse(w.until));
  return FMF_DATES[i === -1 ? FMF_DATES.length - 1 : i];
};
