/**
 * FMF (renamed from the Founder-Market Fit Discovery Mastermind, Sasha 2026-11-24):
 * "Discover Founder-Market Fit in Three Days, Guaranteed".
 * Single source for the FMF dates, the page path and the free live-session link, read by
 * the FMF page (src/pages/Mastermind.tsx), the Café event cards (src/pages/spaces/EventsSpace.tsx)
 * and the village place's live windows (src/data/villagePlaces.ts).
 *
 * Dates rule (Sasha, 2026-11-24): one FMF per Equilibrium lunar cycle. The cycle starts at the
 * astronomical new moon (America/Mexico_City). FMF meets live on the first Monday on or after
 * the new moon, and on the Wednesday after it (three days: Mon, Tue, Wed).
 * New-moon instants computed with PyEphem (Meeus-grade), weekdays checked in code
 * (src/lib/__tests__/fmfDates.test.ts). Extend the list before 2027-05.
 */

/** Free live session, Wed Nov 4, 9:00 Mexico City time. */
export const FMF_LIVE_SESSION_URL = "https://lu.ma/qpogt17o";
/** @deprecated old name, kept so older imports keep working. */
export const MASTERMIND_LIVE_SESSION_URL = FMF_LIVE_SESSION_URL;

/** The FMF page. /build/mastermind and /mastermind redirect here. */
export const FMF_PAGE_PATH = "/build/fmf";
/** @deprecated old name. */
export const MASTERMIND_PAGE_PATH = FMF_PAGE_PATH;

export const FMF_NAME = "FMF";
export const FMF_TAGLINE = "Discover Founder-Market Fit in Three Days, Guaranteed";

export type FmfDates = {
  /** New moon, Mexico City local time (UTC-06:00, no DST since 2022). */
  newMoon: string;
  /** First live day: the first Monday on/after the new moon (YYYY-MM-DD, Mexico City). */
  monday: string;
  /** Second live day: the Wednesday after it. */
  wednesday: string;
};

export const FMF_DATES: readonly FmfDates[] = [
  { newMoon: "2026-12-08T18:51:00-06:00", monday: "2026-12-14", wednesday: "2026-12-16" },
  { newMoon: "2027-01-07T14:24:00-06:00", monday: "2027-01-11", wednesday: "2027-01-13" },
  { newMoon: "2027-02-06T09:56:00-06:00", monday: "2027-02-08", wednesday: "2027-02-10" },
  { newMoon: "2027-03-08T03:29:00-06:00", monday: "2027-03-08", wednesday: "2027-03-10" },
  { newMoon: "2027-04-06T17:51:00-06:00", monday: "2027-04-12", wednesday: "2027-04-14" },
  { newMoon: "2027-05-06T04:58:00-06:00", monday: "2027-05-10", wednesday: "2027-05-12" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mon Dec 14 + Wed Dec 16, 2026", read straight from the date strings (no timezone shift). */
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
