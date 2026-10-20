# Zero-to-One Generator — Post-FMF Spec

*Spec, 2026-10-20. Status: draft for Sasha's review. Docs only: no code, no schema, no prompts written yet. Issue: #92.*

**Public names.** The product is **Zero-to-One, a PMF OS**. Its sibling is **Founder Cockpit, a business automation OS**. Never "Founder OS" in anything a founder or the public can read.

## Transformational result

One sentence: **A founder leaves the Founder-Market Fit session with a brief, a market read, a mission, a Now/Next/Later roadmap and a landing draft, all built from their own bullseye and none of it invented.**

The generator is the deliverable of the $555 Founder-Market Fit session. The session finds what is true about the founder. The generator turns that into the first set of business artifacts, fast, without replacing the founder's uniqueness with generic startup advice.

Reference mechanic: Polsia turns one brief into research, mission, roadmap and a landing page in minutes. Zero-to-One does the same, but the brief starts from the founder's Appleseed bullseye instead of a blank prompt, and the brief carries hard limits on what the generator may assert.

## How this fits what already exists

| Existing piece | Where it lives | Role here |
|---|---|---|
| Appleseed, Bullseye Sentence, Three Lenses | `docs/07-technology/unique_gift_technology.md` | Source of the founder's essence. Verbatim input. |
| Excalibur (the offer) | `docs/07-technology/excalibur_technology.md` | Turns the gift into a one-sentence offer. Feeds step 1. |
| Product Compiler flow (Appleseed → Excalibur → ICP → TP → landing → publish) | `docs/07-technology/product_compiler_flow_spec.md` | The nearest earlier spec. This spec reuses its steps 1–5 and replaces step 6 (publish) with a founder-approval gate. |
| The Bridge: Pain + Promise → Transformational Result → trinity sub-results → 1st session | `docs/03-playbooks/integrated_product_building_workflow.md` | Rule that the session comes before software. Drives what lands in Now. |
| The $555 session | Called "Productize Yourself Session" in `docs/00-master/context.md`, "Ignite Session" in `docs/03-playbooks/funnel_synthesis_day47.md` | This spec calls it the Founder-Market Fit session, as issue #92 does. Whether these are one offer under three names is an open question (see the end). |
| Founder Cockpit | `docs/04-products/living_project_holograph.md` | Where the Founder Brief, once approved, lives and is read from at runtime. |

**On the "Integral Product Building Map".** That exact name does not appear in the repo. The playbook chain it describes does: `docs/03-playbooks/integrated_product_building_workflow.md` holds the Product, Architecture and UI phases; `marketing_playbook.md` and `distribution_playbook.md` hold the Market Path. The pipeline below follows those files. If the Map is a separate document, point me at it and I will re-map.

---

## 1. Input

Three inputs, all produced before the generator runs. The generator does not collect new facts about the founder. If a fact is missing, it goes into "Do not invent" in the brief (section 4).

| Input | Source | Form | Handling |
|---|---|---|---|
| **Appleseed bullseye** | Appleseed result (`zog_snapshots`) | Bullseye Sentence, Vibrational Key, Three Lenses, Monetization Avenues, Elevator Pitch | Quoted verbatim into the brief. Never reworded. |
| **Zone of Genius** | Excalibur output and the 12-perspective profile | Excalibur offer sentence, Best Complementary Partner, Mastery Stage | Quoted verbatim. Used to constrain the offer and the ICP. |
| **FMF session notes** | Facilitator notes and transcript from the 90-minute session | Free text, plus the founder's own phrases for pain, promise and ICP | Phrases the founder used are tagged as theirs and are the only source for pain and promise wording. |

Also read, if present: the founder's company name, URL, existing offers and prices, and any numbers the founder stated in the session. These go into **Facts** only if the founder said them or a document shows them. Nothing is inferred from the web and promoted to a fact.

**Gate before running:** Appleseed resonance rating is recorded, the session notes exist, and the company name field is filled exactly as the founder wrote it. If any is missing, the run stops and asks.

---

## 2. Pipeline

Six steps in the order the issue gives, each mapped to the playbook that already defines it. Each step reads the Founder Brief and may only add to it in the "generated, pending approval" state.

