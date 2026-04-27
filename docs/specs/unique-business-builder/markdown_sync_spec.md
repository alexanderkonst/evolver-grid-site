# Markdown Sync — Architecture Spec

*UBB v2.0 supplement · 2026-04-24 · Status: draft*

> **Derives from:** UBB Product Spec + Architecture Spec + `schema_delta.md`.
> **Scope:** how rows in `user_business_artifacts` (DB, source of truth) project into the seven hand-readable canvas files at `docs/02-strategy/unique-businesses/{slug}_unique_business.md`.
> **Non-goal:** Markdown is NOT an authoring surface for canvas state. It is a generated projection. Hand-edits to projected sections are non-durable.

---

## 1. Why this spec exists

The corpus already contains seven hand-written founder canvases:

```
alexanders_unique_business.md
alexas_unique_business.md
kirills_unique_business.md
oyis_unique_business.md
sandras_unique_business.md
sergeys_unique_business.md
```

These were the *only* representation of canvas state before UBB v2.0. Going forward, the DB is the source of truth (versioned, append-only, machine-readable, network-effects-ready). But:

- The markdown files remain valuable as **narrative artifacts** — Sasha reads them, NotebookLM ingests them, the playbook quotes them.
- They are publicly licensed (CC BY-NC-SA 4.0) and visible in the GitHub corpus.
- Existing links across `docs/` reference them by path.

So the markdown layer survives — but as a **projection** of the DB, not a parallel store.

---

## 2. The contract — three rules

### Rule 1 — DB is source of truth

The canonical state of any artifact (`uniqueness`, `myth`, `tribe`, `pain`, `promise`, `lead_magnet`, `value_ladder`, `session_bridge`, `core_belief`, `packaging`, `frictionless_purchase`, `reach`, `delivery`, `spread`, `surface_inventory`, `tuning_fork`, `golden_dm`, `landing_page`) is the **latest locked row** in `user_business_artifacts` for that `(user_id, artifact_key)` pair.

If DB and markdown disagree, **DB wins**. Always. No exceptions.

### Rule 2 — Markdown is a projection

A pure function `renderCanvasMarkdown(userId) → string` produces the markdown file deterministically from DB state. Same DB state → same markdown. No hidden state in the file.

### Rule 3 — Hand-edits to generated sections are non-durable

Sections under `<!-- UBB:GEN:START -->` … `<!-- UBB:GEN:END -->` markers are **owned by the renderer**. Anything inside is overwritten on next regen.

Sections OUTSIDE those markers (a `## Notes` section, a top dashboard, a changelog tail) are **owned by the human**. The renderer never touches them.

This is the same pattern as `// CODE GENERATED, DO NOT EDIT` headers in protobuf/openapi-generated code, applied to markdown.

---

## 3. File layout — the projection template

Every projected canvas file follows this structure:

```markdown
# {Founder Name}'s Unique Business

> *© {year} {Founder Name} · [CC BY-NC-SA 4.0](...)*
> *v{N} · {date} · {phase}*
> *Playbook: [Unique Business Playbook](../../03-playbooks/unique_business_playbook.md)*

<!-- UBB:HUMAN:DASHBOARD -->
## 🧭 Business Dashboard

(Free-form human-curated top-of-file glance. Renderer never touches this block.)
<!-- UBB:HUMAN:DASHBOARD:END -->

<!-- UBB:GEN:START -->
<!-- DO NOT EDIT BELOW. Regenerated from user_business_artifacts on each lock. -->
<!-- Last sync: {ISO timestamp} · DB source: user_id={uuid} -->

## Phase A — Canvas

### Uniqueness (v{n} · specificity {score})
{rendered uniqueness content}
_Energies: {energies list}_
_Distillation:_ {distillation sentence}

### Myth (v{n} · specificity {score})
...

### Tribe ...
### Pain ...
### Promise ...
### Lead Magnet ...
### Value Ladder ...

## Phase B — Session Bridge
### Session Bridge (v{n} · specificity {score})
...

## Phase C — Market Path
### Core Belief ...
### Packaging ...
### Frictionless Purchase ...
### Reach ...
### Delivery ...
### Spread ...
### Surface Inventory ...
### Tuning Fork ...
### Golden DM ...

## Phase D — Publication
### Landing Page (v{n} · specificity {score})
...

## Version History

| Artifact | Versions | Latest specificity | Last locked |
|---|---|---|---|
| uniqueness | 4 | 9.2 | 2026-04-22 |
| ...

<!-- UBB:GEN:END -->

<!-- UBB:HUMAN:NOTES -->
## Notes

(Free-form. Renderer never touches this block.)
<!-- UBB:HUMAN:NOTES:END -->
```

