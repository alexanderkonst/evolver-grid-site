# Couchsurfing → GoBY

Filled: 2026-11-21 · Status: draft (worked example of template v1), awaiting Sasha
Almanac stage: 7–8 (real life is the game state: you let a stranger sleep in your home; a shared reality across cities) · Fidelity: reality
One line: a hospitality network (2004) where strangers host travelers for free; trust between strangers came from verification, references and **vouching**. Sasha's pick: vouching.

## 1. Why it's cult (facts)

| Fact | Number | Source, date | Grade |
|---|---|---|---|
| Founded | June 12, 2004; ~6,000 members by end of 2004; 45,000 in 2005 | [5] Inverse, 2021 | B |
| Growth | crossed 1M members early 2009 | [1] Lauterbach et al. 2009 | B |
| Full network studied | 666,541 users, 1,541,398 connections (early 2008 dataset from Couchsurfing) | [1] | A |
| Generalized reciprocity | active members both surf and host in near-equal measure (correlation 0.779); ~1/3 of those who surfed sit in one giant connected component: you can hop couch to couch across the globe | [1] | A |
| Trust held | only 0.17% of references negative (one week, April 2009) | [1] citing site stats | B |
| Today | company claims 25M+ registered members in 200,000+ cities | [6] Couchsurfing press page, 2026-08-11 (company claim) | C |

Share of the cult credited to the mechanics below: **large**. *Judgment:* the product is trust between strangers; the reputation system (verification, references, vouching) is what made it possible [1].

## 2. Mechanics that demonstrably worked

### M1. Vouching: a scarce right to say "I trust this person"
- **In the source:** you could vouch for someone only after three vouched members vouched for you; Couchsurfing told members to vouch only for people they had met in person and trusted, "We take it VERY SERIOUSLY" [1].
- **Evidence it worked (grade A, on the full 2008 network [1]):** 6.8% of users were vouched; 1.8% could vouch; of those, 9,133 used the right, 15.07 vouches each on average. 25.9% of vouchable connections were vouched. Best friends vouched each other in 60.7% of cases, acquaintances in 0.38%: the signal tracked real closeness. Among very active members (10+ friends) 95% were vouched.
- **What it did NOT prove, and why it ended:** vouches were reciprocated 74.6% of the time; in Paris 80% of same-city vouches were between people who met at meetups, and members complained this inflated trust [1]. In a survey only 8% felt pressured to return a vouch [2]. Global trust scores (PageRank over vouches) predicted almost nothing (50.6%, coin flip); closeness of the tie predicted best [1]. Couchsurfing **removed vouching in Nov 2014** in its platform rebuild, keeping references as "the primary way to endorse" [3].
- **Driver:** costly, scarce signal from someone who met you (signaling); a circle of trust you are admitted into (belonging); local trust beats global scores [1].

### M2. References after a real stay
- **In the source:** after hosting or surfing, both sides leave a public reference: positive / neutral / negative + text [1]. It survived the 2014 rebuild [3] and is still the core today [4].
- **Evidence:** grade **B** (survived 20+ years; near-zero negatives also show pressure against honest negatives [1]).
- **Driver:** reputation tied to a real interaction; fear of a bad reference keeps both sides honest [1].

## 3. Canon filter

| Check | M1 Vouching | M2 References |
|---|---|---|
| §10a fidelity | **Pass with change:** a vouch only after a real collaboration or meeting; a sentence about what happened, not a star | **Pass:** written after a real joint act (a session, a sale, a project) |
| §21.2 real-life counterpart | "I'd vouch for her" is how trust moves between people already | References between colleagues |
| §15.8 new facet/verb | New verb: **standing for someone** with your own name | New facet: how others experienced working with you |
| Design rule | No counts as status; never anonymous (like particles, §15 WP-17) | Named, no scores |

Verdicts: **M1 pass with change** (take scarcity + earned right + met-in-real-life; drop public counts and the pressure to return). **M2 pass.** Close kin in canon: the Share card's «Do you see me this way too?» (§14.12a) is a reflection, not trust; vouching is the next layer.

## 4. Where it lands

