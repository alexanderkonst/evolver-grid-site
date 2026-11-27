/**
 * Nature · Aligns You With Natural Rhythms — free mini-training content.
 *
 * ONE data file drives the whole course page (/grow/nature), rendered by
 * src/pages/CoursePage.tsx. Same rules as consciousnessMeetsScience.ts:
 *  - Episode codes and titles stay English in every locale.
 *  - Promise lines are i18n (`courseNature.promise.<code>`, en / ru / es).
 *  - `youtubeId` "" = the video is not uploaded yet: the player shows a calm
 *    "Video coming soon" state, no broken embed (isEpisodeReady in src/lib/coursePlayer.ts).
 *    Hark posts the 12 ids on the PR; fill them here. Videos are Unlisted on YouTube.
 *  - `infographic` stays undefined until docs/assets/infographics/book/nature/<code>.png is
 *    published under public/ (separate issue); then set it as "/infographics/courses/nature/<code>.png".
 *  - `askPrompt` is the Ask AI prompt of section 6, with tokens the platform fills
 *    (src/lib/courseAskAi.ts). Text signed by Sasha 2026-11-27.
 * Source: docs/08-content/nature_mini_training.md (sections 4, 6, 7).
 * Template followed: docs/templates/course-update.md (steps 6-8), course-landing.md.
 */
import type { CourseConfig, CourseModule } from "./types";

export const NATURE_COURSE_SLUG = "nature";
export const NATURE_COURSE_PATH = `/grow/${NATURE_COURSE_SLUG}`;
export const NATURE_COURSE_TITLE = "Nature";
/** The door at the end of the last episode: Equilibrium, the watch that reads the four rhythms daily. */
export const NATURE_OUTRO_PATH = "/build/equilibrium";

export const NATURE_COURSE_MODULES: CourseModule[] = [
    {
        id: "intro",
        title: "Intro",
        episodes: [
            {
                code: "N01",
                title: "Nothing Is Wrong With You",
                youtubeId: "",
                promiseKey: "courseNature.promise.N01",
                askPrompt:
                    "Recall a week when I felt 'wrong' for no clear reason. Ask me 2 short questions to see if it matched a natural low (time of day, the moon, the season, the end of my personal year). Up to 5 lines.",
            },
        ],
    },
    {
        id: "year",
        title: "Year",
        episodes: [
            {
                code: "Y01",
                title: "Your Year Starts on Your Birthday",
                youtubeId: "",
                promiseKey: "courseNature.promise.Y01",
                askPrompt:
                    "My birthday is {birthday}. Today is {today}. Which phase of my personal year am I in (fresh start, big push, steady stretch, harvest time, wind down), and what one kind of effort belongs to it? Up to 5 lines.",
            },
            {
                code: "Y02",
                title: "Two Years Turn at Once",
                youtubeId: "",
                promiseKey: "courseNature.promise.Y02",
                askPrompt:
                    "I live in {location}. My birthday is {birthday}. How do my personal-year phase and the current season meet right now, and what does that suggest for this month? Up to 5 lines.",
            },
        ],
    },
    {
        id: "moon",
        title: "Moon",
        episodes: [
            {
                code: "M01",
                title: "The Moon Has Four Seasons",
                youtubeId: "",
                promiseKey: "courseNature.promise.M01",
                askPrompt:
                    "Today is {today}. Which moon phase are we in, which of the four lunar seasons (fire, water, earth, air) holds it, and how many days are left? Then one line on what it's for. Up to 5 lines.",
            },
            {
                code: "M02",
                title: "The Seed Half",
                youtubeId: "",
                promiseKey: "courseNature.promise.M02",
                askPrompt:
                    "We're in the {phase} phase. Ask me one question that helps me notice what this phase is bringing me (an intention, a direction, a fear to release, or what has arrived). Up to 5 lines.",
            },
            {
                code: "M03",
                title: "The Harvest Half",
                youtubeId: "",
                promiseKey: "courseNature.promise.M03",
                askPrompt:
                    "Here's what I'm working on: {mission}. If I lived the next harvest half of the moon by its four jobs, what would each phase ask of me? One line each. Up to 5 lines.",
            },
            {
                code: "M04",
                title: "The Cycle Starts After You Celebrate",
                youtubeId: "",
                promiseKey: "courseNature.promise.M04",
                askPrompt:
                    "What did I harvest in the last few weeks? Ask me, then help me name one win to say out loud and one person or thing to thank. Up to 5 lines.",
            },
        ],
    },
    {
        id: "week",
        title: "Week",
        episodes: [
            {
                code: "W01",
                title: "Seven Lights Named Your Week",
                youtubeId: "",
                promiseKey: "courseNature.promise.W01",
                askPrompt:
                    "Show me, in up to 5 lines, how my language's weekday names trace back to the seven classical planets, and which planet rules today.",
            },
            {
                code: "W02",
                title: "Don't Run the Week in One Mode",
                youtubeId: "",
                promiseKey: "courseNature.promise.W02",
                askPrompt:
                    "Today is {weekday}. What's its traditional mode, and what's one small thing in my day that would honour it? Up to 5 lines.",
            },
        ],
    },
    {
        id: "day",
        title: "Day",
        episodes: [
            {
                code: "D01",
                title: "One Turn of the Earth",
                youtubeId: "",
                promiseKey: "courseNature.promise.D01",
                askPrompt:
                    "Here's how my day usually goes: ask me in one question. Then tell me which part of my day I'm spending against the four quarters, and one swap. Up to 5 lines.",
            },
            {
                code: "D02",
                title: "Waves Inside the Day",
                youtubeId: "",
                promiseKey: "courseNature.promise.D02",
                askPrompt:
                    "Help me place 3 deep work sprints of about 90 minutes into my day tomorrow, with breaks, given the four quarters of the day. Up to 5 lines.",
            },
        ],
    },
    {
        id: "outro",
        title: "Outro",
        episodes: [
            {
                code: "O01",
                title: "Read Your Now",
                youtubeId: "",
                promiseKey: "courseNature.promise.O01",
                askPrompt:
                    "My birthday is {birthday}, today is {today}, and it's {timeOfDay}. Write my Now in 4 lines (year phase, moon phase and days left, today's planet and mode, part of the day), then 1 line: the one action that goes with all four. Up to 5 lines.",
            },
        ],
    },
];

export const NATURE: CourseConfig = {
    slug: NATURE_COURSE_SLUG,
    title: NATURE_COURSE_TITLE,
    version: "1.0",
    updatedAt: "2026-11-27",
    changelog: [{ version: "1.0", date: "2026-11-27", summary: "First public version" }],
    level: "Fundamental",
    category: "General",
    eyebrowKey: "course.eyebrowMiniTraining",
    taglineKey: "courseNature.tagline",
    modules: NATURE_COURSE_MODULES,
    practices: [],
    outro: {
        to: NATURE_OUTRO_PATH,
        titleKey: "courseNature.outro.title",
        bodyKey: "courseNature.outro.body",
        buttonKey: "courseNature.outro.button",
    },
};
