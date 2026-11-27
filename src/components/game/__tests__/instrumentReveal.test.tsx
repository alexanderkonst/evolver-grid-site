import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { InstrumentRevealView, revealKeyAction, revealStage } from "@/components/game/InstrumentReveal";
import { REVEAL_OUTLINES, REVEAL_STEPS, isTourStep, nextRevealStep, revealLineKey, type RevealStepId } from "@/lib/instrument/reveal";
import { TOUR_GROUPS } from "@/lib/yourAiInstrument";
import en from "../../../locales/en/common.json";
import es from "../../../locales/es/common.json";
import ru from "../../../locales/ru/common.json";

/**
 * Navigation instrument, WP7 step 2: the first reveal's drawing (architecture §5.3).
 * The view holds no state, so each step is rendered on its own and the button is pressed through its props.
 * (The wrapper's portal, focus and flight need a browser; the e2e pass covers them when it is wired in.)
 */

type Dict = Record<string, unknown>;
const get = (locale: unknown, key: string) => key.split(".").reduce<unknown>((o, k) => (o as Dict | undefined)?.[k], locale);

/** `t` over the real English strings, with {{vars}} filled like i18next does. A missing key throws: a test must not pass on a key shown raw. */
const tIn =
  (locale: unknown) =>
  (key: string, opts?: Record<string, unknown>): string => {
    const value = get(locale, key);
    if (typeof value !== "string") throw new Error(`missing string: ${key}`);
    return value.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => String(opts?.[k]));
  };
const t = tIn(en);

const MOON = 0.5; // full
const view = (step: RevealStepId, extra: Partial<Parameters<typeof InstrumentRevealView>[0]> = {}) => (
  <InstrumentRevealView step={step} reduced={false} moonCycle={MOON} t={t} onContinue={() => {}} {...extra} />
);
const render = (step: RevealStepId, extra: Partial<Parameters<typeof InstrumentRevealView>[0]> = {}) => renderToStaticMarkup(view(step, extra));

const attr = (html: string, testid: string, name: string) => html.match(new RegExp(`data-testid="${testid}"[^>]*?${name}="([^"]*)"`))?.[1];
const unescape = (s: string) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
const lines = (html: string) => unescape(html.match(/data-testid="instrument-reveal-line"[^>]*>([^<]*)</)?.[1] ?? "");
/** The crystal's own markup (its edges), so the check does not read the ring's or a band's. */
const crystalMarkup = (html: string) => html.slice(html.indexOf('data-testid="instrument-reveal-crystal"'), html.indexOf("</svg>"));

/** Walks an element tree (the view calls no hooks, so it can be called as a function) and returns the first match. */
const find = (node: ReactNode, test: (el: ReactElement) => boolean): ReactElement | null => {
  if (!isValidElement(node)) return Array.isArray(node) ? node.map((n) => find(n, test)).find(Boolean) ?? null : null;
  if (test(node)) return node;
  return find((node.props as { children?: ReactNode }).children, test);
};

