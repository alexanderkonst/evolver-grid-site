/**
 * People Directory helpers (spec A6, issue #390). Pure, so they are unit-tested.
 */

/**
 * Where a directory row opens. Root slug `/:username` reads through the audience-aware profile
 * function; the legacy `/profile/:userId` route reads game_profiles directly, which only the
 * owner can do, so it is only a fallback for rows without a username.
 */
export const directoryProfilePath = (username: string | null | undefined, userId: string) =>
  username ? `/${username}` : `/profile/${userId}`;

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
