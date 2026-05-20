# Commons Treasury Evolution

> *© 2026 Alexander Konstantinov · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)*

> *v0.1 · May 19, 2026 (Day 76) — How the 10% revenue share from Path B distributors evolves from "routes to founder" (v0.1) to "governed by a purpose entity that cannot be sold" (Phase 3). Companion doc to [`monetization_strategies.md`](./monetization_strategies.md) and [`DISTRIBUTOR_AGREEMENT.md`](../../DISTRIBUTOR_AGREEMENT.md). Drafted Day 76 to close a transparency gap: the existing docs use "commons" language while the legal instrument routes 10% to the Licensor (Alexander Konstantinov) personally. This file names the bootstrap reality honestly and declares the trajectory toward a governed-commons structure as the network matures.*

---

## TLDR

The 10% revenue share defined in §3 of the [Distributor Agreement](../../DISTRIBUTOR_AGREEMENT.md) evolves across three phases:

1. **Phase 1 (now, v0.1):** routes to Alexander Konstantinov personally as **founder steward**. Covers years of unpaid R&D, apparatus operating costs (Supabase, AI APIs, hosting, code maintenance), and founder compensation during bootstrap. 1–25 active Path B distributors.
2. **Phase 2 (threshold: 25 active distributors):** transfers to a **purpose entity** — steward-ownership LLC or perpetual purpose trust — with declared allocation buckets (founder steward share / operating treasury / distributor commons fund), transparent annual report.
3. **Phase 3 (threshold: 50+ active distributors):** **distributor council** co-governs the treasury alongside the founder steward seat. Closest analogs: Patagonia (post-2022 Purpose Trust), Ecosia (steward-ownership from day 1), Bosch (Industrietreuhand-style stewardship), Mozilla Foundation (foundation-owned product corp).

**Structural commitment:** the entity is designed *from day 1* to be unsellable. No IPO. No equity holders with claims on appreciation. No acquihire path. The founder is paid well as steward; the rest serves the mission permanently.

---

## Honest Naming

### This is not the Linus path

Linus Torvalds takes **no percentage** of Linux revenue. He draws a salary from the Linux Foundation, which is funded by corporate memberships (IBM, Intel, Google, Microsoft, AWS). The money flow is *corporations → foundation → maintainers*. Linus is a non-owner employee.

This venture's 10% revenue share is structurally different: communities pay the platform a percentage of *their own revenue*. That's closer to **Substack** (10% of subscription revenue) or **Patreon** (8–12% of creator earnings) than to Linus.

### This is the Chouinard / steward-ownership path

The architecture is committed to be the **Yvon Chouinard / Patagonia (post-2022) move**, made explicit from the start instead of after success:

- The IP and revenue stream eventually transfer to a legal entity that **cannot be sold**.
- The entity has no equity holders, no investors, no exit, no IPO.
- The founder is paid a steward salary + defined founder share; the rest funds mission and operations.
- Governance evolves toward distributor council representation as the network matures.

**Why this matters:** Substack will eventually face standard for-profit pressures (investor optimization, IPO, sale, ad model). This venture is designed *not to face them* — the legal entity itself is the constraint. The "commons" language in the existing docs becomes legally true at Phase 2, not just aspirational.

### Other analogs worth naming

| Entity | What they share with this model | What they don't |
|---|---|---|
| **Patagonia** (post-2022 Purpose Trust) | Founder gave up sale optionality; profits beyond reinvestment serve mission permanently | Single product company; no distributor network |
| **Ecosia** (steward-ownership from inception) | Cannot be sold; profits to environmental mission | Search engine, single product |
| **Bosch** (Industrietreuhand stewardship since 1964) | Profits serve mission + research; corporate sovereignty without family inheritance | Industrial conglomerate, very different scale |
| **Mozilla Foundation** (owns Mozilla Corporation) | Non-profit owns product corp; product revenue funds mission | Single product (Firefox / web mission) |
| **Linux Foundation** (corporate-membership non-profit) | Founder is salaried employee, not owner; transparent governance | No rev-share on Linux deployments — funded by corporate membership instead |
| **Mondragon Cooperative Corporation** (worker-cooperative federation) | Distributed ownership; democratic governance | Cooperative members are workers, not distributors |

No existing model matches exactly. The combination of *forkable open-source code + per-founder voice generation + steward-ownership trajectory + distributor council governance* is novel. The architecture borrows from each of these but assembles them differently.

---

## Three-Phase Trajectory

### Phase 1 — Founder Steward (now, v0.1)

**Structure:** Path B revenue share (10% above $1K/month free tier) routes via Stripe Connect Express auto-split to Alexander Konstantinov's Stripe account directly. Path A subscriptions ($22/mo through $5,555 one-time) route the same way.

**What the founder steward share covers:**
- Compensation for years of unpaid R&D (Jan 2026 onward + significant prior methodology work)
- Apparatus operating costs (Supabase, Vercel, OpenAI/Anthropic/Gemini API fees, code maintenance, infrastructure)
- Founder personal income during bootstrap phase
- Reserve for Phase 2 legal-entity formation costs

