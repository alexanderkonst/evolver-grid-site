#!/usr/bin/env node
/**
 * Syncs selected corpus docs into the `founder_corpus_docs` table so the
 * Telegram founder chat (equilibrium-telegram-bot) can read them.
 *
 * Git stays canonical — this is a machine-readable mirror, full text only,
 * no compressions. Re-run after meaningful corpus edits (or wire into a
 * deploy step later).
 *
 * Usage:
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/sync-founder-corpus.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..");

// path (repo-relative) → { title, tail?: chars-from-end for long logs }
const DOCS = [
  { path: "docs/02-strategy/roadmap.md", title: "Roadmap — living navigation instrument" },
  { path: "docs/09-logs/session_log.md", title: "Session log (latest tail)", tail: 60_000 },
  { path: "docs/02-strategy/morphogenetic_holomap.md", title: "Morphogenetic Navigation Holo Map", tail: 60_000 },
  { path: "docs/02-strategy/unique-businesses/alexanders_unique_business.md", title: "Alexander's Unique Business (canonical)" },
  { path: "docs/02-strategy/strategic_crm_outreach_tracker.md", title: "Strategic CRM & outreach tracker" },
  { path: "docs/04-products/living_project_holograph.md", title: "Living Project Holograph / Founder Cockpit" },
];

const MAX_CHARS = 120_000; // per-doc hard cap

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

async function upsert(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/founder_corpus_docs`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`${row.path}: HTTP ${res.status} ${await res.text()}`);
}

for (const doc of DOCS) {
  const abs = join(REPO_ROOT, doc.path);
  if (!existsSync(abs)) {
    console.warn(`✗ missing, skipped: ${doc.path}`);
    continue;
  }
  let content = readFileSync(abs, "utf8");
  if (doc.tail && content.length > doc.tail) content = content.slice(-doc.tail);
  if (content.length > MAX_CHARS) content = content.slice(0, MAX_CHARS);
  await upsert({
    path: doc.path,
    title: doc.title,
    content,
    updated_at: new Date().toISOString(),
  });
  console.log(`✓ synced ${doc.path} (${content.length} chars)`);
}
console.log("Corpus mirror synced.");
