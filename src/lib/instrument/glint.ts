/**
 * Glints: "since you were here" on the instrument (docs/specs/navigation-instrument/architecture.md §7
 * phase 6, sow.md WP6, #451).
 *
 * Changes are written in Your House, the bench. The instrument keeps only a mark: one flag on the body
 * whose face changed, cleared when that face is opened. A glint carries no text, so the instrument can
 * never turn into a second feed (architecture §7: "Never a second feed"); the lines live in Your House.
 *
 * Pure functions, no React. The save is localStorage per owner (`readGlints` / `writeGlints`).
 */
import type { TFunction } from "i18next";
import type { ElementKey } from "@/data/villagePlaces";
import { VILLAGE_ELEMENTS } from "@/data/villagePlaces";
import { placeState, whatChangedLine, type MovePlace, type PlaceSave } from "@/lib/placeState";

/** Bodies with a glint. Only `true` entries exist. */
export type Glints = Partial<Record<ElementKey, true>>;

export const emptyGlints = (): Glints => ({});

/** Anything stored, reduced to a valid `Glints`: unknown keys and non-true values are dropped. */
export const parseGlints = (raw: unknown): Glints => {
  const out: Glints = {};
  if (!raw || typeof raw !== "object") return out;
  for (const { key } of VILLAGE_ELEMENTS) {
    if ((raw as Record<string, unknown>)[key] === true) out[key] = true;
  }
  return out;
};

export const hasGlint = (glints: Glints, element: ElementKey): boolean => glints[element] === true;

/** Mark a body. Returns the same object when nothing changes. */
export const setGlint = (glints: Glints, element: ElementKey): Glints => (glints[element] ? glints : { ...glints, [element]: true });

/** Clear a body's glint (its face was opened). Returns the same object when there was none. */
export const clearGlint = (glints: Glints, element: ElementKey): Glints => {
  if (!glints[element]) return glints;
  const { [element]: _cleared, ...rest } = glints;
  return rest;
};

/** Union: a glint on either side stays. */
export const mergeGlints = (a: Glints, b: Glints): Glints => parseGlints({ ...a, ...b });

// ---------------------------------------------------------------------------------------------
// Changes (written in Your House)
// ---------------------------------------------------------------------------------------------

/** Your House lists at most three lines (#451). */
export const MAX_HOUSE_CHANGES = 3;

/** One place that opened since the last visit, as Your House lists it. */
export type HouseChange = { key: string; element: ElementKey; to: string; line: string };

/**
 * The places open now that were not open at the last visit, in map order, each with its own line and
 * route. Real events only: an empty list when nothing is new. `max` caps the list (the lines); the
 * glints are made from the uncapped list so no changed body is missed.
 */
export const sinceYouWereHere = <P extends MovePlace & { element: ElementKey; to: string }>(
  places: readonly P[],
  seenOpen: ReadonlySet<string>,
  save: PlaceSave,
  t?: TFunction,
  max: number = MAX_HOUSE_CHANGES,
): HouseChange[] =>
  places
    .filter((p) => placeState(p, save) !== "closed" && !seenOpen.has(p.key))
    .slice(0, max)
    .map((p) => ({ key: p.key, element: p.element, to: p.to, line: whatChangedLine([p], t) ?? "" }))
    .filter((c) => c.line !== "");

/**
 * The glints these changes write: one per body whose face changed. Air is skipped: its face is Your AI,
 * which a place opening does not change.
 */
export const glintsFromChanges = (changes: readonly Pick<HouseChange, "element">[]): Glints =>
  changes.reduce<Glints>((g, c) => (c.element === "air" ? g : setGlint(g, c.element)), emptyGlints());

// ---------------------------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------------------------

/** localStorage key, per owner (signed-out players share `guest`). */
export const GLINT_STORAGE_KEY = "fytt:instrument-glints";
export const glintStorageKey = (ownerId: string | null): string => `${GLINT_STORAGE_KEY}:${ownerId ?? "guest"}`;

/** The places the House has already shown as open, per owner: the "before" the next visit compares to. */
export const HOUSE_SEEN_OPEN_KEY = "fytt:house-seen-open";
export const houseSeenOpenKey = (ownerId: string): string => `${HOUSE_SEEN_OPEN_KEY}:${ownerId}`;

type StorageRead = Pick<Storage, "getItem">;
type StorageWrite = Pick<Storage, "setItem">;

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const readGlints = (ownerId: string | null, storage: StorageRead | null = safeStorage()): Glints => {
  try {
    const raw = storage?.getItem(glintStorageKey(ownerId));
    return raw ? parseGlints(JSON.parse(raw)) : emptyGlints();
  } catch {
    return emptyGlints();
  }
};

export const writeGlints = (ownerId: string | null, glints: Glints, storage: StorageWrite | null = safeStorage()): void => {
  try {
    storage?.setItem(glintStorageKey(ownerId), JSON.stringify(parseGlints(glints)));
  } catch {
    // Private mode or a full disk: the glint is cosmetic. Non-blocking.
  }
};

/** The open places last shown in the House, or null when this player has no memory yet. */
export const readHouseSeenOpen = (ownerId: string, storage: StorageRead | null = safeStorage()): string[] | null => {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(houseSeenOpenKey(ownerId)) ?? "null");
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : null;
  } catch {
    return null;
  }
};

export const writeHouseSeenOpen = (ownerId: string, keys: readonly string[], storage: StorageWrite | null = safeStorage()): void => {
  try {
    storage?.setItem(houseSeenOpenKey(ownerId), JSON.stringify([...new Set(keys)]));
  } catch {
    // Cosmetic: ignore.
  }
};

/** Same-page signal: the House writes glints and the instrument (same document) must hear it. */
export const GLINT_EVENT = "fytt:instrument-glints-changed";