**Transparency commitments at Phase 1:**
- This document (`commons_treasury_evolution.md`) is published in the repository, linked from `DISTRIBUTOR_AGREEMENT.md` preamble and `monetization_strategies.md`.
- Quarterly note in `session_log.md` on active distributor count + rough revenue scale (without compromising any individual distributor's privacy).
- The threshold for Phase 2 transition (25 active distributors) is publicly declared in advance.

**Duration:** until ~25 active Path B distributors. Estimated 6–18 months from Day 76. Triggered by count, not date.

### Phase 2 — Purpose Entity Formation (~25 active distributors)

**Structure:** create a legal entity (steward-ownership LLC, perpetual purpose trust, or similar — choice deferred to counsel review at threshold) that:

- Receives the 10% revenue share going forward
- Cannot be sold, merged, or IPO'd
- Has no equity holders with claims on appreciation
- Pays Alexander Konstantinov a defined founder steward salary
- Pays back-compensation for years 2024–2026 unpaid R&D from accumulated treasury
- Allocates remaining revenue per declared buckets

**Declared allocation buckets at Phase 2:**

| Bucket | Approximate share | Purpose |
|---|---|---|
| **Founder steward share** | 40% | Alexander's ongoing compensation as master holon + steward; declines proportionally as Phase 3 governance matures |
| **Operating treasury** | 40% | Apparatus maintenance (compute, AI APIs, hosting, code stewardship, support infrastructure) — the costs distributors benefit from but don't pay separately |
| **Distributor commons fund** | 20% | Grants to small distributors below the free tier threshold, commons data publication infrastructure, shared tooling, ecosystem support |

Percentages are **starting allocations**, subject to refinement at threshold based on actual operating costs and distributor council input as it forms.

**Governance at Phase 2:**
- Alexander Konstantinov remains sole steward with sole decision authority
- Distributor council is *forming* — voluntary, advisory, no formal voting power yet
- Annual transparent report to all distributors: revenue received, allocation, balance sheet

**Legal-entity options under consideration:**
- Steward-ownership LLC structured like Ecosia's German model (adapted to a US or neutral jurisdiction)
- Perpetual purpose trust (Delaware, as Patagonia used)
- B-Corp + Public Benefit Corporation hybrid
- 501(c)(3) foundation owning a wholly-owned LLC (Mozilla Foundation model)

The choice depends on counsel review, distributor jurisdiction mix, tax efficiency, and operational simplicity at threshold.

### Phase 3 — Governed Commons (50+ active distributors)

**Structure:** distributor council becomes a real governance body alongside the founder steward seat.

- **Founder steward** holds permanent stewardship seat with veto on mission-violating decisions (anti-extraction, anti-sale, anti-IPO clauses are immutable)
- **Distributor council** elected representatives co-decide on allocation bucket percentages, operating treasury priorities, distributor commons fund grants
- **Annual general meeting** of all distributors with transparent reporting + binding votes on declared agenda items
- **Founder steward share** declines (e.g., 40% → 30% → 20%) on a published schedule as the network matures and Alexander's role becomes more category-steward than primary operator

**The structural lock:** at no point can the entity be sold, merged into a for-profit, or have its anti-extraction clauses removed. The legal structure prevents this even if a future steward or council majority wanted to.

This is the architecture's "third holon" — what the venture *becomes* when proof of method (V1) → propagation through forks (V2) → networked governance (V3) completes.

---

## The Sovereignty Stack — Same Pattern at Every Scale

This treasury trajectory is the **third application of the same architectural primitive** Alexander has built into the system at every other scale:

| Scale | Sovereignty primitive | What the platform does NOT do |
|---|---|---|
| **User** | Consent token (`matchConsentToken.ts`) — every cross-user action requires explicit, time-bounded, single-use consent | Surveil what matched users do with each other; track collaborations, marriages, friendships, ventures that follow |
| **Distributor** | Fork under PolyForm NC + Path B; brand, domain, infrastructure, customer relationships, data all owned by distributor | Surveil off-rail commerce; control discovery; gatekeep customer relationships; subordinate the distributor's brand |
| **Methodology** | CC BY-NC-SA 4.0 — anyone can read, learn, teach, share-alike non-commercially | Restrict learning or thought; require permission to study or apply privately |
| **Network treasury** | Steward-ownership entity (Phase 2+); legally unsellable; distributor council co-governance (Phase 3+) | Optimize for founder exit; allow acquisition; enable shareholder extraction; concentrate appreciation in founder equity |

**Same shape recursively.** Sovereignty is the default at every scale; the revenue share activates only on payments through the platform's rail (Stripe Connect Express); governance distributes as the network matures.

This consistency is the **load-bearing claim of the entire venture**. If sovereignty holds at user, distributor, and methodology scales but fails at the network treasury scale, the architecture has a hole at the top of the holon stack. Phase 2/3 closes that hole structurally, not just rhetorically.

---

## What This Means for Distributors

### For Path A subscribers ($22–$5,555)
No change. Subscription is the commercial license. The 10% rev-share applies only to Path B fork-and-self-host distributors above $1K/month. Path A revenue flows to the same founder steward share / operating treasury / commons fund allocations declared above.

### For Path B distributors (fork + self-host above $1K/month)
- Today: your 10% routes to Alexander Konstantinov personally as founder steward. This is transparent (§3 of Distributor Agreement) and stays accurate until Phase 2 threshold is reached.
- At Phase 2: your 10% routes to the purpose entity. Your terms don't change. The allocation between founder steward / operating treasury / commons fund becomes published with annual transparent reporting.
- At Phase 3: you (as an active distributor) have a vote on allocation refinements and council representation.

**Your commercial license is unaffected by these transitions.** The grant of license in §2 of the Distributor Agreement is preserved across phases. Revenue share terms (10% above $1K/mo free tier) do not change retroactively — only their *destination* evolves, with prior notice per §13 of the Distributor Agreement.

### For pilot communities (free, no terms — Carolina case)
None of this applies until paid terms begin. The treasury trajectory is what they'd opt into IF they go paid, not a precondition for the pilot.

### For Balaji-scale Network States
This entire trajectory is the *answer* to the question their lawyers will ask first: *"Who owns the platform you're recommending we deploy?"* Phase 1 transparency + Phase 2/3 commitment in advance converts that question from a structural concern to a sign of architectural integrity.

---

## Open Decisions

These need to be resolved before Phase 2 activates (not now, but tracked so they don't sneak up):

1. **Legal entity structure** — steward-ownership LLC, perpetual purpose trust, foundation-owned LLC, or hybrid. Counsel review required at Phase 2 threshold.
2. **Jurisdiction** — Delaware (Patagonia precedent), Germany (Ecosia / Bosch precedent), Wyoming, Switzerland, or neutral common-law alternative.
3. **Back-compensation calculation** — formula for Alexander's unpaid R&D years (2024–Phase 2 transition). Likely market-comparable founder salary × years, paid from accumulated treasury at Phase 2 formation.
4. **Founder steward share decline schedule** — by how much per year, triggered by what (time vs. distributor count vs. revenue threshold).
5. **Distributor council composition** — how many seats, election mechanism, term length, geographic / community-type representation balance.
6. **Veto scope** — exactly which decisions are subject to founder steward veto vs. council majority. Anti-extraction, anti-sale, anti-IPO clauses are immutable; everything else is open.
7. **Distributor commons fund grant mechanism** — application process, criteria, who reviews, public reporting.
8. **Exit option for founder** — can Alexander voluntarily relinquish his steward seat to a successor council vote at any point? Yes by default, but mechanism needs definition.

These are tracked here so they're visible at a glance and not invented under pressure at threshold.

---

## Cross-References

- [`monetization_strategies.md`](./monetization_strategies.md) — the six-play commercial architecture this treasury evolution sits inside
- [`DISTRIBUTOR_AGREEMENT.md`](../../DISTRIBUTOR_AGREEMENT.md) — §3 (revenue share), §7 (data commons, distinct from revenue commons), §13 (changes to agreement), §16 (spirit)
- [`LICENSE`](../../LICENSE) — PolyForm Noncommercial 1.0.0 (code)
- [`LICENSE.md`](../../LICENSE.md) — CC BY-NC-SA 4.0 (methodology)
- [`integration_layer_manifesto.md`](../06-architecture/integration_layer_manifesto.md) — architectural rationale for distributor-sovereignty pattern that the treasury trajectory completes
- [`planetary_os_assembly.md`](./planetary_os_assembly.md) — the 12-step growth path; Phase 2/3 of this treasury maps to Steps 11–12

---

## Changelog

### v0.1 — May 19, 2026 (Day 76)
- Document created. Phase 1 / Phase 2 / Phase 3 trajectory declared. Steward-ownership framing established. Sovereignty-stack consistency named. Eight open decisions tracked for Phase 2 activation.
- Drafted in response to Day 76 conversation surfacing the gap between "commons" language in existing docs and the legal reality that 10% routes to founder in v0.1. Companion edits made same day to `DISTRIBUTOR_AGREEMENT.md` §16, `monetization_strategies.md` (all "tithe" instances replaced), and `README.md` (same).

### Future versions
- **v0.2** — when first Path B distributor signs (the bootstrap reality becomes concrete; back-compensation formula begins to crystallize).
- **v1.0** — at Phase 2 threshold (legal entity formed; allocation buckets ratified; transparent reporting begins).
- **v2.0** — at Phase 3 threshold (distributor council seats elected; governance distributes).

---

*v0.1 · May 19, 2026 (Day 76) · Companion doc to monetization_strategies.md. The 10% revenue share evolves from founder-steward (v0.1) to purpose-entity (Phase 2) to council-governed-commons (Phase 3). Steward-ownership trajectory, not Linus path. Architecture committed to be structurally unsellable from the start. Drafted by [Alexander Konstantinov](https://aleksandrkonstantinov.com) with AI assistance to close the transparency gap between "commons" language and v0.1 legal reality.*
