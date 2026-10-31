/**
 * Activation of Inner Vision — advanced micro-course content (Season V).
 *
 * Unlocks after Integral Mystery School (it goes deeper); for now that is a
 * label only, nothing in the code gates it. No price is shown.
 * ONE data file drives the course page (/grow/activation-of-inner-vision),
 * rendered by src/pages/CoursePage.tsx once at least one video is uploaded;
 * until then src/pages/ActivationOfInnerVision.tsx shows the contents.
 *  - `youtubeId` starting with "TBD" = not uploaded yet; the UI skips it.
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
            { code: "V01E01", title: "The Two Axes", youtubeId: "TBD-V01E01" },
            { code: "V01E02", title: "The Twelve Dimensions of Seeing", youtubeId: "TBD-V01E02" },
            { code: "V01E03", title: "The Logos: the Thirteenth", youtubeId: "TBD-V01E03" },
        ],
    },
    {
        id: "the-octave",
        title: "The Octave",
        episodes: [
            { code: "V02E01", title: "Seeing the Seer", youtubeId: "TBD-V02E01" },
            { code: "V02E02", title: "The Meta-Logos: Twenty-Six", youtubeId: "TBD-V02E02" },
            { code: "V02E03", title: "The Twenty-Seventh: Crystallization", youtubeId: "TBD-V02E03" },
        ],
    },
    {
        id: "the-landing",
        title: "The Landing",
        episodes: [
            { code: "V03E01", title: "One Substance, Nine Addresses", youtubeId: "TBD-V03E01" },
            { code: "V03E02", title: "The Instrument: Four Rounds and the Watchdog", youtubeId: "TBD-V03E02" },
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
    practices: [],
};
