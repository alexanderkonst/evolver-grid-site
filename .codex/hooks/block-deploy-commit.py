#!/usr/bin/env python3
"""
block-deploy-commit.py — PreToolUse hook for Bash.

Blocks AI commits with the message literally "deploy". Purpose: keep `git log`
readable. When Claude Code commits autonomously (via the MCP bridge), each
commit is a discrete unit of work; a descriptive single-sentence message
makes retrospective navigation trivial. The one-word `deploy` is what
Sasha's deploy one-liner writes when it sweeps up uncommitted dirty-tree
edits — that's a different use-case (a batch snapshot) and belongs to the
terminal, not to a Claude Code session.

Override: SASHA_OVERRIDE=1

Anti-dogma: if the convention changes or readable history stops being
a priority, delete this hook. See .agent/hooks.md.
"""

from __future__ import annotations
import json
import os
import re
import sys


def block(reason: str) -> None:
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }
    print(json.dumps(payload))
    sys.exit(0)


def allow() -> None:
    sys.exit(0)


def main() -> None:
    if os.environ.get("SASHA_OVERRIDE") == "1":
        allow()

    try:
        data = json.load(sys.stdin)
    except Exception:
        print("block-deploy-commit: could not parse stdin", file=sys.stderr)
        allow()

    if data.get("tool_name") != "Bash":
        allow()

    cmd = (data.get("tool_input") or {}).get("command", "")
    if not cmd or "git commit" not in cmd:
        allow()

    # Match -m "deploy" or -m 'deploy' or --message "deploy" (case-insensitive, whitespace tolerant).
    patterns = [
        r"""-m\s+["']\s*deploy\s*["']""",
        r"""--message[= ]\s*["']\s*deploy\s*["']""",
        r"""-m=["']\s*deploy\s*["']""",
    ]
    for p in patterns:
        if re.search(p, cmd, re.IGNORECASE):
            block(
                'git commit -m "deploy" is the terminal-sweep message, not an '
                "AI-commit message. When Claude Code commits autonomously, use a "
                "descriptive single-sentence message so `git log` stays readable. "
                "SASHA_OVERRIDE=1 to bypass."
            )

    allow()


if __name__ == "__main__":
    main()
