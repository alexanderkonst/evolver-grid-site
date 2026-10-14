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
// Pull `mission_one_sentence` from the LAST well-formed JSON block in the
// paste (the AI's own output typically follows any echoed example).
export const extractJsonOneSentence = (raw: string): string | null => {
  const jsonMatches = raw.match(/\{[\s\S]*\}/g);
  if (!jsonMatches || jsonMatches.length === 0) return null;
  for (let i = jsonMatches.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(jsonMatches[i]);
      const sentence =
        typeof parsed?.mission_one_sentence === "string"
          ? parsed.mission_one_sentence.trim()
          : null;
      if (sentence) return sentence;
    } catch {
      // not valid JSON — keep trying earlier candidates
    }
  }
  return null;
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
