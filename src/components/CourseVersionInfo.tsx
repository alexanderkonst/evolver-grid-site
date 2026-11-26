import type { CourseConfig } from "@/data/courses/types";
import { BODY_STYLE } from "@/pages/Library";

/**
 * CourseVersionInfo — the quiet "living mini-training" line, the "What's new" disclosure
 * (changelog, newest first) and the level / category chips. Rendered from the course data
 * (src/data/courses/*) on both the player (CoursePage) and the sales page (CourseSalesPage).
 * English only (Sasha: English UI). Versioning rule: src/data/courses/types.ts.
 */

type CourseVersionData = Pick<CourseConfig, "version" | "updatedAt" | "changelog" | "level" | "category">;

export const courseVersionLine = (c: Pick<CourseVersionData, "version" | "updatedAt">) =>
    `Living mini-training, updated continuously. Current version v${c.version} (${c.updatedAt}).`;

/** Newest first; ties keep the later-listed entry first. Does not mutate the course data. */
export const changelogNewestFirst = (changelog: CourseVersionData["changelog"]) =>
    changelog
        .map((entry, i) => ({ entry, i }))
        .sort((a, b) => (a.entry.date === b.entry.date ? b.i - a.i : a.entry.date < b.entry.date ? 1 : -1))
        .map(({ entry }) => entry);

const CHIP_STYLE: React.CSSProperties = {
    ...BODY_STYLE,
    boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.35)",
};

const Chip = ({ children }: { children: React.ReactNode }) => (
    <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] leading-tight"
        style={CHIP_STYLE}
        data-testid="course-chip"
    >
        {children}
    </span>
);

const CourseVersionInfo = ({ course, centered = false }: { course: CourseVersionData; centered?: boolean }) => (
    <div className={`mt-3 space-y-2 ${centered ? "flex flex-col items-center text-center" : ""}`} data-testid="course-version-info">
        <div className="flex flex-wrap gap-1.5" style={centered ? { justifyContent: "center" } : undefined}>
            <Chip>{course.level}</Chip>
            <Chip>{course.category}</Chip>
        </div>
        <p className="text-xs" style={BODY_STYLE} data-testid="course-version-line">
            {courseVersionLine(course)}
        </p>
        <details className="text-xs" style={BODY_STYLE} data-testid="course-whats-new">
            <summary className="cursor-pointer select-none hover:opacity-80">What&apos;s new</summary>
            <ul className="list-none p-0 mt-1.5 space-y-1 text-left">
                {changelogNewestFirst(course.changelog).map((e) => (
                    <li key={`${e.version}-${e.date}`}>
                        <span className="font-semibold">v{e.version}</span> · {e.date} · {e.summary}
                    </li>
                ))}
            </ul>
        </details>
    </div>
);

export default CourseVersionInfo;
