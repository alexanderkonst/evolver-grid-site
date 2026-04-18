#!/usr/bin/env node
// Holomap Update v1 — briefing-packet mode.
//
// What it does:
//   1. Reads the current holomap state (last-updated date, center reading, ► markers).
//   2. Reads the inputs that should drive the update:
//        - roadmap.md (current status + weekly scope)
//        - session_log.md (entries newer than the holomap's Updated: date)
//        - alexanders_unique_business.md (state header)
//   3. Synthesises a BRIEFING PACKET — the exact prompt shape Sasha's
//      verbal "update the holomap" protocol expects to feed into an LLM.
//   4. Writes it to scripts/holomap-update/last-briefing.md.
//
// What it does NOT do (yet):
//   - Mutate the holomap directly. The briefing packet is designed to be handed
//     to Claude (either in Cowork chat or via Claude Code), which then writes
//     the semantic updates into the holomap manually. Apply mode is Phase 2.
//
// Usage:
//   node scripts/holomap-update/index.mjs
//   node scripts/holomap-update/index.mjs --since 2026-04-01   # force window
//   node scripts/holomap-update/index.mjs --stdout             # print packet, don't write file

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { readHolomap } from "./parse-holomap.mjs";
import { readRoadmap, readSessionLogSince, readAlexanderCanvasHeader } from "./parse-inputs.mjs";
import { readBroadcastTracker } from "../sources/broadcast-tracker.mjs";

