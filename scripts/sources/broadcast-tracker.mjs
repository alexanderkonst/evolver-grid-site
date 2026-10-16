// CRM source — parses docs/02-strategy/strategic_crm_outreach_tracker.md
// plus its v6.0 siblings in docs/02-strategy/crm/*.md.
//
// v6.0 split the tracker: the core file keeps the Master Table, Offer Ledger,
// Revenue Summary, Open Items and the generated `## Funnel — live metrics`
// block; crm/brand-and-content.md holds Intuitive Launch Log, Surface Posts,
// Bio and Content Pillars; crm/archive.md holds Energy Leak Audit, Upcoming
// Events and the retired weekly Metrics / Pipeline Analytics. Every section is
// looked up by heading in whichever file holds it (core first, then siblings
// alphabetically), so a section can move between files without code changes.
// Funnel history comes from crm/metrics-history.csv.
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
//     funnel: [{ cohort, metrics: Record<string, number | string> }],
//     metricsHistory: [Record<string, number | string>],   // one per CSV row
//     offers: [{ dateSent, name, segmentOrCampaign, channel, offerType,
//                amountUsd, status, nextFollowupDate, quantity, notes }],
//     upcomingEvents: [{ date, event, participants, notes }],
//     contentPillars: [string],
//     stageDistribution: Record<string, number>,
//     segmentDistribution: Record<string, number>,
//     energyLeakCount: number,
//     cashReceivedUsd: number | null,
//     revShareContractsUsd: number | null,
//   }

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const TRACKER_FILE = "strategic_crm_outreach_tracker.md";
const CRM_DIR = "crm";
const HISTORY_FILE = "metrics-history.csv";
const METRICS_START = "<!-- METRICS:START -->";
const METRICS_END = "<!-- METRICS:END -->";

/**
 * Find the strategy directory holding the tracker: an explicit override, the
 * gitignored in-repo copy, or the private-ledger checkout (same layout).
 * Falls back to the first candidate so the error names a real location.
 */
export function resolveStrategyDir(override) {
  const candidates = [
    override,
    process.env.CRM_STRATEGY_DIR,
    join(REPO_ROOT, "docs", "02-strategy"),
    join(homedir(), "evolver-private-ledger", "docs", "02-strategy"),
  ].filter(Boolean);
  return candidates.find((dir) => existsSync(join(dir, TRACKER_FILE))) ?? candidates[0];
}

/**
 * Read a text file, returning null when it's missing or unreadable.
 */
