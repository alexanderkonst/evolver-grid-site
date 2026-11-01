#!/usr/bin/env node
// Weekly swarm numbers (#285). Run by .agent/pending/swarm-weekly.yml (Mon 15:00 UTC).
// Appends one row to docs/ops/swarm_weekly.md. Definitions live in that doc and in the helpers below.
//
//   GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node scripts/swarm/weekly.mjs [--dry-run] [--doc path]
//   SWARM_NOW=2026-11-02T15:00:00Z overrides "now" (tests, backfill).
//
// Read-only against the GitHub API. Prints the row to stdout; writes the doc unless --dry-run.
// Never prints the token.

import { readFileSync, writeFileSync } from "node:fs";

const DAY = 86400000;
const MONDAY = 1; // Date#getUTCDay

// ---- pure helpers (unit-tested) -------------------------------------------------

/** Window = [previous Monday 15:00 UTC, most recent Monday 15:00 UTC <= now]. */
export function windowFor(now) {
  const d = new Date(now);
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 15, 0, 0));
  while (end.getUTCDay() !== MONDAY || end > d) end.setTime(end.getTime() - DAY);
  return { start: new Date(end.getTime() - 7 * DAY), end };
}

export function median(nums) {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Issue number a PR closes: "closes/fixes/resolves #N" in the body, else claude/issue-N-* branch. */
export function linkedIssue(pr) {
  const m = (pr.body || "").match(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/i);
  if (m) return Number(m[1]);
  const b = (pr.head?.ref || "").match(/^claude\/issue-(\d+)-/);
  return b ? Number(b[1]) : null;
}

/**
 * Review rounds for one PR. A round is a verdict:
 *   - a second-key comment (one per reviewed commit; github-actions[bot] only), or
 *   - a formal review submitted as APPROVED or CHANGES_REQUESTED.
 * negative = rounds that asked for changes. Needs rework = more than one round AND at least one negative.
 */
export function reviewRounds({ reviews = [], comments = [] }) {
  let rounds = 0;
  let negative = 0;
  for (const c of comments) {
    if (c.user?.login !== "github-actions[bot]" || !(c.body || "").includes("<!-- second-key-sha:")) continue;
    rounds++;
    if (/^SECOND-KEY: CHANGES$/m.test(c.body)) negative++;
  }
  for (const r of reviews) {
    if (r.state === "APPROVED") rounds++;
    else if (r.state === "CHANGES_REQUESTED") { rounds++; negative++; }
  }
  return { rounds, negative, needsRework: rounds > 1 && negative > 0 };
}

export function countNeedsHarkLabeled(events, start, end) {
  return events.filter((e) => e.event === "labeled" && e.label?.name === "needs-hark"
    && new Date(e.created_at) >= start && new Date(e.created_at) < end).length;
}

export function fmtDuration(hours) {
  if (hours === null) return "n/a";
  return hours >= 48 ? `${(hours / 24).toFixed(1)}d` : `${hours.toFixed(1)}h`;
}

const day = (d) => d.toISOString().slice(0, 10);

export function formatRow(m) {
  const cells = [
    `${day(m.start)} → ${day(m.end)}`,
    m.merged,
    m.medianHours === null ? "n/a" : `${fmtDuration(m.medianHours)} (n=${m.medianN})`,
    m.rework,
    m.needsHarkAdded,
    m.needsHarkOpen,
    m.minutes.toFixed(1),
    m.runs,
  ];
  return `| ${cells.join(" | ")} | <!-- week:${day(m.end)} -->`;
}

/** Idempotent: a week already present (by its marker) is left alone. */
export function appendRow(markdown, row, weekKey) {
  if (markdown.includes(`<!-- week:${weekKey} -->`)) return { markdown, added: false };
  const body = markdown.endsWith("\n") ? markdown : `${markdown}\n`;
  return { markdown: `${body}${row}\n`, added: true };
}

// ---- GitHub collection (not unit-tested; exercised by the workflow's dry run) ----

function makeApi(token, base = "https://api.github.com") {
  const get = async (path, params = {}) => {
    const url = new URL(path.startsWith("http") ? path : `${base}${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (!res.ok) throw new Error(`GET ${url.pathname} -> ${res.status}`);
    return res.json();
  };
  // Pages until a short page, `stop(item)` is true, or `cap` items. `pick` extracts the array from the body.
  const paginate = async (path, params = {}, { pick = (b) => b, stop = () => false, cap = 1000 } = {}) => {
    const out = [];
    for (let page = 1; out.length < cap; page++) {
      const items = pick(await get(path, { ...params, per_page: 100, page }));
      for (const it of items) { if (stop(it)) return out; out.push(it); }
      if (items.length < 100) break;
    }
    return out;
  };
  return { get, paginate };
}

export async function collect({ api, repo, start, end }) {
  const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

  const found = await api.paginate("/search/issues", {
    q: `repo:${repo} is:pr is:merged base:main merged:${iso(start)}..${iso(end)}`,
  }, { pick: (b) => b.items, cap: 300 });

  const hours = [];
  let rework = 0;
  for (const hit of found) {
    const pr = await api.get(`/repos/${repo}/pulls/${hit.number}`);
    const issueNo = linkedIssue(pr);
    if (issueNo) {
      try {
        const issue = await api.get(`/repos/${repo}/issues/${issueNo}`);
        hours.push((new Date(pr.merged_at) - new Date(issue.created_at)) / 3600000);
      } catch { /* issue deleted or transferred: leave it out of the median */ }
    }
    const [reviews, comments] = await Promise.all([
      api.paginate(`/repos/${repo}/pulls/${hit.number}/reviews`),
      api.paginate(`/repos/${repo}/issues/${hit.number}/comments`),
    ]);
    if (reviewRounds({ reviews, comments }).needsRework) rework++;
  }

  const events = await api.paginate(`/repos/${repo}/issues/events`, {}, { stop: (e) => new Date(e.created_at) < start, cap: 3000 });
  const open = await api.paginate(`/repos/${repo}/issues`, { labels: "needs-hark", state: "open" });

  const runs = await api.paginate(`/repos/${repo}/actions/runs`, { created: `${iso(start)}..${iso(end)}` }, { pick: (b) => b.workflow_runs, cap: 500 });
  let ms = 0;
  for (const run of runs) {
    try {
      const t = await api.get(`/repos/${repo}/actions/runs/${run.id}/timing`);
      ms += t.run_duration_ms || 0;
    } catch { /* timing unavailable for this run */ }
  }

  return {
    start, end,
    merged: found.length,
    medianHours: median(hours),
    medianN: hours.length,
    rework,
    needsHarkAdded: countNeedsHarkLabeled(events, start, end),
    needsHarkOpen: open.length, // issues and PRs both carry the label
    minutes: ms / 60000,
    runs: runs.length,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry-run");
  const docPath = args.includes("--doc") ? args[args.indexOf("--doc") + 1] : "docs/ops/swarm_weekly.md";
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");

  const { start, end } = windowFor(process.env.SWARM_NOW ? new Date(process.env.SWARM_NOW) : new Date());
  const metrics = await collect({ api: makeApi(token), repo, start, end });
  const row = formatRow(metrics);
  console.log(row);

  const { markdown, added } = appendRow(readFileSync(docPath, "utf8"), row, day(end));
  if (dry) { console.log(added ? "[dry run] row would be appended" : "[dry run] week already recorded"); return; }
  if (added) writeFileSync(docPath, markdown);
  console.log(added ? `appended to ${docPath}` : "week already recorded; nothing written");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
