# Templates

Reusable methods for producing things from Sasha's work: one file per template, each with its steps, rules of thumb and the places it has been applied. Extend a template here rather than copying it into a project doc; project docs link back.

| Template | What it produces | Status |
|---|---|---|
| [course-from-source.md](./course-from-source.md) | A mini-course (modules, 90–120 s episodes, NotebookLM Video Overviews) from a body of work: workshops, an article, infographics | in use (Activate Your Dormant Potential; Consciousness Meets Science draft); production line folded in 2026-10-27 |
| [testimonial-clips.md](./testimonial-clips.md) | Short verbatim testimonial clips (4–20 s, subtitled, 16:9 + 9:16) cut from recorded calls, consent-gated, for the game's Outro notes | in use (first batch 2026-10-27, private until consent) |
| [improvement-loop.md](./improvement-loop.md) | The standing loop for long builds: work by plan, ship, report in meaning, review the plan, improve the planning itself (with a planning retro) | in use (The Game of Being You, from 2026-10-27) |
| [holonic-seeing.md](./holonic-seeing.md) | One unified reading of anything from 27 positions (4 quadrants × 3 depths, the centre, the seeing of the seeing, then the one act); synthesized from 5 tellings | in use (synthesis layers, roasts, `/27`, Hark specialty) |
| [session-script.md](./session-script.md) | The recognition ritual end to end: pre-call, the free call, the same-day reflection, the $555 2-hour session and its close; synthesized from 6 tellings | in use (`/ignite`, Direction Calls, Founder-Market Fit Discovery Mastermind; entry door: 45-min Direction Call + webinar, Sasha 2026-10-27) |
| [unique-business-canvas.md](./unique-business-canvas.md) | A founder's whole business on half a page (six parts, Sasha 2026-10-27: Uniqueness, Shadow, Myth, Tribe, Transition, Promised Land): the artifact sequence with gates, the pain slicer, the deepening engine, the PMF hypothesis loop; synthesized from 9 sources | in use (9 canvases, UBB, `deepen-*`) |
| [spec-handoff.md](./spec-handoff.md) | An issue an agent can finish cold, three build gates, evidence that counts, PR rules and the review before merge; synthesized from 6 tellings | in use (Hark → Claude Code / Codex) |
| [module-form.md](./module-form.md) | The one form of every place, room and module: Intro → one button → result → Outro, the victories ritual, the real choice, the lock rule, the Koster check, build and polish gates; synthesized from 9 sources | in use (Journey J1–J12, WP-5) |
| [roasting.md](./roasting.md) | The next version of anything: critique rounds without fixing (fidelity), the crash-test (viability), roast gates in builds, the live roast after a publish; synthesized from 5 sources | in use (Appleseed, `deepen-*`, roast gates, live roasts) |
| [shift-offer.md](./shift-offer.md) | One offer sheet per template, module or product: Point A in their words, what they will see and do at B, the line «Ты увидишь… и сделаешь…» / "You will see… and you will…", a self-checkable promise, price by depth of shift; carries PST 173 | draft (applied to the game modules, `game_of_being_you.md` §17, 2026-10-27); guarantee fork open for Sasha |
| [product-map.md](./product-map.md) | A whole business as one map: its niche of shifts (consciousness / physical reality) down the side, replicable and simplified paths by depth across the top (video, game module, session, mastermind), each cell one Shift Offer, with four checks; carries PST 174 | draft (worked example from `game_of_being_you.md` §17, 2026-10-28) |

*Folder created 2026-10-27 (Sasha: «IMPORTANT»).*

---

## Corpus inventory by module (2026-10-27)

*Inventory only: nothing moved or promoted yet. Structured top-down by the levels of [meta-template.md](./meta-template.md) §5 (L0 → L1 → L2). The L1 list below is a **proposal for Sasha to confirm** (Meta-Template §7.6, task T3). Sources scanned: `docs/` (386 md files), `.agent/`, `tools/`, `system-prompts/`, `output/`, `scripts/`, prompts in `src/prompts/` and `supabase/functions/`, the knowledge graph repo (`knowledgegraph`: `Templates/`, `60 Stack/`, `90 System/`; its `10 Notes/` mirror docs/ and are not counted twice), and Hark's specialties (custom skills, which live outside the repo).*

**How to read a row.** *Lens* is the main lens the template works through. Working reading until T7 writes the lenses out: **Blueprint** = architecture, the structure of a whole and its parts; **Causal** = a sequence of causes that produces a result (steps, loops, protocols); **Ideal Forms** = the canonical shape of an output (format, archetype, copy law); **Unity** = form, quality, colour, sound, taste and light seen as one (felt coherence, whole-seeing). *Status*: in use / draft / historical / superseded. *Dated*: the latest date written inside the file (git dates are all 2026-10-23, the bulk migration, so they say nothing). *Verdict*: keep / promote to `docs/templates/` / merge with X / retire. *Module* names the village place (game blueprint §13.1) or the cross-cutting area.

### L0 · The Meta-Template
[meta-template.md](./meta-template.md): the whole as one template; emergence. Parent of everything below.

### Proposed L1 domains (for Sasha to confirm)

