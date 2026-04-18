# MCP Claude-Code Bridge

Local MCP (stdio) server that lets **Cowork Claude** dispatch tasks to **Claude Code** running in headless mode on the same Mac. Closes the orchestration loop from `docs/06-architecture/autonomous-navigation-loop.md` — Cowork becomes the orchestrator, Claude Code the executor.

## What it exposes

Three tools, registered in Cowork once you install the server:

| Tool | Purpose |
|---|---|
| `dispatch_task` | Run an arbitrary prompt in Claude Code in a given repo (`claude -p`). Blocking. Returns structured JSON. |
| `dispatch_brief` | Wraps `dispatch_task` for this repo's convention: read an `ai_tasks/PENDING_*.md` brief, execute end-to-end per AGENTS.md, rename to `DONE_*.md` with "Notes from execution". |
| `list_briefs` | List pending briefs in `<repo>/ai_tasks/` — discovery. |

## Requirements

- macOS (paths below are macOS-specific; Linux/Windows paths noted inline)
- Node.js 18+
- `claude` CLI on PATH. Verify: `claude --version`. If missing, install via `npm install -g @anthropic-ai/claude-code` or from the Claude Code desktop app's install flow.
- Claude Code authenticated. The bridge spawns `claude -p` as a child process that inherits the parent env; your existing desktop-app login / `ANTHROPIC_API_KEY` is picked up automatically.

## Install

```bash
# From the repo root
cd scripts/mcp-claude-code-bridge
npm install
```

## Register with Cowork

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (create it if it doesn't exist; on Linux use `~/.config/Claude/claude_desktop_config.json`).

Add the `claude-code-bridge` entry under `mcpServers`:

```json
{
  "mcpServers": {
    "claude-code-bridge": {
      "command": "node",
      "args": [
        "<ABS_PATH_TO_REPO>/scripts/mcp-claude-code-bridge/server.mjs"
      ]
    }
  }
}
```

Replace `<ABS_PATH_TO_REPO>` with the absolute path to `evolver-grid-site` on your Mac (e.g. `/Users/sasha/work/evolver-grid-site`).

**Restart Cowork** (quit + relaunch). The three tools should appear as `mcp__claude-code-bridge__dispatch_task`, `mcp__claude-code-bridge__dispatch_brief`, `mcp__claude-code-bridge__list_briefs`.

## Verify

In Cowork, ask:

> "List the pending briefs in evolver-grid-site."

Cowork Claude should call `list_briefs` and return the `ai_tasks/PENDING_*.md` entries.

Then — the real test:

> "Dispatch `ai_tasks/PENDING_founder_state_view.md` to Claude Code in `--plan` mode."

That runs `dispatch_brief` with `mode: "plan"`. Claude Code reads the brief, returns an execution plan without editing files. If that works, flip to `mode: "apply"` for real execution.

## Smoke test (protocol layer only, no `claude` call)

```bash
cd scripts/mcp-claude-code-bridge
node smoke.mjs
```

Confirms the MCP handshake + tool registration + `list_briefs`. Does **not** spawn `claude`.

## Tool reference

### `dispatch_task`

```jsonc
{
  "prompt": "...",                    // required
  "cwd": "/abs/path/to/repo",         // required, must be absolute
  "allowed_tools": "Read,Edit,Bash",  // optional
  "permission_mode": "acceptEdits",   // optional: default | acceptEdits | dontAsk
  "append_system_prompt": "...",      // optional
  "timeout_ms": 900000                // optional, default 600000 (10 min)
}
```

Returns:

```jsonc
{
  "exit_code": 0,
  "killed_by_timeout": false,
  "started_at": "2026-04-18T…",
  "finished_at": "2026-04-18T…",
  "cwd": "/abs/path/to/repo",
  "cli_args": ["-p", "<prompt 1234 chars>", "--output-format", "json", ...],
  "stdout_raw": "…",                  // truncated to 20 000 chars
  "stderr_raw": "…",                  // truncated to 8 000 chars
  "result": "…",                      // Claude Code's final reply
  "session_id": "…",                  // resume with this id later (Phase 2)
  "usage": { "input_tokens": N, "output_tokens": N }
}
```

### `dispatch_brief`

```jsonc
{
  "brief_path": "ai_tasks/PENDING_founder_state_view.md",  // required
  "cwd": "/abs/path/to/repo",                              // required
  "mode": "apply",                                         // 'plan' | 'apply' (default)
  "allowed_tools": "Read,Edit,Bash,Grep,Glob",
  "permission_mode": "acceptEdits",
  "timeout_ms": 1800000                                    // 30 min for big briefs
}
```

`mode: "plan"` ⇒ dry-run, returns the execution plan. `mode: "apply"` ⇒ full execution + rename-to-DONE.

### `list_briefs`

```jsonc
{ "cwd": "/abs/path/to/repo" }
```

Returns:

```jsonc
{
  "ai_tasks_dir": "/abs/path/to/repo/ai_tasks",
  "count": 5,
  "briefs": [
    "PENDING_directive_engine.md",
    "PENDING_founder_state_view.md",
    ...
  ]
}
```

## Phase 2 — backlog (not shipped)

- **Background dispatch + poll.** Today every call is blocking (10-min default, 30-min upper bound). A `dispatch_task_async(prompt, cwd)` returning a `run_id` + `get_run_status(run_id)` / `get_run_result(run_id)` would let Cowork fire-and-forget, check back later, and run multiple Claude Code instances concurrently.
- **Session resume.** Claude Code supports `--resume <session_id>`. Phase 2 would expose `dispatch_resume(session_id, follow_up_prompt)` so Cowork can iterate on the same session.
- **Streaming output.** Swap `--output-format json` for `--output-format stream-json` and forward events via MCP progress notifications, so long runs surface partial progress instead of a 10-minute silence.
- **Git context.** Auto-append current branch + working-tree status to the prompt so Claude Code knows what's uncommitted before it starts.
- **Audit log.** Record every dispatch + result to `docs/09-logs/dispatch-log.md` with run duration, exit code, and session id. Makes the autonomy trail reviewable.

## Hard constraints (read before extending)

1. **Never silently commit or push.** The bridge forwards control to Claude Code; Claude Code's own safety posture applies. But the bridge itself must not add git operations.
2. **`cwd` must be absolute.** Refused with an error message otherwise — protects against running `claude` in the Cowork sandbox root by mistake.
3. **Timeouts are a backstop, not a feature.** If runs routinely hit timeout, raise the brief's scope question, don't just raise `timeout_ms`.
4. **No secret handling.** The bridge doesn't read API keys; it inherits the parent process env. If that env doesn't have what Claude Code needs, fix it at the shell / desktop-app level.
