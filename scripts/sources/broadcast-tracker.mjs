// CRM source — parses docs/09-logs/broadcast_tracker.md.
//
// This file is Sasha's single source of truth for contact-state + pipeline.
// The parser is deliberately tolerant: the file is human-edited, so we read
// what's there and surface summaries rather than enforcing schema.
//
// Exported shape:
//   readBroadcastTracker() -> {
//     path, version, updatedNote,
//     contacts: [{ num, name, segments[], stage, container, sessions,
//                  agreement, paid, pending, channel, lastContact, notes }],
//     revenueSummary: [{ category, amount }],
//     openItems: [{ done, text }],
//     energyLeaks: [{ num, name, pattern, boundary }],
//     intuitiveLaunch: [{ batch, items: [{ name, done, note }] }],
//     surfacePosts: [{ surface, posted, date, notes }],
//     metrics: [{ week, dmsSent, responses, clicks, quizCompletions, emails }],
//     pipelineAnalytics: [{ metric, value }],
//     upcomingEvents: [{ date, event, participants, notes }],
//     contentPillars: [string],
//     stageDistribution: Record<string, number>,
//     segmentDistribution: Record<string, number>,
//     energyLeakCount: number,
//     cashReceivedUsd: number | null,
//     revShareContractsUsd: number | null,
//   }

import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const BROADCAST_TRACKER = join(REPO_ROOT, "docs", "09-logs", "broadcast_tracker.md");

/**
 * Split a markdown table row (`| a | b | c |`) into trimmed cells.
 * Returns null when the row isn't table-shaped.
 */
function splitRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  // Strip leading/trailing pipe and split.
  const inner = trimmed.slice(1, -1);
  return inner.split("|").map((s) => s.trim());
}

/**
 * Extract rows of the first markdown table that appears after `afterHeading`.
 * Skips header + separator rows. Returns [] if not found.
 */
function readTableAfter(src, afterHeading) {
  const anchor = src.indexOf(afterHeading);
  if (anchor === -1) return { headers: [], rows: [] };
  const rest = src.slice(anchor + afterHeading.length);
  const lines = rest.split("\n");

  let inTable = false;
  let headers = [];
  const rows = [];
  let sepSeen = false;

  for (const line of lines) {
    const cells = splitRow(line);
    if (!cells) {
      if (inTable) break;
      continue;
    }
    if (!inTable) {
      headers = cells;
      inTable = true;
      continue;
    }
    if (!sepSeen) {
      // Separator row: cells like ---, :---, ---:.
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) {
        sepSeen = true;
        continue;
      }
      // No separator — still treat as data row.
      sepSeen = true;
    }
    rows.push(cells);
  }
  return { headers, rows };
}

/**
 * Strip markdown emphasis (`**bold**`, `*italic*`, `` `code` ``) and trim.
 */
function stripEmphasis(text) {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/~~/g, "")
    .trim();
}

/**
 * Pull inline backtick-tokens like `CLIENT`, `BRIDGE` out of a cell.
 */
function extractSegments(cell) {
  const tokens = [];
  const re = /`([A-Z][A-Z0-9-]*)`/g;
  let m;
  while ((m = re.exec(cell)) !== null) tokens.push(m[1]);
  return tokens;
}

/**
 * Parse dollar figures out of a string. Returns a sorted list of numbers (as numbers).
 * `$566`, `$1,066`, `$3,000` → [566, 1066, 3000]. No amount → [].
 */
function extractDollarAmounts(text) {
  if (!text) return [];
  const re = /\$([\d,]+(?:\.\d+)?)/g;
  const nums = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    nums.push(Number(m[1].replace(/,/g, "")));
  }
  return nums;
}

function sum(nums) {
  return nums.reduce((a, b) => a + b, 0);
}

/**
 * Parse the Master Table — the big contact list.
 * Columns (by header position):
 *   # | Name | Segment | Stage | Container | Sessions | Agreement | Paid | Pending | Channel | Last Contact | Notes
 */
function parseMasterTable(src) {
  const { headers, rows } = readTableAfter(src, "## Master Table");
  if (!rows.length) return [];

  // Map header indices by keyword match so future column shuffles don't break us.
  const idx = (needle) =>
    headers.findIndex((h) => h.toLowerCase().includes(needle.toLowerCase()));

  const iNum = idx("#");
  const iName = idx("Name");
  const iSegment = idx("Segment");
  const iStage = idx("Stage");
  const iContainer = idx("Container");
  const iSessions = idx("Sessions");
  const iAgreement = idx("Agreement");
  const iPaid = idx("Paid");
  const iPending = idx("Pending");
  const iChannel = idx("Channel");
  const iLast = idx("Last Contact");
  const iNotes = idx("Notes");

  return rows
    .map((cells) => {
      // Row #col might fail to parse (e.g. an annotation row). Skip it.
      const numRaw = cells[iNum] ?? "";
      const numParsed = Number(stripEmphasis(numRaw));
      if (!Number.isFinite(numParsed)) return null;

      return {
        num: numParsed,
        name: stripEmphasis(cells[iName] ?? ""),
        segments: extractSegments(cells[iSegment] ?? ""),
        stage: stripEmphasis(cells[iStage] ?? ""),
        container: stripEmphasis(cells[iContainer] ?? ""),
        sessions: stripEmphasis(cells[iSessions] ?? ""),
        agreement: stripEmphasis(cells[iAgreement] ?? ""),
        paid: stripEmphasis(cells[iPaid] ?? ""),
        pending: stripEmphasis(cells[iPending] ?? ""),
        channel: stripEmphasis(cells[iChannel] ?? ""),
        lastContact: stripEmphasis(cells[iLast] ?? ""),
        notes: (cells[iNotes] ?? "").trim(),
      };
    })
    .filter(Boolean);
}

