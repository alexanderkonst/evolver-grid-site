/**
 * returnMetric — the two events behind the one number to Nov 14 (#287):
 * players who passed the top-talent reveal and came back on another day.
 *
 *   reveal_seen  the reveal card was shown            (metadata.talent)
 *   game_open    a game route mounted, once per local calendar day per device
 *                                                     (metadata.has_result, .locale)
 *
 * Both ride `trackFunnelEvent`, so they inherit `metadata.player_id` (and `user_id` when
 * signed in), the existing localStorage retry queue, and the rule that a failed insert never
 * reaches the player. No new table. Readout: docs/specs/metrics/return_metric.sql.
 *
 * Privacy: metadata carries a talent name, a boolean, a locale code and a date. No email, no
 * display name. Every storage access is guarded; blocked storage means "send nothing", never
 * "break the page".
 */

import { trackFunnelEvent } from "@/lib/funnelAnalytics";
import { hasGuestTopTalentResult } from "@/lib/firstVisit";
import { pathWithoutLocale } from "@/i18n/localeScope";

/** Last local calendar day (YYYY-MM-DD) a `game_open` was sent from this device. */
export const GAME_OPEN_KEY = "fytt_game_open_date";
/** JSON array of talent names whose `reveal_seen` this device already sent. */
export const REVEAL_SEEN_KEY = "fytt_reveal_seen_talents";

const AUTH_TOKEN_KEY = "evolver-auth-token";

const pad = (n: number): string => String(n).padStart(2, "0");

/** The local (not UTC) calendar day of `d`, as YYYY-MM-DD. */
export const localDateKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * True for the routes that count as "the game": `/` (the title screen), `/village` and
 * `/game/*`. Locale prefixes (`/es`, `/ru`) are stripped, though the router already strips
 * them through its basename. `/?path=…` is the pre-game outreach landing (App.tsx RootRoute
 * renders JourneyPage there), so it is not a game open.
 */
export function isGameRoute(pathname: string, search = ""): boolean {
  const path = pathWithoutLocale(pathname);
  if (path === "/") return !new URLSearchParams(search).has("path");
  return (
    path === "/village" ||
    path.startsWith("/village/") ||
    path === "/game" ||
    path.startsWith("/game/")
  );
}

/** A finished reading on this device, or a signed-in session (whose saved result we do not look up). */
const hasResult = (): boolean => {
  if (hasGuestTopTalentResult()) return true;
  try {
    return !!window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return false;
  }
};

/**
 * Send `game_open` unless one already went out from this device today (local calendar day).
 * Returns true when an event was sent. The day is written before the send: the send itself
 * already survives failure through the funnel queue.
 */
export function trackGameOpen(locale: string, now: Date = new Date()): boolean {
  const today = localDateKey(now);
  try {
    if (window.localStorage.getItem(GAME_OPEN_KEY) === today) return false;
    window.localStorage.setItem(GAME_OPEN_KEY, today);
  } catch {
    return false; // Cannot remember, so stay silent rather than send on every mount.
  }
  void trackFunnelEvent({
    step: "game_open",
    metadata: { has_result: hasResult(), locale, local_date: today },
  });
  return true;
}

const readSeenTalents = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(REVEAL_SEEN_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

/**
 * Send `reveal_seen` for a talent once per device (guest and signed-in alike). A redo that
 * lands on a different talent is a new reveal and sends again. Returns true when sent.
 */
export function trackRevealSeen(talent: string, now: Date = new Date()): boolean {
  const name = talent.trim();
  if (!name) return false;
  const key = name.toLowerCase();
  const seen = readSeenTalents();
  if (seen.includes(key)) return false;
  try {
    window.localStorage.setItem(REVEAL_SEEN_KEY, JSON.stringify([...seen, key].slice(-20)));
  } catch {
    return false; // Cannot remember: a re-render must not become a second reveal.
  }
  void trackFunnelEvent({
    step: "reveal_seen",
    metadata: { talent: name, local_date: localDateKey(now) },
  });
  return true;
}
