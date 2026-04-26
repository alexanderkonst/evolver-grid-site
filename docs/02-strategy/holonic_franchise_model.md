# The Holonic Franchise Model

> *© 2026 Alexander Konstantinov · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)*

> *v2.0 · April 25, 2026 (Day 51 night) — Single canonical doc for both the architectural pattern AND the dynamic, sequenced business-monetization strategy that operates within it. Supersedes v1.0 of this file + the short-lived `monetization_strategy.md` (merged in here so there's one source of truth).*
>
> **Status:** living document. Always work from the latest version. Each addition is additive (changelog at end of file); nothing is deleted, but the *current shape* is whatever the latest version describes.
>
> **Cross-references:** [Unique Business Playbook — Principle 15](../03-playbooks/unique_business_playbook.md) (the conversion mechanism every play leverages) · [Phase Shift Library Domain 81](../01-vision/phase_shift_technology_library.md) (the discovery in research-grade form) · [Distributor Agreement v0.1](../../DISTRIBUTOR_AGREEMENT.md) (the legal instrument) · [Integration Layer Manifesto](../06-architecture/integration_layer_manifesto.md) (the architectural rationale for plays #3 and #5) · [Planetary OS Assembly](./planetary_os_assembly.md) (the 12-step growth path the plays map to) · [Roadmap](./roadmap.md) (current sprint status) · [Alexander's Unique Business](./unique-businesses/alexanders_unique_business.md) (the master holon's lived state)

---

## The One-Line Version

> **PolyForm NC code + 10% rev-share license + forkable kit + opt-in commons = Holonic Franchise.**
>
> A new commercial-decentralization pattern: forkable open-source apparatus + per-founder voice generation + opt-in shared commons + 10% tithe to the commons that grew the founder. Distributors become sovereign nodes operating under their own brand, contributing back through a transparent revenue share, and benefiting from a public dataset that compounds in value as the network grows. **Six commercial layers** sit on top of this foundation, sequenced across **four phases**, designed to compound rather than compete.

---

## What This Document Is

This is the operational model that emerged on Day 51 from three converging needs:

1. **Sasha's commitment to decentralization** (per [Integration Layer Manifesto](../06-architecture/integration_layer_manifesto.md) and [Planetary OS Assembly](./planetary_os_assembly.md) Steps 11-12) — the system must be forkable, not a walled garden.
2. **The reality of years of methodology work** — pure giveaway under MIT or AGPL leaves the founder uncompensated when the network scales.
3. **The Specificity Loop discovery** ([Principle 15](../03-playbooks/unique_business_playbook.md)) — per-founder matrix generation became technically possible Day 51, which made true sovereignty of distributors operationally real.

Combined, these three forces produced a model that doesn't fit cleanly into existing categories (open-source, franchise, cooperative, platform-as-a-service). Hence the name: **Holonic Franchise.**

This doc serves five jobs:

1. **Names and explains the architecture** — the five ingredients, why they combine to something new, comparison to other models.
2. **Shows how the venture earns money across all of its commercial layers** — the six plays through Heart/Mind/Gut, with each play's economics and infrastructure.
3. **Tracks the sequenced rollout** — four phases, explicit exit criteria, what stays in pocket vs. what's offered publicly.
4. **Tracks decisions in flight** — every play has open questions enumerated and visible at a glance.
5. **Records implementation status** — what's shipped, what's drafted, what's not yet started, per play and overall.

When a candidate distributor, community partner, investor, counsel, or future Claude session asks *"how do you make money?"* — this is the answer. When a decision changes, this is where it gets updated.

---

## The Five Ingredients (The Architectural Foundation)

The model is the assembly of five components. None is novel on its own; the **specific combination, applied to AI-native human-development infrastructure, is what's new.**

### 1. PolyForm Noncommercial code license
The codebase ships under [PolyForm Noncommercial 1.0.0](../../LICENSE). Personal and small-community forks are free; commercial deployment requires a Distributor Agreement. Software-native equivalent of the docs license's "ShareAlike + NonCommercial" intent.

### 2. CC BY-NC-SA 4.0 documentation license
Methodology, playbook, frameworks under [CC BY-NC-SA 4.0](../../LICENSE.md). Free to study, adapt, share with attribution for non-commercial use; commercial use of the methodology requires permission.

### 3. Distributor Agreement with 10% revenue share
[Distributor Agreement v0.1](../../DISTRIBUTOR_AGREEMENT.md) governs commercial use:
- 10% of platform revenue (gross), free under USD $1,000/month
- Stripe Connect Express auto-split as preferred mechanism (when wired)
- Distributor keeps 90%, operates under their own brand
- No upfront fee, no minimum quota, no certification cost

### 4. Per-founder Specificity Matrix (operational identity sovereignty)
The `specificity_matrix` UBB artifact (Day 51, [Playbook Principle 15](../03-playbooks/unique_business_playbook.md)) generates each distributor's voice for every reveal in their funnel. Their funnel speaks in their idiom, not Sasha's. Full identity sovereignty operationally, not just nominally.

### 5. Opt-in commons (asset mappings, mission discoveries, anonymized artifacts)
Each distributor's users explicitly choose at the artifact level whether their (anonymized) data flows into the public commons. The commons is released under CC BY 4.0 — usable as a public good across all distributors and any aligned external project. Network effects compound for everyone in the network without forced extraction.

---

## Comparison to Existing Models

The Holonic Franchise sits at a specific intersection. None of the rows below is the same model — each shares some properties, none combines all.

| Model | Forkable code | Distributor brand sovereignty | Per-founder voice | Shared commons | Tithe back | Decentralized |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| Multi-tenant SaaS (Skool, Circle, Mighty) | ❌ | partial (theming only) | ❌ | ❌ | n/a | ❌ |
| Open-source + commercial license (Sentry, Plausible, Cal.com) | ✅ | partial (forks aren't branded distributors) | ❌ | ❌ | ❌ | partial |
| Classic franchise (McDonald's, Subway) | ❌ | ❌ (master brand) | ❌ | ❌ | ✅ (5-15%) | ❌ |
| Worker cooperative (Mondragon) | n/a | n/a | ❌ | partial | n/a | partial |
| Federated commons (Mastodon, fediverse) | ✅ | ✅ | ❌ | ❌ (no commercial rail) | ❌ | ✅ |
| Platform cooperative (Stocksy, Resonate) | partial | ❌ | ❌ | ❌ | n/a | partial |
| Nas.io / Patreon (creator platforms) | ❌ | ✅ | ❌ | ❌ | ✅ (8-30%) | ❌ |
| **Holonic Franchise (this)** | **✅** | **✅** | **✅** | **✅** | **✅ (10%)** | **✅** |

**What's genuinely novel** is the per-founder voice generation (#3 in the row above) and the combination of all six properties simultaneously. The other components are well-precedented; the architecture that holds them together is new.

---

## Why This Resolves the Alignment Problem (Without Tokens)

Web3 attempted commercial decentralization through token incentives and largely failed because token speculation polluted alignment — value extraction became the game. The Holonic Franchise achieves the same goal through three mundane mechanisms:

1. **Tithe pattern** — anthropologically robust, used by every long-running religious and franchise system. 10% is generous enough to feel ownership-preserving, meaningful enough to fund the commons.
2. **Brand sovereignty** — distributors don't compete for attention with a master brand. Their identity is intact. They build their own house.
3. **Compounding commons** — every distributor's contribution makes the commons more valuable to every other distributor. Self-reinforcing without requiring belief in a token's future value.

No speculation surface. No need for blockchain. No volatile alignment.

---

## How the Plays Grow Holonically

The six plays are not six different products. They are **the same pattern repeated at one nesting level larger each time.** Each play wraps the previous level inside a bigger holon. Same DNA, different scale.

| Play | Holon Sasha serves | Sasha's role |
|------|--------------------|--------------|
| **#1 User** | One person | Operator (he delivers) |
| **#2 Coach** | A coach + their clientele | Enabler (he equips a deliverer) |
| **#3 Distributor** | A founder + their tribe | Architect (he provides the apparatus the deliverer runs sovereignly) |
| **#5 Community** | A community of founders + their members | Architect-of-architects (the apparatus is adopted as community infrastructure) |
| **#4 Venture Studio** | The ventures grown inside #1–#5 | Co-creator (equity stake in select ventures) |
| **#6 System License** | Institutions teaching it as a methodology category | Category steward (the methodology itself becomes the commons-shared infrastructure) |

**The same DNA at every layer:**
- Specificity Loop conversion mechanism (per [Principle 15](../03-playbooks/unique_business_playbook.md))
- Per-X voice generation (per-founder, per-coach, per-community, per-institution)
- Tithe back to commons
- Brand sovereignty preserved at each layer

**Sasha's role evolves but doesn't replace itself.** He stays the master holon at the center; the network grows around him. He moves from delivering, to equipping, to providing apparatus, to providing infrastructure-of-infrastructure, to co-creating ventures, to stewarding a category — without abandoning any prior role. Each new play wraps the prior plays in a larger holon.

**Revenue follows the size of the holon being served:**
- Play #1: revenue per individual served
- Play #2: revenue per coach × their clientele
- Play #3: revenue per distributor × their tribe (10% of their tribe's payments)
- Play #5: revenue per community × all members × all internal commerce
- Play #4: revenue per portfolio venture × that venture's lifetime growth (equity)
- Play #6: revenue per institution × all students × all certifications

Each play has higher revenue ceiling than the previous one because the holon being served is structurally larger. **Together, the six plays describe how Sasha's work scales without his hours scaling.**

This is **Big Idea #1 (master holon prototypes everything before the network) and Big Idea #2 (fractal + viral growth)** made into commercial reality.

---

## The Six Plays — Heart / Mind / Gut

Each play is described through the three-depths instrument: **❤️ Essence** (what IS this), **🧠 Significance** (why it matters in this venture's context), **🔥 Implications** (consequences, pricing, infrastructure, sequencing position).

---

### 1. Conscious Entrepreneur Play — User

**❤️ Essence.** The individual founder who comes to the platform to find their unique gift and turn it into a sellable venture. They are the **customer of the original promise** — the journey ZoG → Excalibur → UBB → first clients. Sasha is their guide and the platform is their apparatus. The relationship is direct: they pay him, he serves them.

**🧠 Significance.** This is the **foundation layer that makes all five other plays even possible.** Without paying users at this level, the methodology isn't proven, the case studies don't exist, the cohort can't be referenced, the distributors have nothing to distribute, the venture studio has no ventures to take stakes in. Steps 0-3 of the [Planetary OS Assembly](./planetary_os_assembly.md) all live here. It's also the recursion proof — the master holon takes its own medicine; this is what that medicine looks like delivered to others. Every Specificity Loop conversion happens at this layer first.

**🔥 Implications.**
- **Pricing:** $555 Mirror/Ignition Session, $5,000 Build (6 weeks), $500/month Container (ongoing) — already locked in the value ladder
- **Acquisition:** Friday DM send to warm-tie aligned tribe, three lead magnets as gifts (Top Talent reveal · AI OS · Conscious Impact Playbook), the three voice-of-gift pitches drafted Day 51
- **Conversion:** matrix v2 doing its work at every reveal (per [Principle 15](../03-playbooks/unique_business_playbook.md))
- **Margins:** high once volume scales because most of the apparatus is automated (ZoG flow, Specificity Matrix generation, UBB canvas production)
- **Risk:** scales only with Sasha's hours unless he delegates delivery to facilitators (#2) or distributors (#3). Capacity ceiling: ~100-200 paying users per year while he remains the deliverer
- **Status:** ✅ **Active**. The play is live and proven. Six founders through partial or full canvas (Oyi, Sergey, Sandra, Alexa, Karime, Kirill).
- **Sequencing position:** Phase 1 (always-on). This play **must always be running** — it's the proof engine for everything else.

---

### 2. Purpose Coach Play

**❤️ Essence.** Existing facilitators (coaches, healers, purpose mentors, integrative practitioners) who **already have clients** and a delivery practice. They adopt the platform's tools to use *with their existing clients in their existing practice*. They're not building a venture — they're augmenting one. They keep their brand, their relationships, their identity. They use ZoG / UBB / Specificity Matrix as a backstage instrument.

**🧠 Significance.** This is **Step 6 of the [Assembly](./planetary_os_assembly.md) realized at the lowest friction level**. Coaches already do the hard part (selling, holding sessions, building trust). What they lack is leverage — they're stuck doing 1:1 work with no system multiplier. The platform gives them the system; they give the master holon reach into their existing client base without Sasha needing to acquire anyone. **Most natural low-friction distribution channel** because the demand already exists; the platform is just supplying the apparatus.

**🔥 Implications.**
- **Pricing model — critically different from #3** because most coaches won't fork the codebase; they want to log into a hosted version with their client and run a session together. Three candidate models:
  - **Flat fee:** $99-299/month — simplest to scale, but doesn't align with the coach's actual usage economics
  - **Per-session pay:** ~$50 per ZoG generation — aligns better with their economics, but adds friction at the moment of use
  - **Rev-share:** 10-20% on session revenue — aligns most with the Holonic Franchise philosophy, but hardest to enforce without integrated billing
- **Critical decision (open):** is this a different commercial layer from the Distributor Agreement, or do coaches sign the same agreement at the lowest tier? Probably the former — it's a different *product* (use, not deploy)
- **Infrastructure needed:** a "facilitator console" that doesn't exist yet — a logged-in surface where a coach can run a session for a client and see their results. Likely 1-2 weeks of focused build work
- **Acquisition:** warm referrals from existing cohort + Sasha's network of integrative practitioners + the Knoware article reaching AI-curious coaches who haven't yet realized they want a system
- **Risk:** if the facilitator console is too generic, coaches use it to dilute the methodology. If it's too prescriptive, coaches feel constrained and don't adopt. The console design needs the same care as a product launch
- **Status:** 🔄 **Conceptual.** No facilitator console exists yet. Pricing model not chosen. No coaches signed up.
- **Sequencing position:** Phase 1 (alongside #1 and #3). Build the facilitator console once #3's Day-1 distributor experience is proven manually — the same provisioning + auth pattern can underlie both.

---

### 3. Platform Distribution Play

**❤️ Essence.** This is the Holonic Franchise architecture itself made commercially explicit. Founders / orgs **fork the entire platform** under their own brand, on their own infrastructure, charge their own clients. They become **sovereign nodes** in the network. The 10% tithe to commons is the one structural commitment they make. Specificity Matrix in their voice means their funnel speaks like them, not like Sasha.

**🧠 Significance.** This is **Step 11 of the [Assembly](./planetary_os_assembly.md)** — other communities adopting the tools — at the highest level of distributor sovereignty. It's the play that activates the fractal scaling mechanism. Each distributor is a complete holon. Theoretically infinite. The commons effect compounds: every distributor's anonymized contributions make the public dataset more valuable for every other distributor and any aligned external project. **This is the play that makes the [Integration Layer Manifesto](../06-architecture/integration_layer_manifesto.md) commercially real, not aspirational.**

**🔥 Implications.**
- **Pricing model is locked:** 10% rev share on platform revenue (gross), $1K/month free tier, distributor keeps 90%. Codified in [Distributor Agreement v0.1](../../DISTRIBUTOR_AGREEMENT.md).
- **Infrastructure debt is real** — provisioning automation + brand wizard + Stripe Connect Express need to be built before this can run "Skool-easy". Estimated 4-5 weeks of focused work, much less with Sasha + Lovable. Until then, distribution is hands-on per-distributor (only Oyi/Sergey-level technical founders can manage it on their own).
- **Long-tail expectation:** with 50 distributors averaging $3K/month each = $150K/month platform revenue × 10% = $15K/month to commons (Sasha). With 500 distributors at the same average = $150K/month to commons. The math gets serious only at network scale.
- **Critical risk:** if the per-founder Specificity Matrix experience isn't excellent, the whole sovereignty premise collapses — distributors will feel like they're using Sasha's brand badly relabeled. Quality of voice generation is load-bearing.
- **Acquisition:** the cohort first (Oyi, Sergey are technical enough to do manual setup with Sasha's help; Sandra, Karime, Kirill need the kit before they can adopt). Then weak-tie aligned tribe via the three lead magnets (some users will graduate from #1 to #3 naturally).
- **Status:** ✅ **Legal layer shipped Day 51** (PolyForm NC + Distributor Agreement v0.1 + README rewrite + repo public links). 🔄 **Technical layer not shipped** (provisioning automation + brand wizard + Stripe Connect Express). 🔄 **No commercial distributors signed yet.**
- **Sequencing position:** Phase 1 (alongside #1 and #2). Pilot one real distributor manually (Oyi-level) before building the kit; let real walk-through inform what to automate.

#### What Each Distributor Gets

The full pitch to a candidate distributor (Oyi, Sergey, Sandra, Kirill, Karime, future founders):

**Apparatus:** production-ready ZoG → Excalibur → UBB → published landing flow. ~6-12 months of engineering work, free.
**Methodology:** battle-tested 18-artifact canvas + 15 named principles + Specificity Loop. ~2-3 years of R&D, free.
**Sovereignty:** their domain, their brand, their Supabase, their Stripe. They own everything.
**Voice:** per-founder Specificity Matrix in their idiom. The funnel sounds like them, not like Sasha.
**Commons access:** full read of the public asset/mission database. Cross-tribe matching surface.
**Updates:** when upstream improves, they pull. R&D effectively shared.
**Friction-free start:** free under $1K/month revenue. No upfront fee.
**Keep 90%:** they're owners of their venture, not licensees of someone else's product.
**Optional dual-license path:** if enterprise clients require it later.

What they trade for this: 10% of revenue once they cross $1K/month. That's the tithe.

---

### 4. Venture Studio Play — 10% on Everything on the Platform

**❤️ Essence.** Sasha takes **equity or persistent rev share in the ventures themselves** that founders create using the platform. Sasha is not just renting tools or licensing methodology — he's a **structural co-creator** of every venture born here. The 10% (or 5%, or whatever number) follows the venture **after** they leave the platform, into their independent operations forever, because the venture wouldn't exist without the master holon.

**🧠 Significance.** This is the **highest-upside play** by orders of magnitude. If even one founder using the platform builds a $10M ARR business, Sasha's 10% perpetual share is $1M/year from a single founder. That's bigger than 50 distributors paying tithe. It's also the play that aligns most with traditional venture economics — Sasha is an early co-creator and benefactor of value, he should share in the upside. And it captures value that #3 (platform distribution) misses entirely: someone who learns the methodology, leaves, and builds a $50M company under MIT-licensed code is structurally a free rider on Sasha's years of work; the venture studio play prevents that.

**🔥 Implications.**
- **This is the most politically charged play.** Conscious entrepreneurs typically resist giving equity to a methodology provider — it feels like a startup tax. Compare to: *would you pay 10% of your venture forever to the person who taught you the Lean Startup methodology?* Most founders would say no — and the methodology there is more well-known than Sasha's.
- **So this play needs careful framing:** it's not *"the platform owns 10% of everything you build"* (extractive); it's *"if you opt into the studio tier, we co-found together, you get deeper investment of attention and infrastructure, and we share long-term upside."*
- **Probably structured as:** a SAFE / advisory equity grant in exchange for: deeper hands-on involvement, brand association, network introductions, and ongoing platform updates
- **Should be opt-in and clearly priced relative to the cheaper alternatives:** free tier, $555 ignition, $5K build, OR studio tier (5-10% equity, no upfront fee, full white-glove). This is a **CHOICE**, not a default.
- **Critical risk:** offering this too publicly turns away conscious entrepreneurs at the entry layer. Must stay **quiet, by invitation only**, until at least 3-5 venture-studio deals are proven.
- **Acquisition:** founders who came in via #1 (Conscious Entrepreneur), whose ventures look exceptional, whose founders feel aligned — Sasha invites them to upgrade to the studio tier privately.
- **Status:** 🔭 **Not started.** Concept named, terms not formalized, no founder offered this tier yet.
- **Sequencing position:** Phase 3 (after #1, #2, #3, and #5 have track record). Premature to offer until at least one notable venture has emerged through #1.

---

### 5. Community White-Label Play

**❤️ Essence.** A **collective** (Holo Movement, Symbiosis cohort, a regenerative network, a Y Combinator-style accelerator, a religious community, a corporate L&D department) deploys the platform under **their community's brand** for their members. The community is the customer, not the individuals. Members use the apparatus internally; the community handles billing, onboarding, and member relationships.

**🧠 Significance.** This is the **[Integration Layer Manifesto](../06-architecture/integration_layer_manifesto.md) play in commercial form**. The communities Sasha has already been involved with (Compart's circle, Adam Apollo's Core Nexus, Symbiosis, Gaia Union, Holo Movement) become the first customers. Each community keeps its identity; the underlying tools are shared. This is also **Step 12 of the [Assembly](./planetary_os_assembly.md) enacted commercially** — connective tissue not as a free public good but as paid infrastructure that funds the commons. **The easiest sales cycle of all six plays** because communities have purchasing budgets and decision-makers; one signed deal = many active users.

**🔥 Implications.**
- **Pricing model** is closer to **enterprise B2B SaaS** than to either #3 or #4. Three candidate structures:
  - **Annual flat fee per community:** $5-50K depending on size
  - **Per-member fee:** $5-20/member/month
  - **Revenue share** on what the community generates from members through the platform
- **Probably a tiered offering:** small communities (≤25 members) free, medium ($X/year), large ($Y/year). Free tier for small communities aligns with the Integration Layer Manifesto's "12-person value" framing.
- **Critical decision (open):** does the community get its own data isolation, or does it share the commons? Probably opt-in commons participation per community; some networks (corporate L&D) absolutely won't share their members' data.
- **The integration with the public commons is the unique value proposition** that distinguishes this from generic LMS / community tools.
- **Different from #3** because the deployment is hosted-by-Sasha (or self-hosted by them) for an organizational customer, not a single founder going commercial.
- **Acquisition:** Sasha's existing network of community architects (Adam Apollo, Jacob Griscom, Jan Andrea, Holo Movement leadership, Felipe Leal). Direct conversations, not marketing.
- **Status:** 🔭 **Not started.** Concept aligned with existing relationships; no community deal pursued yet.
- **Sequencing position:** Phase 2 (after #1, #2, #3 have track record but before #4). Sales cycle is longer than #1 but contract values are 10-100x larger.

---

### 6. Unique Business System License Play

**❤️ Essence.** Pure IP licensing. The methodology itself — the playbook, the 18-artifact canvas, the Specificity Loop, the 27-perspective roast, the principles — gets licensed to **third parties who teach or deliver it under their own brand**. Training schools, consulting firms, MBA programs, accelerators, certified coaches. **Decoupled from the code and platform entirely.** Like Strategyzer's Business Model Canvas being licensed to consultancies, or Lean Startup methodology being licensed in trainings.

**🧠 Significance.** This is the **maximum-value extraction layer for the methodology IP independently of the platform**. The platform is one delivery vehicle; the methodology can outlive the platform. Universities, accelerators, large consulting firms have budgets that dwarf individual founders or even communities. They want **named, defensible, certifiable systems** they can teach and put in their curriculum. If the playbook becomes the canonical *"AI-native unique business"* methodology in a few institutions, it becomes self-perpetuating IP with permanent revenue. It's also what protects from the docs being "open" — CC BY-NC-SA already requires commercial use to be permission-based; this play formalizes the commercial permission as a structured license.

**🔥 Implications.**
- **Probably needs a certification program for quality control** — otherwise people teach a watered-down version and dilute the brand
- **Pricing structure:** per-certified-trainer license fee ($1-5K), annual maintenance ($500-2K), maybe per-student fee for accreditation
- **Could attract:** Y Combinator (would they teach UBB to their cohorts?), executive education programs, regenerative leadership schools (Esalen, etc.), Acumen, Reos Partners, etc.
- **Risk:** if the methodology becomes too widely taught, it loses the rare-edge feeling that makes the master holon special. Mitigated by: certification gates, master holon stays canonical reference, certified trainers required to attribute.
- **Tension with #2 (Purpose Coaches):** the system license is more formal than the coach play. Maybe coaches can pay a small fee to get the right to *call themselves Find Your Top Talent–certified* — that bridges the two, but the boundary needs to be drawn clearly.
- **Status:** 🔭 **Not started.** Methodology not yet referenced widely enough to defend as IP at scale.
- **Sequencing position:** Phase 4 (the maturity play). Comes only after the methodology has been referenced widely enough that institutional customers want the formalized license.

---

## Tensions, Combinations, Non-Overlap

| Play | Customer | Primary economic mechanism | Key tension |
|------|----------|----------------------------|-------------|
| #1 User | Individual founder | Direct payment ($555/$5K/$500-mo value ladder) | None — foundational |
| #2 Coach | Existing facilitator with clients | Subscription / per-use / rev-share *(open)* | With #6 (system license) — both involve third parties using methodology; needs clear separation between *hosted-tool-use* (coach) and *certified-teaching-rights* (system) |
| #3 Distributor | Sovereign founder running their own instance | 10% rev-share on platform revenue | With #5 (community white-label) — both are "fork" plays at different scales; needs different agreements + different infra |
| #4 Venture Studio | Exceptional founder coming through #1 | SAFE / advisory equity / persistent rev-share | With #1 (user) — adding equity ask to user pricing changes conversion psychology entirely; must be opt-in tier, not default |
| #5 Community | Collective / organization | Annual fee / per-member / rev-share *(open)* | With #3 — overlap in deployment model; community is "many users under one banner," distributor is "one user as their own brand" |
| #6 System License | Training school / accelerator / certified trainer | Certification fee + annual + per-student | With #2 (coach) — who has the right to call themselves a teacher/practitioner of the system |

**Non-overlap test:** can a single customer reasonably belong to multiple plays at the same time? Mostly yes, and that's healthy:
- A user (#1) can graduate to a distributor (#3)
- A coach (#2) can also adopt distributor instance (#3) for their bigger practice
- A community (#5) can have individual members on plays #1 or #2 inside the community context
- A certified trainer (#6) can also operate as a distributor (#3) under their own brand

**The plays compound; they don't compete.** The architecture is designed for that.

---

## Sequenced Rollout — Four Phases

The plays come online in a deliberate sequence. **Phase 1 must mature before Phase 2 begins. Plays in later phases stay in pocket — not promised — until their phase opens.**

### Phase 1 — Foundation (now → 4-8 weeks)
- **Plays active:** #1 + #2 + #3
- **Status:** #1 active and proven. #3 legal layer shipped Day 51; technical layer (provisioning + brand wizard + Stripe Connect Express) builds in this phase informed by first real distributor walk-through. #2 facilitator console builds in this phase.
- **First commercial distributor target:** Oyi or Sergey (technical enough to do manual setup with Sasha's help). Real-world learning loop before automation.
- **Public messaging:** the foundation is what's offered. #4-#6 stay in pocket.
- **Exit criterion to Phase 2:** at least one signed Distributor Agreement (#3) AND at least one paying coach (#2).

### Phase 2 — Community Adoption (next 2-3 months)
- **Plays added:** #5 (Community White-Label)
- **Status:** Sales conversations with one or two pre-aligned communities (Holo Movement, Symbiosis, Core Nexus). Pricing model decided based on what they need. Pilot one community deal.
- **Public messaging:** *"For aligned founders → Distributor Agreement. For aligned communities → Community White-Label deal."* Two clear paths.
- **Exit criterion to Phase 3:** at least one signed Community White-Label deal AND 3-5 active distributors from Phase 1.

### Phase 3 — Selective Co-Founding (3-6 months out)
- **Plays added:** #4 (Venture Studio, opt-in tier)
- **Status:** Identify 3-5 standout founders from #1 / #3 whose ventures look exceptional. Offer the studio tier privately as an upgrade path. Formalize SAFE / advisory structure with counsel. Use early studio deals to refine terms before publicizing.
- **Public messaging:** unchanged from Phase 2. The studio tier is invitation-only, never on the menu.
- **Exit criterion to Phase 4:** at least one studio tier deal AND methodology referenced commonly enough in the network to attract institutional interest.

### Phase 4 — Maximum IP Extraction (6-12 months out)
- **Plays added:** #6 (Unique Business System License)
- **Status:** Build certification program structure. Approach 1-2 accelerators or training schools as anchor licensees. IP licensing as the long-game maximum extraction layer.
- **Public messaging:** the methodology becomes a licensable system. The platform stays open-source-via-PolyForm-NC; the methodology becomes commercially licensable for institutional teaching.

### Phase Discipline

**Plays in later phases are NOT publicly mentioned.** They are plays in pocket, not promises made. This is critical for:
- Avoiding premature complexity in the offer
- Allowing each phase to mature without dilution
- Preserving optionality (the plays might evolve before their phase opens)
- Keeping the conscious-entrepreneur entry layer (#1) clean of equity asks (#4) or institutional politics (#5, #6)

When a phase opens, this document gets updated with the new public messaging. Until then, only the active phase's plays are visible to outside operators.

---

## What the Commons Becomes Over Time

Every distributor's users choose at the artifact level whether to contribute (default: off). When they do contribute, anonymized artifacts join the public commons:

- **Asset Mappings** — what each tribe member has (skills, capital, networks, time)
- **Mission Discoveries** — what each tribe member is called toward
- **Unique Gift profiles** — anonymized at appropriate granularity
- **Tribe membership signals** — who belongs to which tribe (with consent)

Over time, this becomes the **first cross-tribe coordination commons** — a public dataset that any aligned project (not just Holonic Franchise distributors) can query. Practical uses:

- A distributor running on this code can match their member with someone in another distributor's instance whose missions complement
- A researcher can study how tribes form and what assets predict thriving
- A new project can build on top of the commons rather than starting from zero
- The commons becomes the **integration layer** described in [integration_layer_manifesto.md](../06-architecture/integration_layer_manifesto.md) — emerging from data sharing, not engineered top-down

This is also where the model's long-term moat lives. **Forkable code is forkable; the commons is the irreplaceable asset.**

---

## Implementation Status

### Per-play status (high level)

| # | Play | Legal | Pricing | Infrastructure | Customers | Active phase |
|---|------|-------|---------|----------------|-----------|--------------|
| 1 | Conscious Entrepreneur | n/a — direct customer | ✅ $555 / $5K / $500-mo | ✅ ZoG → Excalibur → UBB → first clients flow | 6 founders (Oyi, Sergey, Sandra, Alexa, Karime, Kirill) | Phase 1 ✅ |
| 2 | Purpose Coach | 🔄 separate agreement *(open)* | 🔄 model *(open)* | 🔄 facilitator console *(not built)* | 0 | Phase 1 🔄 |
| 3 | Platform Distribution | ✅ PolyForm NC + Distributor Agreement v0.1 | ✅ 10% rev share, $1K/mo free tier | 🔄 provisioning automation + brand wizard + Stripe Connect Express *(not built)* | 0 | Phase 1 🔄 |
| 4 | Venture Studio | 🔭 SAFE template *(not drafted)* | 🔭 split *(not decided)* | 🔭 nothing yet | 0 | Phase 3 🔭 |
| 5 | Community White-Label | 🔭 enterprise contract template *(not drafted)* | 🔭 model *(open)* | 🔭 nothing yet | 0 | Phase 2 🔭 |
| 6 | Unique Business System License | 🔭 certification + license template *(not drafted)* | 🔭 fee structure *(open)* | 🔭 certification program *(not built)* | 0 | Phase 4 🔭 |

**Legend:** ✅ shipped · 🔄 in progress / open decision · 🔭 not started

### What shipped on Day 51 (foundation layer)

- ✅ [LICENSE](../../LICENSE) — PolyForm Noncommercial 1.0.0 (canonical text)
- ✅ [LICENSE.md](../../LICENSE.md) — CC BY-NC-SA 4.0 with scope clarified
- ✅ [DISTRIBUTOR_AGREEMENT.md](../../DISTRIBUTOR_AGREEMENT.md) v0.1
- ✅ [README.md](../../README.md) — three-license explanation + self-hosting section + forkable framing
- ✅ [CONTRIBUTING.md](../../CONTRIBUTING.md) — low-maintenance expectations + license alignment
- ✅ Per-founder Specificity Matrix as UBB artifact #19 (`specificity_matrix`)
- ✅ Runtime fallback hook (`useResonanceMessage` reads per-founder matrix when present, falls back to MASTER_MATRIX)
- ✅ Repo link surfaced in three platform locations (Settings, /playbook footer, /codex footer)
- ✅ `resonance_events` table migration spec drafted for Lovable to apply

### Drafted, awaiting Sasha's manual completion

- ⏳ `.env.example` (sandbox blocked Claude from writing .env*; Sasha creates manually)
- ⏳ `git rm --cached .env` (Sasha runs locally)
- ⏳ Apply `resonance_events` migration via Lovable session

### Not yet shipped — sequencing decisions for Phase 1 completion

- ⏳ **Provisioning automation** — Supabase Management API + Vercel API integration to one-click deploy a distributor instance. Needed for "Skool-easy" onboarding.
- ⏳ **Brand wizard** — UI capturing distributor's brand assets (logo, colors, name) and writing them to a `branding` config table on the fresh instance.
- ⏳ **Stripe Connect Express integration** — Sasha sets up as Stripe Platform; OAuth flow integrates Stripe Connect into distributor instances; auto-split routing sends 90% to distributor, 10% to commons.
- ⏳ **Distributor onboarding flow** — guided wizard route at `findyourtoptalent.com/become-distributor` that orchestrates the above.
- ⏳ **Facilitator console** — for play #2; logged-in surface where coaches run sessions for clients.
- ⏳ **Commons publication** — read API + UI surface for the anonymized commons; opt-in checkboxes wired into each artifact-generation flow.
- ⏳ **AI Credits MVP** — schema + debit middleware + Settings page. Tightly related: low-rating regenerate triggers offer "Try a sharper version (1 credit)?" — monetization rail for the Highest-Rated Version Rule.

### Strategic build sequencing

The natural order for the Phase 1 unbuilt pieces:

1. **First commercial distributor** (Oyi or Sergey level — technical enough to do manual setup with Sasha helping). Real-world learning loop before automation. ~1-2 weeks.
2. **Provisioning automation + brand wizard** — only after at least one real distributor flow has been walked through manually. ~3 weeks.
3. **Stripe Connect Express** — once provisioning is working, payments are the next blocker. ~2 weeks.
4. **Facilitator console** (play #2) — same provisioning + auth foundation can underlie both. ~1-2 weeks.
5. **Public "Become a distributor" + "Become a facilitator" landings** — only after all of the above is real. Then Sasha can mention either option in any conversation without it being a paper promise.
6. **Commons publication + AI Credits MVP** — parallel after the above. The commons makes the network compound; AI Credits monetize the regenerate-for-higher-resonance loop.

---

## Open Decisions (16 tracked)

These are the decisions that must be made before each play moves from concept to commercial reality. Documented here so they're visible at a glance.

### For Play #2 (Purpose Coach)
1. **Pricing model:** flat fee / per-use / rev-share — which one
2. **Commercial layer:** separate agreement or lowest-tier of Distributor Agreement
3. **Facilitator console scope:** what minimum surface lets a coach run a session for a client

### For Play #3 (Platform Distribution)
1. **Tier 2 ("Sasha live") definition:** when Sasha is "in the room" for a distributor's clients, the split shifts from 10/90 to 40/60. Exact definition of *"in the room"* needs sharpening — full session per client? Quarterly group? Named in marketing?
2. **Soft pricing floor for distributors:** should there be a minimum price (e.g. "no fire-sale pricing — minimum $X — to protect category-level perception")?
3. **Brand attribution default:** *"Powered by Find Your Top Talent"* in distributor footer — soft requirement or fully optional?
4. **Anonymization spec for commons:** the data classes that flow into the public commons need a written spec
5. **Governing law for Distributor Agreement:** currently placeholder; likely Delaware, USA or another neutral common-law jurisdiction
6. **Tier 1.5 (brand-borrowing) tier:** distributor under their own brand but explicitly references Sasha's methodology in marketing. Could be 20/80 between platform-only (10%) and Sasha-live (40%). Optional — depends on whether brand-borrowing equity proves to be a meaningful asset transfer in practice.

### For Play #4 (Venture Studio)
1. **Equity vs. perpetual rev-share:** which structure aligns better with conscious entrepreneurs
2. **Percentage:** 5% vs 10% (lower is more conscious-entrepreneur-friendly; higher captures more upside)
3. **Trigger events:** equity activates immediately on opt-in, or vests on milestones

### For Play #5 (Community White-Label)
1. **Pricing structure:** annual flat fee vs. per-member vs. rev-share
2. **Free tier definition:** size threshold (≤25 members? ≤50? ≤12 per the manifesto?)
3. **Data isolation defaults:** does community data flow into public commons by default, opt-in, or opt-out

### For Play #6 (Unique Business System License)
1. **Certification structure:** how is quality control enforced
2. **Master holon's role:** Sasha as final approver of certifications, or institutional partner does it
3. **Use-case fees vs. flat fees:** per-student royalty vs. flat per-trainer license

---

## The Naming Question

"Holonic Franchise" was chosen to signal:
- **Holonic** — each distributor is whole on its own AND part of the larger commons (Wilber/Koestler holon definition)
- **Franchise** — the commercial pattern is recognizable (10% tithe, brand sovereignty, shared apparatus) without inventing new vocabulary

Alternatives considered:
- *Holonic Cooperative* — too cooperative-coded; misleading because there's no shared governance
- *Sovereign Distributor Network* — accurate but flat
- *Open Franchise* — clear but vague
- *Fractal Franchise* — also accurate; loses "wholeness" emphasis

If a better name emerges from real distributor conversations, this doc updates. The pattern is more important than the name.

---

## What This Means for Sasha

Strategically, the Holonic Franchise model converts Sasha's role from:

**Old:** sole provider of a methodology and platform → bottleneck to growth, dependent on his time

**New:** master holon of a network of holons, each running the same apparatus in their own voice → growth proportional to the number of distributors, not to his hours

The 10% tithe means his earnings scale with the network's success rather than with his personal labor. The per-founder Specificity Matrix means each distributor's success doesn't dilute his voice — they have their own. The commons means the value he created keeps compounding even when he's not actively building.

This is **Big Idea #1 (master holon prototypes everything before the network) and Big Idea #2 (fractal + viral growth)** made into commercial reality.

---

## Changelog

### v2.0 — April 25, 2026 (Day 51 night)
- **Merged** the short-lived `monetization_strategy.md` into this file. The two docs were redundant — both described the architecture, plays, status, sequencing, and open questions. Single canonical doc going forward; the *Holonic Franchise* name is the brand-bearing name and the only one needed.
- Added: *How the Plays Grow Holonically* (one-table radically-simple synthesis of how each play wraps the prior layer in a larger holon, Sasha's role evolution, revenue scaling with holon size).
- Added: full Heart/Mind/Gut treatment for all six plays (was only narrative description before).
- Added: tensions/combinations/non-overlap matrix.
- Added: four-phase sequenced rollout with explicit exit criteria + phase discipline note.
- Added: per-play implementation status table.
- Reorganized: open questions grouped by play (now 16 tracked across all 6 plays, vs 6 generic ones before).
- All cross-references redirected to point at this single doc.

### v1.0 — April 25, 2026 (Day 51)
- Document created. Codified the operational model that emerged when matrix v2 + license decisions + distributor terms collapsed into a single coherent commercial-decentralization pattern. Five ingredients, comparison table, alignment-without-tokens reasoning, implementation status, strategic sequencing, six open questions.

### Future versions
- **v2.1** — when the first commercial distributor signs (Play #3 first deal). Update Open Decisions answered. Update Implementation Status. Capture lessons learned.
- **v2.2** — when the facilitator console ships and the first paying coach signs up (Play #2 first deal).
- **v3.0** — when Phase 2 opens (first community white-label deal). Public messaging shifts from foundation-only to foundation + community.
- **v4.0** — when Phase 3 opens (first venture studio deal).
- **v5.0** — when Phase 4 opens (first system license deal).

---

*v2.0 · April 25, 2026 (Day 51 night) · Single canonical doc for the Holonic Franchise model + the dynamic, sequenced six-play monetization strategy that operates within it. Six plays. One foundation. Four phases. Sixteen open decisions tracked. The plays compound; they don't compete. Each phase mature before the next opens. Plays in later phases stay in pocket — not promises made. This document is the source of truth for how the venture earns money across all of its commercial layers, and the place where decisions get tracked as the strategy evolves.*
