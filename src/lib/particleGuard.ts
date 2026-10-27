/**
 * particleGuard — moderation v0 for village particles (WP-17).
 *
 * A particle is one short line a player leaves at a place for whoever comes
 * next. This file is the client half of moderation (the DB check constraint is
 * the other): it strips contact details and links, keeps the text within
 * 3–140 characters, and kindly turns away a small multilingual (EN/ES/RU)
 * wordlist, matched case-insensitively and through common leetspeak.
 *
 * The list is deliberately small and matches whole words (or distinctive
 * stems) so ordinary words are not caught. Admins hide anything that slips
 * through with `update village_particles set status = 'hidden'`.
 */

export const PARTICLE_MIN = 3;
export const PARTICLE_MAX = 140;

export type ParticleRejection = "too_short" | "too_long" | "profanity";

export type ParticleCheck =
  | { ok: true; text: string }
  | { ok: false; reason: ParticleRejection; message: string };

export const PARTICLE_MESSAGES: Record<ParticleRejection, string> = {
  too_short: `A few more words, please: at least ${PARTICLE_MIN} characters.`,
  too_long: `Let it be a little shorter: up to ${PARTICLE_MAX} characters.`,
  profanity: "Could you say it another way? Whatever you leave here is meant to warm the next person.",
};

const length = (s: string) => Array.from(s).length;

/** Removes emails, links, bare domains, @handles and phone numbers; tidies spaces. */
export function stripContactDetails(raw: string): string {
  return raw
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, " ") // emails
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, " ") // links
    .replace(
      /\b[\w-]+(?:\.[\w-]+)*\.(?:com|net|org|io|co|me|app|dev|xyz|info|biz|ru|es|ua|by|kz|mx|ar|cl|uk|de|fr|us|ly|gl|link|site|online|shop|store)\b(?:\/\S*)?/gi,
      " ",
    ) // bare domains
    .replace(/(^|\s)@\w+/g, " ") // @handles
    .replace(/\+?\d(?:[\s().-]?\d){6,}/g, " ") // phone numbers: 7+ digits
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------- wordlist

/** Lowercase, drop diacritics (ё→е, й→и, ñ→n), so list and text fold alike. */
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "");

/** Whole words only. */
const WORDS = [
  // EN
  "fuck", "fucks", "fucked", "fucker", "fuckers", "fucking", "motherfucker", "shit", "shits", "shitty",
  "bullshit", "bitch", "bitches", "asshole", "assholes", "ass", "cunt", "cunts", "dick", "dicks",
  "cock", "cocks", "pussy", "bastard", "bastards", "slut", "sluts", "whore", "whores", "wanker",
  "twat", "nigger", "nigga", "faggot", "fag", "retard", "retarded", "kys",
  // ES
  "puta", "putas", "puto", "putos", "mierda", "joder", "jodete", "cabron", "cabrones",
  "pendejo", "pendejos", "pendeja", "verga", "culero", "culera", "chingar", "chingada", "chingado",
  "gilipollas", "hijueputa", "marica", "maricon", "malparido", "boludo", "pelotudo",
  // RU (transliterated mat is rare; common spellings included)
  "хуй", "хуя", "хуе", "хуи", "хер", "пизда", "пизды", "пизду", "пиздец", "сука", "суки", "сучка",
  "блять", "бля", "блядь", "ебать", "ебал", "ебаный", "ебан", "мудак", "мудаки", "говно", "залупа",
  "пидор", "пидорас", "пидар", "гандон", "шлюха", "шлюхи", "мразь", "долбоеб", "долбоёб",
].map(fold);

/** Distinctive stems: match any word that starts with them. */
const STEMS = [
  "fuck", "shit", "bitch", "asshole", "motherfuck", "cunt", "nigger", "faggot",
  "mierd", "pendej", "gilipoll", "hijueput", "malpari", "cabron", "maricon", "chingad",
  "хуй", "хуев", "хуел", "пизд", "ебан", "ебат", "еблан", "ебуч", "ебну", "заеб", "уеб", "пидор", "пидар",
  "блят", "блядь", "бляд", "мудак", "мудил", "говн", "залуп", "сучар", "сучк", "гондон", "долбоеб", "ебис",
].map(fold);

const WORD_SET = new Set(WORDS);

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
  "@": "a", "$": "s", "!": "i", "|": "i", "€": "e", "£": "l", "+": "t", v: "u",
};

/** Latin lookalikes → Cyrillic, to catch «хуй» typed with a Latin x. */
const TO_CYRILLIC: Record<string, string> = {
  a: "а", b: "в", c: "с", e: "е", h: "н", k: "к", m: "м", o: "о", p: "р", t: "т", x: "х", y: "у",
};

const applyMap = (s: string, map: Record<string, string>) =>
  Array.from(s)
    .map((ch) => map[ch] ?? ch)
    .join("");

const onlyLetters = (s: string) => s.replace(/[^\p{L}]+/gu, "");

/** Letters repeated 3+ times ("fuuuuck") collapse to one. */
const squeeze = (s: string) => s.replace(/(\p{L})\1{2,}/gu, "$1");

function matchesList(word: string): boolean {
  if (!word) return false;
  if (WORD_SET.has(word)) return true;
  return STEMS.some((stem) => word.startsWith(stem));
}

/** Every reading of one whitespace-separated token that we check against the list. */
function readings(token: string): string[] {
  const folded = fold(token);
  const trimmed = folded.replace(/^[^\p{L}\p{N}@$!|€£+]+|[^\p{L}\p{N}@$!|€£+]+$/gu, "");
  // "great!" must not become "greati": also try with edge punctuation stripped first.
  const edgeless = trimmed.replace(/^[@$!|€£+]+|[!|+]+$/gu, "");
  const bases = new Set([trimmed, edgeless, trimmed.replace(/[._\-*]+/g, "")]);
  const out = new Set<string>();
  bases.forEach((base) => {
    const leet = applyMap(base, LEET);
    [base, leet].forEach((candidate) => {
      const letters = squeeze(onlyLetters(candidate));
      out.add(letters);
      out.add(onlyLetters(applyMap(letters, TO_CYRILLIC)));
    });
  });
  return Array.from(out).filter(Boolean);
}

/** True when the text contains a word from the small EN/ES/RU list. */
export function containsProfanity(text: string): boolean {
  const tokens = text.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    if (readings(token).some(matchesList)) return true;
  }

  // "f u c k": a run of single letters read as one word.
  let run = "";
  for (const token of [...tokens, ""]) {
    if (Array.from(token).length === 1 && /[\p{L}\p{N}@$]/u.test(token)) {
      run += token;
      continue;
    }
    if (run.length >= 3 && readings(run).some(matchesList)) return true;
    run = "";
  }
  return false;
}

// ---------------------------------------------------------------- the guard

/** Clean and validate a particle. On success `text` is what should be stored. */
export function checkParticle(raw: string): ParticleCheck {
  const text = stripContactDetails(raw);
  const size = length(text);
  if (size < PARTICLE_MIN) return reject("too_short");
  if (size > PARTICLE_MAX) return reject("too_long");
  if (containsProfanity(text)) return reject("profanity");
  return { ok: true, text };
}

function reject(reason: ParticleRejection): ParticleCheck {
  return { ok: false, reason, message: PARTICLE_MESSAGES[reason] };
}
