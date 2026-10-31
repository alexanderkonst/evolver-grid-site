import i18next from "i18next";

/**
 * shareCard: the one builder behind every share surface (Share card, slice 1).
 * Design: docs/02-strategy/game_of_being_you.md §14.12a, docs/templates/module-form.md §11.
 *
 * Pure: takes what the Character Sheet already holds, returns what the card shows.
 * The input and the output carry no level, QoL, metrics, talents list or prices, by
 * construction: the card cannot leak what it never receives.
 */

export type ShareCardGiftSource = "uniqueness" | "tagline" | "topTalent";

export type ShareCardInput = {
    name: string | null | undefined;
    username: string | null | undefined;
    /** J6: the player's uniqueness phrase. */
    uniquenessPhrase: string | null | undefined;
    /** J7: the player's tagline. */
    tagline: string | null | undefined;
    /** J1: the Top Talent archetype name. */
    topTalent: string | null | undefined;
    /** Site origin, e.g. `https://findyourtoptalent.com`. */
    origin: string;
};

export type ShareCard = {
    name: string;
    gift: string;
    giftSource: ShareCardGiftSource | null;
    /** `${origin}/${username}` */
    url: string;
    /** The QR carries this one: same page, attributed. */
    qrUrl: string;
    /** gift + blank line + the question + blank line + url */
    shareText: string;
};

/** The two-argument slice of i18next's `t` the builder needs. */
export type ShareCardT = (key: string, options?: Record<string, unknown>) => string;

export const SHARE_CARD_QR_PARAMS = "utm_source=qr&utm_medium=share_card";

/** Decorative glyphs some AI generators wrap archetype names in (same set as RevelatoryHero). */
const DECORATIVE_GLYPHS = /[✦✧◆◇❖✱★☆]/g;

const clean = (value: string | null | undefined): string => (value ?? "").trim();

const cleanTalent = (value: string | null | undefined): string => clean((value ?? "").replace(DECORATIVE_GLYPHS, ""));

/**
 * The gift line, in the player's own words: uniqueness phrase, else tagline, else Top Talent.
 * Never generated filler: with none of the three there is no line.
 */
export const pickGift = (
    input: Pick<ShareCardInput, "uniquenessPhrase" | "tagline" | "topTalent">,
): { gift: string; giftSource: ShareCardGiftSource } | null => {
    const uniqueness = clean(input.uniquenessPhrase);
    if (uniqueness) return { gift: uniqueness, giftSource: "uniqueness" };
    const tagline = clean(input.tagline);
    if (tagline) return { gift: tagline, giftSource: "tagline" };
    const topTalent = cleanTalent(input.topTalent);
    if (topTalent) return { gift: topTalent, giftSource: "topTalent" };
    return null;
};

/** A link name is a path segment; a leading «@» is a habit, not part of it. */
const cleanUsername = (value: string | null | undefined): string => clean(value).replace(/^@+/, "");

export const buildShareCard = (input: ShareCardInput, t?: ShareCardT): ShareCard | null => {
    const username = cleanUsername(input.username);
    if (!username) return null;
    const picked = pickGift(input);
    if (!picked) return null;

    const translate: ShareCardT = t ?? ((key, options) => i18next.t(key, options) as string);
    const url = `${input.origin.replace(/\/+$/, "")}/${encodeURIComponent(username)}`;

    return {
        name: clean(input.name),
        gift: picked.gift,
        giftSource: picked.giftSource,
        url,
        qrUrl: `${url}?${SHARE_CARD_QR_PARAMS}`,
        shareText: `${picked.gift}\n\n${translate("shareCard.question")}\n\n${url}`,
    };
};
