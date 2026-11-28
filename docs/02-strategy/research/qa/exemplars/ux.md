# Cluster: UX RESEARCH & USABILITY TESTING (2026-11-27)
Sources: web_search/web_fetch only. Grades: A measured/large data, B credible case data with numbers, C anecdote/reputation. *Judgment* = my inference, not a sourced fact.

Source keys:
[NN5] https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/ · [NNsev] https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/ · [NNhe] https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/ · [FAU] https://link.springer.com/article/10.3758/BF03195514 · [HFI] https://www.humanfactors.com/newsletters/how_many_test_participants.asp · [KRUG] https://www.creativebloq.com/netmag/steve-krug-diy-usability-testing-6116958 · [AAPL-BW] https://www.eng.auburn.edu/~troppel/Apple-design-process.htm · [AAPL-A11Y] https://sighttechglobal.com/wp-content/uploads/2020/12/designing-for-everyone-accessibility-innovation-at-apple.txt · [AAPL-BETA] https://beta.apple.com/ · [MAPS] https://money.cnn.com/2012/09/28/technology/apple-ceo-letter-maps/index.html (search excerpt, letter text; also https://web.archive.org/web/20121001014531/http:/www.apple.com/letter-from-tim-cook-on-maps) · [SU13] https://basecamp.com/shapeup/3.4-chapter-13 · [SU14] https://basecamp.com/shapeup/3.5-chapter-14 · [SU15] https://basecamp.com/shapeup/3.6-chapter-15 · [LYS] https://www.lyssna.com/guides/five-second-testing-guide · [MU23] https://measuringu.com/do-click-tests-predict-live-site-clicks · [BBG] https://web.archive.org/web/20170420005732/www.bloomberg.com/news/features/2017-04-19/silicon-valley-s-400-juicer-may-be-feeling-the-squeeze · [ARS] https://arstechnica.com/information-technology/2017/09/juicero-maker-of-proprietary-juice-bag-presser-is-shutting-down/

---

## 1. Nielsen Norman Group: 5 users, heuristic evaluation, severity ratings
**Header.** NN/g; 1990 (heuristic evaluation, Nielsen & Molich), 1993 (Nielsen–Landauer problem-discovery model), 1994 (severity scale), 2000 ("5 users"). Key people: Jakob Nielsen, Tom Landauer, Rolf Molich; current authors Kate Moran, Kelley Gordon [NN5][NNhe][NNsev]. In as the canonical discount-usability control.

| layer | what it catches | who/what runs it | when |
|---|---|---|---|
| Heuristic evaluation | glaring violations of 10 heuristics | 3–5 independent evaluators, 1–2 h each [NNhe] | early, before user tests [NNhe] |
| Small qualitative test | ~85% of problems with 5 users (L≈31%) [NN5] | facilitator + 5 representative users | iteratively, 3 rounds of 5 [NN5] |
| Severity rating | what blocks release | ≥3 evaluators rate independently, mean used [NNsev] | after sessions, ~30 min [NNsev] |

- Q1 Scope narrowed to one task/section/user group/device per evaluation [NNhe].
- Q2 Experts catch heuristic violations; only real users catch context ("heuristic evaluations cannot replace user research") [NNhe].
- Q3 0–4 scale (0 not a problem … 4 catastrophe, "imperative to fix before release"); severity = frequency × impact × persistence + market impact [NNsev].
- Q4 Not addressed. Q5 Not addressed.
- Q6 Release unadvisable while "several disastrous" problems remain; cosmetic-only may ship [NNsev].
- Q7 Not addressed. Q8 Not addressed.
- Q9 Re-test after every fix: the second study checks whether fixes worked and finds new problems they introduced [NN5].
- Q10 Separate user groups need 3–4 users each [NN5].

