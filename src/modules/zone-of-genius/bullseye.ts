/**
 * Bullseye ("I [verb] …") formatting shared by the reveal card, the profile
 * overview hero and the share text.
 *
 * Issue #93: the reveal card read "Iturn a founder's unfinished thoughts…"
 * (no space), on screen and in the downloaded PNG. The card rendered the
 * prefix and the sentence as separate JSX text nodes ("I", " ", "turn …");
 * html2canvas drops whitespace-only text nodes, so the space vanished.
 * Building the whole line as ONE string removes that failure mode, and
 * normalising the sentence guards against generated text that arrives
 * with leading whitespace or already carrying its own "I ".
 */

/**
 * Sentence case the bullseye, drop the trailing period, and strip a
 * redundant leading "I " (the prefix is added at render time).
 */
export const formatBullseye = (sentence: string): string =>
    sentence
        .toLowerCase()
        .replace(/\.\s*$/, "")
        .trim()
        .replace(/^i\s+/, "");

/**
 * The full first-person line: prefix + exactly one space + sentence.
 * Returns a single string so renderers (and html2canvas) can't lose the
 * separator.
 */
export const formatBullseyeLine = (sentence: string, prefix = "I"): string =>
    `${prefix} ${formatBullseye(sentence)}`;
