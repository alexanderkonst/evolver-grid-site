# Cluster: REHEARSALS, DRY RUNS & HIGH-RELIABILITY (out-of-domain controls)
Compiled 2026-11-27. Sources: web_search / web_fetch only. Evidence grades: A = measured, controlled/large data; B = credible case data or practitioner report with numbers; C = anecdote/reputation. *Judgment* = my inference, not a sourced fact.

---

## 1. NASA Apollo simulation supervisors (Apollo 11 / Apollo 13), with Challenger as negative control

**Header.** NASA Manned Spacecraft Center, 1962–1972; SimSup Dick Koos, Flight Directors Gene Kranz, Glynn Lunney; guidance officer Steve Bales, Jack Garman. Challenger 51-L 1986 (Rogers Commission, Feynman). In as the iconic case of an appointed adversary who scripts failures into full-fidelity rehearsal; Challenger as the negative: a readiness review that normalized warning signs.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Contingency sims with injected failures | unknown failure modes, wrong rules | SimSup team | months before flight |
| Sim debrief | bad decisions, missing procedures | SimSup + flight control team | right after each run |
| Mission rules / procedures | known contingencies | flight controllers | pre-flight, revised after sims |
| Real-time simulator verification | untested improvised procedures | backup crews in simulators | during the incident |
| Flight Readiness Review (Challenger) | open anomalies (in theory) | management levels | pre-launch |

