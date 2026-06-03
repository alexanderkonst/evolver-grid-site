#!/usr/bin/env python3
"""
session-log-nudge.py — Stop hook.

If src/ or docs/ changed in this session AND docs/09-logs/session_log.md does
NOT contain today's date, print a soft one-line nudge to stderr. Never blocks.
Never denies. The session log is a meaning-making artifact; blocking it would
kill the practice.

Override: ignore the nudge. Walk past.

Anti-dogma: if the nudge becomes noise, remove the hook. See .agent/hooks.md.
"""

from __future__ import annotations
import datetime as dt
import json
import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0  # never block

    cwd = Path(data.get("cwd") or os.getcwd())

    session_log = cwd / "docs" / "09-logs" / "session_log.md"
    if not session_log.exists():
        return 0

    # Did src/ or docs/ change in the working tree?
    try:
        out = subprocess.run(
            ["git", "-C", str(cwd), "status", "--porcelain"],
            capture_output=True,
            text=True,
            timeout=5,
        )
    except Exception:
        return 0
    if out.returncode != 0:
        return 0

    changed_relevant = False
    for line in out.stdout.splitlines():
        # Format: "XY path" — strip first 3 chars safely
        if len(line) < 4:
            continue
        path = line[3:].strip()
        # Rename line may be "old -> new"; take the new half
        if " -> " in path:
            path = path.split(" -> ", 1)[1].strip()
        if path.startswith("src/") or path.startswith("docs/"):
            # Ignore changes to the log itself to avoid self-fulfilling prophecy.
            if path == "docs/09-logs/session_log.md":
                continue
            changed_relevant = True
            break

    if not changed_relevant:
        return 0

    today = dt.date.today().isoformat()
    try:
        content = session_log.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return 0

    if today in content:
        return 0

    print(
        f"\n[nudge] src/ or docs/ changed this session and session_log.md has no entry for {today}. "
        "Consider a one-paragraph log. (Ignore this freely — it never blocks.)\n",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
