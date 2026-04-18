#!/usr/bin/env node
// Smoke test: start the server on stdio, do a JSON-RPC handshake, and list tools.
// Does NOT call `claude` — just verifies the MCP protocol layer.

import { spawn } from "node:child_process";
import { join } from "node:path";

const SERVER = join(import.meta.dirname, "server.mjs");

const child = spawn("node", [SERVER], {
  stdio: ["pipe", "pipe", "pipe"],
});

let stdoutBuf = "";
const pending = new Map();
let nextId = 1;

function send(method, params = {}) {
  const id = nextId++;
  const msg = { jsonrpc: "2.0", id, method, params };
  child.stdin.write(JSON.stringify(msg) + "\n");
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

child.stdout.on("data", (data) => {
  stdoutBuf += data.toString();
  let newlineIdx;
  while ((newlineIdx = stdoutBuf.indexOf("\n")) !== -1) {
    const line = stdoutBuf.slice(0, newlineIdx);
    stdoutBuf = stdoutBuf.slice(newlineIdx + 1);
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id != null && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    } catch (err) {
      console.error("Failed to parse line:", line, err.message);
    }
  }
});

child.stderr.on("data", (d) => {
  process.stderr.write(`[server stderr] ${d.toString()}`);
});

async function main() {
  const init = await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {} },
    clientInfo: { name: "smoke", version: "0.0.1" },
  });
  console.log("✓ initialize →", init.serverInfo);

  // Notify initialized
  child.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }) + "\n"
  );

  const tools = await send("tools/list");
  console.log(`✓ tools/list → ${tools.tools.length} tools`);
  for (const t of tools.tools) {
    console.log(`  · ${t.name}`);
  }

  // Try list_briefs on this very repo
  const repo = join(import.meta.dirname, "..", "..");
  const briefs = await send("tools/call", {
    name: "list_briefs",
    arguments: { cwd: repo },
  });
  const parsed = JSON.parse(briefs.content[0].text);
  console.log(`✓ list_briefs → ${parsed.count} pending briefs`);

  console.log("\nALL SMOKE CHECKS PASSED");
  child.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error("SMOKE FAILED:", err.message);
  child.kill();
  process.exit(1);
});
