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
    /** Optional i18n key for a localized title (falls back to `title`). */
    titleKey?: string;
    /** Optional i18n key for a course-name line appended to the eyebrow. */
    eyebrowKey?: string;
    /** i18n key for the italic line under the title. */
    taglineKey: string;
    modules: CourseModule[];
    practices: CoursePractice[];
}
