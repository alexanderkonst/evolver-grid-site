/**
 * firstVisit — who gets the wordless first minute on `/` (WP-18).
 *
 * Design: docs/02-strategy/game_of_being_you.md §14.2 (Journey J0). The intro is for
 * a browser that has never been here: no flag, no signed-in session, no guest save.
 * Everyone else goes straight to the title menu.
 *
 * The check is synchronous (localStorage only) so a returning player never sees the
 * intro flash. A signed-in player whose token is somewhere unexpected is caught by the
 * async session check in WordlessIntro. All storage access is guarded: private mode
 * and blocked storage must never break the homepage.
 */

export const INTRO_SEEN_KEY = "fytt:wordless-intro-seen:v1";

/**
 * NEW GAME and the splash ENTER go here: straight to the first Zone of Genius question
 * (the Your AI dialogue), with no Reception scene, module intro or route choice in between.
 * The village follows the answer (the reveal ends in «Enter the village»).
 */
export const BEGIN_PARAM = "begin";
export const NEW_GAME_PATH = `/zone-of-genius/entry?${BEGIN_PARAM}=1`;

/** True when the URL asks the test to open on its first question. Onboarding (`/start`) keeps its own flow. */
export function wantsFirstQuestion(search: URLSearchParams): boolean {
  return search.get(BEGIN_PARAM) === "1" && !(search.get("return") ?? "").includes("/start");
}

/**
 * Any of these means this browser already holds a player: a Supabase session, a guest
 * profile, or a saved Top Talent result.
 */
const SAVED_GAME_KEYS = [
  "evolver-auth-token",
  "game_profile_id",
  "fytt:transition-quiz-result:v1",
  "guest_appleseed_data",
] as const;

export function hasSavedGame(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return SAVED_GAME_KEYS.some((key) => !!window.localStorage.getItem(key));
  } catch {
    return false;
  }
}

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return !!window.localStorage.getItem(INTRO_SEEN_KEY);
  } catch {
    // Storage blocked: we cannot remember, so do not trap the player in the intro.
    return true;
  }
}

export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* private mode: the intro may show again, nothing breaks */
  }
}

/** True only for a fresh browser: no flag, no saved game, no stored session. */
export function shouldShowWordlessIntro(): boolean {
  return !hasSeenIntro() && !hasSavedGame();
}

/** Where a guest's finished Top Talent reading waits on this device (written by saveToDatabase.ts). */
const GUEST_APPLESEED_KEY = "guest_appleseed_data";

/**
 * The guest's finished Top Talent reading, or null. Read-only: it is the payload the
 * «Save your character» flow sends. The Transition Quiz marker is a different result and is
 * not counted here: it holds no reading to save.
 */
export function readGuestTopTalentPayload(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_APPLESEED_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function hasGuestTopTalentResult(): boolean {
  return readGuestTopTalentPayload() !== null;
}

/** The decorative glyphs the reveal strips from a talent name (see RevelatoryHero). */
const stripDecorativeGlyphs = (name: string): string => name.replace(/[✦✧◆◇❖✱★☆]/g, "").trim();

/**
 * The name of the guest's top talent from the reading kept on this device
 * (`vibrationalKey.name`, the same value the reveal shows), or null. Read-only.
 */
export function readGuestTalentName(): string | null {
  const vk = readGuestTopTalentPayload()?.vibrationalKey;
  const name = vk && typeof vk === "object" ? (vk as { name?: unknown }).name : null;
  const clean = typeof name === "string" ? stripDecorativeGlyphs(name) : "";
  return clean || null;
}

/**
 * True on `/` for a returning guest: a finished reading with a talent name is kept on this
 * device and no account session is stored. Synchronous (localStorage only), like the wordless
 * intro check, so the welcome-back never flashes after the menu. A signed-in player has
 * «Load game»; the signed-out keys are only ever read, never written.
 */
export function shouldShowWelcomeBack(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("evolver-auth-token")) return false;
  } catch {
    return false;
  }
  return readGuestTalentName() !== null;
}
