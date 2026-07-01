#!/usr/bin/env node
/**
 * Emits a JSON snapshot of the Project Pulse log for future dashboard/admin use.
 *
 * The canonical narrative ledger lives in `docs/09-logs/project_pulse_log.md`.
 * This script keeps the first implementation markdown-native while creating a
 * structured build-time surface the app can import later.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..");
const LOG_PATH = join(REPO_ROOT, "docs", "09-logs", "project_pulse_log.md");
const OUT_PATH = join(REPO_ROOT, "src", "generated", "project-pulse-snapshot.json");

function parseYamlBlock(block) {
  const event = {};

  for (const line of block.split("\n")) {
    const match = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = rawValue.trim();
    event[key] = value.length ? value : null;
  }

  return event;
}

function readPulseEvents(markdown) {
  const logSection = markdown.split(/^## Log\s*$/m)[1] ?? "";
  const yamlBlocks = [...logSection.matchAll(/```yaml\n([\s\S]*?)```/g)];

  return yamlBlocks
    .map((match) => parseYamlBlock(match[1]))
    .filter((event) => event.title || event.what_happened);
}

function main() {
  mkdirSync(dirname(OUT_PATH), { recursive: true });

  let payload;

  try {
    const markdown = existsSync(LOG_PATH) ? readFileSync(LOG_PATH, "utf8") : "";
    const events = readPulseEvents(markdown);

    payload = {
      generated_at: new Date().toISOString(),
      source: "docs/09-logs/project_pulse_log.md",
      eventsCount: events.length,
      latestEvent: events[events.length - 1] ?? null,
      phaseShiftDistribution: events.reduce((acc, event) => {
        const key = event.phase_shift_significance ?? "unknown";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
      openNextActions: events
        .filter((event) => event.next_action)
        .map((event) => ({
          date: event.date ?? null,
          title: event.title ?? null,
          next_action: event.next_action,
        }))
        .slice(-10),
    };
  } catch (err) {
    payload = {
      generated_at: new Date().toISOString(),
      source: "docs/09-logs/project_pulse_log.md",
      error: err instanceof Error ? err.message : String(err),
      eventsCount: 0,
      latestEvent: null,
      phaseShiftDistribution: {},
      openNextActions: [],
    };
  }

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  const suffix = payload.error ? ` (fallback: ${payload.error})` : "";
  console.log(`✓ wrote ${OUT_PATH}${suffix}`);
}

main();
