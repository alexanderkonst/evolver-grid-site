import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ARTIFACT_CHAR_CAP,
  artifactText,
  buildFamiliarPrompt,
  promptSections,
  splitLicence,
  type FamiliarArtifactInput,
  type FamiliarTalentInput,
} from "../buildFamiliarPrompt";

// The bundled source of truth, read straight from the file the module imports.
const AI_OS = readFileSync(new URL("../../../../system-prompts/v6.0/system-prompt.md", import.meta.url), "utf8");

const { licence: LICENCE, body: AI_OS_BODY } = splitLicence(AI_OS);

const TALENT: FamiliarTalentInput = {
  archetypeTitle: "Pattern Architecting",
  corePattern: "You see the structure under a tangle and hand it back as a map.",
  topThreeTalents: ["You name what is happening.", "You build the frame.", "You make it usable."],
};

const artifact = (key: string, label: string, text = `${label} text`): FamiliarArtifactInput => ({ key, label, text });

const SIX: FamiliarArtifactInput[] = [
  artifact("uniqueness", "Uniqueness"),
  artifact("myth", "Myth"),
  artifact("tribe", "Tribe"),
  artifact("pain", "Pain"),
  artifact("promise", "Promise"),
  artifact("value_ladder", "Value ladder"),
];

describe("buildFamiliarPrompt: guest", () => {
  it("is AI OS alone, with no section and no preamble", () => {
    expect(buildFamiliarPrompt({ aiOs: AI_OS })).toBe(AI_OS.trim());
  });

  it("treats empty inputs the same as no inputs", () => {
    const out = buildFamiliarPrompt({ aiOs: AI_OS, talent: {}, mission: "  ", artifacts: [] });
    expect(out).toBe(AI_OS.trim());
    expect(out).not.toContain("# About me");
    expect(out).not.toContain("# My work");
  });

  it("the bundled AI OS text is the real v6.0 prompt, not a stub", () => {
    expect(AI_OS.split(/\s+/).length).toBeGreaterThan(5000);
  });
});

describe("buildFamiliarPrompt: J1 only (top talent saved)", () => {
  const out = buildFamiliarPrompt({ aiOs: AI_OS, talent: TALENT });

  it("puts About me before AI OS and leaves My work out", () => {
    expect(out).toContain("# About me");
    expect(out).toContain("My top talent: Pattern Architecting");
    expect(out).toContain("My core pattern: You see the structure under a tangle and hand it back as a map.");
    expect(out).toContain("- You build the frame.");
    expect(out).not.toContain("# My work");
    expect(out.indexOf("# About me")).toBeLessThan(out.indexOf(AI_OS_BODY));
  });

  it("carries the AI OS text untouched, with its licence header last", () => {
    expect(LICENCE).toContain("License: CC BY-NC-SA 4.0");
    expect(out.includes(AI_OS_BODY)).toBe(true);
    expect(out.endsWith(LICENCE)).toBe(true);
    expect(out.split(LICENCE).length - 1).toBe(1);
    expect(out.indexOf(LICENCE)).toBeGreaterThan(out.indexOf(AI_OS_BODY));
  });

  it("opens on About me, not on the licence", () => {
    expect(out.indexOf("# About me")).toBeLessThan(out.indexOf("License:"));
    expect(out.startsWith("Below is who I am")).toBe(true);
  });

  it("adds the mission when there is one, and only then", () => {
    expect(out).not.toContain("My mission:");
    const withMission = buildFamiliarPrompt({ aiOs: AI_OS, talent: TALENT, mission: "Help founders say what only they can say" });
    expect(withMission).toContain("My mission: Help founders say what only they can say");
  });

  it("omits the lines the snapshot does not have", () => {
    const titleOnly = buildFamiliarPrompt({ aiOs: AI_OS, talent: { archetypeTitle: "Pattern Architecting" } });
    expect(titleOnly).toContain("My top talent: Pattern Architecting");
    expect(titleOnly).not.toContain("My core pattern:");
    expect(titleOnly).not.toContain("My three top talents:");
  });
});

