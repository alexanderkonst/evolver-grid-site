#!/usr/bin/env python3
"""
canon-lock.py — PreToolUse hook for Edit | Write | MultiEdit.

Checks that locked paragraphs registered in .agent/canon-lock.md still appear
verbatim (whitespace-collapsed) in the projected new file contents. If a lock
would be broken silently, block.

Registry format in .agent/canon-lock.md:

    ### file: <relative path>

    ```text
    <the exact paragraph, line-for-line>
    ```

Multiple entries per file are allowed — just repeat the `### file:` header.

Override: SASHA_CANON_UPDATE=1   (one-shot, to update canon intentionally)
          OR edit .agent/canon-lock.md to match the new canon.

Anti-dogma: canon evolves. If a lock has become a cage, unlock it.
See .agent/hooks.md.
"""

from __future__ import annotations
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List


REGISTRY_PATHS = [
    ".agent/canon-lock.md",
]


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


def _normalize(s: str) -> str:
    """Collapse whitespace so minor reflows don't trigger false positives."""
    return re.sub(r"\s+", " ", s).strip()


def _load_registry(cwd: Path) -> Dict[str, List[str]]:
    r"""
    Parse all registry files. Returns {relative_file_path: [locked_paragraph, ...]}.
    Recognizes `### file: <path>` headers followed by the next ```text fenced block.

    Fence-aware: directives (`### file: ...`) are only recognized when they
    appear OUTSIDE a markdown code-fence. This prevents example/documentation
    entries inside outer fences (in the "Format" section of canon-lock.md)
    from being mis-parsed as real registrations. Fence state is tracked by
    treating any line matching `^\s*```` as a toggle.

    The ```text fence that immediately follows a real `### file:` directive
    IS itself a fence-open, and we consume paragraph content until the next
    ``` close. That loop is separate from the outer fence-state tracker used
    for directive detection.
    """
    out: Dict[str, List[str]] = {}
    fence_line_re = re.compile(r"^\s*```")
    text_fence_re = re.compile(r"^\s*```text\s*$")
    close_fence_re = re.compile(r"^\s*```\s*$")
    directive_re = re.compile(r"^\s*###\s*file:\s*(.+?)\s*$")

    for rel in REGISTRY_PATHS:
        p = cwd / rel
        if not p.exists():
            continue
        try:
            txt = p.read_text(encoding="utf-8")
        except Exception:
            continue

        lines = txt.split("\n")

        # Precompute in_fence[i] = "was line i inside an open fence, based on
        # the state BEFORE this line's potential toggle". A line that itself
        # is a fence marker is considered inside the fence iff we were already
        # in one — i.e. it's the closing marker of that fence.
        in_fence: List[bool] = [False] * len(lines)
        state = False
        for i, line in enumerate(lines):
            if fence_line_re.match(line):
                in_fence[i] = state
                state = not state
            else:
                in_fence[i] = state

        # Walk the file, locking every out-of-fence `### file:` header to the
        # next ```text block.
        i = 0
        while i < len(lines):
            if in_fence[i]:
                i += 1
                continue
            m = directive_re.match(lines[i])
            if not m:
                i += 1
                continue
            file_path = m.group(1).strip()
            # Find next ```text fence (also skipping if currently inside a
            # fence — shouldn't happen given we're already out, but guard).
            j = i + 1
            while j < len(lines) and not text_fence_re.match(lines[j]):
                j += 1
            if j >= len(lines):
                i += 1
                continue
            k = j + 1
            buf: List[str] = []
            while k < len(lines) and not close_fence_re.match(lines[k]):
                buf.append(lines[k])
                k += 1
            if k >= len(lines):
                i += 1
                continue
            paragraph = "\n".join(buf).strip()
            if paragraph:
                out.setdefault(file_path, []).append(paragraph)
            i = k + 1

    return out


def _project_new_contents(tool_name: str, tool_input: dict, cwd: Path) -> str | None:
    """
    Simulate what the file will look like after the edit, as a single string.
    Returns None if we cannot reliably project (in which case: fail open).
    """
    file_path = tool_input.get("file_path")
    if not file_path:
        return None

    p = Path(file_path)
    if not p.is_absolute():
        p = cwd / p

    if tool_name == "Write":
        return tool_input.get("content", "")

    # For Edit / MultiEdit we need the current file to apply replacements against.
    try:
        current = p.read_text(encoding="utf-8")
    except Exception:
        # If we cannot read the file, we cannot verify — fail open.
        return None

    if tool_name == "Edit":
        old = tool_input.get("old_string", "")
        new = tool_input.get("new_string", "")
        replace_all = bool(tool_input.get("replace_all", False))
        if old == "":
            return current
        if replace_all:
            return current.replace(old, new)
        return current.replace(old, new, 1)

    if tool_name == "MultiEdit":
        edits = tool_input.get("edits") or []
        text = current
        for e in edits:
            old = e.get("old_string", "")
            new = e.get("new_string", "")
            replace_all = bool(e.get("replace_all", False))
            if old == "":
                continue
            if replace_all:
                text = text.replace(old, new)
            else:
                text = text.replace(old, new, 1)
        return text

    return None


def main() -> None:
    if os.environ.get("SASHA_CANON_UPDATE") == "1":
        allow()

    try:
        data = json.load(sys.stdin)
    except Exception:
        print("canon-lock: could not parse stdin", file=sys.stderr)
        allow()

    tool_name = data.get("tool_name")
    if tool_name not in ("Edit", "Write", "MultiEdit"):
        allow()

    tool_input = data.get("tool_input") or {}
    file_path = tool_input.get("file_path")
    if not file_path:
        allow()

    cwd = Path(data.get("cwd") or os.getcwd())

    registry = _load_registry(cwd)
    if not registry:
        allow()

    # Resolve edited file to a path relative to cwd, so we can match the registry keys.
    try:
        edited = Path(file_path)
        if edited.is_absolute():
            rel_edited = edited.resolve().relative_to(cwd.resolve())
        else:
            rel_edited = edited
        rel_edited_str = str(rel_edited).replace(os.sep, "/")
    except Exception:
        allow()

    locked_paragraphs = registry.get(rel_edited_str)
    if not locked_paragraphs:
        # Also try with a leading ./
        locked_paragraphs = registry.get(f"./{rel_edited_str}")
    if not locked_paragraphs:
        allow()

    new_contents = _project_new_contents(tool_name, tool_input, cwd)
    if new_contents is None:
        # Could not reliably project — do not falsely accuse. Allow.
        allow()

    normalized_new = _normalize(new_contents)
    broken = []
    for para in locked_paragraphs:
        if _normalize(para) not in normalized_new:
            preview = para.strip().splitlines()[0][:120]
            broken.append(preview)

    if broken:
        msg = (
            f"canon-lock: edit to {rel_edited_str} would silently remove or alter a locked "
            f"paragraph. Locked paragraph(s) not found in projected new content:\n"
        )
        for b in broken:
            msg += f"  • {b}\n"
        msg += (
            "If canon has genuinely deepened, update .agent/canon-lock.md to match the new "
            "crystallization, or set SASHA_CANON_UPDATE=1 for a one-shot override."
        )
        block(msg)

    allow()


if __name__ == "__main__":
    main()