function readOptional(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/**
 * Core tracker first, then `crm/*.md` siblings in name order. A missing crm/
 * directory or unreadable sibling is non-fatal (that source is just absent).
 */
function loadSources(strategyDir) {
  const trackerPath = join(strategyDir, TRACKER_FILE);
  const core = readFileSync(trackerPath, "utf8");
  const crmDir = join(strategyDir, CRM_DIR);
  let siblings = [];
  try {
    siblings = readdirSync(crmDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => readOptional(join(crmDir, f)))
      .filter((text) => text !== null);
  } catch {
    // No crm/ directory — pre-v6.0 layout or private repo not mounted.
  }
  return { trackerPath, core, sources: [core, ...siblings] };
}

/**
 * First source containing `heading`; "" when none does, so the parsers fall
 * through to their usual empty result.
 */
function sourceWith(sources, heading) {
  return sources.find((src) => src.includes(heading)) ?? "";
}

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

function parseOfferLedger(src) {
  const { headers, rows } = readTableAfter(src, "## Offer Ledger");
  if (!rows.length) return [];

  const idx = (needle) =>
    headers.findIndex((header) => header.toLowerCase().includes(needle.toLowerCase()));
  const at = (row, needle) => stripEmphasis(row[idx(needle)] ?? "");

  return rows.map((row) => ({
    dateSent: at(row, "Date Sent"),
    name: at(row, "Name"),
    segmentOrCampaign: at(row, "Segment / Campaign"),
    channel: at(row, "Channel"),
    offerType: at(row, "Type").toLowerCase(),
    amountUsd: Number(at(row, "Amount USD").replace(/[$,]/g, "")) || 0,
    status: at(row, "Status").toLowerCase(),
    nextFollowupDate: at(row, "Next Follow-up"),
    quantity: Math.max(1, Number(at(row, "Quantity")) || 1),
    notes: at(row, "Notes"),
  }));
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

/**
 * Parse CSV text into rows of cells. Handles quoted cells, escaped quotes
 * (`""`), embedded commas/newlines, a UTF-8 BOM and CRLF line endings.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/**
 * Numeric-looking cells (`12`, `1,066`, `$566`, `37.5%`) become numbers;
 * anything else stays a trimmed string.
 */
function coerceCell(raw) {
  const text = stripEmphasis(raw ?? "");
  if (/^-?\$?\d[\d,]*(\.\d+)?%?$/.test(text) || /^-?\$?\.\d+%?$/.test(text)) {
    const n = Number(text.replace(/[$,%]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return text;
}

/**
 * Funnel by cohort — the first table inside the generated
 * `<!-- METRICS:START -->` … `<!-- METRICS:END -->` block of the core file
 * (`scripts/crm_metrics.py`). First column names the cohort; the remaining
 * columns are funnel metrics keyed by their header text.
 */
function parseFunnel(src) {
  const start = src.indexOf(METRICS_START);
  if (start === -1) return [];
  const from = start + METRICS_START.length;
  const end = src.indexOf(METRICS_END, from);
  const block = src.slice(from, end === -1 ? undefined : end);

  const { headers, rows } = readTableAfter(block, "");
  if (headers.length < 2) return [];
  const labels = headers.map((h) => stripEmphasis(h));
  return rows
    .map((cells) => {
      const cohort = stripEmphasis(cells[0] ?? "");
      if (!cohort) return null;
      const metrics = {};
      for (let i = 1; i < labels.length; i++) {
        if (labels[i]) metrics[labels[i]] = coerceCell(cells[i]);
      }
      return { cohort, metrics };
    })
    .filter(Boolean);
}

/**
 * History series from crm/metrics-history.csv: one object per row, keyed by
 * the CSV header, numeric cells coerced.
 */
function parseMetricsHistory(csv) {
  if (!csv) return [];
  const [header, ...rows] = parseCsv(csv);
  if (!header) return [];
  const keys = header.map((h) => h.trim());
  return rows.map((cells) => {
    const entry = {};
    keys.forEach((key, i) => {
      if (key) entry[key] = coerceCell(cells[i]);
    });
    return entry;
  });
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
  const matches = [...src.matchAll(/\*CRM\s+(v[\d.]+)\s+—\s*([^·*]+)·([^*]+)\*/g)];
  const m = matches.at(-1);
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
 * Pull received + rev-share totals from the Revenue Summary narrative.
 * Heuristic: the "Total received" / "Cash received" row starts with the
 * headline $N figure; subsequent figures are breakdowns.
 */
function deriveRevenueTotals(revenueSummary) {
  let cashReceivedUsd = null;
  let revShareContractsUsd = null;
  for (const row of revenueSummary) {
    const cat = row.category.toLowerCase();
    const amounts = extractDollarAmounts(row.amount);
    if (!amounts.length) continue;
    if (
      (cat.includes("cash received") ||
        cat.includes("total received") ||
        cat.includes("strict received")) &&
      cashReceivedUsd === null
    ) {
      // First $ figure is the headline total; subsequent in parens are the breakdown.
      cashReceivedUsd = amounts[0];
    } else if (cat.includes("revenue share contracts") && revShareContractsUsd === null) {
      revShareContractsUsd = amounts[0];
    }
  }
  return { cashReceivedUsd, revShareContractsUsd };
}

/**
 * @param {{ strategyDir?: string }} [options] `strategyDir` overrides where
 *   the tracker and its `crm/` siblings are read from (tests, private checkout).
 */
export function readBroadcastTracker({ strategyDir } = {}) {
  const dir = resolveStrategyDir(strategyDir);
  const { trackerPath, core, sources } = loadSources(dir);
  const find = (heading) => sourceWith(sources, heading);

  const contacts = parseMasterTable(core);
  const revenueSummary = parseRevenueSummary(core);
  const openItems = parseOpenItems(core);
  const energyLeaks = parseEnergyLeaks(find("### ⚠️ Energy Leak Audit"));
  const intuitiveLaunch = parseIntuitiveLaunch(find("## Intuitive Launch Log"));
  const surfacePosts = parseSurfacePosts(find("## Surface Posts"));
  const funnel = parseFunnel(core);
  const metricsHistory = parseMetricsHistory(readOptional(join(dir, CRM_DIR, HISTORY_FILE)));
  const offers = parseOfferLedger(core);
  const upcomingEvents = parseUpcomingEvents(find("## Upcoming Events"));
  const contentPillars = parseContentPillars(find("## Content Pillars"));
  const { version, updatedNote } = parseFooterMeta(core);

  const { stageDistribution, segmentDistribution } = deriveDistributions(contacts);
  const { cashReceivedUsd, revShareContractsUsd } = deriveRevenueTotals(revenueSummary);

  return {
    path: trackerPath,
    version,
    updatedNote,
    contacts,
    revenueSummary,
    openItems,
    energyLeaks,
    intuitiveLaunch,
    surfacePosts,
    funnel,
    metricsHistory,
    offers,
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