function parseRevenueSummary(src) {
  const { rows } = readTableAfter(src, "## Revenue Summary");
  return rows.map((cells) => ({
    category: stripEmphasis(cells[0] ?? ""),
    amount: stripEmphasis(cells[1] ?? ""),
  }));
}

function parseOpenItems(src) {
  // Find "## Open Items" section, pull `- [ ]` / `- [x]` bullets up to next `###` or `##`.
  const anchor = src.indexOf("## Open Items");
  if (anchor === -1) return [];
  const rest = src.slice(anchor);
  // Stop at next `## ` heading but allow `### ` subheadings through.
  const stopAt = rest.slice(3).search(/\n##\s/);
  const block = stopAt === -1 ? rest : rest.slice(0, stopAt + 3);

  const items = [];
  const re = /^-\s*\[([ xX])\]\s*(.+)$/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    items.push({
      done: m[1].toLowerCase() === "x",
      text: m[2].trim(),
    });
  }
  return items;
}

function parseEnergyLeaks(src) {
  const { rows } = readTableAfter(src, "### ⚠️ Energy Leak Audit");
  return rows
    .map((cells) => {
      const numRaw = stripEmphasis(cells[0] ?? "");
      const num = Number(numRaw);
      if (!Number.isFinite(num)) return null;
      return {
        num,
        name: stripEmphasis(cells[1] ?? ""),
        pattern: stripEmphasis(cells[2] ?? ""),
        boundary: stripEmphasis(cells[3] ?? ""),
      };
    })
    .filter(Boolean);
}

function parseIntuitiveLaunch(src) {
  const anchor = src.indexOf("## Intuitive Launch Log");
  if (anchor === -1) return [];
  const rest = src.slice(anchor);
  const stop = rest.slice(3).search(/\n##\s/);
  const block = stop === -1 ? rest : rest.slice(0, stop + 3);

  // Batches are `**Batch N: Title**` headers followed by numbered items.
  const batches = [];
  const lines = block.split("\n");
  let current = null;
  for (const line of lines) {
    const batchMatch = line.match(/^\*\*Batch\s+(\d+):\s*(.+?)\*\*/);
    if (batchMatch) {
      if (current) batches.push(current);
      current = {
        batch: Number(batchMatch[1]),
        title: batchMatch[2].trim(),
        items: [],
      };
      continue;
    }
    if (!current) continue;
    const itemMatch = line.match(/^\d+\.\s+(.+)$/);
    if (itemMatch) {
      const raw = itemMatch[1];
      const done = raw.includes("✅") || /^~~.+~~/.test(raw);
      // Strip strikethrough + checkmark + trailing notes.
      let name = raw
        .replace(/~~([^~]+)~~/g, "$1")
        .replace(/✅/g, "")
        .trim();
      // Optional trailing note after em/en dash or double-space
      const parts = name.split(/\s[—–-]\s/);
      const note = parts.length > 1 ? parts.slice(1).join(" — ") : "";
      const cleanName = parts[0]
        .replace(/\s*\([^)]*\)\s*$/, "") // trailing parenthetical
        .replace(/\*\*/g, "")
        .trim();
      current.items.push({
        name: cleanName,
        done,
        note: note.trim(),
      });
    }
  }
  if (current) batches.push(current);
  return batches;
}

function parseSurfacePosts(src) {
  const { rows } = readTableAfter(src, "## Surface Posts");
  return rows.map((cells) => ({
    surface: stripEmphasis(cells[0] ?? ""),
    posted: (cells[1] ?? "").includes("✅"),
    date: stripEmphasis(cells[2] ?? ""),
    notes: stripEmphasis(cells[3] ?? ""),
  }));
}

function parseMetrics(src) {
  const { rows } = readTableAfter(src, "## Metrics");
  return rows.map((cells) => ({
    week: stripEmphasis(cells[0] ?? ""),
    dmsSent: stripEmphasis(cells[1] ?? ""),
    responses: stripEmphasis(cells[2] ?? ""),
    clicks: stripEmphasis(cells[3] ?? ""),
    quizCompletions: stripEmphasis(cells[4] ?? ""),
    emails: stripEmphasis(cells[5] ?? ""),
  }));
}

