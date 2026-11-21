# Proof of learning and proof of a real act → GoBY

Filled: 2026-11-21 · Status: draft (research for Sasha's question) · Keeper: Evolver (Hark)
Sasha (2026-11-21): «нам надо будет решить proof of learning [и proof of a real act]. Кто это уже круто решает? или куски этого? и какова выигрышная механика в каждом случае. Сделай сводную таблицу, дай итоговый вывод.»
Answers the open line in canon §23.4: "how a real-life action is verified (e.g. the practitioner confirms the session in their shop, or payment goes through the platform)". Also the "Open" row in [GoBY §24](../../game_of_being_you.md) (Seer's Hut H3-7, witness JM-1, Scouting sign-off).
Evidence grade: **A** study / full-platform dataset · **B** hard observational numbers (official counts) · **C** consensus, company claim, survey.

---

## 1. Summary table

Verifier: **self** · **peer** (someone on the same level) · **senior** (someone already on the step above) · **beneficiary** (the person the act was for) · **place** (a mark that can only be made there) · **machine**.

| ID | System | What is proved | Who verifies | Winning mechanic | Cost to player | Gaming risk (what happened) | Scale (grade, source) |
|---|---|---|---|---|---|---|---|
| PL-1 | Scouting merit badges | A named skill, done "exactly as written" | **Senior**: a registered, trained counselor tests each requirement; unit leader signs before and after | Requirements written in advance; the counselor signs only when satisfied; 4 signatures = 2 conversations with adults; once signed, can't be rescinded | Several meetings, a buddy present | "Badge mills" (group sign-offs at camps) (C); unit leader may review | 1.3M+ badges earned in 2024; ~136M since 1910 (B) [1][2] |
| PL-2 | Camino credencial → Compostela | Presence on the route, in order, over the last 100 km | **Place + host**: dated stamps from albergues, churches, cafés; **senior** at the end: Pilgrim's Office checks the credencial | Many cheap witnesses along the way (2 dated stamps per stage), one human check at the end; only an authorised credencial counts | A stamp per stop; the walk itself | Bus/taxi stages; office checks are light (C). Rule only bites on the minimum distance | 530,987 Compostelas in 2025, record (B) [3][4] |
| PL-3 | BJJ belts (IBJJF) | Mastery level of an art | **Senior**: the professor decides; a black belt promotion must be signed by a black belt with ≥2 certified degrees; federation sets minimum time only | **The right to promote is itself a step**: only people high enough on the ladder can lift someone onto a step; lineage is public | Years of training; membership fees for certification | Fake lineages, self-promoted "black belts"; community "belt check" site with votes weighted by the voter's own rank (C) | 13,669 IBJJF-certified black belts listed (B) [5][6][7] |
| PL-4 | Guild masterpiece (German Meisterprüfung) | Can run the trade: one real product or service end to end | **Senior panel**: chamber committee of masters | One **Meisterprüfungsprojekt** (plan, make, check a real piece of work) + a professional conversation about it | High: course, exam fees, the piece | Low: exam under a sovereign committee | 20,426 master exams passed in crafts, 2024 (B, ZDH) [8][9] |
| PL-5 | Medical residency EPAs | "Can I trust you to do this real task without me?" | **Senior** observes a real task (micro-assessment); a committee decides entrustment from many observations | Entrustment scale on real work: observe → direct supervision → indirect → unsupervised → **teaching others** | One observed act per assessment | Engagement fatigue: in the national pilot, median **1** micro-assessment per resident; small groups did most of it (A) | 6,272 micro-assessments, 1,763 entrustment decisions, 497 residents (A, full pilot) [10][11] |
| PL-6 | GitHub merged pull request | A contribution others accepted into their project | **Beneficiary/owner**: the maintainer merges | The artefact is public and stays; the owner of the thing decides, not a grader | The work + review loop | Trivial PRs; maintainers filter (Judgment) | 518.7M PRs merged in public repos in 2025, 43.2M/month (B) [12] |
| PL-7 | Khan Academy mastery | Knowledge of a skill | **Machine**: practice to "proficient" | Small skills, practised to mastery before moving on | Minutes per skill | Guessing; proves knowledge, never a real act | ~200K students: 30 min/week ≈ +0.085 SD (A, quasi-experimental, PNAS 2026) [13]; Newark: +60 skills to proficient ≈ +0.19 SD (B) [14] |
| PL-8 | Open Badges / Credly | Any achievement, packaged | **Issuer**; the badge carries **criteria + evidence URL** so anyone can inspect | The proof travels with the claim: who issued, what was required, the evidence itself | Low | Badge inflation; a badge is only as good as its issuer (Judgment) | Credly 150M credentials issued (B, company count, 2026-11-19) [15]; 74.8M Open Badges by 2022 (C, survey) [16] |
| PL-9 | Strava GPS + segments | That you moved that route at that speed | **Machine** (GPS + ML) + users flag | Automatic trace of the act | Zero | **Ranking invites fraud at scale**: 6.5M "impossible" activities removed from top-10s across 34M leaderboards (Dec 2024) [17]; 2.3M e-bike + 1.6M vehicle activities removed 2026 (B) [18] | Platform-wide (B) |
| PL-10 | parkrun barcode + volunteers | You were there and finished (or helped) | **Peer volunteers**: timekeeper + finish token + barcode scanner | "No barcode, no time, no exception"; **milestones count persistence, not performance, and volunteering counts the same as running** | Bring a printed barcode | Low; nothing to win | 12M+ registrations, ~2,800 events (B, from [real-life-candidates.md](../real-life-candidates.md)) [19][20] |
| PL-12 | Toastmasters | You gave the speech and grew | **Peer**: every prepared speech gets an oral + written evaluation from a fellow member against the project's criteria | The witness answers, never scores; **evaluating is itself a skill you learn** (Level 1 project); speaker sets goals first | Showing up; a club seat | Low; evaluations can be too kind (C) | 265,000 members, 14,282 clubs; 109,200 paths started 2025–26 (B) [23][24]; 74.9% report less fear (C, survey) [25] |
| PL-13 | Stack Overflow accepted answer | Your answer solved someone's real problem | **Beneficiary**: only the asker can accept | The person helped closes the loop | Zero for the helper | **Askers forget**: 62% accepted in 2013 data; 47% of questions unresolved by 2019 (A, full dumps) [26][27] | 18M+ questions (A) [27] |
| PL-14 | POAP (proof of attendance) | You were at the event | **Code/QR** handed out by the issuer | Attendance token minted on the spot | Zero | **Farmed**: bots and "POAP farmers" claimed drops for events they never attended; forced manual curation (2021); project winding down 2026 (B) [28][29] | ~7.6M minted by 46,210 issuers (B) [28] |

Already analysed in this repo and reused below: Couchsurfing vouching after meeting in person (CS-1, A) and two-sided references (CS-2, B); Evoke evidence + mentor answer (JM-1, A); Seer's Hut quest confirmed by the giver (H3-7, driver A).

---

## 2. What the 14 systems teach (patterns, with evidence)

1. **The strongest proofs are signed by a person, about a real act, against criteria written before.** Scouting (1.3M/yr, 116 years), Meister (~20k/yr), EPAs, BJJ. Machines prove movement (Strava) or knowledge (Khan), never that a real act with a real person happened.
2. **Who may sign rises with the step.** BJJ: only a 2nd-degree black belt can make a black belt [7]. EPA's top level is "teaching others" [11]. Meister: a panel of masters. This is exactly Sasha's accepted ladder: steps open by real deeds, quality held by people already on that step.
3. **The beneficiary is the most honest verifier of an act, but forgets.** Stack Overflow: only the asker can accept; acceptance fell to ~half (A) [26][27]. GitHub: the maintainer merges. A confirmation must be one tap and asked for, not left to memory.
4. **Many cheap witnesses + one serious check.** Camino: stamps from hosts all the way, one human check at the end [3][4].
5. **Proof tied to a ranking or a tradable token gets gamed at scale.** Strava removed millions of fake efforts from leaderboards [17][18]; POAP was farmed by bots and lost its meaning [28][29]. Where nothing is ranked or sold (parkrun, Toastmasters), fraud stays low (C).
6. **Helping counts as playing.** parkrun milestones count volunteering equal to running [20]; Toastmasters makes evaluating a skill [24]. The witness is a player too, not a cost.
7. **The cost of witnessing is the bottleneck.** EPA pilot: median one observation per resident (A) [10]. Keep the confirmer's act tiny, and the ask rare at low steps.

---

## 3. Canon filter

| Check | Result |
|---|---|
| §10a fidelity | Pass: every proof below is a real act seen by a real person; nothing simulated |
| §21.2 real counterpart | Counselor's signature, pilgrim stamp, master's panel, accepted answer |
| Real person behind every avatar | Core: verifiers are named villagers; no anonymous votes |
| Numbers only where they mirror a real act | A count of confirmations = count of real acts confirmed by real people; owner-only. **No** score, rating, XP or level number |
| No ranking people | Drop: Strava leaderboards, Evoke/Beltchecker vote weighting shown publicly, SO reputation points |
| Rejected | **Tradable/transferable proof** (POAP NFT), **machine-only proof of a real act** (GPS, QR code alone), **peer star ratings**, **reputation points** |

---

## 4. Conclusion: the proof model for GoBY

**One rule:** *a real act counts when a real person who was part of it confirms it. Who may confirm rises with the step: at the bottom the person the act was for, at the top a person already on that step.* Proof is asked for only where something opens (an artifact, a step, a right); private daily acts need none.

| Level | What is proved | Who verifies | Form (one tap for the verifier) | From |
|---|---|---|---|---|
| **0. Daily act** (A13 streak) | "I did my one real act today" | **Self**, private | One line in the player's own words. Nothing public depends on it, so no proof is asked | DL-1, A13 |
| **1. Village quest / real act with a villager** (§23.4) | The act happened (a session, a coffee, a visit) | **The villager who gave the quest and was there** (beneficiary/host) | The giver confirms from their shop: dated, tied to their place. Paid sessions: payment through the platform proves the purchase; the giver's confirmation proves the session happened | H3-7, PL-2, PL-11, PL-13, CS-2 |
| **2. Journey step / proof of learning** (J1–J12) | I learned it and applied it in my life | **One witness the player chooses** (ally or practitioner) reads one piece of evidence (photo, line, artifact) against the step's done-when line and **answers**; never scores | Evidence + one reply. The step's done-when is written before, like a merit-badge requirement | JM-1, PL-1, PL-12, PL-8 (evidence travels with the claim) |
| **3. Rights that affect others** (give quests, host a circle, build in the constructor, found a village) | I can do this *for others* at the quality of this step | **A person already on that step** (one at first; two for the highest rights, e.g. founding a village), after a real piece of work shown to them | "Would I trust you to do this for others?" yes / not yet + one line what to do next | PL-3, PL-4, PL-5, PL-1, Sasha's ladder |

**Guards (all from the table, none invented):**
- Proof is **never tradable, transferable or ranked** (PL-9, PL-14). Confirmations show to the owner; the public sees only the artifact in the House.
- A villager confirms **only people they actually met**, and **3 sessions from 3 different people** means 3 distinct confirmers (CS-1, PL-2).
- The confirmer is asked, with one tap, right after the act; an unconfirmed act waits on the shelf as a faint slot, never lost (PL-13 lesson; H3-8 slots).
- A confirmer's right can be withdrawn by the people on their own step if their confirmations prove false (BJJ lineage, Scouting unit-leader review).
- Confirming and witnessing count as playing (PL-10, PL-12): a witness's answer is their own real act for the day.

**How it answers §23.4:** a village quest is verified by **the practitioner who gave it, confirming in their shop** that the player came and did it (payment through the platform, when there is one, proves only the purchase). Sasha's example "buy 3 sessions from 3 different people → artifact" = 3 confirmations from 3 distinct practitioners → the set combines (H3-8). Village-only artifacts = artifacts whose pieces can only be confirmed by a villager at a real place (Camino logic: the stamp exists only there).

**Smallest test (no build):** in San Pancho, 3 practitioners each write one quest with a done-when line; players do them; the practitioner confirms by one message (form or WhatsApp) that Evolver records by hand.
- **Signal:** share of done quests the giver confirms without a second reminder.
- **Kill line:** givers leave most confirmations unanswered after one reminder → move level 1 to the player's evidence + giver's reply (level 2 form) instead of a yes/no confirm.
- Needs Sasha's yes before any spec row (H3-7 row "Village quest: done when the giver confirms" already proposed in heroes-iii-pass-3.md).

---

## 5. Sources (accessed 2026-11-21)
1. Scouting America, Report to the Nation 2024: https://filestore.scouting.org/filestore/newsroom/RTTN-2024.pdf
2. Scouting America, merit badge process / Guide to Advancement §7: https://www.scouting.org/programs/scouts-bsa/advancement-and-awards/merit-badges/ ; https://filestore.scouting.org/filestore/pdf/gta-section-7.pdf ; https://filestore.scouting.org/filestore/pdf/33088.pdf
3. Pilgrim's Reception Office FAQ (2 stamps/day, last 100 km): https://oficinadelperegrino.com/en/faqs ; Galicia official: https://www.caminodesantiago.gal/en/durante-el-camino/informacion-practica/la-credencial-del-peregrino
4. Compostelas 2025: https://santiago.es/en/news/record-pilgrims-2025 (via real-life-candidates.md)
5. IBJJF certified black belts list: https://ibjjf.com/certified-black-belts
6. IBJJF Graduation System 2026 (Art. 6: black belt signed by ≥2nd-degree black belt): https://ibjjf.com (PDF "20260611_IBJJF_Graduacao_EN.pdf")
7. Beltchecker verification FAQ (votes weighted by rank): https://www.beltchecker.com/faq.php
8. ZDH via Allgemeine Bauzeitung, Meisterprüfungen 2024: https://allgemeinebauzeitung.de/bestandene-meisterpruefungen-meisterpruefungen-im-handwerk-steigen-2024-62885 ; Destatis/BMFTR table 2.7.14: https://www.datenportal.bmftr.bund.de/portal/docs/de/Tabelle-2.7.14.csv
9. ZDH, Meisterprüfung (project + Fachgespräch): https://www.zdh.de/ueber-uns/fachbereich-berufliche-bildung/hoehere-berufsbildung/meister-im-handwerk/meisterpruefung/
10. Brasel et al., EPAs in General Surgery national pilot, Ann Surg 2023: https://pubmed.ncbi.nlm.nih.gov/37436883/
11. American Board of Surgery EPAs: https://www.absurgery.org/get-certified/epas ; scale incl. "teaching others": https://journals.lww.com/annalsofsurgery/fulltext/2023/10000/implementation_of_entrustable_professional.12.aspx
12. GitHub Octoverse 2025: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1
13. Eames et al., PNAS 2026: https://www.pnas.org/doi/10.1073/pnas.2507708123
14. Khan Academy Newark white paper: https://blog.khanacademy.org/wp-content/uploads/2025/11/Newark_White_Paper-2.pdf
15. Pearson, Credly 150M credentials, 2026-11-19: https://plc.pearson.com/en-GB/news-and-insights/news/credly-issues-50-million-digital-credentials-under-two-years-reaching-150
16. 1EdTech Badge Count 2022: http://content.1edtech.org/badge-count-2022/findings ; Open Badges 3.0 spec (evidence, criteria): https://www.imsglobal.org/spec/ob/v3p0
17. Strava community, 2024-12-04: https://communityhub.strava.com/what-s-new-10/keeping-leaderboards-fair-more-leaderboard-improvements-8009
18. Cybernews / Cycling Weekly, 2026 cleanup: https://cybernews.com/tech/strava-cleanup-segment-leaderboards ; https://www.cyclingweekly.com/news/strava-removes-2-3-million-rides-from-leaderboards-in-clampdown-on-cheats
19. parkrun results policy: https://support.parkrun.com/hc/en-us/articles/200565343-4-1-Results ; volunteer roles: https://support.parkrun.com/hc/en-us/articles/20047334957842-3-2-Volunteer-Roles
20. parkrun milestones ("persistence over performance… walk, jog, run or volunteer"): https://support.parkrun.com/hc/en-us/articles/205904361
23. Toastmasters by the Numbers, Nov 2026: https://www.toastmasters.org/magazine/magazine-issues/2026/november/toastmasters-by-the-numbers
24. Toastmasters evaluations: https://ccdn.toastmasters.org/medias/files/the-navigator/8722-the-navigator.pdf ; https://www.toastmasters.org/magazine/magazine-issues/2025/feb/navigating-feedback-on-your-speeches
25. Toastmasters fact sheet 2024–25: https://content.toastmasters.org/image/upload/Fact-Sheet-Infographic-202507.pdf
26. Movshovitz-Attias et al., ASONAM 2013 (62% accepted): https://www.cs.cmu.edu/~ymovshov/Papers/asonam_2013.pdf
27. Questions without accepted answers (47% unresolved by 2019; 18M questions): https://arxiv.org/abs/2103.11386
28. The Block, POAP shutting down, 2026-08-03: https://www.theblock.co/news/ecosystems/2026-08-03-proof-of-attendance-protocol-is-shutting-down-after-5-years-410482
29. Decrypt, POAP farmers, 2021-10-16: https://decrypt.co/83614/ethereum-badge-app-poap-is-scaling-back-to-move-forward
