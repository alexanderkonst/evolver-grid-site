#!/usr/bin/env python3
"""PostToolUse hook — humanizer guarantee for user-facing copy.

Sasha's standard: external-facing copy never ships with AI-writing tells.
Whether the copy was written through the Edit/Write tools OR through a Bash
python script (both happen in this repo), any change under src/locales/
fires a reminder to run the humanizer skill over the strings just changed.
It's a deterministic nudge, not left to the agent's discretion.

Reads the PostToolUse JSON on stdin; emits additionalContext only when a
locale file was actually WRITTEN (reads of locale files don't trigger it).
Silent otherwise. Never blocks.
"""
import json
import re
import sys

REMINDER = (
    "You just changed user-facing copy under src/locales/. Before treating "
    "this copy as done, run the humanizer skill over the exact strings you "
    "changed and apply its fixes: strip AI-writing tells (em-dash overuse, "
    "rule-of-three, inflated/promotional phrasing, negative parallelisms, "
    "'Not X. Y.' constructions, vague attributions, filler). This is required "
    "for all external-facing copy and is not optional. Note in your reply that "
    "the humanizer pass was applied. (This reminder is from a deterministic "
    "hook, .claude/hooks/humanizer-nudge.py, not the model's discretion.)"
)

# For a Bash command to count as a copy WRITE (not just a read/grep of a
# locale), it must carry a write signal alongside the src/locales/ mention.
WRITE_SIGNAL = re.compile(
    r"json\.dump|io\.open\([^)]*['\"]w|open\([^)]*['\"]w|\.write\(|>\s*[^|&]*src/locales|tee\b",
)


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    tool = data.get("tool_name", "")
    ti = data.get("tool_input", {}) or {}

    touched = False
    if tool in ("Edit", "Write", "MultiEdit"):
        touched = "src/locales/" in (ti.get("file_path", "") or "")
    elif tool == "Bash":
        cmd = ti.get("command", "") or ""
        touched = ("src/locales/" in cmd) and bool(WRITE_SIGNAL.search(cmd))

    if touched:
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": REMINDER,
            }
        }))


if __name__ == "__main__":
    main()
