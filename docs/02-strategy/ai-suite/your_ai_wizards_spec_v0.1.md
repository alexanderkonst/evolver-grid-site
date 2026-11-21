# Your AI · Result Wizards: spec v0.1

## 1. Header

- **Date:** 2026-11-21
- **Status:** v0.1, will be revised after each wizard (Sasha, 2026-11-21 14:47). Prepared by Hark for Sasha (Aleksandr Konstantinov). Docs only.
- **Template:** spec-handoff ([spec-handoff.md](../../templates/spec-handoff.md), §2 product chain + planning-SoW shape), routed by [template-router.md](../../templates/template-router.md) row "agent spec". Production line from [course-from-source.md](../../templates/course-from-source.md); infographic cards per [infographic.md](../../templates/infographic.md).
- **Scope:** Module 3, branch 3.4 "AI setup". Supersedes the *course* framing of [ai_course_outline_v0.1.md](./ai_course_outline_v0.1.md) (its ladder and §5 defaults stay valid and are linked here, not copied). Sibling: [founders_ai_suite_spec_v0.1.md](./founders_ai_suite_spec_v0.1.md) (**Suite spec**).
- **Sources:** Sasha 2026-11-21 14:41 (wizard concept), 14:45 («ОФИГЕННО! делай!!!!!»: ladder + 4 defaults), 14:47 (platform decided; iterative loop) · Module 3 notebook sections «ИИ СЕТАП» and «ШАБЛОН «МАТЕРИАЛЫ → ВИЗАРД»» (Hark working file, not in repo) · repo at `7ee69e0`.
- **Out of scope:** the Unique Business playbook, the session method, `/playbook` copy (Sasha's zone); prices and names (Sasha's); any `src/` change, Lovable, NotebookLM run or outreach before Sasha's yes.
- **Single source of truth:** this file holds only the wizard shape, the micro-module unit, the pipeline and the delivery gaps. Lesson content stays in its source docs and is linked.

## 2. Intent

Not courses («кому интересен курс? никому… курсов миллиард»): each Your AI product is a **wizard** that walks a founder, one micro-module at a time, to one transformational result, and installs a piece of their AI setup at every passed step. We sell results, not time ("SELLING TIME → SELLING RESULTS").

**Product law (notebook):** product = consequence of a result (a language or a skill gained) + the system prompt that produces it. One product is at once **infographic, wizard, transformational result and module**.

## 3. Vocabulary

| Term | Meaning |
|---|---|
| **Wizard** | A chain of micro-modules with one entry state and one exit result, like a software setup wizard: one step per screen, Next only after the step is done. The thing that is offered and bought. |
| **Micro-module** | The smallest unit: one result, one step, one visible check, one setup piece. Delivered as infographic + short AI video + the step. |
| **Result** | What the founder *has or can do* after (a language, a skill, an installed piece), stated as a button label (router button law). Never "what the lesson covers". |
| **Check** | An observable sign the founder sees with their own eyes that the result happened (a before/after answer, a file in their repo, a working button). No check, no Next. |
| **Setup piece** | The concrete artifact handed over when the check passes: a prompt, a template, a config file, an access. Handed level by level, never before the check (decided 14:45). |
| **Wizard family** | Wizards that share one ladder. The first family is the 8-level AI setup ladder (§7). |

## 4. Product chain (spec-handoff §2)

- **ICP:** founders who want AI that works for their business, not another course (inferred from Module 3 focus).
- **Transformation:** A = "uses AI like a search box, generic answers, scattered tools" → B = "runs their business with their own AI setup, level by level".
- **Master Result (family):** *Your own AI company, installed step by step.* Sub-results = the 8 levels. Screens = micro-modules.
- **Before / after pair per wizard and per micro-module:** before-screen names the result (CTA = the result, e.g. "Get bold answers from any chat"); after-screen shows the check passed, the setup piece received, where it lives, and what it unlocks next.

## 5. The micro-module unit (the form every micro-module fills)

