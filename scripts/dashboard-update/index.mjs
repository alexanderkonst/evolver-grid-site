#!/usr/bin/env node
// Dashboard Update v1 — snapshot renderer.
//
// What it does:
//   Builds a dated markdown dashboard snapshot by reading from:
//     - docs/02-strategy/roadmap.md  (Current Status, This Week's Scope)
//     - docs/09-logs/broadcast_tracker.md  (CRM state, revenue, leaks, events)
//     - docs/09-logs/session_log.md  (recent daily entries)
//
//   Output lands at: docs/09-logs/dashboard/YYYY-MM-DD.md
//
//   This is the **precursor** to the `/admin/dashboard` page (Phase 1 of the
//   autonomous navigation loop). Until the Supabase view + UI ships, Sasha
//   and the AI both read this file to answer "what's the state of the project
//   today?" in a single glance.
//
// What it does NOT do:
//   - Touch roadmap or broadcast_tracker (read-only).
//   - Compute predictive metrics (leverage scores live in the directive engine, Phase 5).
//
// Usage:
//   npm run dashboard:update
//   node scripts/dashboard-update/index.mjs --stdout
//   node scripts/dashboard-update/index.mjs --date 2026-04-17

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { readBroadcastTracker } from "../sources/broadcast-tracker.mjs";
import { readRoadmap, readSessionLogSince } from "../holomap-update/parse-inputs.mjs";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const OUT_DIR = join(REPO_ROOT, "docs", "09-logs", "dashboard");

function parseArgs(argv) {
  const args = { stdout: false, date: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--stdout") args.stdout = true;
    else if (argv[i] === "--date") args.date = argv[++i];
  }
  return args;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date ?? todayIso();

  const roadmap = safe(readRoadmap);
  const crm = safe(readBroadcastTracker);

  // 14-day window of session-log entries for the activity section.
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const sinceIso = since.toISOString().slice(0, 10);
  const recentSessions = safe(() => readSessionLogSince(sinceIso)) ?? [];

  const md = render({ date, roadmap, crm, recentSessions, sinceIso });

  if (args.stdout) {
    console.log(md);
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `${date}.md`);
  writeFileSync(outPath, md, "utf8");

  console.log(`▸ Dashboard snapshot written`);
  console.log(`  → ${outPath}`);
  if (crm) {
    console.log(`  → ${crm.contacts.length} contacts · $${crm.cashReceivedUsd ?? 0} cash · ${crm.energyLeakCount} leaks`);
  }
  console.log(`  → ${recentSessions.length} session-log entries in last 14 days`);
}

function safe(fn) {
  try {
    return fn();
  } catch (err) {
    console.warn(`▸ Warning: ${fn.name || "reader"} failed: ${err.message}`);
    return null;
  }
}

