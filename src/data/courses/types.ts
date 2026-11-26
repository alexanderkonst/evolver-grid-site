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

/** Where a mini-training sits on the path. */
export type CourseLevel = "Fundamental" | "Intermediate" | "Advanced";

/**
 * Subject family. Start with "General"; add a value only when an existing course clearly needs one.
 * "Mind & Consciousness": Consciousness Meets Science and Activation of Inner Vision (proposed, for Sasha to confirm).
 */
export type CourseCategory = "General" | "Mind & Consciousness";

export interface CourseChangelogEntry {
    /** Semver "MAJOR.MINOR" or "MAJOR.MINOR.PATCH", no leading "v". */
    version: string;
    /** ISO date, YYYY-MM-DD. */
    date: string;
    summary: string;
}

/**
 * VERSIONING RULE (every course is a living, versioned mini-training).
 * Semver. Minor = a new episode or module. Patch = fixes and copy. Major = the structure changes.
 * Every bump adds ONE changelog line (newest LAST in the array; the UI shows newest first) and sets
 * `updatedAt` to that line's date. `version` always equals the last changelog entry's version.
 * Also written in docs/templates/course-from-source.md → Versioning.
 */
export interface CourseConfig {
    slug: string;
    /** Semver, e.g. "1.0". Equals the last changelog entry's version. */
    version: string;
    /** ISO date (YYYY-MM-DD) of the last bump. Equals the last changelog entry's date. */
    updatedAt: string;
    changelog: CourseChangelogEntry[];
    level: CourseLevel;
    category: CourseCategory;
    title: string;
    /** i18n key for the small label above the title. Defaults to "course.eyebrow" ("Free mini-course"). */
    eyebrowKey?: string;
    /** i18n key for the italic line under the title. */
    taglineKey: string;
    /** i18n key for an optional lead paragraph under the tagline. */
    leadKey?: string;
    modules: CourseModule[];
    practices: CoursePractice[];
}
