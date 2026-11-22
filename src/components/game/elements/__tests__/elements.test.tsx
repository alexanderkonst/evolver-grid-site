import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  ALL_ELEMENTS,
  CENTER,
  FIFTH_ELEMENT_HEADLINE,
  ORBITING,
  elementById,
  hasWebGL,
  pathHref,
} from "@/lib/elementsModel";
import ElementsExplorer from "../ElementsExplorer";
import ElementsFallback from "../ElementsFallback";

const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");

const render = (node: React.ReactNode) => renderToStaticMarkup(<MemoryRouter>{node}</MemoryRouter>);

describe("five elements: canon mapping (game_of_being_you.md §2)", () => {
  it("maps each path to its solid and element", () => {
    const row = (id: Parameters<typeof elementById>[0]) => {
      const e = elementById(id);
      return [e.path, e.solid, e.element];
    };
    expect(row("body")).toEqual(["Body", "cube", "Earth"]);
    expect(row("emotions")).toEqual(["Emotions", "icosahedron", "Water"]);
    expect(row("mind")).toEqual(["Mind", "octahedron", "Air"]);
    expect(row("spirit")).toEqual(["Spirit", "tetrahedron", "Fire"]);
    expect(row("uniqueness")).toEqual(["Uniqueness", "dodecahedron", "Aether"]);
  });

  it("puts the dodecahedron in the center and orbits the other four", () => {
    expect(CENTER.solid).toBe("dodecahedron");
    expect(ORBITING.map((e) => e.solid).sort()).toEqual(["cube", "icosahedron", "octahedron", "tetrahedron"]);
    expect(ALL_ELEMENTS).toHaveLength(5);
  });

  it("gives every orbiting solid a button to an existing path id, and the center none", () => {
    const pathSection = read("../../../../pages/spaces/transformation/PathSection.tsx");
    for (const e of ORBITING) {
      expect(e.pathId, e.id).toBeTruthy();
      expect(pathSection, e.id).toMatch(new RegExp(`^\\s+${e.pathId}: \\{`, "m"));
    }
    expect(CENTER.pathId).toBeNull();
  });

  it("takes every colour from a theme token", () => {
    for (const e of ALL_ELEMENTS) expect(e.colorVar).toMatch(/^--/);
  });
});

describe("ElementsExplorer", () => {
  it("falls back to the static SVG when WebGL is missing", () => {
    expect(hasWebGL()).toBe(false); // node: no document, so no WebGL
    const html = render(<ElementsExplorer />);
    expect(html).toContain('data-mode="svg"');
    expect(html).toContain("<svg");
    expect(html).not.toContain("<canvas");
  });

  it("offers the five elements as buttons", () => {
    const html = render(<ElementsExplorer />);
    for (const e of ALL_ELEMENTS) expect(html).toContain(`${e.path} · ${e.element}`);
  });

  it("opens a solid's panel with path, element, meaning and one link to the path", () => {
    const html = render(<ElementsExplorer initialSelected="mind" />);
    expect(html).toContain("Air: clarity and perception.");
    expect(html).toContain(`href="${pathHref("mind")}"`);
    expect(html).toContain("Open the Mind path");
  });

  it("opens the center with the Aether line and the fifth-element headline, no path button", () => {
    const html = render(<ElementsExplorer initialSelected="uniqueness" />);
    expect(html).toContain(FIFTH_ELEMENT_HEADLINE);
    expect(html).toContain("Aether");
    expect(html).toContain("your unique gift, refracted into the world");
    expect(html).not.toContain("/game/learn/path/");
  });

  it("draws all five shapes in the fallback, in theme tokens", () => {
    const html = render(<ElementsFallback selected={null} onSelect={() => {}} />);
    expect((html.match(/<g /g) ?? []).length).toBe(5);
    expect(html).toContain("var(--vl-iris-3");
    expect(html).toContain("var(--scene-accent");
    expect(html).not.toMatch(/fill="#/);
  });
});

describe("drag turns the model, and a drag is not a tap (playtest 2026-11-22, #391)", () => {
  it("the SVG fallback takes pointer events and blocks touch scrolling", () => {
    const html = render(<ElementsFallback selected={null} onSelect={() => {}} />);
    expect(html).toContain("touch-action:none");
  });

  it("the fallback ignores the click that ends a drag and captures the pointer only after a drag starts", () => {
    const src = read("../ElementsFallback.tsx");
    expect(src).toContain("onPointerDown");
    expect(src).toContain("onPointerMove");
    expect(src).toContain("swallowIfDragged");
    expect(src).toMatch(/if \(Math\.abs\(e\.clientX - p\.x\) < DRAG_PX\) return;[\s\S]*setPointerCapture/);
  });

  it("the WebGL canvas sets touch-action none and drops a drag-ending click", () => {
    const src = read("../ElementsScene.tsx");
    expect(src).toContain('gl.domElement.style.touchAction = "none"');
    expect(src).toContain("e.delta > DRAG_PX");
    expect(src).toMatch(/onPointerMissed=\{[\s\S]*Math\.hypot[\s\S]*> DRAG_PX\) return;/);
  });
});

describe("wiring", () => {
  const app = read("../../../../App.tsx");

  it("serves /game/learn/elements publicly (no RequireAuth), like /game/learn", () => {
    expect(app).toMatch(/<Route path="\/game\/learn\/elements" element=\{<ElementsModel \/>\} \/>/);
  });

  it("lazy-loads the canvas and the page", () => {
    expect(app).toContain('lazy(() => import("./pages/spaces/transformation/Elements"))');
    expect(read("../ElementsExplorer.tsx")).toContain('lazy(() => import("./ElementsScene"))');
  });

  it("has one tile on LearnSpace (the Academy) that links to it", () => {
    expect(read("../../AcademyPath.tsx")).toContain('to="/game/learn/elements"');
  });

  it("respects prefers-reduced-motion in the scene", () => {
    const scene = read("../ElementsScene.tsx");
    expect(scene).toContain("reducedMotion");
    expect(scene).toMatch(/if \(reduced\)/);
    expect(read("../ElementsExplorer.tsx")).toContain("prefers-reduced-motion");
  });
});
