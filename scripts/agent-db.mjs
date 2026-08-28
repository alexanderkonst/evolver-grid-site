#!/usr/bin/env node
// agent-db.mjs — terminal client for the agent-db edge function.
//
// The permanent, Lovable-free way to read/write the project DB from this machine.
// Auth token (AGENT_DB_TOKEN) is read from the environment, or from .env.local
// (gitignored). Must match the AGENT_DB_TOKEN secret set in Lovable.
//
// Usage:
//   node scripts/agent-db.mjs '{"op":"select","table":"quiz_results","limit":5}'
//   node scripts/agent-db.mjs '{"op":"upsert","table":"founder_corpus_docs","values":{"path":"x","content":"y"}}'
//   node scripts/agent-db.mjs '{"op":"update","table":"quiz_results","match":{"id":"..."},"values":{"means":true}}'
//
// Programmatic:  import { agentDb } from "./scripts/agent-db.mjs";
//                await agentDb({ op: "select", table: "quiz_results", limit: 5 });

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FN_URL = "https://jypjttotvastdhanwvrx.supabase.co/functions/v1/agent-db";

function loadToken() {
  if (process.env.AGENT_DB_TOKEN) return process.env.AGENT_DB_TOKEN;
  for (const f of [".env.local", ".env"]) {
    try {
      const line = readFileSync(join(ROOT, f), "utf8")
        .split("\n")
        .find((l) => l.trim().startsWith("AGENT_DB_TOKEN="));
      if (line) return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
    } catch { /* file may not exist */ }
  }
  return null;
}

export async function agentDb(payload) {
  const token = loadToken();
  if (!token) throw new Error("AGENT_DB_TOKEN not found (env or .env.local)");
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-agent-token": token },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { status: res.status, body };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/agent-db.mjs \'{"op":"select","table":"quiz_results","limit":5}\'');
    process.exit(1);
  }
  let payload;
  try { payload = JSON.parse(arg); } catch (e) {
    console.error("Argument must be valid JSON:", e.message);
    process.exit(1);
  }
  const { status, body } = await agentDb(payload);
  console.log(JSON.stringify(body, null, 2));
  process.exit(status >= 200 && status < 300 && body?.ok !== false ? 0 : 1);
}
