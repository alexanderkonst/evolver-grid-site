# Cluster: ENGINEERING QA & CRASH TESTS (2026-11-27)
Sources: web_search / web_fetch only. Evidence grades: A measured/large data, B credible case data or practitioner numbers, C anecdote/reputation. *Judgment* = my inference, not a sourced fact.

---

## 1. Google — test sizes/pyramid, flaky-test data, Testing on the Toilet, code review
**Header.** Google, 2005→today; Testing Grouplet volunteers, John Micco (CI/flakiness), Adam Bender (SWE book ch. 11), Caitlin Sadowski et al. (code review study). In because it is the iconic developer-owned automated testing culture with published large-scale data.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Human judgment (raters, exploratory) | quality of results, security holes | humans, then encoded as automated test | pre-release |
| Code review | unreadable code, missing tests, norms | 1 reviewer (median) | every change |
| Large/E2E tests (~5%) | config, system wiring | build/release pipeline | release |
| Medium/integration (~15%) | component contracts | CI on one machine | pre/post-submit |
| Small/unit (~80%) | logic bugs | author, CI (TAP) | every change |
Source: https://abseil.io/resources/swe-book/html/ch11.html

**Q1** Everything you don't want broken ("Beyoncé Rule"); smallest possible test; sizes enforced by infra (small = 1 process, no I/O) https://abseil.io/resources/swe-book/html/ch11.html. **Q2** Developers write tests; humans reserved for judgment/exploratory, and each human find becomes an automated test (same). **Q3** Flakes tracked; failing tests to be fixed "within minutes"; failure transitions re-run 10x to confirm flakiness https://isofteng.github.io/wise2017/wise17-johnmicco.pdf. **Q4** Not addressed in these sources (GameDay/DiRT, see Amazon). **Q5** Failure injection in tests (RPC errors, latency), chaos referenced (ch11). **Q6** All project tests must pass pre-submit and post-submit before release https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html. **Q7** Project Health (pH) score 1–5 from dozens of metrics (ch11). **Q8** Not addressed here. **Q9** Test Certified 5-level ladder (>1,500 projects), orientation class, TotT one-page flyers, reviewers may block changes lacking tests (ch11). **Q10** Treats flakiness as a first-class signal: test trust is the asset.

**Best practices.**
1. Mandatory tests + continuous run on GWS: >80% of pushes had user-affecting bugs; within a year of policy, emergency pushes halved despite record change volume. Grade B. Driver: shared test pool replaces per-person debugging. https://abseil.io/resources/swe-book/html/ch11.html
2. Flakiness budget: ~1.5% of runs flaky, ~16% of 4.2M tests some flakiness, 84% of pass→fail transitions are flakes, 2–16% of CI compute spent re-running; above ~1% flakiness tests "lose value"; Google at ~0.15%. Grade A. Driver: signal-to-noise preserves trust (cry-wolf effect). https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html ; https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/45880.pdf
3. Lightweight review: median ~24 lines, 1 approver, median <4h, primary motive = code others understand (education). Grade A (9M changes). https://research.google/pubs/modern-code-review-a-case-study-at-google/ ; https://dl.acm.org/doi/pdf/10.1145/3183519.3183525

**Failures/criticism.** Flake insertion rate ≈ fix rate ("stuck") (Micco blog above); engineers skip slow suites; mock abuse made tests brittle (ch11).
**Quotes.** "If you liked it, then you shoulda put a test on it." — ch11. "A bad test suite can be worse than no test suite at all." — ch11.
*Judgment:* for a tiny team the transferable core is the test-trust rule (fix or quarantine flakes immediately) and the size discipline, not the pyramid ratio.

---

