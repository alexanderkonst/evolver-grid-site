# Unique Business Builder v2.0 — Progress Tracker

**Started:** 2026-04-23
**Status:** ✅ Phase 1 COMPLETE · ⏳ Phase 2 (Architecture) ready to start
**Owner:** Alexander
**Approach:** Recursive. Applying the Integrated Product Building Workflow to build the tool that delivers it. First holon tests everything.

**Source of truth hierarchy:**
- **Constitution:** `/playbook` → `unique_business_playbook.md` (supreme authority)
- **Federal laws:** domain playbooks in `docs/03-playbooks/` (integrated_product_building_workflow · marketing · distribution · communications)
- **This spec:** one module's derivation from constitution + federal laws

**Predecessor:** v1.0 Genius Product Builder at `src/modules/product-builder/`. Kept live. Not migrated.
**This module:** `src/modules/unique-business-builder/` — new duplicate, built from the playbooks.
**AI runtime:** `openai/gpt-5.2` via Lovable AI Gateway. ~$1.50–$3.50 per full Dossier pass.

---

## INPUT ✅ COMPLETE (5/5)

- [x] 1. **ICP:** Founder who has top talent named (ZoG snapshot exists) but no structured business around it. Can name the gift but can't price, pitch, sell, or distribute it.
- [x] 2. **Transformation:** From "I have a named gift" → "I have a 17-artifact Unique Business Dossier with a Golden DM ready to send today."
- [x] 3. **Pain of Point A:** Every new conversation = explaining from scratch. Pricing feels arbitrary. Patterns don't get paid. The work stays local.
- [x] 4. **Dream Outcome:** "My business on one page. First 10 moves obvious. I walk into any conversation with the Tuning Fork already written."
- [x] 5. **Action:** Click through 17 artifacts (7 canvas + 1 session bridge + 9 market path). Press **Improve** on each → 27-perspective holonic roast auto-iterates. Lock when precision ≥ 9.5. End: shareable Dossier.

---

## PHASE 1: PRODUCT `[■■■■■■■■■■]` 100% internal · ⏳ Roast Gate 1 pending

- [x] 1.1 Master Result — *"From named gift to Golden DM in one guided click-through."*
- [x] 🔥 ROAST 1.1 (applied in spec §"Roast findings applied")
- [x] 1.2 Sub-Results — 12 felt wins mapped to 17 artifacts across 4 phases (Canvas / Session / Market / Dossier)
- [x] 🔥 ROAST 1.2
- [x] 1.3 Screens — 14 screens (overview + 12 artifact + diff review + dossier)
- [x] 🔥 ROAST 1.3
- [x] 1.4 Screen Details — Heart/Mind/Gut per screen (table in spec §1.4)
- [x] 🔥 ROAST 1.4
- [x] 1.5 Extensions — artifacts, emotional states, completion, skip paths, bridges
- [x] 🔥 ROAST 1.5
- [x] 1.6 Wireframes — 3 key ASCII screens (entry, generic artifact, dossier)
- [x] 🔥 ROAST 1.6
- [ ] 🔥 **ROAST GATE 1** ← **CURRENT** — awaiting Sasha's walkthrough + sign-off

**What needs your review before Phase 2:**
1. Is the 17-artifact count right, or should we collapse (e.g. Marketing 3 → Marketing 1 screen with 3 sub-cards)?
2. Is the precision bar 9.5+ right, or tiered by artifact (e.g. Myth/Pain/Promise/Golden DM = 9.5, others = 8.5)?
3. Does "Improve" button carry enough agency, or do we need a small note field too ("make it sharper" / "try visceral")?
4. Is the Dossier the right terminal output, or should it compose to v1.0 Product Builder's marketplace listing too?

---

## PHASE 2: ARCHITECTURE `[░░░░░░░░░░]` 0%

- [ ] 2.1 Module Boundaries
- [ ] 2.2 Routing (flat `/ubb/*` vs nested — decide in 2.2)
- [ ] 2.3 Data Schema — delta drafted in [schema_delta.md](./schema_delta.md)
- [ ] 2.4 Shell & Layout
- [ ] 2.5 State Management
- [ ] 🔥 ROAST GATE 2

---

## PHASE 3: UI `[░░░░░░░░░░]` 0%

- [ ] 3.1–3.9 per Integrated Product Building Workflow
- [ ] 🔥 ROAST GATE 3

---

## PHASE 4: VIBE-CODING `[░░░░░░░░░░]` 0%

- [ ] 4.1 Create module folder + screen components
- [ ] 4.2 Implement screens (each calls `generate-artifact` + `improve-artifact`)
- [ ] 4.3 Connect routes
- [ ] 4.4 Connect data (`user_business_artifacts` + new `artifact_improvements`)
- [ ] 4.5 Verification (build, TS, console)
- [ ] 4.6 AI Self-Test (optional)
- [ ] 🔥 ROAST GATE 4

---

## PHASE 5: POLISH `[░░░░░░░░░░]` 0%

- [ ] First-holon run: Sasha dogfoods v2.0 end-to-end on his own business. Precision ≥ 9.5 on Myth/Pain/Promise/Golden DM.
- [ ] Second-holon runs: Oyi / Sergey / Karime / Sandra / Alexa / Kirill. Each leaves with a Golden DM they actually send within 48h.
- [ ] Ship criterion: a founder can go from "top talent named" → "Golden DM sent" in one session.
- [ ] 🔥 ROAST GATE 5

---

## Supporting spec files

- [unique-business-builder_product_spec.md](./unique-business-builder_product_spec.md) — Phase 1 output
- [improve_roast_prompt.md](./improve_roast_prompt.md) — The Improve template
- [artifact_prompts_spec.md](./artifact_prompts_spec.md) — 17 artifact generation + precision definitions
- [schema_delta.md](./schema_delta.md) — Supabase schema changes needed

---

**Next action after Roast Gate 1 passes:** Phase 2.1 — Module Boundaries. Define entry, exit, data in/out for `src/modules/unique-business-builder/`.
