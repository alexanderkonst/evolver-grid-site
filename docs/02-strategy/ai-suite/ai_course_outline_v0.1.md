# AI course for founders: outline v0.1

> Superseded framing → see wizards spec: [your_ai_wizards_spec_v0.1.md](./your_ai_wizards_spec_v0.1.md) (products are result wizards, not courses; the §3 ladder and §5 defaults here stay valid, decided 2026-11-21).

## 1. Header

- **Date:** 2026-11-21
- **Scope:** Module 3, branch 3.4 "AI setup" (sibling of [founders_ai_suite_spec_v0.1.md](./founders_ai_suite_spec_v0.1.md), referred to below as **Suite spec**)
- **Status:** draft v0.1, prepared by Hark for Sasha (Aleksandr Konstantinov). Nothing here is decided until Sasha says so. Price and naming are his.
- **Sources:** Sasha, 2026-11-21 14:36 («Это скорее что-то вроде курса по ИИ, мы можем сделать из моей прошлой работы по ИИ и из моего сетапа, и онбоардить людей в него постепенно. Это ценно! Потом надо придумать, когда они получают такой сетап.») · Module 3 notebook section «ИИ СЕТАП» (Hark working file, not in repo; same rows as the Suite spec §3) · the docs, prompts and routes linked in §2.
- **Out of scope:** the Unique Business playbook, the session method and `/playbook` copy (Sasha's zone). Nothing here links to or changes them.
- **Single source of truth:** this file holds only the course shape (levels, what each level hands over, gaps). Every lesson's content stays in its own doc and is linked, never copied.

**Intent.** A course on AI made from Sasha's past AI work and his own setup, which onboards founders into that setup step by step. The open design question is *when* a founder receives which piece of the setup; §3 answers it as a proposal.

## 2. Inventory: existing material

Ready as lesson: **yes** = can be handed to a founder as is; **needs work** = right content, wrong shape (written for Sasha's repo, or as a spec); **idea** = notebook or one line only.

| Existing material | What it teaches | Format | Ready as lesson? |
|---|---|---|---|
| [docs/10-workshops/ai.md](../../10-workshops/ai.md) (Four Levels of AI Clarity) | What AI is and is not: undefined "AGI", intelligence is not one axis, no threshold, consciousness as a spectrum | talk notes | needs work (notes, not a lesson) |
| [product_brief.md](../../04-products/product_brief.md) §0.2 + line 136: "Deep AI training" ($800 · 2 h; 3 workshops for organizations + 3 for groups, ~1,500 participants) | Understanding of AI that stays relevant for years | live talk | needs work (row says "needs description") |
| "The Nature of AI", "Mental Garbage Clearings on AI" (notebook) | Inferred: clearing fear and myths about AI before using it | talk | idea |
| [docs/ai/README.md](../../ai/README.md) §0 thesis | Answer quality comes from hyperpersonalization, an operating layer, and an AI that knows your business, not from the model | doc | yes |
| [scaffold_engineering_post_en.md](../../08-content/scaffold_engineering_post_en.md) | A skill/scaffold can outpace a model generation (the "parallel axis") | essay | yes |
| [interface_almanac.md](../../ai/interface_almanac.md) | Where AI interfaces are going (how much of the human the machine reads; chat as the new command line) | doc | needs work (strategy voice) |
| [landscape_2026-10.md](../../ai/landscape_2026-10.md), [market_maps_2026-10.md](../../ai/market_maps_2026-10.md), [taxonomy_v0_2026-10.md](../../ai/taxonomy_v0_2026-10.md) | Map of the AI field and tools | research doc | needs work (dated snapshot, Oct 2026) |
| [system-prompts/v6.0/lite.md](../../../system-prompts/v6.0/lite.md) | AI OS Lite: paste-in rules for how an AI thinks with you | prompt | yes |
| [system-prompts/v6.0/system-prompt.md](../../../system-prompts/v6.0/system-prompt.md) (core + modules), history in [v5.0–v5.3](../../../system-prompts/README.md) | Full AI OS for agent harnesses; the version history shows how a prompt evolves | prompt | yes (as artifact); needs work (as a lesson) |
| [ai_os_v6_plan.md](../ai_os_v6_plan.md) | How the AI OS was designed and upgraded (sources, principles, acceptance without benchmark) | doc | needs work (internal plan) |
| `/ai-os` + `/ai-os/{clarity,iteration,vibe-code,design}`, `/ai-os/benchmark`, `/ai-os/work-with-us` ([src/App.tsx](../../../src/App.tsx)) | The AI OS as a product: prompts by category, benchmark, pricing | page | yes |
| [personal_intelligence_setup_playbook.md](../../03-playbooks/personal_intelligence_setup_playbook.md) (**PISP**) Part 0, Stages 1–14 | Install path for the whole setup, 7 layers, each stage ends on a visible check | doc (checklist) | yes (the course spine); open items in its "Open items (v0.3)" |
| PISP Part A (seven routines) | Critic on PR, event triggers, docs-sync, post-merge verify, graph sync, check-ins, learning loops | doc + config sketches | needs work (written for Sasha's repo) |
| PISP Part B | Sasha's instance as a worked example | doc | yes (as a case) |
| [template-router.md](../../templates/template-router.md) | Task → template that already knows how; Result column = remote buttons. Sasha's "know-how" | doc | needs work (written for agents) |
| [meta-template.md](../../templates/meta-template.md), [holonic-prism.md](../../templates/holonic-prism.md) | Template of templates; the first button ("the whole thing in one sentence") | doc + prompt | yes (prism); needs work (meta-template is dense) |
| [course-from-source.md](../../templates/course-from-source.md) (+ [notebooklm_workflow.md](../../03-playbooks/notebooklm_workflow.md)) | Production line that turns a source into a video course | template | yes (as the way to produce this course) |
| `/game/your-ai` + [src/data/yourAiCatalog.ts](../../../src/data/yourAiCatalog.ts), [ai-familiar_tracker.md](../../specs/ai-familiar/ai-familiar_tracker.md) §17 (interface backlog), §20 (harness, buttons first) | My AI: an AI with the player's card behind it, buttons first, chat optional | page + spec | yes (page, player-facing); needs work (founder buttons) |
| [founders_ai_suite_spec_v0.1.md](./founders_ai_suite_spec_v0.1.md) | What of the «ИИ СЕТАП» items exists, gaps, v1 scope | spec | n/a (planning doc) |
| `system-prompts/v6.0/terminal.md` (being written in parallel, Suite spec §7) | A `CLAUDE.md`-style prompt a founder drops into their repo | prompt | idea → in progress |
| Repo `CLAUDE.md` / `AGENTS.md`, Hark ⇄ Claude Code practice (`@claude` issue → PR → merge) | Lane contract and agent orchestration as practiced | config + practice | needs work (Sasha-specific) |

## 3. Course ladder (proposal: when a founder gets which piece of the setup)

Principle (from PISP "How to walk a person through it"): **understanding and "you" before tools; one level per sitting; every level ends on a check the founder sees with their own eyes; the setup piece is handed over when the check passes, not before.** PISP stays the install checklist; the course is the learning path wrapped around it (inferred split, so the two never duplicate).

| Level | After it the founder can… | Setup piece they receive here | Source material | What's missing |
|---|---|---|---|---|
| **0. The nature of AI** | Talk about AI without fear or hype; know that answer quality comes from personalization, an operating layer and their own corpus, not from picking a model | Nothing technical; the thesis page as a reference | [ai.md](../../10-workshops/ai.md) · [docs/ai/README.md](../../ai/README.md) §0 · [scaffold_engineering_post_en.md](../../08-content/scaffold_engineering_post_en.md) · PB §0.2 "Deep AI training" | "Mental Garbage Clearings on AI" undefined; lesson text for "The Nature of AI" (Sasha's content) |
| **1. One chat** | Get a bold, dense, decided answer from any chat model instead of a generic one | **AI OS v6.0 Lite** ([lite.md](../../../system-prompts/v6.0/lite.md)), pasted into their chat | PISP Stage 1, Stage 7 · `/ai-os` | A 1-page lesson with one before/after check |
| **2. Cockpit: one chat + projects, accounts, approvals** | Run work from one chat with projects, connected mail/calendar/files, saved logins; know what the AI may do without asking | An **approval-rules template** (what needs their yes before messengers or money) | PISP Stages 2–3 and step 6 of "How to walk…" · AIF §17 (one chat) · [interface_almanac.md](../../ai/interface_almanac.md) | Approval-rules template as a file (today only a line in PISP); tool choice per founder (plan names/prices unconfirmed, PISP open item) |
| **3. An AI that knows you and your business** | Get answers that sound like them and know their work | **My AI with their own card** (`/game/your-ai`) + a corpus/graph starter | PISP Stages 4–6 · AIF §20.1–20.2 | Graph starter template and fixed list of self-knowledge docs (both PISP open items); founder-side card on My AI |
| **4. Templates and the remote** | Turn a recurring task into a template; press a button instead of writing a prompt | **Template router + holonic prism** as remote buttons (the know-how) | [template-router.md](../../templates/template-router.md) · [holonic-prism.md](../../templates/holonic-prism.md) · [meta-template.md](../../templates/meta-template.md) · AIF §20.3 | Controller screen (Suite spec row 4); a founder-readable version of the router; licensing line for the router (inferred: the most sensitive piece, see §5 Q2) |
| **5. Terminal and workers** | Have coding agents build and fix their site from issues, with their own repo rules | **Terminal prompt v0** ([system-prompts/v6.0/terminal.md](../../../system-prompts/v6.0/terminal.md), written in parallel) + full AI OS ([system-prompt.md](../../../system-prompts/v6.0/system-prompt.md)) + GitHub starter repo | PISP Stage 10 · repo `CLAUDE.md` · Suite spec rows 3, 6 | Starter repo (`claude.yml` + terminal prompt); terminal.md itself until it lands |
| **6. Orchestration and routines** | Run several agents from one chat; checks and loops run without them | **Routine configs**: critic on every PR, post-merge verify first (PISP install order) | PISP Part A · Hark ⇄ Claude Code practice | Routines rewritten for a founder's repo, not Sasha's; scheduled check-ins template |
| **7. AI company** | See their business as a company of agents: harnesses, router, remote, routines working as one; adapt it themselves | **The whole stack as company harnesses**, under the suite's license/terms | PISP Part B (Sasha's instance) · Suite spec §4 architecture · notebook "мои обвязки все сделать обвязками компании", "ИИ-КОМПАНИЯ!" | Packaging of Sasha's harnesses; license/terms line (Suite spec Q4); benefit statement ("communicate benefits", notebook) |

Electives, taken when a real task asks for them (PISP rule): messengers on their own Telegram/WhatsApp (Stage 8), screen and files (Stage 9), video/sound/images (Stage 11), visual voice (Stage 12), publishing (Stage 13).

**Minimum setup = Levels 1–3** (matches PISP's ~3 h minimum: Stages 1, 2, 3, 4, 6, 7). Levels 4–7 are what nobody else sells (inferred: router, terminal prompt and harnesses are the differentiated part; Levels 0–3 overlap with generic AI courses).

## 4. Formats (options, not decisions)

- **Self-paced docs:** one page per level linking the sources above, produced via [course-from-source.md](../../templates/course-from-source.md) (optional NotebookLM videos). Cost: Hark writing time only; no Sasha time beyond review; no `src/` or credits.
- **Live cohort:** Sasha (or Sasha + Hark) walks a small group one level per sitting, Level 0 reusing the "Deep AI training" workshop. Cost: his hours per level and per cohort; highest touch, highest price ceiling.
- **Inside My AI buttons:** each level is a button on `/game/your-ai` that teaches and hands over its piece. Cost: build work (Controller screen first) plus model credits per call (PB §6); slowest to ship, scales without him.

## 5. Open questions for Sasha (each with a ready default)

1. **When the setup is handed over.** Piece by piece as each level's check passes, or the whole setup on day one with the course as guidance? **Default:** piece by piece (the §3 ladder); the minimum setup (Levels 1–3) within the first two sittings, as PISP already prescribes.
2. **Where the router and terminal prompt sit.** Inside the course for everyone, or only for founders in the collective (3.6 terms)? **Default:** Levels 0–3 open to any founder; Levels 4–7 (router, terminal prompt, routines, harnesses) only inside the collective.
3. **Level 0 content.** Are "The Nature of AI" and "Mental Garbage Clearings on AI" Level 0 of this course, or a separate workshop? **Default:** Level 0 of the course, built from the existing "Deep AI training" workshop; the workshop stays sellable on its own.
4. **First format.** **Default:** self-paced docs first (cheapest, and it tests the ladder), live sittings only for the levels where founders get stuck.

Price and naming are Sasha's; this outline proposes neither.

## 6. Smallest next step

**Level 1 lesson v0:** one page, `docs/02-strategy/ai-suite/course/level-1-one-chat.md`, that links [lite.md](../../../system-prompts/v6.0/lite.md) and PISP Stages 1 and 7 (no copying), and ends on one visible check: the same question asked in a plain chat and with AI OS Lite pasted in, answers side by side. Docs only, no `src/`, no credits, no outreach. It tests the lesson shape the other seven levels would reuse. Waits on Sasha's yes to the ladder.