**Marker rules:**
- Three human-owned blocks: `DASHBOARD`, `NOTES`, anything before `## Phase A` or after the closing `:END`.
- One generated block, between `UBB:GEN:START` and `UBB:GEN:END`.
- Renderer reads existing file → preserves human blocks verbatim → regenerates the GEN block → writes back.

---

## 4. The renderer

### Signature

```ts
// src/modules/unique-business-builder/markdown/renderCanvasMarkdown.ts
async function renderCanvasMarkdown(userId: string): Promise<{
  markdown: string;
  filename: string;        // `{slug}_unique_business.md`
  diff: MarkdownDiff;      // what changed since last sync
}>;
```

### Logic

```
1. Load profile (display_name → slug, license year)
2. Load all 18 latest-locked rows from user_business_artifacts
3. Load existing markdown file at expected path (if any)
4. Parse existing file → extract human-owned blocks by marker
5. Render GEN block from DB rows + Synthesis Protocol artifacts
6. Splice: <preamble> + <human dashboard> + <gen> + <human notes>
7. Compute diff vs previous file (for changelog)
8. Return string + filename + diff
```

### Where it runs

Two places:

**(a) Edge function `sync-canvas-markdown`** — invoked on each artifact lock. Writes back to a Supabase Storage bucket `canvas-projections/{slug}_unique_business.md`. Public URL surfaces as the founder's "shareable canvas link."

**(b) Local CLI `pnpm sync:canvases`** — for the corpus repo. Reads from prod DB (read-only role), writes to `docs/02-strategy/unique-businesses/`. Run by Sasha when he wants the GitHub corpus to reflect DB state. Manual, not automatic — git history stays meaningful.

The two paths share the same renderer. Storage projection is for end-users. Repo projection is for the corpus.

---

## 5. Migration of existing canvases

Sasha's seven existing files were hand-written before UBB v2.0. Each contains canvas state that does not yet exist as DB rows. To bring them into the new architecture:

### Phase 1 — DB seed (one-time)

For each of the seven files, run a parser-extraction script:

```ts
// scripts/seed-canvases-from-markdown.ts
async function seedCanvasFromMarkdown(filePath: string, userId: string) {
  const md = await readFile(filePath);
  const sections = parseSectionsByHeading(md);
  for (const [artifactKey, content] of mapSectionsToArtifacts(sections)) {
    await insertArtifactRow({
      user_id: userId,
      artifact_key: artifactKey,
      version: 1,
      content,
      specificity_score: estimateSpecificity(content),  // human-set, default 9.0
      is_locked: true,
      what_changed: 'Seeded from markdown corpus on 2026-04-24',
      // _energies, _distillation: null on seed; populated on first Improve
    });
  }
}
```

The mapping from existing markdown headings to artifact_keys is a one-time hand-curated table — the seven files don't share identical structure, so the script is per-founder.

After seed: each founder has 18 locked v1 rows. The DB now matches the markdown. From here, the next Improve cycle runs through the new flow.

### Phase 2 — File restructure

Each existing file is rewritten to match the projected template:

- Top preamble (license, version, links) → kept, edited to current
- Free-form sections that match an artifact_key → moved INSIDE the GEN block
- Free-form sections that don't (dashboards, master tuning forks chosen, changelog tails) → kept in HUMAN blocks

This is a **manual edit pass per file**, not automated. The script seeds the DB; the human curates the file structure once. After that, the renderer takes over.

### Phase 3 — Lock-and-flow

Once seeded + restructured, all future canvas updates flow through UBB UI → DB lock → renderer → markdown. The hand-edit era ends.

---

## 6. Slug + filename

Slug derivation:

```
display_name = "Alexander Konstantinov"
slug = lowercased first name + "s" → "alexanders"
filename = `${slug}_unique_business.md`
```

