# Brief — The Founder-Market Fit Surface

*For a coding agent working in `evolver-grid-site`. Self-contained. Day 170, August 29, 2026.*

**Invoke the `evolver-page` skill before starting.** It carries the house conventions: component structure, routing, trilingual i18n (EN/RU/ES), the parchment/editorial aesthetic, and browser verification. This brief supplies only what that skill cannot know.

---

## Why this page exists

Alexander Konstantinov is claiming an existing but unowned category: **founder-market fit**. The term already circulates in venture culture, everyone believes it matters, and nobody has converted it from a verdict into a method. The strategic law is in [`phase_shift_technology_library.md`](../01-vision/phase_shift_technology_library.md) Technology 141.

A category is owned by whoever supplies **five possessions**. He has all five, but they are scattered across the corpus and the platform. **This surface gathers them in one navigable place. That gathering is the claim.**

Nothing here is new content to invent. It is assembly.

---

## The five possessions and their sources

| # | Possession | What it is here | Source of truth |
|---|---|---|---|
| 1 | **Definition** | The canonical public definition of founder-market fit | [`docs/02-strategy/founder_market_fit.md`](../02-strategy/founder_market_fit.md) |
| 2 | **Theory** | Why a business is the outer form of a person, and how fit forms | Unique Business theory in [`unique_business_playbook.md`](../03-playbooks/unique_business_playbook.md) Parts 0 and I |
| 3 | **Instrument** | The reads that measure fit: uniqueness, ripeness, transition | Technology 123 (Ripeness Vector); `docs/holomaps/transition_holomap.md`; `docs/holomaps/uniqueness_holomap.md`; the existing quiz |
| 4 | **Method** | The repeatable process that produces fit, and the canvas it outputs | `unique_business_playbook.md` Parts II-IV; the UB canvas (7 artifacts) |
| 5 | **Proof** | Named unit-level cases where fit was produced | `docs/02-strategy/unique-businesses/*.md` — **consent required per person before any public use** |

**Also carry:** Technology 142 (Only You Should Be Able to Build It), which supplies the founder-facing principle and the four-degree decision tree. That table is the most immediately useful thing on the page for a visitor.

---

## What to build

**Phase 1 — the document.** A single long-form page that presents all five possessions in order, each clearly labelled as what it is. The order matters and is not negotiable: Definition, then Theory, then Instrument, then Method, then Proof. A reader must be able to see, in one scroll, that this is a complete category apparatus rather than a marketing page.

**Phase 2 — the web surface.** The same content as a navigable page: sticky section nav, deep-linkable anchors per possession, the 0-10 scale and the four-degree decision tree as first-class visual elements rather than paragraphs.

Prefer **upgrading the existing playbook section on the platform** over creating a parallel surface. Audit what is already routed before adding anything new. A new route is a last resort, not a starting assumption.

---

## Content rules

- **Do not paraphrase the definition.** `founder_market_fit.md` is canonical. Quote it exactly.
- **Say "founder-market fit" verbatim, every time.** Never "founder/market fit", never "founder-market alignment", never "FMF". Language discipline is load-bearing for a category claim: every synonym splits the reader's memory in two.
- **The definition is given away.** It must be ungated, uncopy-protected, and explicitly free to reuse with attribution. No email wall in front of it. The method is what is sold; the definition is what travels.
- The scale (0-10) and the three tests should be usable by a reader on themselves, unaided, in under a minute.
- No proof case ships without written consent from that founder. If consent is not confirmed, leave the Proof section with its honest placeholder.

---

## Voice

Short sentences, one idea each, concrete over abstract. **No em dashes and no "Not this. That." constructions** anywhere on the page; both read as AI tells to this audience. No promotional adjectives. Copy is Sasha's to approve: draft it, never ship new copy as final.

---

## Definition of done

1. All five possessions present, labelled, in order.
2. The definition matches the source file word for word.
3. The 0-10 scale and the four-degree decision tree render as visual elements.
4. Trilingual (EN/RU/ES) per house convention. **System prompts are never translated; English stays the source of truth for any LLM instruction.**
5. Nothing gated. No email capture in front of the definition.
6. Browser-verified: no console errors, responsive, both themes.
7. `tsc --noEmit` clean.

---

## Do not

Do not invent new framework content. Do not rename anything. Do not create a parallel spec document. Do not publish proof cases without consent. Do not ship copy changes to existing surfaces that were not asked for.
