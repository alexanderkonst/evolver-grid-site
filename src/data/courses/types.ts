/**
 * Shared shapes for the free GROW-space mini-courses (/grow/<slug>).
 * One data file per course in this folder exports a CourseConfig;
 * src/pages/CoursePage.tsx renders any of them.
 */

export interface CourseEpisode {
    /** Unique within the course. Used in the ?ep= deep link and progress storage. */
    code: string;
    title: string;
    youtubeId: string;
    infographic?: string;
    /** i18n key for one plain promise line shown under the episode title. Optional. */
    promiseKey?: string;
}

export interface CourseModule {
    id: string;
    title: string;
    episodes: CourseEpisode[];
}

export interface CoursePractice {
    id: string;
    /** Duration label shown before the title, e.g. "1 min". */
    duration: string;
    title: string;
    soundcloudUrl: string;
}

export interface CourseConfig {
    slug: string;
    title: string;
    /** i18n key for the small label above the title. Defaults to "course.eyebrow" ("Free mini-course"). */
    eyebrowKey?: string;
    /** i18n key for the italic line under the title. */
    taglineKey: string;
    /** i18n key for an optional lead paragraph under the tagline. */
    leadKey?: string;
    modules: CourseModule[];
    /** List not-yet-uploaded ("TBD") episodes in the contents as muted "Coming soon" rows. Default: hidden. */
    showUpcoming?: boolean;
    practices: CoursePractice[];
}
