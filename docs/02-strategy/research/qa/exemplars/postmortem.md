# Cluster: POST-MORTEMS & LEARNING FROM FAILURE (dossier, 2026-11-27)
Sources opened via web_fetch unless marked (search excerpt). Grades: A measured/large data, B credible case data with numbers, C anecdote/reputation.

---

## 1. Google SRE — blameless postmortem culture
**Header.** Google SRE, SRE book ch. 15 (Lunney, Lueder; 2016/2017). Iconic: the reference template for software postmortems. https://sre.google/sre-book/postmortem-culture/

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Pre-defined triggers | which incidents deserve a write-up | team policy | before any incident |
| Collaborative doc (template) | timeline, impact, root causes, trigger, detection | responders | right after incident |
| Senior review | shallow cause, weak action plan | senior engineers | before publication |
| Repository + reading clubs, Wheel of Misfortune | org-wide recurrence | SRE community | months/years later |

**Q1** Triggers set in advance: user-visible downtime over threshold, any data loss, on-call intervention (rollback), long resolution, monitoring failure; any stakeholder may request one (ch.15). **Q2** Responders write; senior engineers review (ch.15). **Q3** Action items typed mitigate/prevent/other, each with owner and bug number (Appendix D, https://sre.google/sre-book/example-postmortem/). **Q4** Not addressed here (DiRT test is an action item in App. D). **Q5** "Schedule cascading failure test during next DiRT" as follow-up (App. D). **Q6** Error-budget exhaustion triggers production freeze (App. D). **Q7** Section "Detection" records how monitoring caught it (App. D). **Q8** Blameless; "No postmortem left unreviewed"; shared widely (ch.15). **Q9** Regression tests as action items ("Build regression tests… queries of death"), org repository, trend analysis via metadata (App. D; ch.15). **Q10** "Where we got lucky" section names latent risk that did not bite (App. D).

**Best practices.** (1) Objective triggers defined before incidents — removes debate about whether to learn. Grade C (no numbers published). Driver: precommitment. (2) Owner+bug per action item, incl. regression test — Grade C; driver: closure accountability. (3) Visible reward (peer bonuses, TGIF applause for fast rollback) — Grade C; driver: reinforcement of reporting.

**Failures/criticism.** Template keeps a "Root Causes" field, the concept Cook calls "fundamentally wrong" (https://how.complexsystems.fail/). *Judgment:* Google's own claim of "fewer outages" is unquantified.

**Quotes.** "An unreviewed postmortem might as well never have existed." / "You can't 'fix' people, but you can fix systems and processes" (ch.15).

---

## 2. Etsy — Just Culture & Debriefing Facilitation Guide
**Header.** Etsy, 2012–2016; John Allspaw, Morgan Evans, Daniel Schauenberg. Iconic for blameless *facilitation* craft. https://www.etsy.com/codeascraft/blameless-postmortems ; guide https://github.com/etsy/DebriefingFacilitationGuide

| layer | catches | who | when |
|---|---|---|---|
| Blameless account | actions, observations, expectations, assumptions, timeline | involved engineers | debrief |
| Facilitated debrief | "second story": why the action made sense | trained neutral facilitator + note-taker | days after |
| Annotated timeline | agreed account of events | room | output |
| Facilitator training | quality of debriefs | internal course | ongoing |

**Q1** Outages and accidents (blog). **Q2** Engineers closest to the error are "the most expert in their own error" and co-write remediation (blog). **Q3** Not addressed (no severity scale). **Q4–Q7** Not addressed. **Q8** No punishment for detailed accounts; seek Second Stories; fight hindsight bias and fundamental attribution error (blog). Facilitator asks "how", not "why"; "we are not looking for causes" (guide, https://extfiles.etsy.com/DebriefingFacilitationGuide.pdf). **Q9** Engineers educate the org; Morgue tool for postmortem repository (footnote, SRE ch.15). **Q10** Success test for a debrief: did at least one person learn one thing that changes their work; would half attend again (guide summary, search excerpt https://rumproarious.com/notes/debriefing-facilitation-guide).

**Best practices.** (1) Trained facilitator: 3 seminars + workshop + shadowing (Fast Company, search excerpt https://www.fastcompany.com/3064726/what-etsy-does-when-things-go-wrong-a-7-step-guide). Grade C. Driver: separates inquiry from judgment. (2) Questions eliciting cues, context, mental models, signals for help (guide). Grade C.

**Failures/criticism.** Depends on scarce facilitator skill (Etsy built a course for it, above). *Judgment:* no action-item closure mechanism specified — learning may not reach the code.

**Quotes.** "…they can give this detailed account without fear of punishment or retribution." (blog). "The facilitator's job is not to discover the things that people didn't do, but what they actually did" (guide).

---

## 3. Toyota Production System — andon, jidoka, 5 whys
**Header.** Toyota, from Sakichi Toyoda's self-stopping loom (1896) to Taiichi Ohno's TPS. Iconic: stop-at-the-defect origin of build-quality-in. https://global.toyota/en/company/vision-and-philosophy/production-system/

| layer | catches | who | when |
|---|---|---|---|
| Jidoka machine stop | equipment/quality abnormality | the machine | instantly |
| Andon cord/button | quality issue, delay | any worker | in-cycle |
| Team leader response | resolve within cycle time | team leader | seconds |
| 5 whys / kaizen | recurrence | team | after |

**Q1** Every abnormality, at the station, as it happens (Toyota). **Q2** Workers and machines detect; team leaders respond (Toyota; Spear, https://www.hbs.edu/ris/Publication%20Files/02-043_3fdad6f4-2d9c-473c-9990-2216a1e18b0c.pdf). **Q3** Yellow light; if unresolved within the 51-second cycle, turns red and line stops (Spear). **Q4–Q5** Not addressed. **Q6** No defective product passes: "eliminates the outflow of defective products" (Toyota). **Q7** Andon board shows station and problem (Toyota). **Q8** "Ask why five times… Five whys equal one how" (Ohno, quoted in https://qualitysafety.bmj.com/content/26/8/671). **Q9** Detection rules for abnormalities are built into machines after kaizen by hand (Toyota). **Q10** Pull frequency as culture signal.

**Best practices.** (1) Low-threshold stop-and-call: Georgetown ~2,000 pulls/week vs. a new Ford plant ~2/week (BBC 2007 via https://www.leanblog.org/2007/02/toyota-ford-andon-cord-culture-difference/). Grade B (journalism, numbers vary by source). Driver: psychological safety + guaranteed response. (2) Response deadline = cycle time (Spear). Grade B (field study).

**Failures/criticism.** Andon requires process stability and a staffed responder layer first, or support collapses (search excerpt, https://www.ineak.com/build-a-culture-that-stops-to-fix-problems). 5 whys criticised (see §6).

**Quotes.** "the operator can stop the line by pulling the stop cord themselves" (Toyota). "A complete car cannot be built if even one part is missing." (Kiichiro Toyoda, Toyota).

---

## 4. Aviation — NTSB investigations & NASA ASRS voluntary reporting
**Header.** NTSB (1967–); FAA/NASA ASRS (since 1975-76). Iconic: blame-free investigation + immunity-backed near-miss reporting at national scale. https://asrs.arc.nasa.gov/overview/summary.html

| layer | catches | who | when |
|---|---|---|---|
| ASRS voluntary reports | near misses, latent deficiencies | pilots, controllers, mechanics, anyone | within 10 days |
| Analyst triage | immediate hazards → alerts | ≥2 expert analysts per report | on receipt |
| Public database, CALLBACK | patterns | NASA, researchers | ongoing |
| NTSB investigation | probable cause of accidents | NTSB | after accident |
| Safety recommendations tracked to closure | systemic fixes | NTSB → FAA, industry | years |

**Q1** Actual or potential discrepancies across all operations (AC 00-46F, https://asrs.arc.nasa.gov/overview/immunity.html). **Q2** Front-line operators report; decades-experienced analysts classify (https://asrs.arc.nasa.gov/overview/report.html). **Q3** Each report read by ≥2 analysts; hazards flagged for alert message; crime/accidents routed to DOJ/NTSB (report.html; immunity.html). **Q4–Q6** Not addressed. **Q7** ASRS itself is the post-release feedback channel. **Q8** NTSB "does not assign fault or blame" (https://www.ntsb.gov/investigations/process/Pages/investigativehearings.aspx); ASRS reports barred from enforcement (14 CFR 91.25). **Q9** Recommendations tracked until closed, recipients must answer in 90 days (https://www.ntsb.gov/investigations/Pages/safety-recommendations.aspx; https://www.ntsb.gov/investigations/pages/recipienttiprecommendations.aspx). **Q10** Third party (NASA, not regulator FAA) holds reports to protect anonymity (immunity.html).

**Best practices.** (1) Immunity for inadvertent violations if reported within 10 days; ID strip returned, de-identified (immunity.html). Grade C for effect (no causal data on site). Driver: incentive to self-report. (2) Recommendation tracking: 77% of 2024 closures acceptable (https://www.ntsb.gov/news/Testimony/Pages/Homendy20250327.aspx, search excerpt); >80% historically (https://trid.trb.org/view/385436). Grade B.

**Failures/criticism.** 17% of aviation recs "Closed – Unacceptable Action" 1967–2026 (dataset, search excerpt https://doi.org/10.5281/zenodo.21611384). ASRS publishes caveats on self-selection (caveats page listed, not opened).

**Quotes.** "The effectiveness of this program… depends on the free, unrestricted flow of information" (AC 00-46F). "There has been no breach of confidentiality of the ASRS under NASA management." (same).

---

## 5. Game dev postmortems — Game Developer/Gamasutra "What went right / What went wrong"
**Header.** Game Developer magazine / Gamasutra, ~1997–2014+; analysed by Washburn, Sathiyanarayanan, Nagappan, Zimmermann, Bird (ICSE 2016). Iconic project-level, public, symmetric format. https://thomas-zimmermann.com/publications/files/washburn-icse-2016.pdf

| layer | catches | who | when |
|---|---|---|---|
| Right/wrong lists (~5 each) | project-level practices and pitfalls | lead devs | ~1 year after release |
| Public publication | cross-studio learning | Gamasutra | ongoing |
| Meta-analysis | industry patterns | researchers | years later |

**Q1** Whole project: design, process, team, art, testing, schedule, marketing (paper). **Q2** Developers; beta testers "provide well-informed feedback… invaluable in balancing" (Star Chamber, paper). **Q3–Q7** Not addressed (testing appears only as a category). **Q8** Narrative symmetric: successes and failures; published ~a year post-release (https://michaelwashburnjr.com/blog/to-icse-16-and-back-again-a-research-tale). **Q9** Paper's recommendations: risk management, iterative process with prototypes, modest scope (paper §9). **Q10** "What went right" capture keeps strengths from being lost.

**Best practices.** (1) Symmetric right/wrong framing: of 155 postmortems, top "wrong" = obstacles 37%, schedule 25%, process 24%, game design 22%; top "right" = game design 50%, process 43% (paper). Grade B (n=155, coded). Driver: balanced reflection lowers defensiveness (*Judgment*). (2) Under-used tester feedback named as pitfall (Aaaaa!, paper). Grade C.

**Failures/criticism.** Self-reported, may hide failures; one-time, no action-item closure (paper §8 threats). *Judgment:* learning goes to the next project, not the live system.

**Quotes.** "when we did bring testers in to toss the game around, we underused the feedback we received." (paper). "we urge… practitioners to report their retrospective thoughts in a postmortem" (paper §9).

---

## 6. Negative/critique — Cook "How Complex Systems Fail" & Card "The problem with '5 whys'"
**Header.** Richard I. Cook MD (1998–2000, Univ. Chicago), https://how.complexsystems.fail/ ; Alan J. Card, BMJ Qual Saf 2017, https://qualitysafety.bmj.com/content/26/8/671. Negative: attacks root-cause and single-chain analysis.

| layer (as critiqued) | what it misses | who | when |
|---|---|---|---|
| Root-cause attribution | multiple jointly-sufficient contributors | investigators | after accident |
| 5-whys chain | other branches of the causal tree | RCA team | after |
| Post-accident remedy | new latent failures it adds | management | after |

**Q1** Systems "run in degraded mode", always with latent failures (Cook #4-5). **Q2** Practitioners "continuously create safety" (Cook #17). **Q3** Not addressed. **Q4–Q6** Not addressed. **Q7** Need "calibrated views of the hazards", edge of the envelope (Cook #18). **Q8** Root cause "fundamentally wrong"; hindsight bias "primary obstacle" (Cook #7-8). 5 whys "forces users down a single analytical pathway… insists on a single root cause" (Card). **Q9** End-of-chain remedies "increase the coupling and complexity" (Cook #15). **Q10** Change introduces new failure forms (Cook #14).

**Best practices.** (1) Replace chains with causal and contributing-factors trees (Card, wrong-patient medication example). Grade C. Driver: breadth over single path. (2) Study normal successful work too: success is also a gamble (Cook #10). Grade C.

**Failures/criticism of the critique.** *Judgment:* offers few concrete procedures; Card notes 5 whys' popularity is "not the result of any evidence that it is effective" — the same evidence gap applies to the alternatives.

**Quotes.** "Post-accident attribution to a 'root cause' is fundamentally wrong." (Cook). "…it so grossly oversimplifies the process of problem exploration that it should not be used at all." (Card).

---

## Cluster patterns
- **Candidate invariant: reporting without punishment.** Present in 5/6 (Google, Etsy, Toyota andon, ASRS/NTSB, Cook); the mechanism is always that fear suppresses detail. Game postmortems are public PR-adjacent and weakest here.
- **Candidate invariant: a written, structured artifact with a timeline** (Google template, Etsy annotated timeline, ASRS form, NTSB report, Gamasutra right/wrong). 5/6.
- **Candidate invariant: every finding gets an owner and is tracked to closure** (Google bug per action item; NTSB 90-day response and closure status; Toyota team leader within cycle time). Missing in Etsy guide and game postmortems → learning stops at the meeting.
- **Candidate invariant: triggers/thresholds set in advance** (Google triggers, Toyota "any abnormality", ASRS "actual or potential"). Low threshold = more learning (Toyota 2,000 vs Ford 2 pulls/week).
- **Recurring: fixes go into the system, not the person** — regression test, machine detection, procedure, playbook (Google App. D, Toyota jidoka, NTSB recs).
- **Recurring: capture near misses and "where we got lucky"**, not only failures (ASRS, Google, Cook #5).
- **Recurring: share widely and re-read** (Google reading clubs, ASRS CALLBACK, Gamasutra) — learning crosses teams.
- **Tension to resolve:** root-cause / 5-whys (Google field, Toyota) vs. multiple contributing factors (Cook, Card, Etsy "not looking for causes"). Safer form: list contributing factors as a tree.
- **Evidence gap:** almost all effectiveness claims are C; only NTSB closure rates and the n=155 game study give numbers (B).