## 2. Netflix — Chaos Monkey / Principles of Chaos Engineering
**Header.** Netflix, 2010–now; Yury Izrailevsky, Ariel Tseitlin (Simian Army), Casey Rosenthal et al. (Principles). In as the origin of breaking production on purpose.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Chaos Kong (region off) | regional SPOFs | automation | periodic, prod |
| Chaos Gorilla (AZ off) | AZ dependence | automation | prod |
| Latency Monkey | bad timeouts/fallbacks | automation | prod |
| Conformity/Security/Doctor Monkeys | drift from best practice, unhealthy nodes | automation | continuous |
| Chaos Monkey | single-instance loss | automation, business hours, engineers on standby | every workday |
Sources: https://netflixtechblog.com/the-netflix-simian-army-16e57fbab116 ; https://sdtimes.com/chaos-engineering/netflix-details-chaos-engineering

**Q1** Real-world events prioritized by impact or frequency https://principlesofchaos.org/. **Q2** Automation injects; service owners fix; engineers stand by. **Q3** Not addressed in detail. **Q4** Production itself is the rehearsal ("Run experiments in production") https://principlesofchaos.org/. **Q5** Core: define steady state, hypothesize it holds in control vs experiment group, inject, try to disprove; minimize blast radius; automate continuously (same). **Q6** Not addressed. **Q7** Steady-state output metrics (throughput, errors, latency) as the watch signal; monitoring a prerequisite https://cacm.acm.org/practice/the-antifragile-organization/. **Q8** Outages drive new tools (Christmas Eve 2012 ELB outage → active-active, Chaos Kong) https://www.infoq.com/news/2014/09/netflix-chaos-engineering. **Q9** Daily repetition acts "like a regression test" against drift https://medium.com/oreillymedia/birth-of-chaos-c7333195dc13. **Q10** Chaos as incentive design: the expectation of failure aligns teams without top-down mandates (SD Times above).

**Best practices.**
1. Continuous instance-kill in business hours. Sept 2014 AWS Xen reboot: 218 of 2,700+ Cassandra nodes rebooted, 22 failed, automation replaced them, 0 downtime; credited to a year of Chaos Monkey on Cassandra. Grade B. Driver: rehearsed recovery (fire-drill effect). https://www.infoq.com/news/2014/10/netflix-cassandra
2. Hypothesis + steady-state framing with control group (later ChAP: auto-stop <5 min, business hours, concurrency limits). Grade B/C. https://www.chaos.conf.kth.se/wp-content/uploads/sites/28/2018/12/Lorin-Hochstein-What-I-have-learned-doing-chaos-at-Netfix.pdf

**Failures/criticism.** Did not prevent the Dec 2012 regional ELB outage https://netflixtechblog.com/a-closer-look-at-the-christmas-eve-outage-d7b409a529ee ; self-serve chaos saw little uptake, needed auto-generated experiments (Hochstein deck); requires cultural shift and guardrails https://www.computer.org/publications/tech-news/research/netflix-chaos-engineering.
**Quotes.** "poke a hole in your tire once a week in your driveway on a Sunday afternoon and go through the drill" — Simian Army post. "The harder it is to disrupt the steady state, the more confidence we have" — principlesofchaos.org.
*Judgment:* chaos presumes redundancy and solid monitoring; with few players, its analogue is scripted fault injection (offline, slow network, API 500) in staging.

---

## 3. Amazon — GameDay, Correction of Error (COE)
**Header.** Amazon/AWS, GameDay early 2000s (Jesse Robbins, "Master of Disaster", ex-firefighter); COE mechanism (documented by AWS 2022). In for rehearsed disaster + action-item post-mortems.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| COE review | root causes, missing safeguards | owning team, reviewed upward | after every significant event |
| GameDay | latent defects, hidden SPOFs, broken monitoring | ops org, announced window, unannounced moment | semi-regular |
| Tool safeguards (post-COE) | fat-finger inputs | tooling | at execution |
Sources: https://queue.acm.org/detail.cfm?id=2371297 ; https://aws.amazon.com/blogs/mt/why-you-should-develop-a-correction-of-error-coe/

