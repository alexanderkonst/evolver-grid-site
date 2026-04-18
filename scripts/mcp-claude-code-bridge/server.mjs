#!/usr/bin/env node
// MCP Claude Code Bridge — stdio server.
//
// Purpose: lets Cowork Claude (parent process) dispatch tasks to Claude Code
// (child process) running in headless mode via `claude -p`.
//
// Exposes three tools:
//   - dispatch_task    — generic: run an arbitrary prompt in a given repo
//   - dispatch_brief   — wraps dispatch_task with the standard PENDING_*.md
//                        brief-execution shape used in this repo (see AGENTS.md)
//   - list_briefs      — discovery: list PENDING_*.md files in <cwd>/ai_tasks/
//
// All calls are blocking — the bridge waits for Claude Code to finish and
// returns the structured JSON from `--output-format json`. Async/background
// dispatch is Phase 2 (see README).
//
// Requirements on the Mac running this:
//   - `claude` CLI available on PATH (`claude --version` must succeed)
//   - Claude Code authenticated (session inherits parent env, incl. any
//     ANTHROPIC_API_KEY or the Claude subscription login the desktop app uses)

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve, isAbsolute } from "node:path";

const SERVER_INFO = { name: "claude-code-bridge", version: "0.1.0" };
const DEFAULT_TIMEOUT_MS = 600_000; // 10 minutes

const server = new Server(SERVER_INFO, { capabilities: { tools: {} } });

