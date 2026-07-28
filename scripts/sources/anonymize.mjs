// Shared anonymization for generated snapshots (crm-snapshot.json,
// project-pulse-snapshot.json).
//
// Both snapshots are derived from private ledgers (the CRM tracker + the
// pulse log) but end up in surfaces that are NOT private: bundled into the
// shipped JS (src/generated/*.json is statically imported by
// CockpitDashboard.tsx and Admin.tsx) and served at an unauthenticated public
// URL (public/generated/*.json, fetched at runtime by the
// generate-pulse-brief and equilibrium-telegram-bot edge functions). Real
// contact names must never reach either surface.
//
// Approach: build the name list DYNAMICALLY from the CRM tracker itself
// (Master Table contacts, Offer Ledger names, Upcoming Events participants,
// Energy Leak Audit, Intuitive Launch batches) rather than a hardcoded
// regex list, so it stays current as contacts are added or removed. Each
// distinct person gets a stable token derived from a hash of their fullest
// known name — same person always maps to the same token across runs,
// regardless of which snapshot or field mentions them first.
//
// Sasha's own name is deliberately excluded — he is the site owner/founder,
// not private CRM data, and pulse prose is written in his first-person voice
// ("Sasha to send Gleb the Reflection Proposal...").
//
// Cyrillic support: a large share of Sasha's contacts and pulse-log prose is
// Russian, and the same person often appears in BOTH scripts (Gleb / Глеб).
// See the "Cyrillic" section below for the transliteration + fuzzy-match
// linking, the declension-stemming approach, and its documented failure
// modes.

import { createHash } from "node:crypto";

const FOUNDER_ALIASES = new Set([
  "sasha",
  "alexander",
  "alexander konstantinov",
  "konstantinov",
  "aleksandr",
  "саша",
  "александр",
  "александр константинов",
  "константинов",
]);

// Words that are capitalized in these fields but are not person names —
// campaign labels, section words, sentence-initial words, etc. Kept
// deliberately generous: over-matching here just means a non-name word
// isn't scrubbed (safe), under-matching a real name is the actual risk.
const STOPWORDS = new Set([
  "all", "both", "each", "every", "next", "this", "that", "the", "for",
  "with", "from", "and", "via", "batch", "warm-base", "warm", "wave",
  "remainder", "direction", "call", "session", "sessions", "workshop",
  "pulse", "energy", "node", "offer", "offers", "ledger", "master",
  "table", "open", "items", "business", "build", "team", "founder",
  "community", "reflection", "proposal", "container", "pilot", "referral",
  "referrer", "segment", "stage", "agreement", "paid", "pending",
  "channel", "notes", "upcoming", "events", "log", "content", "pillars",
  "metrics", "week", "clicks", "emails", "quiz", "completions",
  "responses", "dms", "sent", "booked", "closed", "waiting", "replied",
  "free", "partnership", "cold", "advisor", "review", "monthly", "peer",
  "cadence", "working", "revision", "owed", "naming", "done", "planned",
  "scheduled", "interested", "yet", "meeting", "follow", "followup",
  "evolution", "portal", "bullseye", "adjacent", "bridge", "collaborator",
  "ecosystem", "builder", "ambassador", "track", "past", "zog", "collective",
  "hacker-house", "intensive", "priced", "boundary", "total", "revenue",
  "summary", "pipeline", "analytics", "surface", "posts",
]);

// Common capitalized Russian words that would otherwise look name-shaped —
// sentence-initial words, dialogue openers, section labels. Same
// over-generous-is-safe principle as STOPWORDS above.
const CYRILLIC_STOPWORDS = new Set([
  "сегодня", "завтра", "вчера", "встреча", "звонок", "предложение", "день",
  "неделя", "письмо", "клиент", "контакт", "приглашение", "договор",
  "оплата", "сессия", "воркшоп", "контейнер", "сообщество", "команда",
  "основатель", "всего", "следующий", "каждый", "оба", "это", "этот", "эта",
  "для", "или", "если", "когда", "после", "перед", "потому", "поэтому",
  "например", "также", "однако", "который", "которая", "которое", "которые",
  "спасибо", "привет", "здравствуйте", "пожалуйста", "хорошо", "отлично",
  "конечно", "может", "будет", "было", "есть", "нет", "да", "но", "и", "а",
  "он", "она", "они", "мы", "вы", "ты", "я",
]);

