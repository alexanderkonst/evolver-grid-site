/**
 * zogProfileVoice — render-time pronoun band-aid for legacy snapshots.
 *
 * Day 58 (Sasha 2026-05-02 late evening): existing snapshots saved to
 * `zog_snapshots.appleseed_data` were generated when the prompt asked
 * for THIRD-PERSON voice ("they/their"). The prompt is now SECOND-
 * PERSON ("you/your"), so any new snapshot comes out addressed to the
 * reader directly — but old snapshots still render with "they listen
 * through messy stories…" which reads as a clinical write-up of someone
 * else, not a profile of *me*.
 *
 * To avoid forcing every existing user to re-run the assessment, this
 * helper flips subject pronouns at render time. APPLY ONLY to fields
 * where pronouns ALWAYS refer to the SUBJECT (the reader). Do NOT
 * apply to fields where "their/they" can refer to OTHER people the
 * subject is acting on (flywheel_action's "name THEIR core message",
 * career_sweet_spots' "what THEY actually do", inner sentences of
 * complementaryPartner.synergy beyond the first one — those refer to
 * the partner, not the subject).
 *
 * Safe-to-flip fields: core_pattern, how_genius_shows_up, edge_and_traps,
 * masteryStages.description.
 *
 * Day 62 (Sasha 2026-05-05) DUAL-ACTOR HARDENING: even on the
 * "safe" fields above, a sentence can carry TWO actors — the subject
 * AND someone the subject is acting on (a founder, a client, "someone").
 * The naive flip used to turn "what THEY mean" → "what YOU mean" and
 * collapse both actors into the reader, producing reads like:
 *   "Your genius shows up when someone is circling what YOU mean
 *    but can't land it: YOU talk in paragraphs…"
 * (Sasha caught this on his own how_genius_shows_up. The first three
 * "you"s actually refer to the OTHER person — the someone — not him.)
 *
 * Smart-skip: when scanning a sentence for "they / them / their", if
 * the same sentence (everything between the previous sentence-ending
 * punctuation and the pronoun) contains a non-subject noun antecedent
 * — "someone", "anyone", "people", "a/an/another <noun>", "the
 * <noun>", "their <noun>'s" — leave the pronoun alone. The third-
 * person reference is intentional and structurally correct; only the
 * SUBJECT references should flip to "you".
 *
 * Once a user re-runs their assessment, the new prompt produces native
 * second-person output with explicit dual-actor discipline (Day 62
 * appleseedGenerator.ts) and this helper is a no-op for that data.
 */

// Sentence boundaries we walk back to when searching for an antecedent.
// CONSERVATIVE: only hard-stop punctuation followed by whitespace, plus
// newlines. Colons / semicolons / em-dashes routinely continue the
// SAME antecedent ("someone is circling: they talk in paragraphs"), so
// breaking on them would re-incorrectly flip the second "they" to
// "you". Better to slightly over-preserve "they" than to collapse two
// actors into "you".
const SENTENCE_BREAK_RE = /[.!?]\s|\n/g;

// Phrases that, when found earlier in the same sentence as a "they /
// them / their", strongly indicate the pronoun refers to ANOTHER person,
// not the subject. Conservative — false negatives (skipping a flip we
// could have done) are much cheaper than false positives (collapsing
// two actors into "you").
const OTHER_ACTOR_ANTECEDENT_RE =
    /\b(someone|somebody|anyone|anybody|everyone|everybody|people|others|another|the\s+other|a\s+person|the\s+person|a\s+founder|the\s+founder|a\s+client|the\s+client|a\s+partner|the\s+partner|a\s+team|the\s+team|a\s+teammate|the\s+teammate|a\s+leader|the\s+leader|a\s+buyer|the\s+buyer|a\s+reader|the\s+reader|a\s+colleague|the\s+colleague|a\s+coworker|the\s+coworker|a\s+human|the\s+human|a\s+room|the\s+room|the\s+other\s+person)\b/i;