// ──────────────────────────────────────────────────────────────────────────
// Tool definitions
// ──────────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "dispatch_task",
    description:
      "Dispatch an arbitrary prompt to Claude Code in headless mode. " +
      "Spawns `claude -p <prompt> --output-format json` in the specified " +
      "working directory and returns the structured result. Blocking — may " +
      "take several minutes for multi-file tasks; raise `timeout_ms` for " +
      "long runs.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "The task prompt to send to Claude Code.",
        },
        cwd: {
          type: "string",
          description:
            "Absolute path to the repo where Claude Code should run (must exist).",
        },
        allowed_tools: {
          type: "string",
          description:
            "Comma-separated list of tool names to auto-approve " +
            "(e.g. 'Read,Edit,Bash'). Omit to use defaults.",
        },
        permission_mode: {
          type: "string",
          enum: ["default", "acceptEdits", "dontAsk"],
          description:
            "Permission baseline for Claude Code tool use. " +
            "'acceptEdits' auto-approves file edits; 'dontAsk' auto-approves everything.",
        },
        append_system_prompt: {
          type: "string",
          description:
            "Optional extra instruction appended to Claude Code's system prompt.",
        },
        timeout_ms: {
          type: "number",
          description:
            "Kill the subprocess if it runs longer than this many ms. Default 600000 (10 min).",
        },
      },
      required: ["prompt", "cwd"],
    },
  },
  {
    name: "dispatch_brief",
    description:
      "Dispatch an ai_tasks/PENDING_*.md brief to Claude Code for end-to-end " +
      "execution per AGENTS.md conventions. Wraps dispatch_task with a " +
      "standard prompt: read the brief file, execute it, then rename the " +
      "file to DONE_*.md with a 'Notes from execution' section.",
    inputSchema: {
      type: "object",
      properties: {
        brief_path: {
          type: "string",
          description:
            "Path to the brief, either absolute or relative to `cwd` " +
            "(e.g. 'ai_tasks/PENDING_founder_state_view.md').",
        },
        cwd: {
          type: "string",
          description: "Absolute path to the repo.",
        },
        mode: {
          type: "string",
          enum: ["plan", "apply"],
          description:
            "'plan' = Claude Code reads the brief and returns an execution plan " +
            "without writing files. 'apply' = full end-to-end execution. Default 'apply'.",
        },
        allowed_tools: { type: "string" },
        permission_mode: {
          type: "string",
          enum: ["default", "acceptEdits", "dontAsk"],
        },
        timeout_ms: { type: "number" },
      },
      required: ["brief_path", "cwd"],
    },
  },
  {
    name: "list_briefs",
    description:
      "List all ai_tasks/PENDING_*.md briefs in a repo. Useful for picking " +
      "the next brief to dispatch.",
    inputSchema: {
      type: "object",
      properties: {
        cwd: {
          type: "string",
          description: "Absolute path to the repo.",
        },
      },
      required: ["cwd"],
    },
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Tool handlers
// ──────────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    if (name === "dispatch_task") {
      const result = await runClaudeCode(args);
      return toolResult(result);
    }

    if (name === "dispatch_brief") {
      return await handleDispatchBrief(args);
    }

    if (name === "list_briefs") {
      return await handleListBriefs(args);
    }

    return errorResult(`Unknown tool: ${name}`);
  } catch (err) {
    return errorResult(`Tool ${name} threw: ${err.message}`);
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Handler: dispatch_brief
// ──────────────────────────────────────────────────────────────────────────

async function handleDispatchBrief(args) {
  const { brief_path, cwd, mode = "apply", ...rest } = args;
  if (!cwd || !isAbsolute(cwd)) {
    return errorResult(`'cwd' must be an absolute path (got: ${cwd})`);
  }
  const absBrief = isAbsolute(brief_path) ? brief_path : resolve(cwd, brief_path);

  let briefContent;
  try {
    briefContent = await readFile(absBrief, "utf8");
  } catch (err) {
    return errorResult(`Could not read brief at ${absBrief}: ${err.message}`);
  }

  const prompt = buildBriefPrompt({ brief_path, briefContent, mode });
  const result = await runClaudeCode({ prompt, cwd, ...rest });
  return toolResult({ ...result, brief_path, mode });
}

function buildBriefPrompt({ brief_path, briefContent, mode }) {
  if (mode === "plan") {
    return [
      `Read the brief below and return a concrete execution plan. DO NOT edit files — this is a dry-run.`,
      ``,
      `Brief path: ${brief_path}`,
      `--- BRIEF CONTENT ---`,
      briefContent,
      `--- END BRIEF ---`,
      ``,
      `Output shape: numbered list of steps you would take, with the files each step touches and the verification command you would run after each step. Flag any ambiguities or blockers in the brief before you propose execution.`,
    ].join("\n");
  }

  return [
    `Execute the following brief end-to-end per AGENTS.md conventions.`,
    ``,
    `Brief path: ${brief_path}`,
    `--- BRIEF CONTENT ---`,
    briefContent,
    `--- END BRIEF ---`,
    ``,
    `Operating protocol — READ \`.agent/deploy.md\` IN THIS REPO BEFORE COMMITTING. Summary:`,
    `  - This is a solo-founder repo. There is NO PR review, NO staging, NO branch protection.`,
    `  - Every push to \`main\` auto-deploys to three production surfaces simultaneously.`,
    `  - The full-autonomy default is: you make the changes, run verification, commit with a descriptive message, and push to \`main\` directly. Sasha (the user) does not need to do anything afterwards — the deploy fires automatically.`,
    ``,
    `When you are done with the work in the brief:`,
    `  1. Run \`npm run test\` — must be green.`,
    `  2. If you touched the corpus, run \`npm run corpus:drift\` — must be green.`,
    `  3. If you touched \`src/\`, run \`npx tsc --noEmit\` — must be green.`,
    `  4. Rename the brief from ${brief_path} to its DONE_*.md equivalent (swap PENDING_ for DONE_) and add a "Notes from execution" section at the bottom covering: what changed vs the brief, any pattern divergences, the names of new files/migrations, and the verification commands you ran with their results.`,
    `  5. \`git add -A\` everything (the renamed brief + the new code).`,
    `  6. Commit with a descriptive single-sentence message — NOT "deploy". Example: "Add founder_state_v1 view + /founders/:slug page". Never use \`--no-verify\` or \`--no-gpg-sign\`.`,
    `  7. \`git push origin main\` directly. Auto-deploy will fire.`,
    ``,
    `Pause and ask before executing if the brief implies any of these IRREVERSIBLE production actions: dropping a database column, deleting live files in Supabase Storage, moving money, or changing a live Stripe price id. For everything else: ship.`,
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────
// Handler: list_briefs
// ──────────────────────────────────────────────────────────────────────────

async function handleListBriefs({ cwd }) {
  if (!cwd || !isAbsolute(cwd)) {
    return errorResult(`'cwd' must be an absolute path (got: ${cwd})`);
  }
  const dir = join(cwd, "ai_tasks");
  try {
    const entries = await readdir(dir);
    const pending = entries
      .filter((e) => e.startsWith("PENDING_") && e.endsWith(".md"))
      .sort();
    return toolResult({
      ai_tasks_dir: dir,
      count: pending.length,
      briefs: pending,
    });
  } catch (err) {
    return errorResult(`Could not list ${dir}: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Core subprocess runner
// ──────────────────────────────────────────────────────────────────────────

function runClaudeCode({
  prompt,
  cwd,
  allowed_tools,
  permission_mode,
  append_system_prompt,
  timeout_ms,
}) {
  if (!cwd || !isAbsolute(cwd)) {
    return Promise.resolve({
      exit_code: -1,
      error: `'cwd' must be an absolute path (got: ${cwd})`,
    });
  }

  const args = ["-p", prompt, "--output-format", "json"];
  if (allowed_tools) args.push("--allowedTools", allowed_tools);
  if (permission_mode) args.push("--permission-mode", permission_mode);
  if (append_system_prompt) args.push("--append-system-prompt", append_system_prompt);

  const startedAt = new Date().toISOString();
  const timeout = timeout_ms ?? DEFAULT_TIMEOUT_MS;

  return new Promise((resolvePromise) => {
    let child;
    try {
      child = spawn("claude", args, {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });
    } catch (err) {
      resolvePromise({
        exit_code: -1,
        error: `Failed to spawn \`claude\`: ${err.message}. Is it on PATH?`,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let killedByTimeout = false;

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    const timer = setTimeout(() => {
      killedByTimeout = true;
      child.kill("SIGTERM");
    }, timeout);

    child.on("error", (err) => {
      clearTimeout(timer);
      resolvePromise({
        exit_code: -1,
        error: `spawn error: ${err.message}`,
        stdout,
        stderr,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);

      // Try to parse the last line as JSON (`--output-format json` emits a
      // single JSON object on stdout; some versions prepend diagnostic lines).
      let structured = null;
      const trimmed = stdout.trim();
      if (trimmed) {
        try {
          structured = JSON.parse(trimmed);
        } catch {
          // Fall back: find the last `{...}` block in stdout.
          const match = stdout.match(/\{[\s\S]*\}\s*$/);
          if (match) {
            try {
              structured = JSON.parse(match[0]);
            } catch {
              /* give up — keep raw stdout */
            }
          }
        }
      }

      resolvePromise({
        exit_code: code,
        killed_by_timeout: killedByTimeout,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
        cwd,
        cli_args: redactPrompt(args),
        stdout_raw: truncate(stdout, 20_000),
        stderr_raw: truncate(stderr, 8_000),
        result: structured?.result ?? null,
        session_id: structured?.session_id ?? null,
        usage: structured?.usage ?? null,
      });
    });
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function toolResult(obj) {
  return {
    content: [{ type: "text", text: JSON.stringify(obj, null, 2) }],
  };
}

function errorResult(message) {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

function truncate(s, n) {
  if (!s) return s;
  return s.length <= n ? s : s.slice(0, n) + `\n…(truncated ${s.length - n} chars)`;
}

function redactPrompt(args) {
  // For logging: strip the prompt value so we don't echo large briefs back
  // through the MCP channel. Keep flag names + short hash.
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-p" || args[i] === "--print") {
      out.push(args[i]);
      const next = args[i + 1] ?? "";
      out.push(`<prompt ${next.length} chars>`);
      i++;
    } else {
      out.push(args[i]);
    }
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
