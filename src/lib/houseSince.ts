import type { TFunction } from "i18next";
import type { MovePlace } from "@/lib/placeState";
import { whatChangedLine } from "@/lib/placeState";
import { tr } from "@/lib/villageCopy";

/**
 * houseSince — «Since you were here: …» on Your House (issue #451, navigation synthesis
 * invariant I5; the Hades house / HoMM «astrologers proclaim» pattern).
 *
 * Pure. Takes what really changed since the last visit and returns at most MAX_LINES lines, in
 * this order: places that opened, artifacts the player made, village events that touch them.
 * Real events only: no input, no line; no lines, no block. Every line carries the place it
 * taps through to. Nothing here counts or ranks (a «people saw you» number is never built).
 *
 * Quest taken is not here yet: a quest a player posts has no table (see `villageFeed.ts`
 * extension points). It joins the `events` group when that data exists.
 */

export const MAX_LINES = 3;

export type SinceArtifactKind = "talent" | "mission" | "uniqueness" | "stall";

export type SinceLine = {
  /** Stable key, e.g. «place», «artifact:talent», «seen», «circle:<id>». */
  id: string;
  /** Where the line taps through to. */
  to: string;
  text: string;
};

export type SinceInput = {
  /** Places open now that were not open at the last visit, in map order. */
  freshPlaces: readonly MovePlace[];
  /** Artifacts created after the last visit, with where each lives. Duplicates are ignored. */
  artifacts: readonly { kind: SinceArtifactKind; to: string }[];
  /** First names of people who tapped «I see you» on this player's deeds, newest first. null = no name. */
  seers: readonly (string | null)[];
  /** The newest circle this player came to (the host marked them came), if any. */
  circle: { id: string; title: string; to: string } | null;
  /** Where the «I see you» taps are read (the Quest Board feed). */
  seenTo: string;
};

/** The artifact order: top talent, mission, uniqueness phrase, stall. */
const ARTIFACT_ORDER: readonly SinceArtifactKind[] = ["talent", "mission", "uniqueness", "stall"];

const ARTIFACT_ENGLISH: Record<SinceArtifactKind, string> = {
  talent: "You found your top talent.",
  mission: "You named your mission.",
  uniqueness: "You put your uniqueness into one phrase.",
  stall: "You added to your stall.",
};

/** «Anna sees you.» / «Anna and Ben see you.» / «Anna, Ben and others see you.» No numbers. */
export function seenLine(seers: readonly (string | null)[], t?: TFunction): string | null {
  if (seers.length === 0) return null;
  const names = [...new Set(seers.filter((n): n is string => !!n && n.trim() !== "").map((n) => n.trim()))];
  const t2 = (key: string, english: string, vars: Record<string, string>) =>
    t
      ? String(t(key, { ...vars, defaultValue: english }))
      : english.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
  if (names.length === 0) return t2("houseSince.seen.anon", "Someone sees you.", {});
  if (names.length === 1) return t2("houseSince.seen.one", "{{a}} sees you.", { a: names[0] });
  if (names.length === 2 || seers.length === 2) {
    return t2("houseSince.seen.two", "{{a}} and {{b}} see you.", { a: names[0], b: names[1] });
  }
  return t2("houseSince.seen.many", "{{a}}, {{b}} and others see you.", { a: names[0], b: names[1] });
}

/** The lines for Your House, in order, at most MAX_LINES. Empty when nothing really changed. */
export function buildHouseSince(input: SinceInput, t?: TFunction): SinceLine[] {
  const lines: SinceLine[] = [];

  // 1. Places that opened: one line for the places, naming the one that speaks (as the village does).
  const places = input.freshPlaces.filter((p) => p.key !== "house");
  const spoken = places.find((p) => p.opened) ?? places[0];
  const placeText = whatChangedLine(places, t);
  if (spoken && placeText) lines.push({ id: "place", to: spoken.to, text: placeText });

  // 2. Artifacts the player made or changed.
  for (const kind of ARTIFACT_ORDER) {
    const hit = input.artifacts.find((a) => a.kind === kind);
    if (hit) {
      lines.push({
        id: `artifact:${kind}`,
        to: hit.to,
        text: tr(t, `houseSince.artifact.${kind}`, ARTIFACT_ENGLISH[kind]),
      });
    }
  }

  // 3. Village events that touch the player.
  const seen = seenLine(input.seers, t);
  if (seen) lines.push({ id: "seen", to: input.seenTo, text: seen });
  if (input.circle) {
    const title = input.circle.title.trim();
    if (title) {
      const text = t
        ? String(t("houseSince.circle", { title, defaultValue: "You came to {{title}}." }))
        : `You came to ${title}.`;
      lines.push({ id: `circle:${input.circle.id}`, to: input.circle.to, text });
    }
  }

  return lines.slice(0, MAX_LINES);
}
