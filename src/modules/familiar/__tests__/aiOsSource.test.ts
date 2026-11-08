import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFamiliarPrompt } from "../buildFamiliarPrompt";
import { AI_OS_PROMPT, AI_OS_VERSION } from "../aiOsSource";

// The release file on disk: what `/ai-os` calls «System prompt v6.0».
const RELEASE = readFileSync(new URL("../../../../system-prompts/v6.0/system-prompt.md", import.meta.url), "utf8");

describe("aiOsSource", () => {
  it("is the v6.0 release", () => {
    expect(AI_OS_VERSION).toBe("6.0");
  });

  it("is exactly system-prompts/v6.0/system-prompt.md (what /ai-os copies and installs)", () => {
    expect(AI_OS_PROMPT).toBe(RELEASE);
  });

  it("the personal prompt ends with the release text", () => {
    const out = buildFamiliarPrompt({
      aiOs: AI_OS_PROMPT,
      talent: { archetypeTitle: "Pattern Architecting" },
      mission: "A mission",
    });
    expect(out.endsWith(RELEASE.trim())).toBe(true);
  });
});
