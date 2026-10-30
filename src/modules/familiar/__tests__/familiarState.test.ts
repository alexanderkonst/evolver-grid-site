import { describe, expect, it } from "vitest";
import { buildFamiliarState, buildGifts, hashPrompt, WORKSHOP_TOTAL } from "../familiarState";
import { chatAppUrl, CHAT_APPS, isChatApp } from "../chatApps";

const AI_OS = "AI OS text";
const base = { aiOs: AI_OS, aiOsVersion: "5.2" };
const talent = { archetypeTitle: "Pattern Architecting" };
const pieces = (n: number) => Array.from({ length: n }, (_, i) => ({ key: `k${i}`, label: `Piece ${i}`, text: `text ${i}` }));

const gift = (gifts: ReturnType<typeof buildGifts>, key: string) => gifts.find((g) => g.key === key)!;

describe("gifts", () => {
  it("guest: activated is lit, the other two are dim and say what opens them", () => {
    const gifts = buildGifts(base);
    expect(gifts.map((g) => g.key)).toEqual(["knowsYou", "activated", "knowsYourWork"]);
    expect(gift(gifts, "activated")).toMatchObject({ lit: true, detail: "AI OS 5.2" });
    expect(gift(gifts, "knowsYou")).toMatchObject({ lit: false, opensWhen: "Opens when you save your top talent" });
    expect(gift(gifts, "knowsYourWork")).toMatchObject({ lit: false, opensWhen: "Opens in the Workshop" });
    expect(gift(gifts, "knowsYou").detail).toBeUndefined();
  });

  it("J1 lights «knows you»; the mission adds to its detail", () => {
    expect(gift(buildGifts({ ...base, talent }), "knowsYou")).toMatchObject({ lit: true, detail: "your top talent" });
    expect(gift(buildGifts({ ...base, talent, mission: "M" }), "knowsYou").detail).toBe("your top talent + your mission");
    expect(gift(buildGifts({ ...base, talent }), "knowsYourWork").lit).toBe(false);
  });

  it("Workshop pieces light «knows your work» and are counted out of 19", () => {
    const g = gift(buildGifts({ ...base, talent, artifacts: pieces(6) }), "knowsYourWork");
    expect(g).toMatchObject({ lit: true, detail: `6 of ${WORKSHOP_TOTAL} Workshop pieces` });
    expect(g.opensWhen).toBeUndefined();
  });

  it("a piece with no text does not count", () => {
    const blank = [{ key: "myth", label: "Myth", text: "  " }];
    expect(gift(buildGifts({ ...base, artifacts: blank }), "knowsYourWork").lit).toBe(false);
  });
});

describe("state and version", () => {
  it("the guest prompt is AI OS alone", () => {
    expect(buildFamiliarState(base).prompt).toBe(AI_OS);
  });

  it("the version is stable for the same prompt and changes when the prompt does", () => {
    const a = buildFamiliarState({ ...base, talent });
    const b = buildFamiliarState({ ...base, talent });
    const c = buildFamiliarState({ ...base, talent, artifacts: pieces(1) });
    expect(a.version).toBe(b.version);
    expect(c.version).not.toBe(a.version);
    expect(a.version).toBe(hashPrompt(a.prompt));
    expect(a.version).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("chat apps", () => {
  it("offers ChatGPT, Claude and Gemini, each with an https new-chat address", () => {
    expect(CHAT_APPS.map((a) => a.id)).toEqual(["chatgpt", "claude", "gemini"]);
    for (const a of CHAT_APPS) expect(chatAppUrl(a.id)).toMatch(/^https:\/\//);
  });

  it("knows which values are apps", () => {
    expect(isChatApp("claude")).toBe(true);
    expect(isChatApp("bing")).toBe(false);
    expect(isChatApp(null)).toBe(false);
  });
});
