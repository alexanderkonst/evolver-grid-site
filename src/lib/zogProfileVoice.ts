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
 * Once a user re-runs their assessment, the new prompt produces native
 * second-person output and this helper is a no-op for that data.
 */
export function flipToSecondPerson(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/\bThey\b/g, "You")
        .replace(/\bthey\b/g, "you")
        .replace(/\bTheir\b/g, "Your")
        .replace(/\btheir\b/g, "your")
        .replace(/\bThem\b/g, "You")
        .replace(/\bthem\b/g, "you")
        .replace(/\bThemselves\b/g, "Yourself")
        .replace(/\bthemselves\b/g, "yourself");
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
