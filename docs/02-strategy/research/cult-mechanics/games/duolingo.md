# Duolingo → GoBY

Filled: 2026-11-21 · Status: draft, awaiting Sasha
Almanac stage: 7 (life-gamified play; the habit lives in the player's real day) · Fidelity: system (the app's own lessons), not reality
One line: language app; one lesson a day keeps your streak, a linear path shows the next step, the owl celebrates milestones. The most-tested habit loop in consumer software.

## 1. Why it's cult (facts)

| Fact | Number | Source, date | Grade |
|---|---|---|---|
| Daily users | 64.9M DAU in Q3 2026, +29% YoY; MAU 153.1M | [1] Q3 2026 shareholder letter | B |
| Engagement depth | DAU/MAU rose to 39.6% (Q4 2025) from 34.7% a year earlier, "driven largely by an increase in retention of current users" | [2] 10-K filed 2026-02-27 | B |
| Paying | 12.7M paid subscribers (Q2 2026) | [3] Q2 2026 letter | B |
| Streak culture | "over 6 million people on a streak of 7 days or more" (Jan 2022); streaks extended on wedding days and in childbirth | [5] Duolingo blog 2022, [4] 2020 | B |
| Streak worth | June 2026 Streak Revival event: 15.4M learners, ~8M had no active streak; the Q2 2026 letter called it one of its most successful campaigns | [8] secondary, citing the Q2 2026 letter | C (not opened in the letter) |

Share of the cult credited to the mechanics below: **large**. *Judgment:* Duolingo itself says DAU growth comes mostly from retaining current users [2], and the streak is its most-tested retention tool [4][5].

## 2. Mechanics that demonstrably worked

### M1. A forgiving streak: one small act keeps it, two freezes protect it
- **In the source:** the streak counts days in a row with at least one lesson. In 2019 Duolingo cut the link between the streak and the daily goal: one lesson extends the streak, the goal is tracked apart. Learners can hold up to two Streak Freezes that cover a missed day [4][5].
- **Evidence (grade A, Duolingo's own A/B tests):** decoupling streak from goal: +3.3% day-14 retention, +1% daily active learners, +10.5% share of daily learners on a streak in 20 days, +19% among new learners (relative); a year later just over half of daily learners had a 7+ day streak vs about a third before; learners on 7+ day streaks grew over 40% [4]. Two freezes instead of one: +0.38% daily active learners [5]. Learners who reach a 7-day streak are 2.4× more likely to come back next day and 3.6× more likely to finish their course [4][5] (correlation, not cause; Duolingo's own growth lead called it selection bias [7]). The cost Duolingo named: fewer learners hit their daily goal [4].
- **Driver:** habit by repetition in the same context; loss aversion as the streak grows; "slack" in goals keeps people persistent (Penn + UCLA study cited by Duolingo) [5]. Early days feel big: day 2→3 is +50%, day 200→201 is +0.5% [5].

### M2. The Path: one linear sequence, no skipping
- **In the source:** in 2022 the Tree (pick any skill) was replaced by the Path: every lesson in order, one clear next step [6][9].
- **Evidence (grade B, and honest):** Duolingo says the data **did not immediately show improvements** in DAU or monetization; they kept it because it built real mastery instead of speed-running easy lessons for streaks [9]. Learners reached Intermediate Mid in Spanish after the beginner path [10].
- **Driver:** no choice paralysis ("am I using it the right way?" was the complaint it answered [6]); foundations before hard parts.

### M3. Milestone celebration
- **In the source:** an animation after each streak extension, a bigger one on milestone days [5].
- **Evidence (grade A):** +1.7% (relative) more brand-new learners still active 7 days later [5].
- **Driver:** the act of continuing is made to feel like an achievement, strongest in the first days [5].

## 3. Canon filter

