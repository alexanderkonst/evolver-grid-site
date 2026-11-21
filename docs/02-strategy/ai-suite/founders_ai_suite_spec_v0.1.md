# Founder's AI suite (Your AI, ex-AI OS): spec v0.1

## 1. Header

- **Date:** 2026-11-21
- **Scope:** Module 3, branch 3.4 "AI setup" (notebook: «ИИ СЕТАП»)
- **Status:** draft v0.1, prepared by Hark for Sasha (Aleksandr Konstantinov). Nothing here is decided until Sasha says so.
- **Template:** spec-handoff (nearest; see [template-router.md](../../templates/template-router.md))
- **Sources:** Sasha's notebook rows «ИИ СЕТАП» (Module 3 notes, 2026-11-20/21; transcribed rows B1-25…B1-42, B1-53, B1-85 in [golden_age_canon.md](../golden_age_canon.md) §3–4) · Module 3 map rows 22–36 (Hark working file, not in repo; same rows as canon "Ring · Your AI") · [ai-familiar_tracker.md](../../specs/ai-familiar/ai-familiar_tracker.md) (AIF) §16–20 · [template-router.md](../../templates/template-router.md) · [holonic-prism.md](../../templates/holonic-prism.md) · [holon-core.md](../../01-vision/holon-core.md) §Controller · [ai_os_v6_plan.md](../ai_os_v6_plan.md) · [product_brief.md](../../04-products/product_brief.md) (PB) §0.2, §6 · [personal_intelligence_setup_playbook.md](../../03-playbooks/personal_intelligence_setup_playbook.md) (PISP) · [interface_almanac.md](../../ai/interface_almanac.md) · [ai_matchmaker_brief.md](../ai_matchmaker_brief.md) · `src/App.tsx` routes `/ai-os`, `/ai-os/{clarity,iteration,vibe-code,design}`, `/ai-os/work-with-us`, `/ai-os/benchmark`, `/game/your-ai`, `/license`.
- **Out of scope:** the Unique Business playbook, session method and `/playbook` copy (Sasha's zone). This spec links to them nowhere and changes nothing in them.
- **Single source of truth:** this file holds only the 3.4 gap analysis, the fit between parts, and the open forks. Every existing fact stays in its own doc; here it is a link.

## 2. Intent (from Sasha's notebook words)

Your AI is an **AI company, not a prompt and not even an "OS"** («ИИ-КОМПАНИЯ! не просто ИИ промпт или даже «ОС»»). A product in it is the **consequence of a result** (the person gets a language or a skill) **plus the system prompt that produces that result**. The founder meets it as a **remote (пульт)**: each button looks at a situation, skillset, ecosystem, business, story or event through one prism. Behind the buttons, the **template router is the know-how** (task → the form that already knows how to do it). Sasha's own harnesses (orchestration, GitHub setup, terminal prompt, one chat + projects) become the **company's harnesses**, offered to founders. Hark is the **market confirmation** that people pay for such a thing; pricing is taken from Hark and, if possible, connected by API. The suite must **communicate its benefits**, and Sasha wants to understand them himself first. License and business model point to the unique-business line (3.3 / 3.6), not to a separate model here.

## 3. Notebook items: what exists, gap, v1 scope

Status words: **live** = on the site; **spec** = written in the repo, not built; **partial** = part of the ask exists; **notebook** = only Sasha's notebook.

| # | Notebook item | What exists now (link · status) | Gap | Proposed v1 scope (one line) |
|---|---|---|---|---|
| 1 | Your AI (ex-AI OS) | `/game/your-ai` · AIF §20 (harness, buttons, build path) · `src/data/yourAiCatalog.ts` · **live** (step 1 of AIF §20.4); rename everywhere = [issue #352](https://github.com/alexanderkonst/evolver-grid-site/issues/352) | Player-facing only; no founder-facing package; PB §0.2 row says "function to clarify", v0.4 | Your AI = the one name of the suite; founders get the same AI plus founder buttons (rows 4, 9, 10) |
| 2 | Current template (AI OS) | `/ai-os` + 4 category routes · [ai_os_v6_plan.md](../ai_os_v6_plan.md) · `system-prompts/v6.0/` (system-prompt, lite, manifest) · **live** | Shipped as a paste-in prompt, i.e. exactly the "just a prompt" Sasha moves beyond | Keep as the cognition layer inside Your AI and as the free paste-in export; no new prompt work in v1 |
| 3 | Terminal prompt | Nearest: repo `CLAUDE.md` (lane contract, templates-first) and PISP Stage 10 · **notebook** | No prompt a founder drops into their own terminal / repo | One `CLAUDE.md`-style template for a founder's repo = AI OS lite + templates-first rule + lane contract (see §7) |
| 4 | AI remote (пульт) / Controller | AIF §20.3 (buttons first, chat if you want) · [template-router.md](../../templates/template-router.md) Result column = Controller buttons · [holon-core.md](../../01-vision/holon-core.md) §Controller (H0.A) · **spec** | No Controller screen; four docs describe one thing (§5) | v1 Controller = the router's Result column rendered as buttons on `/game/your-ai`, first button "The whole thing in one sentence" |
| 5 | Hark AI as market confirmation | Canon §3 row (B1-29) → PB §6 · **notebook** | No written comparison of what Hark sells, to whom, at what price | One short benchmark note (Hark plans, units, what is free) inside PB §6, not a new doc |
| 6 | GitHub setup | PISP Stage 10 (coding agents, `claude.yml`, `@claude` issues) · **spec, partial** | Written for Sasha's repo; no founder starter repo | Founder starter = template repo with `claude.yml` + terminal prompt (row 3), linked from PISP Stage 10 |
| 7 | License / business model (→ unique business) | `/license` · **live**; PISP and prompts under CC BY-NC-SA 4.0; collective terms in [collective_terms_roadmap.md](../collective/collective_terms_roadmap.md) · **spec** | No line on how the suite itself is licensed or paid | No separate model: suite follows 3.6 terms; decision in §6 Q4 |
| 8 | One chat + projects | AIF §17 F1–F5 · [interface_almanac.md](../../ai/interface_almanac.md) · PISP Stage 1 · **spec** (ideas, not scoped) | Not part of Your AI; lives in Hark, which founders use today | v1: none built; founders run "one chat" in Hark/ChatGPT per PISP Stage 1; F2/F3 stay backlog |
| 9 | Orchestration of agents | Practiced: Hark ⇄ Claude Code (`@claude` issue → PR → merge) · PISP Part A (seven routines) · **spec, partial** | Not packaged as a founder product | Package PISP Part A routines 1 and 4 (critic on PR, post-merge verify) into the starter repo (row 6) |
| 10 | The Nature of AI | Nearest: PB §0.2 "Deep AI training" ($800 · 2 h, v1.0, "needs description") · **partial** | No content description; not linked to Your AI | One Controller button "Understand AI for the years ahead" that leads to the Deep AI training row; content stays Sasha's |
| 11 | Mental Garbage Clearings on AI | Nearest: same PB §0.2 row · **notebook** | Undefined | v1: none; ask Sasha whether it is a part of the training or its own button (not in §6, can wait) |
| 12 | "AI company, not a prompt" | Canon §3 row (B1-36, B1-40) → AIF §20 · **notebook** (framing) | Framing not yet visible to anyone outside | Becomes the one-line description of Your AI in PB §0.2 (replaces "уточнить"), Sasha writes it |
| 13 | Product = result (language or skill) + system prompt | Router law: label = result ([template-router.md](../../templates/template-router.md) Rule 5); [meta-template.md](../../templates/meta-template.md) · **spec** | Not stated as the product rule of the suite | Rule of the suite: every button = one template's Result + its prompt; nothing ships as a button without both |
| 14 | Remote buttons ⇒ look through a prism (situation / skillset / ecosystem / business / story / event) | [holonic-prism.md](../../templates/holonic-prism.md) (first button) · router rows (ecosystem-offer, unique-business-canvas, product-map…) · **spec** | Six objects named; router is organized by task, not by object | v1: tag each router row with the object it looks at (one column), no new templates |
| 15 | Take pricing from Hark, connect by API | PB §6 (credits: free to limit, larger packs upgrade the model; prices TBD) · `/ai-os/work-with-us` · **spec, partial** | No prices; Hark API not checked | v1: price model copied from Hark's public plans; API link only after Hark confirms a partner API exists (§6 Q3) |
| 16 | My harnesses → company harnesses | Sasha's live harnesses: Hark + Claude Code + Codex, PISP Part B, AI OS v6.0, templates library · **notebook** | No inventory of which harness becomes which company asset | Inventory = PISP Part B table; each row gets "company harness: yes/no" (one column) |
| 17 | Communicate the benefits (and understand them first) | Canon §3 row (B1-41) · **notebook** | No benefit statement | Run [holonic-prism.md](../../templates/holonic-prism.md) on Your AI → one sentence for Sasha to accept, then PB §0.2 row |
| 18 | Template router = KNOW-HOW | [template-router.md](../../templates/template-router.md) v1.2 · Hark specialty `templates-first` · **spec, in use by agents** | Used by agents, not yet by founders | Router is the Controller's source (§5); founders get it through buttons, not as a document |

Related, outside 3.4 (link only): Your AI as the connector between founder+AI pairs, Face 2 → [ai_matchmaker_brief.md](../ai_matchmaker_brief.md); Your AI as a ring through all faces → [golden_age_canon.md](../golden_age_canon.md) §1.

## 4. Architecture (≤10 lines)

1. **Your AI** is the company the founder talks to: one name, any model underneath, the moat is the harness (AIF §20.1–20.2).
2. **Harness** = player/founder card + knowledge graph retrieval + write-back traces + model routing + evals (AIF §20.2); AI OS v6.0 is its cognition layer ([ai_os_v6_plan.md](../ai_os_v6_plan.md)).
3. **Remote / Controller** = the surface: 1–4 buttons per turn, chat optional (AIF §20.3).
4. **Each button = one template's Result line** in the router; under it sits that template's prompt (the prism, the canvas, the offer…) ([template-router.md](../../templates/template-router.md) Rule 5).
5. **Template router** decides which template answers a task; for agents today, for buttons tomorrow. Inferred: one router serves both, so the Controller needs no second list.
6. **Holonic prism** is the first button and the base every template stands on ([holonic-prism.md](../../templates/holonic-prism.md)).
7. **Agent orchestration** is the execution layer behind heavy buttons: an orchestrator chat opens `@claude` issues, workers build, critic and verify routines check (PISP Part A). Inferred: founders get it as a starter repo, not inside the Your AI screen.
8. **Company harnesses** = Sasha's harnesses packaged (terminal prompt, GitHub starter, routines) so each founder runs the same stack (inferred from notebook row "мои обвязки все сделать обвязками компании").
9. **Pricing** meters model calls in credits: free to a daily limit on a cheap model, paid packs unlock the stronger model for readings (PB §6; AIF §20.5 #1); price levels benchmarked on Hark (inferred, notebook only).

## 5. Canonical home for the controller / router / prism cluster (proposal for Sasha)

**Proposal:** [docs/templates/template-router.md](../../templates/template-router.md) is the single source for **which Controller buttons exist and what each delivers** (its Result column already is the button list, Rule 5).

The others then hold one thing each and link to the router for the list:
- [holonic-prism.md](../../templates/holonic-prism.md): one template, the first button; its prompt only.
- AIF §20.3 ([ai-familiar_tracker.md](../../specs/ai-familiar/ai-familiar_tracker.md)): how buttons render and behave in Your AI (generative UI, 1–4 per turn, chat optional); no button list.
- [holon-core.md](../../01-vision/holon-core.md) §Controller (H0.A): which holon each button serves (IDs); no button list.
- [golden_age_canon.md](../golden_age_canon.md) Ring rows "Controller" and "Template router": status + link to the router.

Why the router: it is the only doc that already ties task → template → result → shift technology, agents already read it on every task, and a button without a template behind it would break the product rule (row 13). Applying this means trimming duplicate wording in the four docs to one-line links; nothing is deleted. Waits on Sasha's yes (§6 Q1).

## 6. Open questions for Sasha (each with a ready default)

1. **Canonical home.** Make `template-router.md` the single source of the Controller button list (§5)? **Default:** yes; the other four docs become links.
2. **Who the suite is for in v1.** Founders in Module 3 (the collective), or every player? **Default:** founders in Module 3 first, on top of the Your AI every player already has; players keep today's `/game/your-ai`.
3. **"Take pricing from Hark, connect by API".** Copy Hark's price model, or resell Hark through an API? **Default:** copy the model now (credits, free to a limit, packs upgrade the model, already PB §6); check whether Hark offers a partner API as a separate question, no integration until it does.
4. **License / business model of the suite.** Its own model, or the 3.6 terms? **Default:** no separate model; prompts and templates stay CC BY-NC-SA 4.0 (as today), hosted Your AI uses the credits of PB §6, and founders in the collective use it under the 3.6 terms ([collective_terms_roadmap.md](../collective/collective_terms_roadmap.md)).
5. **Name.** "Founder's AI suite" or "Your AI" for founders? **Default:** "Your AI" everywhere (one name, as in issue #352); "Founder's AI suite" stays only as the internal name of branch 3.4.

## 7. Smallest next build step

**Founder terminal prompt v0:** one file `system-prompts/v6.0/terminal.md`, a `CLAUDE.md`-style prompt a founder drops into their own repo: AI OS v6.0 lite (`system-prompts/v6.0/lite.md`, linked, not copied) + the templates-first rule pointing to [template-router.md](../../templates/template-router.md) + a short lane contract (agent proposes, founder approves outbound and money), linked from PISP Stage 10.

**What it ships:** the first company harness made from Sasha's own (closes notebook rows 3 and 16, half of 6), and the first way the router know-how reaches a founder's agents without Sasha. Docs only: no `src/` change, no Lovable credits, no outreach. **Status: v0 shipped** 2026-11-21 → [system-prompts/v6.0/terminal.md](../../../system-prompts/v6.0/terminal.md).
