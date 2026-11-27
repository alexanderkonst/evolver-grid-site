import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ACCENT, INK, MUTED, PANEL, RAISED, SUBHEAD, contrast } from "../consoleTheme";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke: vi.fn() } } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

import ConsoleCardView from "../ConsoleCardView";
import { rec } from "@/lib/console/__tests__/fixtures";
import type { CardRecord } from "@/lib/console/phoenixChain";

const withText = (full: string, data: Partial<CardRecord["data"]> = {}): CardRecord => {
  const base = rec(1, full);
  return { ...base, data: { ...base.data, ...data } as CardRecord["data"] };
};
const html = (record: CardRecord, id: 1 | 2 | 5 = 1) => renderToStaticMarkup(<ConsoleCardView id={id} record={record} />);

describe("Console polish (after #503)", () => {
  it("1 · markdown in a result is rendered, no literal asterisks reach the page", () => {
    const out = html(withText("Here is *Your Unfolding Potential* and **the point**.\n\n1. First reason\n2. Second reason", {
      goal: "Launch *Your Unfolding Potential* this spring.",
      why: ["Because **you said so**.", "Because *it is named*.", "Because it is dated."],
      notThis: "Not *a free pilot*.",
    }));
    expect(out).not.toMatch(/\*/);
    expect(out).toContain("<em>Your Unfolding Potential</em>");
    expect(out).toMatch(/<strong[^>]*>you said so<\/strong>/);
    // «Read all» holds block markdown: paragraph + a real ordered list.
    expect(out).toMatch(/<ol[^>]*>\s*<li[^>]*>First reason/);
  });

  it("1 · «Read all»: a bold label glued to its text (**Clear intent:**The goal) renders bold, no asterisks", () => {
    const out = html(withText(
      "Why it works:\n\n1. **Clear intent:**The goal is stated.\n2. **Action-oriented:**It starts with a verb.\n3. **Measurability:** Has a number.\n4. **Clear intent:**\u00a0Spaced.",
    ));
    expect(out).not.toMatch(/\*/);
    for (const label of ["Clear intent:", "Action-oriented:", "Measurability:"]) {
      expect(out).toMatch(new RegExp(`<strong[^>]*>${label}</strong>`));
    }
    expect(out).toMatch(/<\/strong> ?The goal is stated/);
  });

  it("1 · raw HTML and images in model text are not rendered", () => {
    const out = html(withText('<script>alert(1)</script> ![x](http://e.com/a.png) [a](javascript:alert(1))'));
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<img");
    expect(out).not.toContain("javascript:");
  });

  it("1 · text-field cards (case, survived) keep their paragraphs and render emphasis", () => {
    const base = rec(2);
    const out = html({ ...base, data: { ...base.data, case: "First *part*.\n\nSecond part." } as CardRecord["data"] }, 2);
    expect(out).not.toMatch(/\*/);
    expect(out).toContain("<em>part</em>");
    expect(out).toMatch(/<p[^>]*>First/);
    expect(out).toMatch(/<p[^>]*>Second part/);
  });

  it("2 · lists in the result and in «Read all» have spacing between items", () => {
    const out = html(withText("Reasons:\n\n1. One\n2. Two"));
    const lists = out.match(/<ol[^>]*>/g) ?? [];
    expect(lists.length).toBeGreaterThanOrEqual(2);
    for (const tag of lists) expect(tag).toMatch(/space-y-(1\.5|2)/);
  });

  it("3 · subheadings reach WCAG AA (4.5:1) on the card and the panel", () => {
    for (const bg of [RAISED, PANEL]) expect(contrast(SUBHEAD, bg)).toBeGreaterThanOrEqual(4.5);
    // The old value stays correct for hints; the subheading is now at least as strong as it.
    expect(contrast(SUBHEAD, RAISED)).toBeGreaterThanOrEqual(contrast(MUTED, RAISED));
    expect(contrast(INK, RAISED)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ACCENT, RAISED)).toBeGreaterThanOrEqual(4.5);
    expect(html(withText("x"))).toContain(`color:${SUBHEAD}`);
  });

  it("4 · «Read all» is a compact control, not a full-width block that paints a patch on tap or focus", () => {
    const out = html(withText("full answer"));
    const summary = out.match(/<summary[^>]*>/)?.[0] ?? "";
    expect(summary).toContain("w-fit");
    expect(summary).toContain("tap-highlight-color:transparent");
    expect(summary).toContain("list-none");
  });

  it("5 · the scrim sits behind the stage and the panel (explicit layers), the panel is not dimmed", () => {
    const src = readFileSync(join(__dirname, "../../YourAiInstrument.tsx"), "utf8");
    const scrim = src.match(/data-testid="instrument-scrim"[\s\S]*?\/>/)?.[0] ?? "";
    expect(scrim).toMatch(/className="absolute inset-0 z-0"/);
    expect(src).toMatch(/className="pointer-events-none absolute left-1\/2 z-10"/);
    expect(src).toMatch(/pointer-events-none absolute inset-0 z-20 grid place-items-center/);
    expect(src).toMatch(/inset-x-3 bottom-\[calc\(max\(1rem,env\(safe-area-inset-bottom\)\)\+10\.25rem\)\] top-3 z-20 flex/);
  });
});
