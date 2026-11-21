# LinkedIn → GoBY

Filled: 2026-11-21 · Status: draft, awaiting Sasha
Almanac stage: 6–7 (the player authors a public professional self; the graph is real people and real jobs) · Fidelity: model of reality (the profile and the graph point at real careers; what happens there, jobs and deals, happens offline)
One line: the professional social network (2003); a profile, a graph of real colleagues, and signals that tell others what you can do and what you want next. Studied for spec row A6 (see a profile, filter for useful people, write to them).
Already covered elsewhere, not repeated: written references and vouching (games/couchsurfing.md, CS-1, CS-2). The creation ladder (games/ready-player-one.md) is unaffected; LinkedIn adds nothing to who may change the game.

## 1. Why it's iconic (facts)

| Fact | Number | Source, date | Grade |
|---|---|---|---|
| Members | "over 1.3 billion members and five consecutive years of double-digit member growth" | [1] Microsoft Annual Report 2026 | B |
| Revenue | FY2026 $19,817M; FY2025 $17,812M; FY2024 $16,372M (+11% in FY2026) | [1] Microsoft Annual Report 2026 (audited filing) | B |
| The graph moves careers (causal) | PYMK experiments on 20M+ members, 2015–2019: ~2 billion new ties, 70M+ job applications, 600,000 new jobs in the experimental period | [2] Rajkumar et al., *Science* 2022 | A |
| Endorsements scale | 10 billion+ skill endorsements given 2012–2016 | [3] LinkedIn blog, 2016-10-19 (company) | C |
| Open to Work scale | ~200M members turned it on privately; ~40M showed the public frame (July 2024) | [4] Fortune, 2024-09-05, citing LinkedIn | C |

Share of the iconic credited to the mechanics below: **part**. *Judgment:* LinkedIn's moat is the network effect of a real-name professional graph plus recruiters paying for access to it. The three mechanics below are how the graph got filled (LI-1), how it was made useful (LI-2) and how intent became legible (LI-3). Recruiter monetization, the feed and Premium are outside this analysis.

## 2. Mechanics that demonstrably worked

### LI-1. Profile completeness meter that names the next missing piece and what it unlocks
- **In the source:** every member starts as *Beginner*; four sections → *Intermediate*; all seven recommended sections (photo, location, industry, education, position, skills, summary) → *All-star*. The level is **visible only to the owner**; once All-star, the meter disappears. Each prompt sits under the meter as a card; LinkedIn ties completion to discoverability ("improve the discoverability of your profile in search results") [5]. In 2012 LinkedIn reweighted the score toward things the member controls (skills) and away from things they don't (recommendations), and added freshness [6].
- **Evidence it worked:** LinkedIn designer's portfolio: the redesigned meter, which "ties progress to actionable cards", "increased profile completion by over 100%" [7] (**C**, self-reported, no base, no date). LinkedIn: members with complete profiles are "40x more likely to receive opportunities through LinkedIn" [8] (**C**, correlational: complete profiles belong to more active members). The widely repeated "+55% completion" figure has no primary source I could find; **not used**.
- **What it did NOT prove:** that complete profiles *cause* opportunities; the 40x is selection, not effect.
- **Driver:** the endowed progress effect. Car-wash field experiment, 300 cards: a 10-stamp card with 2 stamps given redeemed **34% vs 19%** for an empty 8-stamp card, same 8 washes required, and customers came back 2.9 days faster [9] (**A**, one field study). The effect depends on the task feeling *already begun* and on the reason given for the head start [9]. Second driver: the next step is named with its payoff (being found), so the bar points at a real outcome, not at itself.

### LI-2. Mutual connections and the 2nd-degree path (warm introductions)
- **In the source:** every profile shows your degree to the person (1st/2nd/3rd) and the people you both know; "People You May Know" (PYMK) recommends ties, with the number of mutual connections "one of the most important features" of the model [2].
- **Evidence it worked (grade A, randomized):** LinkedIn randomly varied how many weak vs strong ties PYMK recommended to 20M+ members (2015: 4M subjects, 19M new connections; 2019: 16M subjects, ~2B new connections, 600k jobs). Findings [2]: (1) adding **moderately weak ties** (structurally: about **10 mutual connections**; above ~10 the effect fell) caused the most job transmissions, an inverted U; (2) by interaction intensity, the *least*-interacted ties helped most; (3) correlational analysis showed the opposite (strong ties looked best), so only the experiment reveals it; (4) the effect was stronger in digital industries.
- **What it did NOT prove:** effects on clients or sales (it measured job moves); generalization is to slightly younger, more active job seekers; LinkedIn skews to tech, finance and professional services [2]. Two authors were LinkedIn employees [2].
- **Driver:** strength of weak ties: acquaintances bridge to parts of the network you can't see, so they carry new information [2]. A shown mutual contact turns a stranger into "a friend of Ana's".