**Practices.** (1) 3×5 iterative rounds instead of one 15-user study. Grade B: model fit across projects [NN5], but Faulkner's 60-user resampling found 5-user sets catch 55–99% (A, contradicts the mean) [FAU]. Driver: diminishing returns; fix-then-retest loop. (2) Independent multi-rater severity, mean of 3. Grade C/B (practitioner experience) [NNsev]. Driver: one rater is unreliable.
**Criticism.** Spool & Schroeder: first 5 users found 35% of problems; severe problems surfaced at users 13 and 15 [HFI][FAU].
**Intent quotes.** "zero users give zero insights" [NN5]. "you should not bet that your design is one of the few exceptions" (Nielsen, quoted) [NNhe].

## 2. Steve Krug: Rocket Surgery Made Easy, monthly DIY tests
**Header.** Steve Krug, Advanced Common Sense; *Don't Make Me Think* (2000), *Rocket Surgery Made Easy* (2009/10) [KRUG]. In: the lowest-cost recurring real-user ritual for teams with no researchers.

| layer | what it catches | who | when |
|---|---|---|---|
| Monthly test, 3 users, think-aloud | the worst problems "anybody" hits [KRUG] | team members as facilitators; whole team observes | one fixed morning a month [KRUG] |
| Competitor test round | problems in others' working prototypes | same | first round [KRUG] |
| Lunch debrief | top-3 serious problems, ranked | all observers | same day [KRUG] |

- Q1 Test from the very start; testing near the end finds problems "too late to fix" [KRUG].
- Q2 Loosely recruited users ("recruit loosely and grade on a curve"); builders watch themselves [KRUG].
- Q3 Each observer writes top 3; group ranks; fix down the list until resources run out [KRUG].
- Q4 Remote testing via screen share, after a few in-person sessions [KRUG]. Q5 Not addressed.
- Q6 Not addressed (no gate; fixed cadence instead).
- Q7 Not addressed. Q8 Not addressed.
- Q9 Fix the top problem with the smallest "tweak" this month, not in the next redesign [KRUG].
- Q10 Observation is the change agent: "a transformative experience" for builders [KRUG].

**Practices.** (1) Fixed-day monthly cadence, 3 users, same-day debrief. Grade C (practitioner reports, no numbers) [KRUG]. Driver: low cost + fixed calendar removes the "when to test" decision. (2) "Focus ruthlessly on the most serious problems" + minimal tweak. Grade C [KRUG]. Driver: limits the fix list to capacity.
**Criticism.** Krug concedes 3 users are not statistically valid [KRUG]; sample-size critiques above apply [FAU].
**Intent quote.** "the most valuable thing you can do … is to have the people who are building it … watch some people trying to use it" [KRUG].

## 3. Apple: design reviews, dogfooding, accessibility QA
**Header.** Apple; process described 2008 (Michael Lopp at SXSW via Businessweek) [AAPL-BW]; accessibility (Sarah Herrlinger, Chris Fleizach, 2020) [AAPL-A11Y]. In: iconic for internal review rigor; also negative case (Maps 2012).

| layer | what it catches | who | when |
|---|---|---|---|
| Pixel-perfect mockups | ambiguity before build [AAPL-BW] | designers | pre-build |
| 10→3→1 + paired weekly meetings | weak concepts; infeasibility [AAPL-BW] | designers + engineers | weekly |
| Pony meetings | leadership expectation gaps [AAPL-BW] | execs | recurring (frequency not in fetched source) |
| Accessibility team embedded | exclusion, edge cases (e.g. FaceID training diversity) [AAPL-A11Y] | a11y engineers incl. disabled users | "day one", early and often |
| Public beta + Feedback Assistant | field bugs [AAPL-BETA] | external volunteers | pre-release |

- Q1 Every new product is checked by the a11y team for "how do we ensure this will work for everyone" [AAPL-A11Y].
- Q2 Disabled employees dogfood; caught image descriptions calling white canes "brooms or sticks" → training set fixed [AAPL-A11Y].
- Q3 Fleizach: every AppleCare email and bug filed on a11y is read by his team [AAPL-A11Y].
- Q4 Public beta program for OS releases [AAPL-BETA]. Q5 "poke and prod … find all those edge cases"; robustness analysis of sensitive outputs [AAPL-A11Y].
- Q6 Not publicly documented. Q7 Bug reports + AppleCare feedback [AAPL-A11Y]. Q8 Not addressed publicly.
- Q9 Field failures fed into training data/features (white cane; small-body-part false positives in People Detection) [AAPL-A11Y].
- Q10 Lived-experience staff as standing testers ("nothing about us without us") [AAPL-A11Y].

