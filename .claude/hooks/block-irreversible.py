#!/usr/bin/env python3
"""
block-irreversible.py — PreToolUse hook for Bash.

Blocks a small set of irreversible-or-destructive shell actions that cannot be
undone by running `deploy` again. These are asymmetric: cost of the mistake is
unbounded; cost of the pause is a single env flag.

Currently blocked:
  - git push --force / -f  (including force-push to main/master)
  - git commit --no-verify / --no-gpg-sign
  - DROP TABLE / DROP DATABASE / DROP COLUMN
  - TRUNCATE TABLE
  - DELETE FROM <table>   (without a WHERE clause)
  - rm -rf on / , ~ , /Users , /home , parent paths, or the project root

Override: SASHA_OVERRIDE=1

Anti-dogma: if any of these rules start to feel wrong, remove them. See .agent/hooks.md.
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
    # Staying silent + exit 0 = allow.
    sys.exit(0)


def main() -> None:
    if os.environ.get("SASHA_OVERRIDE") == "1":
        allow()

    try:
        data = json.load(sys.stdin)
    except Exception:
        # If we can't parse input, don't block the model — fail open, log to stderr.
        print("block-irreversible: could not parse stdin", file=sys.stderr)
        allow()

    if data.get("tool_name") != "Bash":
        allow()

    cmd = (data.get("tool_input") or {}).get("command", "")
    if not cmd:
        allow()

    # Normalize for pattern checks.
    lower = cmd.lower()

    # --- git force-push ---
    if re.search(r"\bgit\s+push\b.*(--force\b|\s-f\b|--force-with-lease)", cmd):
        # --force-with-lease is substantially safer; allow it.
        if "--force-with-lease" in cmd and "--force " not in cmd and not re.search(r"\s-f\b", cmd):
            pass
        else:
            block(
                "git force-push is blocked. Use --force-with-lease for a safer alternative, "
                "or set SASHA_OVERRIDE=1 if you truly mean to rewrite remote history."
            )

    # --- git commit with skipped safeguards ---
    if re.search(r"\bgit\s+commit\b.*--no-verify", cmd):
        block(
            "git commit --no-verify is blocked — fix the failing hook instead. "
            "SASHA_OVERRIDE=1 to bypass."
        )
    if re.search(r"\bgit\s+commit\b.*--no-gpg-sign", cmd):
        block(
            "git commit --no-gpg-sign is blocked — don't skip signing. "
            "SASHA_OVERRIDE=1 to bypass."
        )

    # --- SQL destructive statements (best-effort string match) ---
    if re.search(r"\bdrop\s+(table|database|column|schema)\b", lower):
        block(
            "SQL DROP is blocked — pause and show the migration plan first. "
            "SASHA_OVERRIDE=1 to bypass."
        )
    if re.search(r"\btruncate\s+table\b", lower) or re.search(r"\btruncate\s+[a-z_.\"]+", lower):
        block(
            "SQL TRUNCATE is blocked — destroys all rows. "
            "SASHA_OVERRIDE=1 to bypass."
        )
    if re.search(r"\bdelete\s+from\s+", lower) and not re.search(r"\bwhere\b", lower):
        block(
            "SQL DELETE FROM without WHERE is blocked — would wipe the table. "
            "SASHA_OVERRIDE=1 if that is truly the intent."
        )

    # --- rm -rf on dangerous paths ---
    # Check each `rm ...` segment in the command. We want recursive AND force
    # present in the same segment, in any flag form (-rf, -r -f, -Rf, --recursive --force).
    # Split on shell-ish separators so pipelines/compound commands are inspected segment by segment.
    segments = re.split(r"[;&|]+|&&|\|\|", cmd)
    for seg in segments:
        # Only care about segments that invoke rm.
        m = re.search(r"\brm\b(.*)", seg)
        if not m:
            continue
        rest = m.group(1)

        # Does this rm invocation have both recursive and force?
        tokens = re.split(r"\s+", rest.strip())
        short_flags = ""
        long_flags = set()
        args = []
        for tok in tokens:
            t = tok.strip()
            if not t:
                continue
            if t.startswith("--"):
                long_flags.add(t.lstrip("-"))
            elif t.startswith("-") and len(t) > 1 and not t[1].isdigit():
                # Combined short flags like -rf, -Rf
                short_flags += t[1:]
            else:
                args.append(t.strip("'\""))

        has_recursive = ("r" in short_flags) or ("R" in short_flags) or ("recursive" in long_flags)
        has_force = ("f" in short_flags) or ("force" in long_flags)
        if not (has_recursive and has_force):
            continue

        dangerous_targets = {
            "/", "/*", "~", "~/", "$HOME", "$HOME/",
            "/Users", "/Users/", "/home", "/home/",
            "..", "../", ".", "./",
        }
        project_roots = ("evolver-grid-site", "evolver-grid-site/")

        for t in args:
            if not t:
                continue
            if t in dangerous_targets or t.rstrip("/") + "/" in dangerous_targets or t.rstrip("/") in {d.rstrip("/") for d in dangerous_targets}:
                block(
                    f"rm -rf on {t!r} is blocked. SASHA_OVERRIDE=1 if you really mean it."
                )
            if any(t == pr.rstrip("/") or t.endswith("/" + pr.rstrip("/")) for pr in project_roots):
                block(
                    f"rm -rf on project root ({t!r}) is blocked. SASHA_OVERRIDE=1 if you really mean it."
                )

    allow()


if __name__ == "__main__":
    main()
