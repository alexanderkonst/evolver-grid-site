import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Your AI Console v1, the Phoenix chain (docs/specs/your-ai-console/console-v1.md), guest view.
 * No sign-in and no model call: a guest sees the five buttons and the locked lines, and pressing
 * button 1 gives the sign-in line without a single request to an edge function.
 *   PREVIEW_URL=http://127.0.0.1:8080 npx playwright test tests/console.spec.ts
 */

const LABELS = [
  "Your goal, clear and grounded",
  "The case for your goal, with its risks",
  "Your goal, version 2",
  "What is weak in your goal, and how to fix it",
  "What remains after the Phoenix burns",
];

async function openConsole(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("fytt:ai-os-visited", "true");
    window.localStorage.setItem("fytt:your-ai-tour-seen", "true");
  });
  const res = await page.goto("/village", { waitUntil: "load" });
  expect(res?.status()).toBeLessThan(400);
  const glyph = page.getByTestId("instrument-glyph");
  await expect(glyph).toBeVisible({ timeout: 20_000 });
  await glyph.click();
  await expect(page.getByRole("dialog", { name: "Your instrument" })).toBeVisible();
  await page.waitForTimeout(800);
  await page.getByTestId("instrument-body-air").click();
  await page.getByRole("tab", { name: "Console" }).click();
  await expect(page.getByTestId("console-panel")).toBeVisible();
}

test.describe("Console, guest view", () => {
  test("DoD 1 · five buttons, each label is the result it gives", async ({ page }, info) => {
    await openConsole(page);
    const panel = page.getByTestId("console-panel");
    // Button 1 is a button; 2 to 5 are closed groups named by their label.
    await expect(panel.getByRole("button", { name: LABELS[0] })).toBeVisible();
    for (const label of LABELS.slice(1)) await expect(panel.getByRole("group", { name: label })).toBeVisible();
    await page.screenshot({ path: `artifacts/screenshots/${info.project.name}/console-v1-guest.png` });
  });

  test("DoD 4 · buttons 2 to 5 are locked and say «Opens when… Inside…»", async ({ page }) => {
    await openConsole(page);
    const panel = page.getByTestId("console-panel");
    await expect(panel.getByText("Opens when you have your goal. Inside: the case for it, with its risks.")).toBeVisible();
    for (const n of [2, 3, 4, 5]) await expect(page.getByTestId(`console-button-${n}`)).toHaveAttribute("data-state", "locked");
    await expect(page.getByTestId("console-button-1")).toHaveAttribute("data-state", "open");
  });

  test("DoD 10 · a guest pressing button 1 gets the sign-in line and no edge-function request", async ({ page }) => {
    const calls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/functions/v1/your-ai-console")) calls.push(r.url());
    });
    await openConsole(page);
    await page.getByRole("button", { name: LABELS[0] }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Sign in to use the Console" })).toBeVisible();
    expect(calls).toEqual([]);
  });

  test("DoD 8 · axe finds nothing serious or critical in the Console tab", async ({ page }) => {
    await openConsole(page);
    const results = await new AxeBuilder({ page }).include("[data-testid='console-panel']").analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});

test.describe("phone, 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("DoD 8 · the Console fits 390 px: no sideways scroll, buttons at least 44 px tall", async ({ page }, info) => {
    await openConsole(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const panel = await page.getByTestId("console-panel").boundingBox();
    expect(panel && panel.x >= 0 && panel.x + panel.width <= 390).toBe(true);
    const first = await page.getByRole("button", { name: LABELS[0] }).boundingBox();
    expect(first?.height ?? 0).toBeGreaterThanOrEqual(44);
    for (const tab of ["Conversation", "Console"]) {
      const b = await page.getByRole("tab", { name: tab }).boundingBox();
      expect(b?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: `artifacts/screenshots/${info.project.name}/console-v1-390.png` });
  });
});

test("a suggestion replies in place and the conversation survives reload", async ({ page }) => {
  await page.route("**/functions/v1/library-advisor", async (route) => {
    const prompt: string = route.request().postDataJSON().prompt;
    await route.fulfill({
      json: {
        generatedText: JSON.stringify(
          prompt.includes("ME: Breathwork and activations")
            ? { text: "Let's start with one breath.", buttons: [] }
            : { text: "Try a short practice.", buttons: ["practice:breathwork"] },
        ),
      },
    });
  });

  await openConsole(page);
  await page.getByRole("tab", { name: "Conversation" }).click();
  const originalUrl = page.url();
  const input = page.getByRole("textbox", { name: "Write to Your AI…" });
  await expect(page.getByText("20 turns left today")).toBeVisible();
  await input.fill("I could use a way to settle.");
  await input.press("Enter");
  const suggestion = page.getByRole("button", { name: "Breathwork and activations", exact: true });
  await expect(page.getByRole("button", { name: "Go: Breathwork and activations" })).toBeVisible();
  await suggestion.click();
  await expect(page.getByRole("log")).toContainText("Let's start with one breath.");
  await expect(page).toHaveURL(originalUrl);
  await expect(page.getByText("18 turns left today")).toBeVisible();

  await page.reload();
  await page.getByTestId("instrument-glyph").click();
  await page.getByTestId("instrument-body-air").click();
  await expect(page.getByRole("log")).toContainText("Breathwork and activations");
  await expect(page.getByRole("log")).toContainText("Let's start with one breath.");
  await expect(page.getByText("18 turns left today")).toBeVisible();
});
