/**
 * The Digital Village: single source for places, copy, routes and map markers.
 * Design: docs/02-strategy/game_of_being_you.md §13.1–§13.4.
 *
 * Every place points at an existing module; nothing here is a new module.
 * `x` / `y` are percentages of the map image (public/game/village/map.webp, 1024×1024),
 * so markers stay on their buildings at any crop. Tune them here.
 *
 * `rule` says when a place opens, what its closed line is, what finishing it means
 * and when it is live; `placeState` (src/lib/placeState.ts) turns it into
 * closed / open / next / done / live (§14.3, §14.11). Journey step ids point at
 * JOURNEY_MAIN (src/data/journeySequence.ts); nothing here restates its order.
 */

import type { PlaceInput, PlaceRule } from "@/lib/placeState";
import { getRegistryModule } from "@/data/modules";
import { FMF_PAGE_PATH, fmfLiveWindows } from "@/data/fmfSession";

/** FMF live windows, one per lunar cycle (src/data/fmfSession.ts). */
const FMF_WINDOWS = fmfLiveWindows();

/** Start route of a module, read from the module registry (src/data/modules.ts), the one source of module data. */
const moduleRoute = (slug: string): string => {
  const route = getRegistryModule(slug)?.startRoute;
  if (!route) throw new Error(`villagePlaces: module "${slug}" has no startRoute in the registry`);
  return route;
};

export type VillagePlaceKey =
  | "reception"
  | "house"
  | "quest-board"
  | "oracle"
  | "cafe"
  | "coworking"
  | "fire-circle"
  | "academy"
  | "workshop"
  | "market"
  | "town-hall";

/**
 * The five quarters of the village (GoBY §25.14, Sasha 2026-11-25): an element is a quarter of
 * the map, never a door. Order is the order of the quarters in the rail.
 */
export type ElementKey = "ether" | "air" | "water" | "fire" | "earth";
export type SolidKey = "dodecahedron" | "octahedron" | "icosahedron" | "tetrahedron" | "cube";

export type VillageElement = {
  key: ElementKey;
  /** English name of the element; `village.quarter.<key>.name` translates «<Element> quarter». */
  name: string;
  solid: SolidKey;
  /**
   * The quarter's one accent colour. Each reaches AA (4.5:1) on the Lunar night scene at deep
   * night and at first light (`--lunar-dawn` 0 and 1, src/styles/lunar-world.css) and on the
   * rail's navy; src/data/__tests__/villageElements.test.ts holds the numbers.
   */
  color: string;
};

export const VILLAGE_ELEMENTS: readonly VillageElement[] = [
  { key: "ether", name: "Ether", solid: "dodecahedron", color: "#c8b6ff" },
  { key: "air", name: "Air", solid: "octahedron", color: "#9fd6ff" },
  { key: "water", name: "Water", solid: "icosahedron", color: "#5fe0d3" },
  { key: "fire", name: "Fire", solid: "tetrahedron", color: "#ff9d78" },
  { key: "earth", name: "Earth", solid: "cube", color: "#dcc473" },
];

export const getVillageElement = (key: ElementKey): VillageElement =>
  VILLAGE_ELEMENTS.find((e) => e.key === key)!;

export type VillagePlace = {
  key: VillagePlaceKey;
  name: string;
  /** The quarter the place stands in (§25.14). One place, one element. */
  element: ElementKey;
  line: string;
  /** The line once a session exists (Reception: «Welcome back» instead of the guest's line). */
  lineReturning?: string;
  /** `lineReturning` for a signed-in player who has a name; `{{name}}` is the one `displayName()`. */
  lineReturningNamed?: string;
  /** Module route behind ENTER. */
  to: string;
  /** When it opens, its closed line, what finishing it means, when it is live. */
  rule: PlaceRule;
  /** «What changed» line on the visit after it opens. Absent = «<Name> is open.» (see `whatChanged`). */
  opened?: string;
  /** Night scene image (public/game/village). */
  image: string;
  alt: string;
  /**
   * Optional focal point of the scene, % of image width / height (default 50 / 50).
   * Scenes are shown with object-fit: cover, never stretched; this picks which part
   * survives the crop (most scenes are square, so a wide screen shows a horizontal
   * band and a phone a vertical strip). Aim it at the subject, a little above centre
   * on y, because the title and action sit over the lower part of the scene.
   */
  focus?: { x: number; y: number };
  /** Marker position on the map, % of image width / height. */
  x: number;
  y: number;
  /** Which side of the marker the label sits on (default: right). */
  side?: "left" | "right";
  /**
   * Nudges the label (not the marker) up or down, in px, where two labels
   * would collide: Town Hall and Co-working sit 1% apart on y and face each other.
   */
  labelDy?: number;
};