**Q1** Critical systems, at full-facility scale (power off a data center) (Queue). **Q2** Engineers respond via normal incident process; facilitators simulate (fake fire timeline) (Queue). **Q3** COE: summary, quantified impact, timeline with timezone, metrics, detection/diagnosis/mitigation questions ("how cut time-to-detect in half?"), 5 Whys, action items with owner/priority/due date (~14-day SLA, 6–8 items avg) (AWS blog). **Q4** GameDay months-notice window; drills "as real as possible" (Queue). **Q5** Real failures injected, not simulated (Queue). **Q6** Not addressed. **Q7** Exercises expose that monitoring/paging itself died (Queue). **Q8** COE explicitly not for blame; "human error" means ask why it was possible (AWS blog). **Q9** S3 2017 typo outage → tool removes capacity slowly, refuses below minimum, audit all similar tools, dashboard made multi-region https://aws.amazon.com/message/41926. **Q10** Exercise people too: exhaustion, missing teams (Google DiRT in same Queue piece).

**Best practices.**
1. COE action items with owner + due date, "human error" banned as root cause. Grade B (S3 case: concrete guardrail shipped). Driver: just culture → full disclosure; system fix over person fix. https://aws.amazon.com/blogs/mt/why-you-should-develop-a-correction-of-error-coe/
2. GameDay with filed bugs for every break; in the parallel Google DiRT program, 80–85% of issues closed after each exercise and previously serious failures later resolved "effortlessly". Grade B. Driver: deliberate practice. https://queue.acm.org/detail.cfm?id=2371297

**Failures/criticism.** S3 Feb 2017: authorized engineer following an established playbook mistyped input; tool allowed too much capacity removal; status dashboard depended on S3 https://aws.amazon.com/message/41926. GameDay adoption is slow where prior outages produced blame (Krishnan, Queue).
**Quotes.** "you can't choose whether or not you're going to have failures… but you can choose in many cases when you're going to learn the lessons." — Robbins, Queue. "An untested disaster recovery plan isn't really a plan at all." — Krishnan, Queue.

---

## 4. Meta/Facebook — dogfood → canary → staged rollout, Gatekeeper flags
**Header.** Facebook, 2007–2017+; Chuck Rossi (release eng), Chunqiang Tang et al. (Configerator/Gatekeeper, SOSP 2015). In for separating deploy from release and using employees + small traffic slices as the test stage.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Flytrap user reports + alerts | anomalies at scale | users, tooling | 100% |
| 2% production | edge cases dogfood missed | real traffic, push-blocking alerts | hours |
| Employees (dogfood) | regressions, emergency stop | all staff | first stage |
| Config validators + review + sandbox CI + canary (20 servers) | config errors | Configerator | every config change |
| Builds, Infer static analysis, unit/integration/E2E | code defects | CI | every commit |
Sources: https://engineering.fb.com/2017/08/31/web/rapid-release-at-massive-scale/ ; https://sigops.org/s/conferences/sosp/2015/current/2015-Monterey/printable/008-tang.pdf

**Q1** Every diff and config through same pipeline; config change = code change (SOSP). **Q2** Automation, employees, ~1M Android beta testers for daily mobile candidates (Rossi). **Q3** Push-blocking alerts; emergency stop button (Rossi). **Q4** Dogfood + 2% + gated cohorts (employees → 5% region → 1→10→100%) https://blog.acolyer.org/2015/10/16/holistic-configuration-management-at-facebook. **Q5** Not addressed. **Q6** Tiered rollout halts on alerts; canary compares 20 servers' error logs vs rest and auto-aborts (SOSP). **Q7** Flytrap aggregates user reports (Rossi). **Q8** Config incident taxonomy: 42% common errors, 36% subtle, 22% valid configs exposing code bugs (SOSP). **Q9** Validators encode invariants learned (SOSP). **Q10** Kill-switch rollback: flip gate off instead of revert.

**Best practices.**
1. Gatekeeper: ship code dark, enable by restraint (employee, device, country) and % sampling; turn off instead of rollback. Grade B. Driver: decoupling deploy from exposure shrinks blast radius. https://engineering.fb.com/2017/08/31/web/rapid-release-at-massive-scale/
2. Automated canary for config: caught a log spew on 20 servers and aborted an outage-scale rollout. Grade B. https://sigops.org/s/conferences/sosp/2015/current/2015-Monterey/printable/008-tang.pdf
3. Push-from-master rolled out progressively (50% employees, then 0.1→1→10% traffic); critical mobile issues stayed ~constant 2012–16 as release frequency rose. Grade B (self-reported). (Rossi)

