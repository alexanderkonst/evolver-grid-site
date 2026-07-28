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

import { createHash } from "node:crypto";

const FOUNDER_ALIASES = new Set([
  "sasha",
  "alexander",
  "alexander konstantinov",
  "konstantinov",
  "aleksandr",
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

/**
 * Build an anonymizer from the parsed CRM tracker (readBroadcastTracker()
 * output) plus any extra raw identity strings the caller supplies (e.g. the
 * pulse log's own structured `who:` / `actors:` fields, which sometimes name
 * a contact — like "Andrey Talalaev" — before they ever make it into the
 * CRM tracker). Call once per emit run and reuse across both snapshot
 * scripts so "Oyi" always maps to the same token whether it's mentioned in
 * the CRM offer ledger or in pulse-log prose.
 */
export function buildAnonymizer(crmData, extraRawIdentities = []) {
  // Pass 1: collect every name-shaped word sequence we can find in the
  // identity-bearing fields of the tracker (plus any extra sources).
  const entries = [];
  const registerRaw = (raw) => {
    for (const segment of splitIdentitySegments(raw)) {
      const nameWords = extractLeadingNameWords(segment);
      if (nameWords.length) entries.push(nameWords);
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

  // Pass 2: two-word ("full name") entries are treated as distinct
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

  // Pass 3: assign a stable token per full-name identity, and register the
  // full name + last name as aliases for it. The first name is only added
  // as an alias when it's unambiguous — i.e. exactly one known full name
  // starts with it — so "Andrey" alone (ambiguous between two contacts)
  // does not get merged into either.
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
    // Last name: fairly unique, safe to alias unconditionally (first
    // registration wins on rare collision).
    const lastWord = words[words.length - 1];
    if (!aliasToToken.has(lastWord)) aliasToToken.set(lastWord, token);
    // First name: only alias it if this is the ONLY full name starting
    // with it, otherwise a lone mention of that first name is ambiguous
    // and must not be merged into either identity.
    const firstWord = words[0];
    const owners = firstWordOwners.get(firstWord.toLowerCase());
    if (owners && owners.size === 1 && !aliasToToken.has(firstWord)) {
      aliasToToken.set(firstWord, token);
    }
  }

  // Single-word-only mentions (no full name ever seen for them, e.g. "Oyi",
  // "Devon", "Karime") get their own identity/token, unless they collide
  // with a first name already claimed above (in which case they refer to
  // that same person and were already handled) or are the founder.
  for (const name of singleNameEntries) {
    if (FOUNDER_ALIASES.has(name.toLowerCase())) continue;
    if (aliasToToken.has(name)) continue;
    if (firstWordOwners.has(name.toLowerCase())) continue; // ambiguous, see above
    aliasToToken.set(name, tokenFor(name));
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

  function scrubDeep(value) {
    if (typeof value === "string") return scrubSlug(scrub(value));
    if (Array.isArray(value)) return value.map(scrubDeep);
    if (value && typeof value === "object") {
      const out = {};
      for (const [key, val] of Object.entries(value)) out[key] = scrubDeep(val);
      return out;
    }
    return value;
  }

  return { scrub, scrubDeep, nameCount: aliasToToken.size / 1 /* aliases, not people */ };
}
