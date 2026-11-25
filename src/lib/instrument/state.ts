/**
 * The navigation instrument's state machine and its `litSeen` record
 * (docs/specs/navigation-instrument/architecture.md §4; GoBY §25.10).
 *
 * Pure functions only: no React, no network. The glyph and the shell read this; it stores nothing
 * about the world (the world's truth is `litQuarters` and `placeState`). The one thing it does keep is
 * `litSeen`: which bodies the player has already been shown lit, so the body-lit ritual (WP2) plays once
 * per body. The save is the player's `game_profiles.first_time_actions` (see `litSeenStore.ts`), with
 * localStorage as the signed-out fallback and as a cache.
 */
import { VILLAGE_ELEMENTS, type ElementKey } from "@/data/villagePlaces";

/** hidden: no profile yet · closed: the glyph in the corner · open: bodies in an arc · face: one body's lens. */
export type InstrumentState = "hidden" | "closed" | "open" | "face";

export type InstrumentModel = {
  state: InstrumentState;
  /** The body turned forward; non-null only in the `face` state. */
  face: ElementKey | null;
};

export type InstrumentEvent =
  /** The player has (true) or has not (false) a profile: the visibility gate, owned by the shell. */
  | { type: "gate"; enabled: boolean }
  | { type: "open" }
  /** Esc, a tap outside, the close button: always lands on `closed`. */
  | { type: "close" }
  /** The same gesture again (glyph, Enter, `I`, swipe): opens from `closed`, closes from `open` and `face`. */
  | { type: "toggle" }
  | { type: "face"; element: ElementKey }
  /** From a face back to the arc. */
  | { type: "back" };

export const instrumentModel = (enabled: boolean): InstrumentModel => ({ state: enabled ? "closed" : "hidden", face: null });

const CLOSED: InstrumentModel = { state: "closed", face: null };
const HIDDEN: InstrumentModel = { state: "hidden", face: null };
const OPEN: InstrumentModel = { state: "open", face: null };

/**
 * One transition. Anything that is not a transition from the current state is a no-op (the same
 * model object comes back), so a stray key or a double tap can never put the instrument in a state
 * the player did not ask for.
 */
export const instrumentReduce = (model: InstrumentModel, event: InstrumentEvent): InstrumentModel => {
  if (event.type === "gate") {
    if (!event.enabled) return model.state === "hidden" ? model : HIDDEN;
    return model.state === "hidden" ? CLOSED : model;
  }
  switch (model.state) {
    case "hidden":
      return model;
    case "closed":
      return event.type === "open" || event.type === "toggle" ? OPEN : model;
    case "open":
      if (event.type === "close" || event.type === "toggle") return CLOSED;
      if (event.type === "face") return { state: "face", face: event.element };
      return model;
    case "face":
      if (event.type === "close" || event.type === "toggle") return CLOSED;
      if (event.type === "back") return OPEN;
      if (event.type === "face") return event.element === model.face ? model : { state: "face", face: event.element };
      return model;
  }
};

/** True while the world is under the instrument (open or a face). */
export const isRaised = (model: InstrumentModel): boolean => model.state === "open" || model.state === "face";

// ---------------------------------------------------------------------------------------------
// The gate (who carries the instrument)
// ---------------------------------------------------------------------------------------------

/** The existing AI OS latch the shell already reads (`GameShellV2`): set once the player has visited the AI OS. */
export const AI_OS_VISITED_KEY = "fytt:ai-os-visited";

