import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CourseVersionInfo, { changelogNewestFirst, courseVersionLine } from "../CourseVersionInfo";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL } from "@/data/courses/activateYourDormantPotential";
import { CONSCIOUSNESS_MEETS_SCIENCE } from "@/data/courses/consciousnessMeetsScience";
import { NATURE } from "@/data/courses/nature";
import { ACTIVATION_OF_INNER_VISION } from "@/data/courses/activationOfInnerVision";
import { COURSE_SALES } from "@/data/courseSales";

// BODY_STYLE comes from pages/Library, which pulls in the Supabase client (needs a browser); not used here.
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

const COURSES = [ACTIVATE_YOUR_DORMANT_POTENTIAL, CONSCIOUSNESS_MEETS_SCIENCE, NATURE, ACTIVATION_OF_INNER_VISION];
const SEMVER = /^\d+\.\d+(\.\d+)?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("course versioning data", () => {
    it.each(COURSES.map((c) => [c.slug, c] as const))("%s has valid version fields", (_slug, c) => {
        expect(c.version).toMatch(SEMVER);
        expect(c.updatedAt).toMatch(ISO_DATE);
        expect(c.changelog.length).toBeGreaterThan(0);
        for (const e of c.changelog) {
            expect(e.version).toMatch(SEMVER);
            expect(e.date).toMatch(ISO_DATE);
            expect(e.summary.length).toBeGreaterThan(0);
        }
        // The rule: version and updatedAt always equal the last changelog entry.
        const last = c.changelog[c.changelog.length - 1];
        expect(c.version).toBe(last.version);
        expect(c.updatedAt).toBe(last.date);
    });

    it("ADP is a Fundamental / General v1.0 first public version", () => {
        const c = ACTIVATE_YOUR_DORMANT_POTENTIAL;
        expect(c.version).toBe("1.0");
        expect(c.level).toBe("Fundamental");
        expect(c.category).toBe("General");
        expect(c.changelog).toEqual([{ version: "1.0", date: c.updatedAt, summary: "First public version" }]);
    });
});

describe("Nature versioning", () => {
    it("is a Fundamental / General v1.0 first public version, shown on the page and the landing", () => {
        expect(NATURE.version).toBe("1.0");
        expect(NATURE.level).toBe("Fundamental");
        expect(NATURE.category).toBe("General");
        expect(NATURE.changelog).toEqual([{ version: "1.0", date: NATURE.updatedAt, summary: "First public version" }]);
        const sales = COURSE_SALES.find((s) => s.slug === NATURE.slug);
        expect(sales?.versioning?.version).toBe(NATURE.version);
        const html = renderToStaticMarkup(<CourseVersionInfo course={NATURE} />);
        expect(html).toContain(`Current version v1.0 (${NATURE.updatedAt})`);
        expect(html).toContain("First public version");
    });
});

describe("CourseVersionInfo", () => {
    it("renders the line, chips and What's new from ADP data", () => {
        const c = ACTIVATE_YOUR_DORMANT_POTENTIAL;
        const html = renderToStaticMarkup(<CourseVersionInfo course={c} />);
        expect(html).toContain(`Living mini-training, updated continuously. Current version v1.0 (${c.updatedAt}).`);
        expect(html).toContain("What&#x27;s new");
        expect(html).toContain("First public version");
        expect(html).toContain(">Fundamental<");
        expect(html).toContain(">General<");
    });

    it("lists the changelog newest first without mutating the data", () => {
        const log = [
            { version: "1.0", date: "2026-11-01", summary: "First public version" },
            { version: "1.1", date: "2026-12-01", summary: "New episode" },
            { version: "1.1.1", date: "2026-12-01", summary: "Copy fix" },
        ];
        expect(changelogNewestFirst(log).map((e) => e.version)).toEqual(["1.1.1", "1.1", "1.0"]);
        expect(log[0].version).toBe("1.0");
        expect(courseVersionLine({ version: "1.1.1", updatedAt: "2026-12-01" })).toBe(
            "Living mini-training, updated continuously. Current version v1.1.1 (2026-12-01).",
        );
    });

    it("the ADP sales entry carries the same data the course page uses", () => {
        const sales = COURSE_SALES.find((s) => s.slug === ACTIVATE_YOUR_DORMANT_POTENTIAL.slug);
        expect(sales?.versioning?.version).toBe(ACTIVATE_YOUR_DORMANT_POTENTIAL.version);
        const html = renderToStaticMarkup(<CourseVersionInfo course={sales!.versioning!} centered />);
        expect(html).toContain(`Current version v1.0 (${ACTIVATE_YOUR_DORMANT_POTENTIAL.updatedAt})`);
    });
});