describe("DoD 2 · the sequence is drawn in the order of §5.3", () => {
  it("dim: the world dims and one point of air light is on stage, no crystal yet", () => {
    const html = render("dim");
    expect(html).toContain('data-step="dim"');
    expect(revealStage("dim")).toMatchObject({ point: true, crystal: false, ring: false, opened: false, outlines: false, settled: false });
    expect(attr(html, "instrument-reveal-crystal", "data-drawn")).toBe("false");
    expect(revealStage("dim").scrim).toBeGreaterThan(0);
  });

  it("gather: the point becomes the octahedron (the air crystal is drawn)", () => {
    expect(revealStage("gather")).toMatchObject({ point: false, crystal: true, ring: false });
    expect(attr(render("gather"), "instrument-reveal-crystal", "data-drawn")).toBe("true");
  });

  it("ring: the water ring closes with today's moon on it", () => {
    const html = render("ring");
    expect(revealStage("ring")).toMatchObject({ crystal: true, ring: true, opened: false });
    expect(attr(html, "instrument-reveal-ring", "data-closed")).toBe("true");
    expect(html).toContain('data-testid="instrument-reveal-moon"');
    // A full moon is a lit disc: the lit polygon is there. A new moon has none to draw.
    expect(html).toContain('fill="#f2f6f8"');
    expect(render("ring", { moonCycle: 0 })).not.toContain('fill="#f2f6f8"');
  });

  it("open: the instrument opens itself, with Your AI's three groups under the crystal and none lit yet", () => {
    const html = render("open");
    expect(revealStage("open")).toMatchObject({ opened: true, group: null });
    for (const g of TOUR_GROUPS) expect(attr(html, `instrument-reveal-group-${g}`, "data-lit")).toBe("false");
  });

  it("one step per tour group lights exactly that group, with its one line", () => {
    for (const g of TOUR_GROUPS) {
      const html = render(g);
      expect(revealStage(g)).toMatchObject({ opened: true, group: g });
      for (const other of TOUR_GROUPS) expect(attr(html, `instrument-reveal-group-${other}`, "data-lit")).toBe(other === g ? "true" : "false");
      expect(lines(html)).toBe(t(revealLineKey(g)));
    }
    expect(isTourStep("header") && isTourStep("conversation") && isTourStep("console")).toBe(true);
  });

  it("outlines: the three earthly bodies show 'Opens on your path', and only at this step", () => {
    const html = render("outlines");
    expect(revealStage("outlines").outlines).toBe(true);
    for (const el of REVEAL_OUTLINES) expect(html).toContain(`data-testid="instrument-reveal-outline-${el}"`);
    expect(html.match(/Opens on your path/g)).toHaveLength(3);
    for (const other of REVEAL_STEPS.filter((s) => s !== "outlines")) expect(render(other)).not.toContain("instrument-reveal-outlines");
  });

  it("settle: the scrim lifts and the crystal flies to the corner when a flight is measured", () => {
    expect(revealStage("settle")).toMatchObject({ settled: true, scrim: 0, opened: false, crystal: true, ring: true });
    const html = render("settle", { fly: { x: 120, y: 200, scale: 0.4 } });
    expect(html).toContain("translate(120px, 200px) scale(0.4)");
    expect(html).toContain("pointer-events:none");
  });

  it("every step has one line, shown, with the 'n of N' count read in the same polite region", () => {
    REVEAL_STEPS.forEach((step, i) => {
      const html = render(step);
      expect(lines(html)).toBe(t(revealLineKey(step)));
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain(`${i + 1} of ${REVEAL_STEPS.length}`);
    });
  });
});

describe("DoD 2 · one button, 'Continue', on every step", () => {
  it("every step carries exactly one button, and it reads Continue", () => {
    for (const step of REVEAL_STEPS) {
      const html = render(step);
      expect(html.match(/<button/g), step).toHaveLength(1);
      expect(html).toContain(">Continue</button>");
      expect(html.match(/<button[^>]*style="[^"]*min-height|<button[^>]*min-h-\[44px\]/)).not.toBeNull();
    }
  });

  it("pressing it calls onContinue (the wrapper then walks to nextRevealStep)", () => {
    const onContinue = vi.fn();
    // The view has no hooks, so calling it returns its element tree to walk.
    const tree = InstrumentRevealView({ step: "dim", reduced: false, moonCycle: MOON, t, onContinue });
    const button = find(tree, (el) => el.type === "button");
    expect(button).not.toBeNull();
    (button?.props as { onClick: () => void }).onClick();
    expect(onContinue).toHaveBeenCalledTimes(1);
    expect(nextRevealStep("dim")).toBe("gather");
  });

  it("the last step is marked, so the wrapper can tell Continue ends the reveal", () => {
    expect(attr(render("settle"), "instrument-reveal-continue", "data-last")).toBe("true");
    expect(attr(render("outlines"), "instrument-reveal-continue", "data-last")).toBe("false");
  });
});

