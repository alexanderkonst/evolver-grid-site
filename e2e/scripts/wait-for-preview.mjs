#!/usr/bin/env node
/**
 * Wait for the Vercel preview of a commit, then print its URL.
 *
 * Vercel reports each deploy to GitHub as a deployment with statuses. This polls the deployments of
 * HEAD_SHA until one has a `success` status, and writes `url=<https://…>` to $GITHUB_OUTPUT.
 *
 *   GITHUB_TOKEN  token with `deployments: read`
 *   REPO          owner/name
 *   HEAD_SHA      the PR's head commit
 *   WAIT_MINUTES  default 15
 */
import fs from "node:fs";

const { GITHUB_TOKEN, REPO, HEAD_SHA } = process.env;
const waitMs = Number(process.env.WAIT_MINUTES ?? 15) * 60_000;
if (!GITHUB_TOKEN || !REPO || !HEAD_SHA) {
  console.error("GITHUB_TOKEN, REPO and HEAD_SHA are required");
  process.exit(2);
}

const api = async (path) => {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const deadline = Date.now() + waitMs;
let last = "no deployment yet";

while (Date.now() < deadline) {
  const deployments = await api(`/deployments?sha=${HEAD_SHA}&per_page=20`);
  for (const d of deployments) {
    if (!/preview/i.test(d.environment ?? "")) continue;
    const [latest] = await api(`/deployments/${d.id}/statuses?per_page=1`);
    if (!latest) continue;
    last = `${d.environment}: ${latest.state}`;
    if (latest.state === "success") {
      const url = latest.environment_url || latest.target_url;
      console.log(`Preview ready: ${url}`);
      if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `url=${url}\n`);
      process.exit(0);
    }
    if (latest.state === "failure" || latest.state === "error") {
      console.error(`Preview deployment ${latest.state}: ${latest.log_url ?? ""}`);
      process.exit(1);
    }
  }
  console.log(`Waiting for the preview (${last})…`);
  await sleep(15_000);
}
console.error(`No successful preview deployment for ${HEAD_SHA} within ${waitMs / 60_000} min (last: ${last})`);
process.exit(1);