```
Appleseed + ZoG + FMF notes
        │
        ▼
 0. Brief intake        → Founder Brief v0 (Facts locked, unknowns listed)
 1. Value proposition   → ICP, Pain, Promise, Master Result, 3 sub-results
 2. Product playbook    → 1st session design, product shape
 3. Software architecture → build/no-build decision, minimal data and routes
 4. UI                  → visual rules and landing layout
 5. Marketing           → landing copy, core belief, packaging
 6. Distribution        → first channels, who to reach
        │
        ▼
 Founder Brief v1 · Market Research · Mission · Roadmap · Landing draft
        │
        ▼
 Founder review and approval gate  (nothing leaves before this)
```

### Step 0. Brief intake

Builds Founder Brief v0 from the three inputs. Splits what is known (Facts) from what is not (Do not invent). Asks the founder to set Kill criteria if they are not already set. No generation of marketing or strategy happens before v0 exists.

**Outputs:** Founder Brief v0.

### Step 1. Value proposition

Playbooks: `pain_theory_playbook.md`, the Bridge section of `integrated_product_building_workflow.md`, Product Compiler steps 2–4 (Excalibur, ICP deepening, TP deepening).

- Takes the Excalibur offer and the session's own pain and promise language.
- Writes the Transformational Result as "From [Point A in their pain language] to [Point B in their promise language]."
- Splits it into three sub-results, each a felt win with its own A and B.
- Deepens the ICP: who exactly, pain, awareness stage.

**Outputs:** ICP, Pain, Promise, Master Result sentence, three sub-results. These feed the Mission and the Market Research.

### Step 2. Product playbook

Playbook: `product_playbook.md`, Phase 1 of the workflow (Master Result → Sub-Results → Screens → Dan Tians).

Per the Bridge, the first product is a session, not software. The step designs the first session the founder can deliver: which sub-results can be guaranteed, named in universal language, with a silhouette of the full path. Screens and Dan Tians (Heart, Mind, Gut) are drafted only for the sub-results that the Roadmap puts in Next or Later.

**Outputs:** 1st session design (guaranteed results, language test, silhouette), product shape. Feeds Roadmap Now.

### Step 3. Software architecture

Playbook: `software_architecture_playbook.md`, Phase 2 of the workflow.

Decides whether software is needed at all yet. If the Now items are sessions and conversations, this step outputs "no build yet" with the trigger that would change that. If a build is justified, it outputs module boundaries, a route list and the data the module reads and writes, nothing more.

**Outputs:** build/no-build decision with reasons, minimal architecture sketch when needed. Feeds Roadmap Next and Later.

### Step 4. UI

Playbook: `ui_playbook.md`, `docs/05-reference/brandbook.md`, Phase 3 of the workflow.

Applies the founder's brand if they have one; otherwise falls back to the brandbook tokens and the landing layout in step 5. Surface treatment choice (light or dark glass) follows the UI Playbook rule for landing pages.

**Outputs:** visual rules and layout for the landing draft.

### Step 5. Marketing

Playbook: `marketing_playbook.md` (core belief, packaging, frictionless purchase; Register Test; Shelf and Cathedral).

- Core belief of the offer, drawn from the founder's own words.
- Packaging: the offer on a shelf the buyer already knows, with the category narrative kept off the priced surface.
- Landing copy using the six-section structure from the Product Compiler spec: Hero, Pain, Vision, About, Offer, CTA. The About section uses only credibility present in Facts.

**Outputs:** landing copy, offer packaging, comparison set for Market Research.

### Step 6. Distribution

Playbook: `distribution_playbook.md` (reach, delivery, spread).

Names the first reachable people and channels from what the founder already has (their network, existing audience, where the ICP gathers). Does not invent audience size or reach numbers. Anything the founder has not provided is a Do-not-invent item.

**Outputs:** first channels and first-ten-people approach. Feeds Roadmap Now and Next.

---

## 3. Outputs

Five artifacts. All are drafts until the founder approves them.

| # | Output | Built from | Contents | Lives in |
|---|---|---|---|---|
| 1 | **Founder Brief** | Steps 0–6 | The single source of truth for the other four. Template in section 4. | Founder Cockpit, once approved |
| 2 | **Market Research** | Steps 1, 5, 6 | ICP in their own words, comparison set (what buyers use today), category shelf, price anchors, open questions. Every claim carries a source link or the tag "founder said" or "not verified." | Brief appendix |
| 3 | **Mission** | Appleseed bullseye, Master Result | One sentence. Drafted from the bullseye and the Master Result and shown with the exact phrases it came from, so the founder can check the derivation. | Brief |
| 4 | **Roadmap (Now / Next / Later)** | Steps 2, 3, 6 | See below. | Brief |
| 5 | **Landing draft** | Steps 4, 5 | Hero, Pain, Vision, About, Offer, CTA as editable copy plus a layout note. Not deployed. | Draft only |