| Mechanic | Place (§13.1) | Journey | Spec row | New row? |
|---|---|---|---|---|
| M1 Vouch | Café / Co-working (Collaborate directory `/game/collaborate/people`), profile `/profile/:id` | after J7 (others can see your stall) | **A6** social network (profiles, filters, writing in #356) | Attach to A6 as "trust layer"; marked **Yes** (public-facing) |
| M2 References | Co-working, Market | after J11/J12 (first price, first sale) | **A6** + **A7** (clients) | No |

## 5. Our version

**M1.** A player can **stand for** another player once three people who already stand for others have stood for them. The first circle is seeded by Sasha and the founding villagers of San Pancho (Village #1, A11). Standing for someone is one named sentence about something real you did together («Ana ran my workshop with me; I'd hand her my clients»), allowed only after a recorded collaboration or meeting. It appears on the profile as faces with their lines, not as a number. In the Collaborate directory a filter shows **"someone you know stands for them"** (friend of a friend), because local trust predicts, global scores don't [1]. Nobody is told who did *not* stand for them, and there is no "return the vouch" prompt.

**M2.** After a real joint act recorded in the game (a session given, a product bought in the Market, a project at Town Hall), both sides get one prompt: "How was it to work with {{name}}?" with a short text. Shown on the profile; both written before either is shown, so nobody writes in reply to the other (fixes the reciprocity bias Couchsurfing had).

## 6. Smallest testable version (M1)
- **What:** no code. 10 founding players each write up to 3 «I stand for…» lines in a form; Hark places them on mock profiles in the directory.
- **Who:** Sasha's circle / San Pancho founding villagers.
- **Signal:** once writing works (#356), message rate to profiles with a standing line vs without.
- **Kill line:** no difference, or the lines read as compliments, not trust → drop M1, keep M2.
- **Depends on:** A6 writing (issue #356); Sasha's yes (public-facing, touches how players meet).

## 7. Risks and anti-patterns
- **Inflation:** vouches between people who met once at a meetup (Paris, 80% [1]). Rule: only after a recorded joint act.
- **Reciprocity pressure:** public mutual vouching (74.6% returned [1]). No prompts to return; no counts.
- **Insider club:** at Couchsurfing only 1.8% could vouch [1]. Newcomers must have a path in (a founding villager meets them, the Fire Circle).
- **Gatekeeping status:** standing lines must not rank people or become a leaderboard (canon: leaderboard only for contribution, §10).
- **Liability:** a vouch is not a safety guarantee; copy must say what it means.
- **Fakes:** circles of fake accounts vouching each other. Earned-right rule + real-name profiles blunt it.

## 8. Priority
- M1: Impact 3 × Confidence 2 (A data, but the mechanic was retired) × Ease 2 (needs #356 first + one table) = **12 → Medium**.
- M2: Impact 2 × Confidence 2 × Ease 2 = **8 → Medium** (after clients exist, A7).

## 9. Sources (read 2026-11-21)
1. Lauterbach, Truong, Shah, Adamic, "Surfing a web of trust: Reputation and Reciprocity on CouchSurfing.com", IEEE CSE 2009: https://www.hung-truong.com/portfolioresources/CouchSurfingTrust.pdf
2. Adamic et al., "Rating Friends Without Making Enemies", ICWSM 2011: https://ojs.aaai.org/index.php/ICWSM/article/download/14121/13970
3. Couchsurfing Blog, "What's changed on Couchsurfing?", 2014-11-19: https://blog.couchsurfing.com/whats-changed-on-couchsurfing/
4. Couchsurfing FAQ, "What Are References and How Do They Work?", 2026-05-20: https://support.couchsurfing.org/hc/en-us/articles/50041760259355-What-Are-References-and-How-Do-They-Work
5. Inverse, "Paradise lost: The rise and ruin of Couchsurfing.com", 2021-09-15: https://www.inverse.com/input/features/rise-and-ruin-of-couchsurfing
6. Couchsurfing Press & Media, 2026-08-11: https://support.couchsurfing.org/hc/en-us/articles/54285536290971-Couchsurfing-Press-Media
