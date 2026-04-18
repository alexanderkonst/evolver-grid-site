# Canon Lock Registry

*Paragraphs Sasha has explicitly crystallized and does not want silently paraphrased by any AI. This file starts empty and stays empty until Sasha opts a specific paragraph in.*

---

## Philosophy

Canon-lock is **not** a list of important paragraphs. It is a list of **locked** paragraphs — text Sasha has already thought through at depth, where any AI-driven change (rename, re-word, "cleanup") is almost certainly a loss.

If you catch yourself wanting to add something here because it "feels important" — don't. Importance is not the criterion. **Crystallization** is. Is this the final phrasing that earned its right to be preserved? If not, leave it out. Let it keep evolving.

A locked paragraph is a declaration: "this thought is finished. Touch the surrounding paragraphs freely; this one needs an override." The price of being wrong about finality is friction. So be conservative.

---

## Format

Each entry looks exactly like this:

```
### file: docs/02-strategy/unique-businesses/alexanders_unique_business.md

```text
<the exact paragraph, line-for-line, as it must continue to appear>
```

Notes: <optional — why this is locked, who locked it, date>
```

The parser reads:
1. `### file: <path>` — the file whose content will be checked.
2. The next fenced ```text block — the locked paragraph.
3. On PreToolUse for Edit/Write/MultiEdit on that path, the projected new content must still contain that exact text (exact match, whitespace-collapsed).

Multiple entries per file are allowed. Just repeat the `### file:` header.

---

## Override

If the canon genuinely deepens and a locked paragraph needs to be updated:

- **Option A (single edit):** run the editing command with `SASHA_CANON_UPDATE=1` in env.
- **Option B (permanent update):** edit this file first — replace the locked text with the new crystallization, then make the file edit normally. This is preferred when the new phrasing is itself a crystallization worth locking.

Option B keeps canon current. Option A is a one-time escape.

---

## Removal

A locked paragraph can be removed from this registry at any time. Removal is a normal act — it means "this paragraph is now in active evolution again, touch it freely." Removal is not a demotion. Sometimes crystallizations melt back into draft on purpose.

---

## Locked paragraphs

*(empty — add entries below as Sasha opts them in)*
