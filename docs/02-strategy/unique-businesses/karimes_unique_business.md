# Karime's Unique Business

> *© 2026 Alexander Konstantinov · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)*

> **Client · Karime Kuri**
> **Facilitator:** Alexander Konstantinov (Sasha)
> **Practitioner:** Karime Kuri — grounded emotional support for people moving through heartbreak, grief, burnout, relationship pain, family crisis, impossible decisions, and emotionally overwhelming seasons of life
> **Status:** Funnel live (Day 88, June 6, 2026, v1.1 copy-clarity pass). Other UB-canvas artifacts (Uniqueness, Tribe, Pain, Promise, Value Ladder, etc.) not yet sessioned — placeholders below.

> **How to use this file:** the funnel is currently the live, load-bearing part of Karime's business with Sasha. Everything else in the canvas (full UB artifact set) is captured here as a placeholder so the file can grow into a complete canvas if/when Karime does an Ignition Session. For now, treat the **Lived User Journey** section as the single source of truth for how a stranger becomes a paying client.

---

## Artifact Status

| Artifact | Version | Precision | Status |
|---|---|---|---|
| Funnel (live) | **v1.1** (Day 88, June 6, 2026) | — | ✅ Shipped — `/build/karime` + `/build/karime/intake`, WhatsApp-relay submission, cal.com booking downstream. v1.1: copy-clarity pass (bridge trim, emphasis restraint, CTA unification, intake-CTA reframe). |
| Uniqueness | — | — | 🔄 Not yet sessioned |
| Shadow | — | — | 🔄 Not yet sessioned |
| Myth | — | — | 🔄 Not yet sessioned |
| Tribe | — | — | 🔄 Implicit from current copy: people in delicate life moments (heartbreak, grief, burnout, relationship pain, family crisis, impossible decisions); not yet formally articulated |
| Pain | — | — | 🔄 Implicit: *"still holding everything together while quietly falling apart inside"* (live hero copy) |
| Promise | — | — | 🔄 Implicit: *"you do not have to carry this alone"* (live H1) |
| Value Ladder | — | — | 🔄 Two rungs visible: free 20-min fit call → first paid 1hr session → 3-month engagement (pricing bespoke, set during the first paid session) |

---

## Brief context

**Karime** is an Oxford alum, former Project Lead at the World Economic Forum's Center for Emerging Technology, and a Global Fellow Leader who walked away from the WEF track to do this work. She trained as a transformational life coach at Sofia University, San Francisco, and brings her international policy background into the depth of the inner work she now holds.

**The Sasha–Karime arrangement** (operational, not contractual yet): Sasha runs the funnel front door (cold WhatsApp inbound, qualifying conversation, scheduling) so Karime stays in her zone — the actual practitioner work with clients. Sasha's number is the inbox for all visitor-side communications. Karime joins the cal.com call qualified and prepared.

**Why this is a useful instance to document:** Karime's funnel is the cleanest *practitioner-modality* funnel on the platform — single offer, no productized methodology, no platform integration, no value-ladder optimization. It tests whether the Cormorant + warm-Moroccan visual register + WhatsApp-relay submission pattern works for a pure "private session with a person" offer. If it converts, this same pattern becomes the template for other practitioner-style instances Sasha hosts.

---

## Lived User Journey — Practitioner-Relay Funnel (Day 85, May 25, 2026)

The funnel is **monogamous to the WhatsApp inbox**. Every step ultimately routes the visitor's intent into the same Sasha-owned WhatsApp thread (`+1 415 707 3432`), where Sasha qualifies and hands off to Karime. There is no auth, no account, no platform login, no payment in-funnel. The cal.com booking happens AFTER Sasha confirms fit.

**Architectural principle:** ONE inbox for all inbound. Two surfaces (offer + intake) progressively reveal Karime; both surfaces submit into the same WhatsApp thread. The visitor never has to remember a password or check their email — the channel they messaged on IS the relationship.

### Surface 1 — `/build/karime` (cold inbound, offer)

**Visual register:** warm Moroccan-sunset HLS video bg (Mux), glassmorphic cream-tinted content container, Cormorant Garamond editorial type. Karime skin tokens applied via `pushTemporarySkin("karime")` on mount.

