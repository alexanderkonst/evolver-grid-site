import { describe, expect, it } from "vitest";
import { buildHistoryEvents } from "@/modules/profile-space/changeLines";
import type { ProfileSpaceData } from "@/modules/profile-space/types";
import { artifactToText, buildAssetCardLines, truncateAtWord } from "../profilePdfText";

// Mirrors deriveTitleFromDescription in AssetMappingLanding.tsx: first
// sentence, cut to 77 chars + "…" when longer than 80.
const deriveTitle = (desc: string): string => {
    const first = desc.split(/(?<=[.!?])\s+|\s+—\s+/)[0]?.trim() || desc;
    return first.length <= 80 ? first : first.slice(0, 77).trimEnd() + "…";
};

describe("PDF section 1 — Assets: title printed once", () => {
    const description =
        "Ten years of building holonic operating systems for founders who want their companies to run without them.";

    it("prints only the full text when the stored title is a truncated copy of it", () => {
        const title = deriveTitle(description);
        expect(title.endsWith("…")).toBe(true);
        expect(buildAssetCardLines({ title, description, source: null })).toEqual([description]);
    });

    it("prints only the description when the title is the full first sentence", () => {
        const desc = "Founder of Planetary OS. Also runs a small studio.";
        expect(buildAssetCardLines({ title: "Founder of Planetary OS.", description: desc, source: null })).toEqual([
            desc,
        ]);
    });

    it("keeps a genuinely separate title above the description", () => {
        expect(
            buildAssetCardLines({ title: "Speaking", description: "Keynotes at three conferences.", source: "CV" }),
        ).toEqual(["Speaking", "Keynotes at three conferences.", "Source: CV"]);
    });

    it("prints the title alone when there is no description", () => {
        expect(buildAssetCardLines({ title: "Newsletter", description: null, source: null })).toEqual(["Newsletter"]);
    });

    it("snapshot of the rendered card text", () => {
        const lines = buildAssetCardLines({
            title: deriveTitle(description),
            description,
            source: "Asset mapping",
        });
        expect(lines.join("\n")).toBe(
            "Ten years of building holonic operating systems for founders who want their companies to run without them.\nSource: Asset mapping",
        );
    });
});

describe("PDF section 2 — Profile History: word-boundary truncation", () => {
    it("returns short text unchanged", () => {
        expect(truncateAtWord("Short mission.", 90)).toBe("Short mission.");
    });

    it("cuts on a word boundary and adds an ellipsis", () => {
        const out = truncateAtWord("Be the founder's carried operating layer through every unfinished thought", 60);
        expect(out).toBe("Be the founder's carried operating layer through every…");
        expect(out.endsWith("th…")).toBe(false);
    });

    it("does not leave dangling punctuation before the ellipsis", () => {
        expect(truncateAtWord("alpha beta, gamma delta", 11)).toBe("alpha beta…");
    });

    it("keeps the whole last word when the cut lands exactly on a boundary", () => {
        expect(truncateAtWord("alpha beta gamma", 10)).toBe("alpha beta…");
    });

    it("hard-cuts a single word longer than the limit", () => {
        expect(truncateAtWord("abcdefghij", 4)).toBe("abcd…");
    });

    it("history row for a long mission statement never ends mid-word", () => {
        const statement =
            "Be the founder's carried operating layer, so that every unfinished thought becomes a shipped thing.";
        const data = {
            identity: null,
            zogLatest: null,
            zogHistory: [],
            mission: { statement, categories: [], discoveredAt: "2026-10-01T10:00:00.000Z" },
            assets: [],
            qolLatest: null,
            qolHistory: [],
            requests: [],
            loading: false,
            error: null,
            reload: async () => {},
        } as ProfileSpaceData;

        const [event] = buildHistoryEvents(data);
        expect(event.kind).toBe("mission");
        expect(event.changeLine).toBe("Be the founder's carried operating layer, so that every unfinished thought becomes a…");
        expect(statement.startsWith(event.changeLine.slice(0, -1))).toBe(true);
    });
});

describe("artifactToText", () => {
    it("reads plain strings, headline fields and falls back to the first string", () => {
        expect(artifactToText("  hello ")).toBe("hello");
        expect(artifactToText({ tagline: "Tag", name: "N" })).toBe("Tag");
        expect(artifactToText({ n: 1, other: "first string" })).toBe("first string");
        expect(artifactToText({ n: 1 })).toBeNull();
        expect(artifactToText(null)).toBeNull();
    });
});
