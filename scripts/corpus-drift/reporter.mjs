// Pretty-print check results to stdout and return a markdown report string.

export function formatReport(results, { now = new Date() } = {}) {
  const lines = [];
  const mdLines = [];

  const timestamp = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const header = `▸ Corpus Drift Check · ${timestamp}`;
  const divider = "─".repeat(Math.max(header.length, 45));

  lines.push(header);
  lines.push(divider);
  mdLines.push(`# Corpus Drift Check`);
  mdLines.push("");
  mdLines.push(`**Run:** ${timestamp}`);
  mdLines.push("");

  let failCount = 0;
  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    const summary = `${icon} ${r.id} ${r.name.padEnd(16)} — ${r.aligned}/${r.total} aligned`;
    lines.push(summary);
    mdLines.push(`## ${icon} ${r.id} · ${r.name}`);
    mdLines.push("");
    mdLines.push(`**${r.aligned} of ${r.total} aligned.**`);
    mdLines.push("");

    if (!r.passed) {
      failCount += 1;
      for (const issue of r.issues) {
        if (issue.expected !== undefined || issue.actual !== undefined) {
          lines.push(`     Step ${issue.step}`);
          if (issue.expected !== undefined)
            lines.push(`       canvas:  "${issue.expected}"`);
          if (issue.actual !== undefined) lines.push(`       code:    "${issue.actual}"`);
          mdLines.push(`- **Step ${issue.step}** — ${issue.message}`);
          if (issue.expected !== undefined)
            mdLines.push(`  - canvas: \`${issue.expected}\``);
          if (issue.actual !== undefined)
            mdLines.push(`  - code:   \`${issue.actual}\``);
        } else {
          lines.push(`     ${issue.message}`);
          mdLines.push(`- ${issue.message}`);
        }
      }
      mdLines.push("");
    }
  }

  lines.push(divider);
  const passed = failCount === 0;
  lines.push(`Result: ${passed ? "GREEN" : "DRIFT"}  (${failCount} check${failCount === 1 ? "" : "s"} failed)`);

  mdLines.push("");
  mdLines.push(`---`);
  mdLines.push("");
  mdLines.push(`**Result:** ${passed ? "✅ GREEN" : "❌ DRIFT"} · ${failCount} check${failCount === 1 ? "" : "s"} failed`);

  return {
    stdout: lines.join("\n"),
    markdown: mdLines.join("\n") + "\n",
    passed,
    failCount,
  };
}