**Failures/criticism.** Canary efficacy for slow-manifesting faults (leaks) unclear http://muratbuffalo.blogspot.com/2016/02/holistic-configuration-management-at.html ; a canary-rejected config still caused crashes in one reported incident (SOSP via https://mubashirusman.github.io/assets/papers/holistic-config-management-at-facebook.pdf).
**Quotes.** "If we do find a problem, we can simply switch the gatekeeper off rather than revert back to a previous version or fix forward." — Rossi.
*Judgment:* dogfood + flag is the most transferable layer for a tiny team; the 2% traffic stage needs volume FYTT lacks.

---

## 5. Microsoft Windows — 2014 tester elimination (negative/criticized)
**Header.** Microsoft, July 2014 layoffs (18,000), SDET role retired, developers own testing; Windows 10 "Windows as a Service" relying on self-host, Insiders, telemetry. In as a negative: removing dedicated test without compensating feedback discipline.

| Layer | Catches | Who/what | When |
|---|---|---|---|
| Telemetry + staged "seeker" rollout + ML device selection + blocks | device-specific failures | data/ML | post-release |
| Windows Insiders (feedback hub) | real-world compatibility | volunteer users | pre-release flights |
| Self-host ("aggressive") | daily-use bugs | employees | internal builds |
| Dev-owned automated tests | base function | developers | integrate-up gate |
Sources: https://blogs.windows.com/windowsexperience/2018/11/13/windows-10-quality-approach-for-a-complex-ecosystem/ ; https://blog.pragmaticengineer.com/how-microsoft-does-qa/

**Q1** Base functional tests shifted to devs; E2E team refocused (Windows blog). **Q2** Devs, employees, Insiders, partner labs (same). **Q3** Feedback Hub; severity field added only after the 2018 incident (same). **Q4** Insider rings, release preview, seekers (same). **Q5** Not addressed. **Q6** "When we are confident" + dashboards (same); no hard criterion stated. **Q7** Telemetry, support call volume, NPS, social media (same). **Q8** Public explanation and paused rollout (same). **Q9** Added severity rating to feedback; promised transparency (same). **Q10** Low-volume, high-impact signals drown in aggregate metrics.

**Best practice (what still worked).** Staged rollout + pause: Oct 2018 update pulled within days of data-loss reports — first such pull in WaaS history. Grade B. Driver: small exposure limits harm. (Windows blog)

**Failures/criticism.** October 2018 Update deleted users' Documents/Pictures; the bug had been reported in Insider feedback months earlier https://www.theverge.com/2018/10/8/17951298/microsoft-windows-10-bugs-issues-report ; Ars: testers laid off/reassigned in 2014, "This isn't the job for Insiders" https://arstechnica.com/gadgets/2018/10/microsofts-problem-isnt-shipping-windows-updates-its-developing-them ; Computerworld "Microsoft crowdsourced QA, and look what we got" https://www.computerworld.com/article/1662555/microsoft-crowdsourced-qa-and-look-what-we-got.html. Grade B.
**Quotes.** "We shifted the responsibility for base functional testing to our development teams in order to deliver higher quality code from the start." — Windows blog 2018. "the trend doesn't matter if you happen to be one of the people experiencing an issue." — same.
*Judgment:* the failure was not dev-owned testing per se but an untriaged feedback channel: user reports existed with no severity, owner, or gate.

---

## 6. Knight Capital, 1 Aug 2012 — deploy failure (negative)
**Header.** Knight Capital Americas; SMARS order router; new RLP code. SEC order 34-70694 (Oct 2013). In as canonical negative: no deploy verification, dead code, ignored warnings.

