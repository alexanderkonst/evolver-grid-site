// Readers for the two drift sources: PLAYBOOK_STEPS (code) and Value Ladder v3.0 (canvas).
// Zero deps: regex parsing of files we own.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");

const PLAYBOOK_STEPS_PATH = join(REPO_ROOT, "src", "data", "playbookSteps.ts");
const CANVAS_PATH = join(
  REPO_ROOT,
  "docs",
  "02-strategy",
  "unique-businesses",
  "alexanders_unique_business.md"
);

/**
 * Parse `PLAYBOOK_STEPS` from the TS source.
 * Returns: [{ number, subtitle, price, bundleWith }]
 */
export function readPlaybookSteps() {
  const src = readFileSync(PLAYBOOK_STEPS_PATH, "utf8");

  // Find the PLAYBOOK_STEPS array body.
  const arrayMatch = src.match(
    /export\s+const\s+PLAYBOOK_STEPS\s*:\s*PlaybookStep\[\]\s*=\s*\[([\s\S]*)\];\s*$/m
  );
  if (!arrayMatch) {
    throw new Error("Could not locate PLAYBOOK_STEPS array");
  }

  const body = arrayMatch[1];

  // Split on top-level step objects. Steps begin with `  {` and close on `  },`.
  // We bracket-count to respect nested objects (substeps).
  const steps = [];
  let depth = 0;
  let current = "";
  let capturing = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (!capturing && ch === "{") {
      capturing = true;
      depth = 1;
      current = "{";
      continue;
    }
    if (capturing) {
      current += ch;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          steps.push(current);
          current = "";
          capturing = false;
        }
      }
    }
  }

  return steps.map(parseStepBlock);
}

/**
 * Extract { number, subtitle, price, bundleWith } from a single step block.
 * We only look at top-level keys (not substeps.number).
 */
function parseStepBlock(block) {
  // Top-level keys are at two-space indent:  "  number: 1,"
  const numberMatch = block.match(/^\s{4}number:\s*(\d+)/m);
  const subtitleMatch = block.match(/^\s{4}subtitle:\s*"([^"]*)"/m);
  const priceMatch = block.match(/^\s{4}price:\s*"([^"]*)"/m);
  const bundleMatch = block.match(/^\s{4}bundleWith:\s*\[([^\]]*)\]/m);

  const bundleWith = bundleMatch
    ? bundleMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
    : undefined;

  return {
    number: numberMatch ? Number(numberMatch[1]) : null,
    subtitle: subtitleMatch ? subtitleMatch[1] : null,
    price: priceMatch ? priceMatch[1] : undefined,
    bundleWith,
  };
}

/**
 * Parse the Value Ladder v3.0 mapping table from the canvas.
 * Returns: [{ number, subtitle, container, price }]
 */
export function readCanvasV3Table() {
  const src = readFileSync(CANVAS_PATH, "utf8");

  // Locate the section header
  const sectionStart = src.indexOf("## Value Ladder v3.0 — 7-Step Playbook Mapping");
  if (sectionStart === -1) {
    throw new Error("Could not locate 'Value Ladder v3.0' section in canvas");
  }
  const sectionEnd = src.indexOf("\n## ", sectionStart + 1);
  const section = src.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);

  // Table rows: `| **1** | Name Your Top Talent | Free ZoG reveal | **Free** | ... |`
  const rowRegex =
    /^\|\s*\*\*(\d)\*\*\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;

  const rows = [];
  let m;
  while ((m = rowRegex.exec(section)) !== null) {
    rows.push({
      number: Number(m[1]),
      subtitle: cleanCell(m[2]),
      container: cleanCell(m[3]),
      price: cleanCell(m[4]),
    });
  }

  if (rows.length === 0) {
    throw new Error("Canvas v3.0 table found but no rows parsed — table format may have changed");
  }

  return rows;
}

function cleanCell(raw) {
  return raw
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