| # | Field | What it holds | Rule |
|---|---|---|---|
| 1 | **Result in one line** | What the founder has after, phrased as the button label | Result, not feature; ≤ 10 words |
| 2 | **Who it's for** | Entry state: who starts here, what they must already have | Names the previous micro-module or "none" |
| 3 | **Input materials** | Links to Sasha's sources (docs, transcripts, talks) this unit is made from | Links only; raw private material stays outside the repo |
| 4 | **One step** | The single action the founder takes | One action; if two, split the unit |
| 5 | **Visible check** | What they see that proves the result | Observable by them; pass/fail, no self-rating alone |
| 6 | **Setup piece handed over** | The artifact released when the check passes, with its path | Link to the file (e.g. a prompt in `system-prompts/`) or "none" (level 0) |
| 7 | **Infographic brief** | One card: subtitle, prism number + form, scheme with keys | Entry shape of [infographic.md](../../templates/infographic.md) |
| 8 | **NotebookLM video brief** | Source text for one notebook, focus line, course look + episode scene, 90–120 s, Explainer 16:9 | [course-from-source.md](../../templates/course-from-source.md) Look & feel |
| 9 | **System prompt / skill it installs** | The prompt or skill that keeps producing the result after the unit | Must exist before the unit ships (product law) |
| 10 | **Done criteria** | Unit is shippable when: fields 1–9 filled, Sasha signed the text, infographic and video exist, check tested on one real founder | All ✅ with evidence (link, file, URL) |

