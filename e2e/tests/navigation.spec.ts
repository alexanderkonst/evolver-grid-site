import {
  box,
  coveredBy,
  expect,
  inflate,
  intersects,
  launcher,
  mapMove,
  openGuest,
  openPane,
  shot,
  test,
  visibleTextLines,
} from "../helpers/guest";

/**
 * GoBY §25 navigation DoD (epic #453), guest view. Each test name starts with the DoD row it checks,
 * so the PR comment table reads as the checklist. docs/templates/qa-pass.md §3.
 */

// Rooms every place must list (qa-pass §3). Update with the blueprint when a room is added or removed.
const ROOMS: Record<string, number> = { reception: 1, academy: 3, "quest-board": 10, house: 7 };

const closedLine = /^Opens when .+Inside: .+/;

test.describe("DoD 1 · one next-move glow", () => {
  test("/village shows exactly one next-move glow", async ({ page }, info) => {
    await openGuest(page, "/village");
    const move = await mapMove(page);

    // The map is the pins and the places list: each says `next` for one place only, and it is the card's place.
    const nexts = page.locator('section[aria-label="Digital Village map"] [data-place-state="next"]');
    expect(await nexts.count(), "a next-move glow on the map").toBeGreaterThan(0);
    // On a phone the pins are bare dots (no text); the places list carries the name.
    const texts = (await nexts.allTextContents()).map((t) => t.toLowerCase()).filter((t) => t.trim().length > 0);
    expect(texts.length, "a named next-move glow").toBeGreaterThan(0);
    for (const t of texts) expect(t, "every glow names the card's place").toContain(move.place.toLowerCase());
    // Each list (the pins, the places list) lights one place, never two.
    const perList = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section[aria-label="Digital Village map"] ul, nav[aria-label="Places"] ul')).map(
        (ul) => Array.from(ul.children).filter((li) => li.getAttribute("data-place-state") === "next").length,
      ),
    );
    expect(perList.length, "the map has lists to check").toBeGreaterThan(0);
    for (const n of perList) expect(n, `one glow per list, got ${perList.join("/")}`).toBeLessThanOrEqual(1);
    await expect(page.locator(".vl-move__card")).toHaveCount(1);
    await shot(page, info, "village-one-glow");
  });
});

test.describe("DoD 2 · map, rail chip and pane row name the same move", () => {
  test("map card, rail chip and pane row agree", async ({ page }, info) => {
    await openGuest(page, "/village");
    const move = await mapMove(page);
    // The place the move leads to: the glowing entry in the places list links to its scene.
    const placeHref = await page.locator('nav[aria-label="Places"] [data-place-state="next"] a').first().getAttribute("href");
    expect(placeHref, "the glowing place links to its scene").toMatch(/^\/village\//);

    // Rail chip (the rail lives on /game/*; the same save, the same selector).
    await openGuest(page, "/game/journey");
    const chips = page.locator('nav[aria-label="Village"] button[data-place-state="next"]');
    expect(await chips.count(), "the rail glows for one place").toBeGreaterThan(0);
    const chipNames = new Set((await chips.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? ""))).map((s) => s.toLowerCase()));
    expect([...chipNames], "one rail chip name").toEqual([move.place.toLowerCase()]);
    await shot(page, info, "rail-chip");

    // Pane row on the place the move leads to.
    await openGuest(page, placeHref!);
    await openPane(page);
    const rows = page.locator('#vl-rooms .vl-rooms__row[data-room-state="next"]');
    await expect(rows, "the pane glows for one row").toHaveCount(1);
    const rowText = ((await rows.innerText()) ?? "").replace(/\s+/g, " ").toLowerCase();
    expect(rowText, "the pane row names the card's move").toContain(move.title.toLowerCase());
    await expect(page.locator(".vl-place.is-on h2")).toHaveText(new RegExp(`^${move.place}$`, "i"));
    await shot(page, info, "pane-next-row");
  });
});

