import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ARTIFACT_CHAR_CAP,
  artifactText,
  buildFamiliarPrompt,
  type FamiliarArtifactInput,
  type FamiliarTalentInput,
} from "../buildFamiliarPrompt";

// The bundled source of truth, read straight from the file the module imports.
const AI_OS = readFileSync(new URL("../../../../system-prompts/v5.2/system-prompt.md", import.meta.url), "utf8");

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

  it("the bundled AI OS text is the real v5.2 prompt, not a stub", () => {
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
    expect(out.indexOf("# About me")).toBeLessThan(out.indexOf(AI_OS.trim()));
  });

  it("ends with the AI OS text, untouched", () => {
    expect(out.endsWith(AI_OS.trim())).toBe(true);
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
    const aiOs = out.indexOf(AI_OS.trim());
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
