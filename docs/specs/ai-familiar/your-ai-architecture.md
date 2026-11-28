# My AI: conceptual architecture, phases and onboarding roadmap

Date: 2026-11-25 · Status: v0 adopted as working frame (Sasha 2026-11-25 16:56 CST: «Не знаю, делай как рекомендуешь дальше решим»; one ladder taken provisionally, open to revisit) · Template: integral-synthesis (compressed run, see §7) · Author: Hark
Source: Sasha 2026-11-25 13:54 MST (the eleven parts, tracker §22) and 13:58 MST: «да, надо продумать концептуальную архитектуру, включая ФАЗОВОСТЬ! и включая ДОРОЖНУЮ КАРТУ ОНБОАРДИНГА, УЧИТЫВАЯ ТО УЖЕ СОЗДАЛИ» (*Translation:* "yes, we need to think through the conceptual architecture, including PHASES, and including the ONBOARDING ROADMAP, taking into account what we have already built").
Single source of truth: the eleven parts and their status live in [ai-familiar_tracker.md §22](./ai-familiar_tracker.md); positioning and pricing in §21; the harness in §20. This file only assembles them into one whole and links.

## The whole in one sentence
**My AI is Sasha's own AI setup, handed to the player piece by piece inside the game: at each rung you get one piece, do it by hand and see it work for you, and from then on My AI does it for you.**

