# Facebook → GoBY

Filled: 2026-11-21 · Status: draft, awaiting Sasha
Almanac stage: 5–6 (players author their profile, their ties, their groups; the graph is real people, the activity is mostly on screen) · Fidelity: identity = reality (real names, real campuses); activity = symbol (likes, feed)
One line: a social network that started as a closed, real-name directory of one campus (Harvard, Feb 2004), opened one campus at a time, and later grew Groups (communities with their own hosts) and Events. What made it cult is not what made it harmful; this file separates the two.

Scope note: trust between strangers is in [couchsurfing.md](couchsurfing.md) (CS-1, CS-2); in-person gatherings unlocked by presence are in [pokemon-go-ingress.md](pokemon-go-ingress.md) (PG-2); the creation ladder is in [ready-player-one.md](ready-player-one.md) (RPO-2). This file adds only what those do not cover.

## 1. Why it's cult (facts)

| Fact | Number | Source, date | Grade |
|---|---|---|---|
| Launch and first days | launched Wed Feb 4, 2004; "over 650 students" registered by Sun Feb 8; Zuckerberg expected 900 by the next day | [1] Harvard Crimson, 2004-02-09 | B |
| Two weeks in | "about 650 members early last week" → "over 4,300 student, alumni and faculty subscribers" | [2] Harvard Crimson, 2004-02-18 | B |
| Saturation, then the next campus | by June 2004: 34 campuses (all 8 Ivies), 150,000+ members, profiles for "over 90 percent of the undergraduate student body" at Harvard; each school a separate network: you see only your school plus confirmed friends elsewhere | [3] Harvard Crimson, 2004-06-10 | B |
| Activation rule | "Get any individual to seven friends in 10 days. That was it… our keystone"; framed as getting a new user "into a network, to find density" | [4] Palihapitiya talk, transcript (talk 2013) | C (a talk; correlational; Facebook never published the analysis) |
| Why people joined and stayed | 54 million invitation e-mails (Jul–Sep 2010) and ~10 million 2010 sign-ups: joining and 3-month engagement were predicted by the number of distinct social contexts among friends already there, not by their count; users with no strong context at week 1 were much less engaged | [5] Ugander et al., PNAS 2012 | A (full-platform data, observational) |
| Groups | "More than 1 billion people" use Groups; "more than 100 million" in "meaningful groups" (2017) → "almost 1.8 billion people use Facebook Groups every month", 25 million monthly active public groups (Oct 2024) | [6] Meta, 2017-06-22; [7] Meta, 2024-10-04 | B (platform's own stats) |
| Group hosts | 70 million people active in the past month as admins/moderators; median size of people's "most important" group 25–100; 38% named local-tied groups as giving "quite a bit or a great deal of belonging"; hosting is "a unpaid labor of love" | [8] GovLab/NYU report (Facebook-funded, YouGov survey 15×1,000), 2021-02-23 | C (company-funded survey) |

Share of the cult this analysis credits to the mechanics below: **large for FB-1, part for FB-2, small but decisive as a warning for FB-3.** *Judgment:* the first year of Facebook is FB-1 almost alone (a closed real-name map of people you already know, campus by campus); Groups (FB-2) is what kept people after 2017 when Facebook itself turned to it; the feed and Like (rejected below) drove time spent, not the cult.

## 2. Mechanics that demonstrably worked

### FB-1. Density before breadth: one closed, real-name village at a time
- **In the source:** only a harvard.edu address could join; profiles under real names, searchable by course, House and club [1][3]. Each new school opened as its own closed network; you saw your school and confirmed friends at others [3]. Later, the growth team reduced the whole funnel to one rule: get each newcomer to 7 friends in their first 10 days, i.e. into a dense network fast [4].
- **Evidence it worked:** 650 → 4,300 in two weeks, >90% of Harvard undergrads in four months, 34 campuses opened in sequence [1][2][3] (B). Full-platform study [5] (A): the chance to join and to stay engaged rises with the number of **separate real circles** a person already has on the site; once that is controlled for, more contacts from one circle even predicts slightly *less* joining. The "7 in 10" rule itself is C: reported in a talk, never published, and correlational (people who'd love it anyway add friends faster).
- **What it did NOT prove:** that 7 or 10 are magic (they are a round threshold from cohort analysis [4]); that density works without real names (the campus networks had both, so the two are not separable).
- **Driver:** local network effect (the product is worth as much as the share of *your* people already in it); structural diversity: being met from several of your circles at once [5]; real names make the map trustworthy.

### FB-2. Players host their own circles (Groups) with real gatherings (Events)
- **In the source:** any member can create a group, becomes its admin, gets host tools (welcome posts, member screening, scheduled posts, insights) [6]; groups announce events people RSVP to. Facebook's 2017 mission change was built on this: "give people the power to build community", with the host named "real community leaders" [6].
- **Evidence it worked:** 1B+ (2017) → ~1.8B (2024) monthly users of Groups, 25M active public groups [6][7] (B). 70M active hosts; the most important group is small (median 25–100); local groups give belonging to 38% [8] (C). Zuckerberg on such groups: "These communities don't just interact online. They hold get-togethers, organize dinners" [9] (C, CEO letter).
- **What it did NOT prove:** that groups make people better off. Facebook's own "meaningful group" was defined by time spent (reported as 30+ minutes a week in the group [10], press report, page not opened); no causal study of group membership and well-being found. Hosts are unpaid and depend on the platform [8].
- **Driver:** authorship and ownership (the host built the place); belonging in a small group of people who share one real thing; the gathering gives the group a reason to meet in the flesh.

### FB-3. Words written to one person beat a one-click Like (and the feed)
- **In the source:** a Facebook user receives three kinds of signal: composed, targeted words (a comment, wall post, message), one-click feedback (Like, poke), and broadcasts in the News Feed.
- **Evidence:** Burke & Kraut 2016 [11] (B: 1,910 users, three monthly waves, activity read from server logs, observational): well-being rose with **composed words from close ties** (β=0.02, p=0.04); one-click feedback showed nothing (β≈0.00, p=0.86); viewing broadcasts showed nothing (β=−0.02, p=0.10). Strong-tie communication's effect was the same size as an illness, in the opposite direction. Feed harms, causal (A): Allcott et al. 2020 [12], randomized, 2,743 recruited: 4 weeks off Facebook freed 60 min/day, moved time to offline life incl. friends and family, raised subjective well-being by 0.09 SD (25–40% of a therapy effect), and cut later use by 12 min/day (23%). Hunt et al. 2018 [13], randomized, 143 students: 10 min per platform per day for 3 weeks cut loneliness and depression vs. control.
- **What it did NOT prove:** Burke & Kraut is a Facebook-run observational panel, older and heavier users; Hunt is small and short. Together they point the same way.
- **Driver:** relational investment (effort is the signal that someone cares) and social support from strong ties [11]; the feed replaces in-person time [12].

## 3. Canon filter

| Check | FB-1 Density first | FB-2 Player-hosted circles | FB-3 Words, not Likes |
|---|---|---|---|
| §10a fidelity: shows something true? | **Pass:** who in your real village is here | **Pass:** a circle that actually met | **Pass:** a sentence a real person wrote to you |
| §21.2 real counterpart | the village itself (San Pancho, §16) | a real circle (a breathwork group, a run club, a teachers' table) | a note from a neighbor |
| Standing rule: counters mirror real acts | Pass only as an **internal** metric (villagers met, circles); never a friend count on screen | "came" counted only when the host confirms people were there; never RSVP or "interested" | a Like count fails by definition; composed answers are traces, not numbers |
| Standing rule: real person behind every avatar | **Core:** real name, real village | host and members real | sender named |
| No raid / battle vocabulary | — | "circle", "gathering" | — |
| §15.8 new facet / verb | new rule for the **world map**: a village opens when the last one is dense | **new verb:** *host a circle* | no new verb; a design ban |
| Already in canon? | **Partly:** §16 (San Pancho = Village #1), §16.5 ("copied to a second village (Sayulita)"), §22.11 (land-based communities), §22.13 [SUGGESTION] (10 practitioners first). **Missing:** the gate (when the next village opens) and the newcomer's first-10-days target | **Partly:** §21.3 ("any player can found a new village"), §16.3 rule 3 (Sasha's full-moon circle), RPO-2 rung 3 ("your own building / module… a circle"). **Missing:** what a circle *is* in the game and what proves it real | **Mostly:** §14.12a ("a trace, never a count or score"), §10 point 8 (no QoL leaderboard), CS-2 (references). **Missing:** the rule stated for A6 as a whole |

Verdicts: **FB-1 pass with change** (density gate and first-10-days target are ours; the number is internal, not a screen counter). **FB-2 pass with change** (count attendance, never RSVPs; small circles; tie it to the ladder). **FB-3 pass as a design rule** (adopt the composed reply; reject Like and feed).

### Rejected (one line each)
- **Like button / reaction counts:** fails rule 1 (a number not mirroring a real act) and showed no well-being effect [11].
- **Infinite News Feed as the home surface:** fails §21.1 north star ("the game helps you be in real life, not escape into the digital"); causal harm [12][13].
- **Friend count on profiles:** a vanity number; fails rule 1.
- **"Meaningful = minutes spent"** as a success metric [10]: time on screen is the opposite of our metric (§22.10 income through the platform).
- **"7 friends in 10 days" as a player-facing counter:** a nudge to collect connections; kept only as an internal metric with "met in real life" as the unit (FB-1).
- **RSVP / "interested" as proof of a gathering:** a click, not presence; folded into FB-2 as "attended only".

## 4. Where it lands in our game

| Mechanic | Village place (§13.1) | Journey step (§14.2) | Spec row | New row needed? |
|---|---|---|---|---|
| FB-1 | the World map (§21.3) and Reception (arrival) | J0–J1 (arrival), first 10 days after J1 | **A11** (gate for the next village) + **A3** (onboarding: first real people) | No: add to A11's and A3's "done when". A11 is marked Yes (public) |
| FB-2 | Fire Circle (a circle per host) and Café (where gatherings are listed) | after J7 (has a stall) or after J9 (was in a Mastermind circle) | **A11** + **A6**; it is the first form of **RPO-2 rung 3** | No new row; attach to A11 and the ladder. Public-facing → Sasha's yes |
| FB-3 | Café / Co-working (writing to people) | J7 onward (others can see you) | **A6** (writing, issue #356); consistent with §14.12a | No: one line in A6's "done when" |

## 5. Our version

**FB-1. A village opens when the last one is dense.** San Pancho stays the only village on the map until it is dense: a share of its real practitioners (the ~1 in 5 wellness listings of §16.1) have claimed their stall and met each other. The threshold is Sasha's to set; Sayulita (§16.5) does not open before it. Inside the village, the first 10 days of a new villager have one aim: meet real villagers from **at least two different circles** (a teacher from the Academy, a neighbor from the Market), because two circles predict staying better than five people from one [5]. The game shows those people as faces with one line on where you met; the count lives only in our metric. Real name and real photo are the entry ticket, as Facebook's harvard.edu was.

**FB-2. Host a circle.** A villager who has passed a real milestone (a stall at J7, or a season in Sasha's Mastermind at J9) can open a circle: a name, one sentence on the shared real thing, a place on the village map, and the next gathering on the moon clock (A9). A circle is small by design (the median "most important" group is 25–100 [8]). The host confirms who came; only "came" counts, and it shows as faces, not a number. A circle that has met in the flesh three times becomes a lit building in the village, which is rung 3 of the creation ladder (RPO-2): a player has changed the world. Sasha's full-moon Harvest (PG-2) stays the village-wide gathering; player circles are the many small fires around it.

**FB-3. One line back, never a Like.** Nowhere in the game is there a Like, a reaction count, or an endless feed. When a villager responds to another (a stall, a gift sentence, a circle), they write one line to that person, as in §14.12a; it lands as a trace on the receiver's Quest Board. The Village screen shows what is next for you and who is near, not a stream of others' posts.

## 6. Smallest testable version

**FB-1**
- **What:** no code. In the §22.13 pilot, Sasha introduces each new villager in person to 3 villagers from 2 different circles within their first 10 days; Hark keeps a private sheet of who met whom.
- **Who:** the San Pancho pilot (~10 practitioners and the clients they bring).
- **Signal:** share still active at day 30 (one real act: a session given, a reveal sent, a stall edit) among those who met 2+ circles vs. those who met one or none.
- **Kill line:** no difference → drop the 10-day target; keep the density gate.
- **Depends on:** A11 pilot; Sasha's threshold for "dense".

**FB-2**
- **What:** no code. Ask 2–3 pilot practitioners to host one small circle each around the next moon; announce it on the existing Café page; host reports who came.
- **Signal:** a circle meets a second time without Sasha's push.
- **Kill line:** no circle meets twice → park FB-2 until there are more villagers.
- **Depends on:** A6 writing (#356) for later invites; Sasha's yes (public-facing).

**FB-3**
- **What:** a check, not a build: confirm A6 (#356) ships with written replies only; no reaction buttons anywhere.
- **Signal:** share of received lines that get a written answer (a conversation started).
- **Kill line:** none needed; it is a ban. Revisit only if Sasha wants reactions.

## 7. Risks and anti-patterns
- **Engagement as the goal.** Facebook defined "meaningful" by minutes [10]; deactivation raised well-being [12]. Our metric stays income through the platform and real acts (§22.10), never time in app.
- **Dead circles.** Hosting is unpaid labor [8]; a circle that never meets is the "unfinished work" risk of RPO-2. Open the right to host only after a real milestone, and light the building only after real meetings.
- **Density as exclusion.** A closed village can feel like a club. Every local is welcome (§22.9 entry rule); the gate closes the *next village*, not the door.
- **Real-name pressure.** Real names exposed Harvard students to public judgment [3]. Level and QoL stay owner-only (§14.12a).
- **Counting connections.** The first-10-days target must never appear as "3/7 friends". Faces and where you met, nothing else.

## 8. Priority
- **FB-1:** Impact 3 × Confidence 2 (B rollout data, A on the driver, C on "7 in 10") × Ease 3 (a sequencing rule and a pilot practice; no code) = **18 → High**.
- **FB-2:** Impact 3 × Confidence 2 (B scale, C on meaning) × Ease 2 (needs #356 and a circle object) = **12 → Medium**.
- **FB-3:** Impact 2 × Confidence 3 (A harms of feed, B on composed words) × Ease 3 (a ban; nothing to build) = **18 → High**.
Priority is a recommendation. Sasha sets the order.

Proposed registry rows (not written to registry.md; for whoever updates it):
| ID | Mechanic | Driver | Evidence | Place | Spec row | Priority | Status |
|---|---|---|---|---|---|---|---|
| FB-1 | Density before breadth: next village opens when the last is dense; newcomer meets 2+ real circles in 10 days | local network effect; structural diversity | B (Crimson 2004) + A driver (PNAS 2012, 54M invites) + C ("7 in 10") | World map, Reception · J0–J1 | A11 + A3 | High (18) | analysed |
| FB-2 | Players host small circles with real gatherings; only "came" counts | authorship; small-group belonging | B (1.8B Groups) + C (GovLab) | Fire Circle, Café · after J7/J9 | A11 + A6; RPO-2 rung 3 | Medium (12) | analysed |
| FB-3 | One written line to a person, never a Like or a feed | relational investment; strong-tie support | B (Burke & Kraut) + A (Allcott RCT, Hunt RCT) | Café, Co-working · J7+ | A6 (#356) | High (18) | analysed (mostly canon §14.12a) |
| FB-x | Like button, News Feed, friend count, minutes-as-meaning | — | A (harm) | — | — | — | dropped: fail rule 1 / north star |

## 9. Sources (read 2026-11-21)
1. Harvard Crimson, "Hundreds Register for New Facebook Website", 2004-02-09: https://www.thecrimson.com/article/2004/2/9/hundreds-register-for-new-facebook-website (search excerpt; figures match [2])
2. Harvard Crimson, "Harvard Bonds on Facebook Website", 2004-02-18: https://www.thecrimson.com/article/2004/2/18/harvard-bonds-on-facebook-website-harvard (search excerpt)
3. Harvard Crimson, "Internet Boosts Social Scene", 2004-06-10: https://www.thecrimson.com/article/2004/6/10/internet-boosts-social-scene-the-internet (opened)
4. Chamath Palihapitiya, "How we put Facebook on the path to 1 billion users" (talk, transcript on Genius): https://genius.com/Chamath-palihapitiya-how-we-put-facebook-on-the-path-to-1-billion-users-annotated (opened)
5. Ugander, Backstrom, Marlow, Kleinberg, "Structural diversity in social contagion", PNAS 109(16), 2012: https://pmc.ncbi.nlm.nih.gov/articles/PMC3341012 (opened)
6. Meta Newsroom, "Our First Communities Summit and New Tools For Group Admins", 2017-06-22: https://about.fb.com/news/2017/06/our-first-communities-summit-and-new-tools-for-group-admins/ (opened)
7. Meta Newsroom, "Introducing New Facebook Local Tab, Messenger Communities…", 2024-10-04: https://about.fb.com/news/2024/10/facebook-local-tab-messenger-communities-ai (opened)
8. The GovLab (NYU), "The Power of Virtual Communities", 2021-02-23, executive summary and slide deck: https://virtual-communities.thegovlab.org/executive-summary ; https://virtual-communities.thegovlab.org/files/presentation_virtual_communities.pdf (opened; funded by Facebook)
9. Mark Zuckerberg, "Building Global Community", 2017-02-16 (copy): https://www.astrid-online.it/static/upload/zuck/zuckerberg_facebook_16_2_17.pdf (search excerpt)
10. AP, "Facebook wants to nudge you into 'meaningful' online groups", 2017-06-22: https://apnews.com/general-news-713f8f66e88b45828fd62b1693652ee7 ; WARC, 2017-06-26: https://www.warc.com/newsandopinion/news/facebook-unveils-new-mission-statement/en-gb/38874 (search excerpts only; page did not load: treat the 30-minute definition as unverified)
11. Burke & Kraut, "The Relationship Between Facebook Use and Well-Being Depends on Communication Type and Tie Strength", J. Computer-Mediated Communication 21(4), 2016: https://thoughtcrumbs.com/publications/burke_kraut_jcmc_2016.pdf (opened, pre-review version; tables match the published paper)
12. Allcott, Braghieri, Eichmeyer, Gentzkow, "The Welfare Effects of Social Media", American Economic Review 110(3), 2020: https://www.aeaweb.org/articles?id=10.1257%2Faer.20190658 ; full text read at https://web.stanford.edu/~gentzkow/research/facebook.pdf (opened)
13. Hunt, Marx, Lipson, Young, "No More FOMO: Limiting Social Media Decreases Loneliness and Depression", J. Social and Clinical Psychology 37(10), 2018: https://guilfordjournals.com/doi/10.1521/jscp.2018.37.10.751 (abstract read in search excerpt; full text not opened; Penn Today release 2018-11-08 agrees: https://penntoday.upenn.edu/news/social-media-use-increases-depression-and-loneliness)

Not used: "700 million people use Facebook Events each month" (Meta business page behind a login; could not open it).
