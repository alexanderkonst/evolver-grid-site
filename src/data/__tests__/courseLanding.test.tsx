import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
vi.mock("@/components/SEO", () => ({ default: () => null }));

import CourseSalesPage from "@/components/CourseSalesPage";
import {
    COURSE_SALES,
    courseInfographic,
    courseSalesPath,
    getCourseSales,
    relatedCourses,
    versionLine,
} from "@/data/courseSales";
import { COURSE_PATH as ADP_PATH } from "@/data/courses/activateYourDormantPotential";

const ADP = getCourseSales("activate-your-dormant-potential")!;

const html = (course = ADP) =>
    renderToStaticMarkup(
        <MemoryRouter>
            <CourseSalesPage course={course} />
        </MemoryRouter>,
    );

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");

const hrefs = (markup: string) => [...markup.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);

describe("course landing, ADP (docs/templates/course-landing.md)", () => {
    it("lives at /academy/<slug>; the start CTA opens the course page", () => {
        expect(courseSalesPath(ADP.slug)).toBe("/academy/activate-your-dormant-potential");
        expect(ADP.cta).toEqual({ kind: "start", label: "Start the mini-training", to: ADP_PATH });
        const markup = html();
        expect(markup).toContain("Start the mini-training");
        expect(hrefs(markup)).toContain("/grow/activate-your-dormant-potential");
    });

    it("renders title, promise and every module with its episodes from course data", () => {
        const markup = html();
        expect(markup).toContain(ADP.title);
        expect(markup).toContain(esc(ADP.promise));
        for (const m of ADP.modules!) {
            expect(markup).toContain(esc(m.title));
            for (const e of m.episodes) expect(markup).toContain(esc(e.title));
        }
    });

    it("related row links every other registry course and never itself", () => {
        const related = relatedCourses(ADP.slug);
        expect(related.length).toBe(COURSE_SALES.length - 1);
        expect(related.map((c) => c.slug)).not.toContain(ADP.slug);
        const links = hrefs(html());
        for (const c of related) expect(links).toContain(courseSalesPath(c.slug));
        expect(links).not.toContain(courseSalesPath(ADP.slug));
    });

    it("links back to the Academy", () => {
        expect(hrefs(html())).toContain("/game/learn");
    });

    it("chips and version line render from data, and only when the data has them", () => {
        expect(html()).not.toContain("course-chip");
        expect(html()).not.toContain("course-version");
        const markup = html({ ...ADP, level: "Fundamental", category: "General", version: { number: "1.0", updatedAt: "2026-11-26" } });
        expect(markup.match(/data-testid="course-chip"/g)).toHaveLength(2);
        expect(markup).toContain("Fundamental");
        expect(markup).toContain("General");
        expect(markup).toContain("Living mini-training, updated continuously. Current version v1.0 (2026-11-26).");
    });

    it("shows the series infographic only when an episode carries one", () => {
        expect(versionLine({ number: "1.2", updatedAt: "2026-12-01" })).toContain("v1.2 (2026-12-01)");
        expect(html()).not.toContain("The series in one picture");
        const withPic = {
            ...ADP,
            modules: [{ id: "m", title: "M", episodes: [{ code: "1", title: "One", youtubeId: "x", infographic: "/pic.png" }] }],
        };
        expect(courseInfographic(withPic)).toEqual({ src: "/pic.png", title: "One" });
        expect(html(withPic)).toContain('src="/pic.png"');
    });
});
