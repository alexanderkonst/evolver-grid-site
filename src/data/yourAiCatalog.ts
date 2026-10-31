/**
 * Your AI button catalog (ai-familiar_tracker.md §20.2 c, §20.4 step 1).
 *
 * The model proposes; this fixed catalog executes. Your AI may only answer with ids from
 * this list. Every id maps to something that already exists in the app: a route, a practice,
 * or the nearest in-app doorway of a Phase Shift Library technology. Unknown ids are dropped
 * by `validateButtons`. Labels are the catalog's, never the model's.
 *
 * Add an entry here only after its route exists; `src/data/__tests__/yourAiCatalog.test.ts`
 * checks every `to` against the routes declared in `src/App.tsx`.
 */

export type YourAiButtonKind = "action" | "route" | "practice" | "technology";

export type YourAiCatalogEntry = {
  id: string;
  kind: YourAiButtonKind;
  /** Button label shown to the player (English). */
  label: string;
  /** One line for the model: when this is the right next move. Never shown to the player. */
  when: string;
  /** In-app path. Absent for `action` entries, which the host surface handles itself. */
  to?: string;
};

/** Host-handled action: run the top talent reveal from the conversation so far. */
export const ACTION_REVEAL = "action:reveal";

export const YOUR_AI_CATALOG: YourAiCatalogEntry[] = [
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

const BY_ID: Record<string, YourAiCatalogEntry> = Object.fromEntries(YOUR_AI_CATALOG.map((e) => [e.id, e]));

export const findCatalogEntry = (id: string): YourAiCatalogEntry | undefined => BY_ID[id];

/** A validated button, ready to render. */
export type YourAiButton = { id: string; kind: YourAiButtonKind; label: string; to?: string };

/** Primary + two secondary. */
export const MAX_BUTTONS = 3;

/**
 * Keep only buttons the catalog knows. Accepts ids as strings or `{id}` objects (the model
 * is told to send ids, but tolerated either way). Drops unknown ids and duplicates, keeps the
 * model's order (first = recommended next move) and caps at MAX_BUTTONS.
 */
export const validateButtons = (raw: unknown, allowedIds?: ReadonlySet<string>): YourAiButton[] => {
  if (!Array.isArray(raw)) return [];
  const out: YourAiButton[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const id = typeof item === "string" ? item : item && typeof item === "object" ? (item as { id?: unknown }).id : undefined;
    if (typeof id !== "string") continue;
    const key = id.trim();
    if (seen.has(key)) continue;
    const entry = BY_ID[key];
    if (!entry) continue;
    if (allowedIds && !allowedIds.has(key)) continue;
    seen.add(key);
    out.push({ id: entry.id, kind: entry.kind, label: entry.label, to: entry.to });
    if (out.length >= MAX_BUTTONS) break;
  }
  return out;
};

/** The catalog as the model sees it (ids and when to use them; labels are ours). */
export const catalogForPrompt = (): string =>
  YOUR_AI_CATALOG.map((e) => `- ${e.id}: use when ${e.when}`).join("\n");