export const VILLAGE_MAP = {
  image: "/game/village/map.webp",
  alt: "The Digital Village from above at dusk: a whitewashed compound of domes, terraces and a tower with glowing windows and a turquoise pool, on a jungle hillside above a rocky shore and the sea, a path of lanterns winding between the buildings, and a luminous crystal dodecahedron floating over the roofs",
  /** Intrinsic size of map.webp; the stage keeps this ratio so % markers align. */
  width: 1024,
  height: 1024,
  /**
   * Focal point of the map, % of image width / height, for object-fit: cover.
   * The image is square, so a wide screen shows a horizontal band of it; this keeps
   * the buildings in view and the sky free for the title.
   */
  focus: { x: 50, y: 40 },
} as const;

const TOP_TALENT_SAVED = "your top talent is saved to your account";

export const VILLAGE_PLACES: VillagePlace[] = [
  {
    key: "reception",
    element: "ether",
    name: "Entry Portal",
    // A guest is «you», never «guest» and never a name (iconic spec §5 #4).
    line: "You're welcome here. Discover your uniqueness.",
    lineReturning: "Welcome back. Discover your uniqueness.",
    lineReturningNamed: "Welcome back, {{name}}. Discover your uniqueness.",
    to: moduleRoute("zone-of-genius"),
    rule: { steps: ["find-top-talent"] },
    // The scene file is still named gate.webp; kept until a Reception scene is made.
    image: "/game/village/gate.webp",
    alt: "A grand marble stair lined with lanterns and candles rises to a welcoming arched doorway glowing warm gold, a crystal dodecahedron shining above it in the night sky",
    focus: { x: 50, y: 10 },
    x: 9,
    y: 57,
  },
  {
    key: "house",
    element: "ether",
    name: "Home",
    line: "Your crystal, mission and save file.",
    to: "/game/me/overview",
    rule: {
      opens: "find-top-talent",
      closed: { event: TOP_TALENT_SAVED, inside: "your crystal, mission and save file", key: "village.closed.house" },
      steps: ["discover-mission", "assess-qol", "map-assets"],
    },
    opened: "Home is open.",
    image: "/game/village/house.webp",
    alt: "Inside your house at night: tall white columns hung with string lights, a luminous crystal dodecahedron on an altar of candles, amethyst and quartz, and a singing bowl on the rugs",
    focus: { x: 50, y: 75 },
    x: 90,
    y: 57,
    side: "left",
  },
  {
    key: "quest-board",
    element: "ether",
    name: "Quest Board",
    line: "Your next quest.",
    to: "/game/journey",
    rule: {
      opens: "find-top-talent",
      closed: { event: TOP_TALENT_SAVED, inside: "your next quest", key: "village.closed.quest-board" },
    },
    image: "/game/village/quest-board.webp",
    alt: "A rooftop terrace at dusk with a wooden quest board of pinned notes, lanterns, cushions on rugs around a low table, white domes and the sea beyond",
    focus: { x: 65, y: 30 },
    x: 35,
    y: 37,
  },
  {
    key: "oracle",
    element: "air",
    name: "Your AI",
    line: "Ask your AI.",
    to: "/game/your-ai",
    // Open to everyone, guests included: the place shows what the AI already has (activated)
    // and what opens the rest (docs/specs/ai-familiar/ai-familiar_tracker.md §1.5). The key
    // stays `oracle` so saves and the rail keep working.
    rule: {},
    image: "/game/village/oracle.webp",
    alt: "A still reflecting pool at night, a glowing crystal dodecahedron floating above its mirrored water, neon-lit arches on one side, floating candles and a singing bowl in the foreground",
    focus: { x: 50, y: 60 },
    x: 36,
    y: 53,
  },
  {
    key: "cafe",
    element: "water",
    name: "Café",
    line: "Meet people, professionally or simply.",
    to: "/game/meet",
    // Open to guests: the Café holds the FMF invite, which a
    // visitor must be able to see before they have a character. The personal parts (create an
    // event, RSVPs) stay behind sign-in on their own routes.
    rule: {},
    image: "/game/village/cafe.webp",
    alt: "A café lounge open to the night sea, deep blue sofas and poufs on woven rugs, candles, amethyst geodes, and neon-edged arches framing a string-lit horizon",
    focus: { x: 50, y: 55 },
    x: 16,
    y: 44,
    side: "left",
  },
  {
    key: "coworking",
    element: "water",
    name: "Co-working",
    line: "Find partners for the work.",
    to: "/game/collaborate/matches",
    rule: {
      opens: "triad",
      closed: {
        event: "your top talent, mission and assets are saved",
        inside: "partners for the work",
        key: "village.closed.coworking",
      },
    },
    image: "/game/village/coworking.webp",
    alt: "A long arched hall for co-working: wooden desks with brass lamps and laptops, sacred-geometry paintings on the walls, string lights, and a window onto the starry night",
    focus: { x: 50, y: 45 },
    x: 83,
    y: 30,
    side: "left",
    labelDy: 12,
  },
  {
    key: "fire-circle",
    element: "fire",
    name: "FMF",
    line: "Your FMF circle.",
    to: FMF_PAGE_PATH,
    rule: {
      // FMF (formerly the Mastermind), one per lunar cycle: Monday to Wednesday, Mexico City
      // (src/data/fmfSession.ts). Session times are not in the code, so each window is the three days.
      live: {
        ...FMF_WINDOWS[0],
        also: FMF_WINDOWS.slice(1),
        line: "Live now: FMF, Monday to Wednesday.",
        key: "village.live.fire-circle",
      },
    },
    image: "/game/village/fire-circle.webp",
    alt: "A domed hall with a brass fire bowl at its center, patterned seats in a circle around it, tall white columns, crystals and candles, and a glowing oculus above",
    focus: { x: 50, y: 90 },
    x: 74,
    y: 36,
  },
  {
    key: "academy",
    element: "fire",
    name: "Academy",
    line: "Grow in what matters most.",
    to: "/game/learn",
    rule: {},
    image: "/game/village/academy.webp",
    alt: "A grand library under a dome at night: curved wooden bookshelves, an armillary sphere, scrolls and an open book, and a crystal dodecahedron among the stars in the skylight",
    focus: { x: 50, y: 25 },
    x: 51,
    y: 33,
  },
  {
    key: "workshop",
    element: "earth",
    name: "Workshop",
    line: "Craft your offer.",
    to: "/ubb",
    rule: {
      opens: "discover-mission",
      closed: {
        event: "your mission is saved",
        inside: "your offer, built from your top talent",
        key: "village.closed.workshop",
      },
      steps: ["build-business"],
    },
    opened: "The Workshop is open.",
    image: "/game/village/workshop.webp",
    alt: "A workshop under neon-edged arches: a 3D printer, a laser cutter, a large-format printer and a robotic arm, with a luminous crystal dodecahedron floating at the center",
    focus: { x: 50, y: 55 },
    x: 89,
    y: 39,
    side: "left",
  },
  {
    key: "market",
    element: "earth",
    name: "Market",
    line: "Your shop and others'.",
    to: "/game/marketplace",
    rule: {
      opens: "offer-saved",
      closed: {
        event: "your offer is saved",
        inside: "your shop, and the shops of other residents",
        key: "village.closed.market",
      },
      steps: ["first-sale"],
    },
    opened: "Your stall stands in the Market.",
    image: "/game/village/market.webp",
    alt: "A night bazaar under lanterns: stalls draped with textiles, painted ceramics, copper teapots, amethyst and quartz, and a white minaret under a starry sky",
    focus: { x: 55, y: 35 },
    x: 67,
    y: 51,
  },
  {
    key: "town-hall",
    element: "earth",
    name: "Town Hall",
    line: "Build ventures together.",
    // Town Hall v0 (WP-12): src/pages/spaces/CoopSpace.tsx.
    to: "/game/coop",
    rule: {
      // Opens on the J12 victory the player records on the Quest Board (WP-11).
      opens: "first-sale",
      closed: {
        event: "your first sale is recorded",
        inside: "ventures built together, and your voice in the village",
        key: "village.closed.town-hall",
        short: "Opens with your first sale.",
        shortKey: "village.closedShort.town-hall",
      },
    },
    opened: "The Town Hall is open.",
    image: "/game/village/town-hall.webp",
    alt: "The town hall plaza under the Milky Way: a white tower and domes with softly lit arches, rugs leading across a tiled square, and a crystal dodecahedron above",
    focus: { x: 45, y: 15 },
    x: 66,
    y: 29,
    labelDy: -16,
  },
];

/**
 * The Oracle Reading ($37 deeper Top Talent reveal): an item inside the Oracle, closed
 * until the top talent is saved (§14.3, below place level). Done once the deeper view is
 * bought, which the caller reads from its own entitlement (`deeper-access`).
 */
export const ORACLE_READING: PlaceInput = {
  line: "Your deeper reveal.",
  rule: {
    opens: "find-top-talent",
    closed: { event: "your top talent is saved", inside: "how to turn it into income", key: "rail.journey.activation.lockedHint" },
    steps: ["deeper-access"],
  },
};

/** Where every guest's stay begins; signed-out visitors are invited here. */
export const RECEPTION = VILLAGE_PLACES.find((p) => p.key === "reception")!;

/** CSS object-position for a scene: its focal point, or centred. */
export const sceneObjectPosition = (p: VillagePlace) =>
  `${p.focus?.x ?? 50}% ${p.focus?.y ?? 50}%`;

/** A place's element, with its solid and colour. */
export const placeElement = (p: Pick<VillagePlace, "element">): VillageElement => getVillageElement(p.element);

export const getVillagePlace = (key: string | undefined) =>
  VILLAGE_PLACES.find((p) => p.key === key);
