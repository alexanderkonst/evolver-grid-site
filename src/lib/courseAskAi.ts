/**
 * courseAskAi.ts — fills an episode's Ask AI prompt from what the platform knows (no React, no network).
 *
 * A prompt (CourseEpisode.askPrompt) holds tokens: {birthday} {today} {weekday} {timeOfDay} {phase}
 * {location} {mission}. The clock gives today, weekday, time of day and the moon's phase. The
 * profile gives birthday, location and mission; when the platform lacks one, the token becomes the
 * "ask me" wording of the signed text (docs/08-content/nature_mini_training.md §6), so the AI asks
 * the person instead of guessing. Unknown tokens are left as they are.
 */
import { getLunarState, phaseWord } from "@/lib/equilibrium-cycles";

export interface CourseAskContext {
    /** ISO date YYYY-MM-DD (or any readable date text). */
    birthday?: string | null;
    location?: string | null;
    mission?: string | null;
}

/** What each profile token becomes when the platform does not have it. */
export const ASK_ME_FALLBACK = {
    birthday: "(ask me)",
    location: "(ask me where)",
    mission: "(ask me)",
} as const;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** The four quarters of the day, as in episode D01: morning 6-12, afternoon 12-18, evening 18-22, night. */
export const timeOfDayOf = (now: Date): "morning" | "afternoon" | "evening" | "night" => {
    const h = now.getHours();
    if (h >= 6 && h < 12) return "morning";
    if (h >= 12 && h < 18) return "afternoon";
    if (h >= 18 && h < 22) return "evening";
    return "night";
};

export const formatDate = (d: Date): string => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** "1988-03-04" → "4 March 1988". Anything else is passed through trimmed; empty → null. */
export const formatBirthday = (raw: string | null | undefined): string | null => {
    const text = (raw ?? "").trim();
    if (!text) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
    if (!m) return text;
    const month = MONTHS[Number(m[2]) - 1];
    return month ? `${Number(m[3])} ${month} ${m[1]}` : text;
};

const clean = (value: string | null | undefined): string | null => {
    const text = (value ?? "").replace(/\s+/g, " ").trim();
    return text ? text.replace(/\.$/, "") : null;
};

export const fillAskPrompt = (template: string, ctx: CourseAskContext = {}, now: Date = new Date()): string => {
    const values: Record<string, string> = {
        today: formatDate(now),
        weekday: WEEKDAYS[now.getDay()],
        timeOfDay: timeOfDayOf(now),
        phase: phaseWord(getLunarState(now.getTime()).phase.energy),
        birthday: formatBirthday(ctx.birthday) ?? ASK_ME_FALLBACK.birthday,
        location: clean(ctx.location) ?? ASK_ME_FALLBACK.location,
        mission: clean(ctx.mission) ?? ASK_ME_FALLBACK.mission,
    };
    return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
};
