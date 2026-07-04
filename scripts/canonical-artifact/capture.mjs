import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const outDir = join(root, "docs", "assets", "canonical-artifact", "renders");
mkdirSync(outDir, { recursive: true });

const url = process.env.CANONICAL_ARTIFACT_URL || "http://127.0.0.1:5177/docs/assets/canonical-artifact/viewer.html";
const browser = await chromium.launch({
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const results = [];

async function capture(name, viewport, targetUrl = url) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__artifactReady === true, null, { timeout: 15000 });
  await page.waitForTimeout(600);
  const screenshot = join(outDir, `${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  const canvasCheck = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    const coords = [
      [0.5, 0.5],
      [0.38, 0.43],
      [0.62, 0.43],
      [0.38, 0.62],
      [0.62, 0.62],
      [0.5, 0.28],
      [0.5, 0.72],
    ];
    const samples = coords.map(([x, y]) => {
      const pixels = new Uint8Array(4);
      gl.readPixels(Math.floor(canvas.width * x), Math.floor(canvas.height * y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      return Array.from(pixels);
    });
    return {
      width: canvas.width,
      height: canvas.height,
      samples,
      nonBlank: samples.some((sample) => sample.slice(0, 3).some((value) => value < 245)),
    };
  });
  await page.close();
  results.push({ name, viewport, screenshot, canvasCheck, errors });
}

await capture("canonical-artifact-three-v3-anatomy-desktop", { width: 1440, height: 1200 }, `${url}?mode=anatomy`);
await capture("canonical-artifact-three-v3-anatomy-mobile", { width: 390, height: 844 }, `${url}?mode=anatomy`);
await browser.close();

const report = `# Three.js Render Capture

Generated: ${new Date().toISOString()}

URL: ${url}

Mode: anatomy

| Capture | Viewport | Screenshot | Canvas | Console |
|---|---|---|---|---|
${results.map((result) => `| ${result.name} | ${result.viewport.width}x${result.viewport.height} | \`${result.screenshot.replace(`${root}/`, "")}\` | ${result.canvasCheck.width}x${result.canvasCheck.height}, samples=${result.canvasCheck.samples.map((sample) => sample.join(",")).join(" / ")}, nonBlank=${result.canvasCheck.nonBlank} | ${result.errors.length ? result.errors.join("<br>") : "clean"} |`).join("\n")}
`;

writeFileSync(join(outDir, "three_capture_report.md"), report);
console.log(JSON.stringify(results, null, 2));
