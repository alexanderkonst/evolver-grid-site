import { describe, expect, it } from "vitest";
import en from "@/locales/en/common.json";
import { stallParts, type StallSource } from "../myStall";

const empty: StallSource = {
    topTalent: null,
    missionTitle: null,
    assets: { count: 0, top: [] },
    uniquenessPhrase: null,
    tagline: null,
    offerSaved: false,
    victories: [],
};

const assets = (...titles: string[]) => ({
    count: titles.length,
    top: titles.map((title, i) => ({ id: `a${i}`, title })),
});

describe("stallParts", () => {
    it("an empty sheet has no parts, an unlit lamp and a stall that is not open", () => {
        const parts = stallParts(empty);
        expect(parts.present).toEqual([]);
        expect(parts.post).toBeNull();
        expect(parts.banner).toBeNull();
        expect(parts.shelves).toEqual([]);
        expect(parts.name).toBeNull();
        expect(parts.signboard).toBeNull();
        expect(parts.lampLit).toBe(false);
        expect(parts.open).toBe(false);
    });

    it("tolerates a sheet with every field missing", () => {
        expect(stallParts({}).present).toEqual([]);
    });

    it("talent + mission + assets and no tagline: post, banner, shelves; name and signboard stay faint", () => {
        const parts = stallParts({
            ...empty,
            topTalent: "The Catalyst",
            missionTitle: "Help founders say what is true",
            assets: assets("Facilitation", "A network of founders"),
        });
        expect(parts.present).toEqual(["post", "banner", "shelves"]);
        expect(parts.post).toBe("The Catalyst");
        expect(parts.banner).toBe("Help founders say what is true");
        expect(parts.shelves).toEqual(["Facilitation", "A network of founders"]);
        expect(parts.name).toBeNull();
        expect(parts.signboard).toBeNull();
        expect(parts.open).toBe(false);
    });

    it("no saved offer at all: talent + mission + assets still give three present parts", () => {
        const parts = stallParts({
            topTalent: "The Catalyst",
            missionTitle: "Mission",
            assets: assets("One", "Two", "Three"),
        });
        expect(parts.present).toHaveLength(3);
        expect(parts.present).toEqual(["post", "banner", "shelves"]);
        expect(parts.open).toBe(false);
    });

    it("a saved tagline opens the stall and adds the name and signboard", () => {
        const parts = stallParts({
            ...empty,
            topTalent: "The Catalyst",
            uniquenessPhrase: "I turn scattered gifts into one clear offer.",
            tagline: "From stuck in ideas to a first paying client.",
            offerSaved: true,
        });
        expect(parts.present).toEqual(["post", "name", "signboard"]);
        expect(parts.name).toBe("I turn scattered gifts into one clear offer.");
        expect(parts.signboard).toBe("From stuck in ideas to a first paying client.");
        expect(parts.open).toBe(true);
    });

    it("a full sheet has every part, in drawing order, and the lamp lit by the first sale", () => {
        const parts = stallParts({
            topTalent: "The Catalyst",
            missionTitle: "Mission",
            assets: assets("One", "Two", "Three"),
            uniquenessPhrase: "Name",
            tagline: "Sign",
            offerSaved: true,
            victories: ["first-price", "first-sale"],
        });
        expect(parts.present).toEqual(["post", "banner", "shelves", "name", "signboard", "lamp"]);
        expect(parts.lampLit).toBe(true);
    });

    it("only the first-sale victory lights the lamp", () => {
        expect(stallParts({ ...empty, victories: ["webinar", "mastermind", "first-price"] }).lampLit).toBe(false);
        expect(stallParts({ ...empty, victories: ["first-sale"] }).lampLit).toBe(true);
    });

    it("the stall copy is the spec's two header lines and uses no barrier or score word", () => {
        const stall = en.market.stall;
        expect(stall.headerPrivate).toBe("Your stall. Only you can see it for now.");
        expect(stall.headerOpen).toBe("Your stall is open in the Market.");
        for (const line of Object.values(stall)) {
            expect(line).not.toMatch(/\b(lock|locked|gate|unlock|coming soon|xp|points?|levels?)\b/i);
        }
    });

    it("shows at most three shelf objects", () => {
        const parts = stallParts({ ...empty, assets: assets("One", "Two", "Three", "Four", "Five") });
        expect(parts.shelves).toEqual(["One", "Two", "Three"]);
    });

    it("treats blank strings as missing", () => {
        const parts = stallParts({
            ...empty,
            topTalent: "   ",
            missionTitle: "",
            uniquenessPhrase: " ",
            tagline: "\n",
            assets: assets("  ", "Real one"),
        });
        expect(parts.present).toEqual(["shelves"]);
        expect(parts.shelves).toEqual(["Real one"]);
    });
});
