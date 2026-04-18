#!/usr/bin/env node
/**
 * Emits a JSON snapshot of the CRM state for the admin dashboard.
 *
 * The CRM lives in `docs/09-logs/broadcast_tracker.md` (human-edited). The
 * parser at `scripts/sources/broadcast-tracker.mjs` turns it into structured
 * data. That parser is Node-only (uses fs). To expose it to the React
 * dashboard without reimplementing the parser in the UI layer (explicit hard
 * constraint in the Phase-1 brief), we generate a small JSON snapshot at
 * build time and commit a fresh copy.
 *
 * Wiring:
 *   - npm `prebuild` hook runs this before `vite build`
 *   - output lands at `src/generated/crm-snapshot.json`
 *   - `src/pages/admin/Dashboard.tsx` imports it statically
 *
 * If the parser fails for any reason, we still emit a well-formed file with
 * an `error` field so the dashboard can render gracefully.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { readBroadcastTracker } from "./sources/broadcast-tracker.mjs";

const REPO_ROOT = join(import.meta.dirname, "..");
const OUT_PATH = join(REPO_ROOT, "src", "generated", "crm-snapshot.json");

function main() {
  mkdirSync(dirname(OUT_PATH), { recursive: true });

  let payload;
  try {
    const data = readBroadcastTracker();
    payload = {
      generated_at: new Date().toISOString(),
      version: data.version ?? null,
      contactsCount: (data.contacts ?? []).length,
      stageDistribution: data.stageDistribution ?? {},
      segmentDistribution: data.segmentDistribution ?? {},
      energyLeakCount: data.energyLeakCount ?? 0,
      cashReceivedUsd: data.cashReceivedUsd ?? null,
      revShareContractsUsd: data.revShareContractsUsd ?? null,
      upcomingEvents: (data.upcomingEvents ?? []).slice(0, 5),
      openItemsCount: (data.openItems ?? []).filter((x) => !x.done).length,
    };
  } catch (err) {
    payload = {
      generated_at: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
      contactsCount: 0,
      stageDistribution: {},
      segmentDistribution: {},
      energyLeakCount: 0,
      cashReceivedUsd: null,
      revShareContractsUsd: null,
      upcomingEvents: [],
      openItemsCount: 0,
    };
  }

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");
  const suffix = payload.error ? ` (fallback: ${payload.error})` : "";
  console.log(`✓ wrote ${OUT_PATH}${suffix}`);
}

main();
