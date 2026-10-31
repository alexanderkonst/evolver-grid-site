import { describe, expect, it } from "vitest";
import { buildShareCard, pickGift, type ShareCardInput } from "../shareCard";

const t = (key: string) => (key === "shareCard.question" ? "Do you see me this way too?" : key);

const base: ShareCardInput = {
    name: "Ada Lovelace",
    username: "ada",
    uniquenessPhrase: "I make machines dream in poetry",
    tagline: "Poetry for machines",
    topTalent: "✦ Weaving Signal ✦",
    origin: "https://findyourtoptalent.com",
};

describe("buildShareCard", () => {
    it("prefers the uniqueness phrase, then the tagline, then the Top Talent", () => {
        expect(buildShareCard(base, t)).toMatchObject({ gift: "I make machines dream in poetry", giftSource: "uniqueness" });
        expect(buildShareCard({ ...base, uniquenessPhrase: null }, t)).toMatchObject({
            gift: "Poetry for machines",
            giftSource: "tagline",
        });
        expect(buildShareCard({ ...base, uniquenessPhrase: "  ", tagline: "" }, t)).toMatchObject({
            gift: "Weaving Signal",
            giftSource: "topTalent",
        });
    });

    it("trims the gift and strips decorative glyphs from the Top Talent", () => {
        const card = buildShareCard({ ...base, uniquenessPhrase: "  Spoken from the gut  " }, t);
        expect(card?.gift).toBe("Spoken from the gut");
        expect(pickGift({ uniquenessPhrase: null, tagline: null, topTalent: "◆ ❖ Forging ★" })?.gift).toBe("Forging");
    });

    it("returns null without a username", () => {
        expect(buildShareCard({ ...base, username: null }, t)).toBeNull();
        expect(buildShareCard({ ...base, username: "   " }, t)).toBeNull();
        expect(buildShareCard({ ...base, username: "@" }, t)).toBeNull();
    });

    it("returns null without any gift line", () => {
        expect(buildShareCard({ ...base, uniquenessPhrase: null, tagline: null, topTalent: null }, t)).toBeNull();
        // A Top Talent that is only glyphs is no line either.
        expect(buildShareCard({ ...base, uniquenessPhrase: "", tagline: "", topTalent: "✦ ✦" }, t)).toBeNull();
    });

    it("builds the link and the attributed QR link", () => {
        const card = buildShareCard({ ...base, origin: "https://findyourtoptalent.com/" }, t);
        expect(card?.url).toBe("https://findyourtoptalent.com/ada");
        expect(card?.qrUrl).toBe("https://findyourtoptalent.com/ada?utm_source=qr&utm_medium=share_card");
    });

    it("writes the share text as «name: gift», question, link with blank lines between", () => {
        expect(buildShareCard(base, t)?.shareText).toBe(
            "Ada Lovelace: I make machines dream in poetry\n\nDo you see me this way too?\n\nhttps://findyourtoptalent.com/ada",
        );
    });

    it("starts with the gift alone when the player has no name", () => {
        for (const name of [null, undefined, "", "  "]) {
            expect(buildShareCard({ ...base, name }, t)?.shareText).toBe(
                "I make machines dream in poetry\n\nDo you see me this way too?\n\nhttps://findyourtoptalent.com/ada",
            );
        }
    });

    it("never carries level, QoL, metrics, talents list or prices", () => {
        const card = buildShareCard(base, t);
        expect(Object.keys(card ?? {}).sort()).toEqual(["gift", "giftSource", "name", "qrUrl", "shareText", "url"]);
        expect(JSON.stringify(card)).not.toMatch(/level|qol|metric|price|talents/i);
    });
});