| Check | M1 Forgiving streak | M2 Path | M3 Celebration |
|---|---|---|---|
| §10a fidelity | **Pass with change:** the streak counts **real acts** (the day's 5-minute practice done in life, a Journey step, a micro-quest), never app opens | **Pass** | **Pass:** celebrates a real result |
| §21.2 real counterpart | a daily practice | a path of real steps | a real step done |
| §15.8 new verb | new verb: **keep a rhythm** (J10 "check in daily" already exists) | not new (Journey) | not new (Outro) |
| Design rule (no artificial points) | a streak is a count of real days, allowed since Sasha's 2026-11-01 verdict on streaks and numbers (§21.1) | ok | ok |
| Already in canon? | **Yes, decided:** §10 "daily 5-minute quests, gentle streak with freezes" (approved 2026-10-26); §21.4 Hark draft proposed weekly streaks in real acts. Duolingo's data settles the details | **Yes:** §21.1 "linear sequence; you may change the order, you can't skip"; §14.2 Journey | **Yes:** §14.12 badge as the Outro's centrepiece |

Verdicts: **M1 pass with change** (real acts only). **M2 pass, already canon**: Duolingo's lesson is to keep it even if numbers don't jump at once. **M3 pass, already canon**: data supports making the Outro feel big.

## 4. Where it lands

| Mechanic | Place | Journey | Spec row | New row? |
|---|---|---|---|---|
| M1 Forgiving streak | Your House (stats), Quest Board (today's act) | J10 21-day practice; A4 micro-quest after reveal | none covers it | **Yes: proposed A13** (needs Sasha's yes) |
| M2 Path | Quest Board, Village glow (§14.6) | J1–J12 | A3 onboarding, A4 hook | No |
| M3 Celebration | every Outro | J1–J12 | A12 badges | No: add "milestone Outro feels bigger" to A12 |

## 5. Our version

**M1.** One small real act a day keeps your streak: today's 5-minute practice, a Journey step, or the micro-quest the reveal gave you, marked "done" by the player. The streak is not tied to the QoL goal or to how much you did (Duolingo's biggest win came from exactly this cut [4]). Two freezes, held at once, cover missed days; three added nothing at Duolingo [7]. Freezes are earned by real acts (e.g. finishing a Journey step), never bought, so they never become money for a habit. The count lives on Your House as an owner-only card, next to A5's stats, and in Lunar it can follow the moon (a missed day on the new moon is "rest", not a break, §15.7a). Proposed spec row **A13 Forgiving streak**: done when one real act a day extends it, two earned freezes protect it, and it shows only to the owner.

**M2.** No change: keep the Journey linear, order flexible, no skipping. Add one line to canon: we keep this even if early numbers don't move (Duolingo's own case [9]).

**M3.** Day 1, 3, 7, 21 of the streak and every Journey Outro get a bigger celebration (the badge landing, §14.12). Attach to A12.

## 6. Smallest testable version (M1)
- **What:** a "Did today's act" button on the Quest Board + the count on Your House + 2 freezes; no reminders yet.
- **Who:** players who finished the reveal (A4), all at once, with half seeing no streak (A/B) if traffic allows; otherwise before/after.
- **Signal:** share of players active on day 7 after the reveal.
- **Kill line:** no lift, or players report guilt/pressure in playtest → drop the count, keep the daily act.
- **Depends on:** A4 (micro-quest after reveal) and Sasha's yes to A13.

## 7. Risks and anti-patterns
- **Streak over substance:** Duolingo saw learners speed-run easy lessons to keep streaks [9]. Ours counts a real act, and the act must be named.
- **Guilt machine:** Duolingo leans on loss aversion and owl memes. Our North Star is life, not the screen (§21.1): no shaming reminders; a break is weather (§10 Current vs Peak).
- **Too much slack:** each extra freeze brings some back and teaches others to stay away [7]. Two is the tested sweet spot.
- **Paid freezes:** Duolingo sells freezes for gems; we don't sell habit protection.
- **Fidelity drift:** if "done" becomes a tap with no act behind it, the streak counts app opens. Keep the act visible on the card ("Day 12: wrote to a client").

## 8. Priority
- M1: Impact 3 × Confidence 3 (A/B data) × Ease 2 (new row, small UI) = **18 → High**, needs Sasha's yes (new row A13).
- M2: Impact 2 × Confidence 2 × Ease 3 = **12 → Medium** (no build, a canon line).
- M3: Impact 2 × Confidence 3 × Ease 3 = **18 → High**, attaches to A12 (already in this sprint).

## 9. Sources (read 2026-11-21)
1. Duolingo Q3 2026 shareholder letter: https://investors.duolingo.com/static-files/e1ee336e-b024-486f-875c-afd722653067
2. Duolingo Form 10-K, filed 2026-02-27: https://investors.duolingo.com/static-files/f19d76fb-dee4-4f13-96ae-138ebfd0f2d3
3. Duolingo Q2 2026 shareholder letter: https://investors.duolingo.com/static-files/3c8277ee-bc94-4f5d-9b77-0db3e46f88b8
4. Anton Yu, "Improving the streak", Duolingo Blog, 2020-11-19: https://blog.duolingo.com/improving-the-streak
5. Osman Mansur, "The habit-building research behind your Duolingo streak", Duolingo Blog, 2022-01-31: https://blog.duolingo.com/how-duolingo-streak-builds-habit
6. "Introducing the new Duolingo learning path", Duolingo Blog, 2022: https://blog.duolingo.com/new-duolingo-home-screen-design
7. Jackson Shuttleworth (Duolingo retention PM) interview notes on freezes (1 vs 2 vs 3): https://usecaddie.app/s/behind-the-product-duolingo-streaks ; Jorge Mazal, "How Duolingo reignited user growth", 2023: https://lenny.substack.com/p/how-duolingo-reignited-user-growth
8. Yu-kai Chou, streak design (cites Q2 2026 letter on Streak Revival): https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/
9. The Duolingo Handbook, "The Path": https://handbook.duolingo.com/
10. Duolingo Research Report DRR-24-04, 2024-04-26: https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_write_speak_2024.pdf