### LI-3. Open to Work: a public, time-bound statement of what you are looking for
- **In the source:** launched June 2020; the member picks what they want (titles, location, start date, job type) and shows it either privately to recruiters or publicly as a green photo frame; recruiters can filter by it [10].
- **Evidence:** LinkedIn: public-frame members get on average **40% more recruiter InMails** and are **20% more likely to receive messages from their community**; turning the feature on doubles the likelihood of a recruiter message [10][11] (**C**, company data, observational; LinkedIn News later said the frame was "the only variable" in the comparison, still unaudited). No data on hires.
- **What it did NOT prove, and the cost:** that it leads to jobs. Recruiters told Fortune the public frame can look "desperate" and invite lowball offers, the longer it stays up the worse [4]; ~5x more members choose the private setting than the public one (200M vs 40M) [4].
- **Driver:** people **underestimate by as much as 50%** how likely others are to agree to a direct request for help [12] (**A**, lab and field). A visible ask lowers the cost of helping: helpers now know what to send.

### Dropped (one line each)
- **"Who viewed your profile":** a vanity counter that mirrors no act by the player and is LinkedIn's Premium upsell hook; fails Sasha's counter rule and §14.7 (nothing about others' looking is shown).
- **One-click skill endorsements:** no relation to measured skill (interviewing.io: no correlation with interview scores; most-endorsed language matched the language people actually code in under 50% of the time) [13]; 388 Bangladeshi employers: endorsements had no significant effect on hiring preference, written recommendations did [14]; LinkedIn itself re-ranked them in 2016 to show endorsements from colleagues first [3]. A one-click count fails the counter rule; the written form is CS-2.
- **Contact import / "Add Connections" growth loop:** LinkedIn paid a **$13M settlement** (Perkins v. LinkedIn, approved 2016-02-16) over reminder emails sent in members' names to their address books [15]. Sending in someone's name fails rule 2 and Sasha's own rule that he writes his messages himself.
- **The 2012 "50+ connections" completeness criterion** [6]: a count as a goal; fails the counter rule.

## 3. Canon filter

| Check | LI-1 Completeness → what it unlocks | LI-2 Mutual connections / warm intro | LI-3 "Open to" |
|---|---|---|---|
| §10a fidelity: shows something true? | **Pass with change:** each missing piece is a real fact about the player (talent, mission, offer); no % | **Pass:** who you both actually know | **Pass with change:** a real current intention, which expires so it stays true |
| §21.2 real-life counterpart | "Finish your stall before market day" | A friend of a friend; asking for an introduction | The "open" sign on a shop door; telling the village you're looking for X |
| Sasha's counter rule | A % or "7 of 10" bar fails; a named next piece passes | "2nd degree" is a fact (one real person between you); a connection *count* fails | No counts ("12 people saw your sign") |
| Rule 2: real person, real act | the act is the Journey step itself | the intro is asked of, and made by, a real person; the player writes their own message | the player says it; others act in real life |
| §15.8 new facet / verb | not new: same facet as the House's faded rooms; new only in naming *who can find you* | new verb: **ask someone you both know to introduce you** | new facet: **what you want now** (the canon has who you are and what you sell) |
| Design rule (uniqueness, no artificial points) | no level labels like "All-star" (a status ladder, §13.2) | no "500+" or network size anywhere | — |
| Already in canon? | **Mostly yes:** §14.3 lock rule ("Opens when… Inside: …"), §14.7 q6 faded rooms with the next one glowing, §14.12 the stall that assembles itself, §13.3 "Profile complete → Café opens: matching", §14.13 matches locked until talent+mission+assets "so the first 10 introductions carry enough signal" | **Partly:** A6 directory has 7 filters (pillar, focus, challenge, outcome, mission, location, archetype) and Connect (`connections` table: pending/accepted); matches use double opt-in intros (`MatchCard`, "mutual" state). **Missing:** any view of who you both know | **No.** §14.12 stall shows what you sell; nothing says what you are *looking for* now |

Verdicts: **LI-1 pass with change, mostly canon** (add one thing: the next piece names which filter or which people can't find you yet; never a % or a level name). **LI-2 pass** (Couchsurfing's vouching CS-1 is the trust layer on top; LI-2 is the structure underneath, and the CS file already found local ties beat global scores). **LI-3 pass with change** (expires; private option; worded as an invitation, not a plea).

## 4. Where it lands

| Mechanic | Village place (§13.1) | Journey step (§14.2) | Spec row | New row needed? |
|---|---|---|---|---|
| LI-1 "Findable by…" line | Your House + Co-working | J1–J7 (pieces that feed the directory and stall) | **A6** (directory/profile) + **A12** (faint badges already show what's missing) | No: attach to A6; copy-level change to existing House/stall states |
| LI-2 Mutual connections + ask for an intro | Co-working (`/game/collaborate/people`), profile `/profile/:id` | after J1 (any player with one accepted connection) | **A6** | Attach to A6 as filter #8 + a profile line; the intro request rides on A6 writing (#356) |
| LI-3 "Open to" | Market (stall) + Co-working | after J7 (stall visible) for "clients"; after J1–J5 for "collaborators" | **A6** (filter) + **A7** (clients) | Attach to A6; public-facing → needs Sasha's **Yes** |

Ladder note: none of the three is a creation right; they sit beside the Ready Player One ladder, not on it.

## 5. Our version

**LI-1.** No meter, no percent, no "All-star". Each faded room in Your House and each missing stall part already says "Opens when… Inside: …" (§14.3). We add one clause about people: «Until you name your mission, people filtering by mission in Co-working can't find you.» The pieces that feed directory filters (talent → archetype filter, mission → pillar/focus/challenge/outcome/mission filters, location → location filter) each carry that line. The head start is real, never faked: J1 (the reveal) is the stamp the player already has when the House first opens, so the House should open on «your talent is already carved on the post» before showing what's missing. Owner-only, like LinkedIn's level and like §14.7.

**LI-2.** On any profile: «You both know: Ana, Leo» (faces + names, people you have an *accepted* connection with; no degree numbers, no counts). In the directory, an 8th filter: **"Someone I know knows them"**. On the profile, one button: **"Ask Ana to introduce you"**: it opens a message *to Ana*, which the player writes themselves (a starter line they can edit: who, and why this person); Ana decides whether to introduce, and the introduction runs through the same double opt-in as matches. Suggestions favor people with a few mutuals over the densest cluster, and people from another village (§21.3: a person in Ubud finds a person in San Pancho), because moderately weak, low-interaction ties moved people most [2]. Composes with CS-1: "someone you know stands for them" is the stronger filter once vouching exists.

**LI-3.** On the stall or profile, one line chosen from a short list: **Open to: clients · collaborators · a teacher · a co-founder · a place to stay/work**, plus one free sentence ("Looking for two first clients for somatic sessions in December"). It **expires after 30 days** unless renewed, so the sign is always true. Two visibilities, like LinkedIn: everyone, or only matching (Hark uses it to suggest people; nobody sees a sign). In Co-working it becomes a filter ("open to collaborators"). Wording is an invitation, never "looking for work": the canon frame is a gift offered, not a need displayed. No counters of who saw it.

## 6. Smallest testable version

- **LI-2 first (highest score).** *What:* no code; for 10 players in Sasha's circle, Hark lists their mutual accepted connections and shows each the "You both know" line on mock profiles; each may ask one mutual for one introduction, writing it themselves. *Signal:* share of intro requests that lead to a real conversation within 2 weeks, vs cold "Connect" requests in the same period. *Kill line:* intro requests convert no better than cold Connect, or players won't ask (fewer than 3 of 10 send one) → drop the button, keep the "You both know" line. *Depends on:* accepted connections existing between players (the `connections` table); A6 writing #356 for the built version.
- **LI-3.** *What:* a form; 10 San Pancho practitioners write one "Open to…" line; Hark pins them on their stalls/profiles for 30 days. *Signal:* messages or intro requests that reference the line. *Kill line:* none in 30 days, or practitioners feel exposed → keep only the private (matching-only) mode. *Depends on:* Sasha's yes (public-facing); A7 clients list (#360) to see whether a client came through it.
- **LI-1.** *What:* copy only: add the "people filtering by X can't find you yet" clause to the existing faded-room lines for J1, J2, J5. *Signal:* completion of J2/J5 among players who reached the House, before vs after. *Kill line:* no change in completion → revert the copy. *Depends on:* nothing new; core flows rule applies if it touches the House copy Sasha guards.

## 7. Risks and anti-patterns

- **Vanity metrics creep:** connection counts, "500+", profile views, endorsement tallies. LinkedIn has all four; none enters GoBY.
- **Spam growth loops:** contact import and reminders sent in a member's name cost LinkedIn $13M [15]. GoBY never writes to anyone on a player's behalf; every intro request is written by the player and sent to one named person.
- **Status ladder:** "All-star" is a public-feeling rank even though it's private. No level names.
- **Desperation signal:** the public Open to Work frame can read as need and invite lowballing [4]. Expiry, invitation wording, private mode.
- **Small-village saturation:** in a village of 30, everyone is 2nd degree, so the mutuals line says little; it matters across villages. Show it, but rank cross-village bridges first.
- **Introducer fatigue:** a well-connected villager (Sasha first) gets every request. Cap open requests per introducer and let them decline silently.
- **Evidence transfer:** LI-2 is proven for job moves on LinkedIn, not for clients in a village; the test above measures our outcome.

## 8. Priority

- **LI-2** Mutual connections + warm intro: Impact 3 × Confidence 3 (A, randomized, 20M) × Ease 2 (data exists; needs #356 and a filter) = **18 → High**.
- **LI-3** "Open to": Impact 2 × Confidence 2 (mechanic evidence C only, large-n; driver A) × Ease 3 (one field, one filter, expiry) = **12 → Medium**. Not High: C evidence alone can't carry High (template rule 1).
- **LI-1** "Findable by…" line: Impact 1 (canon already does most of it) × Confidence 2 (meter C, driver A) × Ease 3 (copy only) = **6 → Low**.

Priority is a recommendation. Sasha sets the order.

## 9. Sources (read 2026-11-21)

1. Microsoft Annual Report 2026 (members, LinkedIn revenue FY2024–FY2026): https://www.microsoft.com/investor/reports/ar26/index.html
2. Rajkumar, Saint-Jacques, Bojinov, Brynjolfsson, Aral, "A causal test of the strength of weak ties", *Science* 377(6612):1304–1310, 2022-09-16: https://ide.mit.edu/wp-content/uploads/2022/09/abl4476.pdf (DOI 10.1126/science.abl4476)
3. LinkedIn Blog, Y. Yeh, "Rethinking Endorsements So You Always Look Your Best", 2016-10-19: https://www.linkedin.com/blog/member/product/rethinking-endorsements-linkedin-features
4. Fortune, O. R. Royle, "40 million people are using LinkedIn's #OpenToWork badge right now—but recruiters say it can look desperate", 2024-09-05: https://fortune.com/2024/09/05/linkedin-opentowork-badge-recruiters-job-search
5. LinkedIn Help, "Use the profile level meter to update your profile" (accessed 2026-11-21): https://www.linkedin.com/help/linkedin/answer/a594698
6. LinkedIn Blog, A. Bronzan, "Simple steps to a complete LinkedIn Profile", 2012-02-14: https://www.linkedin.com/blog/member/archive/profile-completeness
7. S. Freedman (LinkedIn UX designer), "LinkedIn • Profile Completion" portfolio case study (undated, ~2016): http://www.samanthafreedman.com/profile-completion
8. LinkedIn Premium, "Job Seeker Premium Playbook" (PDF, undated; "40x more likely to receive opportunities"): https://premium.linkedin.com/content/dam/premium/jobsearch/PDFAssets/JSS_Playbook.pdf (read via search excerpt; the claim is repeated across LinkedIn materials)
9. Nunes & Drèze, "The Endowed Progress Effect: How Artificial Advancement Increases Effort", *J. Consumer Research* 32(4):504–512, 2006: https://www.xdreze.org/Publications/PSC.pdf
10. LinkedIn Blog, R. Rajiv, "To Find Your Next Job More Quickly, Tell Your Community You're Open to Work", 2020-10-29: https://www.linkedin.com/blog/member/product/the-benefits-of-sharing-with-your-community-you-re-open-to-work
11. LinkedIn Blog, T. Cohen, "How LinkedIn is Helping Millions of People Get Back to Work", 2020-10-28: https://www.linkedin.com/blog/member/product/how-linkedin-is-helping-millions-of-people-get-back-to-work (read via search excerpt)
12. Flynn & Lake (Bohns), "If you need help, just ask: Underestimating compliance with direct requests for help", *JPSP* 95(1):128–143, 2008: https://psycnet.apa.org/record/2008-08084-009
13. A. Lerner, interviewing.io, "LinkedIn endorsements are dumb. Here's the data.", 2017-02-27: https://interviewing.io/blog/linkedin-endorsements-useless
14. Hosain & Mamun, "The roles of LinkedIn-based skill endorsements and LinkedIn-based hiring recommendations on hiring preferences", *Management Matters* 20(2):169–184, 2023-10-31 (survey, n=388): https://www.emerald.com/insight/content/doi/10.1108/manm-05-2023-0021/full/html
15. Bloomberg Law, "LinkedIn $13M E-Mail Class Settlement Approved" (Perkins v. LinkedIn, N.D. Cal. 5:13-cv-04303), 2016-02-17: https://news.bloomberglaw.com/tech-and-telecom-law/linkedin-13m-e-mail-class-settlement-approved ; settlement notice: https://www.courtlistener.com/docket/4180340/106/2/perkins-v-linkedin-corporation
16. Rui, "Objective evaluation or collective self-presentation: What people expect of LinkedIn recommendations", *Computers in Human Behavior* 89:121–128, 2018 (N=156; reciprocal recommendations read more negatively; supports CS-2's "both written before either is shown"): https://dl.acm.org/doi/10.1016/j.chb.2018.07.025
