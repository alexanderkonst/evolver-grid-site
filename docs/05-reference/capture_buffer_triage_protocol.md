# Capture Buffer Triage Protocol

> *© 2026 Alexander Konstantinov · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)*
>
> *v1.0 · May 12, 2026*
>
> Companion to: [alexanders_operating_system.md → The Capture Buffer](../02-strategy/alexanders_operating_system.md#the-capture-buffer--receiving-practice-at-lifetime-scale)

A monthly AI-assisted triage pass that turns Telegram capture-buffer entries into corpus moves, content drafts, module seeds, or pattern observations. The buffer accumulates raw signal across days/weeks/months at zero capture-friction; this protocol drains it cleanly into the corpus once per lunar cycle.

---

## When to Run

Once per lunar cycle, during **Week 4** (waxing → full moon, Air / receiving phase per the lunar holon mapping). The buffer drains in the same rhythm it accumulates.

If skipped one cycle, entries don't expire — they remain in the buffer. The triage is forgiving: do it next cycle.

---

## Input

Telegram chat export (HTML or JSON from Telegram Desktop):

1. Open Telegram Desktop → the self-chat / saved messages.
2. Three-dot menu → **Export chat history** → choose format (JSON preferred for AI ingestion; HTML for visual review).
3. Save to `docs/09-logs/capture_buffer_YYYY-MM-DD.[json|html]` — date = day of triage.

The same file can be re-triaged later (idempotent — already-processed entries are skipped by ID if a tracker file exists).

---

## Output

Two artifacts produced per triage:

1. **Triage table** — one row per entry, with the AI's triage call + destination + why + action. Stored at `docs/09-logs/capture_buffer_triage_YYYY-MM-DD.md`.
2. **Patterns + Recommended Sequence** — a section after the table identifying recurring themes across entries and the order-of-operations for Sasha's review pass.

---

## Output Schema (Triage Table)

| Column | Content |
|--------|---------|
| `id` | Sequential entry number (1, 2, 3, …) |
| `timestamp` | From the original message |
| `summary` | One-line distillation of the entry |
| `triage` | Exactly one of: `promote-to-corpus` · `publish-as-content` · `seed-of-new-module` · `part-of-recurring-pattern` · `not-ripe-stays-in-buffer` · `archive` |
| `destination` | Specific corpus path + section if `promote-to-corpus`. Specific pattern name + linked entry IDs if `part-of-recurring-pattern`. Specific surface + register if `publish-as-content`. Module candidate if `seed-of-new-module`. Empty otherwise. |
| `why` | ONE sentence on why this triage call landed |
| `action` | What Sasha does next with this entry (the concrete operator step) |

---

## Triage Categories (Definitions)

1. **`promote-to-corpus`** — The entry is a coherent, articulated insight that belongs in a specific existing corpus document, OR warrants a new dedicated document. The `destination` column names the file path + section. If it refines something already there, point at the line.

2. **`publish-as-content`** — The entry is ripe to become a public-facing artifact: LinkedIn post, broadcast email, tribe DM, X thread, life-update post. The `destination` column names the surface + register.

3. **`seed-of-new-module`** — The entry implies a new product, methodology, prompt, perspective, or playbook module that doesn't yet exist. The `destination` column names the module candidate. (Example: the Unifying Role prompt began as one of these.)

4. **`part-of-recurring-pattern`** — The entry is one instance of a larger pattern showing up multiple times across the buffer. The `destination` names the pattern + the other entry IDs that belong to it. Patterns often crystallize into new corpus sections that no single entry could anchor.

5. **`not-ripe-stays-in-buffer`** — The entry is a fragment that hasn't yet articulated itself into something corpus-worthy. Leave it in the buffer. The `why` notes the seed it might be growing into, if visible.

6. **`archive`** — The entry was a one-off note, a task that has been completed, a fragment that no longer carries signal, or a duplicate of something already in the corpus.

**Default when uncertain:** `not-ripe-stays-in-buffer`. The buffer is allowed to hold.

---

## The Prompt

Paste the following into a Claude / ChatGPT / Gemini session that has the corpus available (Claude in Cowork with the project; or upload the relevant docs alongside the export):

```
You are reading Alexander Konstantinov's (Sasha's) Telegram capture buffer — a low-friction landing strip for potent realizations across categories: technologies, psycho-technologies, universal ontologies, founder wisdom, startup playbooks, personal realizations, perspective shifts, AI realizations. Entries are time-ordered, captured raw without categories at the moment of arrival.

Your job: produce a triage table that turns the buffer into corpus moves, content drafts, module seeds, or pattern observations.

CONTEXT YOU MUST LOAD FIRST (in this order):

1. docs/docs_index.md — map of all 160+ documents
2. docs/02-strategy/unique-businesses/alexanders_unique_business.md — Sasha's unique business canvas (myth, tribe, gift v2.0, value ladder, methodology)
3. docs/02-strategy/alexanders_operating_system.md — his daily/weekly/lunar protocols, HD profile, Gene Keys, areas of expertise, growth edges, communication style
4. docs/01-vision/universal_ontology.md — his foundational ontology (Source, Field, Holonic principle, Dimensions as Perspectives, 7 Number-Prisms, Holonic Seeing Mode)
5. docs/01-vision/phase_shift_technology_library.md — his domain library (every realization indexed by domain number)
6. docs/03-playbooks/unique_business_playbook.md — the master methodology
7. docs/03-playbooks/integrated_product_building_workflow.md — the execution manual
8. docs/02-strategy/morphogenetic_holomap.md — the 27-perspective navigation instrument
9. docs/02-strategy/roadmap.md — current scope + active backlog

These give you Sasha's full vocabulary, the existing corpus structure, what already lives where, and what's been said. Triage every entry against this background.

TRIAGE CATEGORIES (apply EXACTLY one per entry):

1. promote-to-corpus — coherent insight that belongs in a specific document. Name file path + section.
2. publish-as-content — ripe to become a public artifact. Name surface + register.
3. seed-of-new-module — implies a new product/method/prompt/perspective that doesn't exist yet. Name the candidate.
4. part-of-recurring-pattern — one instance of a larger pattern showing up multiple times. Name the pattern, link the other entry IDs.
5. not-ripe-stays-in-buffer — fragment not yet articulated. Note the seed if visible.
6. archive — one-off note, completed task, dead signal, or duplicate.

Default when uncertain: not-ripe-stays-in-buffer. The buffer is allowed to hold.

OUTPUT FORMAT:

Step 1: Markdown table with columns: id · timestamp · summary · triage · destination · why · action.

Step 2: A "Patterns Across the Buffer" section. Name 2-5 recurring themes, with the entry IDs that exemplify each. These are signals that something coherent is forming across entries that no single one yet articulates — they often crystallize into the next major corpus addition.

Step 3: A "Recommended Sequence" section. Give Sasha the order of operations: which promote-to-corpus moves to do first (highest leverage), which publish-as-content items to ship this week, which seed-of-new-module items deserve a roadmap line.

Step 4: A "Friction Notes" section (optional). Flag any entries that challenge or contradict an existing corpus position — those are the most valuable kind of entry, often a precursor to the next version of the master text.

QUALITY BAR:

- Specific destinations only — "docs/01-vision/universal_ontology.md §4f" beats "the ontology doc."
- Match Sasha's existing vocabulary — don't rename concepts that already have established names.
- One sentence per "why" — no padding, no hedging.
- When uncertain, default to not-ripe-stays-in-buffer. The buffer holds.
- Flag entries that challenge existing corpus positions — those are highest-value.
- Honor the no-insider-jargon rule when proposing publish-as-content register: plain everyday language, no abstract compound nouns, the 5-second-friend test.
- Honor voice register: corpus body fields are second-person when describing Sasha to himself, first-person when Sasha is speaking.

Now triage the attached buffer.
```

---

## Operator Workflow (One Sitting)

1. **Export** Telegram self-chat to `docs/09-logs/capture_buffer_YYYY-MM-DD.json`.
2. **Run** the prompt above in Claude in Cowork (with the project loaded — corpus auto-available) or in a session with the listed corpus docs uploaded.
3. **Review** the triage table top-to-bottom. Override any call you disagree with — the AI is doing labor, you are doing judgment.
4. **Execute** in order:
   - `promote-to-corpus` rows → edit the named destination, paste the ripe content into the right section.
   - `seed-of-new-module` rows → add to [roadmap.md](../02-strategy/roadmap.md) Active Backlog or Parked / Future, by leverage.
   - `publish-as-content` rows → drop into wherever you stage outbound (drafts, scheduler, DM queue).
   - `part-of-recurring-pattern` rows → write the consolidated pattern as its own corpus section if leverage justifies it; otherwise leave it noted for next cycle.
   - `not-ripe-stays-in-buffer` rows → no action. They survive to next triage.
   - `archive` rows → delete from the source Telegram chat (or leave; the export is timestamped so old entries don't re-surface).
5. **Save** the triage table at `docs/09-logs/capture_buffer_triage_YYYY-MM-DD.md` as the audit trail.
6. **Log** in [session_log.md](../09-logs/session_log.md) — one line: "Capture buffer triage YYYY-MM-DD: N entries triaged, K promoted, M patterns named."

---

## Holonic Notes

- **Scale fractality:** The triage protocol itself is one instance of the receiving-then-digesting pattern that runs at every scale (sprint integration, lunar cycle harvest, multi-year corpus evolution). Same shape, different period.
- **Self-application:** The first run of this protocol will surface entries about the protocol itself. That's the recursion working — capture catches the capturer.
- **Drift signal:** If a triage cycle produces zero `promote-to-corpus` rows two months running, the buffer has gone quiet (likely meaning capture friction is rising or attention has shifted). Investigate, don't ignore.
- **Productization path:** Once stable over 3-6 cycles, this protocol becomes (a) a playbook chapter for the tribe, (b) a feature in the platform that wraps the prompt + corpus context + triage UI, (c) a teachable artifact in the Productize Yourself Session.

---

*v1.0 · May 12, 2026 · Companion to [alexanders_operating_system.md](../02-strategy/alexanders_operating_system.md)*
