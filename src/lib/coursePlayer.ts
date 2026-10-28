/**
 * coursePlayer.ts — pure helpers for the course page (no React).
 * Content lives in src/data/courses/*; this file only filters and stores.
 */
import type { CourseEpisode, CourseModule } from "@/data/courses/types";

/** Episodes whose YouTube id starts with "TBD" are placeholders — hidden in the UI. */
export const isEpisodePublished = (episode: CourseEpisode): boolean =>
    !episode.youtubeId.toUpperCase().startsWith("TBD");

/** Modules reduced to published episodes; modules left empty are dropped. */
export const getPublishedModules = (modules: CourseModule[]): CourseModule[] =>
    modules
        .map((m) => ({ ...m, episodes: m.episodes.filter(isEpisodePublished) }))
        .filter((m) => m.episodes.length > 0);

export const flattenEpisodes = (modules: CourseModule[]): CourseEpisode[] =>
    modules.flatMap((m) => m.episodes);

export const youtubeEmbedUrl = (youtubeId: string): string =>
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0&modestbranding=1`;

export const soundcloudEmbedUrl = (trackUrl: string): string =>
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%23d4af37&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;

const progressKey = (courseSlug: string) => `course-progress:${courseSlug}`;
const lastKey = (courseSlug: string) => `course-last:${courseSlug}`;

export const loadWatched = (courseSlug: string): string[] => {
    try {
        const raw = window.localStorage.getItem(progressKey(courseSlug));
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string") : [];
    } catch {
        return [];
    }
};

export const saveWatched = (courseSlug: string, watched: string[]): void => {
    try {
        window.localStorage.setItem(progressKey(courseSlug), JSON.stringify(watched));
    } catch {
        // Private mode / quota — progress is a convenience, never fatal.
    }
};

export const loadLastEpisode = (courseSlug: string): string | null => {
    try {
        return window.localStorage.getItem(lastKey(courseSlug));
    } catch {
        return null;
    }
};

export const saveLastEpisode = (courseSlug: string, code: string): void => {
    try {
        window.localStorage.setItem(lastKey(courseSlug), code);
    } catch {
        // see saveWatched
    }
};
