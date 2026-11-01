/**
 * displayName: the one name the game calls a player (cult spec §5 #4, §6 W2).
 *
 * Rail, Home, Reception and the card all read it, so they cannot disagree.
 *
 *   first name from the profile → a name the player gave in the game → none
 *
 * - A guest has no name. `displayName` returns null for anyone who is not signed in, so a stale
 *   profile, a cached row or another person's page can never put a stranger's name on a guest's
 *   screen. Where a word is needed, `displayNameOrYou` says «you».
 * - A signed-in player never reads «guest»: a profile whose first name is «Guest» (or an email
 *   address) counts as no name, and the surface simply drops the name.
 *
 * Pure: no React, no network. The first word only, control characters removed.
 */

export type NameSource = {
  /** True only for a real session. A guest passes false whatever else is loaded. */
  signedIn: boolean;
  /** `game_profiles.first_name`. A full name is cut to its first word. */
  firstName?: string | null;
  /** A name the player gave inside the game, used when the profile has no first name. */
  givenName?: string | null;
};

const MAX_NAME_LENGTH = 40;

/** «Guest» in the three languages of the game, plus the placeholders older rows hold. */
const PLACEHOLDER_NAMES = new Set(["guest", "invitado", "invitada", "гость", "player", "user", "anonymous"]);

/** First word of a name with control characters removed; null when nothing usable is left. */
const cleanFirstWord = (raw: string | null | undefined): string | null => {
  const printable = Array.from(raw ?? "", (ch) => {
    const code = ch.charCodeAt(0);
    return code < 32 || code === 127 ? " " : ch;
  }).join("");
  const word = printable.trim().split(/\s+/)[0]?.slice(0, MAX_NAME_LENGTH);
  if (!word) return null;
  // An email address is an account, not a name.
  if (word.includes("@")) return null;
  if (PLACEHOLDER_NAMES.has(word.toLowerCase())) return null;
  return word;
};

/** The player's name, or null: a guest, or a signed-in player with no name yet. */
export const displayName = ({ signedIn, firstName, givenName }: NameSource): string | null => {
  if (!signedIn) return null;
  return cleanFirstWord(firstName) ?? cleanFirstWord(givenName);
};

/** Like `displayName`, but a player with no name reads «you» (`youWord`, from the catalog). */
export const displayNameOrYou = (source: NameSource, youWord = "you"): string => displayName(source) ?? youWord;
