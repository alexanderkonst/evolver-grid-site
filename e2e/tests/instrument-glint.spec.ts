import { expect, test, type Page } from "@playwright/test";

/**
 * Navigation instrument, WP6: the glint (docs/specs/navigation-instrument/architecture.md §7 phase 6;
 * sow.md WP6; #451).
 *
 * Self-contained like instrument-ritual.spec.ts: guest view, the instrument gated in by the
 * `fytt:ai-os-visited` latch, no sign-in and no backend write. The seeded save is the record Your House
 * writes when a body's face changed (`fytt:instrument-glints:guest`): here, fire only. The lit bodies are
 * already seen, so the ritual stays out of the way.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/instrument-glint.spec.ts
 */

const GLINT_KEY = "fytt:instrument-glints:guest";
const LIT_SEEN_KEY = "fytt:instrument-lit-seen:guest";

async function seedGlint(page: Page, glints: Record<string, true>) {
  await page.addInitScript(
    ([glintKey, seenKey, record]) => {
      window.localStorage.setItem("fytt:ai-os-visited", "true");
      window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
      window.localStorage.setItem(seenKey, JSON.stringify({ ether: true, water: true, fire: true, earth: true }));
      // Only on the first load: a reload must show what the player left, not the seed again.
      if (!window.sessionStorage.getItem("glint-seeded")) {
        window.sessionStorage.setItem("glint-seeded", "1");
        window.localStorage.setItem(glintKey, record);
      }
    },
    [GLINT_KEY, LIT_SEEN_KEY, JSON.stringify(glints)],
  );
}

async function openVillage(page: Page) {
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByTestId("instrument-glyph")).toBeVisible({ timeout: 20_000 });
}

const stored = (page: Page) => page.evaluate((k) => JSON.parse(window.localStorage.getItem(k) ?? "{}"), GLINT_KEY);
const dialog = (page: Page) => page.getByRole("dialog", { name: "Your instrument" });

test.describe("glint", () => {
  test("DoD 3 · opening the face clears the glint", async ({ page }, info) => {
    await seedGlint(page, { fire: true });
    await openVillage(page);

    // Closed: the glyph says one body glints, and no other.
    await expect(page.getByTestId("instrument-glyph")).toHaveAttribute("data-glints", "fire");

    // Open: the marker is on fire's body and on no other body.
    await page.getByTestId("instrument-glyph").click();
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByTestId("instrument-glint-fire")).toBeVisible();
    for (const other of ["water", "earth", "ether"]) await expect(page.getByTestId(`instrument-glint-${other}`)).toHaveCount(0);
    // The marker carries no text of its own: the change itself is written in Your House, never here.
    await expect(page.getByTestId("instrument-glint-fire")).toHaveText("");
    await info.attach("glint-open.png", { body: await page.screenshot(), contentType: "image/png" });

    // Opening the face clears it, in the save and on the instrument.
    await page.getByTestId("instrument-body-fire").getByRole("button").click();
    await expect(dialog(page)).toHaveAttribute("data-state", "face");
    await expect.poll(() => stored(page)).toEqual({});
    await expect(page.getByTestId("instrument-glyph")).toHaveAttribute("data-glints", "");

    // Back to the arc and after a reload: still gone.
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
    await page.reload({ waitUntil: "load" });
    await expect(page.getByTestId("instrument-glyph")).toHaveAttribute("data-glints", "");
    await page.getByTestId("instrument-glyph").click();
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByTestId("instrument-glint-fire")).toHaveCount(0);
  });

  test("DoD 2 · only the changed body glints, and only a lit one", async ({ page }) => {
    // Earth is not lit on a fresh guest village, so its glint is not shown; water's is.
    await seedGlint(page, { water: true, earth: true });
    await openVillage(page);
    await expect(page.getByTestId("instrument-glyph")).toHaveAttribute("data-glints", "water");
    await page.getByTestId("instrument-glyph").click();
    await expect(page.getByTestId("instrument-glint-water")).toBeVisible();
    await expect(page.locator('[data-testid^="instrument-glint-"]')).toHaveCount(1);
  });

  test("no glint, no marker anywhere", async ({ page }) => {
    await seedGlint(page, {});
    await openVillage(page);
    await expect(page.getByTestId("instrument-glyph")).toHaveAttribute("data-glints", "");
    await page.getByTestId("instrument-glyph").click();
    await expect(dialog(page)).toBeVisible();
    await expect(page.locator('[data-testid^="instrument-glint-"]')).toHaveCount(0);
  });

  test("reduced motion: the marker is static", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedGlint(page, { fire: true });
    await openVillage(page);
    await page.getByTestId("instrument-glyph").click();
    const marker = page.getByTestId("instrument-glint-fire");
    await expect(marker).toBeVisible();
    expect(await marker.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });
});
