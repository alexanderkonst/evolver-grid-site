import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const artifactDir = join(root, "docs", "assets", "canonical-artifact");
const outDir = join(artifactDir, "renders");
const url = process.env.CANONICAL_REVIEW_PLATE_URL || "http://127.0.0.1:5177/docs/assets/canonical-artifact/review_plate.html";
const screenshot = join(outDir, "canonical-artifact-review-plate.png");

const browser = await chromium.launch({
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
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
    complete: image.complete,
  }));
});

await browser.close();

const report = `# Review Plate Capture

Generated: ${new Date().toISOString()}

URL: ${url}

| Item | Value |
|---|---|
| Screenshot | \`docs/assets/canonical-artifact/renders/canonical-artifact-review-plate.png\` |
| Viewport | 1600x1000 |
| Images | ${imageAudit.length} |
| Image load status | ${imageAudit.every((image) => image.complete && image.naturalWidth > 0) ? "pass" : "fail"} |
| Console | ${errors.length ? errors.join("<br>") : "clean"} |

## Image Audit

| Source | Natural Size | Status |
|---|---:|---|
${imageAudit.map((image) => `| \`${image.src}\` | ${image.naturalWidth}x${image.naturalHeight} | ${image.complete && image.naturalWidth > 0 ? "Pass" : "Fail"} |`).join("\n")}
`;

writeFileSync(join(outDir, "review_plate_capture_report.md"), report);
console.log(JSON.stringify({
  screenshot,
  report: join(outDir, "review_plate_capture_report.md"),
  imageAudit,
  errors,
}, null, 2));
