import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const root = process.cwd();
const renderDir = join(root, "docs", "assets", "canonical-artifact", "renders");
const framesDir = join(renderDir, "motion-v1-frames");
mkdirSync(framesDir, { recursive: true });

const url = process.env.CANONICAL_ARTIFACT_URL || "http://127.0.0.1:5177/docs/assets/canonical-artifact/viewer.html?mode=anatomy";
const frameCount = Number(process.env.FRAME_COUNT || 96);
const fps = Number(process.env.FPS || 24);
const durationMs = Number(process.env.DURATION_MS || 8000);
const viewport = { width: 960, height: 960 };

const browser = await chromium.launch({
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});

const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (message) => {
  if (["error", "warning"].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__artifactReady === true && typeof window.__setArtifactTime === "function", null, { timeout: 15000 });

for (let frame = 0; frame < frameCount; frame += 1) {
  const ms = (frame / frameCount) * durationMs;
  await page.evaluate((time) => window.__setArtifactTime(time), ms);
  await page.screenshot({
    path: join(framesDir, `frame-${String(frame).padStart(4, "0")}.png`),
    fullPage: true,
  });
}

await browser.close();

const mp4Path = join(renderDir, "canonical-artifact-motion-v1.mp4");
const posterPath = join(renderDir, "canonical-artifact-motion-v1-poster.png");
execFileSync("ffmpeg", [
  "-y",
  "-framerate", String(fps),
  "-i", join(framesDir, "frame-%04d.png"),
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  mp4Path,
], { stdio: "pipe" });

execFileSync("cp", [join(framesDir, "frame-0024.png"), posterPath]);

const report = `# Motion Capture v1

Generated: ${new Date().toISOString()}

URL: ${url}

| Item | Value |
|---|---|
| Frames | ${frameCount} |
| FPS | ${fps} |
| Duration source | ${durationMs} ms |
| Viewport | ${viewport.width}x${viewport.height} |
| Frames dir | \`docs/assets/canonical-artifact/renders/motion-v1-frames/\` |
| MP4 | \`docs/assets/canonical-artifact/renders/canonical-artifact-motion-v1.mp4\` |
| Poster | \`docs/assets/canonical-artifact/renders/canonical-artifact-motion-v1-poster.png\` |
| Console | ${errors.length ? errors.join("<br>") : "clean"} |

## Intent

The animation preserves the canonical topology while making becoming visible:

- field shimmer changes over time,
- toroidal circulation rotates around the invariant,
- the central coherence breathes subtly,
- octahedron vertices, edges, faces, and axes do not change.
`;

writeFileSync(join(renderDir, "motion_capture_report.md"), report);
console.log(JSON.stringify({
  frameCount,
  fps,
  mp4Path,
  posterPath,
  report: join(renderDir, "motion_capture_report.md"),
  errors,
}, null, 2));
