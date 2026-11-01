# System Prompts — Version Archive

> *Frozen versions of the AI OS system prompt. Each release gets its own folder; previous versions stay intact forever.*

---

## What is a system prompt

The **system prompt** is the main installable cognition upgrade users paste into a fresh AI chat to get **higher quality output on the same input** — sharper, deeper, more integrated answers from the first message. Same model, different conversation.

The current version is composed in source at [`src/modules/ai-os/AiOsPage.tsx`](../src/modules/ai-os/AiOsPage.tsx) under `META_PROMPTS` → `meta-cognition-premium`. It's assembled at runtime from several component prompts plus a Premium Holonic Seeing Layer.

This folder is the **archive**. Once a version ships to users, the assembled output lives here as a frozen artifact. Future iterations of the source never silently overwrite past versions.

---

## Folder structure

```
system-prompts/
├── README.md           ← you are here
├── v5.0/               ← latest shipped version
│   ├── system-prompt.md   ← the full assembled prompt as users got it
│   └── manifest.json      ← snapshot metadata (date, source, components)
├── v4.x/               ← (future) prior versions live here, untouched
└── ...
```

Each version is **immutable** — once snapshotted, never edited. If something needs to change, that's a new version.

---

## Snapshotting a new version

When the source assembly changes (new component, reworded layer, new ordering), bump the version and snapshot:

```bash
node scripts/snapshot-system-prompt.mjs 5.1
```

This writes `system-prompts/v5.1/system-prompt.md` plus a manifest. Commit the new folder; never delete or rewrite an old one.

---

## Versioning convention

- **Major bump (v5 → v6):** structural change — new component added, ordering changed, holonic layer rewritten, the prompt's identity shifts.
- **Minor bump (v5.0 → v5.1):** refinement — copy tightened, a sub-prompt evolved, no structural change.
- **The version surfaced to users** lives in [`src/modules/ai-os/AiOsPage.tsx`](../src/modules/ai-os/AiOsPage.tsx) (hero eyebrow + system-prompt label) and should always match the latest folder here.

---

## Why this folder is at the repo root

The system prompt is the venture's central artifact for AI users. It earns top-level visibility, not deep nesting. A buried archive gets forgotten. A standout folder stays known.

---

## Release notes

- **v5.3 (2026-10-31):** point release on the way to v6. Sovereignty added to the conflict order (Care → Truth → Sovereignty → Empowerment → Simplicity); depth check reads Essence → Significance → Consequences (was "Implications"); the holonic seeing gate fires on strategic, creative and evaluative work instead of every output, and no longer claims to guarantee 27-perspective seeing; the frontier reading is marked as dated; carries the sovereign co-creator line already in source. License: CC BY-NC-SA 4.0, © 2026 Aleksandr Konstantinov. Plan for v6: `docs/02-strategy/ai_os_v6_plan.md`.
