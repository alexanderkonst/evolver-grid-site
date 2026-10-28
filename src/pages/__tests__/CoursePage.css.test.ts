import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../CoursePage.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../CoursePage.tsx", import.meta.url), "utf8");

const rule = (selector: string): string => {
    const start = css.indexOf(`${selector} {`);
    expect(start, `rule ${selector}`).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf("}", start));
};

describe("course player Next button", () => {
    it("takes its surface from the skin's CTA tokens, so it is as loud as the skin's primary button", () => {
        const enabled = rule(".course-cta");
        for (const token of ["--skin-cta-bg", "--skin-cta-text", "--skin-cta-border", "--skin-cta-shadow"]) {
            expect(enabled).toContain(`var(${token}`);
        }
        expect(enabled).toContain("opacity: 1");
    });

    it("looks disabled only when it is disabled", () => {
        const disabled = rule(".course-cta:disabled");
        expect(disabled).toContain("opacity: 0.4");
        expect(disabled).toContain("grayscale(1)");
        // No dimming rule that applies to the enabled button.
        expect(css).not.toMatch(/\.course-cta\s*\{[^}]*opacity:\s*0\.[0-9]/);
    });

    it("is wired to the class, with no inline gold or opacity override", () => {
        expect(page).toContain('className="course-cta ');
        expect(page).not.toContain("GOLD_BUTTON_STYLE");
    });
});
