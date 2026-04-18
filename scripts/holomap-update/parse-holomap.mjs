// Parse the current state of the morphogenetic holomap — enough to know
// (a) when it was last updated, (b) what the center reading is,
// (c) where the ► markers sit per perspective.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const HOLOMAP_PATH = join(REPO_ROOT, "docs", "02-strategy", "morphogenetic_holomap.md");

export function readHolomap() {
  const src = readFileSync(HOLOMAP_PATH, "utf8");

  const updatedMatch = src.match(/Updated:\s*([A-Za-z]+\s+\d+,\s+\d{4})/);
  const centerMatch = src.match(/Center Reading:\s*(.+?)\s*\*/);
  const holonMatch = src.match(/Holon:\s*(.+?)\s*\*/);

  // Perspectives are #### headings like "P1 · UL-Essence — Founder Consciousness"
  const perspectiveRegex = /^####\s+P(\d+)\s*·\s*([^—]+)—\s*(.+)$/gm;
  const perspectives = [];
  let m;
  while ((m = perspectiveRegex.exec(src)) !== null) {
    const number = Number(m[1]);
    const quadrant = m[2].trim();
    const name = m[3].trim();

    // Find current ► marker in the 500 chars after this heading
    const after = src.slice(m.index, m.index + 1200);
    const currentStageMatch = after.match(/►\s*\*?\*?([^*\n|]+?)\*?\*?(?:\s*\||\s*\n|$)/);

    perspectives.push({
      number,
      quadrant,
      name,
      currentStage: currentStageMatch ? currentStageMatch[1].trim() : "unknown",
    });
  }

  return {
    path: HOLOMAP_PATH,
    updated: updatedMatch ? updatedMatch[1] : null,
    centerReading: centerMatch ? centerMatch[1].trim() : null,
    holon: holonMatch ? holonMatch[1].trim() : null,
    perspectives,
  };
}
