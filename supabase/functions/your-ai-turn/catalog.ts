/**
 * Server copy of the Your AI button catalog (ids, kinds, labels, routes, "when" lines).
 * Source of truth: src/data/yourAiCatalog.ts. Edge functions cannot import from src/, so the
 * entries are mirrored here; src/data/__tests__/yourAiServerCatalog.test.ts fails the build
 * the moment the two drift apart.
 */

export type YourAiButtonKind = "action" | "route" | "practice" | "technology";

export type CatalogEntry = {
  id: string;
  kind: YourAiButtonKind;
  label: string;
  when: string;
  to?: string;
};

export const ACTION_REVEAL = "action:reveal";

export const CATALOG: CatalogEntry[] = [
  {
    id: ACTION_REVEAL,
    kind: "action",
    label: "Reveal my top talent",
    when: "the player has given enough material (you set ready to true) or asks to see the result",
  },
  {
    id: "route:zog-profile",
    kind: "route",
    label: "See my top talent",
    when: "the player already has a saved top talent result and wants to look at it",
    to: "/game/me/zone-of-genius",
  },
  {
    id: "route:mission",
    kind: "route",
    label: "Find my mission",
    when: "the player knows their talent and asks what to do with it, or where they are needed",
    to: "/mission-discovery",
  },
  {
    id: "route:assets",
    kind: "route",
    label: "Map my assets",
    when: "the player wants to see what they already have to build on: skills, network, resources",
    to: "/asset-mapping",
  },
  {
    id: "route:qol",
    kind: "route",
    label: "Map my quality of life",
    when: "the player talks about balance, health, relationships or money and wants a clear picture",
    to: "/game/learn/qol-assessment",
  },
  {
    id: "route:journey",
    kind: "route",
    label: "Open my journey",
    when: "the player asks where they are overall or what the whole path looks like",
    to: "/game/journey",
  },
  {
    id: "route:library",
    kind: "route",
    label: "Open the library",
    when: "the player wants to learn, watch or read before going further",
    to: "/library",
  },
  {
    id: "practice:todays-practice",
    kind: "practice",
    label: "Today's practice",
    when: "the player feels stuck, drained or scattered and needs one small thing to do now",
    to: "/game/learn/today",
  },
  {
    id: "practice:breathwork",
    kind: "practice",
    label: "Breathwork and activations",
    when: "the player is tense, overthinking or asks for a way to settle before answering",
    to: "/library/foundational-videos",
  },
  {
    id: "pst:15-complete-seeing",
    kind: "technology",
    label: "The 27 perspectives",
    when: "the player is curious about the framework behind the reading, or how one situation looks from many sides",
    to: "/27",
  },
  {
    id: "pst:56-self-recognition",
    kind: "technology",
    label: "Recognise yourself from outside",
    when: "the player struggles to see their own pattern and a result they can look at would help",
    to: "/game/me/zone-of-genius",
  },
];