function parseArgs(argv) {
  const args = { stdout: false, since: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--stdout") args.stdout = true;
    else if (argv[i] === "--since") args.since = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const holomap = readHolomap();
  const roadmap = readRoadmap();
  const canvas = readAlexanderCanvasHeader();
  const crm = safeRead(readBroadcastTracker);

  const sinceDate = args.since ?? holomap.updated;
  const sessionEntries = readSessionLogSince(sinceDate);

  const packet = renderBriefingPacket({ holomap, roadmap, canvas, crm, sessionEntries, sinceDate });

  if (args.stdout) {
    console.log(packet);
    return;
  }

  const out = join(import.meta.dirname, "last-briefing.md");
  writeFileSync(out, packet, "utf8");
  console.log(`▸ Holomap briefing packet written`);
  console.log(`  → ${out}`);
  console.log(`  → ${sessionEntries.length} session-log entries since ${sinceDate ?? "beginning"}`);
  console.log(`  → ${holomap.perspectives.length} perspectives scanned (current ► markers captured)`);
  if (crm) {
    console.log(`  → ${crm.contacts.length} CRM contacts · ${crm.energyLeakCount} energy leaks · $${crm.cashReceivedUsd ?? 0} cash`);
  } else {
    console.log(`  → CRM read failed — broadcast_tracker.md not parsed (skipped in briefing)`);
  }
  console.log("");
  console.log(`Next step: open Cowork chat and say "update the holomap using scripts/holomap-update/last-briefing.md"`);
}

function safeRead(readerFn) {
  try {
    return readerFn();
  } catch (err) {
    console.warn(`▸ Warning: ${readerFn.name} failed: ${err.message}`);
    return null;
  }
}

function renderBriefingPacket({ holomap, roadmap, canvas, crm, sessionEntries, sinceDate }) {
  const now = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push(`# Holomap Update Briefing Packet`);
  lines.push("");
  lines.push(`*Generated: ${now} · Source: \`npm run holomap:update\`*`);
  lines.push("");
  lines.push(`This packet is the input Claude needs to perform a semantic update of`);
  lines.push(`\`docs/02-strategy/morphogenetic_holomap.md\`. Hand this to Claude in Cowork`);
  lines.push(`or Claude Code with the instruction: *"update the holomap based on this briefing."*`);
  lines.push("");
  lines.push(`---`);
  lines.push("");

  // 1. Current holomap state
  lines.push(`## 1. Current Holomap State`);
  lines.push("");
  lines.push(`- **Last updated:** ${holomap.updated ?? "(unknown)"}`);
  lines.push(`- **Center reading:** ${holomap.centerReading ?? "(unknown)"}`);
  lines.push(`- **Holon:** ${holomap.holon ?? "(unknown)"}`);
  lines.push(`- **Perspectives captured:** ${holomap.perspectives.length}`);
  lines.push("");
  lines.push(`### Current ► markers per perspective`);
  lines.push("");
  lines.push(`| P | Quadrant | Name | Current Stage |`);
  lines.push(`|---|---|---|---|`);
  for (const p of holomap.perspectives) {
    lines.push(`| P${p.number} | ${p.quadrant} | ${p.name} | ${p.currentStage} |`);
  }
  lines.push("");

  // 2. Roadmap current status
  lines.push(`## 2. Roadmap — Current Status`);
  lines.push("");
  lines.push(`*Source: \`docs/02-strategy/roadmap.md\` (last updated ${roadmap.lastUpdated})*`);
  lines.push("");
  if (roadmap.currentStatus) {
    lines.push(`<details><summary>Full Current Status block</summary>`);
    lines.push("");
    lines.push(roadmap.currentStatus.slice(0, 3000));
    lines.push("");
    lines.push(`</details>`);
    lines.push("");
  }

  // 3. This week's scope
  lines.push(`## 3. This Week's Scope`);
  lines.push("");
  if (roadmap.weeklyScope) {
    lines.push(roadmap.weeklyScope.slice(0, 3000));
    lines.push("");
  } else {
    lines.push(`(not found)`);
    lines.push("");
  }

  // 4. Session-log deltas
  lines.push(`## 4. Session-Log Entries Since ${sinceDate ?? "beginning"}`);
  lines.push("");
  if (sessionEntries.length === 0) {
    lines.push(`No new session-log entries since last holomap update.`);
    lines.push("");
  } else {
    for (const entry of sessionEntries) {
      lines.push(`### Day ${entry.dayNumber} — ${entry.date}`);
      lines.push("");
      lines.push(entry.excerpt + (entry.excerpt.length >= 600 ? "…" : ""));
      lines.push("");
    }
  }

  // 4b. CRM snapshot from broadcast_tracker.md
  lines.push(`## 4b. CRM Snapshot — \`docs/09-logs/broadcast_tracker.md\``);
  lines.push("");
  if (!crm) {
    lines.push(`(broadcast_tracker.md could not be parsed — skipped)`);
    lines.push("");
  } else {
    lines.push(`*${crm.version ?? ""} · ${crm.updatedNote ?? ""}*`);
    lines.push("");

    // Headline counts
    lines.push(`- **Total contacts:** ${crm.contacts.length}`);
    lines.push(`- **Cash received:** $${crm.cashReceivedUsd ?? 0}`);
    lines.push(`- **Revenue-share contracts:** $${crm.revShareContractsUsd ?? 0}`);
    lines.push(`- **Energy leaks flagged:** ${crm.energyLeakCount}`);
    lines.push("");

    // Stage distribution
    lines.push(`### Stage distribution`);
    lines.push("");
    lines.push(`| Stage | Count |`);
    lines.push(`|---|---|`);
    const stageEntries = Object.entries(crm.stageDistribution).sort((a, b) => b[1] - a[1]);
    for (const [stage, count] of stageEntries) {
      lines.push(`| ${stage} | ${count} |`);
    }
    lines.push("");

    // Segment distribution
    lines.push(`### Segment distribution`);
    lines.push("");
    const segEntries = Object.entries(crm.segmentDistribution).sort((a, b) => b[1] - a[1]);
    lines.push(segEntries.map(([s, c]) => `${s}: ${c}`).join(" · ") || "(none)");
    lines.push("");

    // Active clients (paying or in a container)
    const activeClients = crm.contacts.filter((c) => c.segments.includes("CLIENT"));
    if (activeClients.length) {
      lines.push(`### Active clients`);
      lines.push("");
      lines.push(`| # | Name | Stage | Container | Paid | Last Contact |`);
      lines.push(`|---|---|---|---|---|---|`);
      for (const c of activeClients) {
        lines.push(`| ${c.num} | ${c.name} | ${c.stage} | ${c.container} | ${c.paid} | ${c.lastContact} |`);
      }
      lines.push("");
    }

    // Energy leaks — the narrative line Sasha cares about
    if (crm.energyLeaks.length) {
      lines.push(`### Energy leaks — need boundary`);
      lines.push("");
      for (const l of crm.energyLeaks) {
        lines.push(`- **${l.name}** — ${l.pattern} → ${l.boundary}`);
      }
      lines.push("");
    }

    // Open items — just the first N, tight
    if (crm.openItems.length) {
      lines.push(`### Open items (top ${Math.min(crm.openItems.length, 10)})`);
      lines.push("");
      for (const item of crm.openItems.slice(0, 10)) {
        const check = item.done ? "x" : " ";
        lines.push(`- [${check}] ${item.text}`);
      }
      lines.push("");
    }

    // Upcoming events
    if (crm.upcomingEvents.length) {
      lines.push(`### Upcoming events`);
      lines.push("");
      for (const e of crm.upcomingEvents) {
        lines.push(`- **${e.date}** — ${e.event} (${e.participants})`);
      }
      lines.push("");
    }
  }

  // 5. Founder canvas state snapshot
  lines.push(`## 5. Alexander's Canvas — Header Snapshot`);
  lines.push("");
  lines.push(`<details><summary>First 100 lines of \`alexanders_unique_business.md\`</summary>`);
  lines.push("");
  lines.push("```markdown");
  lines.push(canvas.header);
  lines.push("```");
  lines.push("");
  lines.push(`</details>`);
  lines.push("");

  // 6. Update instructions
  lines.push(`## 6. Instructions to Claude`);
  lines.push("");
  lines.push(`Read the inputs above, then update \`docs/02-strategy/morphogenetic_holomap.md\` in place:`);
  lines.push("");
  lines.push(`1. **Date stamp:** update the \`Updated:\` line to today.`);
  lines.push(`2. **Center reading:** only shift if section 4 shows a qualitative change in what's at the center of Sasha's attention.`);
  lines.push(`3. **► markers:** for each perspective whose stage changed, move the ► and add ✓ on previously-completed stages. Be conservative — only move ► when the evidence is in section 4 or 4b (CRM stage transitions, new paid clients, new energy leaks resolving).`);
  lines.push(`4. **Timing overlays (🐢/🎯/⚡):** re-evaluate if section 3 (weekly scope) materially changes velocity expectations.`);
  lines.push(`5. **Output shape:** write the update as an in-place edit to the holomap file. Surface each ► move in the reply with a one-line \`P_N: <from> → <to>\` note so the reasoning is visible.`);
  lines.push("");
  lines.push(`Do NOT rewrite the whole holomap. Only touch the fields warranted by the evidence.`);
  lines.push("");

  return lines.join("\n") + "\n";
}

main();
