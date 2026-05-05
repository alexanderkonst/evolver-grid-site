# Distributor Agreement

**Version 0.3 · May 5, 2026 (Day 62)**
*This is a draft. The intent is binding; the legal language will tighten with counsel review before any first signature.*

---

## Two paths to commercial use — pick one

The codebase at [github.com/alexanderkonst/evolver-grid-site](https://github.com/alexanderkonst/evolver-grid-site) (the **Platform**) is licensed for non-commercial use under [PolyForm Noncommercial 1.0.0](./LICENSE). The methodology in `/docs` is licensed for non-commercial use under [CC BY-NC-SA 4.0](./LICENSE.md).

If you want to USE the Platform commercially — to charge clients, sell sessions, run a coaching practice, or operate a paid offering using the methodology — there are two clean paths. Most people take Path A.

### Path A — Subscribe to the hosted Platform (recommended for most)

Subscribe to a tier that grants commercial rights at [findyourtoptalent.com](https://findyourtoptalent.com):

| Tier | Price | What it grants commercially |
|---|---|---|
| **Tasting** | Free, 25 generations | Try the Platform. NOT a commercial license — no client work. |
| **Builder** | $22/mo · $222/yr | Personal use. Build YOUR ONE business. NOT a license to build for paying clients. |
| **Locked-in** | $99/mo · $999/yr | **Commercial license included.** Use the Platform to build canvases for paying clients (coach, consultant, agency). No further rev-share. The subscription IS your commercial license. |
| **Founders 50** | $555 lifetime | Commercial license. First 50 buyers, then $999/yr. Lifetime grandfathered. |
| **Ignition** | $5,555 (one-time) | Commercial license + 1:1 founder coaching from Alexander. |

On Path A, you owe NOTHING beyond the subscription fee. The hosted Platform handles infrastructure, updates, AI gateway, billing — you just use it. No rev-share. No reporting. No audit. The subscription is the commercial license.

**Path A is the right path for ~95% of commercial use cases.** Path B exists for the rare situation where hosted constraints don't fit (regulated industry, white-label brand requirements, custom infrastructure, etc.).

### Path B — Fork and self-host (this document)

If you fork the Platform and run your own instance — modifying the code, hosting on your own infrastructure, operating under your own brand — the Distributor Agreement below applies. Summary: 10% rev-share above a $1,000/month free tier, opt-in commons contribution, attribution preserved, audit by exception.

> **The two paths are mutually exclusive on a given operation.** Path A means "use Sasha's hosted Platform." Path B means "run your own forked Platform." If you outgrow Path A and start forking, you cross to Path B. If you previously forked under Path B and decide hosted is simpler, you migrate to Path A.

The rest of this document is **Path B** — the Distributor Agreement for fork-and-self-host operators.

---

## What this document is (Path B)

This agreement governs **fork-scale commercial use** of either layer — running a forked, self-hosted instance of the Platform to serve paying clients, charging for sessions or products through your forked instance, or otherwise deriving revenue from a self-hosted Platform fork or its methodology.

By deploying a Distributor Instance commercially, you accept the terms below. There is nothing to sign on day one — the act of going commercial is the act of accepting these terms. The intent is friction-free entry, fair contribution, and shared upside.

---

## 1. Definitions

- **Licensor** — Alexander Konstantinov.
- **Distributor** — any person, company, or community that operates a forked or derivative instance of the Platform commercially.
- **Platform** — the codebase, methodology, and modules of Find Your Top Talent / Planetary OS, including all artifacts inheriting the licenses above.
- **Distributor Instance** — your forked, modified, or hosted version of the Platform, operating under your own brand.
- **Platform Revenue** — gross revenue (before your costs and taxes) earned through your Distributor Instance, from any of the following:
  - Sessions, programs, containers, or coaching sold to clients introduced or processed through your Distributor Instance.
  - Subscriptions, memberships, or recurring fees charged for access to your Distributor Instance.
  - Products, courses, or content sold through the Distributor Instance.
  - Marketplace transactions facilitated by the Distributor Instance.
  - **Excludes:** revenue from your other businesses or services that do not flow through, depend on, or originate from the Distributor Instance.
- **Commons** — the public, anonymized, opt-in dataset of asset mappings, mission discoveries, and other shared artifacts contributed by Distributors and their users.

---

## 2. Grant of Commercial License

Subject to your compliance with this agreement, the Licensor grants you a **non-exclusive, worldwide, terminable license** to:

1. **Operate the Platform commercially** — deploy a Distributor Instance and charge for any value flowing through it.
2. **Modify the Platform** — fork, customize, rebrand, extend the codebase to fit your tribe's voice and needs.
3. **Use the methodology** — apply the playbook, frameworks, and protocols of the Platform in your commercial offerings, including using AI-generated artifacts in client work.
4. **Sublicense to your end users** — your clients can use your Distributor Instance under your terms.

This license is **conditional on the rev-share, reporting, and other obligations below**. License terminates automatically upon material breach (see §6).

---

## 3. Revenue Share

### 3.1 Rate

You owe the Licensor **10% of Platform Revenue**, paid monthly.

### 3.2 Free Tier

The first **USD $1,000 of Platform Revenue per calendar month** is exempt. You owe nothing in months where Platform Revenue is below this threshold.

> Example: a Distributor with $4,000 in monthly Platform Revenue owes 10% × ($4,000 − $1,000) = $300 for that month.

### 3.3 Calculation Base

Revenue share is calculated on **gross Platform Revenue** as defined in §1, before deducting your operating costs, payment processing fees, taxes, or refunds. This protects both parties from disputes over what counts as "net."

### 3.4 Payment

- Payment is due by the **15th of the month following** the revenue month (e.g., March revenue paid by April 15).
- Preferred method: **Stripe Connect** (auto-split at the transaction level — see §4). Manual transfer accepted if Stripe Connect is not feasible for your setup.
- Currency: USD. Conversions from other currencies use the average daily exchange rate of the revenue month.

### 3.5 Refunds, Chargebacks, Disputes

If a transaction is refunded or charged back, the corresponding revenue share is reversed in the next monthly settlement.

---

## 4. Stripe Connect (Recommended Default)

The path of least friction is to integrate Stripe Connect into your Distributor Instance using the OAuth flow the Platform provides. When configured:

- Every transaction through your Distributor Instance auto-splits 90% / 10% at the moment of payment.
- You see your 90% in your Stripe dashboard immediately.
- The 10% routes to the Licensor's Stripe account automatically.
- No manual reporting required — Stripe handles the bookkeeping for both parties.
- The free tier ($1,000/month) is reconciled at month-end via a credit if applicable.

If Stripe Connect is not viable for your situation (other payment processor, off-platform sales, etc.), §3.4 manual reporting applies.

---

## 5. Reporting

### 5.1 Monthly Revenue Report

If using Stripe Connect (§4), reporting is automatic and §5.1 does not apply.

If using manual settlement, by the 10th of each month you provide the Licensor with a brief summary of the prior month's Platform Revenue:

- Total Platform Revenue (gross).
- Transaction count.
- Refunds / chargebacks.
- Any breakdown notes you wish to include.

A simple email or shared spreadsheet is sufficient. No formal accounting documents required.

### 5.2 Audit Right

The Licensor reserves the right to request reasonable verification of reported figures **once per calendar year**, with at least 30 days' notice. Verification may include reviewing the Stripe / payment processor records relevant to the Distributor Instance. Audits are at the Licensor's expense unless they reveal underpayment of >10%, in which case the Distributor covers reasonable audit costs.

### 5.3 Honor System

The default mode of this agreement is **trust**. The audit right exists for the rare bad-faith case, not for routine policing. This commercial-decentralization model assumes Distributors are partners, not adversaries.

---

## 6. Brand and Attribution

### 6.1 Your Brand

You operate under **your own brand identity** — your name, your logo, your colors, your domain. The Licensor claims no rights to your brand or to the artifacts your Distributor Instance generates for your users (their Appleseed, their UBB canvas, their Specificity Matrix, etc.).

### 6.2 Optional "Powered by" Attribution

The default Distributor Instance template includes a small footer line: *"Powered by Find Your Top Talent."* This is **soft-required** — you may remove it. Most Distributors keep it as a credit signal; some remove it to fully white-label. Either is acceptable.

### 6.3 No Misrepresentation

You may not represent yourself as the original creator of the Platform's methodology, claim to be Alexander Konstantinov, or imply an endorsement that does not exist. Standard attribution to the methodology when relevant ("based on the Find Your Top Talent / Planetary OS methodology") is welcome but not required.

---

## 7. Commons Contribution

### 7.1 The Commons

The Platform includes a public, anonymized **Commons** — a shared dataset of asset mappings, mission discoveries, and other artifacts that Distributors and their users have explicitly chosen to share. The Commons grows in value with every contribution; every Distributor benefits from a richer Commons (matchmaking, discovery, cross-tribe collaboration).

### 7.2 Opt-In, Not Default

Contribution to the Commons is **opt-in at the artifact level**. Each artifact-generation flow includes an explicit checkbox; the default is **off**. No data flows from your Distributor Instance to the Commons without explicit consent from the user who generated it.

### 7.3 What the Commons Receives

Only the data classes the user explicitly opted to share, anonymized at the level appropriate to the artifact type. The Licensor publishes the anonymization spec separately and updates it with notice.

### 7.4 Commons License

Contributions to the Commons are released under **CC BY 4.0** (Attribution only) so that the Commons remains usable as a public good across all Distributors and any aligned external project.

---

## 8. Modifications and Improvements

### 8.1 Modifications Stay With You

You may modify the Platform's code freely within your Distributor Instance. You are **not required** to publish your modifications back to the Licensor. (PolyForm NC is not a copyleft license; it does not impose share-back obligations on modifications.)

### 8.2 Voluntary Contributions

If you contribute improvements back to the upstream repository (via pull request), those contributions are licensed under the project's standard licenses (PolyForm NC for code, CC BY-NC-SA for docs) and become part of the Platform.

### 8.3 No Obligation Either Way

The Licensor is not obligated to accept any contribution. You are not obligated to make any. The relationship is voluntary on both sides at the modification layer.

---

## 9. What You Cannot Do

For clarity:

- **You cannot sublicense the underlying Platform code itself** as a standalone offering (e.g., you cannot resell the Platform code to other parties as a SaaS template). You can only operate Distributor Instances under your own brand for your own users.
- **You cannot remove the LICENSE, LICENSE.md, or DISTRIBUTOR_AGREEMENT.md files** from your fork, even if you remove all UI references to them.
- **You cannot use the Platform to deceive users** about the nature of the methodology, the source of the artifacts, or the existence of this Distributor model.
- **You cannot circumvent the rev-share** by routing Platform Revenue through external entities to misrepresent it.

---

## 10. Termination

### 10.1 Termination by Distributor

You may terminate this agreement at any time by ceasing all commercial use of the Platform and notifying the Licensor in writing. Outstanding revenue share through the date of termination remains due.

### 10.2 Termination by Licensor

The Licensor may terminate this agreement upon **material breach** (non-payment >90 days, deliberate misreporting, prohibited use under §9) with 30 days' written notice and opportunity to cure.

### 10.3 Effect of Termination

Upon termination, your commercial license ends. You must cease commercial operation of the Distributor Instance within 60 days. Outstanding revenue share remains due. Artifacts already generated for your users remain valid (they are theirs) — termination does not retroactively invalidate user-owned outputs.

---

## 11. Dual Licensing

If the rev-share or commons-contribution model is incompatible with your organizational requirements (e.g., enterprise procurement that cannot accept rev-share clauses), contact the Licensor to discuss a **separate flat-fee commercial license**. Rates are set on a per-engagement basis based on scope and scale.

---

## 12. No Warranty, Limitation of Liability

The Platform is provided **as-is**, without warranty of any kind. The Licensor is not liable for any loss, damages, or claims arising from your operation of a Distributor Instance. Standard "as-is" software clauses apply.

This is not legal advice. Both parties are responsible for their own legal and tax compliance in their jurisdictions.

---

## 13. Changes to This Agreement

The Licensor may update this agreement to clarify language, add new optional contribution paths, or adjust terms in response to scaled-up operations. Substantive changes (revenue share rate, free tier, scope) will be **prospective only** — they apply to revenue earned after the effective date of the change, never retroactively. Existing Distributors will be notified at least 60 days before any substantive change.

---

## 14. Governing Law

*Placeholder pending counsel review.* The Licensor's working assumption is to default to a neutral jurisdiction (likely Delaware, USA, or another common-law jurisdiction with strong contract enforcement). This will be finalized in v1.0.

---

## 15. Generated Outputs

This section governs the *artifacts you produce* through the Platform — your canvases, offer copy, landing-page text, blueprints, and the rest of the 18-artifact corpus generated via `/ubb` and adjacent surfaces. It applies whether you reach the Platform via Path A (hosted subscription) or Path B (Distributor Instance).

### 15.1 You own your outputs

The artifacts you generate are **yours**. You retain full ownership of the *content* — the words, the strategy, the positioning, the canvas. You can keep them, edit them outside the Platform, paste them onto your website, and treat them as your own work product. The Licensor claims no ownership over what you produce.

### 15.2 Commercial use of outputs follows your tier

The right to use your outputs *commercially* tracks the same two-path structure as the rest of this agreement:

- **Tasting / Builder** — outputs are for **your own one business** only. You may build, refine, and ship YOUR offer using them. They are NOT licensed for delivery as paid client work, packaging into a commercial program you sell, or use inside an agency engagement billed to a third party. Upgrading the tier at any time retroactively grants commercial rights to outputs already produced.
- **Locked-in / Founders 50 / Ignition** — outputs may be used commercially in your own work *and* in client work, with no rev-share. Your subscription IS the commercial license for the outputs.
- **Distributor Instance (Path B)** — outputs generated through your forked instance are part of the Platform Revenue surface and are governed by the rev-share, reporting, and other obligations of this agreement.

### 15.3 Methodology shape stays licensed

What you own is the *output*. What remains licensed under CC BY-NC-SA 4.0 is the *shape that produced it* — the artifact taxonomy, the prompt sequences, the phase-group ordering, the monotonic Improve loop. You may not extract those structures from the Platform and ship them as a competing tool, course, or framework, regardless of subscription tier. You are free to internalize the methodology in your own thinking — that is the point. You are not free to repackage and redistribute it.

### 15.4 In short

| You may | You may not |
|---|---|
| Use, edit, publish, and own the outputs you generate | Re-publish the prompts, taxonomies, or sequencing as your own framework |
| Upgrade tiers and retroactively gain commercial rights to existing outputs | Sell client deliverables produced on Tasting or Builder tiers |
| Apply the methodology in your own thinking and offers | Operate a Distributor Instance commercially without the rev-share obligations of §3 |

---

## 16. Spirit of This Agreement

If a situation arises that this document does not address, the spirit to apply is:

- **Distributors are partners, not licensees.** The 10% is a tithe that grows the commons that grows everyone.
- **Friction is the enemy.** The simplest interpretation that honors both parties wins.
- **Trust by default, audit by exception.** Most Distributors will be honest. The agreement is structured for that majority.
- **The Commons is the long game.** Small short-term decisions should favor the long-term health of the shared dataset and the network of holons.

When in doubt, talk to the Licensor directly: [Telegram](https://t.me/integralevolution).

---

*v0.3 · May 5, 2026 (Day 62) · Added §15 "Generated Outputs" to formalize ownership and commercial-use terms for artifacts produced via `/ubb` and adjacent generators. User owns the outputs; commercial rights track tier; methodology shape stays licensed. Spirit of This Agreement renumbered to §16. Drafted by [Alexander Konstantinov](https://aleksandrkonstantinov.com) with AI assistance.*

*v0.2 · April 27, 2026 (Day 53) · Two-paths preface added so visitors aren't dropped into fork-scale legal text when they want the hosted subscription. Path A (hosted Builder/Locked-in/Founders 50/Ignition tiers) clarified as the default-recommended commercial path; Path B (fork + self-host with 10% rev-share above $1K/mo) preserved for the rare cases that need it. Drafted by [Alexander Konstantinov](https://aleksandrkonstantinov.com) with AI assistance. Pending v1.0 finalization with legal counsel review.*

*v0.1 · April 25, 2026 (Day 51) · Initial draft during the Specificity Loop / commercial-decentralization architecture emergence.*