export const readAiOsVisited = (storage: StorageRead | null = safeStorage()): boolean => {
  try {
    return storage?.getItem(AI_OS_VISITED_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * The visibility rule #458 set, unchanged: top talent, mission and assets all done (T+M+A), or the AI OS
 * was ever visited. The shell computes the same rule from its journey probes; the village map, which has
 * no shell, reads it from the character sheet.
 */
export const instrumentGate = ({ ever, topTalent, mission, assets }: { ever: boolean; topTalent: boolean; mission: boolean; assets: boolean }): boolean =>
  ever || (topTalent && mission && assets);

// ---------------------------------------------------------------------------------------------
// litSeen
// ---------------------------------------------------------------------------------------------

/** Bodies the player has been shown lit. Only `true` entries exist. */
export type LitSeen = Partial<Record<ElementKey, true>>;

export const emptyLitSeen = (): LitSeen => ({});

/** Prefix of the keys in `game_profiles.first_time_actions` (a flat record of booleans): `instrument_lit_fire`. */
export const LIT_SEEN_ACTION_PREFIX = "instrument_lit_";
export const litSeenActionKey = (element: ElementKey): string => `${LIT_SEEN_ACTION_PREFIX}${element}`;

/** localStorage key, per owner (signed-out players share `guest`). */
export const LIT_SEEN_STORAGE_KEY = "fytt:instrument-lit-seen";
export const litSeenStorageKey = (ownerId: string | null): string => `${LIT_SEEN_STORAGE_KEY}:${ownerId ?? "guest"}`;

/** Anything stored or fetched, reduced to a valid `LitSeen`: unknown keys and non-true values are dropped. */
export const parseLitSeen = (raw: unknown): LitSeen => {
  const out: LitSeen = {};
  if (!raw || typeof raw !== "object") return out;
  for (const { key } of VILLAGE_ELEMENTS) {
    if ((raw as Record<string, unknown>)[key] === true) out[key] = true;
  }
  return out;
};

/** Read from the `first_time_actions` record (`instrument_lit_<element>: true`). */
export const litSeenFromActions = (actions: unknown): LitSeen => {
  const out: LitSeen = {};
  if (!actions || typeof actions !== "object") return out;
  for (const { key } of VILLAGE_ELEMENTS) {
    if ((actions as Record<string, unknown>)[litSeenActionKey(key)] === true) out[key] = true;
  }
  return out;
};

/** The `first_time_actions` entries for a `LitSeen`, to merge into the existing record. */
export const litSeenToActions = (seen: LitSeen): Record<string, boolean> =>
  Object.fromEntries(VILLAGE_ELEMENTS.filter(({ key }) => seen[key]).map(({ key }) => [litSeenActionKey(key), true]));

/** Union: a body seen on either side stays seen. */
export const mergeLitSeen = (a: LitSeen, b: LitSeen): LitSeen => parseLitSeen({ ...a, ...b });

export const hasSeen = (seen: LitSeen, element: ElementKey): boolean => seen[element] === true;

/** Record a body as seen. Returns the same object when nothing changes. */
export const markLitSeen = (seen: LitSeen, element: ElementKey): LitSeen => (seen[element] ? seen : { ...seen, [element]: true });

/**
 * Bodies that are lit now and not yet seen lit, in village order: the queue the ritual (WP2) plays from.
 * Air is excluded: it is lit with the first reveal and has no ritual of its own.
 */
export const unseenLit = (lit: Record<ElementKey, boolean>, seen: LitSeen): ElementKey[] =>
  VILLAGE_ELEMENTS.map((e) => e.key).filter((k) => k !== "air" && lit[k] && !seen[k]);

type StorageRead = Pick<Storage, "getItem">;
type StorageWrite = Pick<Storage, "setItem">;

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const readLitSeen = (ownerId: string | null, storage: StorageRead | null = safeStorage()): LitSeen => {
  try {
    const raw = storage?.getItem(litSeenStorageKey(ownerId));
    return raw ? parseLitSeen(JSON.parse(raw)) : emptyLitSeen();
  } catch {
    return emptyLitSeen();
  }
};

export const writeLitSeen = (ownerId: string | null, seen: LitSeen, storage: StorageWrite | null = safeStorage()): void => {
  try {
    storage?.setItem(litSeenStorageKey(ownerId), JSON.stringify(parseLitSeen(seen)));
  } catch {
    // Private mode or a full disk: the ritual may replay next visit. Non-blocking.
  }
};
