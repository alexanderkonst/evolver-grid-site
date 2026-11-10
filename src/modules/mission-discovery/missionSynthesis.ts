/**
 * Mission Discovery — one-sentence synthesis extraction (Issue #48,
 * Sasha 2026-10-14).
 *
 * Extracted from MissionDiscoveryLanding so the parsing rules are
 * unit-testable without rendering the component, and so the new
 * "accept a bare single sentence" rule (P1 #5) lives beside the
 * existing JSON-first / legacy-marker extraction.
 *
 * The prompt asks the AI for a JSON object with `mission_one_sentence`,
 * but real-world pastes also arrive as:
 *   - the legacy "1 sentence synthesis: <sentence>" marker line, or
 *   - just the one sentence itself, with no label and no JSON.
 * The last case used to dead-end on a "Couldn't find a single-sentence
 * summary" toast + an empty field; now it's accepted verbatim.
 */

// ─── Legacy "1 sentence synthesis:" marker ─────────────────────────────
// Tolerant of emphasis variants (**bold**, blockquote >, One-/1-sentence).
// GLOBAL so we can take the LAST match — the prompt embeds an example
// whose marker the AI may echo before producing its own synthesis.
const SYNTHESIS_REGEX =
  /(?:\*{0,2})\s*(?:1|one)[\s\-–]?sentence\s+synthesis\s*[:\-—]\s*(?:\*{0,2})\s*(.+?)\s*(?:\*{0,2})\s*$/gim;

export const stripMarkdown = (s: string): string =>
  s.trim().replace(/^[\s>*]+|[\s>*]+$/g, "");

// ─── JSON-first (new prompt shape) ─────────────────────────────────────
// Pull `mission_one_sentence` from the LAST JSON object in the paste (the
// AI's own output follows any echoed example).
//
// Bug (Eva, 2026-11-10): real pastes failed with "Не нашли итоговую фразу":
//   - the old greedy /\{[\s\S]*\}/ glued every block into one invalid match;
//   - chat apps put real line breaks inside strings, curly quotes, or a
//     trailing comma, so JSON.parse threw;
//   - the AI sometimes writes the key without the JSON being parseable at all.
// Now: balanced-brace scan, light repair, and a key-level regex fallback.

/** Every top-level {...} block, found by brace balance (string-aware). */
const findJsonBlocks = (raw: string): string[] => {
  const blocks: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = depth > 0;
    else if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}" && depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) {
        blocks.push(raw.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return blocks;
};

/** Repair what chat apps do to JSON: curly quotes, raw newlines in strings, trailing commas. */
const repairJson = (block: string): string => {
  let s = block.replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"');
  let out = "";
  let inString = false;
  let escaped = false;
  for (const c of s) {
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      else if (c === "\n") { out += "\\n"; continue; }
      else if (c === "\r") continue;
      else if (c === "\t") { out += " "; continue; }
    } else if (c === '"') inString = true;
    out += c;
  }
  return out.replace(/,\s*([}\]])/g, "$1");
};

const sentenceFromParsed = (parsed: any): string | null =>
  typeof parsed?.mission_one_sentence === "string" && parsed.mission_one_sentence.trim()
    ? parsed.mission_one_sentence.trim()
    : null;

// Key-level fallback: the value of the LAST "mission_one_sentence" key.
const KEY_REGEX = /["\u201C\u201D]?mission_one_sentence["\u201C\u201D]?\s*:\s*["\u201C\u201D]([\s\S]*?)["\u201C\u201D]\s*(?:[,}]|$)/g;

export const extractJsonOneSentence = (raw: string): string | null => {
  const blocks = findJsonBlocks(raw);
  for (let i = blocks.length - 1; i >= 0; i--) {
    for (const candidate of [blocks[i], repairJson(blocks[i])]) {
      try {
        const sentence = sentenceFromParsed(JSON.parse(candidate));
        if (sentence) return sentence;
      } catch {
        // try the repaired form, then earlier blocks
      }
    }
  }
  KEY_REGEX.lastIndex = 0;
  let last: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = KEY_REGEX.exec(raw)) !== null) {
    const v = m[1].replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
    if (v) last = v;
  }
  return last;
};

/** JSON first, then the legacy marker. Returns null if neither is present. */
export const extractOneSentence = (raw: string): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();

  const fromJson = extractJsonOneSentence(trimmed);
  if (fromJson) return stripMarkdown(fromJson);

  SYNTHESIS_REGEX.lastIndex = 0;
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = SYNTHESIS_REGEX.exec(trimmed)) !== null) {
    if (m[1]) matches.push(m[1]);
  }
  if (matches.length > 0) {
    return stripMarkdown(matches[matches.length - 1]);
  }
  return null;
};

/**
 * Issue #48 P1 #5: when the user pastes a bare sentence (no JSON, no
 * synthesis label), treat it AS the mission instead of toasting "no
 * summary found." We accept only input that genuinely reads as one short
 * sentence so a pasted multi-paragraph essay still routes to the
 * type-your-sentence fallback.
 */
export const isLikelyBareSentence = (raw: string): boolean => {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  // Too long to be a single sentence — almost certainly a full response.
  if (trimmed.length > 300) return false;
  // Looks like JSON — let the JSON extractor own it (and don't paste braces).
  if (/[{}]/.test(trimmed)) return false;
  // Multiple paragraphs — not a single sentence.
  if (/\n\s*\n/.test(trimmed)) return false;
  // Count sentences by terminal punctuation followed by whitespace or end.
  const sentences = trimmed
    .split(/[.!?]+(?:\s+|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length <= 1;
};

/**
 * Resolve the mission sentence from a raw paste: structured extraction
 * first, then the bare-sentence fallback. Null means "ask the user to
 * type their sentence."
 */
export const resolveMissionSentence = (raw: string): string | null => {
  const extracted = extractOneSentence(raw);
  if (extracted) return extracted;
  if (isLikelyBareSentence(raw)) return raw.trim();
  // Eva (2026-11-10): "Фразу в конце писала" — the essay ends with the one
  // sentence as its own last paragraph, without JSON or a label. Take it.
  const paragraphs = raw.trim().split(/\n\s*\n/).map((p) => stripMarkdown(p)).filter(Boolean);
  if (paragraphs.length > 1) {
    const rawLast = paragraphs[paragraphs.length - 1];
    const quoted = /^["«“].*["»”]$/s.test(rawLast);
    const last = rawLast.replace(/^["«“]|["»”]$/g, "").trim();
    // Set apart = quoted, or written without a closing period (the prompt says
    // none is required), or the essay has 3+ paragraphs with this one last.
    const setApart = quoted || !/[.!?]$/.test(last) || paragraphs.length >= 3;
    if (setApart && last.length >= 20 && isLikelyBareSentence(last)) return last;
  }
  return null;
};

/**
 * Issue #48 P1 #6: the date shown as "Saved on …" on /game/me/mission.
 * `mission_discovered_at` is first-write-wins (the moment of discovery,
 * never bumped on edit), so after re-saving a mission today it still read
 * the original date. Prefer `updated_at` (bumped on every mission save)
 * and fall back to the discovery date when it's absent.
 */
export const resolveMissionSavedDate = (input: {
  updatedAt?: string | null;
  discoveredAt?: string | null;
}): string | null => input.updatedAt ?? input.discoveredAt ?? null;
