/**
 * myStall — which parts of the player's own stall exist yet (WP-12).
 * Design: docs/02-strategy/game_of_being_you.md §14.12.
 *
 * Pure: the component draws what this returns. Every part is read from the Character Sheet;
 * nothing is typed twice and nothing is stored. A part is present only when its data is.
 */

/** The part of `useCharacterSheet` the stall reads. */
export type StallSource = {
    topTalent?: string | null;
    missionTitle?: string | null;
    assets?: { count: number; top: { id: string; title: string }[] };
    /** The player's uniqueness phrase (J6); null until saved. */
    uniquenessPhrase?: string | null;
    /** The player's tagline (J7); null until saved. */
    tagline?: string | null;
    /** An offer / tagline artifact is saved: the Market opens (§14.3). */
    offerSaved?: boolean;
    /** `journey_victories.step_id` of every recorded victory. */
    victories?: readonly string[];
};

export type StallPart = "post" | "banner" | "shelves" | "name" | "signboard" | "lamp";

export type StallParts = {
    /** Present parts, in the order they are drawn. */
    present: StallPart[];
    post: string | null;
    banner: string | null;
    /** Up to three asset titles. */
    shelves: string[];
    name: string | null;
    signboard: string | null;
    /** The first sale is recorded: the lamp is lit. */
    lampLit: boolean;
    /** The tagline step is saved: the stall is open in the Market. */
    open: boolean;
};

export const STALL_SHELF_MAX = 3;

const text = (value: string | null | undefined): string | null => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

export const stallParts = (sheet: StallSource): StallParts => {
    const post = text(sheet.topTalent);
    const banner = text(sheet.missionTitle);
    const shelves = (sheet.assets?.top ?? [])
        .map((a) => text(a.title))
        .filter((title): title is string => title !== null)
        .slice(0, STALL_SHELF_MAX);
    const name = text(sheet.uniquenessPhrase);
    const signboard = text(sheet.tagline);
    const lampLit = sheet.victories?.includes("first-sale") === true;

    const present: StallPart[] = [];
    if (post) present.push("post");
    if (banner) present.push("banner");
    if (shelves.length > 0) present.push("shelves");
    if (name) present.push("name");
    if (signboard) present.push("signboard");
    if (lampLit) present.push("lamp");

    return { present, post, banner, shelves, name, signboard, lampLit, open: sheet.offerSaved === true };
};
