// ─── One-sentence-synthesis extractor ──────────────────────────────────
//
// Pure helpers for pulling the user's one-sentence mission out of a pasted
// AI response. Kept in their own module (no React / supabase imports) so they
// can be unit-tested directly — see __tests__/missionExtract.test.ts.
//
// The prompt mandates the AI ends its response with a single line:
//   1 sentence synthesis: <sentence>
//
// Real-world responses include emphasis variants like:
//   **1 sentence synthesis:** <sentence>
//   One-sentence synthesis: <sentence>
//   1-sentence synthesis: <sentence>
//   > 1 sentence synthesis: <sentence>   (markdown blockquote)
//
// The regex is intentionally tolerant.
//
// We use the GLOBAL flag and take the LAST match because the prompt itself
// embeds Sasha's example (which contains the marker), and the AI may echo
// that example's marker line earlier in its response before producing its
// own. The LAST occurrence is always the AI's final synthesis for the user.

export const SYNTHESIS_REGEX =
    /(?:\*{0,2})\s*(?:1|one)[\s\-–]?sentence\s+synthesis\s*[:\-—]\s*(?:\*{0,2})\s*(.+?)\s*(?:\*{0,2})\s*$/gim;

export const stripMarkdown = (s: string): string =>
    s.trim().replace(/^[\s>*]+|[\s>*]+$/g, "");

// Day 212 (2026-10-14, issue #45): the extracted one-sentence mission could
// render literal `\n` (backslash-n) as visible text. Root cause: when the
// pasted AI response is a JSON *string* whose value was itself double-escaped
// ("...idea.\\n..."), JSON.parse decodes one level and leaves a literal `\n`;
// the regex-fallback path never decodes escapes at all. A mission is a single
// sentence, so any newline/tab escape (literal `\n`, `\t`, `\r`, or real ones)
// is noise — collapse them to a single space so the saved sentence reads clean.
export const normalizeWhitespaceEscapes = (s: string): string =>
    s
        .replace(/\\r\\n|\\n|\\r|\\t/g, " ") // literal backslash-escape sequences
        .replace(/[\r\n\t]+/g, " ") // real control whitespace
        .replace(/\s+/g, " ")
        .trim();

// Day 80 Wave 2.16 (Sasha 2026-05-22): the prompt now asks for a JSON object
// with `mission_analysis` + `mission_one_sentence` fields, matching the shape
// of the ZoneOfGenius and AssetMapping prompts. Extraction is JSON-first; if
// parsing fails (user pasted markdown, AI ignored the JSON instruction, or
// it's an old-style response with the "1 sentence synthesis:" marker), the
// legacy regex picks up as fallback. We pull from the LAST JSON object in the
// paste — the AI may echo the example earlier before emitting its own.
export const extractJsonOneSentence = (raw: string): string | null => {
    // Greedy match captures the final {...} block in the paste.
    const jsonMatches = raw.match(/\{[\s\S]*\}/g);
    if (!jsonMatches || jsonMatches.length === 0) return null;
    // Try each candidate from last to first — the AI's actual output is
    // typically the last well-formed JSON block.
    for (let i = jsonMatches.length - 1; i >= 0; i--) {
        try {
            const parsed = JSON.parse(jsonMatches[i]);
            const sentence =
                typeof parsed?.mission_one_sentence === "string"
                    ? parsed.mission_one_sentence.trim()
                    : null;
            if (sentence) return sentence;
        } catch {
            // not valid JSON — keep trying
        }
    }
    return null;
};

export const extractOneSentence = (raw: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();

    // 1) JSON-first (new prompt shape).
    const fromJson = extractJsonOneSentence(trimmed);
    if (fromJson) return normalizeWhitespaceEscapes(stripMarkdown(fromJson));

    // 2) Legacy fallback — the "1 sentence synthesis:" marker convention from
    // the pre-Wave-2.16 prompt. Take the LAST match (the AI's actual final
    // synthesis, not an echo of the prompt example).
    SYNTHESIS_REGEX.lastIndex = 0;
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = SYNTHESIS_REGEX.exec(trimmed)) !== null) {
        if (m[1]) matches.push(m[1]);
    }
    if (matches.length > 0) {
        return normalizeWhitespaceEscapes(stripMarkdown(matches[matches.length - 1]));
    }
    return null;
};
