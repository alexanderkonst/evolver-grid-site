# Practitioner Node (working title)

*New product, Day 130 (July 20, 2026). First instance: Karime. Status: proposal drafted, awaiting first-instance acceptance (BIG IDEA #1: the first holon tests everything).*

## Transformational result

One sentence: **"A practitioner's clients see their own evolution."**

The practitioner stops asserting that their work works. The node shows it: each client takes a Quality of Life snapshot when they begin, retakes it as they go, and watches their own lines move. The practitioner's practices live inside the same place the measurement lives.

## Spec (bundle of shipped modules — zero new build for v1)

- White-label skin (existing skin system; Karime's skin already exists)
- QoL assessment, repeatable, with longitudinal history (existing qol_snapshots)
- Transformational Library preloaded with the practitioner's own practices (existing libraryContent model; ingestion = practitioner sends a list: link + 1 line on what it is + what it changes; voicenote accepted)
- QoL-driven practice recommendation engine (shipped Day 127: Recommended-for-you + Today's Practice)
- Rev-share edges (Domain 111, terms-first per Domain 110): practitioner keeps 90% on their digital products sold through their node; earns 33% on Aleksandr-facilitated products their people buy — **[SUPERSEDED, see corrected line below]**
- Rev-share (corrected Day 130 evening): practitioner receives 90% on platform digital products bought by her portal clients (we keep 10%) and 33% on facilitated containers; the portal's single internal doorway is the free top-talent discovery funnel.
- Pricing frame: $555 setup + monthly per-seat — decided, see "Pricing decision (Day 130)" under the proposal below
- Explicitly NOT in v1: admin UI for practice management, per-practice analytics, custom assessments

## Category & shelf (Day 130)

- Public category name: **Client Evolution Portal**. "Practitioner Node" stays internal.
- Sell from the **client-evolution shelf**, not the software shelf.
- Comparison set: the proof mechanisms practitioners use today (testimonials, before/after stories, outcome questionnaires) and body-evolution trackers (Whoop, Oura, Strava) as the mental anchor: "this, for inner transformation."
- Slug: `/products/evolution-portal`.
- Landing page exists: route `/products/evolution-portal` → `src/pages/EvolutionPortal.tsx` (public, registered in `App.tsx`); shelf card added on `/products` (card8).

## Business case (for Aleksandr)

- Zero marginal build: the product is a bundle of already-shipped modules; margin is composition, not construction.
- Each node = setup revenue + recurring seat revenue + a DISTRIBUTION EDGE: the rev-share inverts the sale. The practitioner is not buying a tool; they are opening an income line by introducing their people to the platform. Nodes become the sales force (BIG IDEA #2: fractal growth through resonant, aligned edges).
- Each node also compounds proof: longitudinal QoL data across practitioners = the output-first measurement corpus (Domain 59/60).
- Risk: support load per node; mitigation: voicenote-to-library ingestion stays manual-by-Aleksandr until node #3, then automate.

## Segments + key benefits + ROI

1. **Somatic/ceremony practitioners** (first: Karime): retention (clients who see progress stay), premium justification for containers, passive rev-share income. ROI: one retained client typically covers the year.
2. **Coaches & therapists**: outcome evidence for a practice that usually cannot show outcomes; differentiation in a market of vibes. ROI: one new client won by shown proof > annual cost.
3. **Retreat centers**: post-retreat integration container -> rebooking. ROI: one rebooked guest > annual cost.
4. **Community leaders with existing skins** (upgrade path to the full community node at $1,500+$75/mo, Oyi tier): practitioner node as the entry rung of the node ladder.

## Landing page (structure for /products entry; final copy derives from the accepted Karime proposal)

1. Hero: "Your clients, seeing their own evolution." Sub: one line naming assessment + your practices + income line. CTA: "Claim your node" (books a call). ONE CTA only.
2. How it works: three steps: Assess -> Practice -> Evolve (retake).
3. What's inside: skin, QoL longitudinal graph, your library, recommendations.
4. "Your node can pay you": the 90/33 rev-share, terms-first, plainly stated.
5. Pricing: $555 setup + small monthly per seats.
6. CTA repeat.

## Terms-first one-pager (Domain 110 discipline — must exist before first sale)

Practitioner owns their practice content and client relationships; platform owns engine and infrastructure; rev-share percentages fixed in writing at entry; either side can exit, practitioner takes their content and client list.

## The Karime Proposal (v2, layered frame — Day 130 evening)

---
Karime, here is what I want to build with you.
Your clients take a Quality of Life snapshot when they start with you. Eight areas of life, one honest self-assessment. You both see where the bottlenecks are. That is what real life coaching starts with, and your clients will feel the structure behind it.
They retake it as they go and literally watch themselves evolve. Almost nobody in this field measures progress. You will.
Inside, they get your practices: your meditations, your recordings, your links. All in your colors, your brand.
And we exchange clients. When someone needs work that is not yours, you send them my way and earn 33% of everything they buy where I facilitate. I send people your way too. Nobody counts 50/50. Everybody wins in every configuration. Your digital products sold through the portal stay 90% yours.
Your client base gets treated with care: at most one email a month from me, always an invitation. You see everything they buy.
Setup: $555, branded fully to you. Then one dollar per active client per month. Ten clients, ten dollars.
To start I need one voicenote: your list of meditations and resources, one line each on what it is and what it changes.
Want it?
---

## The Karime Proposal (v1, superseded — genealogy)

---
Karime, here is what I want to build for you.
Your own corner of the platform, in your colors. Your skin already exists.
Your clients take a Quality of Life snapshot when they start with you. They retake it as they go. They literally watch themselves evolve, and they see that the work with you is what moves the lines.
Inside, they get the Transformation Library with your own practices in it: your meditations, your recordings, your links.
And the node can pay you. You keep 90% on your digital products sold through it. You earn 33% on anything of mine your people buy where I facilitate.
Setup: $555. Then $5 per active client per month. Only clients who actually use it that month count, minimum $25.
To start I need one voicenote: your list of meditations and resources, one line each on what it is and what it changes.
Want it?
---

### Pricing decision (Day 130 evening — supersedes the daytime note below)

**$1 per active client per month, no minimum.** Psychological irresistibility: "ten clients, ten dollars." Setup stays $555, including full branding. This replaces the $5/active-seat model below.

### Pricing decision (Day 130, superseded — genealogy)

Per-seat model chosen: **$5 per ACTIVE seat per month** (active = logged in that month), minimum $25/mo. Rationale: she never pays for dormant clients, the price is invisible next to client value, and it scales with her practice. Anchor: the Oyi community node sits one tier above at $75/mo flat.

This is the decision the earlier "monthly TBD" line in the spec section above points to. *Superseded same-day evening by the $1/active-client model above.*

## Open architecture question (Day 130)

Scope of what the practitioner's clients receive: likely the GROW space only (library + QoL + recommendations + profile), NOT the whole platform; possibly its own sub-brand under the YOU umbrella (working names floated: "YOU grow" / "YOU transform").

Client comms covenant: max one platform email per month to portal-originated users, always an invitation; the practitioner sees all purchases.

Decision pending first instance.