Collisions (two Alexanders): append numeric suffix at filename level only — `alexanders_2_unique_business.md`. DB carries no slug; slug is purely a presentation detail derived from `display_name`.

---

## 7. Versioning + changelog

The `## Version History` table inside the GEN block is regenerated from `user_business_artifacts` joined on `artifact_key` with `count(*)`, latest `specificity_score`, latest `updated_at`.

The narrative changelog tail (Sasha's existing `## Changelog` sections at the end of each file) lives OUTSIDE the GEN block, under `<!-- UBB:HUMAN:CHANGELOG -->`. The renderer doesn't touch it. Sasha keeps writing it.

---

## 8. License + visibility

Each projected file carries the CC BY-NC-SA 4.0 header by default. Override per-founder via `profiles.canvas_license` field (added later if needed).

Storage-bucket projections (`canvas-projections/`) are public-readable but `noindex` by default — they're shareable, not search-indexed, until the founder publishes via the Dossier flow.

Repo projections (`docs/02-strategy/unique-businesses/`) follow normal repo visibility (public).

---

## 9. Error handling

| Failure | Behavior |
|---|---|
| User has < 18 locked artifacts | Render only the locked subset; mark unrendered phases as `(not yet locked)` |
| Existing file has malformed markers | Fail loudly; do not silently destroy human blocks |
| User has no `display_name` | Skip projection; log; surface in admin dashboard |
| Slug collision detected at sync time | Auto-suffix and emit warning |
| AI artifact JSON missing `_energies` / `_distillation` | Render the fields the artifact has; omit synthesis lines (don't fabricate) |

---

## 10. What this spec deliberately does NOT do

- ❌ **No bidirectional sync.** Markdown → DB is a one-time seed only. After that, markdown is read-only from the writer's perspective.
- ❌ **No live file-watching.** No fs-watcher syncs file edits back to DB. That path leads to merge-conflict hell.
- ❌ **No partial regen.** The whole GEN block regenerates each time. Section-level diffing is the renderer's internal concern, not exposed.
- ❌ **No per-section markers.** One GEN block per file. Section-level markers proliferate; one block keeps the contract simple.
- ❌ **No version-pinning.** Markdown always reflects latest locked state. To see history, query the DB or read the version table.

---

## 11. Open questions (parked)

1. **Multi-language.** When canvases land in Russian/Spanish/etc., do we project per-language files, or one file with translated sub-blocks? Park until first non-English founder hits Phase D.
2. **Embedded media.** Canvas may eventually carry images (whiteboard photos, screenshots). Projection format for media? Punt to v2.1.
3. **Network-effect projection.** When `unique-businesses-network/` exists, do projected files cross-link automatically? Punt until network surface ships.

---

## 12. Implementation sequence

| Step | Output | Effort |
|---|---|---|
| 1. Hand-curated mapping table | per-founder heading → artifact_key map (7 files × ~18 entries) | 2h |
| 2. Seed script | `scripts/seed-canvases-from-markdown.ts` | 3h |
| 3. Run seed → review DB rows for accuracy | 7 founders × 18 rows = 126 rows verified | 2h |
| 4. Renderer module | `renderCanvasMarkdown.ts` + tests | 4h |
| 5. Edge function | `sync-canvas-markdown` + storage bucket | 2h |
| 6. CLI | `pnpm sync:canvases` | 1h |
| 7. Manual file restructure pass | 7 files re-curated to new template | 2h |
| 8. First end-to-end test | edit canvas in UBB UI → see corpus file update via CLI | 1h |

**Total:** ~17 hours. Single-session feasible if uninterrupted; realistically 2-3 working sessions.

---

## 13. Acceptance criteria

- [ ] All 7 existing canvases seed successfully into `user_business_artifacts` with `is_locked = true`.
- [ ] Running `pnpm sync:canvases` after seed produces files that diff cleanly (only formatting deltas) against the originals.
- [ ] Editing one artifact through the UBB UI → re-running CLI → only that artifact's section in the markdown changes.
- [ ] Hand-edits inside `UBB:HUMAN:*` blocks survive a regen cycle byte-for-byte.
- [ ] Hand-edits inside the `UBB:GEN` block are overwritten on regen (this is the contract; verify the renderer enforces it).
- [ ] Public storage URL serves the same content as the repo file (modulo timing).

---

*End of spec. Roast gate before implementation.*
