/**
 * Activation of Inner Vision — advanced micro-course content (Season V).
 *
 * Unlocks after Integral Mystery School (it goes deeper); for now that is a
 * label only, nothing in the code gates it. The $27 is display only (it sits in
 * the `courseAiv.eyebrow` string); no checkout is wired.
 * ONE data file drives the course page (/grow/activation-of-inner-vision),
 * rendered by src/pages/CoursePage.tsx (via src/pages/ActivationOfInnerVision.tsx).
 * Videos: unlisted on YouTube, channel Integral Evolution, playlist
 * "Activation of Inner Vision". 8 of 9 are live; V03E03 is still generating.
 *  - `youtubeId` starting with "TBD" = not uploaded yet. The player skips it;
 *    `showUpcoming` lists it in the contents as "Coming soon" so the 9-episode
 *    structure stays visible. Replace `TBD-V03E03` with the real id when it lands.
 *  - Episode titles stay English in every locale.
 * Source: Sasha's paper "27-Perspective Vision" (/27,
 * src/pages/IntegralTheoryUpgrade1.tsx). Episode texts + NotebookLM prompts:
 * docs/08-content/activation_of_inner_vision_course.md (draft, 2026-10-30).
 */
import type { CourseConfig, CourseModule } from "./types";

export const AIV_COURSE_SLUG = "activation-of-inner-vision";
export const AIV_COURSE_PATH = `/grow/${AIV_COURSE_SLUG}`;
export const AIV_COURSE_TITLE = "Activation of Inner Vision";

export const AIV_COURSE_MODULES: CourseModule[] = [
    {
        id: "the-twelve",
        title: "The Twelve",
        episodes: [
            { code: "V01E01", title: "The Two Axes", youtubeId: "K586sUv-dNs" },
            { code: "V01E02", title: "The Twelve Dimensions of Seeing", youtubeId: "gEBcSxkjgBg" },
            { code: "V01E03", title: "The Logos: the Thirteenth", youtubeId: "ZkAVYDVVS-k" },
        ],
    },
    {
        id: "the-octave",
        title: "The Octave",
        episodes: [
            { code: "V02E01", title: "Seeing the Seer", youtubeId: "kgyf0bu3Yf8" },
            { code: "V02E02", title: "The Meta-Logos: Twenty-Six", youtubeId: "TdHNC5XHcuQ" },
            { code: "V02E03", title: "The Twenty-Seventh: Crystallization", youtubeId: "nmgEBrBkG3o" },
        ],
    },
    {
        id: "the-landing",
        title: "The Landing",
        episodes: [
            { code: "V03E01", title: "One Substance, Nine Addresses", youtubeId: "6Woy0N42kuw" },
            { code: "V03E02", title: "The Instrument: Four Rounds and the Watchdog", youtubeId: "9BEk1q6YH5A" },
            { code: "V03E03", title: "It Is Done, and It Begins Again", youtubeId: "TBD-V03E03" },
        ],
    },
];

export const ACTIVATION_OF_INNER_VISION: CourseConfig = {
    slug: AIV_COURSE_SLUG,
    title: AIV_COURSE_TITLE,
    eyebrowKey: "courseAiv.eyebrow",
    taglineKey: "courseAiv.tagline",
    leadKey: "courseAiv.lead",
    modules: AIV_COURSE_MODULES,
    showUpcoming: true,
    practices: [],
};
