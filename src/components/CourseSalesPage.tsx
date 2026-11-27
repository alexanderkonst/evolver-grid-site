import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";
import CourseVersionInfo from "@/components/CourseVersionInfo";
import WaitlistModal from "@/components/WaitlistModal";
import AppIcon from "@/components/AppIcon";
import { appIconForCourse } from "@/lib/appIcons";
import { getPublishedModules } from "@/lib/coursePlayer";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import { BODY_STYLE, EYEBROW_STYLE, TITLE_STYLE } from "@/pages/Library";
import {
    COURSE_LANDING_COPY as COPY,
    courseSalesPath,
    relatedCourses,
    telegramHref,
    type CourseSalesData,
} from "@/data/courseSales";
import "@/pages/CoursePage.css";

/**
 * CourseSalesPage — the ONE template for every Academy course's landing
 * (/academy/<slug>). Content lives in src/data/courseSales.ts; this file only lays it out,
 * in the order of docs/templates/course-landing.md §Sections:
 * title → promise → (level + category chips, version line: #522) → start CTA → who it's for →
 * what's inside (modules and episodes from the course data) → the series (only when published) →
 * the practice → price + format + CTA → related courses.
 * Minimal, in the Academy's editorial register (Cormorant, gold accent, liquid glass).
 * Every section carries `data-landing-section` so tests can check the order without reading copy.
 */

const CARD_STYLE: React.CSSProperties = {
    boxShadow: "0 8px 24px -12px rgba(10, 22, 40, 0.18), 0 0 0 1px rgba(212, 175, 55, 0.22)",
};

const Section = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <section className="mt-10" data-landing-section={id}>
        <h2 className="text-[10.5px] mb-3" style={EYEBROW_STYLE}>
            {label}
        </h2>
        {children}
    </section>
);

const CtaButton = ({ course, onWaitlist }: { course: CourseSalesData; onWaitlist: () => void }) => {
    const cls = "course-cta inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold";
    const { cta } = course;
    if (cta.kind === "start") {
        return (
            <Link to={cta.to} className={cls}>
                {cta.label}
            </Link>
        );
    }
    if (cta.kind === "telegram") {
        return (
            <a href={telegramHref(cta.message)} target="_blank" rel="noopener noreferrer" className={cls}>
                {cta.label}
            </a>
        );
    }
    return (
        <button type="button" onClick={onWaitlist} className={cls}>
            {cta.label}
        </button>
    );
};

