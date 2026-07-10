#!/usr/bin/env node
/**
 * Syncs selected corpus docs into the `founder_corpus_docs` table so the
 * Telegram founder chat (equilibrium-telegram-bot) can read them.
 *
 * Git stays canonical — this is a machine-readable mirror, full text only,
 * no compressions. Re-run after meaningful corpus edits.
 *
 * Writes go through the `sync-founder-corpus` edge function (the project is
 * Lovable-managed, so there is no local service_role key). Auth is the
 * CORPUS_SYNC_TOKEN edge-function secret, passed as x-sync-token.
 *
 * Usage:
 *   CORPUS_SYNC_TOKEN=... node scripts/sync-founder-corpus.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..");
const FN_URL =
  process.env.SYNC_FN_URL ??
  "https://jypjttotvastdhanwvrx.supabase.co/functions/v1/sync-founder-corpus";

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

const TOKEN = process.env.CORPUS_SYNC_TOKEN;
if (!TOKEN) {
  console.error("Set CORPUS_SYNC_TOKEN (the sync-founder-corpus edge fn secret).");
  process.exit(1);
}

const docs = [];
for (const doc of DOCS) {
  const abs = join(REPO_ROOT, doc.path);
  if (!existsSync(abs)) {
    console.warn(`✗ missing, skipped: ${doc.path}`);
    continue;
  }
  let content = readFileSync(abs, "utf8");
  if (doc.tail && content.length > doc.tail) content = content.slice(-doc.tail);
  if (content.length > MAX_CHARS) content = content.slice(0, MAX_CHARS);
  docs.push({ path: doc.path, title: doc.title, content });
}

const res = await fetch(FN_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-sync-token": TOKEN },
  body: JSON.stringify({ docs }),
});
const result = await res.json();
if (!res.ok) {
  console.error(`✗ sync failed: HTTP ${res.status}`, result);
  process.exit(1);
}
for (const path of result.synced ?? []) console.log(`✓ synced ${path}`);
for (const err of result.errors ?? []) console.error(`✗ ${err}`);
console.log("Corpus mirror synced.");
