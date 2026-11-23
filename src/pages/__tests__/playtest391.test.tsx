import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FoundersHero } from "@/components/founders/FoundersShared";

const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

describe("playtest 2026-11-22 point fixes (#391)", () => {
  it("my-artifacts: no raw snake_case, no empty score dash, a skeleton while loading", () => {
    const src = read("../MyArtifactsPage.tsx");
    expect(src).toContain("publicDossier.artifact.");
    expect(src).toContain("humanizeKey");
    expect(src).not.toContain(': "—"');
    expect(src).toContain('data-testid="artifacts-skeleton"');
  });

  it("book: heading number and title are separated by a space; images next to their text have no alt", () => {
    const src = read("../spaces/transformation/InfographicBook.tsx");
    expect(src).toMatch(/\{chapter\.number\}\s*<\/span>\{" "\}\s*\{chapter\.title\}/);
    expect(src).toContain('decorative ? ""');
  });

  it("house: the sidebar has no second Home row (the pane header already says Home)", () => {
    const src = read("../../components/game/SectionsPanel.tsx");
    expect(src).not.toContain('id: "me-home"');
  });

  it("house: the four-ring clock is in the page header and also while the save loads or fails", () => {
    const src = read("../spaces/sections/ProfileOverview.tsx");
    expect((src.match(/<BiologicClock className="cs-clock" \/>/g) ?? []).length).toBe(3);
  });

  it("clients showcase: stat values and labels are separated by whitespace", () => {
    const html = renderToStaticMarkup(<FoundersHero />);
    expect(html).toMatch(/4<\/span> <span>canvases<\/span>/);
    expect(html).toMatch(/<\/div> <div[^>]*>[^]*?10<\/span> <span>days/);
    expect(html).not.toMatch(/<\/span><span>/);
  });
});