function isNameLikeWord(word) {
  if (!/^[A-Z][a-zA-Z'-]{2,}$/.test(word)) return false;
  if (word === word.toUpperCase()) return false; // e.g. BRIDGE, CLIENT tags
  if (STOPWORDS.has(word.toLowerCase())) return false;
  return true;
}

function tokenFor(canonicalName) {
  const hash = createHash("sha1").update(canonicalName.toLowerCase()).digest("hex");
  return `P-${hash.slice(0, 4).toUpperCase()}`;
}

function splitIdentitySegments(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/\/|->|·|&|,| and /gi)
    .map((segment) => segment.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
}

function extractLeadingNameWords(segment) {
  const words = segment.split(/\s+/).filter(Boolean);
  const nameWords = [];
  for (const raw of words) {
    const clean = raw.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
    if (!clean || !isNameLikeWord(clean)) break;
    nameWords.push(clean);
    if (nameWords.length === 2) break; // first + last name is enough
  }
  return nameWords;
}

// ---------------------------------------------------------------------------
// Cyrillic support
// ---------------------------------------------------------------------------

function isCyrillicNameLikeWord(word) {
  if (!/^[А-ЯЁ][а-яё'-]{2,}$/.test(word)) return false;
  if (word === word.toUpperCase()) return false;
  if (CYRILLIC_STOPWORDS.has(word.toLowerCase())) return false;
  return true;
}

function extractLeadingCyrillicNameWords(segment) {
  const words = segment.split(/\s+/).filter(Boolean);
  const nameWords = [];
  for (const raw of words) {
    const clean = raw.replace(/^[^А-Яа-яЁё]+|[^А-Яа-яЁё]+$/g, "");
    if (!clean || !isCyrillicNameLikeWord(clean)) break;
    nameWords.push(clean);
    if (nameWords.length === 2) break;
  }
  return nameWords;
}

// Russian given names and surnames decline (Глеб / Глеба / Глебу / Глебом /
// Глебе; Валенская / Валенской / Валенскую). Rather than a full morphological
// analyzer, this strips the longest matching case ending and requires the
// remaining stem to be at least MIN_STEM_LEN characters before accepting the
// strip — short names (e.g. "Женя", stem "жен" would collide with "жена" /
// "женщина" / "женский", all plausible in this corpus) fall back to matching
// only their exact nominative form. That's a deliberate, documented
// trade-off: shorter names lose some declension coverage in exchange for not
// corrupting ordinary Russian prose. See the residual-limitations note in
// docs/07-technology/deploy_pipeline.md.
const MIN_STEM_LEN = 4;
const CYRILLIC_CASE_SUFFIXES = [
  "ского", "скому", "ской", "скую", "скою",
  "ыми", "ими", "ая", "ое", "ые", "ых", "ым", "ом", "ем", "ам", "ям",
  "ах", "ях", "ов", "ев", "ей", "ой", "ию", "ью",
  "ы", "и", "е", "а", "я", "у", "ю", "ь",
].sort((a, b) => b.length - a.length);

function stemCyrillicWord(word) {
  const lower = word.toLowerCase();
  for (const suf of CYRILLIC_CASE_SUFFIXES) {
    if (lower.endsWith(suf) && word.length - suf.length >= MIN_STEM_LEN) {
      return word.slice(0, word.length - suf.length);
    }
  }
  return word;
}

// Practical (not academic) Cyrillic -> Latin transliteration, used only to
// fuzzy-match a Cyrillic name against an already-known Latin one (Глеб ->
// "gleb" -> matches Latin alias "Gleb"). Doesn't need to be a canonical
// standard — it only has to get close enough for edit-distance matching.
const TRANSLIT_MAP = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(word) {
  return word
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT_MAP[ch] ?? ch)
    .join("");
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[rows - 1][cols - 1];
}

// Fuzzy match with a length-proportional threshold — tuned loosely (~30%)
// so "Andrei" (Андрей transliterated) matches Latin "Andrey", and "Niya"
// (Ния transliterated) matches Latin "Nia", without matching unrelated
// names of similar length. Failure mode: two genuinely different short
// names can occasionally fall within the threshold of each other and get
// merged; there is no ground-truth identity resolution here, only string
// similarity.
function isFuzzyMatch(a, b) {
  const dist = levenshtein(a, b);
  const threshold = Math.max(1, Math.floor(Math.max(a.length, b.length) * 0.3));
  return dist <= threshold;
}

function deepCollectStrings(value, acc = []) {
  if (typeof value === "string") {
    acc.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) deepCollectStrings(v, acc);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) deepCollectStrings(v, acc);
  }
  return acc;
}

// High-confidence-only free-text scan: two CONSECUTIVE capitalized Cyrillic
// words (e.g. "Женя Валенская" sitting inside a `what_happened` sentence,
// never in a structured `name` column). Deliberately does not register lone
// capitalized Cyrillic words found in prose — Russian sentences routinely
// start with a capitalized common word, and scrubbing every one of those
// would shred the pulse log's Russian narrative text. Lone first names are
// instead only trusted from structured fields (contacts/offers/participants/
// who/actors), where "it's a name" is a much safer assumption.
function scanCyrillicPairs(text) {
  if (typeof text !== "string" || !text) return [];
  const tokens = text.split(/\s+/);
  const pairs = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const w1 = tokens[i].replace(/^[^А-Яа-яЁё]+|[^А-Яа-яЁё]+$/g, "");
    const w2 = tokens[i + 1].replace(/^[^А-Яа-яЁё]+|[^А-Яа-яЁё]+$/g, "");
    if (isCyrillicNameLikeWord(w1) && isCyrillicNameLikeWord(w2)) pairs.push([w1, w2]);
  }
  return pairs;
}

