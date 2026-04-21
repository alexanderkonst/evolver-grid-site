# Funnel Synthesis — Current State, Day 47 (2026-04-21 evening)

> High-precision map of every user touchpoint, action, and piece of copy in Aleksandr's funnel, as actually implemented in the codebase tonight. Intended input for GFOA analysis.
>
> **Scope:** Public funnel (no-auth → paid commercial session). Authenticated surfaces (/game/*, /my-artifacts) are deliberately omitted — they are post-purchase product, not acquisition funnel.
>
> **Fidelity:** Every copy quote below is lifted verbatim from the live codebase. Every URL is a real route. Every conversion link is the real destination. Where I don't know something, I say so.

---

## 0. The shape (one paragraph)

A guest lands on `/` and sees a single commitment ("Find your top talent") and an escape hatch ("See the exact playbook"). The commitment routes to `/zone-of-genius`, which offers two lanes to produce a personalized archetype reveal — a fast AI-assisted lane (1 min) and a guided assessment lane (10–15 min). Both lanes converge on the same result shell: a named archetype, a bullseye sentence, three lenses (Talents / Prime Driver / Archetype), and a structured "The Gap" argument that reframes the reader's problem as a structural gap rather than a readiness gap. The result ends with a primary CTA to the $555 Ignition Session (`/ignite`) and a secondary CTA to a 6-question diagnostic (`/quiz`) for users who want more reassurance before committing. Quiet email capture sits at the footer. The commercial page (`/ignite`) is a long-form sales page with a single $555 Stripe link, a free 15-min clarity call fallback, a delayed-interest email capture, and a guarantee. An alternative `/path` page exposes the whole 7-step value ladder for users who want to see the full commercial architecture before buying. An alternative `/playbook` page exposes the methodology itself (Open Blueprint Paradox — give the method away, precision IS the product).

---

## 1. Entry surfaces

All public (no auth required). All render inside `GameShellV2` (Panel 1 spaces rail · Panel 2 sections list · Panel 3 content) on a shared Apple iOS 26 Liquid Glass system over a looping Mux video background.

| URL | Component | Role |
|-----|-----------|------|
| `/` | `MethodologyLandingPage` | Front door — hero headline + two CTAs |
| `/zone-of-genius` | `ZoneOfGeniusEntry` | The lead magnet (free archetype reveal) |
| `/playbook` | `PlaybookPage` → `StepCard` | The methodology itself, all 7 steps, visible by default |
| `/path` | `PathPage` | The value ladder (commercial architecture) |
| `/ignite` | `IgniteSession` | The $555 commercial offer (Section 7 in Sasha's canvas) |
| `/quiz` | `GeniusQuiz` | 6-question diagnostic (4 archetypes: Invisible Genius / Multi-Talent Trap / Misaligned Vector / Underpriced Operator) |
| `/my-artifacts` | `MyArtifactsPage` | Authenticated only — user's saved artifacts |

---

## 2. Landing (`/`) — MethodologyLandingPage

**Visual:** Panel 3 is a bright frosted wash over a slow Mux video. Hero text is in Cormorant Garamond, dark navy `#0a1628`, with seven neon-gradient-highlighted words (UV → IR spectrum, one per playbook step).

**Copy (verbatim):**

> Find Your **Top Talent**. **Productize** It. **Build** It, **Launch** It, **Scale** It Alongside **Impact** Entrepreneurs.

Highlighted words map to steps 1 → 7:
- **Top Talent** — violet (Step 1, discover)
- **Productize** — indigo (Step 2–3, articulate/enhance)
- **Build** — blue (Step 4, build product)
- **Launch** — cyan (Step 5, beta-test)
- **Scale** — green (Step 6, go live)
- **Impact** — orange-red (Step 7, scale impact)

**Below the headline — two CTAs in Apple Liquid Glass pills:**

1. Primary (liquid-glass-strong): **"Find your top talent"** → `/zone-of-genius`
2. Meta line (below primary, wider than button): ↑ Claim your gift · takes two minutes
3. Secondary (liquid-glass): **"See the exact playbook"** → `/playbook`

No arrows on either button. No testimonials. No "about". No social proof on the front door. This is intentional minimalism.

**User state entering this surface:** guest. `supabase.auth.getSession()` returns null. A local `game_profile` row may already exist (anonymous profile via `getOrCreateGameProfileId`) if they've been here before.

**Drop-off risk:** The hero doesn't explicitly name a pain. A visitor who doesn't self-recognize into "productize / build / launch / scale impact" may bounce. The meta line "Claim your gift · takes two minutes" is the only loss-aversion trigger and it sits between (not above) the buttons.

---

## 3. ZoG Entry (`/zone-of-genius`) — ZoneOfGeniusEntry

The lead magnet. Structured as a 4-step in-page state machine — the user never leaves this URL until they either hit "paste response" + generate, or click into the guided assessment.

### 3.1 Hero

**Visual:** Dodecahedron icon (breathing animation) · dark navy Cormorant Garamond headline · two short-truth paragraphs in Source Serif 4 italic.

**Copy:**

> Why is it still so hard to **explain what you do** — and turn it into something people **actually pay for**?

(Violet gradient on "explain what you do" · orange-red gradient on "actually pay for".)

> There's a **unique way** you think and solve problems.
>
> *It just hasn't been **packaged** into a product people can **purchase**.*

### 3.2 Step: choice (default state)

Single CTA, liquid-glass-strong pill:

> **Find my top talent** →

Click sets local state `step = "choice-route"`.

### 3.3 Step: choice-route

Question header:

> How do you want to reveal it?

Two card options (Apple Liquid Glass):

**Card A — AI-assisted lane:**
- Icon: 🤖 Bot (violet)
- Label: **🤖 Faster (1 min)**
- Sub: "Ask your AI & paste its response → get your pattern instantly"
- Action: sets `step = "ai-prompt"`

**Card B — Guided lane:**
- Icon: 📋 ClipboardList (blue)
- Label: **📋 Guided (10–15 min)**
- Sub: "Assessment of your top talents"
- Action: `navigate('/zone-of-genius/assessment?return=/')`

### 3.4 Step: ai-prompt (Lane A)

Header:

> Copy this prompt into your AI
>
> ChatGPT, Claude, Gemini — any will work

Prompt block: a multi-line preformatted prompt (`ZONE_OF_GENIUS_PROMPT` constant — the 12-perspective Appleseed template). Copy button (lucide `Copy` icon, "Copy" → "Copied" check).

Primary CTA: **I've got my AI's response** →
Secondary link below: *I'll do the guided assessment instead →* (navigates to `/zone-of-genius/assessment`)

### 3.5 Step: paste-response

Header:

> Paste your AI's response
>
> The full response — we'll extract your pattern from it

Single textarea (Apple Liquid Glass, dark navy text). Primary CTA:

> **Reveal my top talent** ✨

Disabled until textarea has content. On click: `step = "generating-appleseed"`, calls `generateAppleseed(aiResponse)` which POSTs to Supabase edge function / prompt-based extraction, then `step = "appleseed-result"`.

### 3.6 Step: generating-appleseed (ritual loading, ~4 seconds)

**AppleseedRitualLoading** component. Sacred-geometry animation (3 concentric spinning rings + dodecahedron center + 6 pulsing particles). Dark navy phase text cycles:

> Tuning into your frequency...
> Amplifying your signal...
> Crystallizing your essence...
> Your genius is emerging...

Violet progress bar (`#5b21b6 → #8460ea`). Bottom caption: *Your Zone of Genius is being articulated...*

Minimum display duration: `4000ms`. The actual generation often completes faster — the 4s floor is a ritual gate (not technical latency).

### 3.7 Step: appleseed-result

**This is the central reveal surface.** Rendered by `AppleseedDisplay`. No dark overlay — sits directly on the light Panel 3.

Auto-action on mount: `window.scrollTo(0, 0)`.

#### 3.7.1 RevelatoryHero card (soft-white gradient card, dark slate text)

```
        [Zone of Genius logo circle]

             my genius is to be a

         [Archetype Name, e.g. "Architect of Integration Codes"]

    I [bullseye sentence — 1 italic Cormorant line, e.g.
     "turn complexity into clear maps that activate people"]

    ┌─ Three Lenses (light glass card) ──────────┐
    │  MY TOP TALENTS                            │
    │  Envision · Architect · Activate · …       │
    │                                            │
    │  MY PRIME DRIVER                           │
    │  Activate Dormant Potential                │
    │                                            │
    │  MY ARCHETYPE                              │
    │  Visionary Architect — Evolutionary Mirror │
    └────────────────────────────────────────────┘

    Screenshot this.
    get yours → FindYourTopTalent.Com
```

#### 3.7.2 Resonance rating

> From 1 to 10, how well does this match how you see yourself at your brightest?

Ten tappable chips. Answer saved via `saveResonanceRating(profileId, 'appleseed', rating)` → `zog_snapshots.resonance_rating`.

#### 3.7.3 "THE GAP" — the core persuasion block

Dark navy Source Serif 4 on light Panel 3. Center-aligned. Six stacked sub-blocks:

**a. Recognition:**
> You've been doing this for years, haven't you?
> Delivered real results through this.
> People already come to you for it.

**b. The Pivot:**
> But haven't made it into a **GROWING BUSINESS**.
> *Why?*
> Because this is how **YOU NATURALLY OPERATE**.
> **NOT YET** a built, packaged, and distributed product people can buy.

**c. Consequence:**
> So:
> - you keep explaining it differently every time
> - people receive value but do not pay
> - you are stuck at "seeing the light at the end of the tunnel"

**d. The Missing Bridge** (Apple Liquid Glass card):
> *Let's be clear*
> The Missing Bridge to Money is Clarity on:
> - What exactly do I offer?
> - Who is it for?
> - Why would these people queue to pay?

**e. Reframe:**
> You don't need to be more ready.
> You don't need business education or gimmicks.
> **You simply need solid business structure.**

**f. Pre-CTA line:**
> *If you're done circling this — click below and let's make it real.*

#### 3.7.4 CTAs

**CTA 1 (primary, liquid-glass-strong):**
> **Turn My Top Talent into a Growing Business** →
- Destination: `/ignite#pricing-section`
- Right-side violet arrow circle decoration

**Mini bridge line:** *Want to learn more before acting?*

**CTA 2 (secondary, liquid-glass):**
> **See exactly why this hasn't turned into income**
> 6-question diagnostic
- Destination: `/quiz`

#### 3.7.5 Footer row (de-emphasized)

**Save pill (collapsible email capture):**
- Initial state: ✉ "Save my top talent result for later"
- On click: expands inline to `[email input] [Send it]` (violet submit button)
- On submit: POST to `save-zog-result` edge function → silent account creation + persistence. Fallback: direct insert to `divine_timing_leads`.
- Success state: ✓ "Saved. We sent your top talent to your inbox so you can come back to it."

**Share component (DelayedShare):**
- Renders 800ms after result appears, 50% opacity, hover to 70%
- Shares archetype + bullseye + talents via Web Share API / URL

#### 3.7.6 Anonymous claim side-channel

If the guest arrived from `/auth?claim=true` (sessionStorage `pending_claim_email` set), the result page auto-POSTs to `save-anonymous-zog` edge function with `{ email, result_payload, assessment_version: 'v1' }`. A status banner renders above the hero:

- `status: 'sending'` → "Saving your result to **[email]**…" (violet tint)
- `status: 'sent'` → "Result saved. Check your email — the magic link unlocks your full playbook. Sent to [email]. **Wrong email? Redo**" (emerald tint)
- `status: 'error'` → "We couldn't save your result to [email]. **Try a different email**" (red tint)

This is the magic-link claim bridge that converts an anonymous reveal into an authenticated account on `/auth/callback`.

---

## 4. Guided Assessment (`/zone-of-genius/assessment`) — Lane B

Four sequential steps, rendered by `ZoneOfGeniusAssessmentLayout` (wraps in `GameShellV2`) with a top step indicator.

### 4.1 Step indicator (persistent across all 4 steps)

```
         [Genius Business logo mark]
    Discover Your Zone of Genius
        Step N of 4

  ━━━━━━━━▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  (violet progress bar on dark-navy track)

  [1 Talent Selection] ─ [2 Core Talents] ─ [3 Ordering] ─ [4 Lifeline Snapshot]
```

Pill: active step = dark navy text on violet-tint chip with violet ring. Completed = white text on solid violet. Upcoming = muted navy on neutral chip.

### 4.2 Step 1 — "What Lights You Up?"

Header:
> **What Lights You Up?**
> Pick the **10 talents** you genuinely enjoy doing — the ones that make you come alive.

Grid of ~50 talents (randomized on mount) presented as Apple Liquid Glass cards. Each card: bold dark navy name + softer description. Click toggles selection. Max 10. Selected cards use `liquid-glass-strong` + violet checkmark circle.

Sticky selection counter: "N / 10 talents selected". Continue CTA disabled until 10. Warning on over-select: "Deselect one to choose another" (amber).

Continue → Step 2.

### 4.3 Step 2 — "Your Top 3"

> **Your Top 3**
> Now narrow it down. Which **3** do you love doing the most? The ones you'd keep even if you had to drop the rest.

Same card pattern, but restricted to the 10 selected. Max 3. Counter "N / 3 core talents selected".

Continue → Step 3.

### 4.4 Step 3 — "Order Your Top 3"

> **Order Your Top 3**
> Put your 3 core talents in order, from **most defining** (#1) to third (#3).
> *Drag or use arrows to reorder.*

Three draggable rows (HTML5 drag + chevron-up/chevron-down fallback). Rank badges: #1 solid violet, #2 violet-tint, #3 neutral navy. Row shows rank label:
- #1 → "Primary Genius"
- #2 → "Secondary Genius"
- #3 → "Supporting Genius"

Continue CTA: **Generate My Zone of Genius** (violet Sparkles icon).

### 4.5 Step 4 — Generated Snapshot

Calls Supabase edge function `generate-zog-snapshot` with the 10 + ordered 3. Returns 6 sections: Archetype Title, Description, Superpowers, Edge, Thrives, Mastery Action.

Writes to `zog_snapshots` table. Awards +100 XP via `game_profiles.xp_total`.

#### Hero reveal (liquid-glass card)

> YOUR ZONE OF GENIUS
> **You are a [Archetype Title]**
> Now you have words for what makes you, you.
> *This is your current character card — a starting point, not a final verdict.*

#### Main content (two-column desktop, stacked mobile)

**LEFT COLUMN:**

1. **Character Card (liquid-glass-strong):**
   - Eyebrow: "Zone of Genius Character Card · Generated on: [date]"
   - Large Cormorant Garamond archetype title, centered
   - Description paragraph
   - Bottom: three talent chips (violet tint)

2. **Superpowers in Action** panel
3. **Your Edge (Where You Trip Yourself Up)** panel
4. **Where This Genius Thrives** panel (6 bullets)
5. **🔁 Your Mastery Action** panel (liquid-glass-strong, single-line repeatable practice)

**RIGHT COLUMN:**

1. **Download My Snapshot (PDF)** button — `html2canvas` + `jsPDF` → A4 white PDF (uses dark `#2c3150` text on white — different aesthetic from the web view, optimized for print)
2. **"If This Hit Home"** session card:
   > If this description feels uncannily accurate and you want help turning it into concrete career moves, Aleksandr offers a focused Career Re-Ignition Session to design a 3-step plan around your Zone of Genius.
   > **$297 · 90 minutes**
   > [Book a Deep-Dive Session → cal.com/konstantinov]

   **NOTE:** this card references `$297 · 90 minutes` and a generic "Career Re-Ignition Session." This is NOT in sync with the new canonical $555 Ignition Session on `/ignite`. See "Known inconsistencies" §9.2.

#### Footer (below divider)

> Ready to put your genius to work? Start growing with daily practices tailored to your unique pattern.

**Save & Continue** CTA (liquid-glass-strong) → `getPostZogRedirect(returnTo)` which resolves to `/quality-of-life-map/assessment?return=onboarding` by default, or `/genius-offer-intake?from=zog` if `returnTo === 'genius-offer'`.

**Alt CTA (if returnTo === 'genius-offer'):** **Continue to Genius Offer Creation** (with Sparkles).

Back / Start Over links at bottom.

---

## 5. Ignite Session (`/ignite`) — the $555 commercial offer

**Component:** `IgniteSession`. Still uses the legacy dark-glass shell (white text, `liquid-glass` panels, Mux HLS video background) — **NOT yet migrated to the Day-47 light Panel 3 system.** This is a deliberate choice; the sales page is high-intensity and benefits from the moody dark treatment.

Long-form, single-scroll page with 7+ numbered sections. The CTA (Stripe link) appears **multiple times** throughout.

### Destination links (single source of truth)

```
STRIPE_PAYMENT_LINK   = https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A
CALCOM_BOOKING_LINK   = https://cal.com/aleksandrkonstantinov/unique-business-ignition-session
CALCOM_CLARITY_LINK   = https://cal.com/aleksandrkonstantinov/15min
```

### 5.1 Hero (S1)

Genius Business logo (160px) · two-line hero with horizontal divider:

> YOU CAN'T CLEARLY EXPLAIN WHAT YOU DO
> ─
> **THAT'S WHY IT'S NOT TURNING INTO SOMETHING PEOPLE BUY**

Subhead:
> In 90 minutes, we take what you already do — and turn it into:
> → a clear one-sentence business
> → a real offer
> → something people understand — and pay for

Proximity reframe:
> You're not far off.
> **You're one structural layer away from something that works.**

**Two CTAs:**
1. Primary (big button): **TURN THIS INTO SOMETHING REAL — $555** → Stripe
2. Fallback (outline button): 💬 *Not sure yet? Let's talk for 15 min — free* → Cal.com 15min

Footnote: *No convincing. No persuasion. Just clarity on your situation, your top talent, and your unique business.*

Below CTA row:
- Anchor link: *See why this hasn't worked yet (6 min)* → `#hero-video`
- `DivineTimingCapture` — inline email capture: *"Your email — I'll check in about a month"* → writes to `divine_timing_leads` table with `source: 'ignite_page'`

### 5.2 Video (S1.5)

Lazy-loaded YouTube embed `id: afWWcXUqnLI`, "The Ignition Session — Methodology Overview".

Subtitle: *If you're still thinking about this after watching… you already know.*

Post-video repeat of primary CTA.

### 5.3 Qualifier (S2)

> **This Is For You If**
> You've proven your value—for other people.
> The question is: What is yours to build?

5 italic quote cards (liquid-glass):
- *"Why is this still so hard to say?"*
- *"I'm a mix of things and none of the labels fit"*
- *"I know I should charge more but I can't afford to lose the few clients I have"*
- *"Something fundamental is off but I can't see what"*
- *"I'm so much more capable than my results show"*

Footer: *You've proven your value—for other people. The question is: What is yours to build?* (repeated)

### 5.4 How It Works (S4)

> **What Happens In 90 Minutes**
> This is not coaching. You leave with a document, not a feeling.

Three cards:

1. 🔮 **Step 1 — We name what you already do — clearly**
   *You talk. I listen for what's already there — but invisible to you. We land it in one sentence a 7-year-old understands, an investor trusts, and a client buys.*

2. 📦 **Step 2 — We structure it into something people can buy**
   *That sentence becomes a clear offer, a defined audience, a real problem, a real outcome. No guessing. Just structure that holds.*

3. 🚀 **Step 3 — You leave with a one-page offer**
   *Not something to 'figure out later.' AI compiles everything live into one page: what you do, who it's for, why they pay, and what to say next.*

### 5.5 About (S5)

Circle photo of Aleksandr (20x20) + card:

> I spent years in the loop myself. Building startups that didn't stick. Consulting. Coaching friends for free. Circling the same question everyone in this situation circles:
>
> *"What is mine to build?"*
>
> What I do now is simple: I sit with someone for 90 minutes, hear what they've been saying for years, and hand them back the one sentence they couldn't see from inside themselves. Then AI compiles their entire business on one page before the session ends.
>
> — *Aleksandr Konstantinov*

### 5.6 Testimonials (S6)

> **What They Said After**

Fetched from Supabase `testimonials` table filtered by `surface = 'ignite' AND is_active = true`, ordered by `sort_order`. Falls back to `TESTIMONIALS` constant (6 hardcoded quotes: Oyi, Alexey, Sergey, Sandra, Aleksa, Karime). Rendered via `ExpandableTestimonial` component with a "before" context above each short quote, expandable to full quote.

### 5.7 Micro-commitment

`MicroCommitmentBlock` component (separate file — likely a "book a 15-min call" secondary path).

### 5.8 Pricing (S7 / #pricing-section / #booking)

The primary booking section. This is the anchor target from the ZoG result page CTA (`/ignite#pricing-section`).

```
          [liquid-glass-strong rounded-[2.5rem] card]

              ONE SESSION. ONE CLEAR BUSINESS.

          If you don't turn this into something concrete:
             → it stays something people benefit from — but don't pay for
             → you keep circling the same question
             → nothing fundamentally changes

                        IN 90 MINUTES

              We define → exactly what you do
                    Who → it's for
                    Why → they pay
                 How to → express it simply

                          $555
                        In 2 hours                ← Day 47 change (was "One session. One business.")

         ┌─ Guarantee (shield icon) ────────────────────────┐
         │  If you don't leave with a one-sentence business │
         │  you recognize as yours: you don't pay.          │
         └──────────────────────────────────────────────────┘

         Micro social proof (3 italic quotes):
         "I was applying force, but the vector was wrong."
         "This is a miracle of miracles."
         "I've never been able to say it like that before."
```

**NOTE:** the eyebrow "IN 90 MINUTES" and the tagline-under-price "In 2 hours" are now **inconsistent** as of Day 47 (Sasha updated the second without the first). See §9.1.

### 5.9 After-Stripe path

User clicks Stripe CTA → external checkout → on success, Stripe redirects to its own confirmation page. The app does NOT handle a custom post-payment landing page. Paid users then use the "Already paid? Book your session here →" link (`CALCOM_BOOKING_LINK`) to schedule.

**This is a known funnel gap** — there's no in-app confirmation or onboarding hook after payment. Booking relies on the user clicking back and finding the Cal.com link.

---

## 6. Sibling surfaces

### 6.1 `/playbook` — the methodology exposed

Open Blueprint Paradox in action. The entire 7-step methodology is readable, free, no gate.

**Layout:** Back button → seven-step pill nav (each chip a colored circle with step number + step subtitle below) → gradient bridge → StepCard for the active step.

**7 steps (from `src/data/playbookSteps.ts`):**

1. **Step 1 — Name Your Top Talent** (violet)
2. **Step 2 — Articulate it with Precision** (indigo)
3. **Step 3 — Enhance it with Business Structure** (blue)
4. **Step 4 — Build your First Unique Product** (cyan)
5. **Step 5 — Beta-Test That Everything Works by Gifting and/or Selling** (green)
6. **Step 6 — Laser-Focus Tactically and Go Live** (orange)
7. **Step 7 — Turn Organic Growth into Scaling Impact and Revenue** (red)

**StepCard structure (per active step):**
- Hero title: "Step N. [subtitle]" — step number rendered as a neon→navy→neon gradient in the step's signature color
- Three substeps (always visible): each substep has a number, name, description, and a "Recommended How-To" toggle that reveals "One Proven Strategy" in a light-glass card

No per-step CTA block. The commercial flow lives on `/path` and `/ignite`, not inside each step.

### 6.2 `/path` — the value ladder

**Hero** (Cormorant Garamond, dark navy, neon-highlighted phrases):

> Solid **Founder-Market Fit**. Early **Product-Market Fit**, **traction**, and **organic demand**.
>
> In **6–8 weeks**.
>
> ***Guaranteed.***
>
> Provided you do your part, at an average speed.

(Highlights: Founder-Market Fit = violet · Product-Market Fit = blue · traction = cyan · organic demand = green · 6–8 weeks = orange-red · Guaranteed = violet italic.)

**Ladder (light glass, dark text, `liquid-glass`):**

| Step | Title | Duration | Price |
|------|-------|----------|-------|
| Step 1 | Name Your Top Talent | Minutes | Free |
| Step 2+3 | Articulate it with Precision · Enhance it with Business Structure | 2-hour workshop | $555 |
| Step 4 | Build your First Unique Product | 3 weeks, part-time | $1,111 |
| Step 5 | Gift it or Sell It To Beta-Test That Everything Works | 1–2 weeks (capped 1 month) | $333 |
| Step 6 | Laser-Focus Tactically and Go Live | 2-week container | $1,111 + $2,222 from your first $10k (1/3 of first $10k) |
| Step 7 | Turn Organic Growth into Scaling Impact and Revenue | The next octave | By invitation |

**Footer blurb inside the card:**
> The upfront path (Steps 1–5) totals **$1,999**. Step 6 adds **$1,111 upfront** and **1/3 of your first $10k in revenue** — capped there. After that, 0%. Step 7 is by invitation only, after you have early product-market fit and organic demand.

**Quiet close:**
> Every step is optional. Every step delivers a complete transformation in itself.
> Pay as you progress. Money-back guarantee on every step.

**Gap:** the `/path` page has **no CTA.** No "book now", no "start here." This is a *visibility* surface, not a conversion surface. Readers have to navigate back to `/` or `/zone-of-genius` to act.

### 6.3 `/quiz` — 6-question diagnostic

The secondary CTA from the ZoG result page. Still uses the legacy dark-glass shell (not migrated).

**Four archetypes** the quiz sorts users into (highest score wins):

- `invisible_genius` — can't explain what they do
- `multi_talent_trap` — too many skills, can't choose
- `misaligned_vector` — working hard, results don't match
- `underpriced_operator` — value without payment

**Questions (6):**

1. *Identity friction* — "When someone asks what you do, what happens?"
2. *External validation* — "What do people consistently come to you for?"
3. *Internal tension* — "Which feels most true right now?"
4. *Past pattern* — "Think about your best moments at work. What was happening?"
5. *Pricing reality* — "How do you currently price your work?"
6. (6th question — not captured in my read)

Each archetype result includes: `name`, `emoji`, `identity`, `mirror` (array), `problem`, `symptoms`, `reframe`, `blade`, `cta`, `ctaSub`. Rendered as a result card with a CTA that routes back to `/ignite#pricing-section`.

**Gap:** I did not fully read the result-render section of `GeniusQuiz.tsx` tonight. Copy of each of the four archetype reveals is in that file.

---

## 7. Auth & gating

| Surface | Gate |
|---------|------|
| `/` | Public |
| `/zone-of-genius` | Public |
| `/zone-of-genius/assessment` | Public (Day 47: was gated, now open) |
| `/playbook`, `/playbook/:slug` | Public |
| `/path` | Public |
| `/ignite` | Public (Day 47: was gated, now open) |
| `/quiz` | Auth required (`RequireAuth`) |
| `/my-artifacts` | Auth required |
| `/game/*` | Auth required |
| `/auth`, `/auth/callback`, `/auth/reset-password` | Public |

**Why `/quiz` is still gated and `/ignite` isn't:** `/quiz` was gated before Day 47 and I didn't explicitly open it tonight. The ZoG result page secondary CTA (Want to learn more before acting?) currently routes guests into the auth flow before the quiz. This is **inconsistent** with the "no friction until purchase" pattern the rest of the funnel now holds. See §9.3.

**Anonymous profile system:** every visitor gets a `game_profiles` row via `getOrCreateGameProfileId()` (local UUID → Supabase insert). All ZoG activity (snapshots, resonance ratings) writes against this anonymous profile. On magic-link sign-up via `/auth/callback`, the anonymous profile is claimed and linked to the auth user.

---

## 8. Data capture & conversion events

### 8.1 Email captures

Three distinct surfaces capture email, each writing to different tables:

| Surface | Trigger | Table / Edge Function | Status |
|---------|---------|----------------------|--------|
| ZoG result — Save pill | User clicks "Save my top talent result for later", enters email, submits | `save-zog-result` edge function → fallback `divine_timing_leads` | Active |
| ZoG result — Anonymous claim | Automatic when `sessionStorage.pending_claim_email` is set (from `/auth?claim=true` flow) | `save-anonymous-zog` edge function | Active |
| `/ignite` — DivineTimingCapture | User clicks "Your email — I'll check in about a month" | `divine_timing_leads` (direct insert, `source: 'ignite_page'`) | Active |

### 8.2 Funnel analytics

Every meaningful step emits a `trackFunnelEvent` and/or `trackPageView`/`trackCTAClick`. Known events (non-exhaustive):

- `zog_entry` (page view on `/zone-of-genius`)
- `zog_choice_route` (user picks AI or Guided)
- `zog_ai_prompt` (user sees prompt block)
- `zog_paste` (user lands on paste-response step)
- `zog_copy_prompt` (user clicks Copy button)
- `zog_result` (user reaches appleseed-result)
- `booking_click` (user clicks Stripe link on `/ignite`)
- `divine_timing` (email captured)

Storage: Supabase `funnel_events` table (presumed — not verified in this audit).

### 8.3 Paid conversion

Stripe-hosted checkout, fixed price $555. No coupons, no variants, no upsells on the payment page.

---

## 9. Known inconsistencies and gaps

These are real — not aspirational. GFOA should treat them as surface-level optimization targets.

### 9.1 `/ignite` pricing block says both "In 90 minutes" AND "In 2 hours"

On `/ignite` S7 pricing section:
- Eyebrow above the "We define / Who / Why / How to" list: **IN 90 MINUTES**
- Tagline under the $555 price: **In 2 hours**

Sasha updated the tagline Day 47 (was "One session. One business.") but left the eyebrow. Also leaked elsewhere on the page:
- Section S1 subhead: "In 90 minutes, we take what you already do..."
- Section S4 heading: "What Happens In 90 Minutes"
- Section S5 about copy: "I sit with someone for 90 minutes..."
- Section S8 pricing card (PrimaryCTA component): price appears as `$555` only — no duration

Decision needed: is the session 90 minutes or 2 hours? Update all copy to match.

### 9.2 Step 4 guided-assessment result card mentions "$297 · 90 minutes" Career Re-Ignition Session

Hardcoded in `Step4GenerateSnapshot.tsx` right column "If This Hit Home" card. This is a *different* product at a *different* price, not the $555 Ignition Session.

Guests who complete the guided lane see `$297`, but guests who complete the AI lane see a CTA to `/ignite#pricing-section` where they'll be asked for `$555`.

Decision needed: consolidate to one product, one price. Either update Step 4 card to reference the $555 session (and reuse Calendly/Stripe links), or explicitly differentiate the two SKUs.

### 9.3 `/quiz` still requires auth

Secondary CTA from ZoG result ("See exactly why this hasn't turned into income / 6-question diagnostic") routes through `/auth` before rendering the diagnostic. Everything else in the funnel is now open.

Decision: remove `RequireAuth` from `/quiz`, OR accept that the diagnostic is a gated reassurance tool only offered after sign-up.

### 9.4 `/path` has no CTA

The value ladder is beautiful and complete but offers no way to act. Users who read it and want to buy have to navigate back to `/` or `/zone-of-genius` and re-enter the funnel.

Decision: add a Step-1-anchored "Start free with Step 1" CTA (routes to `/zone-of-genius`), and a "Book your Ignition Session" CTA on Step 2+3 (routes to `/ignite`).

### 9.5 No post-Stripe confirmation page

After paying on Stripe, the user sees Stripe's own receipt page, then… nothing. They have to come back to `/ignite`, scroll, and find the "Already paid? Book your session here →" Cal.com link.

Decision: either configure a Stripe redirect URL to a branded `/thank-you` page (with Cal.com embedded), OR include the Cal.com link in the Stripe email receipt template.

### 9.6 No welcome/nurture email after save-pill capture

When a user submits their email via the save pill on the ZoG result page, the result goes to `save-zog-result` edge function. I don't know if that function sends an immediate email. If not, users who save "for later" may never come back.

Decision: verify `save-zog-result` sends an email with the result + a link back to the canonical URL. If not, add it.

### 9.7 Ignite sales page uses dark-glass shell, rest of funnel is light-glass

Intentional or leftover? The ZoG entry + result + assessment + Path + Playbook + Landing are now all light-Panel-3 + dark-navy text. `/ignite` is still dark-mode with white text. Visually it's a clean tone shift into the commercial moment — could be read as "this is serious now." Could also be read as "wait, did I just leave the site?"

Decision: either embrace the dark shift (add explicit framing — "The decision room") or harmonize `/ignite` with the rest of the funnel's light palette.

### 9.8 Primary Landing CTA meta reads "Claim your gift · takes two minutes"

"Gift" implies something free and received. The destination `/zone-of-genius` does deliver a free archetype reveal — that tracks. But the meta arrow points UP to "Find your top talent" — which describes an action, not a gift. The "gift" framing and the "find" framing are doing different emotional jobs.

Decision: align meta with action ("↑ takes two minutes · free") or align CTA with gift ("Claim your gift →").

### 9.9 The only social proof on the funnel lives on `/ignite`

Landing page has no testimonials. ZoG result has no social proof. `/path` has no testimonials. The 6 testimonials (Oyi, Alexey, Sergey, Sandra, Aleksa, Karime) only appear deep inside `/ignite`, by which time the user has already self-selected as interested.

Decision: consider a single testimonial card on the ZoG result page (just before the primary CTA) — the "If This Hit Home" slot is a natural location.

### 9.10 No exit-intent or return-visitor logic

A first-time visitor gets the same experience as the 5th-time returning visitor. Users who have already completed ZoG see the same "Find my top talent" button — not "Continue to your result" or "Book your session."

Decision: add localStorage-based detection for returning visitors with an existing `appleseed` or `game_profile` row, and surface a different primary CTA for them.

---

## 10. State machine — full user journey

```
                    ┌─────────┐
                    │    /    │ (Landing)
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐   ┌─────────────┐   ┌──────────┐
   │ /path   │   │/zone-of-    │   │ /playbook│
   │  (view) │   │   genius    │   │  (view)  │
   └─────────┘   └──────┬──────┘   └──────────┘
                        │
                  [state: choice]
                        │
                        ▼
                  [choice-route]
                   │         │
            ┌──────┘         └──────┐
            ▼                       ▼
      [ai-prompt]            /zone-of-genius
            │                  /assessment
      [paste-response]              │
            │                   [Step 1]
      [generating-                  │
       appleseed]                [Step 2]
            │                       │
            │                   [Step 3]
            ▼                       │
      [appleseed-                   ▼
       result] ◄──────────────  [Step 4]
                                    │
                                    ▼
                            [guided-snapshot-
                             result with
                             $297 cal.com CTA]
            │
       ┌────┼────┬─────────────────┐
       ▼    ▼    ▼                 ▼
   primary save  /quiz      /ignite#pricing
   CTA    pill   (auth     (Stripe checkout
   →      →      gated)    → $555 →
   /ignite email            external receipt
                            → Cal.com booking
                            via link)
```

---

## 11. What this document does NOT cover

- Internal authenticated product (`/game/*`, `/my-artifacts`, spaces, missions, artifacts) — that's post-purchase product, not funnel.
- Email templates (signup, magic link, password reset) — in `supabase/functions/send-branded-email` (branded Day 47 earlier).
- Stripe webhook handling / post-payment data flow.
- SEO / social preview cards (`index.html` meta tags).
- Analytics destinations (PostHog, Supabase `funnel_events`, etc.) — I didn't audit sinks.
- Mobile-specific interactions (swipe, sticky bottom bars are present but I didn't exhaustively audit them).
- The `GeniusQuiz` archetype result copy (4 archetypes × ~8 fields) — flagged but not transcribed.

---

*End of synthesis. Updated: Day 47 evening, 2026-04-21. Author: Claude (code agent). Verified against live codebase.*
