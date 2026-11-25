import { expect, test as base, type Locator, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

/**
 * Shared helpers for the guest-view specs (qa-pass §3: assertions first, screenshots as evidence).
 * Nothing here signs in, submits, or calls a paid backend function.
 */

export type Box = { left: number; top: number; right: number; bottom: number };

export const intersects = (a: Box, b: Box): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

export const inflate = (b: Box, by: number): Box => ({
  left: b.left - by,
  top: b.top - by,
  right: b.right + by,
  bottom: b.bottom + by,
});

/**
 * Guest view makes no paid or write backend call. Every request to an edge function is refused and
 * recorded, and so is any database write; a spec that sees one fails.
 * One exception: the anonymous analytics insert `funnel_events` fires on every page view. It is
 * free, so it does not fail a spec, but it is aborted so QA runs never pollute the funnel numbers.
 */
const ANALYTICS_WRITE = /\/rest\/v1\/funnel_events(\?|$)/;

export const test = base.extend<{ guard: string[] }>({
  guard: [
    async ({ page }, use) => {
      const blocked: string[] = [];
      await page.route(/\/functions\/v1\//, (route) => {
        blocked.push(route.request().url());
        return route.abort("blockedbyclient");
      });
      await page.route(/\.supabase\.co\/rest\/v1\//, (route) => {
        const { method, url } = { method: route.request().method(), url: route.request().url() };
        if (method === "GET" || method === "HEAD") return route.continue();
        if (ANALYTICS_WRITE.test(url)) return route.abort("blockedbyclient");
        blocked.push(`${method} ${url}`);
        return route.abort("blockedbyclient");
      });
      await use(blocked);
      expect(blocked, "guest view must make no paid or write backend calls").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Open a route as a first-time guest and wait for the village to settle (the save has loaded). */
export async function openGuest(page: Page, route: string): Promise<void> {
  const res = await page.goto(route, { waitUntil: "load" });
  expect(res?.status(), `${route} should answer 200 (401 = Vercel Deployment Protection: set VERCEL_AUTOMATION_BYPASS_SECRET)`).toBeLessThan(400);
  // A followed redirect to Vercel's login answers 200; say so instead of timing out below.
  const base = new URL(String(test.info().project.use.baseURL));
  expect(new URL(page.url()).host, `${route} ended on ${page.url()}, not on the preview (Vercel Deployment Protection? see global-setup.ts)`).toBe(base.host);
  // The next-move card or the place title is the first honest sign the screen has its data.
  await page.waitForFunction(
    () => !!document.querySelector(".vl-move__card, .vl-place.is-on h2, nav[aria-label='Village']"),
    undefined,
    { timeout: 20_000 },
  );
}

/** Screenshot as evidence: saved under artifacts/screenshots/<project>/ and attached to the report. */
export async function shot(page: Page, info: TestInfo, name: string): Promise<void> {
  const dir = path.join("artifacts", "screenshots", info.project.name);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file });
  await info.attach(`${info.project.name}-${name}`, { path: file, contentType: "image/png" });
}

export async function box(loc: Locator): Promise<Box> {
  const b = await loc.boundingBox();
  if (!b) throw new Error(`no bounding box for ${loc}`);
  return { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height };
}

/** The rooms pane, open. A phone starts it closed behind the «Rooms» control (GoBY §25.3). */
export async function openPane(page: Page): Promise<Locator> {
  const pane = page.locator("#vl-rooms");
  if (!(await pane.evaluate((el) => el.classList.contains("is-open")))) {
    await page.locator(".vl-rooms__toggle").click();
  }
  await expect(pane).toHaveClass(/is-open/);
  // Let the slide-in finish so geometry is final (instant under reduced motion).
  await page.waitForTimeout(450);
  return pane;
}

/**
 * What sits on top of a control: samples five points inside it (centre and four inset corners) and returns
 * a description of any other element that is topmost there. Empty means nothing covers it.
 */
export async function coveredBy(loc: Locator): Promise<string[]> {
  return loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const inset = 4;
    const pts: [number, number][] = [
      [r.left + r.width / 2, r.top + r.height / 2],
      [r.left + inset, r.top + inset],
      [r.right - inset, r.top + inset],
      [r.left + inset, r.bottom - inset],
      [r.right - inset, r.bottom - inset],
    ];
    const covers = new Set<string>();
    for (const [x, y] of pts) {
      const top = document.elementFromPoint(x, y);
      if (top && top !== el && !el.contains(top) && !top.contains(el)) {
        covers.add(`${top.tagName.toLowerCase()}${top.getAttribute("aria-label") ? `[${top.getAttribute("aria-label")}]` : ""}.${String(top.className).split(" ")[0]}`);
      }
    }
    return [...covers];
  });
}

export const launcher = (page: Page): Locator => page.getByRole("button", { name: "Chat with us" });

/** The move the map card shows: place name, full text, and where its ENTER leads. */
export async function mapMove(page: Page): Promise<{ place: string; where: string; title: string; to: string }> {
  const card = page.locator(".vl-move__card");
  await expect(card).toBeVisible();
  const place = ((await card.locator(".vl-move__place").textContent()) ?? "").trim();
  const where = ((await card.locator(".vl-move__where").textContent()) ?? "").replace(/\s+/g, " ").trim();
  const title = where.includes("·") ? where.split("·").slice(1).join("·").replace(/\(.*\)\s*$/, "").trim() : place;
  const to = (await card.locator("a.vl-move__enter").getAttribute("href")) ?? "";
  return { place, where, title, to };
}

/** axe: serious and critical only (qa-pass §5). Returns the readable violations. */
export async function seriousAxe(page: Page, scope?: string) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (scope) builder = builder.include(scope);
  const { violations } = await builder.analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({
      rule: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 4).map((n) => n.target.join(" ")),
    }));
}

/**
 * Visible text lines inside `rootSel`, each as a viewport rect clipped to `clipSel` (a scroller).
 * A line the scroller has scrolled out of sight contributes nothing. `skipSel` text is ignored.
 */
export async function visibleTextLines(page: Page, rootSel: string, clipSel: string, skipSel: string): Promise<(Box & { text: string })[]> {
  return page.evaluate(
    ({ rootSel, clipSel, skipSel }) => {
      const root = document.querySelector(rootSel);
      const clip = document.querySelector(clipSel)?.getBoundingClientRect();
      if (!root || !clip) return [];
      const out: { left: number; top: number; right: number; bottom: number; text: string }[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = (n.textContent ?? "").trim();
        if (!text || n.parentElement?.closest(skipSel)) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of Array.from(range.getClientRects())) {
          const left = Math.max(r.left, clip.left);
          const right = Math.min(r.right, clip.right);
          const top = Math.max(r.top, clip.top);
          const bottom = Math.min(r.bottom, clip.bottom);
          if (right - left > 1 && bottom - top > 1) out.push({ left, top, right, bottom, text: text.slice(0, 60) });
        }
      }
      return out;
    },
    { rootSel, clipSel, skipSel },
  );
}
