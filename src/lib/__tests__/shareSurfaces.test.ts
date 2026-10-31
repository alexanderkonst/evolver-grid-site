import { describe, expect, it } from "vitest";
import { buildShareCard } from "../shareCard";
import { appendOwnLink, buildOverviewShareText, buildOwnRevealCard, buildRevealShare } from "../shareSurfaces";

const ORIGIN = "https://findyourtoptalent.com";
const INVITE = `${ORIGIN}/zone-of-genius`;

const strings: Record<string, string> = {
    "shareCard.question": "Do you see me this way too?",
    "shareCard.revealTitle": "My Top Talent",
    "shareCard.revealText": "I just discovered my Top Talent: {{title}}.",
    "shareCard.overviewIntro": "This is how I naturally create value:",
    "revelatoryHero.shareTalentsLine": "My three talents: {{talents}}.",
    "revelatoryHero.shareClosing": "Curious if you see me in this description.",
};

const t = (key: string, options?: Record<string, unknown>) =>
    (strings[key] ?? key).replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(options?.[name] ?? ""));

const owner = { name: "Ada Lovelace", username: "ada" };
const TITLE = "Weaving Signal";

describe("Step 4 «Share this reveal»", () => {
    it("a player with a username shares the builder's text and their own page", () => {
        const share = buildRevealShare({ owner, topTalent: TITLE, origin: ORIGIN, inviteUrl: INVITE, t });
        const card = buildShareCard(
            { name: owner.name, username: owner.username, uniquenessPhrase: null, tagline: null, topTalent: TITLE, origin: ORIGIN },
            t,
        );

        expect(card).not.toBeNull();
        expect(share.own).toBe(true);
        expect(share.text).toBe(card!.shareText);
        expect(share.copyText).toBe(card!.shareText);
        // The text carries the link already; no separate url to duplicate it.
        expect(share.url).toBeNull();
        expect(share.text.endsWith(`${ORIGIN}/ada`)).toBe(true);
        expect(share.text).not.toContain("/zone-of-genius");
    });

    it("a guest keeps a localized invite to /zone-of-genius", () => {
        const share = buildRevealShare({ owner: null, topTalent: TITLE, origin: ORIGIN, inviteUrl: INVITE, t });
        expect(share).toEqual({
            title: "My Top Talent",
            text: `I just discovered my Top Talent: ${TITLE}.`,
            url: INVITE,
            copyText: INVITE,
            own: false,
        });
    });

    it("a signed-in player without a username keeps the invite", () => {
        for (const username of [null, undefined, "", "  ", "@"]) {
            const share = buildRevealShare({
                owner: { name: "Ada", username },
                topTalent: TITLE,
                origin: ORIGIN,
                inviteUrl: INVITE,
                t,
            });
            expect(share.own).toBe(false);
            expect(share.url).toBe(INVITE);
        }
    });

    it("uses the localized strings it is given", () => {
        const es = (key: string, options?: Record<string, unknown>) =>
            key === "shareCard.revealText"
                ? `Acabo de descubrir mi Talento Principal: ${String(options?.title)}.`
                : key === "shareCard.revealTitle"
                  ? "Mi Talento Principal"
                  : key;
        const share = buildRevealShare({ owner: null, topTalent: TITLE, origin: ORIGIN, inviteUrl: INVITE, t: es });
        expect(share.title).toBe("Mi Talento Principal");
        expect(share.text).toBe(`Acabo de descubrir mi Talento Principal: ${TITLE}.`);
    });
});

describe("Overview CardActions share text", () => {
    const params = {
        archetype: TITLE,
        bullseye: "weave signal from noise",
        corePattern: "You recognize patterns early.",
        topThreeTalents: ["Naming patterns", "Weaving teams", "Framing choices"],
        t,
    };

    it("appends the builder's link for a player with a username", () => {
        const ownCard = buildOwnRevealCard(owner, TITLE, ORIGIN, t);
        const withLink = buildOverviewShareText({ ...params, ownCard });
        const without = buildOverviewShareText({ ...params, ownCard: null });

        expect(ownCard?.url).toBe(`${ORIGIN}/ada`);
        expect(withLink).toBe(`${without}\n\n${ownCard!.url}`);
        expect(withLink.endsWith("/ada")).toBe(true);
    });

    it("keeps the existing text shape without a username", () => {
        const text = buildOverviewShareText({ ...params, ownCard: buildOwnRevealCard({ username: null }, TITLE, ORIGIN, t) });
        expect(text).not.toContain(ORIGIN);
        expect(text.startsWith(`This is how I naturally create value:\n\n${TITLE}\n\n`)).toBe(true);
        expect(text).toContain("My three talents: Naming patterns · Weaving teams · Framing choices.");
        expect(text.endsWith("Curious if you see me in this description.\n\n→ FindYourTopTalent.Com")).toBe(true);
    });

    it("appendOwnLink leaves the text alone without a card", () => {
        expect(appendOwnLink("text", null)).toBe("text");
    });
});

describe("what a share text may carry", () => {
    it("never carries a level, however the player is described", () => {
        const levelled = { ...owner, level: 12, xp_total: 1200 } as typeof owner;
        const share = buildRevealShare({ owner: levelled, topTalent: TITLE, origin: ORIGIN, inviteUrl: INVITE, t });
        const overview = buildOverviewShareText({
            archetype: TITLE,
            bullseye: undefined,
            corePattern: undefined,
            topThreeTalents: undefined,
            ownCard: buildOwnRevealCard(levelled, TITLE, ORIGIN, t),
            t,
        });
        for (const text of [share.text, overview]) {
            expect(text).not.toMatch(/\blevel\b|\blvl\b|\bxp\b/i);
            expect(text).not.toContain("12");
        }
    });
});
