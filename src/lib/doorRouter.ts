/**
 * doorRouter — first-visit door (Day 139-ish, Sasha 2026-07-30).
 *
 * Rule: a FIRST-TIME anonymous visitor landing on `/` meets the quiz
 * (`/quiz`) instead of the homepage. Returning visitors (marker set,
 * or any `evolver_*` localStorage key already present) and logged-in
 * users keep seeing the current homepage/platform experience.
 *
 * Flip QUIZ_FIRST_DOOR to false to restore the classic homepage for
 * everyone — one-line rollback, no other code touched.
 */
export const QUIZ_FIRST_DOOR = true;

/** Marker set the first time a visitor "sees" the door decision — either
 * because they got redirected to /quiz, or because they landed on /quiz
 * directly. Second visit to `/` in either case shows the real homepage. */
export const DOOR_SEEN_KEY = "evolver_door_seen";

// evolver_theme_colors is written unconditionally by ThemeProvider on
// EVERY app mount (first visit included), so it carries no "has been
// here before" signal — including it would make every visitor look
// "returning" the instant React commits. evolver_door_seen is this
// router's own marker, checked separately above. Both are excluded so
// the remaining keys (quiz state, skin, entry path, etc.) are the ones
// that actually only show up after real prior activity.
const NON_SIGNAL_KEYS = new Set(["evolver_theme_colors", DOOR_SEEN_KEY]);

function hasAnyEvolverKey(): boolean {
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("evolver_") && !NON_SIGNAL_KEYS.has(key)) return true;
    }
  } catch {
    /* private mode / storage blocked — treat as no prior state */
  }
  return false;
}

function looksLikeBotOrCrawler(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pagespeed/i.test(ua);
}

/**
 * Returns true if this load of `/` should redirect to `/quiz`.
 * Call this from the root route (JourneyPage) before render.
 * Caller is responsible for actually navigating AND for calling
 * markDoorSeen() once it decides to redirect.
 */
export function shouldRouteToQuiz(search: string, isAuthed: boolean): boolean {
  if (!QUIZ_FIRST_DOOR) return false;
  if (isAuthed) return false;
  if (looksLikeBotOrCrawler()) return false;

  const params = new URLSearchParams(search);
  if (params.has("path")) return false; // match funnel etc.
  if (params.has("r")) return false;
  if (params.has("fresh")) return false;

  try {
    if (window.localStorage.getItem(DOOR_SEEN_KEY)) return false;
  } catch {
    return false; // can't read storage → don't risk redirect-looping a bot/edge case
  }

  if (hasAnyEvolverKey()) {
    markDoorSeen(); // returning-in-spirit visitor; stop checking from now on
    return false;
  }

  return true;
}

export function markDoorSeen(): void {
  try {
    window.localStorage.setItem(DOOR_SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
}
