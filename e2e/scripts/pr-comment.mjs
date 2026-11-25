#!/usr/bin/env node
/**
 * Turn artifacts/report.json into one PR comment: DoD row × viewport, ✅ / ❌ / ⏭.
 * The comment is edited in place on every push (found by its marker), never duplicated.
 *
 *   GITHUB_TOKEN, REPO, PR_NUMBER   to post; without them the markdown is printed
 *   PREVIEW_URL, RUN_URL, HEAD_SHA  shown in the comment
 */
import fs from "node:fs";

const MARKER = "<!-- qa-pass -->";
const PROJECTS = ["desktop", "tablet", "phone", "reduced-motion"];
const report = JSON.parse(fs.readFileSync("artifacts/report.json", "utf8"));

/** rows[key][project] = list of statuses; key = the «DoD n · …» describe title or test title. */
const rows = new Map();
const failed = new Map(); // "title :: error" -> projects
const fixmes = new Set();

const walk = (suite, trail = []) => {
  const here = suite.title && !/\.spec\.ts$/.test(suite.title) && !PROJECTS.includes(suite.title) ? [...trail, suite.title] : trail;
  for (const spec of suite.specs ?? []) {
    const key = [...here, spec.title].find((t) => /^DoD \d+/.test(t));
    for (const t of spec.tests ?? []) {
      const status = t.status; // expected | unexpected | skipped | flaky
      if (!key) continue;
      const row = rows.get(key) ?? {};
      (row[t.projectName] ??= []).push(status);
      rows.set(key, row);
      if (status === "unexpected" || status === "flaky") {
        const err = (t.results?.at(-1)?.error?.message ?? "").replace(/\u001b\[[0-9;]*m/g, "").split("\n").filter(Boolean).slice(0, 3).join(" ");
        const k = `${spec.title} :: ${err.slice(0, 280)}`;
        failed.set(k, [...(failed.get(k) ?? []), t.projectName]);
      }
    }
    if (!key && (spec.tests ?? []).every((t) => t.status === "skipped")) fixmes.add(spec.title);
  }
  for (const child of suite.suites ?? []) walk(child, here);
};
for (const s of report.suites ?? []) walk(s);

const failures = [...failed].map(([k, projects]) => {
  const [title, ...err] = k.split(" :: ");
  return `- **${[...new Set(projects)].join(", ")}** · ${title} · ${err.join(" :: ")}`;
});

const cell = (list) => {
  if (!list) return "–";
  if (list.some((s) => s === "unexpected")) return "❌";
  if (list.some((s) => s === "flaky")) return "⚠️";
  if (list.every((s) => s === "skipped")) return "⏭";
  return "✅";
};
const sorted = [...rows.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
const table = [
  `| DoD row | ${PROJECTS.join(" | ")} |`,
  `|---|${PROJECTS.map(() => "---").join("|")}|`,
  ...sorted.map(([k, v]) => `| ${k.replace(/\|/g, "\\|")} | ${PROJECTS.map((p) => cell(v[p])).join(" | ")} |`),
].join("\n");

const stats = report.stats ?? {};
// A run that never started (preflight failed, config error) has zero tests and an `errors` list: not green.
const runErrors = (report.errors ?? []).map((e) => (e.message ?? "").replace(/\u001b\[[0-9;]*m/g, "").split("\n").filter(Boolean).join(" ").slice(0, 600));
const ran = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0);
const verdict = runErrors.length
  ? "❌ the run did not start"
  : (stats.unexpected ?? 0) > 0
    ? `❌ ${stats.unexpected} check(s) failed`
    : ran === 0
      ? "❌ no check ran"
      : "✅ all checks passed";
const lines = [
  MARKER,
  `### QA pass · ${verdict}`,
  "",
  `Template: [qa-pass](https://github.com/${process.env.REPO ?? ""}/blob/main/docs/templates/qa-pass.md) · preview: ${process.env.PREVIEW_URL ?? "n/a"}${process.env.HEAD_SHA ? ` · \`${process.env.HEAD_SHA.slice(0, 7)}\`` : ""}`,
  "",
  table,
  "",
  `${stats.expected ?? 0} passed · ${stats.unexpected ?? 0} failed · ${stats.skipped ?? 0} skipped · ${stats.flaky ?? 0} flaky`,
];
if (runErrors.length) lines.push("", "**Why:**", "", ...runErrors.map((m) => `> ${m}`));
if (failures.length) lines.push("", "<details open><summary>Failures</summary>", "", ...failures, "", "</details>");
if (fixmes.size) lines.push("", `Tracked, not yet fixed: ${[...fixmes].map((t) => `«${t}»`).join(", ")}`);
lines.push(
  "",
  `Screenshots per viewport and the HTML report: [workflow run artifacts](${process.env.RUN_URL ?? "#"}) (\`qa-pass-artifacts\`). This job reports; it does not block merge.`,
);
const body = lines.join("\n");

const { GITHUB_TOKEN, REPO, PR_NUMBER } = process.env;
if (!GITHUB_TOKEN || !REPO || !PR_NUMBER) {
  console.log(body);
  process.exit(0);
}
const gh = async (path, init = {}) => {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
};
const comments = await gh(`/issues/${PR_NUMBER}/comments?per_page=100`);
const mine = comments.find((c) => c.body?.includes(MARKER));
if (mine) await gh(`/issues/comments/${mine.id}`, { method: "PATCH", body: JSON.stringify({ body }) });
else await gh(`/issues/${PR_NUMBER}/comments`, { method: "POST", body: JSON.stringify({ body }) });
console.log("QA pass comment posted.");