**Roadmap structure.** The sorting rule is the BUILD SOP gates from `docs/00-master/context.md`, so Now/Next/Later is not invented per founder:

| Column | What goes in it |
|---|---|
| **Now** | The work behind the current gate: first delivery to the first person who comes to mind, then the free sessions, then the first sale. Sessions and conversations before software. |
| **Next** | The gate after the current one (first sale → ten paid clients = PMF), plus the first build item if step 3 said a build is justified. |
| **Later** | Everything beyond ten paid clients, each item with the trigger that would pull it forward. |

Each roadmap item has an owner (founder or generator), a source (which part of the brief it came from) and a link to the Kill criterion it is tested against.

---

## 4. Founder Brief template

The brief is a Markdown file. Three blocks are mandatory. A brief missing any of them is invalid and the run stops. Every field is tagged with its origin:

- `[A]` Appleseed or Excalibur output, verbatim
- `[S]` said by the founder in the session, verbatim or near-verbatim
- `[F]` confirmed by the founder after the run
- `[G]` generated, pending founder approval

```markdown
# Founder Brief: {Founder name}

Version: v0 | v1 | ...        Run date: YYYY-MM-DD
Session: Founder-Market Fit, {date}
Status: DRAFT | APPROVED by {founder} on {date}

## 1. Facts (do not contradict)

Everything below is true by the founder's own word or by their own document.
Every later artifact must agree with this block. If an artifact needs to
differ, it must raise the conflict (see block 2) and not resolve it silently.

| Fact | Value (verbatim) | Source tag | Where from |
|---|---|---|---|
| Company name | {exactly as the founder writes it} | [S] | session {date} |
| Founder name and role | | [S] | |
| Bullseye Sentence | | [A] | Appleseed {date} |
| Excalibur offer | | [A] | |
| Zone of Genius, Three Lenses | | [A] | |
| ICP, in the founder's words | | [S] | |
| Pain (Point A), in the founder's words | | [S] | |
| Promise (Point B), in the founder's words | | [S] | |
| Existing offers and prices | | [S] | |
| Numbers the founder stated (clients, revenue, audience) | | [S] | |
| Constraints (time, money, things they refuse to do) | | [S] | |

## 2. Do not invent — flag and ask

Anything the generator needs but does not have. The generator writes the
question here and leaves the dependent text out. It does not fill the gap
with a plausible guess.

| Unknown | Why it is needed | Question for the founder | Blocks | Answer |
|---|---|---|---|---|
| e.g. current client count | Roadmap Now depends on which gate they are at | "How many people have paid you so far?" | Roadmap | |

Standing list of things the generator never supplies on its own:
company facts (names, dates, numbers), revenue and audience figures,
testimonials and client names, credentials and press, prices the founder
has not stated, competitor claims it cannot link to a source, quotes
attributed to anyone.

## 3. Kill criteria

The founder's own conditions for stopping, changing or pausing. The
generator may propose candidates; a candidate has no force until the
founder marks it [F].

| # | Test | Threshold | Date or window | If it fails |
|---|---|---|---|---|
| K1 | | | | |
| K2 | | | | |

Rules:
- At least one criterion must be [F] before the Roadmap is produced.
- Each has a measurable threshold and a date. "Feels wrong" is not a test.
- "If it fails" names an action: stop, change the ICP, change the offer,
  pause and revisit with the founder.
- Roadmap items link to the criterion that would end them.
- The generator never edits, relaxes or deletes a [F] criterion.

## 4. Value proposition  [G]
Master Result: "From {Point A} to {Point B}."
Sub-results: 1) ... 2) ... 3) ...
ICP: ...        Pain: ...        Promise: ...

## 5. Mission  [G]
{One sentence} — derived from: "{bullseye phrase}" + "{Master Result phrase}"

## 6. Market Research  [G]
(see Outputs: every claim has a source link, "founder said", or "not verified")

## 7. Roadmap  [G]
Now / Next / Later (columns and fields as in section 3)

## 8. Landing draft  [G]
Hero · Pain · Vision · About · Offer · CTA

## 9. Approvals log
| Date | Item | Approved by | Note |
|---|---|---|---|
```