/**
 * Returns true when the text immediately preceding `index` (within the
 * same sentence) contains a noun antecedent that points to a person
 * OTHER than the subject — meaning the pronoun at `index` should NOT
 * be flipped to "you".
 */
function hasOtherActorAntecedent(text: string, index: number): boolean {
    // Find the start of the current sentence (last sentence-break before
    // index, or the start of the text).
    const before = text.slice(0, index);
    SENTENCE_BREAK_RE.lastIndex = 0;
    let lastBreak = 0;
    let m: RegExpExecArray | null;
    while ((m = SENTENCE_BREAK_RE.exec(before)) !== null) {
        lastBreak = m.index + m[0].length;
    }
    const sentenceSoFar = before.slice(lastBreak);
    return OTHER_ACTOR_ANTECEDENT_RE.test(sentenceSoFar);
}

/**
 * Flip third-person subject pronouns to second-person, but PRESERVE
 * pronouns that refer to OTHER actors named earlier in the same
 * sentence. Word-boundary regex ensures we don't touch substrings
 * inside other words.
 */
function flipPronoun(
    text: string,
    pattern: RegExp,
    replacement: string
): string {
    return text.replace(pattern, (match, _grp, offset) => {
        if (typeof offset === "number" && hasOtherActorAntecedent(text, offset)) {
            return match;
        }
        return replacement;
    });
}

export function flipToSecondPerson(text: string | null | undefined): string {
    if (!text) return "";
    let out = text;
    out = flipPronoun(out, /\bThey\b/g, "You");
    out = flipPronoun(out, /\bthey\b/g, "you");
    out = flipPronoun(out, /\bTheir\b/g, "Your");
    out = flipPronoun(out, /\btheir\b/g, "your");
    out = flipPronoun(out, /\bThem\b/g, "You");
    out = flipPronoun(out, /\bthem\b/g, "you");
    out = flipPronoun(out, /\bThemselves\b/g, "Yourself");
    out = flipPronoun(out, /\bthemselves\b/g, "yourself");
    return out;
}

/**
 * flipToFirstPersonReflexive — sister band-aid for fields rendered
 * under "MY TOP X IS" eyebrows (today: top_shadow_one_sentence on the
 * reveal card). The Day-58 prompt-register bug shipped second-person
 * reflexives ("yourself / your own / yours") in a slot that reads as
 * the user speaking ABOUT themselves — Karime hit it as
 * "MY TOP SHADOW IS … delaying being fully seen YOURSELF" which
 * grammatically reads as broken / impersonal.
 *
 * Sasha 2026-05-03: prompt now demands first-person reflexives for
 * `top_shadow_one_sentence` going forward. This helper flips legacy
 * snapshots at render time so existing users see the correct
 * register without re-running the assessment.
 *
 * SCOPE: ONLY apply to "MY X IS"–framed slots — never to body
 * fields in the ME-space "your profile" surfaces (those keep the
 * second-person register). Today the only consumer is the
 * reveal-card top_shadow_one_sentence; if more "MY X IS" slots get
 * added, route their text through this helper too.
 *
 * Conservative substitution: only flips reflexive / possessive
 * forms ("yourself / your own / yours"), not bare "you" or "your".
 * Bare "you" can still appear correctly inside a first-person
 * shadow phrase as a generic ("the work you do" → ambiguous), so
 * leaving it untouched is safer than over-flipping.
 */
export function flipToFirstPersonReflexive(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/\bYourself\b/g, "Myself")
        .replace(/\byourself\b/g, "myself")
        // "your own" → "my own" (carries possessive force; the prompt
        // examples explicitly use "my own stays unnamed" so we mirror
        // that idiom)
        .replace(/\bYour own\b/g, "My own")
        .replace(/\byour own\b/g, "my own")
        // Standalone "yours" (the absolute possessive — "no one holds yours")
        // → "mine" so it reads naturally
        .replace(/\bYours\b/g, "Mine")
        .replace(/\byours\b/g, "mine");
}
