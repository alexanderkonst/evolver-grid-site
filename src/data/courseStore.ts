/**
 * Educational app store: the tiles on panel 3 of the Learn space (/game/learn/courses).
 *
 * One source, nothing restated: the course list is COURSE_SALES (src/data/courseSales.ts, one entry
 * per Academy course; slug, title and promise come from there), joined with the module registry
 * (src/data/modules.ts) for level, category, version and the course page. A new course appears in
 * the store when its data is added to those two files, and nowhere else.
 * Template: docs/templates/course-as-app.md (step 2, the app tile).
 */
import { COURSE_SALES, courseSalesPath } from "@/data/courseSales";
import { getRegistryModule } from "@/data/modules";
import type { CourseCategory, CourseLevel } from "@/types/module";
import potentialIcon from "../../docs/assets/infographics/apps/potential@128.png";
import crossingIcon from "../../docs/assets/infographics/apps/crossing@128.png";
import visionIcon from "../../docs/assets/infographics/apps/vision@128.png";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL } from "@/data/courses/activateYourDormantPotential";
import { CONSCIOUSNESS_MEETS_SCIENCE } from "@/data/courses/consciousnessMeetsScience";
import { ACTIVATION_OF_INNER_VISION } from "@/data/courses/activationOfInnerVision";

/** Icons that exist in docs/assets/infographics/apps/. A course without one gets a neutral placeholder. */
const COURSE_ICONS: Record<string, string> = {
    [ACTIVATE_YOUR_DORMANT_POTENTIAL.slug]: potentialIcon,
    [CONSCIOUSNESS_MEETS_SCIENCE.slug]: crossingIcon,
    [ACTIVATION_OF_INNER_VISION.slug]: visionIcon,
};

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
    icon?: string;
    /** The course landing: /academy/<slug>. */
    landingPath: string;
    /** The course page, for the secondary "Start". Absent while the course has no page of its own. */
    startPath?: string;
}

const shortName = (title: string) => (title.includes(":") ? title.slice(title.indexOf(":") + 1).trim() : title);

export const getCourseTiles = (): CourseTile[] =>
    COURSE_SALES.map((course) => {
        const entry = getRegistryModule(course.slug);
        return {
            slug: course.slug,
            name: shortName(course.title),
            tagline: course.promise,
            level: entry?.courseLevel,
            category: entry?.courseCategory,
            version: entry?.versionNumber,
            icon: COURSE_ICONS[course.slug],
            landingPath: courseSalesPath(course.slug),
            startPath: entry?.startRoute,
        };
    });

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