## 1. Organizing principle
**"By hand first, then by connector; each piece only when you can see it work."** (from the wizards' law «setup piece handed over when the check passes, never before», [your_ai_wizards_spec_v0.1.md §3](../../02-strategy/ai-suite/your_ai_wizards_spec_v0.1.md), and Sasha 13:54: «сначала человек сам, а потом мы повторяем … через коннектор»).
Rules out: a feature menu handed over on day one; any part the player has not yet earned (same rule as the instrument: it holds only what you earned, [navigation architecture §2 rule 2](../navigation-instrument/architecture.md)).

## 2. The whole, level by level

```
                 SURFACE   the air face of the instrument: chat · installed apps · what it knows of you
                    │      (navigation architecture §6; first reveal §5.3)
   ┌────────────────┼──────────────────────────────────────────────┐
 SEEING          panels ─── Founder Cockpit (panels about your business, on your page)
   │                ▲
 DOING     Console = buttons = apps ── preinstalled (free) ── app store (free/paid, authors, standard)
   │                ▲
 KNOWING   player card · memory from other AIs · files (GitHub) · call recordings · knowledge graph + Phase Shift Library
   │                ▲
 CORE      AI OS v6.0 (main system prompt) + the model (phase A: Lovable gateway · phase B: direct API, tiers)
   └────────────────┴──────────────────────────────────────────────┘
 TIME      phased hand-over of Sasha's setup: rungs 1 → 5 (§3), each rung switches parts on
```

| Level | Invariant it answers (the player's need) | Parts (tracker §22 #) |
|---|---|---|
| Core | "It thinks well, boldly, about me" | 2 AI OS · model |
| Knowing | "It knows me and my work without re-pasting" | 3 harness · 7 memory import · 6 files · 5 calls |
| Doing | "One tap gives a result" | 1 Console · 9 preinstalled apps · 10 app store |
| Seeing | "I see where my business stands at a glance" | 4 panels · 8 Founder Cockpit |
| Time | "I grow into the whole setup, not drown in it" | 11 phased hand-over |

Emergent property: the more rungs the player walks, the less they type. Inputs feed the buttons, buttons write traces, traces feed the panels (§20.2 d write-back), so the Console and the Cockpit get sharper by themselves.

## 3. Phases: the person's path and the product's path, as one

**One ladder, not two.** Today there are two: the five mini-training rungs ([00-ladder.md](../../02-strategy/ai-suite/mini-trainings/00-ladder.md), public, in the game) and the eight setup levels ([ai_course_outline_v0.1.md §3](../../02-strategy/ai-suite/ai_course_outline_v0.1.md), wizards, levels 4–7 inside the collective). *Judgment:* the five rungs are the spine the player sees; the eight levels nest inside them as the depth of each rung. Nothing is rewritten; each file keeps its content.

| Rung (person) | Nested levels | By hand (the player does it, sees it work) | Then by connector (My AI does it) | Parts switched on | Product phase |
|---|---|---|---|---|---|
| 1 AI as a Mirror | 0, 1 | asks My AI with their profile; catches one flattery | Console's first chain runs on their profile | AI OS, Console (Phoenix chain), preinstalled apps | A |
| 2 AI That Knows You | 1, 3 | builds their one-page profile; pastes it into any AI | **imports memory from other AIs** into My AI | harness (card), memory import | A |
| 3 AI in Your Business | 2, 3 | writes the living project document; records a call and pastes the transcript | Founder Cockpit panels read the document and the calls | Founder Cockpit, calls, panels (first) | A |
| 4 Your Harness | 4 | AI OS Lite, approval rules, makes 3 own buttons by the standard | own buttons in their Console; may publish to the store | app store (authoring), panels (own) | A → B |
| 5 AI Company | 5, 6, 7 | own GitHub repo, files and one routine set up by hand | My AI works their repo and routines through a connector, like Hark | files (GitHub connector), routines | B |

**Product phases** (Sasha 2026-11-24 23:46, tracker §21):
- **Phase A:** model through the Lovable AI gateway, cheap model, per-player daily cap, everything free. Covers rungs 1–3 (light use: chat, buttons, cards).
- **Phase B:** direct API, usage tiers (base, 5x, 10x, 20x, custom; level proposed ×1.5 of the labs). *Judgment:* B is triggered by rungs 4–5, because connectors and routines multiply calls; paid buttons in the store also start in B, since they need billing.
- Prices and the order of phases are Sasha's. Stripe is Sasha's.

## 4. Onboarding roadmap, first touch to full setup (with what exists)
Status: **есть** exists · **частично** partly · **нет** missing. Protected flows are linked only, never changed here.

| # | Step | Status | Where it lives |
|---|---|---|---|
| 0 | First touch: title, intro, entry | есть (protected) | game entry; not touched |
| 1 | Top Talent reveal; profile created | есть (protected) | Zone of Genius; not touched |
| 2 | Instrument appears: first reveal, micro-onboarding of the five lines | частично: octahedron phase 1 merged (#458); reveal sequence approved, build in WP7 | [navigation architecture §5.3](../navigation-instrument/architecture.md), [sow.md](../navigation-instrument/sow.md) |
| 3 | My AI chat with the profile (air face) | частично: live in ZoG entry via `library-advisor`; drift and invented copy to fix | tracker §20.1, §20.4 |
| 4 | Rung 1 «AI as a Mirror» | есть (live) | `/mini-trainings/ai-as-a-mirror`, [01-ai-as-a-mirror.md](../../02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md) |
| 5 | Console: the Phoenix chain, five buttons | частично: spec v1.1, build queued (#475) | [console-v1.md](../your-ai-console/console-v1.md) |
| 6 | Preinstalled apps in the Console | частично: prompt suites live at `/ai-os`, not yet inside the instrument | `src/modules/ai-os/` |
| 7 | Rung 2 «AI That Knows You»: one-page profile, portable | частично: page merged (#468), texts v0.1 draft | [02-ai-that-knows-you.md](../../02-strategy/ai-suite/mini-trainings/02-ai-that-knows-you.md) |
| 8 | Memory from other AIs, imported | нет | tracker §22 #7 |
| 9 | Rung 3 «AI in Your Business»: living project document | нет (planned at steps 1–2) | [00-ladder.md](../../02-strategy/ai-suite/mini-trainings/00-ladder.md) |
| 10 | Founder Cockpit: panels about your business on your page | частично: `/build/cockpit` landing and dashboard, `cockpit-ai-lens` function; panels-on-your-page (v1.0 idea) not built | [founder-cockpit-lunar/spec.md](../founder-cockpit-lunar/spec.md), `src/pages/CockpitDashboard.tsx` |
| 11 | Call recording (advice first, then transcripts in) | нет | tracker §22 #5 |
| 12 | Rung 4 «Your Harness»: AI OS Lite, approval rules, own buttons | частично: AI OS Lite exists; approval-rules template and button authoring missing; button standard v0 drafted | `system-prompts/v6.0/lite.md`, tracker §22 (standard v0) |
| 13 | App store: free and paid buttons, by authors | нет; button format laid in Console v1 | console-v1.md § Button format |
| 14 | Rung 5 «AI Company»: files by hand, then GitHub connector; one routine | частично: terminal prompt v0 exists; starter repo, connector, routines missing | `system-prompts/v6.0/terminal.md`, ai_course_outline §3 levels 5–7 |
| 15 | Knowledge graph and Phase Shift Library by retrieval | частично: library exists as a document; retrieval not built | `docs/01-vision/phase_shift_technology_library.md`, tracker §20.4 step 3 |

Not found in the repo: a "Working Cabinet" file; the player card today is client-side (tracker §20.4 step 1).

## 5. What we cut and why
- A second ladder: the eight levels stay as depth inside the five rungs, not a parallel path.
- Founder Cockpit as a separate product: it is the Seeing level of My AI (Sasha 13:54).
- Any part shown before its rung: the instrument shows outlines with "Opens on your path", never a locked menu.
- Detail count: two ladders + eleven loose parts → one ladder of five rungs carrying five levels.

## 6. What changes, and for whom
- Console v1 is rung 1's piece; its spec stands as is (button format already store-ready). Build continues under #475.
- Next specs, in ladder order: memory import (rung 2), Founder Cockpit panels on the person's page + call advice (rung 3), button authoring and the store (rung 4), GitHub connector (rung 5).
- Chat fixes (step 3) come before rung 2, since every rung talks through that chat.
- Nothing here touches reveal, Mission Discovery, intro, themes or game entry.

## 7. Evidence and gaps
- Compressed run of the template: the exemplars are products whose setup grows with the user (Hark: chat, connectors, panels, approvals; ChatGPT and Claude: memory, projects, connectors, GPT store / skills; iPhone: preinstalled apps + App Store + review guidelines; Pip-Boy: the carried instrument). Grade C (Hark's knowledge, not freshly sourced) for the shared invariants: think well, know me, act in one tap, show me at a glance, grow with me. *Judgment:* the "store with a review standard" pattern (iPhone App Store, GPT store) is the one to copy for part 10.
- Gaps we must invent and test: how memory import works from each AI (format, privacy); what a panel is inside the game; the quality standard's test for authors' buttons.
- Discrepancy to settle: tiers read "base, 5x, 20x, custom" in tracker §21 and "5x/10x/20x/custom" in Sasha's 2026-11-24 answer; this file uses the latter.

## 8. Acceptance test
A new player, from first touch: gets the instrument after their profile, taps one Console button and gets a card about themselves, walks rung 2 and finds My AI already knows what ChatGPT knew of them, and at rung 3 sees their business on panels without typing it again. No wall, no locked menu, no feature they did not earn.

## 9. Decisions for Sasha
| # | Decision | My recommendation | Confidence |
|---|---|---|---|
| 1 | One ladder: five rungs as the spine, the eight levels nested inside; each rung hands a piece by hand first, then by connector | Adopted provisionally (Sasha 2026-11-25: «делай как рекомендуешь дальше решим») | вероятно |
| 2 | Order of phases and prices (product phase B trigger, paid buttons) | B starts at rung 4; paid buttons with B | примерно поровну |
| 3 | Founder Cockpit keeps its name inside My AI | Keep it (known name, landing exists) | вероятно |
