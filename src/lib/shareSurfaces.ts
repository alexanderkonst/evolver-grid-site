import { buildShareCard, type ShareCard, type ShareCardT } from "./shareCard";
import { formatBullseyeLine } from "@/modules/zone-of-genius/bullseye";
import { flipToFirstPerson, flipToSecondPerson } from "./zogProfileVoice";

/**
 * shareSurfaces: how the older share surfaces take their text and link from the one builder
 * (Share card, slice 3). Design: docs/02-strategy/game_of_being_you.md §14.12a,
 * docs/templates/module-form.md §11.
 *
 * Pure. The copy and the link come from `buildShareCard`; nothing here writes its own.
 * No level, QoL, metrics or prices reach a share text: the builder never receives them.
 */

export type ShareOwner = {
    name?: string | null;
    username?: string | null;
};

/**
 * The player's own card for a reveal whose gift line is the Top Talent name (the same input
 * RevelatoryHero gives the builder). Null for a guest, a player without a link name, or an
 * empty title: those keep the older share.
 */
export const buildOwnRevealCard = (
    owner: ShareOwner | null | undefined,
    topTalent: string | null | undefined,
    origin: string,
    t?: ShareCardT,
): ShareCard | null =>
    buildShareCard(
        {
            name: owner?.name,
            username: owner?.username,
            uniquenessPhrase: null,
            tagline: null,
            topTalent,
            origin,
        },
        t,
    );

/** The existing share text with the player's own link added after it; unchanged without one. */
export const appendOwnLink = (text: string, card: ShareCard | null): string =>
    card ? `${text}\n\n${card.url}` : text;

export type RevealShare = {
    /** Share sheet title. */
    title: string;
    /** Share sheet text. For the player's own card it already carries the link. */
    text: string;
    /** Separate share sheet url; null when the text already carries the link. */
    url: string | null;
    /** What «copy» puts on the clipboard when there is no share sheet. */
    copyText: string;
    /** True when text and link come from the player's own card. */
    own: boolean;
};

/**
 * Step 4 «Share this reveal».
 * A signed-in player with a link name shares the builder's text and their own page.
 * A guest shares a localized invite to the assessment.
 */
export const buildRevealShare = (params: {
    owner: ShareOwner | null | undefined;
    topTalent: string;
    /** Origin for the player's own link, e.g. `window.location.origin`. */
    origin: string;
    /** Locale-scoped site URL of the assessment page, for the guest invite. */
    inviteUrl: string;
    t: ShareCardT;
}): RevealShare => {
    const { owner, topTalent, origin, inviteUrl, t } = params;
    const title = t("shareCard.revealTitle");
    const card = buildOwnRevealCard(owner, topTalent, origin, t);
    if (card) {
        return { title, text: card.shareText, url: null, copyText: card.shareText, own: true };
    }
    return {
        title,
        text: t("shareCard.revealText", { title: topTalent }),
        url: inviteUrl,
        copyText: inviteUrl,
        own: false,
    };
};

/**
 * Share text for the saved Top Talent page (ZoneOfGeniusOverview hero CardActions).
 * Same shape as before: intro, archetype, bullseye, three talents, core pattern, closing,
 * site name. A player with a link name gets their own link from the builder appended;
 * everyone else gets the text unchanged.
 */
export const buildOverviewShareText = (params: {
    archetype: string;
    bullseye: string | undefined;
    corePattern: string | undefined;
    topThreeTalents: string[] | undefined;
    ownCard: ShareCard | null;
    t: ShareCardT;
}): string => {
    const { archetype, bullseye, corePattern, topThreeTalents, ownCard, t } = params;
    let text = `${t("shareCard.overviewIntro")}\n\n`;
    // Blank line between the archetype name and the one-sentence bullseye so the two
    // don't run together and read as one confused statement.
    text += `${archetype}\n\n`;
    if (bullseye) text += `${formatBullseyeLine(bullseye)}\n\n`;
    // The compact three talents on one bullet-separated line keep it scannable in previews.
    if (topThreeTalents && topThreeTalents.length > 0) {
        text += `${t("revelatoryHero.shareTalentsLine", { talents: topThreeTalents.join(" · ") })}\n\n`;
    }
    // A FIRST-PERSON post the person makes about themselves: the core pattern reads
    // «I recognize…», not the on-page second-person «You recognize…».
    if (corePattern) text += `${flipToFirstPerson(flipToSecondPerson(corePattern))}\n\n`;
    text += `${t("revelatoryHero.shareClosing")}\n\n→ FindYourTopTalent.Com`;
    return appendOwnLink(text, ownCard);
};