**Seed questions**
- Q1: "Nominal" runs set go/no-go points; most time went to "contingency" runs departing from nominal (https://doi.org/10.1007/978-0-387-49544-6_3).
- Q2: SimSup's team, whose job was to "introduce problems… so all contingencies would be covered" (https://lens.monash.edu/koos-control-the-man-who-made-the-apollo-11-moon-landing-possible). *Judgment:* only an outsider who knows where the system is fragile can pick the test case.
- Q3: Debrief after each run; Koos "dressed down" Bales and Kranz for a wrong abort (https://www.smithsonianmag.com/air-space-magazine/troubleshooting-101-1201-actually-and-1202-too-111339271).
- Q4: Full-crew, full-control-room sims; CM/LM simulators took 80% of 29,967 Apollo training hours (https://www.nasa.gov/wp-content/uploads/static/history/computers/Ch9-2.html).
- Q5: Scripted cases such as "Case Number 26", a computer restart alarm (https://lens.monash.edu/koos-control-the-man-who-made-the-apollo-11-moon-landing-possible).
- Q6: Go/No-Go decision points defined in nominal sims (https://doi.org/10.1007/978-0-387-49544-6_3). For Challenger, the Commission found "The decision to launch the Challenger was flawed"; decision makers were unaware of the contractor's below-53°F no-launch recommendation (https://www.nasa.gov/history/rogersrep/v1ch5.htm).
- Q7: Live telemetry plus a 24-hour on-line MIT support team (https://history.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11.1201-fm.html).
- Q8: Apollo 13 Review Board report (https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf). Challenger: "certification criteria used in Flight Readiness Reviews often develop a gradually decreasing strictness" (https://history.nasa.gov/rogersrep/v2appf.htm).
- Q9: After the 1201 sim, Bales rewrote the mission rules nine days before landing (https://blogs.sw.siemens.com/simcenter/apollo-13-the-first-digital-twin). Garman stapled a hand-written alarm sheet into the manual (https://lens.monash.edu/koos-control-the-man-who-made-the-apollo-11-moon-landing-possible). A sim debrief ("Why did you leave the lunar module powered up?") seeded the LM lifeboat procedures (https://www.nasa.gov/wp-content/uploads/2025/08/kranzef-4-28-99.pdf).
- Q10: Pre-built partial procedures can be recombined under pressure. The Apollo 13 board found "Most of the steps taken were extracted from other procedures which had been developed, tested, and simulated earlier" (https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf).

**Most successful practices**
1. Appointed adversary injects unseen failures, then debriefs and retrains. Koos triggered a 1201 alarm 11 days before launch. The team aborted wrongly and got 4 more hours of alarm training the next day. In the real landing Garman, Bales and Duke "recognized them immediately" (https://www.smithsonianmag.com/air-space-magazine/troubleshooting-101-1201-actually-and-1202-too-111339271). Grade B (documented case, n=1). Driver: stress inoculation plus closing the procedure gap before exposure.
2. Simulator verification of fixes before they reach production. Apollo 13 procedures were "evaluated in simulators at MSC and KSC by members of the backup crew" before being read to the crew (https://ntrs.nasa.gov/api/citations/20170000913/downloads/20170000913.pdf). Grade B.

**Failures/criticism.** The sims never fully exercised Aldrin's dual-radar request, so its absence went unrevealed (https://www.smithsonianmag.com/air-space-magazine/troubleshooting-101-1201-actually-and-1202-too-111339271). The board itself concluded "It is not practical to develop, simulate, and practice procedures for use in every possible contingency" (https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf). Challenger: anomalies were "normalized" launch after launch (Vaughan, https://dl.icdst.org/pdfs/files/99d879ba8bca8b80995b673a84576cd0.pdf).

**Intent quotes**
- "For a successful technology, reality must take precedence over public relations, for nature cannot be fooled." Feynman (https://history.nasa.gov/rogersrep/v2appf.htm)
- "Erosion was a clue that something was wrong. Erosion was not something from which safety can be inferred." Feynman (same)

---

## 2. Aviation: checklists, simulator training, CRM (+ Gawande / WHO Surgical Safety Checklist)

**Header.** Boeing Model 299 (B-17) checklist origin in the 1930s; NASA 1979 CRM workshop (Lauber, Helmreich); Pronovost's Michigan Keystone ICU project (2003–); WHO Safe Surgery Saves Lives (Haynes, Gawande, 2007–08). In as the strongest measured evidence that a short shared checklist at fixed junctures reduces harm, and as a control showing it fails when it is mandated without adoption.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Read-do checklist at pause points | skipped "stupid but critical" steps | whole team, aloud | before induction, incision, leaving the room |
| Team intros, briefing, debrief | communication gaps | team | start and end |
| CRM training + LOFT (line-oriented flight training) sims | leadership and decision failures | instructors, simulators | recurrent |
| Outcome data collection | whether it works | local data collector | before and after |

**Seed questions**
- Q1: 19 items at three junctures (https://www.nejm.org/doi/full/10.1056/NEJMsa0810119).
- Q2: Whole team by oral confirmation, "designed to create a collective awareness" (same). CRM targets crew interaction (https://www.faa.gov/sites/faa.gov/files/crmhistory.pdf).
- Q3: Not addressed in the sources read.
- Q4: Full-mission simulations exposed communication and leadership errors (https://ntrs.nasa.gov/api/citations/19800013796/downloads/19800013796.pdf). The FAA allowed LOFT to substitute for some proficiency checks (https://rosap.ntl.bts.gov/view/dot/8636/dot_8636_DS1.pdf).
- Q5: High-workload scenarios in simulators (https://ntrs.nasa.gov/api/citations/19800013796/downloads/19800013796.pdf).
- Q6: Each checklist pause is a gate; the team does not proceed until confirmed (https://www.nejm.org/doi/full/10.1056/NEJMsa0810119).
- Q7: Infection rates per 1,000 catheter-days measured quarterly (https://www.cga.ct.gov/2007/rpt/2007-R-0728.htm).
- Q8: The Model 299 crash was ruled "pilot error" (the locking mechanism was not released) (https://www.newyorker.com/magazine/2007/12/10/the-checklist).
- Q9: Crash → checklist; accident analyses → CRM (https://www.faa.gov/sites/faa.gov/files/crmhistory.pdf).
- Q10: Pronovost first had hospitals measure their own infection rates, then offered the checklist (https://lchc.ucsd.edu/cogn_150/Readings/gawande_checklist.pdf). Culture, not paper, made the difference (https://nap.nationalacademies.org/read/23510).

**Most successful practices**
1. WHO 19-item checklist. Deaths fell from 1.5% to 0.8% and complications from 11.0% to 7.0% (n=3,733 vs 3,955, 8 sites); adherence to six safety measures rose from 34.2% to 56.7% (https://www.nejm.org/doi/full/10.1056/NEJMsa0810119). Grade A− (before/after, not randomized). Driver: forced pause plus shared awareness; Hawthorne effect possible (same).
2. Keystone central-line checklist. Median CRBSI (catheter-related bloodstream infection) went from 2.7 to 0 per 1,000 catheter-days, with a 66% reduction at 16–18 months across >100 ICUs (https://www.cga.ct.gov/2007/rpt/2007-R-0728.htm). Grade A−.
3. CRM. A review of 58 evaluations found positive reactions, learning and behaviour change, but could not establish a safety effect (https://doi.org/10.1518/001872001775870386). Grade B.

**Failures/criticism.** Ontario's mandated rollout (101 hospitals, ~215k procedures) found mortality of 0.71% vs 0.65% (P=0.13) and complications of 3.86% vs 3.82%, so no significant effect (https://www.nejm.org/doi/full/10.1056/NEJMsa1308261). Critics blamed over-reported compliance and grudging adoption (https://www.longwoods.com/content/24125/healthcare-quarterly/adoption-of-surgical-safety-checklists-in-ontario-canada-overpromised-or-underdelivered-). Matching Michigan: 1 of 17 units transformed and 11 made little change (https://link.springer.com/article/10.1186/1748-5908-8-70).

**Intent quotes**
- "making better use of the human resources on the flightdeck" (FAA CRM history, https://www.faa.gov/sites/faa.gov/files/crmhistory.pdf)
- The checklist "is intentionally designed to create a collective awareness among surgical teams about whether safety processes are being completed." (https://www.nejm.org/doi/full/10.1056/NEJMsa0810119)

---

## 3. Gary Klein's pre-mortem

**Header.** Gary Klein, Klein Associates; HBR, September 2007; evaluated by Veinott, Klein & Wiggins (ISCRAM 2010). In as the cheapest pre-exposure "break it in imagination" ritual, and a fix for teams that will not voice dissent.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Individual silent listing (~2 min) | hidden doubts, groupthink | each team member | at kickoff, before commitment |
| Round-robin consolidation | risks nobody voiced | facilitator, leader first | same session |
| Plan revision + periodic revisit | risks starting to materialize | team | during execution |

**Seed questions**
- Q1: The plan itself, before execution (https://hbr.org/2007/09/performing-a-project-premortem).
- Q2: The team that will carry out the plan; knowledgeable dissenters (same).
- Q3: Reasons are consolidated and each member proposes one mitigating action (https://idl.iscram.org/files/veinott/2010/1049_Veinott_etal2010.pdf).
- Q4: Not addressed (mental simulation only).
- Q5: Imagined total failure ("an infallible crystal ball shows that this plan was a fiasco") (same).
- Q6: Not a formal gate; it is meant to come before the final decision to proceed (https://my.chartered.college/wp-content/uploads/2019/05/Premortems_Jones.pdf).
- Q7: "periodically revisiting the PreMortem list to see if any of the items are appearing" (https://idl.iscram.org/files/veinott/2010/1049_Veinott_etal2010.pdf).
- Q8: Defined as the inverse of a postmortem (https://hbr.org/2007/09/performing-a-project-premortem).
- Q9: Through plan revision only. *Judgment:* without a standing checklist the learning stays local.
- Q10: Reverses the social incentive, so that being smart means finding flaws: "a healthy competition" (https://idl.iscram.org/files/veinott/2010/1049_Veinott_etal2010.pdf).

**Most successful practices**
1. Five steps: familiarize; imagine a fiasco; write reasons individually; round-robin consolidation; revise the plan. In a 178-person controlled study the pre-mortem cut plan confidence by 25 points, more than any other method and about twice pro/con or cons-only, and then raised confidence most after fixes (https://idl.iscram.org/files/veinott/2010/1049_Veinott_etal2010.pdf). Grade B (controlled, but students and confidence rather than outcomes). Driver: prospective hindsight, where outcome certainty produces richer explanations (https://doi.org/10.1002/bdm.3960020103).

**Failures/criticism.** The widely cited "+30%" figure is not in the 1989 abstract, which reports richer explanations rather than better forecasts (https://expectedvalue.co.uk/blog/pre-mortem-decision-making/). The authors' own caveats are student subjects, ready-made plans, and no measure of plan quality (https://idl.iscram.org/files/veinott/2010/1049_Veinott_etal2010.pdf).

**Intent quotes**
- "a premortem may be the best way to circumvent any need for a painful postmortem" Klein 2007, via https://corporate.jcx.au/premortem
- "so that the project can be improved rather than autopsied." (https://hbr.org/2007/09/performing-a-project-premortem)

---

## 4. Theatre tech and dress rehearsal (paper tech → cue-to-cue → dress → previews)

**Header.** Standard professional and academic stage-management practice (no single founder); stage manager, director, designers, operators. In as a staged-exposure ladder where each rehearsal isolates one layer before the full run, and a real audience is the last rehearsal.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Paper tech | cue order and placement errors | SM + director + designers, talk-through | week of first tech |
| Dry tech | crew cue execution | crew, no actors | before cue-to-cue |
| Cue-to-cue | coordination and calling problems at transitions | SM calls; cast jumps between cues | tech weekend, 5–7 days out |
| Dress rehearsal | costume, makeup, full-run timing | full company, run without stopping | final days |
| Previews | audience-dependent problems (comic timing) | paying or invited audience | before official opening |

**Seed questions**
- Q1: Risk is concentrated at transitions, so cue-to-cue runs "only cues", skipping dialogue (https://www.newventure.org.uk/index.php/production-manual/technical-rehearsal-process).
- Q2: Crew alone (dry tech), then with actors (wet tech) (https://human.libretexts.org/Courses/Santa_Barbara_City_College/Mastering_the_Art_of_Stagecraft_(Crop)/15%3A_Stage_Management/15.02%3A_Stage_Management). Previews add the audience (https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/An_Introduction_to_Technical_Theatre_(Sanders)/01%3A_Chapters/1.09%3A_Stage_Management).
- Q3: Designers note problems "to be corrected by the next rehearsal" (https://www.depts.ttu.edu/theatre-dance/resources/current-students/production-policies/rehearsal-policies.php). The SM produces daily reports (https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/An_Introduction_to_Technical_Theatre_(Sanders)/01%3A_Chapters/1.09%3A_Stage_Management).
- Q4: The whole ladder; previews "allow the company to adjust to the presence of the audience" (same).
- Q5: Not addressed beyond walking dark scene changes and timing quick changes (https://alltheworldstage.com/how-to/tech-week/).
- Q6: The tech run may stop and restart; the dress "is run like a show and should not stop" (https://www.adctheatre.com/media/4736/07a-sm-guide-stage.pdf).
- Q7: Director watches previews with the audience, then gives notes (https://www.lepetittheatre.com/wp-content/uploads/2024/09/Murder-For-2-Study-Guide.pdf).
- Q8: Notes sessions after each run (same). No formal post-mortem found.
- Q9: Cues are recorded into the prompt book, which becomes the standard every performance is called from (https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/An_Introduction_to_Technical_Theatre_(Sanders)/01%3A_Chapters/1.09%3A_Stage_Management).
- Q10: Timeboxing: "Cap any one problem at about 5 minutes, then move on and fix it after" (https://alltheworldstage.com/how-to/tech-week/).

**Most successful practices**
1. Layer isolation, from paper to dry to cue-to-cue to dress to preview, each adding one source of variance. Grade C (practice consensus, no measured outcomes). Driver: fault localization, since fewer moving parts per run means faster diagnosis. *Judgment.*
2. Stop-allowed tech versus no-stop dress: a clean separation between debugging mode and performance mode (https://www.adctheatre.com/media/4736/07a-sm-guide-stage.pdf). Grade C.

**Failures/criticism.** Tech is "notoriously slow"; a three-minute scene may take an hour (https://www.studyvault.co.uk/lesson/drama-aqa/theatre-roles-stagecraft/5). Listed pitfalls are actors drifting out of earshot and acting notes that waste crew time (https://alltheworldstage.com/how-to/tech-week/).

**Intent quotes**
- "The dress rehearsal, however, is run like a show and should not stop." (https://www.adctheatre.com/media/4736/07a-sm-guide-stage.pdf)
- "These previews allow the company to adjust to the presence of the audience." (https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/An_Introduction_to_Technical_Theatre_(Sanders)/01%3A_Chapters/1.09%3A_Stage_Management)

---

## 5. SpaceX Starship iterative test-to-failure

**Header.** SpaceX, Starship integrated flight tests 2023–2026; Shana Diez (Director of Starship Reliability) named in FAA letters. In as the deliberate opposite of Apollo: real flight hardware is the simulator, and failure is the planned data source, bounded by regulator-overseen mishap closure.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Ground/static-fire tests | component and propulsion faults | SpaceX test teams | before each flight |
| Integrated flight test | system-level unknowns | flight hardware in flight environment | each iteration |
| Flight termination system | public-safety breach | autonomous FTS | in flight |
| Mishap investigation + corrective actions | root causes | SpaceX-led, FAA oversight | after a mishap, gates the next flight |

**Seed questions**
- Q1: Objectives grow with each flight; "putting flight hardware in the flight environment as often as possible" (https://www.spacex.com/updates).
- Q2: Engineers plus real flight. *Judgment:* only flight reveals interactions that ground tests and simulation cannot.
- Q3: Root cause plus a numbered corrective-action list: 63 after flight 1 (https://www.faa.gov/newsroom/faa-closes-spacex-starship-mishap-investigation) and 17 after flight 2 (https://krgv.s3.amazonaws.com/files/spacex_oft-2_mishap_investigation_closeout_letter_final_02_26_24.pdf).
- Q4: Each test flight is itself a dry run toward operational service.
- Q5: Intentional envelope expansion: on flight 10 the heatshield "was intentionally stressed to push the envelope" (https://www.spacex.com/launches/starship-flight-10).
- Q6: Before flight 1, success was defined as clearing the pad (https://www.npr.org/2023/04/21/1171202753/spacex-starship-launch-explosion-cheer-success). For later flights the gate is implementing the corrective actions that affect public safety plus a license modification (https://spaceflightnow.com/2023/09/08/faa-concludes-starship-mishap-investigation-63-corrective-actions-needed-before-second-flight/).
- Q7: Telemetry and data review (https://www.spacex.com/launches/starship-flight-7).
- Q8: Mishap report with root causes and preventive measures under 14 CFR 450.173 (https://www.faa.gov/media/70901).
- Q9: Corrective actions became design changes (hot staging, electric TVC) (https://spaceflightnow.com/2023/09/08/faa-concludes-starship-mishap-investigation-63-corrective-actions-needed-before-second-flight/). "Every lesson learned… continues to feed directly into designs" (https://www.spacex.com/updates/starship-flight-test).
- Q10: Musk published the 63-item tracker as a spreadsheet, a closure ledger made visible (https://spaceref.com/newspace-and-tech/elon-musk-says-spacex-completed-all-corrective-actions-for-next-starship-launch).

**Most successful practices**
1. Success is defined as learning, with a minimum bar set before the test (clear the pad), so failure beyond that bar still counts as productive (https://www.npr.org/2023/04/21/1171202753/spacex-starship-launch-explosion-cheer-success). Grade C (reputation plus the Falcon reuse precedent claimed by SpaceX itself, https://www.spacex.com/updates).
2. A numbered corrective-action ledger that gates the next attempt: 63 actions, 57 required before flight 2 and 6 for later flights (https://payloadspace.com/faa-completes-starship-mishap-report-review-launch-license-is-next/). Grade B.

**Failures/criticism.** Flight 1 badly damaged the pad and scattered debris (https://www.nytimes.com/2023/09/08/science/spacex-starship-faa-launch.html). The flight termination system destroyed the vehicle about 40 seconds later than it should have (https://www.reuters.com/technology/space/us-faa-closes-probe-into-spacexs-april-starship-test-launch-2023-09-08/). A Starship was lost on a test stand in June 2025 (https://www.spacex.com/updates/starship-flight-test). *Judgment:* this only works where a failure harms hardware, not users.

**Intent quotes**
- "With a test like this, success comes from what we learn" (https://www.spacex.com/launches/starship-flight-test)
- "The more we fly safely, the faster we learn" (https://www.spacex.com/updates)

---

## 6. US Army After Action Review (short; full treatment in cluster 5)

**Header.** US Army, TC 25-20 (1993), Leader's Guide (2013), TC 7-0.1 (2025). In as the canonical structured debrief after every rehearsal or exercise.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Informal AAR | immediate performance gaps | unit leader | during or right after the event |
| Formal AAR | event-level lessons | trained observer-controllers | planned 6–8 weeks ahead |
| SOP revision / lessons sharing | recurrence | unit leaders, CALL (Center for Army Lessons Learned) | after the AAR |

**Seed questions**
- Q1: Every training event, against its "intended training objectives" (https://files.trex-arms.com/pdf/army/legacy/tc/tc_25-20_1993-09.pdf).
- Q2: All participants (same).
- Q3: Four questions: supposed to happen / actually happened / why the difference / sustain and improve (https://armyadp.com/publications/adp-7-0/training-execution-aar).
- Q4–Q5: It follows exercises; not a test method itself.
- Q6: Not addressed.
- Q7: Not addressed.
- Q8: "Not a critique" (http://ciar.org/ttk/mbt/armor/armor-magazine/armor-mag.1998.nd/6blake98.pdf).
- Q9: "unit leaders revise unit SOPs to reflect these improvements" (https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN42934-TC_7-0.1-000-WEB-1.pdf).
- Q10: Being "Related to specific standards" (https://files.trex-arms.com/pdf/army/legacy/tc/tc_25-20_1993-09.pdf).

**Most successful practice.** An immediate, standard-referenced four-question review → SOP update. A meta-analytic summary reports positive effects on knowledge, teamwork and task performance (Keiser & Arthur 2020, via https://www.qic-wd.org/sites/default/files/Umbrella%20Summary%20-%20After-Action%20Reviews%20050221.pdf). Grade A−/B (effect size not read directly).

**Failures/criticism.** GAO found units "repeat many of the same mistakes" and that follow-up was insufficient (https://www.gao.gov/assets/nsiad-95-152.pdf). There are "far, far too many" substandard AARs (http://ciar.org/ttk/mbt/armor/armor-magazine/armor-mag.1998.nd/6blake98.pdf). "Lessons observed but not lessons learned" (https://www.publichealthontario.ca/-/media/documents/b/2022/best-practices-after-action-review-phem.pdf).

**Intent quote.** "An AAR is a professional discussion of a training event that enables Soldiers/units to discover for themselves what happened and develop a strategy for improving performance." (https://fs-prod-nwcg.s3.us-gov-west-1.amazonaws.com/s3fs-public/2023-06/army-leaders-guide-to-aar.pdf)

---

## Cluster patterns (within this cluster only)
- **Candidate invariant: rehearse against injected failure, not only the happy path** (Apollo contingency sims, pre-mortem fiasco, Starship envelope push, LOFT high-workload sims; 4/6). The highest-value case is one the team has never seen, picked by someone other than the performers (SimSup).
- **Candidate invariant: an immediate debrief after every run, tied to a stated standard** (Apollo debrief, AAR, theatre notes, pre-mortem consolidation, Starship mishap report, checklist debriefing; 6/6).
- **Candidate invariant: every finding has to land in a durable artifact, or the lesson is lost** (mission rules and stapled alarm sheet, prompt book, revised SOP, corrective-action ledger, checklist line). The negatives (Challenger waivers, GAO repeat mistakes, "lessons observed") are all closure failures (6/6).
- **Candidate invariant: explicit gates at fixed junctures with a stop/go criterion** (checklist pause points, Go/No-Go, corrective actions gating the next flight, tech vs dress modes; 4/6). Challenger shows a gate can rot when "it flew before" is accepted as evidence.
- **Candidate invariant: staged exposure with escalating fidelity** (paper tech → cue-to-cue → dress → preview; nominal → contingency sims → flight; ground → static fire → flight; 3–4/6).
- **Recurring practice: make dissent safe and structured** (pre-mortem silent listing, CRM, oral confirmation by the whole team; Challenger engineers overridden as the negative).
- **Recurring practice: verify the fix in the rehearsal environment before it reaches the real one** (Apollo 13 backup crews in simulators; corrective actions before the next license).
- **Caution:** tools imposed without ownership show no effect (Ontario checklist, Matching Michigan, check-the-box AARs). Adoption and culture carry the effect, not the artifact.
- *Judgment:* the near-term transferable set for a tiny team is a SimSup-style adversarial case list, a pre-mortem per feature, the four-question AAR, and a corrective-action ledger that gates the next release.