**Practices.** (1) Embedded a11y review from concept, run by users of the assistive tech. Grade C/B (insider anecdotes; ~70% of blind mobile users on iOS cited) [AAPL-A11Y]. Driver: expert-user dogfooding catches what sighted engineers can't. (2) 10→3→1 divergence then convergence. Grade C [AAPL-BW].
**Failure.** iOS 6 Maps (2012): CEO letter "we fell short", recommended rival apps [MAPS]. *Judgment:* internal review didn't substitute for real-world data coverage at scale.
**Intent quotes.** Pixel-perfect mockups: "it removes all ambiguity" [AAPL-BW]. "you can't design a product that's really going to work for someone if you're on the outside looking in" [AAPL-A11Y].

## 4. Basecamp/37signals: Shape Up QA and hill charts (small team)
**Header.** 37signals; *Shape Up* (2019), Ryan Singer, Jason Fried [SU13]. In: small-team control where builders own quality and QA is optional.

| layer | what it catches | who | when |
|---|---|---|---|
| Builders' own tests | basic correctness of shaped scope | designers + programmers [SU14] | during cycle |
| Hill chart | stuck/unknown work ("a dot that doesn't move is a raised hand") [SU13] | team drags dots; manager reads | continuous |
| One QA person | edge cases outside core [SU14] | 1 QA for millions of users, ~12-person product team [SU14] | end of cycle |
| Optional code review | teaching, not a gate [SU14] | senior | if time |

- Q1 Riskiest unknowns first ("push the scariest work uphill first") [SU13].
- Q2 Builders own basics; QA hunts edges; added only when edge cases hit "hundreds or thousands" of users [SU14].
- Q3 QA issues = nice-to-haves (~) by default; team promotes to must-have by severity into the scope list [SU14].
- Q4 Not addressed. Q5 Not addressed.
- Q6 "Compare down to baseline" not up to ideal; extend only if remaining work is must-have and all downhill; circuit breaker kills overruns [SU14].
- Q7 "Let the storm pass": wait days before reacting to post-ship feedback [SU15].
- Q8 Not addressed (no post-mortem form).
- Q9 Feedback = raw ideas, reshaped and re-bet; no automatic commitments [SU15].
- Q10 Hill-chart status without asking; uphill thirds: thought → validated → built [SU13].

**Practices.** (1) QA as "level-up, not a gate". Grade C (single-company report) [SU14]. Driver: ownership + capacity matched to risk. (2) Hill chart. Grade C [SU13]. Driver: makes uncertainty visible without anyone confessing it.
**Criticism.** No sourced external critique fetched; *Judgment:* with no formal gate or post-mortem, recurrence prevention depends on team discipline.
**Intent quote.** "we think of QA as a level-up, not a gate or a check-point that all work must go through" [SU14].

## 5. Five-second and first-click tests (UsabilityHub/Lyssna; Bob Bailey)
**Header.** UsabilityHub (now Lyssna) five-second test; Bob Bailey & Cari Wolfson first-click studies 2006–09; replication by MeasuringU (Jeff Sauro, Jim Lewis) [LYS][MU23]. In: cheapest first-impression/first-use probes.

| layer | what it catches | who | when |
|---|---|---|---|
| Five-second test | unclear purpose/message [LYS] | 5–10 unmoderated participants [LYS] | early mockups, landing pages |
| First-click test | wrong starting path [MU23] | panel participants on image or live site | IA/navigation design |

- Q1 First impression and first action on key screens [LYS][MU23].
- Q2 Real people with no context; designers can't unsee their own design. *Judgment.*
- Q3 Success bar: >80% state main message = good; <50% needs major change [LYS].
- Q4 Image vs live-site comparison: first clicks differ ~6% on average, up to 40% where hover menus exist [MU23]. Q5 Not addressed.
- Q6 The 80% threshold works as an exit criterion [LYS]. Q7 Not addressed. Q8 Not addressed.
- Q9 Retest after changes; converging wrong answers reveal a "red herring" element [LYS].
- Q10 Don't reveal questions before exposure [LYS].

