/**
 * Consciousness Meets Science — free mini-course content.
 *
 * ONE data file drives the whole course page (/grow/consciousness-meets-science),
 * rendered by src/pages/CoursePage.tsx. Same rules as activateYourDormantPotential.ts:
 *  - `youtubeId` starting with "TBD" = not uploaded yet; the UI skips it.
 *  - Videos are Unlisted on YouTube (channel Integral Evolution, playlist
 *    "Consciousness Meets Science"); embedded via youtube-nocookie.com.
 *  - Episode titles stay English in every locale.
 * Source: Sasha's Medium article "Consciousness Meets Science" (course outline:
 * docs/08-content/VIDEO_PRODUCTION_PLAN.md); NotebookLM Explainer videos, 2026-10-28.
 */
import type { CourseConfig, CourseModule } from "./types";

export const CMS_COURSE_SLUG = "consciousness-meets-science";
export const CMS_COURSE_PATH = `/grow/${CMS_COURSE_SLUG}`;
export const CMS_COURSE_TITLE = "Consciousness Meets Science";

export const CMS_COURSE_MODULES: CourseModule[] = [
    {
        id: "two-sides",
        title: "Two Sides of One Coin",
        episodes: [
            { code: "C01E00", title: "Mystics First", youtubeId: "lEZwd1yeEzY", promiseKey: "courseCms.promise.C01E00" },
            { code: "C01E01", title: "Two Sides of One Coin", youtubeId: "qyLgawyIvY8", promiseKey: "courseCms.promise.C01E01" },
            { code: "C01E02", title: "Inner Experience as Data", youtubeId: "mdbND2_xQBk", promiseKey: "courseCms.promise.C01E02" },
        ],
    },
    {
        id: "shared-experiences",
        title: "Eight Shared Experiences",
        episodes: [
            { code: "C02E01", title: "Sacred Geometry and Boundless Awareness", youtubeId: "8toDOfA_h7U", promiseKey: "courseCms.promise.C02E01" },
            { code: "C02E02", title: "The Third Eye and the Inner Body", youtubeId: "YgySIoSUMr0", promiseKey: "courseCms.promise.C02E02" },
            { code: "C02E03", title: "Messages and the Spiritual Heart", youtubeId: "7He_XYKEwfE", promiseKey: "courseCms.promise.C02E03" },
            { code: "C02E04", title: "Tunnels and the Torus", youtubeId: "qp_-5ndD7qk", promiseKey: "courseCms.promise.C02E04" },
        ],
    },
    {
        id: "paths-in",
        title: "Paths In",
        episodes: [
            { code: "C03E01", title: "Four Doors", youtubeId: "efFj7wtWoBA", promiseKey: "courseCms.promise.C03E01" },
            { code: "C03E02", title: "You Are Not Alone", youtubeId: "S3mWP3AN5CQ", promiseKey: "courseCms.promise.C03E02" },
        ],
    },
    {
        id: "science-that-rhymes",
        title: "Science That Rhymes",
        episodes: [
            { code: "C04E01", title: "Holograms, Fractals, Emergence", youtubeId: "Iq9P4rLubyI", promiseKey: "courseCms.promise.C04E01" },
            { code: "C04E02", title: "Quantum Fields, Entanglement, Strings", youtubeId: "LUITI6O9ctw", promiseKey: "courseCms.promise.C04E02" },
            { code: "C04E03", title: "The Meditating Brain and the Question of Mind", youtubeId: "8VdNGxODO_E", promiseKey: "courseCms.promise.C04E03" },
        ],
    },
    {
        id: "integral-theory",
        title: "An Integral Theory of Everything",
        episodes: [
            { code: "C05E01", title: "The Integral Map", youtubeId: "tJ8ReAHUgwU", promiseKey: "courseCms.promise.C05E01" },
            { code: "C05E02", title: "A Universe of Living Pixels", youtubeId: "IHUdgg2w44g", promiseKey: "courseCms.promise.C05E02" },
            { code: "C05E03", title: "The Mystic's Role Returns", youtubeId: "3ndMfmrgRuA", promiseKey: "courseCms.promise.C05E03" },
        ],
    },
];

export const CONSCIOUSNESS_MEETS_SCIENCE: CourseConfig = {
    slug: CMS_COURSE_SLUG,
    title: CMS_COURSE_TITLE,
    taglineKey: "courseCms.tagline",
    leadKey: "courseCms.lead",
    modules: CMS_COURSE_MODULES,
    practices: [],
};
