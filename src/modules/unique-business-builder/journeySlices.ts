/**
 * The two Journey slices inside the UBB (WP-9).
 * Design: docs/02-strategy/game_of_being_you.md §14.2 (J6, J7), §14.4, §14.8 row WP-9.
 *
 * J6 «Your uniqueness in one phrase» is the `uniqueness` artifact; J7 «The tagline of your
 * unique business» is the `promise` artifact, its «From A to B» sentence (there is no
 * artifact called tagline yet; `useCharacterSheet` reads `promise` as the offer for the same
 * reason). Every other UBB artifact keeps the screen it has.
 *
 * Pure data and functions: the screen that uses them is `JourneySlice.tsx`.
 */

import type { SliceStepId } from "@/data/journeyModules";
import type { ArtifactKey } from "./types";

/** Artifact → the Journey slice it completes. */
export const SLICE_OF_ARTIFACT: Partial<Record<ArtifactKey, SliceStepId>> = {
  uniqueness: "uniqueness-phrase",
  promise: "tagline",
};

/** The field of the artifact's content that holds the player's phrase (ubb-prompts.ts). */
const PHRASE_FIELD: Partial<Record<ArtifactKey, string>> = {
  uniqueness: "sentence",
  promise: "promise_sentence",
};

/** The phrase the Outro shows as the badge, in the player's words; null if the content has none. */
export const slicePhrase = (artifactKey: ArtifactKey, content: unknown): string | null => {
  const field = PHRASE_FIELD[artifactKey];
  if (!field || typeof content !== "object" || content === null) return null;
  const value = (content as Record<string, unknown>)[field];
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

/**
 * Where a slice is: `intro` (nothing made yet), `screen` (the existing UBB screen), `outro`
 * (the player has just locked the artifact).
 */
export type SlicePhase = "intro" | "screen" | "outro";

/**
 * A player with no artifact yet meets the Intro. One who already has one is editing it:
 * straight to the screen, as before.
 */
export const firstSlicePhase = (hasArtifact: boolean): SlicePhase => (hasArtifact ? "screen" : "intro");

/**
 * The Outro follows the lock the player makes here: the artifact was seen unlocked in this
 * visit (`sawUnlocked`) and now is locked. Locked on arrival, it is not a new victory.
 */
export const lockedHere = (phase: SlicePhase | null, sawUnlocked: boolean, isLocked: boolean): boolean =>
  phase === "screen" && sawUnlocked && isLocked;