test.describe("DoD 3 · where / next / home inside the first screen (3-second test)", () => {
  const FIRST_SCREEN_MS = Number(process.env.E2E_FIRST_SCREEN_MS ?? 3000);

  const inViewport = async (page: import("@playwright/test").Page, sel: string, what: string) => {
    const loc = page.locator(sel).first();
    await expect(loc, `${what} visible within ${FIRST_SCREEN_MS} ms`).toBeVisible({ timeout: FIRST_SCREEN_MS });
    const b = await box(loc);
    const vp = page.viewportSize()!;
    expect(b.left, `${what} inside the first screen (left)`).toBeGreaterThanOrEqual(0);
    expect(b.top, `${what} inside the first screen (top)`).toBeGreaterThanOrEqual(0);
    expect(b.right, `${what} inside the first screen (right)`).toBeLessThanOrEqual(vp.width);
    expect(b.bottom, `${what} inside the first screen (bottom)`).toBeLessThanOrEqual(vp.height);
  };

  test("/village answers where, next move, home", async ({ page }, info) => {
    await page.goto("/village", { waitUntil: "domcontentloaded" });
    await inViewport(page, "h1", "where: «The Digital Village»");
    await inViewport(page, ".vl-move__card a.vl-move__enter", "next move: ENTER on the card");
    await expect(page.locator(".vl-move__card .vl-move__result, .vl-move__card .vl-move__where").first()).toBeVisible();
    if (info.project.name === "phone") {
      // By design (Village.css: `.vl-corner { display: none }` under 768px) the phone village has no «← Title» link.
      info.annotations.push({ type: "finding", description: "phone /village: home («← Title») is not shown; no other home control in the first screen" });
    } else {
      await inViewport(page, "a.vl-corner", "home: «← Title»");
    }
    await shot(page, info, "village-first-screen");
  });

  for (const place of ["reception", "quest-board"]) {
    test(`/village/${place} answers where, next move, home`, async ({ page }, info) => {
      await page.goto(`/village/${place}`, { waitUntil: "domcontentloaded" });
      await inViewport(page, ".vl-place.is-on h2", "where: the place title");
      // Next: ENTER on an open place; on a closed one the enabled «Your next move» (DoD 6).
      await inViewport(page, ".vl-place .vl-enter", "next move: ENTER or «Your next move»");
      await inViewport(page, ".vl-place a.vl-back", "home: «← Village»");
      await shot(page, info, `${place}-first-screen`);
    });
  }
});

test.describe("DoD 4 · rooms pane lists all rooms, one line each", () => {
  for (const [place, count] of Object.entries(ROOMS)) {
    test(`/village/${place} lists ${count} room(s), each with one line`, async ({ page }, info) => {
      await openGuest(page, `/village/${place}`);
      await openPane(page);
      const rows = page.locator("#vl-rooms .vl-rooms__row");
      await expect(rows).toHaveCount(count);
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        await expect(row.locator(".vl-rooms__line"), `row ${i + 1} has exactly one line`).toHaveCount(1);
        expect(((await row.locator(".vl-rooms__line").textContent()) ?? "").trim().length, `row ${i + 1} line is not empty`).toBeGreaterThan(0);
      }
      await shot(page, info, `${place}-rooms`);
    });
  }
});

test.describe("DoD 5 · closed rooms are aria-disabled with a lock line", () => {
  for (const place of ["quest-board", "house"]) {
    test(`/village/${place}: every closed room is aria-disabled and says what opens it`, async ({ page }, info) => {
      await openGuest(page, `/village/${place}`);
      await openPane(page);
      const closed = page.locator('#vl-rooms .vl-rooms__row[data-room-state="closed"]');
      expect(await closed.count(), "a guest sees closed rooms here").toBeGreaterThan(0);
      for (let i = 0; i < (await closed.count()); i++) {
        const row = closed.nth(i);
        const a = row.locator("a");
        await expect(a, `closed row ${i + 1} is aria-disabled`).toHaveAttribute("aria-disabled", "true");
        await expect(a, `closed row ${i + 1} is not a link`).not.toHaveAttribute("href", /.*/);
        const line = ((await row.locator(".vl-rooms__line").textContent()) ?? "").trim();
        expect(line, `closed row ${i + 1}: «Opens when … Inside: …»`).toMatch(closedLine);
      }
      await shot(page, info, `${place}-closed-rooms`);
    });
  }
});

