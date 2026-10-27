// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
    COURSE_MODULES,
    COURSE_PATH,
    COURSE_SLUG,
} from "@/data/courses/activateYourDormantPotential";
import {
    flattenEpisodes,
    getPublishedModules,
    isEpisodePublished,
    loadLastEpisode,
    loadWatched,
    saveLastEpisode,
    saveWatched,
    soundcloudEmbedUrl,
    youtubeEmbedUrl,
} from "@/lib/coursePlayer";
import { pathUsesLayoutShell } from "@/lib/shellRoutes";

describe("course data", () => {
    it("has unique episode codes", () => {
        const codes = flattenEpisodes(COURSE_MODULES).map((e) => e.code);
        expect(new Set(codes).size).toBe(codes.length);
    });

    it("lives at the public GROW route inside the shell", () => {
        expect(COURSE_PATH).toBe("/grow/activate-your-dormant-potential");
        expect(pathUsesLayoutShell(COURSE_PATH)).toBe(true);
    });
});

describe("getPublishedModules", () => {
    it("skips TBD episodes and drops modules left empty", () => {
        const published = getPublishedModules(COURSE_MODULES);
        const all = flattenEpisodes(published);
        expect(all.length).toBeGreaterThan(0);
        expect(all.every((e) => !e.youtubeId.startsWith("TBD"))).toBe(true);
        expect(published.map((m) => m.id)).not.toContain("welcome");
        expect(published.map((m) => m.id)).not.toContain("closing");
        expect(all[0].code).toBe("F01E01");
    });

    it("shows an episode as soon as its TBD id is replaced", () => {
        const modules = [
            { id: "m", title: "M", episodes: [{ code: "A", title: "A", youtubeId: "TBD-A" }] },
        ];
        expect(getPublishedModules(modules)).toEqual([]);
        modules[0].episodes[0].youtubeId = "abc123";
        expect(flattenEpisodes(getPublishedModules(modules)).map((e) => e.code)).toEqual(["A"]);
        expect(isEpisodePublished(modules[0].episodes[0])).toBe(true);
    });
});

describe("embed urls", () => {
    it("uses youtube-nocookie with rel=0 and modestbranding=1", () => {
        expect(youtubeEmbedUrl("cb5ANfGAtJo")).toBe(
            "https://www.youtube-nocookie.com/embed/cb5ANfGAtJo?rel=0&modestbranding=1",
        );
    });

    it("wraps a SoundCloud track in the w.soundcloud.com player", () => {
        const url = soundcloudEmbedUrl("https://soundcloud.com/a/b");
        expect(url.startsWith("https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fa%2Fb")).toBe(true);
    });
});

describe("progress storage", () => {
    beforeEach(() => window.localStorage.clear());

    it("persists watched episodes across loads", () => {
        expect(loadWatched(COURSE_SLUG)).toEqual([]);
        saveWatched(COURSE_SLUG, ["F01E01", "F01E02"]);
        expect(loadWatched(COURSE_SLUG)).toEqual(["F01E01", "F01E02"]);
    });

    it("ignores corrupt storage", () => {
        window.localStorage.setItem(`course-progress:${COURSE_SLUG}`, "{not json");
        expect(loadWatched(COURSE_SLUG)).toEqual([]);
        window.localStorage.setItem(`course-progress:${COURSE_SLUG}`, JSON.stringify({ a: 1 }));
        expect(loadWatched(COURSE_SLUG)).toEqual([]);
    });

    it("remembers the last episode", () => {
        expect(loadLastEpisode(COURSE_SLUG)).toBeNull();
        saveLastEpisode(COURSE_SLUG, "S01E03");
        expect(loadLastEpisode(COURSE_SLUG)).toBe("S01E03");
    });
});
