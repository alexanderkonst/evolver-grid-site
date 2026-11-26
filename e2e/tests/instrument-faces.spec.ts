import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP4: the fire and earth faces (docs/specs/navigation-instrument/architecture.md §6,
 * sow.md WP4).
 *
 * Fire has no lock, so a guest sees it. Earth waits on the mission (Workshop), a saved offer (Market) and the
 * first sale (Town Hall), so its specs seed a signed-in player: a stored session plus the one table the
 * sheet reads for the mission, answered in the browser. Nothing is written anywhere: every call to an edge
 * function and every database write is aborted. Self-contained on purpose (same as instrument.spec.ts).
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/instrument-faces.spec.ts
 */

type Box = { left: number; top: number; right: number; bottom: number };
const intersects = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const box = async (loc: Locator): Promise<Box> => {
  const b = await loc.boundingBox();
  if (!b) throw new Error(`no bounding box for ${loc}`);
  return { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height };
};

const glyphOf = (page: Page) => page.getByTestId("instrument-glyph");
const dialogOf = (page: Page) => page.getByRole("dialog", { name: "Your instrument" });
const faceOf = (page: Page, name: "Growth" | "Work") => page.getByRole("region", { name });

const USER_ID = "00000000-0000-4000-8000-000000000482";

/** A stored session, and the sheet's reads answered in the browser. `mission` = the mission statement is saved. */
async function seedPlayer(page: Page, opts: { mission: boolean }) {
  await page.addInitScript(
    ({ userId }) => {
      const now = Math.floor(Date.now() / 1000);
      window.localStorage.setItem(
        "evolver-auth-token",
        JSON.stringify({
          access_token: "e2e.fake.token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: now + 3600,
          refresh_token: "e2e-fake-refresh",
          user: { id: userId, aud: "authenticated", role: "authenticated", email: "e2e@example.invalid", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" },
        }),
      );
    },
    { userId: USER_ID },
  );
  const profile = { id: "00000000-0000-4000-8000-000000000999", user_id: USER_ID, first_name: "E2E", mission_statement: opts.mission ? "Help people find their work." : null };
  await page.route(/\.supabase\.co\/(functions|rest|auth)\/v1\//, (route) => {
    const req = route.request();
    const url = req.url();
    if (/\/functions\/v1\//.test(url) || (req.method() !== "GET" && req.method() !== "HEAD")) return route.abort("blockedbyclient");
    if (/\/rest\/v1\/game_profiles/.test(url)) {
      const one = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(one ? profile : [profile]) });
    }
    if (/\/rest\/v1\//.test(url)) {
      const one = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
      return one
        ? route.fulfill({ status: 406, contentType: "application/json", body: JSON.stringify({ code: "PGRST116", details: "The result contains 0 rows", hint: null, message: "JSON object requested, multiple (or no) rows returned" }) })
        : route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": "*/0" }, body: "[]" });
    }
    return route.continue();
  });
}

async function openVillage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("fytt:ai-os-visited", "true");
    window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
  });
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(glyphOf(page)).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => !!document.querySelector(".vl-move__card, .vl-place.is-on h2, nav[aria-label='Village']"), undefined, { timeout: 20_000 });
  // The rail draws `data-place-state="loading"` until the save has loaded; the quarters are lit from that save.
  await page.waitForFunction(() => !document.querySelector('[data-place-state="loading"]'), undefined, { timeout: 20_000 });
}

/** Raise the instrument and turn one body forward. */
async function openFace(page: Page, element: "fire" | "earth", name: "Growth" | "Work") {
  await glyphOf(page).click();
  await expect(dialogOf(page)).toBeVisible();
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Back to the instrument" }).click();
  const body = page.getByTestId(`instrument-body-${element}`);
  await expect(body).toHaveAttribute("data-lit", "true");
  await body.getByRole("button").click();
  await expect(faceOf(page, name)).toBeVisible();
  await page.waitForTimeout(800);
}

const items = (page: Page, name: "Growth" | "Work") => faceOf(page, name).locator("li");

test.describe("fire face", () => {
  test("DoD 3 · fire: an item opens its place in the village", async ({ page }) => {
    await openVillage(page);
    await openFace(page, "fire", "Growth");
    // Fire's two places have no lock: Academy and FMF, never more than three.
    const count = await items(page, "Growth").count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(3);
    await faceOf(page, "Growth").locator("[data-place='academy']").click();
    await expect(page).toHaveURL(/\/village\/academy$/);
    await expect(dialogOf(page)).toHaveCount(0);
  });

  test("DoD 1 · a guest's earth body stays an outline: no face, no Workshop, Market or Town Hall inside the instrument", async ({ page }) => {
    await openVillage(page);
    await glyphOf(page).click();
    await expect(dialogOf(page)).toBeVisible();
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Back to the instrument" }).click();
    const earth = page.getByTestId("instrument-body-earth");
    await expect(earth).toHaveAttribute("data-lit", "false");
    await expect(earth.getByRole("button")).toHaveCount(0);
    const text = (await dialogOf(page).innerText()).replace(/\s+/g, " ");
    for (const closed of ["Workshop", "Market", "Town Hall"]) expect(text).not.toContain(closed);
  });
});

