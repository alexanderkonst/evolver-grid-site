# Funnel of Sasha's unique business: map v1

**Moon strategy 4 (November 2026, B2-51).** Module 3, «Коллектив уникальных фаундеров». Written by Hark 2026-11-21 from the repo as of main `8380ade`.

**What this file is.** An audit, not a new funnel. The funnel itself lives in one place: Sasha's canvas v1.13, §8.6 ([alexanders_unique_business.md](./alexanders_unique_business.md), updated 2026-11-17). This file lays each of its 12 steps against what exists today (page, tool, text, number), names the gaps, and lists the forks only Sasha can close.

**Status key.** *live* = route on main (`src/App.tsx`), production page not opened one by one. *partial* = part exists. *none* = nothing found in the repo.

---

## 1. The 12 steps against reality

| # | Step (canvas §8.6, Sasha's words) | Who | What exists | Status | Gap |
|---|---|---|---|---|---|
| 1 | AI finds the profile by a precise unique query | Hark | LinkedIn script v2 on Sasha's Mac (auto mode, guards: 60/week, warm-up, 7-day emergency stop, MX IP check, 35% acceptance floor); selection by Matchmaker Brief v5.1 (self-naming filter, 2-week test 2026-11-18 → 2026-12-02) | live | Acceptance ~25% (n=279, measured 2026-11-17), under the 35% floor set in [outreach_ops.md](../outreach_ops.md) §0.3 |
| 2 | I send a LinkedIn connection request | Hark, from Sasha's account | Same script | live | — |
| 3 | Once accepted, I reflect the person's current situation and the cost of inaction | Sasha | No template. Funnel v5 (2026-10-19) used a different first message: a uniqueness reading | none | Hook text for «situation + cost of inaction» not written |
| 4 | I ask consent to share how I solved it for myself | Sasha | — | none | One consent line not written |
| 5 | I answer through my story in 1–2 sentences | Sasha | Not found in the funnel docs | none | The 1–2 sentence story not written |
| 6 | The person reacts somehow | Sasha → CRM | CRM and Offer Ledger in the private ledger, filled via Pulse | live | — |
| 7 | I invite them to a free transformational webinar | Sasha | First run: free live session Wed 2026-11-04 (Luma `qpogt17o`). Webinar Engine v1 written ([§ Business Case](./alexanders_unique_business.md)): flow, 3+3 message cap, host kit | partial | No next date; no standing webinar page (`/webinar` does not exist); whether the Nov 4 run happened and its numbers are not in my records |
| 8 | At the webinar I sell FMF ("Discover Founder-Market Fit in Three Days, Guaranteed"; formerly the Mastermind) | Sasha | [/build/fmf](https://findyourtoptalent.com/build/fmf) ($222, group, live Monday + Wednesday once per lunar cycle; dates in [product_brief.md](../../04-products/product_brief.md) §0.7); [/ignite](https://findyourtoptalent.com/ignite) ($555, 2 h, 1:1) | partial | Dates published 2026-11-24 (next: Mon Dec 14 + Wed Dec 16, 2026); Stripe link is Sasha's (Stripe is off-limits to Hark); FMF guarantee terms not written yet |
| 9 | At FMF I sell PMF ("Early signal of Product-Market Fit in One Moon Cycle, Guaranteed"; formerly BUILT) | Sasha | PMF: $1,111 group / $4,444 1:1, one moon cycle; guarantee written in [product_brief.md](../../04-products/product_brief.md) §0.4 | partial | One route `/products/pmf`; `/products/build` and `/products/built` redirect (2026-11-24) |
| 10 | After PMF I invite them into the sovereign founder collective | Sasha | Concept: [sovereign_founder_collective.md](../sovereign_founder_collective.md); product_brief §0.1 #6: 10% of revenue to a shared treasury, v0.3 | none (no page) | No page; terms conflict (see §3) |
| 11 | I offer to run this program for their clients | Sasha | product_brief §0.1 #7: rev share 50/50, v0.5 | none (no page) | No page or one-pager |
| 12 | I offer training to get a licence to run the program themselves | Sasha | [/license](https://findyourtoptalent.com/license) exists, but it states how to use the method free and paid (the Three Terms), not the licence-training offer | partial | Licence share differs across docs (see §3); no training offer |

**Read in one line:** steps 1, 2, 6 run; steps 3–5 (Sasha's words) and 7 (the next webinar) are where the funnel breaks today; 8–9 exist with stale details; 10–12 are concepts.

---

## 2. Four funnel versions in the repo

| Version | Date | Path | Relation to §8.6 |
|---|---|---|---|
| Canvas v1.13 §8.6 | 2026-11-17 | 12 steps above | Newest, Sasha's own |
| Webinar Engine v1 | 2026-10-22 | personal reading + invite → free live session → $222 Mastermind → $555 FMF / group build | Fits steps 7–9 as their detail |
| Funnel v5, Reading-first | 2026-10-19 | invite → uniqueness reading → free 20-min call → $555 FMF → group build | Differs at step 3 (reading vs cost of inaction) and has a call instead of a webinar |
| product_brief §2 «Текущая воронка» | 2026-10-21 | LinkedIn message → free call or 1-hour webinar → two-day FMF → month PMF container | Short form of 7–9 |

Also outside §8.6: the cold door [/quiz](https://findyourtoptalent.com/quiz) (hero's-journey test) and the free Professional Direction Call. outreach_ops §0.1 (2026-08-28) makes the quiz the cold door; §8.6 does not mention it.

---

## 3. Conflicts in the terms (steps 10–12)

1. **Collective money.** product_brief §0.1 #6: «10% of revenue into a shared treasury». The Three Terms ([the_three_terms.md](../../05-reference/the_three_terms.md)): «No equity, no pooled funds». Sasha's funding rule (2026-11-04): capped rev share or debt, no equity.
2. **Licence share.** product_brief §0.1 #8: «10% to Sasha; part of it to the Collective (to clarify)». product_brief §2 #8: «90% theirs, 10% to the Sovereign Founder Collective».

---

## 4. Gaps, in funnel order

| ID | Gap | Step | Whose move |
|---|---|---|---|
| G1 | Next webinar: date, standing page; FMF page dates published 2026-11-24 | 7–8 | Sasha sets the date; Hark builds the pages (platform fix) |
| G2 | Words for steps 3–5: hook, consent line, 1–2 sentence story | 3–5 | Sasha writes; Hark drafts only on request |
| G3 | Acceptance ~25% under the 35% floor | 1 | Read after the self-naming test ends 2026-12-02 |
| G4 | One route for BUILD | 9 | Hark (platform fix), after Sasha picks the name |
| G5 | Collective and licence terms, one page each | 10–12 | Sasha decides the terms (§3) |
| G6 | Place of /quiz and the Direction Call in the 12 steps | before 1 or at 6 | Sasha |

---

## 5. Forks for Sasha

1. **One funnel.** §8.6 is the funnel; the other three become genealogy, linked from here. (Hark's pick, very likely right: it is the newest and his own words.)
2. **First gap to close.** Hark's pick: G1, because without a next webinar date steps 8–12 have no entry.
3. **Terms** in §3: the collective treasury and the licence share.
