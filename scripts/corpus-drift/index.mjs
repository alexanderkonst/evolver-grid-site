#!/usr/bin/env node
// Corpus Drift Check v0.1
// Catches rassinkhron between code (UI/commerce source of truth) and corpus
// (semantic/positioning source of truth).
//
// Usage:
//   node scripts/corpus-drift/index.mjs           # human-readable
//   node scripts/corpus-drift/index.mjs --md      # also writes corpus-drift-report.md
//   node scripts/corpus-drift/index.mjs --json    # JSON to stdout, nothing else
//
// Exit codes:
//   0 = all green
//   1 = drift detected
//   2 = reader failure (source file missing / unparseable)

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { readPlaybookSteps, readCanvasV3Table } from "./sources.mjs";
import * as pricesCheck from "./checks/prices.mjs";
import * as subtitlesCheck from "./checks/subtitles.mjs";
import * as bundlesCheck from "./checks/bundles.mjs";
import { formatReport } from "./reporter.mjs";

const CHECKS = [pricesCheck, subtitlesCheck, bundlesCheck];

function main() {
  const args = new Set(process.argv.slice(2));
  const emitMarkdown = args.has("--md");
  const emitJson = args.has("--json");

  let code, canvas;
  try {
    code = readPlaybookSteps();
    canvas = readCanvasV3Table();
  } catch (err) {
    if (emitJson) {
      console.log(JSON.stringify({ ok: false, stage: "read", error: String(err) }));
    } else {
      console.error(`✖ Reader failure: ${err.message}`);
    }
    process.exit(2);
  }

  const ctx = { code, canvas };
  const results = CHECKS.map((c) => c.run(ctx));

  const report = formatReport(results);

  if (emitJson) {
    console.log(
      JSON.stringify({ ok: report.passed, failCount: report.failCount, results }, null, 2)
    );
  } else {
    console.log(report.stdout);
  }

  if (emitMarkdown) {
    const outPath = join(import.meta.dirname, "..", "..", "corpus-drift-report.md");
    writeFileSync(outPath, report.markdown, "utf8");
    if (!emitJson) console.log(`\n→ Wrote ${outPath}`);
  }

  process.exit(report.passed ? 0 : 1);
}

main();
