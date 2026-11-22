# Module 2 · When a partner brings a player to us

> **Superseded 2026-11-22.** Sasha chose the gift model: money moves one way only (author → game), the game pays no one back, no time limit on attribution, no visibility bonus. Current terms: [partner_offer.md](./partner_offer.md) v2.1. Kept for the reasoning.

v1 · 2026-11-22 · Hark. Sasha asked (2026-11-22 10:36): «Если партнёр привёл игрока к нам: ничего ему не платим или тоже 10%? Продумай и просчитай разные варианты». Related: [partner_offer.md](./partner_offer.md) (we take 10% for 12 months from first click), [launch_plan.md](./launch_plan.md).

## The question
Our offer already says: a partner pays us 10% for each client the game sends them. What does a partner get when the arrow points the other way, when their audience comes into the game and buys from us?

## Example used for the numbers
Our prices today: Mastermind $222, Founder-Market Fit session $555, The Vector $3,333. Example month: one partner sends 100 people; 5 buy the Mastermind, 1 buys a session. Our revenue from that partner: 5 × $222 + $555 = **$1,665**. (Illustration, not a forecast.)

## Five options

| Option | What the partner gets | We pay in the example | We keep | Plus | Minus |
|---|---|---|---|---|---|
| A. Nothing | Only goodwill | $0 | $1,665 | Simplest | One-way; partners have no reason to send their people; breaks «mutual» (Sasha 2026-11-21) |
| B. Same 10% back, 12 months | 10% cash of what their player pays us | $166.50 | $1,498.50 | One sentence: «10% both ways»; fair; makes every partner want to send people to the game | Payouts to run (manual monthly at stage 1) |
| C. B, settled as one difference | Same as B, but each month only the net difference moves | $166.50 minus what they owe us | same as B | Fewer transfers; less admin for both | Needs one monthly statement per partner |
| D. Credit, not cash | 10% as in-game credit / featured placement | $0 cash | $1,665 cash | No cash out | Less attractive; harder to explain; credit is a new mechanism to build |
| E. 20% back | Double reward to buy growth | $333 | $1,332 | Strong pull | Asymmetric; costs more than it needs to |

## Break-even
B costs 10% of revenue from partner-sent players. It pays for itself if the promise makes partners send **at least 11% more** buying players than they would for nothing (1 ÷ 0.9 = 1.11). For a partner who sends nobody under A, any sale under B is pure gain.

## Tracking cost
Low. Inbound referral already exists: `?ref=` → `game_profiles.invited_by`. What is missing: a partner's ref id on the purchase in `sales_events` and a monthly statement. Same machinery as our outbound attribution, so built once for both directions.

## Link to the media burst idea
A coordinated media burst (Sasha 2026-11-22, see launch_plan.md «Later») only works if every partner gains from players entering the game. B gives each partner a direct reason: their people buy in the game, they earn 10%; and more players reach their own profile.

## Recommendation
**B, settled as C:** «10% both ways, 12 months from first click, settled monthly as one difference.» Confidence: fairly sure. Risk to name: payouts are manual at stage 1; automatic split comes with Stripe Connect later (Stripe is off-limits until Sasha lifts it).
