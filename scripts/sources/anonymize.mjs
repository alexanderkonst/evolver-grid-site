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
 * output). Call once per emit run and reuse across both snapshot scripts so
 * "Oyi" always maps to the same token whether it's mentioned in the CRM
 * offer ledger or in pulse-log prose.
 */
export function buildAnonymizer(crmData) {
  // Pass 1: collect every name-shaped word sequence we can find in the
  // identity-bearing fields of the tracker.
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

  // Pass 2: group by first name, keeping the longest (most complete) form
  // seen for each — so "Kristina" and "Kristina Bikare" resolve to one
  // canonical identity and one token, regardless of which was seen first.
  const canonicalByFirstWord = new Map();
  for (const words of entries) {
    const key = words[0].toLowerCase();
    const existing = canonicalByFirstWord.get(key);
    if (!existing || words.length > existing.length) canonicalByFirstWord.set(key, words);
  }

  // Pass 3: assign a stable token per canonical identity, and register every
  // word of the canonical name (full name + first + last) as an alias for
  // that same token.
  const aliasToToken = new Map(); // exact-case alias -> token
  for (const canonicalWords of canonicalByFirstWord.values()) {
    const fullName = canonicalWords.join(" ");
    if (FOUNDER_ALIASES.has(fullName.toLowerCase())) continue;
    if (canonicalWords.some((w) => FOUNDER_ALIASES.has(w.toLowerCase()))) continue;
    const token = tokenFor(fullName);
    for (const alias of new Set([fullName, ...canonicalWords])) {
      if (!aliasToToken.has(alias)) aliasToToken.set(alias, token);
    }
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
