/**
 * People Directory helpers (spec A6, issue #390). Pure, so they are unit-tested.
 */

/**
 * Where a directory row opens. Root slug `/:username` reads through the audience-aware profile
 * function; the legacy `/profile/:userId` route reads game_profiles directly, which only the
 * owner can do, so it is only a fallback for rows without a username.
 */
export const directoryProfilePath = (username: string | null | undefined, userId: string) => {
  if (!username) return `/profile/${userId}`;
  // A few usernames are shadowed by a static page at the same root slug (/sasha is the designed
  // founder page, with no Write button). Residents open the standard profile at /profile/u/:username.
  if (STATIC_PAGE_USERNAMES.has(username.toLowerCase())) return `/profile/u/${username}`;
  return `/${username}`;
};

/**
 * Usernames whose root slug is a static page or a redirect to one (App.tsx: /sasha is the founder
 * page; /aleksandr, /alexander and /integralevolution redirect to it), not the standard resident
 * profile. Keep in sync with those routes. (#440)
 */
export const STATIC_PAGE_USERNAMES: ReadonlySet<string> = new Set([
  "sasha",
  "aleksandr",
  "alexander",
  "integralevolution",
]);

/** The founder's public spelling. The profile row may still carry the short name "Sasha". */
export const FOUNDER_USERNAME = "sasha";
export const FOUNDER_PUBLIC_NAME = "Aleksandr Konstantinov";

/** Full name to show for a resident. The founder always reads as the public spelling. */
export function residentDisplayName(
  username: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  if (username?.toLowerCase() === FOUNDER_USERNAME) return FOUNDER_PUBLIC_NAME;
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

interface SearchablePerson {
  name: string;
  topTalent: string | null;
  archetype: string;
}

/** Text filter: every word typed must appear in the name, top talent or archetype (any case). */
export function matchesDirectoryQuery(person: SearchablePerson, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [person.name, person.topTalent ?? "", person.archetype].join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}