**Practices.** (1) First-click as success predictor: correct first click → 87% task success vs 46% wrong (Bailey & Wolfson, 12 studies) [MU23]. Replications: 78% vs 70% on live sites (750 participants); 81% vs 14% in tree tests (1,000 participants) [MU23]. Grade A/B. Driver: early path commitment. (2) Five-second recall with 80% comprehension bar. Grade C (vendor guidance) [LYS].
**Criticism.** Effect size shrank sharply on modern live sites; static images miss dynamic UI [MU23].
**Intent quote.** "When users have more than five seconds, they start analyzing designs like a designer would" [LYS].

## 6. Negative: Juicero (2013–2017), launch without baseline user testing
**Header.** Juicero Inc.; founder Doug Evans, CEO Jeff Dunn; ~$120M raised (Google Ventures, Kleiner Perkins) [BBG]. Chosen over Google Glass: more specific, better-documented proof of an untested core value claim. Negative.

| layer | what it catches | who | when |
|---|---|---|---|
| Prototype iterations | engineering of press ("about three years … a dozen prototypes") [BBG] | founder/engineers | pre-launch |
| Baseline test vs. hand | whether the machine is needed at all | done by Bloomberg reporters, not the company [BBG] | after launch |

- Q1 Funding raised in 2014 on 3D-printed renderings "without a working prototype" [BBG].
- Q2 Investors and businesses discovered the flaw themselves; 7 business owners didn't know packs could be hand-squeezed [BBG].
- Q3 Not addressed. Q4 Hotels/restaurants as niche early users [BBG]. Q5 Not addressed (the press, not the user, got stress-tested).
- Q6 Not addressed. Q7 Press exposure; refunds offered [ARS].
- Q8 None public; shutdown 1 Sept 2017, citing distribution infrastructure [ARS].
- Q9 Not addressed. Q10 Hand squeeze: 7.5 oz in 90 s vs machine 8 oz in ~2 min [BBG].

**Practice (inverse).** Missing baseline comparison test. Grade B (Bloomberg measured test) [BBG]. *Judgment:* one five-minute "do it without our product" test with a few users would have exposed the core flaw before $120M.
**Criticism.** Company knew packs could be hand-squeezed but didn't broadly disclose to investors or employees (four sources) [BBG].
**Intent quote.** Evans: press wields four tons, "enough to lift two Teslas" [BBG].

---

## Cluster patterns
- **Candidate invariant: observe real users early and on a fixed rhythm**, not once at the end (NN/g 3×5, Krug monthly, Apple a11y "day one", Lyssna early mockups). Juicero's absence of a baseline test is the counter-case. *Judgment:* 5/6.
- **Candidate invariant: small samples, repeated.** 3–10 users per round, retest after fixes (NN/g, Krug, Lyssna). Sample-size critiques (Faulkner 55–99%) argue for rounds, not one big study.
- **Candidate invariant: a severity scale tied to a ship rule.** NN/g 0–4 with "catastrophe blocks release"; Shape Up must-have vs ~nice-to-have; Lyssna 80% bar; Krug top-3.
- **Candidate invariant: fix the worst first, within capacity.** Krug "focus ruthlessly", Shape Up scope hammering, NN/g resource allocation by severity.
- **Builders must watch real use.** Krug's observers, Apple's lived-experience engineers, Shape Up builders owning quality. Experts or heuristics complement this but don't replace it (NN/g's own caveat).
- **Baseline comparison is the cheapest test of a value claim** (Shape Up "compare to baseline"; Juicero's failure).
- **Weak spots across the cluster:** chaos/adversarial testing (Q5) and formal post-mortems (Q8) are mostly absent. UX methods find confusion, not crashes, so this cluster can't supply invariants for those questions.
- **First-impression probes predict, but less than folklore says:** first-click 87/46 shrank to 78/70 on live sites; static images miss dynamic UI. Test on the real build where possible.
