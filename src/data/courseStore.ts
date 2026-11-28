/**
 * Educational app store: the tiles on panel 3 of the Learn space (/game/learn/courses).
 *
 * One source, nothing restated: the course list is COURSE_SALES (src/data/courseSales.ts, one entry
 * per Academy course). Slug, title, promise and the "Start" door come from there; level, category
 * and version come from its `versioning` (the course's own CourseConfig, #535). A course with no
 * course data (a live or recorded session) shows no chips and no version. A new course appears in
 * the store when its entry is added to courseSales.ts, and nowhere else.
 * Template: docs/templates/course-as-app.md (step 2, the app tile).
 */
import { COURSE_SALES, courseSalesPath } from "@/data/courseSales";
import type { CourseCategory, CourseLevel } from "@/data/courses/types";
import { appIconForCourse, type AppIconId } from "@/lib/appIcons";

export const COURSE_LEVELS: readonly CourseLevel[] = ["Fundamental", "Intermediate", "Advanced"];

export interface CourseTile {
    slug: string;
    /** Short bold name: the part of the title after a colon, if there is one. */
    name: string;
    /** The result, one line. */
    tagline: string;
    level?: CourseLevel;
    category?: CourseCategory;
    /** "1.0", shown as v1.0. */
    version?: string;
    /** The app icon id (src/lib/appIcons.ts), rendered by <AppIcon>. A course with no app gets a neutral placeholder. */
    app?: AppIconId;
    /** The course landing: /academy/<slug>. */
    landingPath: string;
    /** The course page, for the secondary "Start". Absent while the course has no page of its own. */
    startPath?: string;
}

const shortName = (title: string) => (title.includes(":") ? title.slice(title.indexOf(":") + 1).trim() : title);

export const getCourseTiles = (): CourseTile[] =>
    COURSE_SALES.map((course) => ({
        slug: course.slug,
        name: shortName(course.title),
        tagline: course.promise,
        level: course.versioning?.level,
        category: course.versioning?.category,
        version: course.versioning?.version,
        app: appIconForCourse(course.slug),
        landingPath: courseSalesPath(course.slug),
        startPath: course.cta.kind === "start" ? course.cta.to : undefined,
    }));

/** The distinct values present in the tiles, in a stable order, for the filter chips. */
export const tileLevels = (tiles: CourseTile[]): CourseLevel[] =>
    COURSE_LEVELS.filter((l) => tiles.some((t) => t.level === l));
export const tileCategories = (tiles: CourseTile[]): CourseCategory[] =>
    Array.from(new Set(tiles.map((t) => t.category).filter((c): c is CourseCategory => !!c)));

export const filterTiles = (
    tiles: CourseTile[],
    level: CourseLevel | null,
    category: CourseCategory | null,
): CourseTile[] =>
    tiles.filter((t) => (!level || t.level === level) && (!category || t.category === category));
