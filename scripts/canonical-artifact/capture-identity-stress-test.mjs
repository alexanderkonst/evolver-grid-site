import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const artifactDir = join(root, "docs", "assets", "canonical-artifact");
const outDir = join(artifactDir, "renders");
const url = process.env.CANONICAL_IDENTITY_STRESS_URL || "http://127.0.0.1:5177/docs/assets/canonical-artifact/identity_stress_test.html";
const screenshot = join(outDir, "canonical-artifact-identity-stress-test.png");

const browser = await chromium.launch({
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

const page = await browser.newPage({
  viewport: { width: 1600, height: 1180 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: screenshot, fullPage: true });

const imageAudit = await page.evaluate(() => {
  const images = Array.from(document.images);
  return images.map((image) => ({
    src: image.getAttribute("src"),
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    renderedWidth: Math.round(image.getBoundingClientRect().width),
    renderedHeight: Math.round(image.getBoundingClientRect().height),
    complete: image.complete,
  }));
});

await browser.close();

const report = `# Identity Stress Test Capture

Generated: ${new Date().toISOString()}

URL: ${url}

| Item | Value |
|---|---|
| Screenshot | \`docs/assets/canonical-artifact/renders/canonical-artifact-identity-stress-test.png\` |
| Viewport | 1600x1180 |
| Images | ${imageAudit.length} |
| Image load status | ${imageAudit.every((image) => image.complete && image.naturalWidth > 0) ? "pass" : "fail"} |
| Console | ${errors.length ? errors.join("<br>") : "clean"} |

## Stress-Test Score

| Test | Result | Note |
|---|---|---|
| 16 px favicon | Mixed | Original projection is too delicate at favicon scale. |
| 32 px favicon | Mixed | Original projection is recognizable but fragile. |
| 48 px favicon | Mixed | Original projection works only as a delicate projection. |
| 128 px icon | Pass | Projection and artifact both start reading. |
| App icon | Mixed | Original projection remains the only surfaced 2D mark while candidate work is halted. |
| Social avatar | Deferred | Physical artifact remains a hero/source object, not everyday avatar. |
| Website header | Mixed | Original projection remains usable but delicate. |
| Deck cover | Pass | Physical artifact works as hero object. |
| Monochrome | Mixed | Original projection needs a dedicated mono version rather than CSS filter. |

## Image Audit

| Source | Natural Size | Rendered Size | Status |
|---|---:|---:|---|
${imageAudit.map((image) => `| \`${image.src}\` | ${image.naturalWidth}x${image.naturalHeight} | ${image.renderedWidth}x${image.renderedHeight} | ${image.complete && image.naturalWidth > 0 ? "Pass" : "Fail"} |`).join("\n")}

## Required Next Move

Candidate figure work is halted. Do not surface rejected bold-field or medallion figures in app, header, favicon, or presentation UI. The full physical artifact should remain the hero/source object, not the everyday logo.
`;

writeFileSync(join(outDir, "identity_stress_test_capture_report.md"), report);
console.log(JSON.stringify({
  screenshot,
  report: join(outDir, "identity_stress_test_capture_report.md"),
  imageAudit,
  errors,
}, null, 2));