describe("DoD 3 · reduced motion: nothing draws, nothing fades", () => {
  it("full motion sets transitions; reduced sets none, anywhere on any step", () => {
    for (const step of REVEAL_STEPS) {
      expect(render(step), step).toContain("transition");
      const reduced = render(step, { reduced: true });
      expect(reduced, step).toContain('data-variant="reduced"');
      expect(reduced, step).not.toMatch(/transition:(?!\s*none)/);
    }
  });

  it("edges are fully drawn the moment their step arrives, instead of drawing in", () => {
    expect(crystalMarkup(render("gather", { reduced: true }))).not.toContain('stroke-dashoffset="1"');
    expect(crystalMarkup(render("dim", { reduced: true }))).toContain('stroke-dashoffset="1"');
    // The ring too: closed at its step, open before it.
    expect(render("ring", { reduced: true })).not.toContain('stroke-dashoffset="1"');
  });

  it("at the last step the stage is gone (no flight): the corner glyph is the only crystal left", () => {
    const html = render("settle", { reduced: true });
    expect(html).toMatch(/data-testid="instrument-reveal-stage"[^>]*style="[^"]*opacity:0/);
    expect(html).not.toMatch(/translate\(-?[\d.]+px/);
  });

  it("the line and the button are still there at every step", () => {
    for (const step of REVEAL_STEPS) {
      const html = render(step, { reduced: true });
      expect(lines(html)).toBe(t(revealLineKey(step)));
      expect(html).toContain(">Continue</button>");
    }
  });
});

describe("accessibility", () => {
  it("is a modal dialog with a name, and Esc finishes it while Tab stays on the one button", () => {
    const html = render("dim");
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain(`aria-label="${en.instrument.reveal.label}"`);
    expect(revealKeyAction("Escape")).toBe("finish");
    expect(revealKeyAction("Tab")).toBe("hold");
    expect(revealKeyAction("Enter")).toBeNull();
  });

  it("the drawing is hidden from screen readers; the line and count carry the meaning", () => {
    const html = render("ring");
    expect(html).toMatch(/<svg aria-hidden="true"[^>]*data-testid="instrument-reveal-svg"/);
  });
});

describe("en/es/ru together", () => {
  const keys = [...REVEAL_STEPS.map(revealLineKey), "instrument.reveal.continue", "instrument.reveal.opensOnPath", "instrument.reveal.step", "instrument.reveal.label"];

  it("every string of the reveal exists in all three languages", () => {
    for (const [name, locale] of [["en", en], ["es", es], ["ru", ru]] as const) {
      for (const key of keys) {
        const value = get(locale, key);
        expect(typeof value, `${name} ${key}`).toBe("string");
        expect((value as string).length, `${name} ${key}`).toBeGreaterThan(2);
      }
    }
  });

  it("the three tour lines are the §25.10 lines already in Your AI, word for word", () => {
    for (const [name, locale] of [["en", en], ["es", es], ["ru", ru]] as const) {
      for (const g of TOUR_GROUPS) {
        expect(get(locale, `instrument.reveal.line.${g}`), `${name} ${g}`).toBe(get(locale, `yourAiInstrument.tour.${g}`));
      }
    }
  });

  it("'Opens on your path' matches the open instrument's caption, and the count keeps both variables", () => {
    for (const [name, locale] of [["en", en], ["es", es], ["ru", ru]] as const) {
      expect(get(locale, "instrument.reveal.opensOnPath"), name).toBe(get(locale, "instrument.opensOnPath"));
      expect(get(locale, "instrument.reveal.step"), name).toMatch(/\{\{n\}\}.*\{\{total\}\}/);
    }
    expect(en.instrument.reveal.opensOnPath).toBe("Opens on your path");
  });

  it("renders in Spanish and Russian with their own words, and no key shown raw", () => {
    for (const locale of [es, ru]) {
      const html = renderToStaticMarkup(view("outlines", { t: tIn(locale) }));
      expect(html).toContain(get(locale, "instrument.reveal.continue") as string);
      expect(html).toContain(get(locale, "instrument.reveal.opensOnPath") as string);
      expect(html).not.toContain("instrument.reveal");
    }
  });

  it("no gendered Russian verb forms address the player", () => {
    for (const key of keys) expect(get(ru, key) as string, key).not.toMatch(/\bты\s+\S+(л|ла)\b/);
  });
});