**Conflict handling.** If a generated line contradicts a Fact, the generated line is dropped, the conflict is written into block 2 as a question, and the Fact stands. If the founder says the Fact itself is wrong, the founder edits block 1 and the dependent artifacts are re-run.

---

## 5. Rules

These are hard rules for the generator and for anyone building it.

1. **Never rename the founder's company.** The name is copied from block 1 character for character: spelling, capitalization, spacing, punctuation. No "improved" variants, no shortened forms in headlines, no new brand names in any output. If the name looks like a typo or an awkward fit for a landing page, flag it in block 2 and ask. Do not change it.
2. **Nothing sends or publishes without founder approval.** This covers emails, DMs, LinkedIn or other posts, form submissions, landing page deploys, DNS or domain changes, payment links, ad spend, and any message to a third party. The generator produces drafts and stops. Each approval is one explicit act by the founder per item and is logged in block 9 with date and item. Approving the brief does not approve sending what the brief describes.
3. **Facts are read-only.** Block 1 is written once from the inputs and changed only by the founder.
4. **No invention.** Anything not in the inputs or a linked source goes to block 2. A missing fact produces a question, never filler.
5. **Quote, don't paraphrase.** Bullseye Sentence, Excalibur offer, and locked master texts are copied verbatim. Respect `.agent/canon-lock.md` for any locked paragraph.
6. **Founder's words for pain, promise and ICP.** Generated copy uses the founder's session language for these. The Bridge test applies: a stranger reading the landing page must know what they get without a glossary.
7. **Naming.** Public text says "Zero-to-One, a PMF OS" and "Founder Cockpit, a business automation OS." The phrase "Founder OS" never appears in generated output, templates or UI copy. Do not coin new product, feature or principle names; if a new term seems needed, ask.
8. **Voice.** All generated copy passes `.agent/anti-ai-style.md`, including the "what does that even mean?" test.
9. **Lane boundary.** The generator may read Hark-owned files through the existing symlinks for context. It writes none of them (CRM, Offer Ledger, outreach engine, pulse log, warm-base files).
10. **Session before software.** Roadmap Now holds delivery work (sessions, conversations, first sale) before any build item, following the Bridge in the integrated workflow.

---

## 6. Acceptance checks for a run

A run is done when all of these hold. They are checkable by reading the output.

- [ ] Founder Brief contains all three mandatory blocks; none is empty.
- [ ] Company name in every artifact matches block 1 exactly (string search).
- [ ] Every bullseye and offer quote matches the input verbatim.
- [ ] No sentence in any artifact contradicts a Fact.
- [ ] Every Market Research claim has a source link, "founder said" or "not verified."
- [ ] At least one Kill criterion is [F], with threshold and date.
- [ ] Roadmap Now contains no build item unless step 3 justified it.
- [ ] Block 2 lists every gap the generator hit; none was filled with a guess.
- [ ] No output was sent, deployed or published; block 9 shows the founder's approvals so far.
- [ ] The strings "Founder OS" and any new coined name are absent.

---

## Open questions for Sasha

1. **Session naming.** Is the Founder-Market Fit session the same offer as the $555 Productize Yourself Session and the Ignite Session, under a new name, or a fourth thing? The docs name the $555 offer two ways already.
2. **Polsia mechanics #1 and #5.** The issue title cites these, but no document in the repo defines Polsia's numbered mechanics. I treated #1 as "one brief drives everything" and #5 as the "do not invent" guard. Correct me if the numbering means something else.
3. **"Integral Product Building Map".** See the note near the top. Is this the integrated workflow doc or a separate artifact?
4. **Existing "Founder OS" strings.** `docs/04-products/equilibrium_task_flow_spec.md` and the live Equilibrium state use "Founder OS" as an internal workstream name. This spec bans it only for public text. Rename the workstream, or leave it internal?
5. **Time target.** Polsia says "in minutes." I did not put a time target in this spec because nothing in the repo supports a number. Set one once a first run exists.
6. **Where the generator runs.** Out of scope here. Likely candidates are an edge function beside the Product Compiler or a facilitator-run flow inside Founder Cockpit; this spec is agnostic.