function parsePipelineAnalytics(src) {
  const { rows } = readTableAfter(src, "## Pipeline Analytics");
  return rows.map((cells) => ({
    metric: stripEmphasis(cells[0] ?? ""),
    value: cells[1] ?? "",
  }));
}

function parseUpcomingEvents(src) {
  const { rows } = readTableAfter(src, "## Upcoming Events");
  return rows.map((cells) => ({
    date: stripEmphasis(cells[0] ?? ""),
    event: stripEmphasis(cells[1] ?? ""),
    participants: stripEmphasis(cells[2] ?? ""),
    notes: (cells[3] ?? "").trim(),
  }));
}

function parseContentPillars(src) {
  const anchor = src.indexOf("## Content Pillars");
  if (anchor === -1) return [];
  const rest = src.slice(anchor);
  const stop = rest.slice(3).search(/\n##\s/);
  const block = stop === -1 ? rest : rest.slice(0, stop + 3);
  const pillars = [];
  const re = /^\d+\.\s+\*\*(.+?)\*\*\s*—\s*(.+)$/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    pillars.push(`${m[1]} — ${m[2]}`);
  }
  return pillars;
}

function parseFooterMeta(src) {
  // `*CRM v3.4 — April 12, 2026 · Energy Leak Audit: ...*`
  const m = src.match(/\*CRM\s+(v[\d.]+)\s+—\s*([^·*]+)·([^*]+)\*/);
  if (!m) return { version: null, updatedNote: null };
  return {
    version: m[1].trim(),
    updatedNote: `${m[2].trim()} · ${m[3].trim()}`,
  };
}

/**
 * Aggregate counters derived from the master table.
 */
function deriveDistributions(contacts) {
  const stageDistribution = {};
  const segmentDistribution = {};
  for (const c of contacts) {
    const stage = c.stage || "(blank)";
    stageDistribution[stage] = (stageDistribution[stage] ?? 0) + 1;
    for (const seg of c.segments) {
      segmentDistribution[seg] = (segmentDistribution[seg] ?? 0) + 1;
    }
  }
  return { stageDistribution, segmentDistribution };
}

/**
 * Pull cash + rev-share totals from the Revenue Summary narrative.
 * Heuristic: the "Cash received" row contains a single highlighted $N figure.
 */
function deriveRevenueTotals(revenueSummary) {
  let cashReceivedUsd = null;
  let revShareContractsUsd = null;
  for (const row of revenueSummary) {
    const cat = row.category.toLowerCase();
    const amounts = extractDollarAmounts(row.amount);
    if (!amounts.length) continue;
    if (cat.includes("cash received") && cashReceivedUsd === null) {
      // First $ figure is the headline total; subsequent in parens are the breakdown.
      cashReceivedUsd = amounts[0];
    } else if (cat.includes("revenue share contracts") && revShareContractsUsd === null) {
      revShareContractsUsd = amounts[0];
    }
  }
  return { cashReceivedUsd, revShareContractsUsd };
}

export function readBroadcastTracker() {
  const src = readFileSync(BROADCAST_TRACKER, "utf8");
  const contacts = parseMasterTable(src);
  const revenueSummary = parseRevenueSummary(src);
  const openItems = parseOpenItems(src);
  const energyLeaks = parseEnergyLeaks(src);
  const intuitiveLaunch = parseIntuitiveLaunch(src);
  const surfacePosts = parseSurfacePosts(src);
  const metrics = parseMetrics(src);
  const pipelineAnalytics = parsePipelineAnalytics(src);
  const upcomingEvents = parseUpcomingEvents(src);
  const contentPillars = parseContentPillars(src);
  const { version, updatedNote } = parseFooterMeta(src);

  const { stageDistribution, segmentDistribution } = deriveDistributions(contacts);
  const { cashReceivedUsd, revShareContractsUsd } = deriveRevenueTotals(revenueSummary);

  return {
    path: BROADCAST_TRACKER,
    version,
    updatedNote,
    contacts,
    revenueSummary,
    openItems,
    energyLeaks,
    intuitiveLaunch,
    surfacePosts,
    metrics,
    pipelineAnalytics,
    upcomingEvents,
    contentPillars,
    stageDistribution,
    segmentDistribution,
    energyLeakCount: energyLeaks.length,
    cashReceivedUsd,
    revShareContractsUsd,
  };
}

/**
 * Helper: contacts grouped by stage keyword, useful for pipeline rollups.
 * Case-insensitive substring match on stage.
 */
export function groupContactsByStage(contacts, stageSubstring) {
  const needle = stageSubstring.toLowerCase();
  return contacts.filter((c) => c.stage.toLowerCase().includes(needle));
}

/**
 * Helper: contacts that carry the named segment tag.
 */
export function filterBySegment(contacts, segment) {
  return contacts.filter((c) => c.segments.includes(segment));
}