function render({ date, roadmap, crm, recentSessions, sinceIso }) {
  const lines = [];
  const generatedAt = new Date().toISOString().replace("T", " ").slice(0, 16);

  lines.push(`# Dashboard — ${date}`);
  lines.push("");
  lines.push(`*Auto-generated: ${generatedAt} UTC · \`npm run dashboard:update\` · precursor to \`/admin/dashboard\` (Phase 1 of nav loop)*`);
  lines.push("");
  lines.push(`---`);
  lines.push("");

  // 1. Top-of-funnel numbers
  lines.push(`## 1. Headline Numbers`);
  lines.push("");
  if (crm) {
    const activeClients = crm.contacts.filter((c) => c.segments.includes("CLIENT")).length;
    const inConvo = crm.contacts.filter((c) => /in conversation/i.test(c.stage)).length;
    const build = crm.contacts.filter((c) => /build/i.test(c.stage)).length;
    const planned = crm.contacts.filter((c) => /^planned/i.test(c.stage)).length;

    lines.push(`| Metric | Value |`);
    lines.push(`|---|---|`);
    lines.push(`| **Cash received** | $${crm.cashReceivedUsd ?? 0} |`);
    lines.push(`| **Revenue-share contracts** | $${crm.revShareContractsUsd ?? 0} |`);
    lines.push(`| **Total contacts** | ${crm.contacts.length} |`);
    lines.push(`| **Active clients** | ${activeClients} |`);
    lines.push(`| **In Build** | ${build} |`);
    lines.push(`| **In Conversation** | ${inConvo} |`);
    lines.push(`| **Planned outreach** | ${planned} |`);
    lines.push(`| **Energy leaks flagged** | ${crm.energyLeakCount} |`);
    lines.push("");
  } else {
    lines.push(`(CRM unavailable — broadcast_tracker.md not parsed)`);
    lines.push("");
  }

  // 2. Pipeline — stage distribution
  lines.push(`## 2. Pipeline — Stage Distribution`);
  lines.push("");
  if (crm && Object.keys(crm.stageDistribution).length) {
    lines.push(`| Stage | Count |`);
    lines.push(`|---|---|`);
    const entries = Object.entries(crm.stageDistribution).sort((a, b) => b[1] - a[1]);
    for (const [stage, n] of entries) {
      lines.push(`| ${stage} | ${n} |`);
    }
    lines.push("");
  } else {
    lines.push(`(no stage data)`);
    lines.push("");
  }

  // 3. Revenue leak / boundaries
  lines.push(`## 3. Energy Leaks — Need Boundary`);
  lines.push("");
  if (crm && crm.energyLeaks.length) {
    lines.push(`| Name | Pattern | Boundary |`);
    lines.push(`|---|---|---|`);
    for (const l of crm.energyLeaks) {
      lines.push(`| **${l.name}** | ${l.pattern} | ${l.boundary} |`);
    }
    lines.push("");
  } else {
    lines.push(`*No leaks flagged.*`);
    lines.push("");
  }

  // 4. Open commitments
  lines.push(`## 4. Open Commitments`);
  lines.push("");
  if (crm && crm.openItems.length) {
    const open = crm.openItems.filter((i) => !i.done);
    const done = crm.openItems.filter((i) => i.done);
    lines.push(`**Open:** ${open.length} · **Done:** ${done.length}`);
    lines.push("");
    for (const item of open.slice(0, 15)) {
      lines.push(`- [ ] ${item.text}`);
    }
    if (open.length > 15) {
      lines.push(`- _…and ${open.length - 15} more in \`broadcast_tracker.md\`_`);
    }
    lines.push("");
  }

  // 5. Upcoming events
  lines.push(`## 5. Upcoming Events`);
  lines.push("");
  if (crm && crm.upcomingEvents.length) {
    for (const e of crm.upcomingEvents) {
      lines.push(`- **${e.date}** — ${e.event} (${e.participants})`);
    }
    lines.push("");
  } else {
    lines.push(`*No scheduled events.*`);
    lines.push("");
  }

  // 6. Roadmap — Current Status excerpt
  lines.push(`## 6. Roadmap Snapshot`);
  lines.push("");
  if (roadmap) {
    lines.push(`*Source: \`docs/02-strategy/roadmap.md\` (last updated ${roadmap.lastUpdated ?? "—"})*`);
    lines.push("");
    if (roadmap.currentStatus) {
      lines.push(`<details><summary>Current Status</summary>`);
      lines.push("");
      lines.push(roadmap.currentStatus.slice(0, 2000));
      lines.push("");
      lines.push(`</details>`);
      lines.push("");
    }
    if (roadmap.weeklyScope) {
      lines.push(`<details><summary>This Week's Scope</summary>`);
      lines.push("");
      lines.push(roadmap.weeklyScope.slice(0, 2000));
      lines.push("");
      lines.push(`</details>`);
      lines.push("");
    }
  } else {
    lines.push(`(roadmap unavailable)`);
    lines.push("");
  }

  // 7. Recent activity — session log deltas
  lines.push(`## 7. Recent Activity (last 14 days)`);
  lines.push("");
  lines.push(`*Session-log entries since ${sinceIso}*`);
  lines.push("");
  if (!recentSessions.length) {
    lines.push(`*No entries.*`);
    lines.push("");
  } else {
    for (const entry of recentSessions) {
      lines.push(`- **Day ${entry.dayNumber} · ${entry.date}** — ${entry.excerpt.slice(0, 160).replace(/\s+/g, " ")}…`);
    }
    lines.push("");
  }

  // 8. Active clients table
  lines.push(`## 8. Active Clients`);
  lines.push("");
  if (crm) {
    const clients = crm.contacts.filter((c) => c.segments.includes("CLIENT"));
    if (clients.length) {
      lines.push(`| # | Name | Stage | Container | Paid | Pending | Last Contact |`);
      lines.push(`|---|---|---|---|---|---|---|`);
      for (const c of clients) {
        lines.push(`| ${c.num} | ${c.name} | ${c.stage} | ${c.container} | ${c.paid} | ${c.pending} | ${c.lastContact} |`);
      }
      lines.push("");
    } else {
      lines.push(`*No CLIENT-tagged contacts.*`);
      lines.push("");
    }
  }

  // 9. Content Pillars
  if (crm && crm.contentPillars.length) {
    lines.push(`## 9. Content Pillars`);
    lines.push("");
    for (const p of crm.contentPillars) {
      lines.push(`- ${p}`);
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push("");
  lines.push(`*This file is regenerated every run — do not edit by hand. If the underlying numbers look wrong, fix \`broadcast_tracker.md\` or \`roadmap.md\`, not this snapshot.*`);
  lines.push("");

  return lines.join("\n");
}

main();
