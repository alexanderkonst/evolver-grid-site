// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: () => Promise.resolve({ data: { session: null } }) } } }));

import CourseStore from "@/components/game/CourseStore";
import { COURSE_SALES } from "@/data/courseSales";
import { COURSE_PATH } from "@/data/courses/activateYourDormantPotential";

const html = renderToStaticMarkup(
  <MemoryRouter>
    <CourseStore />
  </MemoryRouter>,
);

describe("CourseStore (panel 3, #524)", () => {
  it("renders one tile per course", () => {
    expect(html.match(/data-testid="store-tile"/g)).toHaveLength(COURSE_SALES.length);
  });

  it("tile tap goes to the landing, Start goes to the course page", () => {
    for (const c of COURSE_SALES) expect(html).toContain(`href="/academy/${c.slug}"`);
    expect(html).toContain(`data-testid="store-start" aria-label="Start`);
    expect(html).toContain(`href="${COURSE_PATH}"`);
  });

  it("shows level and category chips and the version", () => {
    expect(html).toContain("Fundamental");
    expect(html).toContain('data-testid="chip-category"');
    expect(html).toContain("v1.0");
  });

  it("offers level and category filters, none pressed but All", () => {
    expect(html).toContain('aria-label="Level"');
    expect(html).toContain('aria-label="Category"');
    expect(html).not.toMatch(/aria-pressed="true"[^>]*>(Fundamental|Advanced|General)/);
  });

  it("has no looping animation classes", () => {
    expect(html).not.toMatch(/animate-(pulse|spin|bounce|ping)/);
    expect(html).not.toMatch(/animation:|ornament-spin/);
  });
});