describe("buildFamiliarPrompt: J1 + Workshop artifacts", () => {
  const out = buildFamiliarPrompt({ aiOs: AI_OS, talent: TALENT, mission: "A mission", artifacts: SIX });

  it("orders About me, My work, AI OS", () => {
    const about = out.indexOf("# About me");
    const work = out.indexOf("# My work");
    const aiOs = out.indexOf(AI_OS_BODY);
    expect(about).toBeGreaterThanOrEqual(0);
    expect(work).toBeGreaterThan(about);
    expect(aiOs).toBeGreaterThan(work);
  });

  it("carries all six pieces, each under its label, in the order given", () => {
    const at = SIX.map((a) => out.indexOf(`## ${a.label}\n\n${a.text}`));
    for (const i of at) expect(i).toBeGreaterThan(-1);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("works with artifacts and no top talent (a Workshop piece before J1 is still the player's work)", () => {
    const noTalent = buildFamiliarPrompt({ aiOs: AI_OS, artifacts: SIX });
    expect(noTalent).not.toContain("# About me");
    expect(noTalent).toContain("# My work");
  });

  it("skips a piece with no text, and falls back to the key when it has no label", () => {
    const res = buildFamiliarPrompt({
      aiOs: AI_OS,
      artifacts: [artifact("myth", "Myth", "   "), { key: "reach", label: "", text: "Podcasts" }],
    });
    expect(res).not.toContain("## Myth");
    expect(res).toContain("## reach\n\nPodcasts");
  });

  it("cuts a very long piece at the cap and says so with an ellipsis", () => {
    const long = "x".repeat(ARTIFACT_CHAR_CAP + 500);
    const res = buildFamiliarPrompt({ aiOs: "OS", artifacts: [artifact("landing_page", "Landing page", long)] });
    expect(res).toContain(`${"x".repeat(ARTIFACT_CHAR_CAP)}…`);
    expect(res).not.toContain("x".repeat(ARTIFACT_CHAR_CAP + 1));
  });

  it("is deterministic: the same input gives the same prompt", () => {
    const again = buildFamiliarPrompt({ aiOs: AI_OS, talent: TALENT, mission: "A mission", artifacts: SIX });
    expect(again).toBe(out);
  });
});

describe("artifactText", () => {
  it("prefers content", () => {
    expect(artifactText({ content: "  Plain text  ", content_json: { a: "ignored" } })).toBe("Plain text");
  });

  it("falls back to every string inside content_json, in order", () => {
    expect(artifactText({ content: null, content_json: { headline: "H", items: ["one", { deep: "two" }], n: 3 } })).toBe(
      "H\none\ntwo",
    );
  });

  it("is empty when there is nothing", () => {
    expect(artifactText({ content: null, content_json: null })).toBe("");
    expect(artifactText({})).toBe("");
  });
});

describe("splitLicence", () => {
  it("takes the leading version and License lines, and nothing else", () => {
    expect(LICENCE.split("\n")).toHaveLength(2);
    expect(LICENCE.startsWith("AI OS v6.0")).toBe(true);
    expect(AI_OS_BODY.startsWith("Editions:")).toBe(true);
    expect(`${LICENCE}\n${AI_OS_BODY}`).toBe(AI_OS.trim());
  });

  it("leaves a text without that header whole", () => {
    expect(splitLicence("Some prompt\nsecond line")).toEqual({ licence: "", body: "Some prompt\nsecond line" });
  });

  it("a guest prompt stays the whole AI OS text, header first", () => {
    expect(buildFamiliarPrompt({ aiOs: AI_OS }).startsWith(LICENCE)).toBe(true);
  });
});

describe("promptSections", () => {
  it("lists only the parts the prompt holds, in prompt order, AI OS last", () => {
    expect(promptSections({ aiOs: "OS" }).map((p) => p.key)).toEqual(["aiOs"]);
    expect(promptSections({ aiOs: "OS", talent: TALENT }).map((p) => p.key)).toEqual(["aboutMe", "aiOs"]);
    expect(promptSections({ aiOs: "OS", talent: TALENT, artifacts: SIX }).map((p) => p.key)).toEqual([
      "aboutMe",
      "myWork",
      "aiOs",
    ]);
  });

  it("reports each part's size in characters", () => {
    const parts = promptSections({ aiOs: "OS text", talent: TALENT });
    expect(parts.find((p) => p.key === "aiOs")?.chars).toBe("OS text".length);
    expect(parts.find((p) => p.key === "aboutMe")?.chars).toBeGreaterThan(40);
  });
});