**Copy structure** (current live):

| Element | Copy |
|---|---|
| **Eyebrow** | *PRIVATE EMOTIONAL SUPPORT FOR DELICATE LIFE MOMENTS* (Cormorant small-caps, 13px tracked 0.22em — v1.1 size bump from 11px/0.28em so it earns its positioning-lead role under the H1) |
| **Italic setup** | *"Still holding everything together while quietly falling apart inside?"* |
| **H1** | *"You do not have to carry this **alone**."* (alone in copper-bronze emphasis; v1.1 — only emphasis span on the page) |
| **Bridge (v1.1, trimmed)** | *"Deeply grounded emotional support for people moving through heartbreak, burnout, and the seasons that become too heavy to hold alone."* (was a 7-item pain list in v1.0; trimmed to 3 + closing image, no emphasis span — the H1 holds the only highlight) |
| **Italic three-liner** | *"Careful attention. / Emotional honesty. / Held, not fixed."* (held in v1.1 as the punchy second beat before the CTA; "Held" emphasis span removed) |
| **CTA button** | *"Speak with Karime"* (primary dark glass — v1.1 unified from prior "Book a 20-min conversation" so the label matches the warm relational register; doc-canonical) |
| **Microcopy** | *"Free 20-minute fit call · Online sessions worldwide · In-person by arrangement"* (v1.1 — single canonical label for the fit call, in-person phrasing matched to doc's "by arrangement") |
| **CTA action** | Opens `wa.me/14157073432?text=Hi Sasha, I came through Karime's page and would like to connect.` in a new tab |
| **v1.1 cuts** | The two duplicate bold blocks ("A space to soften, hear yourself clearly again..." and "Just honest, attentive care during the moments that become too heavy to hold by yourself.") were removed — the bridge + italic three-liner already do that work, and four near-equal bold blocks were collapsing the hierarchy after the H1. |

**The submission action is the WhatsApp draft.** The visitor sees their own outgoing message in WhatsApp, hits send, the thread opens in Sasha's WhatsApp. No form fields collected on the page — the visitor's phone number IS the identity.

### Surface 2 — `/build/karime/intake` (warm follow-up, qualifying form)

Reachable only by direct URL. Sasha sends this link manually after the initial WhatsApp exchange, once he's qualified the inbound and wants more signal before scheduling.

**Layout:**

1. **Header:** *"Before we meet."* + Ornament
2. **About Karime:** single paragraph — Oxford → WEF → walked away → Sofia training → "She is here **by choice**."
3. **The path:** three numbered gold-pip badges with vertical gold connector line —
   - Step 1: *"20-minute fit call."* (free; meet Karime, share what's bringing you here, both feel for fit)
   - Step 2: *"Your first 1-hour session."* (co-design a personalized 3-month plan; pricing set in this session based on modalities + cadence + time)
   - Step 3: *"A 3-month result-oriented engagement."* (walk the plan together; Karime holds the container)
   - Closing line: *"Online sessions worldwide. In-person sessions by arrangement."*
4. **To help Karime prepare thoughtfully:**
   - Sub-prompt: *"Before scheduling, choose the type of support that feels most aligned for you right now."*
   - Question: *"Which kind of support feels most aligned right now?"*
   - Helper: *"Choose all that apply"* — multi-select (Day 85)
   - 5 options (tactile cards with gold check glyph when selected):
     - Gentle conversation and emotional clarity
     - Deep emotional support and nervous system care
     - Spiritual guidance and inner work
     - Ceremonial or medicine-supported work
     - I'm not sure yet, but something needs to change
5. **Progressive-reveal CTA cluster** (renders only after ≥1 selection — v1.1 reframe; copy below is current shipped):
   - Heading: *"Sasha is Karime's first contact. He'll read your message on WhatsApp and reply within hours with times for your call with Karime."*
   - CTA: *"Send to Sasha on WhatsApp"* (primary dark glass)
   - Micro: *"Opens WhatsApp with your message pre-written · No signup needed"*
   - Footer: *"Questions? Telegram @integralevolution · WhatsApp +1 (415) 707-3432"*

   **v1.1 reframe rationale.** v1.0 heading + CTA both said "Send your reflection." Two problems: (1) the visitor never wrote a reflection (they ticked checkboxes), so the word read as abstract jargon; (2) "we'll be in touch" and "continues on WhatsApp" did not name what physically happens on click. v1.1 names the receiver (Sasha), his role (Karime's first contact), the channel (WhatsApp), and what the click does (opens WhatsApp with the message pre-written). The visitor now knows exactly what's about to happen before they click.

**The CTA action** opens the same WhatsApp thread (`wa.me/14157073432`) with this prefilled body (built dynamically from the visitor's selections):

```
Hi Sasha,

Quick follow-up after Karime's intake page.

The kind(s) of support that feel most aligned for me right now:
• Gentle conversation and emotional clarity
• Spiritual guidance and inner work

Looking forward to my conversation with Karime.
```

(Plural "kinds / feel" vs singular "kind / feels" branches on selection count.)

**The intake submission is a continuation of the existing thread.** Sasha sees the reflection drop into the same conversation he started qualifying. Now he has the support-shape signal — he replies with the cal.com link (`https://cal.com/karimekuri/20min`) OR schedules directly on the visitor's behalf.

### Day 1 — Visitor lands on `/build/karime` (cold)

1. Lands via Sasha's WhatsApp share (or Karime's, or a network referral)
2. Reads the eyebrow → italic setup → H1 → bridge — ~30 seconds
3. Either clicks *"Speak with Karime"* (warm) or closes the tab (cold)
4. If clicks: WhatsApp opens with the prefilled *"Hi Sasha, I came through Karime's page..."* message
5. Visitor edits or sends as-is — message lands in Sasha's WA

### Within minutes — Sasha responds

6. Sasha reads the inbound, replies with a short qualifying message (free-form, no template — he reads the energy)
7. If the fit feels right, Sasha sends `findyourtoptalent.com/build/karime/intake` with a short note: *"have a look, share a reflection, we'll set up a time with Karime"*

### Day 1–3 — Visitor opens the intake link

8. Reads About Karime + the 3-step path — ~2 minutes
9. Sees the support-type question, picks 1–5 options that match where they are
10. The CTA reveals progressively under the selections
11. Clicks *"Send your reflection"* — WhatsApp opens again, prefilled with their reflection
12. Sends the message back into the same Sasha thread

### Same day or next — Sasha schedules

13. Sees the reflection arrive in the same thread (not a new conversation — same number, same chat)
14. Either replies with the cal.com link OR proposes 2–3 times and schedules directly
15. Visitor books / accepts a time
16. Sasha confirms with Karime that a fit-call is on her calendar

### Day of the call — Karime + visitor meet on the 20-min fit call

17. 20 minutes, free, video call (cal.com handles the bridge)
18. Both feel for fit. Visitor shares what's bringing them. Karime listens, asks a few questions, shares how she works.
19. Two outcomes:
    - **Yes (fit):** they book the first paid 1hr session
    - **No (not fit):** Karime declines warmly, may refer them to someone better suited

### First paid 1hr session — co-design

20. Karime + visitor co-design the personalized 3-month plan
21. Pricing for the engagement is set during this session (bespoke, based on modalities + cadence + time)
22. Payment terms handled by Karime directly (out-of-funnel)

### Months 1–3 — engagement

23. They walk the plan together. Karime holds the container.

---

## Architectural principles

1. **WhatsApp is the inbox.** All visitor-side communication routes through Sasha's WhatsApp number (`+1 415 707 3432`). No email capture, no platform account, no auth wall. The phone number on the other side of the message IS the identity.

2. **Sasha is the front door, Karime is the practitioner.** Sasha qualifies, schedules, and protects Karime's time and energy. Karime does the actual practitioner work in sessions. The visitor never sees this seam — the WhatsApp message addresses Sasha by name but the conversation is *about* meeting Karime.

3. **Two surfaces, one inbox.** Both `/build/karime` and `/build/karime/intake` route their CTAs to the same WhatsApp thread. The intake is just a deeper reveal of Karime + a qualifying-signal collector; it doesn't open a different channel.

4. **Progressive reveal at every step.** The cold landing reveals the offer. The intake link reveals Karime's bio + the path + the support-shape question. The CTA on intake reveals only after the visitor makes a selection. Each step earns the next.

5. **No cal.com in the visitor's outgoing messages.** Earlier draft included Karime's cal.com link inside the visitor's own message body — strange loop (visitor sending Karime her own booking link). Fixed Day 85. The cal.com link travels in Sasha's REPLY, not the visitor's submission.

6. **Funnel monogamy at each stage.** One primary CTA per surface. /build/karime → "Speak with Karime." /build/karime/intake → "Send your reflection." No competing CTAs that scatter the visitor's attention.

7. **The intake form is a signal, not a gate.** Skipping intake is fine — Sasha can still schedule directly from the WhatsApp exchange. The intake exists to deepen the read and give Karime preparatory context, not to block flow.

8. **No platform integration.** Karime's offer lives entirely outside the FYTT platform / Top Talent / Mission / Assets / QoL machinery. Visitors who land on `/build/karime` do not see the BUILD / JOURNEY / ME sidebar in a way that pulls them into Sasha's product. The shell is dressed with `enableRailMinimize` + Karime skin so the compact rail stays quiet and the editorial card holds the screen.

---

## What's deliberately out of this flow

- **No nurture email sequence.** No email captured, so nothing to nurture. The WhatsApp thread itself is the long-tail channel.
- **No in-funnel payment.** Pricing is bespoke and set in the first paid session. No price quoted on either surface; no payment widget; no Stripe checkout.
- **No auto-booking from the website.** The visitor cannot book the 20-min fit call directly from `/build/karime` or `/build/karime/intake` without going through WhatsApp first. Deliberate: Sasha wants to qualify every inbound before Karime's calendar accepts it.
- **No name / email / phone fields on the intake form.** Identity arrives via the WhatsApp channel.
- **No public testimonials on either surface.** Karime's practice is private by nature; testimonials would either name clients (privacy violation) or be anonymous (low credibility). The credibility lives in Karime's bio paragraph (Oxford / WEF / walked away / Sofia trained / "by choice").
- **No music player on these pages.** /build/karime is explicitly outside `MUSIC_BUTTON_ROUTES` — the modality of the page is silence + breath, not background music.

---

## Open implementation decisions / next steps

1. **Whether to surface a self-serve cal.com link** as a secondary "Or book directly" action on the intake page, for visitors who don't want to wait for Sasha's reply. Trade-off: faster conversion vs. losing the qualifying step. Current call: NO — keep Sasha as the gate. Revisit if intake conversion stalls.

2. **Email channel parallel to WhatsApp.** Sasha asked about email as an alternative inbox. Not yet built. Decision deferred until WhatsApp inbound volume shows whether it's needed. Implementation would be a `mailto:` secondary CTA OR a server-side relay (Resend → Sasha's inbox).

3. **Karime's own number for direct contact.** Currently only Sasha's WhatsApp number is exposed. If/when Karime wants direct visitor messages (bypassing Sasha as gate), add her number to the intake footer alongside Sasha's. Wait for her to ask.

4. **Booking confirmation in WhatsApp.** Cal.com sends a confirmation email to whoever books. Should Sasha ALSO send a WhatsApp confirmation in the thread? Probably yes (the visitor already trusts that channel), but not implemented yet. Manual for now.

5. **Source attribution.** Currently no analytics fired on either surface (unlike the main FYTT funnel which uses `funnelAnalytics.ts`). Decision: add `funnel_event` rows when /build/karime and /build/karime/intake load + when their CTAs fire, so Sasha can see inbound volume + drop-off. ~30 min of work.

6. **Mobile QA.** The intake form's checkbox cards + progressive-reveal CTA need a fresh mobile pass under the karime skin at 375px width. Last visual sweep was on /build/karime not /build/karime/intake.

7. **Should the funnel-v2 `?path=` machinery touch this?** No — Karime's funnel is a separate practitioner offer, not a path into the FYTT platform. The two funnels are siblings, not nested. `?path=match` and `?path=build` belong to FYTT-the-platform; Karime sits outside that namespace at `/build/karime`.

---

## File map (code that powers this funnel)

| Surface | File | Notes |
|---|---|---|
| Offer page | `src/pages/KarimeOffer.tsx` | Cormorant editorial, warm Moroccan video bg, WhatsApp CTA |
| Intake page | `src/pages/KarimeIntake.tsx` | About + path + multi-select question + progressive CTA reveal + WhatsApp form submission |
| Video background | `src/components/landing/KarimeHlsBackground.tsx` | Mux HLS stream selection for karime skin |
| Skin tokens | `src/index.css` → `[data-skin="karime"]` block | Warm cream / parchment / copper palette |
| Routes | `src/App.tsx` (`/build/karime`, `/build/karime/intake`) | Both public, no auth |
| WhatsApp number constant | `src/pages/KarimeOffer.tsx` (`WHATSAPP_BOOKING_URL`) + `src/pages/KarimeIntake.tsx` (`KARIME_WHATSAPP_URL`) | Same number; misnamed historically — actually Sasha's number |
| Cal.com booking | `src/pages/KarimeIntake.tsx` (`CALCOM_BOOKING_URL`) | Used in Sasha's reply, not in visitor's outgoing message |
| Telegram fallback | `src/pages/KarimeIntake.tsx` (`KARIME_TELEGRAM_URL`) | Footer contact, secondary channel |

---

## Cross-references

- Sasha's own funnel narrative (the model this doc follows): [`alexanders_unique_business.md` → Lived User Journey](./alexanders_unique_business.md#lived-user-journey--reveal-anchored-funnel-day-61-may-4-2026)
- Sasha's funnel v2 platform spec (NOT this funnel; the FYTT `?path=` routing): [`docs/specs/funnel-v2/funnel-v2_product_spec.md`](../../specs/funnel-v2/funnel-v2_product_spec.md)
- Sasha's funnel v2 strategic frame: [`alexanders_unique_business.md` → Funnel Architecture v2](./alexanders_unique_business.md#funnel-architecture-v2--matching-as-hero-day-77-may-20-2026)
- Unique Business Playbook (the artifact framework Karime's full canvas could grow into): [`docs/03-playbooks/unique_business_playbook.md`](../../03-playbooks/unique_business_playbook.md)
- Sibling client canvases: [`oyis_unique_business.md`](./oyis_unique_business.md) · [`sergeys_unique_business.md`](./sergeys_unique_business.md) · [`sandras_unique_business.md`](./sandras_unique_business.md) · [`alexas_unique_business.md`](./alexas_unique_business.md) · [`kirills_unique_business.md`](./kirills_unique_business.md)

---

*v1.0 · Day 85 · May 25, 2026 · Funnel section authored after the Day 85 build cycle that (a) converted the intake question from single-select to multi-select, (b) replaced the broken "visitor sends Karime her own cal.com link" message with a proper WhatsApp follow-up addressed to Sasha (front-door pattern matching the /build/karime cold inbound), and (c) added the "Continues on WhatsApp · No signup needed" microcopy under the CTA. Other UB-canvas sections (Uniqueness, Shadow, Myth, Tribe, Pain, Promise, Value Ladder) left as placeholders — Karime has not done an Ignition Session, and the funnel works without them for now.*

*v1.1 · Day 88 · June 6, 2026 · Copy-clarity pass on both surfaces after a Top-Talent-grounded UB synthesis revealed the funnel was leaving signal on the table. Shipped: bridge trim (7-item pain list → 3-item), cut two duplicate bold blocks, restrained emphasis to one span per page (H1 "alone" only), unified CTA label across page + microcopy + doc ("Speak with Karime" / "Free 20-minute fit call"), eyebrow size bump (11 → 13px), and full reframe of the intake CTA cluster from the abstract "Send your reflection" → the literal "Send to Sasha on WhatsApp" with explicit naming of who's on the other end and what physically happens on click. Held for sign-off (NOT shipped): platform-wide rail + sidebar visibility — both surfaces still render inside `GameShellV2` with the full BUILD-space sections panel visible, which contradicts the doc's "outside the FYTT platform" architectural principle. Three sign-off options drafted (CSS-only hide, new GameShellV2 prop, slimmer page shell); awaiting Sasha's call.*