test.describe("DoD 6 · «Your next move» on a closed place is enabled and states its result", () => {
  for (const place of ["quest-board", "house"]) {
    test(`/village/${place}`, async ({ page }, info) => {
      await openGuest(page, `/village/${place}`);
      const move = page.locator(".vl-place a.vl-newcomer");
      await expect(move, "the one enabled next move").toHaveCount(1);
      await expect(move).toBeVisible();
      await expect(move).toContainText(/^Your next move: .+/);
      await expect(move, "it goes somewhere").toHaveAttribute("href", /^\/\S+/);
      const disabledAncestor = await move.evaluate((el) => !!el.closest('[aria-disabled="true"]') || el.getAttribute("aria-disabled") === "true");
      expect(disabledAncestor, "no aria-disabled on it or above it").toBe(false);
      // It states what it gives (§25.6), tied to the link for screen readers.
      const id = await move.getAttribute("aria-describedby");
      expect(id, "the result line is described-by the link").toBeTruthy();
      const gives = (await page.locator(`[id="${id}"]`).textContent())?.trim() ?? "";
      expect(gives.length, "the result line is not empty").toBeGreaterThan(0);
      await shot(page, info, `${place}-next-move`);
    });
  }
});

test.describe("DoD 7 · no pane text under the Hide toggle or the «Chat with us» launcher", () => {
  // The pane is open on load on a wide screen and on the Quest Board; a phone opens the rest by hand.
  for (const place of ["quest-board", "reception"]) {
    test(`/village/${place}: no text under Hide or the launcher, at every scroll position`, async ({ page }, info) => {
      await openGuest(page, `/village/${place}`);
      await openPane(page);
      const hide = await box(page.locator("#vl-rooms .vl-rooms__hide"));
      const chat = await box(launcher(page));
      const pane = await box(page.locator("#vl-rooms"));
      await shot(page, info, `${place}-overlaps-top`);

      // The pane's edge keeps a gap above the launcher wherever they share a column.
      const offenders: string[] = [];
      const sharesColumn = pane.left < chat.right && pane.right > chat.left;
      if (sharesColumn && chat.top - pane.bottom < 8) {
        offenders.push(`pane edge ${Math.round(chat.top - pane.bottom)}px above the launcher (needs 8px)`);
      }

      // The title shares a row with Hide: they sit side by side, never one over the other.
      for (const l of await visibleTextLines(page, "#vl-rooms .vl-rooms__head", "#vl-rooms .vl-rooms__head", ".vl-rooms__hide")) {
        if (intersects(l, hide)) offenders.push(`head: «${l.text}» under Hide`);
      }

      // The rows scroll under the header: check each scroll position, top to bottom, so the line that arrives last is checked too.
      const body = page.locator("#vl-rooms .vl-rooms__body");
      const max = await body.evaluate((el) => el.scrollHeight - el.clientHeight);
      for (let y = 0; ; y += 120) {
        const at = Math.min(y, max);
        await body.evaluate((el, top) => { el.scrollTop = top; }, at);
        const lines = await visibleTextLines(page, "#vl-rooms .vl-rooms__body", "#vl-rooms .vl-rooms__body", ".vl-rooms__hide");
        for (const l of lines) {
          if (intersects(l, hide)) offenders.push(`scroll ${at}: «${l.text}» under Hide`);
          if (intersects(l, inflate(chat, 8))) offenders.push(`scroll ${at}: «${l.text}» within 8px of the launcher`);
        }
        if (at >= max) break;
      }
      if (max > 0) await shot(page, info, `${place}-overlaps-bottom`);
      expect(offenders, "pane text meeting a control").toEqual([]);
    });
  }

  // Seen in the same screenshots: the global language chip (fixed, top-right) sat on «Hide», and on a phone on «Rooms».
  for (const place of ["quest-board", "reception"]) {
    test(`/village/${place}: nothing covers the Hide / Rooms toggle`, async ({ page }, info) => {
      await openGuest(page, `/village/${place}`);
      // Closed pane first (a phone starts that way on the Reception): the «Rooms» control.
      const toggle = page.locator(".vl-rooms__toggle");
      if (await toggle.count()) {
        expect(await coveredBy(toggle), "what covers «Rooms»").toEqual([]);
        await toggle.click();
      }
      await openPane(page);
      expect(await coveredBy(page.locator("#vl-rooms .vl-rooms__hide")), "what covers «Hide»").toEqual([]);
      await shot(page, info, `${place}-controls`);
    });
  }
});
