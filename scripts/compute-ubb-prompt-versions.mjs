#!/usr/bin/env node
/**
 * Recompute the UBB PROMPT_VERSION map.
 *
 * The backend (Deno edge functions) computes PROMPT_VERSION at module load
 * directly from ARTIFACT_CONFIGS in supabase/functions/_shared/ubb-prompts.ts.
 * The frontend (Vite) cannot easily import that file (large bundle bloat
 * from the prompt strings), so it ships a hardcoded mirror at
 *   src/modules/unique-business-builder/promptVersions.ts
 *
 * This script keeps the two in sync. Run it whenever any
 * ARTIFACT_CONFIGS[key].generationGuidance, .outputSchema, or
 * .specificityCriteria changes:
 *
 *   node scripts/compute-ubb-prompt-versions.mjs
 *
 * It dumps the current hashes (via Deno, which can import the .ts file
 * natively) and writes them into the frontend mirror. Commit the diff.
 *
 * Requires Deno on PATH (brew install deno).
 */

import { execSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FRONTEND_FILE = join(
  ROOT,
  "src/modules/unique-business-builder/promptVersions.ts"
);
const SHARED_FILE = join(
  ROOT,
  "supabase/functions/_shared/ubb-prompts.ts"
);

function dumpFromDeno() {
  const deno = execSync(
    `deno eval --quiet "import { PROMPT_VERSION } from '${SHARED_FILE}'; console.log(JSON.stringify(PROMPT_VERSION));"`,
    { cwd: ROOT, encoding: "utf8" }
  );
  return JSON.parse(deno.trim());
}

function emitFrontendFile(map) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = Object.entries(map)
    .map(([k, v]) => `  ${k}: "${v}",`)
    .join("\n");

  const body = `/**
 * Unique Business Builder — frontend mirror of PROMPT_VERSION.
 *
 * GENERATED. Do not hand-edit.
 *
 * Re-generate with:
 *   node scripts/compute-ubb-prompt-versions.mjs
 *
 * The backend computes the same map at module load in
 * supabase/functions/_shared/ubb-prompts.ts. This mirror exists so the
 * frontend can detect "prompt-stale" artifacts (DB column
 * \`prompt_version_at_lock\` ≠ current PROMPT_VERSION[key]) without
 * importing the full prompt corpus into the Vite bundle.
 *
 * Last regenerated: ${today}.
 */

import type { ArtifactKey } from "./types";

export const PROMPT_VERSION: Record<ArtifactKey, string> = {
${entries}
};
`;
  writeFileSync(FRONTEND_FILE, body);
  return body;
}

function main() {
  console.log("Computing PROMPT_VERSION via Deno…");
  const map = dumpFromDeno();
  const keys = Object.keys(map).sort();
  console.log(`Got ${keys.length} keys.`);
  emitFrontendFile(map);
  console.log(`Wrote ${FRONTEND_FILE}`);
  console.log("\nDone. Review the diff and commit.");
}

main();
