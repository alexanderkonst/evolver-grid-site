#!/usr/bin/env node
/**
 * Publishes the holonic-seeing AI skill as a downloadable public file.
 *
 * Source of truth is `.agent/skills/holonic-seeing/SKILL.md` (hand-maintained).
 * This script copies it verbatim to `public/skills/holonic-seeing.md` at build
 * time and appends an attribution footer so anyone who downloads the file
 * carries the license terms with it.
 *
 * Wiring:
 *   - npm `prebuild` (and `predev`) hooks run this before the app builds
 *   - output lands at `public/skills/holonic-seeing.md`
 *   - `src/pages/IntegralTheoryUpgrade1.tsx` links to `/skills/holonic-seeing.md`
 *
 * Keeping this as a generated copy (rather than hand-duplicating the file)
 * prevents drift between the skill Claude Code actually uses and the file
 * the public downloads.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..");
const SOURCE_PATH = join(REPO_ROOT, ".agent", "skills", "holonic-seeing", "SKILL.md");
const OUT_PATH = join(REPO_ROOT, "public", "skills", "holonic-seeing.md");

const ATTRIBUTION_FOOTER = `

---
© 2026 Aleksandr Konstantinov · CC BY-NC-SA 4.0
Source: findyourtoptalent.com/27
`;

function main() {
  const source = readFileSync(SOURCE_PATH, "utf-8");
  const published = source.replace(/\s*$/, "") + ATTRIBUTION_FOOTER;

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, published);
  console.log(`✓ wrote ${OUT_PATH}`);
}

main();
