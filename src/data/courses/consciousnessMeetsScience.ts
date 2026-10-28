/**
 * Consciousness Meets Science — free mini-course content.
 *
 * ONE data file drives the whole course page (/grow/consciousness-meets-science),
 * rendered by src/pages/CoursePage.tsx. Same rules as activateYourDormantPotential.ts:
 *  - `youtubeId` starting with "TBD" = not uploaded yet; the UI skips it.
 *  - Videos are Unlisted on YouTube (channel Integral Evolution, playlist
 *    "Your Inner Experience Is Data · Consciousness Meets Science"); embedded via youtube-nocookie.com.
 *  - Episode titles stay English in every locale.
 * Source: Sasha's Medium article "Consciousness Meets Science" (course outline:
 * docs/08-content/VIDEO_PRODUCTION_PLAN.md); NotebookLM Explainer videos, 2026-10-28.
 */
import type { CourseConfig, CourseModule } from "./types";

export const CMS_COURSE_SLUG = "consciousness-meets-science";
export const CMS_COURSE_PATH = `/grow/${CMS_COURSE_SLUG}`;
// Shift title (PST 173, docs/templates/shift-offer.md; Sasha 2026-10-28). The old name
// stays as the eyebrow line (courseCms.eyebrow) so the course is still recognizable.
export const CMS_COURSE_TITLE = "Your Inner Experience Is Data";
export const CMS_COURSE_SUBTITLE = "Consciousness Meets Science";

export const CMS_COURSE_MODULES: CourseModule[] = [
    {
        id: "two-sides",
        title: "Two Sides of One Coin",
        episodes: [
            { code: "C01E00", title: "Mystics First", youtubeId: "lEZwd1yeEzY" },
            { code: "C01E01", title: "Two Sides of One Coin", youtubeId: "qyLgawyIvY8" },
            { code: "C01E02", title: "Inner Experience as Data", youtubeId: "mdbND2_xQBk" },
        ],
    },
    {
        id: "shared-experiences",
        title: "Eight Shared Experiences",
        episodes: [
            { code: "C02E01", title: "Sacred Geometry and Boundless Awareness", youtubeId: "8toDOfA_h7U" },
            { code: "C02E02", title: "The Third Eye and the Inner Body", youtubeId: "YgySIoSUMr0" },
            { code: "C02E03", title: "Messages and the Spiritual Heart", youtubeId: "7He_XYKEwfE" },
            { code: "C02E04", title: "Tunnels and the Torus", youtubeId: "qp_-5ndD7qk" },
        ],
    },
    {
        id: "paths-in",
        title: "Paths In",
        episodes: [
            { code: "C03E01", title: "Four Doors", youtubeId: "efFj7wtWoBA" },
            { code: "C03E02", title: "You Are Not Alone", youtubeId: "S3mWP3AN5CQ" },
        ],
    },
    {
        id: "science-that-rhymes",
        title: "Science That Rhymes",
        episodes: [
            { code: "C04E01", title: "Holograms, Fractals, Emergence", youtubeId: "Iq9P4rLubyI" },
            { code: "C04E02", title: "Quantum Fields, Entanglement, Strings", youtubeId: "LUITI6O9ctw" },
            { code: "C04E03", title: "The Meditating Brain and the Question of Mind", youtubeId: "8VdNGxODO_E" },
        ],
    },
    {
        id: "integral-theory",
        title: "An Integral Theory of Everything",
        episodes: [
            { code: "C05E01", title: "The Integral Map", youtubeId: "tJ8ReAHUgwU" },
            { code: "C05E02", title: "A Universe of Living Pixels", youtubeId: "IHUdgg2w44g" },
            { code: "C05E03", title: "The Mystic's Role Returns", youtubeId: "3ndMfmrgRuA" },
        ],
    },
];

export const CONSCIOUSNESS_MEETS_SCIENCE: CourseConfig = {
    slug: CMS_COURSE_SLUG,
    title: CMS_COURSE_TITLE,
    titleKey: "courseCms.title",
    eyebrowKey: "courseCms.eyebrow",
    taglineKey: "courseCms.tagline",
    modules: CMS_COURSE_MODULES,
    practices: [],
};
