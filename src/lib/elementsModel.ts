/**
 * The five elements as data (C1, docs/02-strategy/game_launch_spec.md).
 *
 * Canon: docs/02-strategy/game_of_being_you.md §2 (table) and §11 (the Fifth Element).
 * Body = cube = Earth · Emotions = icosahedron = Water · Mind = octahedron = Air ·
 * Spirit = tetrahedron = Fire · Uniqueness = dodecahedron = Aether, in the center.
 * The four orbit the one in the middle: "You are the fifth element".
 *
 * `pathId` is the id `/game/learn/path/:pathId` already understands
 * (src/pages/spaces/transformation/PathSection.tsx). Uniqueness is `genius` there and is the
 * center, so it carries no button.
 */

export type ElementId = "body" | "emotions" | "mind" | "spirit" | "uniqueness";
export type SolidKind = "cube" | "icosahedron" | "octahedron" | "tetrahedron" | "dodecahedron";

export interface ElementDef {
  id: ElementId;
  /** Path name, canon §2. */
  path: string;
  solid: SolidKind;
  element: string;
  /** The Meaning column of §2, verbatim. */
  meaning: string;
  /** Id for `/game/learn/path/:pathId`; null for the center. */
  pathId: string | null;
  /**
   * Theme token the solid takes its colour from. The four orbiting solids use the iridescent
   * village hues (`--vl-iris-*`, same in every skin, so they stay apart in Lunar, where the
   * soul colours are silver until earned). The center follows the skin's accent.
   */
  colorVar: string;
  /** Colour used only if the token cannot be read (SSR, tests). */
  colorFallback: string;
}

export const CENTER: ElementDef = {
  id: "uniqueness",
  path: "Uniqueness",
  solid: "dodecahedron",
  element: "Aether",
  meaning: "your unique gift, refracted into the world",
  pathId: null,
  colorVar: "--scene-accent",
  colorFallback: "#d4af37",
};

/** The four that orbit, in the order they sit around the center. */
export const ORBITING: ElementDef[] = [
  {
    id: "body",
    path: "Body",
    solid: "cube",
    element: "Earth",
    meaning: "vitality and foundation",
    pathId: "body",
    colorVar: "--vl-iris-3",
    colorFallback: "#8ff5c8",
  },
  {
    id: "emotions",
    path: "Emotions",
    solid: "icosahedron",
    element: "Water",
    meaning: "mastery of inner weather",
    pathId: "emotions",
    colorVar: "--vl-iris-4",
    colorFallback: "#7fc8ff",
  },
  {
    id: "mind",
    path: "Mind",
    solid: "octahedron",
    element: "Air",
    meaning: "clarity and perception",
    pathId: "mind",
    colorVar: "--vl-iris-5",
    colorFallback: "#c39bff",
  },
  {
    id: "spirit",
    path: "Spirit",
    solid: "tetrahedron",
    element: "Fire",
    meaning: "the fire that moves you",
    pathId: "spirit",
    colorVar: "--vl-iris-1",
    colorFallback: "#ff9ad5",
  },
];

export const ALL_ELEMENTS: ElementDef[] = [...ORBITING, CENTER];

export const FIFTH_ELEMENT_HEADLINE = "You are the fifth element";
/** §11: the four are held by the center and refracted through it. */
export const FIFTH_ELEMENT_LINE = "Body, Emotions, Mind and Spirit orbit it. Your uniqueness holds them and refracts them into the world.";

export const elementById = (id: ElementId): ElementDef =>
  ALL_ELEMENTS.find((e) => e.id === id) as ElementDef;

export const pathHref = (pathId: string): string => `/game/learn/path/${pathId}`;

/** "vitality and foundation" → "Vitality and foundation" */
export const sentence = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** True when this browser can create a WebGL context. False on the server and in tests. */
export const hasWebGL = (): boolean => {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
