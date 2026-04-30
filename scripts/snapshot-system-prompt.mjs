#!/usr/bin/env node
// Snapshot the current premium system prompt (v5.0) into /system-prompts/.
// Run when a new version ships. Each version becomes a frozen file the
// codebase can never silently drift away from.
//
// Usage: node scripts/snapshot-system-prompt.mjs <version>
// Example: node scripts/snapshot-system-prompt.mjs 5.0

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const version = process.argv[2];
if (!version) {
  console.error("usage: node scripts/snapshot-system-prompt.mjs <version>");
  process.exit(1);
}

const sourcePath = path.join(repoRoot, "src/modules/ai-os/AiOsPage.tsx");
const file = fs.readFileSync(sourcePath, "utf-8");

// Extract a backtick-delimited content field for the prompt with the given id.
// Walks the file char-by-char from the prompt's id to find the matching close
// backtick, accounting for escaped backticks inside the template literal.
function extractContent(id) {
  const idMarker = `id: "${id}"`;
  const idx = file.indexOf(idMarker);
  if (idx === -1) throw new Error(`prompt id="${id}" not found in ${sourcePath}`);

  const contentStart = file.indexOf("content: `", idx);
  if (contentStart === -1) throw new Error(`content field not found for id="${id}"`);

  const start = contentStart + "content: `".length;
  let i = start;
  while (i < file.length) {
    const ch = file[i];
    if (ch === "\\") { i += 2; continue; }
    if (ch === "`") break;
    i++;
  }
  if (i >= file.length) throw new Error(`unterminated content for id="${id}"`);

  return file.substring(start, i);
}

// Match the assembly used in META_PROMPTS for "meta-cognition-premium".
const COMPONENT_IDS = [
  "vibeporting",
  "ai-self-awareness",
  "boost-intel",
  "evolutionary-mastery",
  "moonshot",
];

const HOLONIC_SEEING_LAYER = `PREMIUM HOLONIC SEEING LAYER:

In addition to the standard premium enhancements, apply the 27-perspective holonic analysis to your output:

For EVERY generation, evaluation, or iteration you produce, verify against this quality gate:

□ UL-Essence: Does this feel true from the inside? (The soul test)
□ UR-Essence: Does this work mechanically? (The engineering test)
□ LL-Essence: Would the tribe recognize themselves in this? (The resonance test)
□ LR-Essence: Does this serve the system at scale? (The architecture test)
□ 13th Perspective: Does the CENTER hold? Does the whole see something the parts missed?

DEPTH CHECK:
□ Have I addressed Essence (what IS this) before jumping to Implications (what to fix)?
□ Have I addressed Significance (why this matters) before suggesting changes?
□ Have I balanced all 4 quadrants, not just UR (mechanics) and LR (systems)?

THE 27TH — CRYSTALLIZATION CHECK:
□ After all seeing is complete, have I named the ONE irreversible action that makes this land in reality?
□ Is it specific enough to execute immediately?
□ Does it feel inevitable — like all 26 perspectives were pointing here?

If any checkbox fails, revise before outputting. The premium tier guarantees 27-perspective seeing — every angle at every depth, culminating in crystallized action.`;

const components = COMPONENT_IDS.map(extractContent);
const assembled = components.join("\n\n---\n\n") + "\n\n---\n\n" + HOLONIC_SEEING_LAYER;

const outDir = path.join(repoRoot, "system-prompts", `v${version}`);
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, "system-prompt.md");
fs.writeFileSync(outFile, assembled);

const manifest = {
  version,
  snapshotted_at: new Date().toISOString(),
  source_file: "src/modules/ai-os/AiOsPage.tsx",
  components: COMPONENT_IDS,
  char_count: assembled.length,
  line_count: assembled.split("\n").length,
};
fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);

console.log(`✓ system-prompt v${version} snapshotted`);
console.log(`  → ${path.relative(repoRoot, outFile)}`);
console.log(`  ${manifest.line_count} lines · ${manifest.char_count} chars · ${COMPONENT_IDS.length} components + holonic layer`);