**Filled example (illustrative, for shape only; content waits on Sasha's materials):**
1 "Get bold, decided answers from any chat" · 2 anyone with a chat model; none before · 3 [lite.md](../../../system-prompts/v6.0/lite.md), PISP [Stage 7](../../03-playbooks/personal_intelligence_setup_playbook.md) · 4 paste AI OS Lite into your chat's custom instructions · 5 ask the same question in a plain chat and with Lite; answers side by side, the Lite one decides and is shorter · 6 AI OS v6.0 Lite (`system-prompts/v6.0/lite.md`) · 7 card "Generic vs decided answer", prism 2 · poles · 8 source = lite.md "How to answer" + Sasha's words on why · 9 AI OS Lite itself · 10 per rule.

## 6. The wizard

- **Shape:** entry state → micro-module 1 → … → micro-module n → exit result. Typically 3–7 micro-modules (inferred from the 3–7 sub-results rule in spec-handoff §2).
- **Gating:** Next opens only when the current check passes; the setup piece is released at the same moment.
- **Entry result / exit result:** each wizard's file names both; the exit result of one wizard is the entry state of the next in its family.
- **Levels ↔ wizards:** one ladder level = one wizard (default; a level may split into two wizards if it exceeds 7 micro-modules). The level's "setup piece" in the outline ladder = that wizard's final handover; its micro-modules hand over the smaller parts.
- **Wizard file:** `docs/02-strategy/ai-suite/wizards/<slug>/wizard.md` (result, entry, exit, chain, access layer) + one `mm-<nn>-<short>.md` per micro-module (fields of §5) + `tracker.md` (unit × sourced / signed / infographic / video / live).

## 7. First wizard family: the 8-level AI setup ladder

The ladder, its setup pieces and its gaps live in [ai_course_outline_v0.1.md §3](./ai_course_outline_v0.1.md#3-course-ladder-proposal-when-a-founder-gets-which-piece-of-the-setup); the four defaults in its §5 are **decided** (Sasha, 2026-11-21 14:45). New here only:
- Each level becomes one wizard; levels 0–3 open to everyone, 4–7 (router, terminal, routines, harnesses) only inside the collective (decided).
- Level 0 ("The Nature of AI" + "Mental Garbage Clearings on AI") is a wizard *and* the Deep AI training workshop stays sellable alone ([product_brief.md §0.2](../../04-products/product_brief.md)) (decided).
- First format: self-paced wizard; live sittings only at micro-modules where founders stall (decided; the tracker shows where).
- Level 5's setup piece is [terminal.md](../../../system-prompts/v6.0/terminal.md) (exists, v0); the install path stays [PISP](../../03-playbooks/personal_intelligence_setup_playbook.md); wizards wrap it, never duplicate it.

## 8. Production pipeline

Every wizard runs this line; the template (this spec + §5 form) is run **as is**, then updated from what the wizard taught (stage 10). Many cycles, not once (Sasha, 14:47).

| # | Stage | Owner | Artifact · where it lives |
|---|---|---|---|
| 1 | **Materials** | Sasha | His AI materials (talks, transcripts, docs). Public ones linked in repo; private raw stays in Hark's project workspace, never committed |
| 2 | **Result + spine** | Sasha sets, Hark proposes from materials | `wizards/<slug>/wizard.md`: exit result, entry state, micro-module list (structure first, course-from-source step 1) |
| 3 | **Synthesis** | Hark | `mm-<nn>-*.md`, all §5 fields filled, one per micro-module |
| 4 | **Authorship gate** | Sasha | Each unit marked "signed" in `tracker.md`; nothing ships he would not sign (course-from-source step 6) |
| 5 | **Infographic** | Hark (image tool) per infographic.md | Card image per unit; storage path decided in §11 Q4 |
| 6 | **AI video** | Hark via browser in NotebookLM, on **Sasha's Google account** | One notebook per micro-module (named by unit code), Video Overview 90–120 s; **needs Sasha's yes per batch**; upload unlisted to YouTube (his account, same yes); URL in `tracker.md` |
| 7 | **Prompt / skill** | Hark | Link to existing prompt, or new one in `wizards/<slug>/prompts/`; must exist before ship |
| 8 | **Assemble on platform** | Claude Code via `@claude` issue (spec-handoff); Hark reviews and merges | `src/data/courses/<slug>.ts` entry + platform gaps of §9; only after Sasha's yes on this spec |
| 9 | **Offer + publish** | Sasha (price, name, checkout); Hark (page copy from shift-offer) | `src/data/courseSales.ts` entry → `/academy/<slug>`; Stripe stays Sasha's |
| 10 | **Learn → update template** | Hark proposes, Sasha confirms | Stall points and check pass rates from `tracker.md`; edits to this spec (§5 form, §8 line) with a dated "what this wizard taught" line in §13; version bump |

## 9. Platform delivery (findyourtoptalent.com, decided 14:47)

**Exists today** (`src/App.tsx` at `7ee69e0`):
- `/grow/<slug>` course player (`src/pages/CoursePage.tsx`, data per course in `src/data/courses/*.ts`): modules → episodes, YouTube video + optional infographic per episode, watched progress (guest progress merges on sign-in). Live: `activate-your-dormant-potential`, `consciousness-meets-science`, `activation-of-inner-vision`.
- `/academy/:slug` sales page (`src/data/courseSales.ts`); no checkout link in code yet (file comment: "No Stripe here").
- `/game/learn` (Academy index), `/game/learn/book` (infographic reader), `/ai-os` (+ `/clarity`, `/iteration`, `/vibe-code`, `/design`, `/benchmark`, `/work-with-us`), `/game/your-ai` (Your AI, `src/data/yourAiCatalog.ts`).

**Missing for a wizard** (each a future `@claude` issue, not in this spec's scope):
1. Step type "check" per micro-module with pass/fail recorded (today only "watched").
2. Gating: Next locked until the check passes.
3. Setup-piece handover on pass (copy / download the prompt or file), with before/after result screens.
4. Per-result access: a paid wizard unlocks on purchase; levels 4–7 unlock only for collective members.
5. Wizards as buttons on `/game/your-ai` (Controller, Suite spec row 4), so Your AI is the one home of every wizard.

Inferred: the cheapest route is to extend `CourseConfig` with optional `check` and `setupPiece` fields on an episode, so the existing player becomes the wizard player; no new page.

## 10. Layers and access (PROPOSED, NOT YET CONFIRMED)

| Layer | What | Access |
|---|---|---|
| Free | AI OS Lite + levels 0–1 wizards, as the magnet | open |
| Paid product | Wizards, paid per result | purchase per wizard |
| Paid harness | Terminal, router, routines (levels 4–7) | collective only |

Open until Sasha confirms. Prices and names: Sasha's; none proposed.

## 11. Open questions (each with a default)

1. **Layers (§10).** Confirm free / paid product / paid harness? **Default:** as in §10.
2. **Unit of sale.** One wizard = one purchase, or a whole level family bundle too? **Default:** one wizard = one purchase; bundle later if asked.
3. **NotebookLM batch size.** How many micro-modules per yes? **Default:** one batch = one wizard (all its notebooks), one yes per batch.
4. **Infographic home.** Book of Infographics (new fund in [BOOK.md](../../assets/infographics/BOOK.md)) or wizard folder? **Default:** wizard folder (`wizards/<slug>/cards/`), entry shape from infographic.md; a card moves to the Book only if Sasha wants it there.
5. **Video length for steps.** Keep 90–120 s, or shorter for setup steps? **Default:** 90–120 s (course-from-source), one idea per video.

## 12. Success criteria

- A founder finishes one wizard with no live help and holds the setup piece (evidence: check passed + piece in their account / repo).
- Every shipped micro-module has all 10 fields ✅ and Sasha's signature.
- Each wizard after the first takes less Sasha time than the one before (inferred metric; measured in `tracker.md`).
- The spec changes after every wizard (§13 grows one dated line per cycle).
- Someone pays for a result, not for access to content.

## 13. What each wizard taught (grows one line per cycle)

- *(empty; first line after the pilot)*

## 14. Risks

1. **Course in disguise:** units drift into explanation without a check. Guard: no check = no unit (§5 rule 5).
2. **Sasha's time:** authorship gate becomes the bottleneck. Guard: sample first (spec-handoff "examples → sample → work"); he signs one unit before the batch.
3. **NotebookLM on his account:** browser runs can fail or look odd on his Google account. Guard: one yes per batch; continue-on-failure, tracker marks ❌.
4. **Duplication:** wizard files copy PISP / outline text. Guard: links only, review row in §16.
5. **Platform gap stalls launch:** check/gating not built. Guard: pilot ships as a doc wizard first; `src/` work only after the pilot proves the shape.

## 15. Smallest next step (pilot, one full cycle)

1. Sasha sends his past AI materials (stage 1). Nothing starts before.
2. Hark runs the template **as is** on **one micro-module from Level 1** ("one chat"): `docs/02-strategy/ai-suite/wizards/level-1-one-chat/` with `wizard.md`, one `mm-01-*.md`, `tracker.md`.
3. Sasha signs the unit; on his yes, one NotebookLM notebook → one video; one infographic card.
4. One founder runs it; the check is observed.
5. Hark writes what the pilot taught into §13 and updates §5 / §8 → spec v0.2. Then the next micro-module, then the next wizard: same loop each time.

No `src/`, no Lovable, no outreach in the pilot.

## 16. Acceptance checklist (for this spec)

| # | Item | Evidence | Status |
|---|---|---|---|
| 1 | Template named and followed | §1 "Template: spec-handoff" | ✅ |
| 2 | Intent in two lines | §2 | ✅ |
| 3 | Vocabulary: wizard, micro-module, result, check, setup piece | §3 | ✅ |
| 4 | Micro-module unit with all 10 fields + one filled example | §5 | ✅ |
| 5 | Wizard: chain, entry/exit, level mapping | §6 | ✅ |
| 6 | Pipeline: stage, owner, artifact, repo paths, NotebookLM rule, iterative loop | §8 | ✅ |
| 7 | Platform: exists vs missing, routes checked in `src/App.tsx` | §9 | ✅ |
| 8 | Ladder linked, not copied; only new points added | §7 | ✅ |
| 9 | Layers marked proposed/open; no prices or names | §10 | ✅ |
| 10 | ≤5 risks, ≤5 open questions with defaults | §11, §14 | ✅ |
| 11 | Pilot next step with the update-the-template loop | §15 | ✅ |
| 12 | No playbook / session / `/playbook` content touched; no client names | diff = this file + one line in the outline | ✅ |
