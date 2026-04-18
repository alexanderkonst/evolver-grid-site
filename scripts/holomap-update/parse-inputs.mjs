// Pull the input signals that feed holomap updates:
//   - roadmap.md: Current Status, This Week's Scope
//   - session_log.md: entries since the holomap's Updated: date
//   - alexanders_unique_business.md: current state header

import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const ROADMAP = join(REPO_ROOT, "docs", "02-strategy", "roadmap.md");
const SESSION_LOG = join(REPO_ROOT, "docs", "09-logs", "session_log.md");
const CANVAS_DIR = join(REPO_ROOT, "docs", "02-strategy", "unique-businesses");

export function readRoadmap() {
  const src = readFileSync(ROADMAP, "utf8");
  const lastUpdatedMatch = src.match(/Last updated:\s*([0-9-]+)/);
  const currentStatusMatch = src.match(/##\s+Current Status([\s\S]*?)(?=\n##\s)/);
  const weekScopeMatch = src.match(/##\s+🌑?\s*This Week's Scope[^\n]*([\s\S]*?)(?=\n##\s)/);

  return {
    lastUpdated: lastUpdatedMatch ? lastUpdatedMatch[1] : null,
    currentStatus: currentStatusMatch ? currentStatusMatch[1].trim() : null,
    weeklyScope: weekScopeMatch ? weekScopeMatch[1].trim() : null,
    path: ROADMAP,
  };
}

/**
 * Session-log entries newer than `sinceDate` (YYYY-MM-DD or "April 8, 2026").
 * Heuristic: we look at `## Day N — Weekday, Mon DD, YYYY` headings.
 */
export function readSessionLogSince(sinceDate) {
  const src = readFileSync(SESSION_LOG, "utf8");
  const dayRegex = /^##\s+Day\s+(\d+)[^\n]*?—\s*[A-Za-z]+,\s*([A-Za-z]+\s+\d+,\s*\d{4})/gm;

  const days = [];
  let match;
  const positions = [];
  while ((match = dayRegex.exec(src)) !== null) {
    positions.push({
      dayNumber: Number(match[1]),
      dateText: match[2],
      dateParsed: new Date(match[2]),
      start: match.index,
    });
  }

  // Compute bodies by slicing between positions
  for (let i = 0; i < positions.length; i++) {
    const end = i + 1 < positions.length ? positions[i + 1].start : src.length;
    positions[i].body = src.slice(positions[i].start, end);
  }

  const sinceParsed = sinceDate ? new Date(sinceDate) : null;

  return positions
    .filter((p) => !sinceParsed || p.dateParsed >= sinceParsed)
    .map((p) => ({
      dayNumber: p.dayNumber,
      date: p.dateText,
      // Don't include full body — too long. Grab first ~600 chars of distilled content.
      excerpt: p.body.slice(0, 600).replace(/\s+/g, " ").trim(),
    }));
}

export function readAlexanderCanvasHeader() {
  const src = readFileSync(
    join(CANVAS_DIR, "alexanders_unique_business.md"),
    "utf8"
  );
  // Grab first 80 lines — typically contains the current-state snapshot.
  const firstChunk = src.split("\n").slice(0, 100).join("\n");
  return { header: firstChunk, path: join(CANVAS_DIR, "alexanders_unique_business.md") };
}