const CourseSalesPage = ({ course }: { course: CourseSalesData }) => {
    const [waitlistOpen, setWaitlistOpen] = useState(false);
    const related = relatedCourses(course.slug);
    // A course whose videos are not uploaded yet still lists every episode by title.
    const modules = course.modules
        ? getPublishedModules(course.modules).length > 0 && !course.status
            ? getPublishedModules(course.modules)
            : course.modules
        : undefined;

    return (
        <>
            <SEO
                title={`${course.title} | Academy`}
                description={course.seoDescription}
                path={courseSalesPath(course.slug)}
            />
            <article className="p-6 pb-24 lg:p-10 lg:pb-12 max-w-2xl mx-auto">
                <Link
                    to="/game/learn"
                    className="inline-flex items-center gap-1.5 text-sm mb-8 hover:opacity-80"
                    style={BODY_STYLE}
                >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {COPY.back}
                </Link>

                <header className="text-center" data-landing-section="title">
                    {/* App icon v6 (#559): Potential, Crossing, Vision; the icon follows the active skin. */}
                    {appIconForCourse(course.slug) && (
                        <AppIcon app={appIconForCourse(course.slug)!} size={96} className="mx-auto mb-5" />
                    )}
                    <p className="text-[10.5px] mb-4" style={EYEBROW_STYLE}>
                        {course.eyebrow}
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] mb-4" style={TITLE_STYLE}>
                        <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                            {course.title}
                        </span>
                    </h1>
                    {course.versioning && <CourseVersionInfo course={course.versioning} centered />}
                    <p
                        className="text-lg sm:text-xl italic max-w-xl mx-auto leading-relaxed"
                        style={TITLE_STYLE}
                        data-landing-section="promise"
                    >
                        {course.promise}
                    </p>
                    {course.lead && (
                        <p className="text-base max-w-xl mx-auto mt-4 leading-relaxed" style={BODY_STYLE}>
                            {course.lead}
                        </p>
                    )}
                    <p className="text-sm mt-4" style={BODY_STYLE}>
                        {COPY.author}
                    </p>
                    <div className="mt-7" data-landing-section="start">
                        <CtaButton course={course} onWaitlist={() => setWaitlistOpen(true)} />
                    </div>
                </header>

                <Ornament className="mt-12" />

                <Section id="for-whom" label={COPY.forWhom}>
                    <ul className="space-y-2 list-none p-0 m-0">
                        {course.forWhom.map((line) => (
                            <li key={line} className="text-base leading-relaxed pl-4 relative" style={BODY_STYLE}>
                                <span className="absolute left-0" aria-hidden="true">·</span>
                                {line}
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section id="inside" label={course.insideLabel ?? COPY.inside}>
                    <div className="rounded-2xl p-5 sm:p-6 liquid-glass-strong" style={CARD_STYLE}>
                        {course.status && (
                            <p className="text-xs mb-4 italic" style={BODY_STYLE}>
                                {course.status}
                            </p>
                        )}
                        {modules ? (
                            <ol className="space-y-4 list-none p-0 m-0">
                                {modules.map((m, mi) => (
                                    <li key={m.id}>
                                        <div className="text-base font-semibold" style={{ ...TITLE_STYLE, fontWeight: 600 }}>
                                            {mi + 1}. {m.title}
                                            <span className="text-xs font-normal ml-2" style={BODY_STYLE}>
                                                {m.episodes.length} {m.episodes.length === 1 ? "video" : "videos"}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed mt-0.5" style={BODY_STYLE}>
                                            {m.episodes.map((e) => e.title).join(" · ")}
                                        </p>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <ol className="space-y-3 list-none p-0 m-0">
                                {(course.inside ?? []).map((item, i) => (
                                    <li key={item.title}>
                                        <div className="text-base font-semibold" style={{ ...TITLE_STYLE, fontWeight: 600 }}>
                                            {i + 1}. {item.title}
                                        </div>
                                        {item.note && (
                                            <p className="text-sm leading-relaxed mt-0.5" style={BODY_STYLE}>
                                                {item.note}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </Section>

                {course.teaser && (
                    <Section id="teaser" label={COPY.teaser}>
                        <img
                            src={course.teaser.src}
                            alt={course.teaser.alt}
                            loading="lazy"
                            className="w-full rounded-2xl"
                            style={CARD_STYLE}
                        />
                    </Section>
                )}

                <Section id="practice" label={COPY.practice}>
                    <ul className="space-y-2 list-none p-0 m-0">
                        {course.practice.map((line) => (
                            <li key={line} className="text-base leading-relaxed pl-4 relative" style={BODY_STYLE}>
                                <span className="absolute left-0" aria-hidden="true">·</span>
                                {line}
                            </li>
                        ))}
                    </ul>
                </Section>

                <section
                    className="mt-12 rounded-2xl p-6 sm:p-8 text-center liquid-glass-strong"
                    style={CARD_STYLE}
                    data-landing-section="price"
                >
                    {course.price && (
                        <div className="text-3xl font-semibold mb-1" style={TITLE_STYLE}>
                            {course.price}
                        </div>
                    )}
                    <p className="text-sm" style={BODY_STYLE}>
                        {course.format}
                    </p>
                    {course.order && (
                        <p className="text-sm italic mt-1" style={BODY_STYLE}>
                            {course.order}
                        </p>
                    )}
                    <div className="mt-6">
                        <CtaButton course={course} onWaitlist={() => setWaitlistOpen(true)} />
                    </div>
                </section>

                {related.length > 0 && (
                    <Section id="related" label={COPY.related}>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
                            {related.map((c) => (
                                <li key={c.slug}>
                                    <Link
                                        to={c.to}
                                        className="block h-full rounded-2xl p-4 text-left liquid-glass-strong transition-opacity hover:opacity-90"
                                        style={CARD_STYLE}
                                    >
                                        <span
                                            className="block text-base font-semibold leading-snug"
                                            style={{ ...TITLE_STYLE, fontWeight: 600 }}
                                        >
                                            {c.title}
                                        </span>
                                        <span className="block text-sm italic mt-0.5" style={BODY_STYLE}>
                                            {c.promise}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
            </article>

            {course.cta.kind === "waitlist" && (
                <WaitlistModal
                    isOpen={waitlistOpen}
                    onClose={() => setWaitlistOpen(false)}
                    moduleName={course.cta.waitlistName}
                />
            )}
        </>
    );
};

export default CourseSalesPage;
