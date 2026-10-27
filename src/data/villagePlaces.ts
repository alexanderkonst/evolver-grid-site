/**
 * The Digital Village: single source for places, copy, routes and map markers.
 * Design: docs/02-strategy/game_of_being_you.md §13.1–§13.4.
 *
 * Every place points at an existing module; nothing here is a new module.
 * `x` / `y` are percentages of the map image (public/game/village/map.webp, 1024×1024),
 * so markers stay on their buildings at any crop. Tune them here.
 */

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

export type VillagePlace = {
  key: VillagePlaceKey;
  name: string;
  line: string;
  /** Module route behind ENTER. */
  to: string;
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

export const VILLAGE_PLACES: VillagePlace[] = [
  {
    key: "reception",
    name: "Reception",
    line: "Welcome, guest. Discover your uniqueness.",
    to: "/zone-of-genius/entry",
    // The scene file is still named gate.webp; kept until a Reception scene is made.
    image: "/game/village/gate.webp",
    alt: "A grand marble stair lined with lanterns and candles rises to a welcoming arched doorway glowing warm gold, a crystal dodecahedron shining above it in the night sky",
    focus: { x: 50, y: 10 },
    x: 9,
    y: 57,
  },
  {
    key: "house",
    name: "Your House",
    line: "Your crystal, mission and save file.",
    to: "/game/me/overview",
    image: "/game/village/house.webp",
    alt: "Inside your house at night: tall white columns hung with string lights, a luminous crystal dodecahedron on an altar of candles, amethyst and quartz, and a singing bowl on the rugs",
    focus: { x: 50, y: 75 },
    x: 90,
    y: 57,
    side: "left",
  },
  {
    key: "quest-board",
    name: "Quest Board",
    line: "Your next quest.",
    to: "/game/journey",
    image: "/game/village/quest-board.webp",
    alt: "A rooftop terrace at dusk with a wooden quest board of pinned notes, lanterns, cushions on rugs around a low table, white domes and the sea beyond",
    focus: { x: 65, y: 30 },
    x: 35,
    y: 37,
  },
  {
    key: "oracle",
    name: "Oracle",
    line: "Ask your AI.",
    to: "/ai-os",
    image: "/game/village/oracle.webp",
    alt: "A still reflecting pool at night, a glowing crystal dodecahedron floating above its mirrored water, neon-lit arches on one side, floating candles and a singing bowl in the foreground",
    focus: { x: 50, y: 60 },
    x: 36,
    y: 53,
  },
  {
    key: "cafe",
    name: "Café",
    line: "Meet people, professionally or simply.",
    to: "/game/meet",
    image: "/game/village/cafe.webp",
    alt: "A café lounge open to the night sea, deep blue sofas and poufs on woven rugs, candles, amethyst geodes, and neon-edged arches framing a string-lit horizon",
    focus: { x: 50, y: 55 },
    x: 16,
    y: 44,
    side: "left",
  },
  {
    key: "coworking",
    name: "Co-working",
    line: "Find partners for the work.",
    to: "/game/collaborate/matches",
    image: "/game/village/coworking.webp",
    alt: "A long arched hall for co-working: wooden desks with brass lamps and laptops, sacred-geometry paintings on the walls, string lights, and a window onto the starry night",
    focus: { x: 50, y: 45 },
    x: 83,
    y: 30,
    side: "left",
  },
  {
    key: "fire-circle",
    name: "Fire Circle",
    line: "Your Mastermind circle.",
    to: "/build/mastermind",
    image: "/game/village/fire-circle.webp",
    alt: "A domed hall with a brass fire bowl at its center, patterned seats in a circle around it, tall white columns, crystals and candles, and a glowing oculus above",
    focus: { x: 50, y: 90 },
    x: 74,
    y: 36,
  },
  {
    key: "academy",
    name: "Academy",
    line: "Grow in what matters most.",
    to: "/game/learn",
    image: "/game/village/academy.webp",
    alt: "A grand library under a dome at night: curved wooden bookshelves, an armillary sphere, scrolls and an open book, and a crystal dodecahedron among the stars in the skylight",
    focus: { x: 50, y: 25 },
    x: 51,
    y: 33,
  },
  {
    key: "workshop",
    name: "Workshop",
    line: "Craft your offer.",
    to: "/ubb",
    image: "/game/village/workshop.webp",
    alt: "A workshop under neon-edged arches: a 3D printer, a laser cutter, a large-format printer and a robotic arm, with a luminous crystal dodecahedron floating at the center",
    focus: { x: 50, y: 55 },
    x: 89,
    y: 39,
    side: "left",
  },
  {
    key: "market",
    name: "Market",
    line: "Your shop and others'.",
    to: "/game/marketplace",
    image: "/game/village/market.webp",
    alt: "A night bazaar under lanterns: stalls draped with textiles, painted ceramics, copper teapots, amethyst and quartz, and a white minaret under a starry sky",
    focus: { x: 55, y: 35 },
    x: 67,
    y: 51,
  },
  {
    key: "town-hall",
    name: "Town Hall",
    line: "Build ventures together.",
    // /game/coop is a legacy redirect (→ /game/build → /ubb) in App.tsx.
    to: "/game/coop",
    image: "/game/village/town-hall.webp",
    alt: "The town hall plaza under the Milky Way: a white tower and domes with softly lit arches, rugs leading across a tiled square, and a crystal dodecahedron above",
    focus: { x: 45, y: 15 },
    x: 66,
    y: 29,
  },
];

/** Where every guest's stay begins; signed-out visitors are invited here. */
export const RECEPTION = VILLAGE_PLACES.find((p) => p.key === "reception")!;

/** CSS object-position for a scene: its focal point, or centred. */
export const sceneObjectPosition = (p: VillagePlace) =>
  `${p.focus?.x ?? 50}% ${p.focus?.y ?? 50}%`;

export const getVillagePlace = (key: string | undefined) =>
  VILLAGE_PLACES.find((p) => p.key === key);
