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