| Layer (as it existed) | Should have caught | Reality |
|---|---|---|
| Pre-trade risk controls | runaway orders | absent/inadequate (Market Access Rule violation) |
| Automated messages (BNET) | "Power Peg disabled" | 97 emails 08:01–09:30 ET, not designed as alerts, unread |
| Deployment review | 8th server missing code | manual, single technician, no second check, no written procedure |
| Regression test of legacy path | 2005 change broke Power Peg | never re-tested |
Sources: https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf ; https://www.sec.gov/newsroom/press-releases/2013-222

**Q1** Legacy code path not re-tested after 2005 refactor (SEC order). **Q2** One technician; no reviewer (same). **Q3** Warnings routed to non-alert email list (SEC press release). **Q4** No staged rollout; all 8 servers at once, manually https://www.tradersmagazine.com/departments/brokerage/the-rise-and-fall-of-knight-capital-buy-high-sell-low-rinse-and-repeat-2. **Q5** Not addressed. **Q6** No go/no-go or consistency check across servers (same). **Q7** 45 minutes of runaway trading: 4M+ executions, 397M shares from 212 orders (SEC). **Q8** Outcome: >$460M loss, $400M emergency equity for ~73% of firm, acquired by Getco, $12M SEC penalty https://www.reuters.com/article/world/americas/knight-regains-market-share-under-pressure-over-rescue-idUSBRE8750HG ; https://www.reuters.com/article/business/getco-to-buy-knight-capital-in-14-billion-deal-idUSBRE8BI0OH. **Q9** None possible: firm lost independence. **Q10** Repurposed flag reactivated dead code: dead code is live risk.

**Lessons (inverse practices).** Grade A for facts (regulator finding). (a) automated deploy with post-deploy consistency check; (b) two-person review of release; (c) delete dead code, never reuse flags; (d) every error stream classified as alert or noise; (e) kill switch / hard limits. Driver: Swiss-cheese alignment of several missing layers.
**Quotes.** "Knight did not have a second technician review this deployment and no one at Knight realized that the Power Peg code had not been removed from the eighth server" — SEC order. "Although Knight Capital did not design these messages to be system alerts, they provided an opportunity to identify and fix the problem" — SEC press release.

---

## Cluster patterns
- **Candidate invariant — layered defense, cheap/fast first, real exposure last.** All four positives run automated checks → internal users → small real slice → full release; Knight had one layer and failed (Google, Meta, Microsoft, Knight).
- **Candidate invariant — expose gradually with a stop button.** Dogfood/canary/% flags/staged rings with emergency stop or gate-off (Meta, Microsoft, Netflix blast-radius rule); its absence is the Knight story.
- **Candidate invariant — break it on purpose, regularly, in business hours, with a hypothesis.** Chaos Monkey, GameDay, DiRT, injected RPC errors (Netflix, Amazon, Google). Value comes from repetition, not one drill.
- **Candidate invariant — blameless post-mortem whose output is owned, dated action items that change the system** ("human error" → why was it possible) (Amazon COE, S3 2017; Allspaw/Krishnan).
- **Candidate invariant — every failure becomes a permanent check:** regression test (Google "Beyoncé Rule", exploratory finds automated), validator (Meta), tool guardrail (Amazon), daily chaos as regression (Netflix).
- **Candidate invariant — signals must be trusted and triaged.** Flaky tests (Google 84% of transitions), unread error emails (Knight), un-severity-tagged Insider feedback (Microsoft) all show: a signal with no owner/severity equals no signal.
- **Recurring practice — developers/agents own tests, humans kept for judgment and exploration** (Google, Microsoft); works only if feedback channels are owned (Microsoft negative).
- **Recurring practice — small changes reviewed fast by one other** (Google: ~24 lines, 1 reviewer, <4h); second-person review of deploys was the missing control at Knight.
- **Recurring practice — culture levers over mandates:** TotT, orientation, Test Certified ladder, public dashboards (Google); executive sponsor + publicize wins (Amazon).
- *Judgment:* for a tiny agent-run team with few players, the transferable core is: flags + self-dogfood before players, scripted fault injection in staging, a flake-zero rule, and a one-page COE ending in a regression test + checklist line.