test.describe("earth face", () => {
  test("DoD 3 · earth: an item opens its place in the village; a closed place is not in the face", async ({ page }) => {
    await seedPlayer(page, { mission: true });
    await openVillage(page);
    await openFace(page, "earth", "Work");
    // Mission saved: the Workshop is open; the Market (a saved offer) and Town Hall (the first sale) are not.
    await expect(items(page, "Work")).toHaveCount(1);
    const text = (await faceOf(page, "Work").innerText()).replace(/\s+/g, " ");
    expect(text).toContain("Workshop");
    for (const closed of ["Market", "Town Hall", "Opens when"]) expect(text).not.toContain(closed);
    await faceOf(page, "Work").locator("[data-place='workshop']").click();
    await expect(page).toHaveURL(/\/village\/workshop$/);
    await expect(dialogOf(page)).toHaveCount(0);
  });
});

test.describe("phone, 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  const cases = [
    { element: "fire" as const, name: "Growth" as const, seed: false },
    { element: "earth" as const, name: "Work" as const, seed: true },
  ];

  for (const c of cases) {
    test(`DoD 4 · no overlap at 390x844: ${c.element} face`, async ({ page }) => {
      if (c.seed) await seedPlayer(page, { mission: true });
      await openVillage(page);
      await glyphOf(page).tap();
      await expect(dialogOf(page)).toBeVisible();
      await page.waitForTimeout(800);
      await page.getByRole("button", { name: "Back to the instrument" }).click();
      await page.getByTestId(`instrument-body-${c.element}`).getByRole("button").tap();
      await expect(faceOf(page, c.name)).toBeVisible();
      await page.waitForTimeout(800);

      const panel = await box(faceOf(page, c.name));
      expect(panel.left, "panel left edge").toBeGreaterThanOrEqual(0);
      expect(panel.right, "panel right edge").toBeLessThanOrEqual(390);
      expect(panel.top, "panel top edge").toBeGreaterThanOrEqual(0);
      expect(panel.bottom, "panel bottom edge").toBeLessThanOrEqual(844);

      // Not over the glyph, and not over the chat pill.
      expect(intersects(panel, await box(glyphOf(page))), "face overlaps the glyph").toBe(false);
      const chat = page.getByRole("button", { name: "Chat with us" });
      if (await chat.isVisible()) expect(intersects(panel, await box(chat)), "face overlaps the chat pill").toBe(false);

      // Items do not overlap each other, stay inside the panel, and their text does not spill out of its box.
      const list = items(page, c.name);
      // The face reads its own save, so its items arrive a moment after the panel does.
      await expect(list.first()).toBeVisible();
      const n = await list.count();
      expect(n).toBeGreaterThan(0);
      const boxes: Box[] = [];
      for (let i = 0; i < n; i++) {
        const b = await box(list.nth(i));
        expect(b.left, `item ${i} left`).toBeGreaterThanOrEqual(panel.left);
        expect(b.right, `item ${i} right`).toBeLessThanOrEqual(panel.right);
        expect(b.bottom - b.top, `item ${i} is a 44 px target`).toBeGreaterThanOrEqual(44);
        const spills = await list.nth(i).evaluate((el) => el.scrollWidth > el.clientWidth + 1);
        expect(spills, `item ${i} text spills`).toBe(false);
        boxes.push(b);
      }
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(intersects(boxes[i], boxes[j]), `items ${i} and ${j} overlap`).toBe(false);
    });
  }
});

test("DoD 5 · axe: zero serious on the fire and earth faces", async ({ page }, info) => {
  await seedPlayer(page, { mission: true });
  await openVillage(page);
  // The same two pre-existing hits as instrument.spec.ts (moon-clock dial, language chip), unrelated to the faces.
  const run = async () =>
    (await new AxeBuilder({ page }).exclude(".bio-clock__dial").exclude("button[aria-label='Language']").analyze()).violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
  const lines = (vs: Awaited<ReturnType<typeof run>>) => vs.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);

  await openFace(page, "fire", "Growth");
  const fire = await run();
  if (fire.length) await info.attach("axe-fire.json", { body: JSON.stringify(fire, null, 2), contentType: "application/json" });
  expect(lines(fire)).toEqual([]);

  await faceOf(page, "Growth").getByRole("button", { name: "Back to the instrument" }).click();
  await page.waitForTimeout(800);
  await page.getByTestId("instrument-body-earth").getByRole("button").click();
  await expect(faceOf(page, "Work")).toBeVisible();
  await page.waitForTimeout(800);
  const earth = await run();
  if (earth.length) await info.attach("axe-earth.json", { body: JSON.stringify(earth, null, 2), contentType: "application/json" });
  expect(lines(earth)).toEqual([]);
});
