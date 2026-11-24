// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// The hook reads Supabase; the Home line only needs its shape here.
vi.mock("../useFamiliar", () => ({ useFamiliar: () => ({ loading: true }) }));

import AskMyAiButton from "../AskMyAiButton";
import ClipboardFallback from "../ClipboardFallback";
import PromptReceives from "../PromptReceives";
import YourAiHouseLine from "../YourAiHouseLine";
import { buildFamiliarState } from "../familiarState";
import { approxWords } from "../promptSize";
import type { FamiliarState } from "../types";
import en from "@/locales/en/common.json";
import ru from "@/locales/ru/common.json";
import es from "@/locales/es/common.json";

// The real English catalog, so the markup checks below read the strings a player reads.
void i18n.use(initReactI18next).init({ lng: "en", resources: { en: { translation: en } }, interpolation: { escapeValue: false } });

const OS = "AI OS v6.0 · 2026 · © Owner\nLicense: CC BY-NC-SA 4.0\nBody text of the system prompt. ".repeat(40);
const guest = (): FamiliarState => ({ ...buildFamiliarState({ aiOs: OS, aiOsVersion: "6.0" }), loading: false });
const signedIn = (): FamiliarState => ({
  ...buildFamiliarState({
    aiOs: OS,
    aiOsVersion: "6.0",
    talent: { archetypeTitle: "Pattern Architecting" },
    mission: "Help founders",
    artifacts: [{ key: "myth", label: "Myth", text: "A myth" }],
  }),
  loading: false,
});

describe("approxWords", () => {
  it("rounds to tens below a thousand and hundreds above, never to zero", () => {
    expect(approxWords(0)).toBe(10);
    expect(approxWords(900)).toBe(150);
    expect(approxWords(33000)).toBe(5500);
  });
});

describe("AI-02: What your AI receives", () => {
  it("a guest sees AI OS alone, with the first-message for a guest", () => {
    const html = renderToStaticMarkup(<PromptReceives state={guest()} />);
    expect(html).toContain("What your AI receives");
    expect(html).toContain("AI OS v6.0");
    expect(html).not.toContain("About me");
    expect(html).not.toContain("My work");
    expect(html).toContain("arrive in the chat as an attachment");
    expect(html).toContain("Confirm that everything loaded");
  });

  it("a signed-in player sees About me, My work and AI OS, in prompt order", () => {
    const html = renderToStaticMarkup(<PromptReceives state={signedIn()} />);
    const at = ["About me", "My work", "AI OS v6.0"].map((s) => html.indexOf(s));
    for (const i of at) expect(i).toBeGreaterThan(-1);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(html).toContain("Using what you know about me");
    expect(html).toMatch(/about [\d,]+ words/);
  });

  it("keeps the preview closed until asked", () => {
    const html = renderToStaticMarkup(<PromptReceives state={signedIn()} />);
    expect(html).toContain("Show the text");
    expect(html).not.toContain("<textarea");
  });
});

describe("AI-05: the button while the saves load", () => {
  it("says «Reading your village…», disabled and busy", () => {
    const html = renderToStaticMarkup(<AskMyAiButton state={{ ...guest(), loading: true }} app="claude" />);
    expect(html).toContain("Reading your village…");
    expect(html).toContain("disabled");
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("Take your AI");
  });

  it("says «Take your AI» once loaded", () => {
    const html = renderToStaticMarkup(<AskMyAiButton state={guest()} app="claude" />);
    expect(html).toContain("Take your AI");
    expect(html).not.toContain("disabled");
  });
});

describe("AI-12: the clipboard fallback", () => {
  it("shows the whole text in a selectable box with copy and download", () => {
    const text = "Line one & <two>\nLine three";
    const html = renderToStaticMarkup(<ClipboardFallback text={text} />);
    expect(html).toContain("<textarea");
    expect(html).toContain("readonly");
    expect(html).toContain("Line one &amp; &lt;two&gt;");
    expect(html).toContain("Copy the text");
    expect(html).toContain("Download .txt");
  });
});

describe("AI-08: the mark in Home", () => {
  it("shows nothing to a player who never took their AI", () => {
    expect(renderToStaticMarkup(<YourAiHouseLine />)).toBe("");
  });
});

describe("EN / RU / ES: the new hand-over copy", () => {
  const leaves = (o: unknown, path = ""): string[] =>
    o && typeof o === "object"
      ? Object.entries(o).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
      : [path];
  const fam = (l: unknown) => (l as { familiar: unknown }).familiar;
  const get = (l: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], fam(l));

  it("RU and ES carry every familiar key that EN has", () => {
    const keys = leaves(fam(en));
    expect(leaves(fam(ru)).sort()).toEqual([...keys].sort());
    expect(leaves(fam(es)).sort()).toEqual([...keys].sort());
  });

  it("the benefit line, the receives block and the Home line are translated, not copied", () => {
    for (const k of ["handover.benefit", "handover.reading", "receives.title", "receives.first", "house.line", "house.behind", "copyFailed"]) {
      expect(get(ru, k), `ru ${k}`).not.toBe(get(en, k));
      expect(get(es, k), `es ${k}`).not.toBe(get(en, k));
    }
  });

  it("the RU and ES hand-over copy has no em or en dash", () => {
    for (const l of [ru, es]) for (const p of leaves(fam(l))) expect(String(get(l, p)), p).not.toMatch(/[—–]/);
  });
});