/**
 * Build an anonymizer from the parsed CRM tracker (readBroadcastTracker()
 * output) plus:
 *  - `extraRawIdentities`: extra raw identity strings (e.g. the pulse log's
 *    own structured `who:` / `actors:` fields, which sometimes name a
 *    contact — like "Andrey Talalaev" — before they ever make it into the
 *    CRM tracker).
 *  - `freeTextSource`: an arbitrary nested value (e.g. the full pulse
 *    `events` array, or the full CRM tracker object) that gets deep-scanned
 *    for high-confidence Cyrillic full-name mentions sitting in free prose
 *    rather than a structured name column (see scanCyrillicPairs above).
 *
 * Call once per emit run and reuse across both snapshot scripts so "Oyi" /
 * "Глеб" always maps to the same token everywhere it's mentioned.
 */
export function buildAnonymizer(crmData, extraRawIdentities = [], freeTextSource = null) {
  // Pass 1 (Latin): collect every name-shaped word sequence from the
  // identity-bearing fields of the tracker (plus any extra sources).
  const entries = [];
  const cyrillicEntries = [];
  const registerRaw = (raw) => {
    for (const segment of splitIdentitySegments(raw)) {
      const nameWords = extractLeadingNameWords(segment);
      if (nameWords.length) entries.push(nameWords);
      const cyrWords = extractLeadingCyrillicNameWords(segment);
      if (cyrWords.length) cyrillicEntries.push(cyrWords);
    }
  };

  for (const c of crmData?.contacts ?? []) registerRaw(c.name);
  for (const o of crmData?.offers ?? []) registerRaw(o.name);
  for (const e of crmData?.upcomingEvents ?? []) registerRaw(e.participants);
  for (const l of crmData?.energyLeaks ?? []) registerRaw(l.name);
  for (const batch of crmData?.intuitiveLaunch ?? []) {
    for (const item of batch.items ?? []) registerRaw(item.name);
  }
  for (const raw of extraRawIdentities) registerRaw(raw);

  // High-confidence Cyrillic full names found in free prose (see
  // scanCyrillicPairs) — this is what catches "Женя Валенская", which never
  // appears in a structured name column.
  if (freeTextSource) {
    for (const text of deepCollectStrings(freeTextSource)) {
      for (const pair of scanCyrillicPairs(text)) cyrillicEntries.push(pair);
    }
  }

  // Pass 2 (Latin): two-word ("full name") entries are treated as distinct
  // identities keyed by their exact full name — NOT grouped by first name
  // alone. Two different people who happen to share a first name (e.g.
  // "Andrey Kamyshan" and "Andrey Talalaev") must get two different tokens,
  // never merged.
  const fullNameGroups = new Map(); // "first last" (lowercase) -> canonicalWords
  const singleNameEntries = []; // lone first-name-only mentions
  for (const words of entries) {
    if (words.length >= 2) {
      const key = words.join(" ").toLowerCase();
      if (!fullNameGroups.has(key)) fullNameGroups.set(key, words);
    } else {
      singleNameEntries.push(words[0]);
    }
  }

  // Pass 3 (Latin): assign a stable token per full-name identity, and
  // register the full name + last name as aliases for it. The first name is
  // only added as an alias when it's unambiguous — i.e. exactly one known
  // full name starts with it — so "Andrey" alone (ambiguous between two
  // contacts) does not get merged into either.
  const aliasToToken = new Map(); // exact-case alias -> token
  const firstWordOwners = new Map(); // lowercase first word -> Set of full-name keys

  const isFounder = (words) =>
    FOUNDER_ALIASES.has(words.join(" ").toLowerCase()) ||
    words.some((w) => FOUNDER_ALIASES.has(w.toLowerCase()));

  for (const words of fullNameGroups.values()) {
    if (isFounder(words)) continue;
    const firstKey = words[0].toLowerCase();
    if (!firstWordOwners.has(firstKey)) firstWordOwners.set(firstKey, new Set());
    firstWordOwners.get(firstKey).add(words.join(" ").toLowerCase());
  }

  for (const words of fullNameGroups.values()) {
    if (isFounder(words)) continue;
    const fullName = words.join(" ");
    const token = tokenFor(fullName);
    if (!aliasToToken.has(fullName)) aliasToToken.set(fullName, token);
    const lastWord = words[words.length - 1];
    if (!aliasToToken.has(lastWord)) aliasToToken.set(lastWord, token);
    const firstWord = words[0];
    const owners = firstWordOwners.get(firstWord.toLowerCase());
    if (owners && owners.size === 1 && !aliasToToken.has(firstWord)) {
      aliasToToken.set(firstWord, token);
    }
  }

  for (const name of singleNameEntries) {
    if (FOUNDER_ALIASES.has(name.toLowerCase())) continue;
    if (aliasToToken.has(name)) continue;
    if (firstWordOwners.has(name.toLowerCase())) continue; // ambiguous, see above
    aliasToToken.set(name, tokenFor(name));
  }

  // --- Cyrillic identity resolution ----------------------------------------
  // Same full-name-vs-single-name split and same ambiguous-first-name
  // caution as the Latin pass above, but each resolved identity is checked
  // against the Latin alias space first (via transliteration + fuzzy match)
  // so a person named in both scripts gets ONE token, not two.
  const cyrFullNameGroups = new Map();
  const cyrSingleEntries = [];
  for (const words of cyrillicEntries) {
    if (words.length >= 2) {
      const key = words.join(" ").toLowerCase();
      if (!cyrFullNameGroups.has(key)) cyrFullNameGroups.set(key, words);
    } else {
      cyrSingleEntries.push(words[0]);
    }
  }

  const latinAliasKeys = [...aliasToToken.keys()];
  function findLinkedLatinToken(translitCandidate) {
    let best = null;
    let bestDist = Infinity;
    for (const alias of latinAliasKeys) {
      const aliasLower = alias.toLowerCase();
      const dist = levenshtein(translitCandidate, aliasLower);
      const threshold = Math.max(1, Math.floor(Math.max(translitCandidate.length, aliasLower.length) * 0.3));
      if (dist <= threshold && dist < bestDist) {
        bestDist = dist;
        best = aliasToToken.get(alias);
      }
    }
    return best;
  }

  const cyrFirstWordOwners = new Map();
  for (const words of cyrFullNameGroups.values()) {
    if (isFounder(words)) continue;
    const key = words[0].toLowerCase();
    if (!cyrFirstWordOwners.has(key)) cyrFirstWordOwners.set(key, new Set());
    cyrFirstWordOwners.get(key).add(words.join(" ").toLowerCase());
  }

  const cyrillicStemToToken = new Map(); // single stem (case-sensitive) -> token
  // Two-word full names ("Женя Валенская") must be replaced as ONE unit —
  // otherwise stem-by-stem replacement turns "Женя Валенская" into
  // "P-XXXX P-XXXX" (same token twice) instead of one token. Checked before
  // the single-stem pass in scrubCyrillic.
  const cyrillicPhraseStems = []; // [{ stems: [stem1, stem2], token }]

  const registerCyrillicWords = (words, token) => {
    for (const w of words) {
      const stem = stemCyrillicWord(w);
      if (!cyrillicStemToToken.has(stem)) cyrillicStemToToken.set(stem, token);
    }
  };

  for (const words of cyrFullNameGroups.values()) {
    if (isFounder(words)) continue;
    const translit = words.map(transliterate).join(" ");
    const linkedToken = findLinkedLatinToken(translit);
    const token = linkedToken ?? tokenFor(translit);
    registerCyrillicWords(words, token);
    if (words.length >= 2) {
      cyrillicPhraseStems.push({ stems: words.map(stemCyrillicWord), token });
    }
  }

  for (const name of cyrSingleEntries) {
    if (isFounder([name])) continue;
    const stem = stemCyrillicWord(name);
    if (cyrillicStemToToken.has(stem)) continue; // already resolved via a full name above
    if (cyrFirstWordOwners.has(name.toLowerCase())) continue; // ambiguous between two known full names
    const translit = transliterate(name);
    const linkedToken = findLinkedLatinToken(translit);
    const token = linkedToken ?? tokenFor(translit);
    cyrillicStemToToken.set(stem, token);
  }

  // Longest alias first so "Chris Milliken" is replaced whole before the
  // lone "Chris" / "Milliken" rules would otherwise fire on its pieces.
  const sortedAliases = [...aliasToToken.keys()].sort((a, b) => b.length - a.length);

  function scrub(text) {
    if (typeof text !== "string" || !text) return text;
    let out = text;
    for (const alias of sortedAliases) {
      const token = aliasToToken.get(alias);
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Case-sensitive on purpose: several real names here ("Will", "Max")
      // collide with ordinary English words when lowercased, and names are
      // always capitalized in prose the same way they appear in the tracker.
      out = out.replace(new RegExp(`\\b${escaped}\\b`, "g"), token);
    }
    return out;
  }

  // Lowercased alias index, used ONLY against snake_case slugs (pulse
  // `title`/`pulse` fields like `gleb_business_spiritual_integration_offer`)
  // where a real name can appear lowercased and would otherwise slip past
  // the case-sensitive `scrub` above. Deliberately not used against free
  // prose — that's where case-insensitive matching would corrupt ordinary
  // words ("will", "max").
  const aliasToTokenLower = new Map();
  for (const [alias, token] of aliasToToken) {
    const key = alias.toLowerCase();
    if (!aliasToTokenLower.has(key)) aliasToTokenLower.set(key, token);
  }
  const sortedAliasesLower = [...aliasToTokenLower.keys()].sort((a, b) => b.length - a.length);

  function scrubSlug(text) {
    if (typeof text !== "string" || !/^[a-z][a-z0-9_]*$/.test(text)) return text;
    let phrase = text.split("_").join(" ");
    for (const alias of sortedAliasesLower) {
      const token = aliasToTokenLower.get(alias);
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      phrase = phrase.replace(new RegExp(`\\b${escaped}\\b`, "gi"), token);
    }
    return phrase.split(" ").join("_");
  }

  // Cyrillic scrub: stem-based, Unicode-aware boundaries. JS's `\b` is
  // defined against `\w` = [A-Za-z0-9_], which does NOT include Cyrillic
  // letters — using `\b` here would silently fail to match at all. Uses
  // lookaround instead: not preceded/followed by another Cyrillic letter.
  const sortedCyrStems = [...cyrillicStemToToken.keys()].sort((a, b) => b.length - a.length);
  const cyrEscape = (stem) => stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function scrubCyrillic(text) {
    if (typeof text !== "string" || !text) return text;
    let out = text;
    // Two-word full names FIRST, replaced as a single unit — otherwise the
    // per-word pass below would replace each half independently and turn
    // "Женя Валенская" into "P-XXXX P-XXXX" (same token twice).
    for (const { stems, token } of cyrillicPhraseStems) {
      const pattern = stems
        .map((s) => `(?<![А-Яа-яЁё])${cyrEscape(s)}[а-яё]{0,3}(?![А-Яа-яЁё])`)
        .join("\\s+");
      out = out.replace(new RegExp(pattern, "g"), token);
    }
    for (const stem of sortedCyrStems) {
      const token = cyrillicStemToToken.get(stem);
      const escaped = cyrEscape(stem);
      // Stem + up to 3 more lowercase Cyrillic letters covers the standard
      // case endings (е/а/я/у/ю/ой/ем/ами/...) without over-reaching into
      // an unrelated longer word.
      out = out.replace(
        new RegExp(`(?<![А-Яа-яЁё])${escaped}[а-яё]{0,3}(?![А-Яа-яЁё])`, "g"),
        token,
      );
    }
    return out;
  }

  function scrubDeep(value) {
    if (typeof value === "string") return scrubCyrillic(scrubSlug(scrub(value)));
    if (Array.isArray(value)) return value.map(scrubDeep);
    if (value && typeof value === "object") {
      const out = {};
      for (const [key, val] of Object.entries(value)) out[key] = scrubDeep(val);
      return out;
    }
    return value;
  }

  // Point 3: residual scan. Looks over ALREADY-SCRUBBED output for any
  // capitalized-Cyrillic-word-pair or lone name-like word that survived —
  // i.e. something that looked like a person but this pass could not
  // attribute to a token. Reported, never silently dropped. High-confidence
  // pairs are the primary signal; lone words are included too since this is
  // a report for human review, not an auto-action, so a slightly noisier
  // list is the safer failure mode.
  function scanForResidualCyrillicNames(scrubbedValue) {
    const found = new Set();
    for (const text of deepCollectStrings(scrubbedValue)) {
      for (const [w1, w2] of scanCyrillicPairs(text)) found.add(`${w1} ${w2}`);
      for (const raw of text.split(/\s+/)) {
        const clean = raw.replace(/^[^А-Яа-яЁё]+|[^А-Яа-яЁё]+$/g, "");
        if (isCyrillicNameLikeWord(clean)) found.add(clean);
      }
    }
    return [...found];
  }

  return {
    scrub,
    scrubDeep,
    scanForResidualCyrillicNames,
    nameCount: aliasToToken.size + cyrillicStemToToken.size,
  };
}
