/**
 * CoursePage — free mini-course player in the GROW space, shared by every
 * course under /grow/<slug> (public, no auth).
 *
 * Each course is one data file in src/data/courses/ exporting a CourseConfig.
 * This component has no course- or episode-specific logic: add an episode or
 * an infographic in the data file and it shows up here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { CourseConfig } from "@/data/courses/types";
import { supabase } from "@/integrations/supabase/client";
import {
    flattenEpisodes,
    getPublishedModules,
    isEpisodePublished,
    loadGuestWatched,
    loadLastEpisode,
    mergeGuestWatched,
    saveGuestWatched,
    saveLastEpisode,
    saveWatched,
    soundcloudEmbedUrl,
    youtubeEmbedUrl,
} from "@/lib/coursePlayer";
import { GOLD_TEXT_STYLE } from "@/lib/landingDesign";
import { BODY_STYLE, EYEBROW_STYLE, TITLE_STYLE } from "@/pages/Library";
import { cn } from "@/lib/utils";
import "./CoursePage.css";

const ZOG_ENTRY_PATH = "/zone-of-genius/entry";

const CARD_STYLE: React.CSSProperties = {
    boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)",
};

const CoursePage = ({ course }: { course: CourseConfig }) => {
    const { t } = useTranslation();
    const COURSE_SLUG = course.slug;
    const [searchParams, setSearchParams] = useSearchParams();

    const modules = useMemo(() => getPublishedModules(course.modules), [course.modules]);
    const episodes = useMemo(() => flattenEpisodes(modules), [modules]);
    // Contents list: published modules only, unless the course opts in to showing upcoming episodes.
    const navModules = course.showUpcoming ? course.modules : modules;

    const requestedCode = searchParams.get("ep");
    const currentIndex = useMemo(() => {
        const byParam = episodes.findIndex((e) => e.code === requestedCode);
        if (byParam >= 0) return byParam;
        const byLast = episodes.findIndex((e) => e.code === loadLastEpisode(COURSE_SLUG));
        return byLast >= 0 ? byLast : 0;
    }, [episodes, requestedCode]);
    const current = episodes[currentIndex];

    // A guest's watched episodes live in their own localStorage list; a signed-in user's in the
    // account list. On sign-in the guest list is merged into the account (mergeGuestWatched).
    // Until the session resolves we show the guest list: the one a visitor can have made.
    const [watched, setWatched] = useState<string[]>(() => loadGuestWatched(COURSE_SLUG));
    const signedInRef = useRef(false);

    useEffect(() => {
        let mounted = true;
        const apply = (signedIn: boolean) => {
            if (!mounted) return;
            signedInRef.current = signedIn;
            setWatched(signedIn ? mergeGuestWatched(COURSE_SLUG) : loadGuestWatched(COURSE_SLUG));
        };
        const resolve = () =>
            supabase.auth
                .getSession()
                .then(({ data }) => apply(Boolean(data.session)))
                .catch(() => apply(false));
        resolve();
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            // A null event can be a transient blip during token refresh: re-verify before
            // treating the visitor as a guest (same guard as RequireAuth).
            if (session) apply(true);
            else resolve();
        });
        return () => {
            mounted = false;
            data.subscription.unsubscribe();
        };
    }, [COURSE_SLUG]);

    useEffect(() => {
        if (current) saveLastEpisode(COURSE_SLUG, current.code);
    }, [current]);

    const goTo = useCallback(
        (index: number) => {
            const target = episodes[index];
            if (!target) return;
            setSearchParams({ ep: target.code }, { replace: true });
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [episodes, setSearchParams],
    );

    const markWatched = useCallback((code: string, value: boolean) => {
        setWatched((prev) => {
            const has = prev.includes(code);
            if (value === has) return prev;
            const next = value ? [...prev, code] : prev.filter((c) => c !== code);
            if (signedInRef.current) saveWatched(COURSE_SLUG, next);
            else saveGuestWatched(COURSE_SLUG, next);
            return next;
        });
    }, [COURSE_SLUG]);

    if (!current) return null;

    const isLast = currentIndex === episodes.length - 1;
    const isWatched = watched.includes(current.code);
    const watchedCount = episodes.filter((e) => watched.includes(e.code)).length;
    const progressPct = Math.round((watchedCount / episodes.length) * 100);

    const handleNext = () => {
        markWatched(current.code, true);
        goTo(currentIndex + 1);
    };

    return (
        <div className="p-4 pb-24 sm:p-6 lg:p-10 lg:pb-12 max-w-6xl mx-auto">
            <header className="mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" style={{ color: "rgba(160, 109, 8, 0.85)" }} />
                    <span className="text-[10.5px]" style={EYEBROW_STYLE}>
                        {t(course.eyebrowKey ?? "course.eyebrow")}
                    </span>
                </div>
                <h1
                    className="text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.08] mb-2"
                    style={TITLE_STYLE}
                >
                    <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                        {course.title}
                    </span>
                </h1>
                <p className="text-base sm:text-lg italic max-w-2xl" style={BODY_STYLE}>
                    {t(course.taglineKey)}
                </p>
                {course.leadKey && (
                    <p className="text-sm sm:text-base max-w-2xl mt-3" style={BODY_STYLE}>
                        {t(course.leadKey)}
                    </p>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
                {/* Main column: player, controls, infographic, CTA, practices */}
                <main className="min-w-0 space-y-6">
                    <div
                        className="relative w-full overflow-hidden rounded-2xl bg-black"
                        style={{ aspectRatio: "16 / 9", ...CARD_STYLE }}
                    >
                        <iframe
                            key={current.code}
                            className="absolute inset-0 h-full w-full"
                            src={youtubeEmbedUrl(current.youtubeId)}
                            title={t("course.videoTitle", { title: current.title })}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-[10.5px] mb-1" style={EYEBROW_STYLE}>
                                {current.code} ·{" "}
                                {t("course.episodeOf", { current: currentIndex + 1, total: episodes.length })}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight" style={TITLE_STYLE}>
                                {current.title}
                            </h2>
                            {current.promiseKey && (
                                <p className="mt-1 text-sm sm:text-base leading-snug" style={BODY_STYLE}>
                                    {t(current.promiseKey)}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => markWatched(current.code, !isWatched)}
                            aria-pressed={isWatched}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors",
                                isWatched
                                    ? "bg-[rgba(212,175,55,0.18)] ring-1 ring-[rgba(212,175,55,0.6)]"
                                    : "bg-[rgba(212,175,55,0.06)] ring-1 ring-[rgba(212,175,55,0.22)] hover:bg-[rgba(212,175,55,0.12)]",
                            )}
                            style={{ ...EYEBROW_STYLE, color: "var(--skin-text-primary, #0a1628)", letterSpacing: "0.1em" }}
                        >
                            <Check className="w-3.5 h-3.5" />
                            {isWatched ? t("course.watched") : t("course.markWatched")}
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => goTo(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ring-1 ring-[rgba(212,175,55,0.35)] hover:bg-[rgba(212,175,55,0.1)]"
                            style={{ color: "var(--skin-text-primary, #0a1628)" }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t("course.prev")}
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isLast}
                            className="course-cta inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold"
                        >
                            {t("course.next")}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {current.infographic && (
                        <section aria-label={t("course.infographic")}>
                            <img
                                src={current.infographic}
                                alt={t("course.infographicAlt", { title: current.title })}
                                loading="lazy"
                                className="w-full h-auto rounded-2xl"
                                style={CARD_STYLE}
                            />
                        </section>
                    )}

                    {isLast && (
                        <section
                            className="rounded-2xl p-6 sm:p-8 text-center liquid-glass-strong"
                            style={CARD_STYLE}
                        >
                            <h3 className="text-2xl font-semibold mb-2" style={TITLE_STYLE}>
                                {t("course.ctaTitle")}
                            </h3>
                            <p className="mb-5 italic" style={BODY_STYLE}>
                                {t("course.ctaBody")}
                            </p>
                            <Link
                                to={ZOG_ENTRY_PATH}
                                className="course-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                            >
                                {t("course.ctaButton")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </section>
                    )}

                    {course.practices.length > 0 && (
                    <section aria-labelledby="course-practices">
                        <h3 id="course-practices" className="text-xl font-semibold mb-1" style={TITLE_STYLE}>
                            {t("course.practices")}
                        </h3>
                        <p className="text-sm italic mb-3" style={BODY_STYLE}>
                            {t("course.practicesHint")}
                        </p>
                        <div className="space-y-4">
                            {course.practices.map((practice) => (
                                <div key={practice.id}>
                                    <div className="text-sm font-semibold mb-1.5" style={{ ...BODY_STYLE, fontWeight: 600 }}>
                                        {practice.duration} · {practice.title}
                                    </div>
                                    <iframe
                                        title={`${practice.duration} · ${practice.title}`}
                                        className="w-full rounded-xl"
                                        height={120}
                                        scrolling="no"
                                        allow="autoplay"
                                        loading="lazy"
                                        src={soundcloudEmbedUrl(practice.soundcloudUrl)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                    )}
                </main>

                {/* Sidebar: progress, episode list, subtle CTA */}
                <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
                    <div className="rounded-2xl p-4 liquid-glass-strong" style={CARD_STYLE}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10.5px]" style={EYEBROW_STYLE}>
                                {t("course.contents")}
                            </span>
                            <span className="text-xs tabular-nums" style={BODY_STYLE}>
                                {t("course.progress", { done: watchedCount, total: episodes.length })}
                            </span>
                        </div>
                        <div
                            className="h-1.5 w-full rounded-full overflow-hidden mb-4"
                            style={{ background: "rgba(212, 175, 55, 0.16)" }}
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progressPct}
                        >
                            <div
                                className="course-progress-fill h-full rounded-full transition-[width] duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>

                        <nav className="space-y-4 max-h-[60vh] overflow-y-auto pr-1" aria-label={t("course.contents")}>
                            {navModules.map((module) => (
                                <div key={module.id}>
                                    <div className="text-[10.5px] mb-1.5" style={EYEBROW_STYLE}>
                                        {module.title}
                                    </div>
                                    <ul className="space-y-0.5">
                                        {module.episodes.map((episode) => {
                                            if (!isEpisodePublished(episode)) {
                                                return (
                                                    <li key={episode.code}>
                                                        <div
                                                            className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm opacity-50"
                                                            style={{ color: "var(--skin-text-primary, #0a1628)" }}
                                                        >
                                                            <span
                                                                className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 rounded-full"
                                                                style={{ boxShadow: "inset 0 0 0 1px rgba(212, 175, 55, 0.3)" }}
                                                            />
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-[10px] tracking-wide tabular-nums">
                                                                    {episode.code} · {t("course.comingSoon", { defaultValue: "Coming soon" })}
                                                                </span>
                                                                <span className="block text-xs leading-snug">{episode.title}</span>
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            }
                                            const isCurrent = episode.code === current.code;
                                            const done = watched.includes(episode.code);
                                            return (
                                                <li key={episode.code}>
                                                    <button
                                                        type="button"
                                                        onClick={() => goTo(episodes.indexOf(episode))}
                                                        aria-current={isCurrent ? "true" : undefined}
                                                        className={cn(
                                                            "w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                                                            isCurrent
                                                                ? "bg-[rgba(212,175,55,0.18)] ring-1 ring-[rgba(212,175,55,0.55)]"
                                                                : "hover:bg-[rgba(212,175,55,0.08)]",
                                                        )}
                                                        style={{ color: "var(--skin-text-primary, #0a1628)" }}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
                                                                done && "course-dot-done",
                                                            )}
                                                            style={
                                                                done ? undefined : { boxShadow: "inset 0 0 0 1px rgba(212, 175, 55, 0.5)" }
                                                            }
                                                        >
                                                            {done && <Check className="w-2.5 h-2.5" />}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-[10px] tracking-wide opacity-60 tabular-nums">
                                                                {episode.code}
                                                            </span>
                                                            <span className={cn("block leading-snug", isCurrent && "font-semibold")}>
                                                                {episode.title}
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>

                    <Link
                        to={ZOG_ENTRY_PATH}
                        className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm ring-1 ring-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.1)] transition-colors"
                        style={{ color: "var(--skin-text-primary, #0a1628)" }}
                    >
                        <span>{t("course.ctaButton")}</span>
                        <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </Link>
                </aside>
            </div>
        </div>
    );
};

export default CoursePage;
