import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    functions: { invoke: vi.fn() },
  },
}));

import CourseSalesPage from "@/components/CourseSalesPage";
import CourseSales from "@/pages/CourseSales";
import CoursePage from "@/pages/CoursePage";
import AcademyPath from "@/components/game/AcademyPath";
import {
  COURSE_LANDING_COPY,
  COURSE_SALES,
  courseLandingPath,
  courseSalesPath,
  getCourseSales,
  relatedCourses,
} from "@/data/courseSales";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL, COURSE_PATH } from "@/data/courses/activateYourDormantPotential";
import { getPublishedModules } from "@/lib/coursePlayer";
import en from "@/locales/en/common.json";

/**
 * Course landing template (docs/templates/course-landing.md), applied to ADP (issue #523).
 * The landing renders every template section from src/data/courseSales.ts, in order, and every
 * link of the template's links checklist is present.
 */

const ADP_SLUG = ACTIVATE_YOUR_DORMANT_POTENTIAL.slug;
const ADP_LANDING = "/academy/activate-your-dormant-potential";

const wrap = (node: React.ReactNode, path = "/") =>
  renderToStaticMarkup(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </HelmetProvider>,
  );

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const anchors = (html: string) =>
  [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: m[1],
    text: m[2].replace(/<[^>]+>/g, "").trim(),
  }));

describe("course landing, ADP", () => {
  const adp = getCourseSales(ADP_SLUG)!;
  const html = wrap(<CourseSalesPage course={adp} />, ADP_LANDING);

  it("lives at /academy/activate-your-dormant-potential", () => {
    expect(adp).toBeDefined();
    expect(courseSalesPath(ADP_SLUG)).toBe(ADP_LANDING);
    expect(courseLandingPath(ADP_SLUG)).toBe(ADP_LANDING);
  });

  it("renders the template sections in order", () => {
    const order = [...html.matchAll(/data-landing-section="([^"]+)"/g)].map((m) => m[1]);
    // The series (teaser) section appears only when a published image is set; ADP has none yet.
    expect(adp.teaser).toBeUndefined();
    expect(order).toEqual(["title", "promise", "start", "for-whom", "inside", "practice", "price", "related"]);
  });

  it("takes title, promise and every module and episode from the course data", () => {
    expect(html).toContain(escapeHtml(adp.title));
    expect(html).toContain(escapeHtml(adp.promise));
    for (const m of getPublishedModules(ACTIVATE_YOUR_DORMANT_POTENTIAL.modules)) {
      expect(html).toContain(escapeHtml(m.title));
      for (const e of m.episodes) expect(html).toContain(escapeHtml(e.title));
    }
  });

  it("calls ADP a mini-training and starts it at /grow/activate-your-dormant-potential", () => {
    expect(adp.eyebrow).toBe("Free mini-training");
    expect(adp.cta).toEqual({ kind: "start", label: "Start the mini-training", to: COURSE_PATH });
    expect(COURSE_PATH).toBe("/grow/activate-your-dormant-potential");
    const starts = anchors(html).filter((a) => a.href === COURSE_PATH);
    expect(starts.length).toBeGreaterThan(0);
    for (const a of starts) expect(a.text).toBe("Start the mini-training");
    expect(html).not.toMatch(/mini-course/i);
  });

  it("has a Related row linking every other course's landing, from the registry", () => {
    const related = relatedCourses(ADP_SLUG);
    expect(related.map((c) => c.slug)).toEqual(COURSE_SALES.filter((c) => c.slug !== ADP_SLUG).map((c) => c.slug));
    expect(related.length).toBeGreaterThan(0);
    const hrefs = anchors(html).map((a) => a.href);
    for (const c of related) {
      expect(c.to).toBe(courseSalesPath(c.slug));
      expect(hrefs).toContain(c.to);
    }
    expect(hrefs).not.toContain(ADP_LANDING);
  });

  it("an unknown slug has no landing (CourseSales redirects it to /game/learn; e2e DoD 5 walks it)", () => {
    expect(getCourseSales("no-such-course")).toBeUndefined();
    expect(wrap(<CourseSales />, "/academy/no-such-course")).toBe("");
  });

  it("links back to the Academy", () => {
    expect(anchors(html)).toContainEqual({ href: "/game/learn", text: COURSE_LANDING_COPY.back });
  });

  it("renders the series section when a published teaser is set", () => {
    const withTeaser = wrap(
      <CourseSalesPage course={{ ...adp, teaser: { src: "/infographics/example.png", alt: "Example" } }} />,
    );
    const order = [...withTeaser.matchAll(/data-landing-section="([^"]+)"/g)].map((m) => m[1]);
    expect(order.indexOf("teaser")).toBe(order.indexOf("inside") + 1);
    expect(withTeaser).toContain('src="/infographics/example.png"');
  });
});

describe("links to the landing", () => {
  it("the ADP course page header links «About this mini-training» to the landing", () => {
    const html = wrap(<CoursePage course={ACTIVATE_YOUR_DORMANT_POTENTIAL} />, COURSE_PATH);
    expect(anchors(html)).toContainEqual({ href: ADP_LANDING, text: COURSE_LANDING_COPY.about });
    expect(COURSE_LANDING_COPY.about).toBe("About this mini-training");
  });

  it("the ADP course page calls it a mini-training (eyebrow)", () => {
    expect(ACTIVATE_YOUR_DORMANT_POTENTIAL.eyebrowKey).toBe("course.eyebrowMiniTraining");
    expect(en.course.eyebrowMiniTraining).toBe("Free mini-training");
  });

  it("a course without a landing shows no About link", () => {
    expect(courseLandingPath("no-such-course")).toBeUndefined();
    const html = wrap(<CoursePage course={{ ...ACTIVATE_YOUR_DORMANT_POTENTIAL, slug: "no-such-course" }} />);
    expect(html).not.toContain(COURSE_LANDING_COPY.about);
  });

  it("the Academy (/game/learn) opens the ADP landing", () => {
    const html = wrap(<AcademyPath />, "/game/learn");
    expect(anchors(html).map((a) => a.href)).toContain(ADP_LANDING);
  });
});