| # | L1 domain | Meta-description: how the Meta-Template sees this domain as its sub-part | Village places / modules mapped here | L2 count |
|---|---|---|---|---|
| 1 | **Business development** | Emergence as value taking form in the market: a uniqueness becomes an offer, an offer becomes an exchange, an exchange becomes a living business. | Workshop (UBB / Forge), Market (Trading Post, stalls, sessions), Sales & Outreach, Investor | 27 |
| 2 | **Consciousness development** | Emergence inside one person: seeing oneself, growing in the weakest domain, living in rhythm; plus the seeing instruments every other domain borrows. | Gate (Top Talent), Your House (Mission, QoL, Assets, colours), Academy (what is taught), Equilibrium (daily loop), Oracle (AI OS) | 22 |
| 3 | **Collectives** | Emergence between people: being recognized by one's own, resonance-matching, circles that hold a transformation together. | Café (MEET), Co-working (Party & Guild, matchmaking), Fire Circle (Mastermind, broadcast, webinar) | 11 |
| 4 | **Decentralization** | Emergence without a centre: the same form re-run by many owners, skins and villages, with value flowing back to a commons. | Town Hall (Venture Co-op), white-label skins, real villages (San Pancho = Village #1) | 8 |
| 5 | **The Game & the Village** *(proposed add)* | The Meta-Template in its Blueprint lens: the whole platform rendered as one game a person plays to become themselves. | Title, Gate entry, Quest Board, the form of every place, Character Sheet | 14 |
| 6 | **Content & Transmission** *(proposed add)* | The Meta-Template in its Ideal Forms and Unity lenses: Sasha's transmission carried without loss into words, images, sound and video. | Academy (production side), public diary (X / Telegram), brand, infographics | 15 |
| 7 | **Ops & Agents** *(proposed add)* | The Causal lens turned on the Meta-Template itself: the agents, loops and specs that let the whole build and evolve without Sasha re-explaining it. | AI OS internals, Claude Code / Codex handoffs, knowledge graph, docs discipline | 20 |

**Total: 117 L2 entries** (a few rows bundle a cluster of near-identical files; those are counted once and listed in the row). Open questions for Sasha: (a) are 5–7 new L1 domains or should they fold in (the Game as part of Collectives + Consciousness; Content as part of Business development; Ops as a layer under all)? (b) should the **seeing instruments** (holonic seeing, roasting, holomaps), now under Consciousness development, sit directly under L0 as the Meta-Template's own lenses?

---

### L1 · 1 Business development
*Emergence as value taking form in the market.*

| L2 template | Where (path · section) | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| Integrated Unique Business Playbook | `docs/03-playbooks/unique_business_playbook.md` (Workflows 1–10, Quick Prompt Reference, 5 Drift Signals) | the full method: gift → myth → tribe → offer → revenue | Causal | the emergence sequence told in the language of business | Workshop | in use, canonical · 2026-08-16 | keep (domain parent; too large to promote, link it) |
| Unique Business Canvas | `docs/02-strategy/unique_business_canvas_template.md` | a founder's canvas, each artifact in two forms; applied 9× in `docs/02-strategy/unique-businesses/` | Blueprint | one business seen as one form whose artifacts are its faces | Workshop | in use · undated (Sasha's own v1.11, 2026-10-14) | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) (2026-10-27) |
| Unique Business Creation, 10 steps | `docs/03-playbooks/unique_business_creation_playbook.md` | condensed path to first revenue | Causal | an earlier telling of the same sequence | Workshop | historical · 2026-02-14 | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) (2026-10-27) |
| Genius Business workflow | `.agent/workflows/genius-business.md` | agent run of the UB method | Causal | the same sequence as an agent command | Workshop | historical · undated | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) (2026-10-27) |
| Venture Growth Playbook | `docs/02-strategy/venture_growth_playbook.md` (Prototype Prompt Generator, Create My Sales Script) | growth steps and AI prompts | Causal | an early growth layer of the same sequence | Workshop | historical · undated | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) §7 (2026-10-27) |
| UBB artifact prompts | `supabase/functions/_shared/ubb-prompts.ts` (guidance, specificity criteria, output schema per artifact) | each UBB artifact, generated and improved | Blueprint | the canvas made executable | Workshop | in use (code is the spec) | keep |
| ICP Deepening | `docs/02-strategy/icp_deepening_template.md` + `supabase/functions/deepen-icp` | soul-deep ICP | Causal | the market seen as the person who resonates | Workshop | in use (productized) · 2026-01-24 | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) §6 (2026-10-27) |
| Transformational Promise Deepening | `docs/02-strategy/tp_deepening_template.md` + `deepen-tp` | Point A → Point B, deepened through 3 roasts | Causal | the transformation as the bridge between two states | Workshop | in use · 2026-01-24 | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) §6 (2026-10-27) |
| Pain Theory / Pain Mapping | `docs/03-playbooks/pain_theory_playbook.md` §Pain Mapping Template + `deepen-pain` | 3–5-layer pain map | Causal | pressure as the first cause of a transaction | Workshop | in use · v2.0 2026-02-23 | **synthesized** → [unique-business-canvas.md](./unique-business-canvas.md) §4 (2026-10-27) |
| Excalibur | `docs/07-technology/excalibur_technology.md` §Excalibur Template; examples `docs/08-content/excalibur_examples.md`; `generate-excalibur` | one sharp offer from the Appleseed | Ideal Forms | the single form an essence takes in the market | Workshop | in use (code) · undated | keep; merge examples into it |
| myth-maker *(Hark specialty)* | Hark custom skill `myth-maker` | a person's myth, Danko-style | Ideal Forms | the truth a person carries, the first artifact of any business | Workshop · Fire Circle | in use · 2026-10 | **promote** (runner-up) |
| Landing Page Copywriting Framework | `docs/02-strategy/landing_page_copywriting_framework.md` + Marketing Playbook §How to Apply to Any UB Landing Page + `generate-landing` | landing copy flow | Causal | the offer as a page | Market | historical · 2026-01-24 | merge with Marketing Playbook |
| Marketing Playbook | `docs/03-playbooks/marketing_playbook.md` (Outreach Formula per door; Playbook-as-Lead-Magnet Pattern) | marketing system for a UB | Causal | values made visible to the tribe | Market | reference · undated (Apr 2026) | keep |
| Distribution Playbook + Mirror Selling | `docs/03-playbooks/distribution_playbook.md` (Distribution Formula, Purity Check, Sales — Mirror Selling) | distribution system and sales laws | Causal | the last mile where the offer meets a buyer | Market | in use · v2.0 2026-07-22 | keep |
| Session script (Direction Call) | Distribution Playbook §2 Direction Call Script + §7 Pre-Call Protocol | a 1:1 call that turns into a session | Causal | the moment of recognition, run as a ritual | Market (Sasha's stall, `/ignite`) | in use · 2026-07 | **synthesized** → [session-script.md](./session-script.md) (2026-10-27) |
| Ignition Session SOP v1 / v2 | `docs/02-strategy/unique-businesses/alexanders_unique_business.md` §Ignition Session SOP v1.0, §v2.0 (mirrored in KG `AUB 21.05/21.06`) | the paid session flow | Causal | the same ritual, earlier version | Market | historical · v2 2026-03-19 | **synthesized** → [session-script.md](./session-script.md) (2026-10-27) |
| BUILT container | `docs/04-products/the_build_container.md` | 3-week advisory offer + copy laws | Ideal Forms | the canonical shape of a deep-engagement offer | Market | in use · v1.0 2026-07-10 | keep |
| King-Maker Intensive | `docs/02-strategy/king_maker_intensive.md` | group program offer draft | Ideal Forms | the session made collective | Market · Fire Circle | draft · Aug 2026 (Day 157) | keep as draft |
| Product Formats Taxonomy | `docs/02-strategy/product_formats_taxonomy.md` §Template/Methodology Formats | catalogue of product shapes | Blueprint | the possible forms an offer can take | Market | reference · undated | keep |
| Monetization / Value Ladder | `docs/02-strategy/monetization_evolution_ladder.md`; Value Ladder v3.0 in `alexanders_unique_business.md` | the ladder of offers | Blueprint | the offers as one ascending path | Market | reference · 2026-04-17 | keep |
| offer-nudge *(Hark specialty)* | Hark custom skill `offer-nudge` | one gentle reminder line for an open offer | Causal | an open exchange gently brought to completion | Market | in use · Oct 2026 | keep |
| PULSE → CRM update (Pulse Protocol v1) | `docs/04-products/living_project_holograph.md` §Pulse Protocol v1 + `scripts/emit-crm-snapshot.mjs` | CRM / Offer Ledger updated after each call | Causal | the field's movement recorded so the whole stays readable | Sales & Outreach | in use · 2026-08-09 | **promote** (runner-up) |
| Outreach Ops, the one file | `docs/02-strategy/outreach_ops.md` (§0 Day 169 overrides, streams, booleans, caps; §8 clerk protocol) | LinkedIn campaigns and execution rules | Causal | the tribe reached door by door | Sales & Outreach | in use · Day 169 (2026-08-28) | keep; absorb the scattered templates below |
| Outreach & email templates (old) | `docs/03-playbooks/customer_journey_playbook.md` §5, §7, §12 Weekly SOP, §15 checklist; `communications_playbook.md` §Universal Template, §8a/§8b emails; `adjacent_founder_outreach_tracker.md` §Outreach Template | DMs, emails, weekly SOP | Causal | earlier tellings of the same outreach | Sales & Outreach | historical · Apr–Jun 2026 | merge into Outreach Ops |
| Outreach stubs | `docs/02-strategy/outreach_sop_2026-07.md`, `outreach_tactics_2026-07.md`; `docs/03-playbooks/godfather_playbook.md`, `tomorrow_sop.md` (archived) | pointers only | — | already merged elsewhere | Sales & Outreach | superseded | retire (leave pointers) |
| Commercial system runbook + tool handoffs | `tools/COMMERCIAL_SYSTEM_RUNBOOK.md`, `COMMERCIAL_SYSTEM_DODS.md`, `CLAUDE_MASTER_HANDOFF.md`, `tools/*/CLAUDE_HANDOFF.md` (ICP Prospector, Outreach Radar, Relationship Hub) | portable commercial tools | Blueprint | outreach as instruments anyone can run | Sales & Outreach | unclear · undated | keep; confirm whether still used |
| application-blueprint *(Hark specialty)* + Pitch Deck Nuggets | Hark custom skill `application-blueprint`; `docs/02-strategy/pitch_deck_nuggets.md` | a high-stakes application; pitch lines | Causal | the story of the whole told to capital | Investor | in use · Oct 2026 (nuggets 2026-01-29) | **promote** (runner-up, public-safe version); merge nuggets in |

### L1 · 2 Consciousness development
*Emergence inside one person, and the seeing instruments every domain borrows.*

| L2 template | Where | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| Top Talent / Zone of Genius prompt | `src/prompts/user/zoneOfGeniusPrompt.ts`; method in `docs/07-technology/unique_gift_technology.md` §The Prompt Structure | the Top Talent reveal (Appleseed) | Ideal Forms | the first recognition: the slipper that fits one foot | Gate | in use (code) | keep |
| Zone of Genius agent skill | `.agent/skills/zone-of-genius.md` | ZoG generation by an agent | Ideal Forms | same, older | Gate | historical · undated | retire (code prompt rules) |
| Mission Discovery prompt | `src/prompts/user/missionDiscoveryPrompt.ts` | the player's mission | Ideal Forms | the calling, one face of the crystal | Your House | in use | keep |
| Asset Mapping prompt | `src/prompts/extraction/assetMappingPrompt.ts` | the inventory | Blueprint | what the player already holds | Your House | in use | keep |
| QoL guidance + soul colours | `supabase/functions/generate-qol-guidance`, `generate-soul-colors` | guidance per domain; the spectrum | Unity | level and colour of one life | Your House | in use (code) | keep |
| Micro-module format | `docs/08-content/micro_module_curriculum.md` (90 s script, reflection prompt); `micro_module_experience_templates.md`; `transformation_content.md` §Content Format Template | one learning unit: insight → experience → integration | Ideal Forms | the smallest unit of growth | Academy | historical · early 2026 | merge into `course-from-source.md` as its episode format |
| Alexander's Operating System | `docs/02-strategy/alexanders_operating_system.md` (Ease Protocol = PST 75, Sprint Integration Protocol, ideal day, week, lunar month) | a founder's operating rhythm | Causal | one life run as a fractal of the whole | Equilibrium | in use (personal) · undated | keep; later generalize into a personal-OS template |
| Holonic Work Playbook + Natural Work Rhythms | `docs/03-playbooks/holonic_work_playbook.md`, `natural_work_rhythms.md` | deep-work patterns | Causal | the same rhythm, earlier | Equilibrium | historical | merge into AOS |
| Capture Buffer Triage Protocol | `docs/05-reference/capture_buffer_triage_protocol.md` | inbox of insights triaged in one sitting | Causal | receiving what arrives, without loss | Equilibrium | in use · v1.0 2026-05-12 | keep |
| Equilibrium task engine + user manual | `docs/04-products/equilibrium_task_engine_manual.md`, `equilibrium_user_manual.md` | the daily loop | Causal | the day as the smallest cycle of emergence | Equilibrium | in use · 2026-10-21 | keep |
| Lunar Wisdom Map + Cycle Teachings + One Insight prompt | `docs/specs/equilibrium/lunar_wisdom_map.md`, `teachings.md`, `one_insight_prompt.md` | phase-aware guidance | Unity | the month as the larger cycle | Equilibrium | in use · 2026-05-26 | keep |
| meta-navigator *(Hark specialty)* | Hark custom skill `meta-navigator` | lunar phase → strategy → critical path → next step | Causal | Evolver staying in the meta-position | Equilibrium · Oracle | in use · Oct 2026 | keep |
| Money Studies SOP + Body-of-Work Holomap | `docs/03-playbooks/money_studies_sop.md`; 6 applications in `docs/05-reference/money-studies/sources/` | a teacher's body of work as a holomap | Blueprint | outside wisdom digested into the founder | Academy | in use · 2026-07-07 | keep; merge format with Leonardo instances |
| Leonardo Strategy instance | `docs/03-playbooks/leonardo_strategy_instances/README.md` §How to add a new instance (Balaji, Foster Gamble) | a great figure's strategy as a map | Blueprint | same move as body-of-work study | Academy | in use · 2026-05-28 | merge with Body-of-Work Holomap |
| AI OS system prompt | `system-prompts/v5.2/system-prompt.md` (v5.0, v5.1 frozen) | installable cognition | Unity | the Oracle: the whole speaking back | Oracle | in use | keep |
| alexander-thinking-partner *(Hark specialty)* | Hark custom skill | AI OS 5.2 stance for strategy work | Unity | the same Oracle inside Hark | Oracle | in use | keep |
| Vibe Synthesis | `.agent/vibe-synthesis.md` | portable field activation | Unity | the field carried into a new conversation | Oracle | historical · 2026-04-16 | keep |
| Holonic Seeing (27 perspectives) | Hark specialty `holonic-seeing`; `.agent/skills/holonic-seeing/SKILL.md`; `docs/01-vision/phase_shift_technology_library.md` §15e, §15g, §15i; `docs/01-vision/universal_ontology.md` §Output Protocol | a 27-perspective synthesis | Unity | the Meta-Template seeing anything as a whole | all (seeing instrument) | in use | **synthesized** → [holonic-seeing.md](./holonic-seeing.md) (2026-10-27); sources keep a pointer |
| Dodecahedral Artifact 12+1 | PST library §37 | a 12+1-perspective artifact | Blueprint | an earlier form of holonic seeing | all | historical | **synthesized** → [holonic-seeing.md](./holonic-seeing.md) §5–6 (2026-10-27) |
| Roasting Protocol | `docs/05-reference/roasting_protocol.md` (5 steps); `docs/08-content/appleseed_roasting_protocol.md`; roasts in `docs/05-specs/daily-loop/` | an artifact refined through adversarial seeing | Causal | truth sharpened before form is fixed | all | in use · 2026-01-24 → 2026-10-27 | **synthesized** → [roasting.md](./roasting.md) (2026-10-27), with PST 93 crash-test |
| Holomap Builder | `.agent/skills/holomap-builder/SKILL.md`; `docs/holomaps/README.md`; `scripts/holomap-update/` | a holomap | Blueprint | wholes within wholes, drawn | all | in use · 2026-05-29 | keep |
| PST library protocols | `docs/01-vision/phase_shift_technology_library.md` (174 numbered technologies; protocols at §48c, §57h, §62h, §64b) | named technologies with repeatable protocols | Causal | the library of moves the Meta-Template already knows | all | in use (living) | keep; future L2 entries are drawn from it one by one |

### L1 · 3 Collectives
*Emergence between people.*

| L2 template | Where | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| mastermind-host *(Hark specialty)* | Hark custom skill `mastermind-host` | 2 live sessions + 7 days of integration, daily tasks, reflections in Sasha's voice | Causal | a circle holding one transformation together | Fire Circle | in use · Nov 9–10 run | **promote** after the first run (runner-up) |
| broadcast-oct28 *(Hark specialty)* | Hark custom skill `broadcast-oct28` | broadcast → Mastermind pipeline, run-of-show | Causal | the open fire that invites into the circle | Fire Circle · Academy | in use, dated (webinar now Wed Nov 4 per game §14.5) | after the event, distil a generic broadcast/webinar template; then retire the dated skill |
| FMF Masterclass + Live Coaching | `docs/10-workshops/founder_market_fit_masterclass_2026-10-24.md` | a 90-min masterclass deck | Ideal Forms | a worked example of the open fire | Fire Circle · Academy | applied · 2026-10-24 | keep as the worked example |
| scout-call-mirror *(Hark specialty)* | Hark custom skill | call feedback: speaking share, questions, hedges, better phrasing | Causal | the circle mirroring each voice back | Fire Circle · Market | in use · Oct 2026 | keep |
| AI Matchmaker Brief v4.31 | `docs/02-strategy/briefs/matchmaker_brief_v4.31.md` §How to search and what to return; index `ai_matchmaker_brief.md` | a shortlist of resonant people and orgs | Causal | the village finding its residents | Co-working | in use · 2026-09-22 | keep; v3.1–v4.3 stay as genealogy |
| How to frame any intro | `docs/02-strategy/ai_matchmaker_briefing.md` | intro rules | Ideal Forms | the right shape of a first meeting | Café · Co-working | in use · undated | merge into Matchmaker Brief |
| Match-why prompt + intro emails | `src/prompts/user/matchWhyPrompt.ts`; `supabase/functions/send-mutual-intro-email`, `send-connection-intro-email` | why two people should meet; the intro | Ideal Forms | resonance named and offered | Café | in use (code) | keep; add to Prompt Registry |
| First-Ten Ritual Gate + token rotation | `docs/specs/match-mechanic/first_ten_ritual_gate.md`, `token_rotation.md` | ten checks before matching opens | Causal | consent kept sacred at scale | Café | in use · 2026-05-19 | keep |
| Cohort Clarity portable brief | `docs/02-strategy/cohort_clarity_brief.md` §9 How to use this brief | a self-contained cohort proposition | Blueprint | a collective described so any AI can pick it up | Fire Circle | draft · 2026-08-29 | keep |
| Collaboration taxonomy / spectrum | `docs/03-playbooks/collaboration_taxonomy.md`, `docs/holomaps/collaboration_*` | the map of ways to collaborate | Blueprint | the forms a "we" can take | Co-working | reference | keep (map, not a recipe) |
| Sovereign Founder Collective | `docs/02-strategy/sovereign_founder_collective.md` | collective design | Blueprint | founders as one body | Fire Circle · Town Hall | reference · undated | keep |

### L1 · 4 Decentralization
*Emergence without a centre.*

| L2 template | Where | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| Skin Creation Playbook | `docs/03-playbooks/skin_creation_playbook.md` | a new white-label skin, shipped | Causal | the same form re-run under another name | Town Hall | in use (living) · 2026-06-09 | keep |
| White-Label Strategy | `docs/02-strategy/white_label_strategy.md` §How to add a row | the skin registry and model | Blueprint | many villages, one engine | Town Hall | reference · 2026-06-09 | keep |
| Community White-Label Spec | `docs/02-strategy/community_whitelabel_spec.md` | early skin spec | Blueprint | same, earlier | Town Hall | historical | merge into Skin Creation Playbook |
| Distributor Agreement | `DISTRIBUTOR_AGREEMENT.md` (repo root) | distributor terms, revenue share | Blueprint | value flowing back to the source | Town Hall | draft · v0.5 2026-05-20 | keep (needs counsel before use) |
| Venture-Building Holomap v2.0 + UB Cooperative | `docs/02-strategy/venture_building_holomap.md` §How to Use; `unique_business_cooperative.md` | co-op venture structure | Blueprint | ventures built together, owned apart | Town Hall | reference · undated | keep |
| Commons Treasury Evolution | `docs/02-strategy/commons_treasury_evolution.md` | treasury stages | Blueprint | the commons that the many feed | Town Hall | reference · undated | keep |
| Planetary OS Assembly, 12 steps | `docs/02-strategy/planetary_os_assembly.md` | how the business grows, step by step | Causal | the planetary scale of the same sequence | Town Hall | reference · 2026-05-25 | keep |
| Real village mapping | `docs/02-strategy/game_of_being_you.md` §16 (game place → real place, rules, sequence) | a physical twin of the village | Blueprint | the game landing in a real place | Village #1 (San Pancho) | accepted · 2026-10-27 | keep in the blueprint; becomes "Village #N" template after San Pancho |

### L1 · 5 The Game & the Village *(proposed)*
*The Meta-Template in its Blueprint lens.*

| L2 template | Where | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| The Game of Being You blueprint | `docs/02-strategy/game_of_being_you.md` | the whole site as one game | Blueprint | the Meta-Template seen as architecture (named in meta-template §2) | all places | in use · 2026-10-27 | keep (link as the Blueprint lens, T7) |
| Module form: Intro → one button → result → Outro | blueprint §14.4 (+ §14.3 lock rule) | the shape of every place | Ideal Forms | each place as one breath of the whole | all places | in use · 2026-10-27 | **synthesized** → [module-form.md](./module-form.md) (2026-10-27) |
| Victories ritual | blueprint §13.4 (congratulate → 1–10 → record) | a growing collection of real wins | Causal | each step becoming a trace in reality | all places | in use · 2026-10-27 | **synthesized** → [module-form.md](./module-form.md) §4 (2026-10-27) |
| Koster facet check | blueprint §15.8 | 7-question check before any new place | Ideal Forms | no place repeats another; each reveals a new facet | all places | in use · 2026-10-27 | **synthesized** → [module-form.md](./module-form.md) §7 (2026-10-27) |
| Fidelity principle | blueprint §10a | the "real result" test | Causal | the game never leaves reality | all places | in use · 2026-10-26 | **synthesized** → [module-form.md](./module-form.md) §2 (2026-10-27); stays in the blueprint |
| Game Design Almanac, forecast method | `docs/02-strategy/game_design_almanac.md` §How the forecast was made | forecast of the next octave | Causal | the game seeing its own evolution | all | draft · 2026-10-27 | keep |
| Module Template + registry refresh rule | `docs/05-reference/module_registry.md` §Module Template; `docs/02-strategy/module_taxonomy.md` (re-audit vs `src/App.tsx`) | an honest module map | Blueprint | the platform seeing its own interior | all | in use · 2026-08-16 | keep |
| Module landing page SOP + universal landing template | `docs/04-workflows/module_landing_page_workflow.md`; `docs/05-reference/module_landing_page_infrastructure.md` (Universal Landing Page Template, Customer Forces Template); applied in `docs/06-modules/*/landing_page_content.md` | a module landing page | Causal | the pre-game form of a place's door | Gate · Your House | superseded by Module form · 2026-02-10 | **synthesized** → [module-form.md](./module-form.md) §10, dated (2026-10-27) |
| Module Polish workflow | `docs/04-workflows/module_polish.md` = `.agent/workflows/polish.md` | a polished module | Causal | duplicate pair | all | historical · 2026-02-05 | **synthesized** → [module-form.md](./module-form.md) §9 (2026-10-27); both copies keep a pointer |
| Module Implementation Checklist v3.0 | `docs/05-reference/module_implementation_checklist.md`; copy `docs/05-specs/onboarding/onboarding_implementation_checklist.md` | a module built phase by phase | Blueprint | duplicate pair | all | historical · undated | **synthesized** → [module-form.md](./module-form.md) §8 (2026-10-27); both copies keep a pointer |
| Onboarding / tour scripts | `docs/07-technology/onboarding_script.md`; `docs/05-specs/customer_journey_progression.md` §Tour Script; `docs/03-playbooks/product_onboarding_playbook.md` | first-run onboarding | Causal | the old door before the Gate | Gate | superseded by Gate → village · 2025-01-07 | retire |
| Gamification mechanics / spec | `docs/07-technology/gamification_mechanics.md`, `gamification_spec.md` | points and levels | Causal | contradicts §13.2 (no points, real QoL level) | — | superseded · 2025-01 | retire |
| Quest suggestion prompts | `supabase/functions/suggest-main-quest`, `suggest-next-quest` | today's quest | Causal | the Quest Board choosing one next move | Quest Board | in use (code) | keep |
| Stall auto-assembly | blueprint §14.12 | the player's stall built as they play | Blueprint | the shop opening along the path | Market | spec · 2026-10-27 | keep (seed of the missing stall template) |

### L1 · 6 Content & Transmission *(proposed)*
*The Meta-Template in its Ideal Forms and Unity lenses.*

| L2 template | Where | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| Course-from-Source | [course-from-source.md](./course-from-source.md); mirrored by Hark specialty `course-from-source` | a NotebookLM mini-course | Causal | a body of work becoming a path others can walk | Academy | in use · 2026-10-27 | keep (promoted); skill stays a mirror |
| NotebookLM video production cluster | `docs/04-workflows/notebooklm_video_production.md`; `docs/03-playbooks/notebooklm_workflow.md` (RU); `docs/04-workflows/video_regeneration_project_plan.md` (focus, style, YouTube description templates); `docs/08-content/VIDEO_PRODUCTION_PLAN.md` (8 steps per module, metadata template); `scripts/README_REGENERATION.md` | episode videos and their metadata | Causal | the earlier tellings of course production | Academy | historical, plan in use · 2026-02 → 2026-10-27 | **synthesized** → [course-from-source.md](./course-from-source.md) §Production line + Genealogy (2026-10-27); the plan stays the tracker |
| Testimonial clips | [testimonial-clips.md](./testimonial-clips.md) | consent-gated verbatim clips | Ideal Forms | a player's voice left for those who come after | Market · Outros | in use · 2026-10-27 | keep (promoted) |
| infographic-style-keeper *(Hark specialty)* | Hark custom skill | one visual canon for Sasha's sketches (micro/macro, 5 inner vectors ↔ 6 business sides) | Unity | form, colour and light held as one canon | Content & Brand | in use · Oct 2026 | **promote** (runner-up) |
| Infographic prompt specs | `docs/08-content/hero_journey_map_infographic_prompts.md`, `landing_page_infographic_prompts.md`; `output/imagegen/*-prompt.md` (6) | generated infographics, posters, dioramas | Unity | applied examples of the canon | Content & Brand | historical | merge as examples into the infographic template |
| Infographic ingest + vision prompt | `knowledgegraph/90 System/infographic-ingest.md` (v1 2026-10-22), `infographic-vision-prompt.md` (2026-10-20) | a sheet → note + map in the graph | Causal | the transmission entering the graph | Knowledge graph | in use | keep (in the KG); link from the infographic template |
| Brandbook | `docs/05-reference/brandbook.md` (Designer Checklist, Logo Change SOP, image prompts) | on-brand assets | Ideal Forms | the platform's own face | Content & Brand | in use · undated | keep |
| Anti-AI style + Humanizer + Purity Check | `.agent/anti-ai-style.md`; `.agent/skills/humanizer/SKILL.md`; Distribution Playbook §The Purity Check | clean human copy | Ideal Forms | the voice kept Sasha's | Content & Brand | in use · 2026-05-16 | merge Purity Check into Anti-AI style |
| scout-x-reach *(Hark specialty)* | Hark custom skill | X / Telegram diary posts | Causal | the open diary of building the whole | Content & Brand | in use · from 2026-10-26 | keep |
| Myth Broadcasts | `docs/02-strategy/myth_broadcasts.md` (LinkedIn post, 60 s voice-note script) | myth in three layers | Ideal Forms | the myth spoken out | Content & Brand | historical · 2026-02-18 | merge with myth-maker |
| Communications Playbook | `docs/03-playbooks/communications_playbook.md` (§2 Surface Activation SOP, §3 Locked Texts = PST 65) | surfaces activated, locked texts | Causal | coherent radiation from one epicentre | Content & Brand | historical · v3.2 2026-04-08 | keep surface SOP; emails go to Outreach Ops |
| Locked video script | `docs/03-playbooks/video_script_4min.md` (v2.0 LOCKED) | the 4-min lead-magnet video | Ideal Forms | a locked text, not a recipe | Academy | locked | keep as example |
| Repurpose plan | `docs/08-content/april15_repurpose_plan.md` | one transmission → many assets | Causal | seed of the missing repurposing template | Content & Brand | applied once · Apr 2026 | keep; generalize later (gap) |
| NotebookLM decks | `docs/08-content/gift_protocol_deck.md`, `unique_business_os_deck.md` | slide decks via NotebookLM | Ideal Forms | applied examples | Academy | historical | keep as examples |
| Lead-magnet source text | `docs/02-strategy/video_source_text.md` | NotebookLM source for a 5-min video | Ideal Forms | applied example | Academy | historical | keep as example |

### L1 · 7 Ops & Agents *(proposed)*
*The Causal lens turned on the Meta-Template itself.*

| L2 template | Where | Produces | Lens | As a part of the whole | Module | Status · dated | Verdict |
|---|---|---|---|---|---|---|---|
| Improvement loop | [improvement-loop.md](./improvement-loop.md) | work by plan → ship → report → improve the planning | Causal | the whole improving its own way of improving | all | in use · 2026-10-27 | keep (promoted) |
| Spec & handoff to Claude Code / Codex | Hark specialty `sasha-spec-writing`; `output/hark_spec_handover.md`; SOW + DoD pattern in `docs/specs/*/scope_of_work.md`, `sow_and_dods.md`, the planning / implementation / debugging SoW triad in `docs/specs/ubb-deep-context/`; `.agent/workflows/feature.md`; Vibe-Coding Playbook §Feature Spec Template | an issue / SOW with DoD an agent can build from | Blueprint | intent turned into buildable form | all | in use · 2026-05 → 2026-10 | **synthesized** → [spec-handoff.md](./spec-handoff.md) (2026-10-27) |
| Integrated Product Building Workflow | `docs/03-playbooks/integrated_product_building_workflow.md` (supervisory checklist, visual tracker template, quick roast checklist) | ICP + pain → working code | Causal | the build sequence, earlier | all | historical · 2026-05-22 | **synthesized** → [spec-handoff.md](./spec-handoff.md) §2 (2026-10-27) |
| Product / UX / UI / Architecture playbooks | `docs/03-playbooks/product_playbook.md`; `ux_playbook.md` (≈ `docs/archive/ux_playbook_backup.md`, 36 lines differ); `ui_playbook.md`; `software_architecture_playbook.md` (AI Prompt Template sections) | product, screen, UI, architecture design | Blueprint | the one-button principle, layer by layer | all | reference · undated | merge `ux_playbook.md` into `product_playbook.md`; retire the archive copy |
| Frontend design taste | Hark specialty `scout-frontend-design` (+ pointer `spec-ui-taste`); `.agent/skills/frontend-design/`, `ui-ux-pro-max/`; `docs/03-playbooks/design_framework.md` (Minimalism Checklist); `glassmorphism_blueprint.md` | UI specs and reviews without generic AI tells | Unity | form and quality felt as one on screen | all | in use · Oct 2026 | keep `scout-frontend-design` canonical |
| Lovable prompt pattern | `docs/specs/*lovable_prompt*.md` (5), `docs/05-specs/resonance_events_lovable_prompt.md` | a one-shot Lovable fix | Causal | build through Lovable, now gated by Sasha | all | historical (Lovable credits need Sasha's yes since 2026-10-17) | keep as pattern |
| Session Protocol & Working Agreement | `.agent/session-protocol.md`; `.agent/workflows/working-agreements.md`; `.agent/RULES.md`; `AGENTS.md` / `CLAUDE.md` | how agents work in the repo | Causal | the rules of the workshop | all | in use · 2026-06-14 | keep; merge working-agreements into session protocol |
| sasha-working-contract *(Hark specialty)* | Hark custom skill (from `CLAUDE.md`) | the same contract inside Hark | Causal | mirror | all | in use | keep (pointer) |
| Deploy protocol | `.agent/deploy.md`; `docs/07-technology/deploy_pipeline.md`; empty `.agent/workflows/deploy.md`, `commit.md` | safe ship | Causal | the whole reaching the world | all | in use | keep; retire the two empty workflow files |
| Auto-execute policy | `.agent/auto-execute-policy.md` | what scheduled runs may do alone | Causal | autonomy bounded | all | historical · 2026-04-18 | merge into Session Protocol |
| Personal Intelligence (AI) Setup Playbook | `docs/03-playbooks/personal_intelligence_setup_playbook.md` | a founder's agentic routines | Causal | the loop running without its founder | Oracle | draft · v0.1 2026-10-17 | keep (candidate product template) |
| Moonshot pre-prompt | `.agent/moonshot-pre-prompt.md` | moonshot venture thinking | Causal | the whole asking its largest question | all | in use · undated | keep |
| AI self-awareness + evolutionary mastery skills | `.agent/self-awareness-skill.md`, `evolutionary-mastery-skill.md` | an agent's own development | Unity | the agent as a growing part of the whole | Oracle | historical · 2026-01-24 | keep |
| Graph curation | Hark specialty `graph-curator`; `knowledgegraph/Templates/Note.md`; `90 System/import-queue.yml`; `.github/kg/` scripts | the graph, one file at a time | Causal | the corpus becoming one connected mind | Knowledge graph | in use · 2026-10 | keep |
| Stack levers | `knowledgegraph/60 Stack/How to spot a lever.md`, `Intake Cadence.md`, `Upgrade Sources.md` (unverified) | weekly upgrades to the agent stack | Causal | the tools of the whole getting better | Knowledge graph | draft · Oct 2026 | keep; verify sources |
| Docs discipline | Hark specialty `sasha-docs-rule`; `docs/docs_index.md`; `positioning.md` §How to update; `decision_log.md` §How to read | one doc per purpose, extended not multiplied | Blueprint | each part with one place | all | in use · 2026-10-27 | keep |
| Prompt Registry | `docs/05-reference/prompt_registry.md` | index of app prompts | Blueprint | the prompts of the whole in one view | all | in use, **drifted**: misses `matchWhyPrompt.ts`, `iterateStrategyCruciblePrompt.ts`, `ubb-prompts.ts`, `deepen-*` | keep; fix the index |
| Corpus / holomap / dashboard scripts | `scripts/corpus-drift/`, `scripts/holomap-update/`, `scripts/dashboard-update/` READMEs | drift checks, briefing packets, snapshots | Causal | the corpus checking itself | all | in use · 2026-04 → 05 | keep |
| Hark ops specialties | `pr-sweep-on-touch`, `github-cli-large-files` | PR follow-up, large commits | Causal | Hark's hands | all | in use | keep (Hark-internal) |
| Archived Codex task workflow | `docs/archive/codex_workflow_2026/` | `ai_tasks/` cards | Causal | retired June 2026 | — | superseded | retire (already archived) |

*Out of scope, noted:* `output/job-search-agent-prompt.md` (personal, career); keep where it is.

---

### Top 5 to promote into `docs/templates/` (when Sasha says go)
1. **Session script**: Direction Call Script + Pre-Call Protocol + Ignition Session SOP v2 → one template for the paid 2-hour session (Business development).
2. **Unique Business Canvas**, with ICP / TP / Pain deepening as its L3 parts (Business development).
3. **Module form**: Intro → one button → result → Outro, with the lock rule, victories ritual and Koster facet check as its parts (Game & Village).
4. **Holonic Seeing (27 perspectives)**: one canonical file instead of four copies (Consciousness development / seeing instruments).
5. **Spec & handoff to Claude Code / Codex**: SOW + DoD as its parts (Ops & Agents).

Runners-up: mastermind-host (after the Nov 9–10 run), infographic-style-keeper, Pulse Protocol, application-blueprint (public-safe version), myth-maker.

### Duplicate clusters
- ~~**Course / video production**~~ → 5 files synthesized into [course-from-source.md](./course-from-source.md) (2026-10-27).
- ~~**Holonic seeing**~~ → synthesized into [holonic-seeing.md](./holonic-seeing.md) (2026-10-27): Hark specialty, `.agent/skills/`, PST §15e/g/i, `universal_ontology.md` output protocol, PST §37.
- ~~**Unique Business method**~~ → synthesized into [unique-business-canvas.md](./unique-business-canvas.md) (2026-10-27); Integrated Playbook stays the domain parent: Integrated Playbook, Creation Playbook (10 steps), `genius-business` workflow, Venture Growth Playbook.
- ~~**Spec / handoff**~~ → synthesized into [spec-handoff.md](./spec-handoff.md) (2026-10-27): `sasha-spec-writing`, `hark_spec_handover.md`, SOW+DoD files, `feature.md`, Feature Spec Template, Integrated Product Building Workflow.
- **Product / UX playbooks**: `ux_playbook.md` ≈ archive backup; `product_playbook.md` restructures the same text.
- **Outreach copy**: Outreach Ops vs Customer Journey §5/§7, Communications universal template and emails, adjacent-founder template; two empty July stubs.
- ~~**Session scripts**~~ → synthesized into [session-script.md](./session-script.md) (2026-10-27): Ignition SOP v1/v2, Mirror Session, Direction Call Script, Pre-Call Protocol, Reflection Proposal, Funnel v5, `/ignite`.
- ~~**Roasting**~~ → synthesized into [roasting.md](./roasting.md) (2026-10-27): Roasting Protocol, Appleseed roasting, daily-loop roast trio, PST 93 crash-test, the live roast.
- ~~**Module checklists**~~ → synthesized into [module-form.md](./module-form.md) (2026-10-27): implementation checklist ×2; module polish ×2.
- **Copy voice**: Anti-AI style vs Humanizer vs Purity Check.
- **Myth**: myth-maker vs Myth Broadcasts.
- **Body-of-work study**: Money Studies holomaps vs Leonardo instances.

### Gaps (a template is clearly needed, none exists)
- **Market**: stall / offer page template, and a "name your price" script for the first-price victory (only the §14.12 spec exists).
- **Café (MEET)**: host and first-meeting template for human (not professional) matches.
- **Town Hall**: co-op charter / residents' voice template (v0 is "income + your voice", no form yet).
- **Fire Circle**: a generic broadcast / webinar run-of-show; today it lives in one dated specialty.
- **Quest Board**: real-world quest template (J10–J12: Intro → «I did it» → Outro).
- **Investor**: investor update and data-room template; the application method lives only in Hark.
- **Transmission repurposing**: one recording → course episodes, clips, posts (seeds: April 15 plan, testimonial clips).
- **Your House**: Spectrum Reading (not built) and Character Sheet content (WP-8, Sasha's decisions).
- **Decentralization**: "Village #N" replication template after San Pancho.
