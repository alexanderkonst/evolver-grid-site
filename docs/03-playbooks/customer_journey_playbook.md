# Customer Journey Playbook

> The complete map from first touchpoint to paid session to Build.
> Single source of truth for: funnel architecture, outreach, content, CRM, and weekly execution.
>
> *Consolidates: godfather_playbook, outreach_templates, tomorrow_sop, video_script_4min*

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Funnel Map & Transitions](#2-funnel-map--transitions)
3. [Buyer Psychology](#3-buyer-psychology)
4. [Content Engine](#4-content-engine)
5. [Outreach Templates](#5-outreach-templates)
6. [DM → Booking Conversion Flow](#6-dm--booking-conversion-flow)
7. [Email Templates](#7-email-templates)
8. [Content Assets](#8-content-assets)
9. [Surface Activation](#9-surface-activation)
10. [CRM & Pipeline](#10-crm--pipeline)
11. [Conversion Math](#11-conversion-math)
12. [Weekly SOP](#12-weekly-sop)
13. [Quiz — Full Specification](#13-quiz--full-specification)
14. [Phase 2+ Roadmap](#14-phase-2-roadmap)
15. [Pre-Launch Infrastructure Checklist](#15-pre-launch-infrastructure-checklist)

---

## 1. System Architecture

### The System (a field with intelligent entry points — not a linear funnel)

```
(A) Warm Entry (PRIMARY — your network)
    ZoG Reveal → [gap felt] → Video → Session → Build

(B) Cold Entry (social posts, shares)
    Quiz → ZoG Reveal → Video → Session → Build

(C) Analytical Mind (overthinkers)
    ZoG Reveal → Quiz → Video → Session → Build

(D) High Intent (instant recognizers)
    ZoG Reveal → Session (skip video)
```

> **Key principle:** The ZoG reveal is the front door. Not the landing page. Not a quiz.

### Route Map (live)

| URL | Page | Purpose |
|-----|------|---------|
| `aleksandrkonstantinov.com` | ZoG Reveal | Front door — recognition experience |
| `aleksandrkonstantinov.com/ignite` | Landing Page | Decision page — video + booking ($555) |
| `aleksandrkonstantinov.com/quiz` | Quiz | 6 questions → archetype → gap → video bridge |
| `aleksandrkonstantinov.com/reveal` | Redirect → `/` | Vanity URL for sharing |

### Psychological Arc

Each step does ONE job. If any step breaks → the whole system breaks.

| Step | Job | User feels |
|------|-----|-----------|
| ZoG Reveal | Recognition | "This is me" |
| Result page | Tension | "But I still can't use this" |
| Video (4 min) | Understanding | "THAT'S why nothing worked" |
| Landing page | Decision | "I need this finished" |
| Session | Resolution | "Now it's real" |

### Meta-Principles

- **You are selling collapse of uncertainty.**
- **Precision resonance game — 20-30 right people, not 10,000.**
- **Page = minimal. Video = understanding. Session = full depth.**
- **If a sentence doesn't make them feel seen, feel the gap, or move forward → cut it.**

---

## 2. Funnel Map & Transitions

### Exact user flow with code references

```
┌─────────────────────────────────────────────┐
│  ENTRY: DM / Post / Link                    │
│    │                                        │
│    ▼                                        │
│  ZoG Reveal (/)                             │
│  [ZoneOfGeniusEntry.tsx]                    │
│    │                                        │
│    ├─ "Yes, my AI knows me" → prompt path   │
│    └─ "No, I'll do assessment" → 4-step     │
│    │                                        │
│    ▼                                        │
│  ZoG Result                                 │
│  [AppleseedDisplay.tsx]                     │
│    │                                        │
│    ├─ "Watch this (4 min)" ─────────┐       │
│    └─ Save/Share (email gate)       │       │
│                                      │       │
│                                      ▼       │
│  Landing Page (/ignite)                      │
│  [IgniteSession.tsx]                        │
│    │                                        │
│    ├─ Video → Nuclear line                  │
│    ├─ How it works                          │
│    ├─ About + Testimonials                  │
│    ├─ Booking section ($555)                │
│    │   ├─ "Book Your Session" → Stripe      │
│    │   └─ "Not sure? 15-min call" → Cal.com │
│    └─ FAQ + Emotional close                 │
│                                              │
│  Post-payment:                               │
│    Stripe → Email → Cal.com → Session        │
│    Session → Build ($3,611) offer             │
└──────────────────────────────────────────────┘
```

### Transition links

| From → To | Trigger | Link |
|-----------|---------|------|
| DM → ZoG | User clicks link | `aleksandrkonstantinov.com` |
| ZoG Result → Landing page | "Watch this (4 min)" | `/ignite#hero-video` |
| ZoG Result → Email gate | Save/share button | Inline |
| Landing hero → ZoG | "Find out in 5 min — free" | `/zone-of-genius/entry` |
| Landing hero → Stripe | "Turn this into something real ($555)" | Stripe link |
| Booking → Stripe | "Book Your Session" | Stripe link |
| Booking → Cal.com | "Not sure? 15-min call" | Cal.com link |
| Post-payment → Cal.com | Email with booking link | Manual/automated |

---

## 3. Buyer Psychology

### 4 Buyer Types

| Type | Behavior | What they need | Route |
|------|----------|---------------|-------|
| **Instant Recognizer** | ZoG → "holy sh*t" → doesn't overthink | Speed: "If this already makes sense, you don't need more thinking." | ZoG → Session |
| **Sense-Maker** | ZoG → "this is accurate… but why is this so hard?" | Explanation | ZoG → Video → Session |
| **Skeptic** | Doesn't trust instantly, needs validation | Proof + pattern | Quiz → ZoG → Video → Session |
| **Overthinker** | ZoG → loops mentally → doesn't act | Interruption: "You don't need more clarity. You need this finished." | ZoG → Session (direct push) |

### The Quiz Role (clarified)

The quiz (when it exists — Phase 2) is NOT the front door. It's "the hallway for people who need to look around before entering."

- **For warm audience:** Lead with ZoG reveal. Quiz is optional deepener.
- **For cold audience:** Quiz IS the front door. Frame: "Why is it still so hard to explain what you do?"
- **Reframe:** Not "take a quiz." → "See the pattern behind why this has been so hard to turn into something real."

---

## 4. Content Engine

### 3 Content Types (weekly)

| Type | Purpose | Attracts | Frequency |
|------|---------|----------|-----------|
| 🔥 Signal | "This is me" | Identity-driven people | 2x/week |
| 🧠 Frame | "THAT'S why" | Thinkers | 1x/week |
| ⚡ Proof | "This works" | Skeptics | 1x/week |

### CTA Strategy

- **Most posts:** No link (curiosity → profile → click)
- **1-2x/week:** Direct link to ZoG
- **Profile bio:** "I turn what you already do into a one-sentence business." + link

### 10 Ready Posts

**Signal Posts:**

```
Post 1:
You're not confused.
You're just unstructured.

Post 2:
"I'm more capable than my results show."
That's not a mindset problem.

Post 3:
You don't lack clarity.
You lack a way to say what you do
so someone else understands it instantly.

Post 4:
You don't need a new idea.
You need to finally say
what you already do.
```

**Frame Posts:**

```
Post 5:
Knowing your zone of genius
doesn't mean you can sell it.
That's a different problem.

Post 6:
Insight doesn't make money.
Structure does.

Post 7:
You can be extremely valuable
and still impossible to understand.
Guess which one gets paid?
```

**Proof Posts:**

```
Post 8:
Sat with someone today who couldn't explain what they do.
90 minutes later:
one sentence
one offer
ready to sell

Post 9:
"I was applying force, but the vector was wrong."
That's what this usually sounds like before it clicks.

Post 10:
The moment people hear what they actually do—clearly—
they stop hesitating.
Because now it makes sense.
```

---

## 5. Outreach Templates

### Campaign A: Warm Reconnection (WEEKLY)

**Segment:** Warm contacts — people who know your name
**Channel:** LinkedIn DMs + WhatsApp
**Volume:** 10-15 people/week

**Template A0: Friend Share (warmest — just sharing what you built)**

```
Hey [Name] — I built something I'm excited about.

It reveals what you actually do — in a way that's
surprisingly hard to see from the inside.

Curious what comes out for you:
👉 aleksandrkonstantinov.com
```

**Template A0b: Reconnection (haven't talked in a while)**

```
Hey [Name] — haven't been in touch in a while,
but I've been building something and you came to mind.

It takes 3 minutes and shows you something about
how you think that's surprisingly hard to see on your own.

👉 aleksandrkonstantinov.com

No pitch. Just curious what you get.
```

**Template A1: LinkedIn DM (English)**

```
Hey [Name] —

I built something that shows you what you actually do
in a way that's hard to see from the inside.

You came to mind — curious if it lands for you.

👉 aleksandrkonstantinov.com
```

**Template A2: WhatsApp (English)**

```
Hey [Name] — I've been working on something quietly.

It reveals what you actually do — in a way that's
surprisingly hard to see on your own.

It's free. Curious what you get.

👉 aleksandrkonstantinov.com
```

**Template A3: WhatsApp (Russian)**

```
Привет [Имя] — я тут кое-что сделал.

Штука, которая показывает тебе, что ты на самом деле делаешь —
так, как самому изнутри сложно увидеть.

Бесплатно. Интересно, что выйдет у тебя.

👉 aleksandrkonstantinov.com
```

### Campaign B: Upstream Partnerships (WEEKLY)

**Segment:** Uniqueness workers + ecosystem holders
**Channel:** LinkedIn DMs (personalized)
**Volume:** 3-5 people/week

**Template B1: Uniqueness Workers**

```
Hey [Name] —

I've been following your work in [their domain] and I think
our work is structurally complementary.

Your clients hit a natural transition point — they've discovered
their uniqueness. Then what? That "now what" is exactly where I pick up.

I turn that into a one-sentence business in one 90-min session.

Simple partnership: when someone in your world reaches that point,
you send them my way. Revenue share, zero risk.

If this lands, 15 min to talk?

👉 aleksandrkonstantinov.com/ignite
```

**Template B2: Ecosystem Holders**

```
Hey [Name] —

I see something we could do together.

Your community members inevitably reach a moment where they need
something concrete — "I know what I'm about, now how do I build
something from it?" That's my exact entry point.

Two things I could offer:
1. Referral partnership — revenue share on outcomes
2. Custom module — built for your community's language and context

15-minute conversation to see if there's a fit?

👉 aleksandrkonstantinov.com/ignite
```

### Campaign C: Cross-Pollination (MONTHLY)

**Segment:** The 5 founders (Oyi, Sergey, Sandra, Karime, Aleksa)
**Channel:** WhatsApp/Telegram

```
Hey [Name] — I have an idea.

What if the five of us got on a 90-minute call and each shared
one concrete gift with the group — something from YOUR world
that would genuinely help the others?

Not a meeting. A cross-pollination experiment.
We record it. Everyone shares. Everyone gets visible AND value.

Are you game? If yes, I'll coordinate.
```

---

## 6. DM → Booking Conversion Flow

> **Rule:** Don't pitch. Don't explain. Just deepen awareness.

| Step | They say | You say |
|------|----------|--------|
| 1 — They engage | "This is me" / "Wow accurate" | `That's usually where people realize something's still missing.` |
| 2 — They lean in | "Yeah exactly" / "What do you mean?" | `You can see it… but you can't fully turn it into something real yet.` |
| 3 — Invitation | They engage again | `If you want, I can help you finish it in one session.` |
| 4 — They ask how | "How?" / "Tell me more" | `We take what you already do and turn it into a one-sentence business, a clear offer, and your next move—live.` → send /ignite |
| 5 — Hesitation | Silence / "I'll think about it" | `No rush. People usually know when they're ready.` |
| — | No response (7+ days) | `Hey — just checking this landed. No rush.` |

---

## 7. Email Templates

### Post-Payment Email

**Subject:** You're in. Here's what happens next.

```
[Name],

Welcome.

Here's what happens now:

1. Book your session → [Cal.com link]
   Pick a time that feels spacious.

2. Before the session:
   - No preparation needed. Come as you are.
   - If you want to think about something:
     "What's the work I keep doing for free because
      it comes so naturally I can't believe anyone would pay for it?"

3. What you'll walk out with:
   - Your genius named in one sentence
   - Your entire business on one page
   - The exact person to talk to next — and the exact words to say

Looking forward to this.

— Alexander

P.S. If you have questions, reply to this email. I read everything.
```

### Post-Session Follow-Up (24-48 hours after)

**Subject:** Your business on one page + what comes next

```
[Name],

Here's your business on one page.

[Attached: Business One-Pager PDF]

Three things that matter right now:

1. Share it. Send it to 3 people who know you well.
   Ask: "Does this sound like me?"

2. The first conversation. We identified [the exact person/type].
   Reach out THIS WEEK. The momentum is real.

3. If this clicked — and you want to go further:

   The Build ($1,111 + $2,500 from your first $10K baseline)

   6 weeks. We take this and turn it into:
   → 10 clients
   → Early product-market fit
   → A business that's actually running

   [Book a 15-min call to discuss The Build → Cal.com link]

No pressure. The one-pager is yours regardless.

— Alexander
```

---

## 8. Content Assets

### 4-Minute Video Script

> Sits between ZoG result and session booking.
> Breaks "false completion" — the feeling that seeing your pattern = having a business.

**[OPEN — calm, direct]**

If you're here, something probably felt… accurate.

Like, "yeah—that's me."

But also incomplete.

And that's the part I want to talk about.

Because most people think the problem is:
*"I don't know my zone of genius."*

That's almost never true.

**The real problem is this:**

You know it… but you can't structure it in a way that other people understand—and pay for.

So what happens?

You try to explain what you do. You adjust the words. You add context. You simplify… then complicate again.

**The more you explain it, the less clear it becomes.**

That's not a communication issue. That's a structural issue.

You don't have a container for what you are.

And without that container:
- You can't charge properly
- You can't scale it
- You can't even talk about it without friction

So you stay in this loop:
*Working → adjusting → doubting → restarting*

**Now here's the shift.**

What if the problem is that no one has ever: **seen what you are from the outside** and turned it into something concrete?

Once it's named properly… everything else becomes obvious.

**That's what we do in the session.**

Not coaching. Not theory.

In 90 minutes, we take what you already saw in your result and turn it into:
→ One clear sentence
→ One structured offer
→ One real business

Live. Most people spend months trying to figure this out.

You leave with it.

**[CLOSE]**

If that's what you've been missing — you can book a session below.

> **Nuclear line (after video):** "If you're still thinking about this after watching, you already know."

**Production notes:** Calm, direct, face to camera, 3:30-4:30, no slides.

---

## 9. Surface Activation

> Do these ONCE. Each one is permanent signal.
> **Lead with feeling ("Overqualified? You're overprepared."), not capability ("I turn what you already do…").**

### Copy-Paste Ready

**LinkedIn headline:**
```
Overqualified? You're overprepared. | I help you name your genius and build a business from it
```

**LinkedIn about (first 3 lines — these show above the fold):**
```
I spent years doing my best work for free because I couldn't explain what I was doing.
Now I help overqualified founders name their genius and build a business from it — in 90 minutes.
15 sessions. 100% delivered what they came for. aleksandrkonstantinov.com
```

**WhatsApp about:**
```
Overqualified? You're overprepared. · aleksandrkonstantinov.com
```

**Email signature:**
```
Alexander Konstantinov
Overqualified? You're overprepared.
aleksandrkonstantinov.com
```

**Bio (all platforms):**
```
I turn what you already do into a one-sentence business.
aleksandrkonstantinov.com
```

### Full Checklist

| # | Surface | Time | Status | Action |
|---|---------|------|--------|--------|
| 1 | LinkedIn headline | 2 min | ⬜ | Copy from above |
| 2 | LinkedIn banner | 10 min | ⬜ | Hero visual: "Overqualified? You're overprepared." + link |
| 3 | LinkedIn about | 15 min | ⬜ | Copy from above, expand below fold with story + proof |
| 4 | LinkedIn featured | 3 min | ⬜ | Pin: (1) aleksandrkonstantinov.com (2) video |
| 5 | LinkedIn job title | 2 min | ⬜ | ⚠️ Triggers notification to ALL connections |
| 6 | Email signature | 5 min | ⬜ | Copy from above |
| 7 | WhatsApp about | 1 min | ⬜ | Copy from above |
| 8 | WhatsApp status | 2 min | ⬜ | Visual card + link |
| 9 | Zoom display name | 30 sec | ⬜ | `Alexander Konstantinov` |
| 10 | Cal.com description | 5 min | ⬜ | "In 90 min: your genius named, your business on one page, your next move" |
| 11 | Profile bio (all) | 5 min | ⬜ | Copy from above |

---

## 10. CRM & Pipeline

### Phase 0 — Now (0-20 contacts)

**Tool:** Markdown tracker → `docs/02-strategy/tribe_outreach_tracker.md`

Track: Name, type, DM version, status, notes.

**Lifecycle stages:**
```
prospect → dm_sent → responded → booking → ignited → building → alumni → facilitator
```

### Phase 1 — After 5 paid sessions (20-50 contacts)

**Tool:** Google Sheets or Notion (simple, manual, zero engineering)

> ⚠️ **Why not Supabase?** Writing to Supabase tables requires edge functions or the service key.
> We can't update CRM data directly — Lovable controls the database layer.
> Don't overbuild: a spreadsheet with the same columns as the markdown tracker is enough at this scale.

### Phase 2 — After $5K/month validated (50+ contacts)

**Tool:** GoHighLevel (GHL)

- Full CRM with contact management + pipeline stages
- Automated follow-up sequences
- "Not now → check back in 3 months" re-engagement flows
- Post-payment onboarding email automation
- Calendar booking (replaces Cal.com)
- Lead capture from ZoG email gate

### Live Pipeline Tracker

> **Active contacts:** [tribe_outreach_tracker.md](../02-strategy/tribe_outreach_tracker.md)
>
> This is the operational data — real names, real statuses, real metrics. Update it after every outreach batch.

### Existing Digital Real Estate

> **Full inventory:** [digital_surface_holomap.md](../02-strategy/digital_surface_holomap.md) + [digital_surface_holomap.csv](../02-strategy/digital_surface_holomap.csv)
> **Universal map:** [universal_digital_surface_map.md](../02-strategy/universal_digital_surface_map.md)

You already have distribution infrastructure. Key assets:
- **~400 email contacts** (warm list)
- **LinkedIn connections** (thousands — professional network)
- **WhatsApp/Telegram contacts** (personal network)
- **Facebook/Instagram** (social network)
- **Telegram channel** (100% delivery to subscribers, no algorithm)

The holomap scores every surface by Yield = (Attention × Clout × Alignment) / Energy Cost.
Highest-yield surfaces get activated first. See [Surface Activation](#9-surface-activation).

---

## 11. Conversion Math

### Revenue Model

| Source | Price | Monthly Target | Revenue |
|--------|-------|----------------|---------|
| Ignition Sessions | $555 | 8 sessions | $4,440 |
| Build upgrades (30%) | $3,611 | 2 upgrades | $7,222 |
| **TOTAL** | | | **$11,662** |

### Traffic Math (backward from 8 bookings)

```
110 ZoG completions
  → 55 watch video (50%)
    → 8 book session (15%)
      → 2 buy Build (25-30%)
```

### Weekly Targets

| Metric | Target |
|--------|--------|
| ZoG completions | 25-30 |
| Video views | ~15 |
| Session bookings | 2-3 |
| Build upgrades | ~1 |

### How to Hit 25-30/week

- 10-15 warm DMs → ZoG link
- 2-3 signal posts → profile → ZoG
- 3 upstream pings → referral pipeline
- Light inbound from updated surfaces

---

## 12. Weekly SOP

### Monday: Outreach (1 hour)

- [ ] Pick 10-15 warm contacts
- [ ] Send DMs (personalize first line, use templates above)
- [ ] Send 3 upstream partnership pings
- [ ] Log all sends in tribe tracker

### Wednesday: Content (30 min)

- [ ] Post 2 signal posts + 1 frame/proof post
- [ ] Engage with any replies (use DM conversion flow)

### Friday: Review (15 min)

- [ ] Messages sent this week?
- [ ] Responses received?
- [ ] Conversations started?
- [ ] Bookings?
- [ ] What felt right? What felt forced?

### Wiring (ONE TIME)

- [ ] Stripe → $555 link → success URL → Cal.com booking
- [ ] Cal.com → confirm email: "No preparation needed. Come as you are."

---

## 13. Quiz — Full Specification

### What The Quiz IS

A filter + amplifier. It catches people who would otherwise not move at all.

- **NOT** a step everyone must take
- **NOT** a full answer or transformation
- **IS** a precise moment where someone sees themselves clearly enough to realize they're still stuck

### Positioning Rules

| Rule | Why |
|------|-----|
| Optional, not required | Instant recognizers skip it — don't slow them down |
| Contextual | Offered to thinkers, skeptics, overthinkers |
| "See the pattern" not "take a quiz" | Reframe: "See the pattern behind why this has been so hard to turn into something real" |

### Friction Test

> **Will the quiz create friction?**
>
> ❌ YES — if forced on everyone, feels like effort without payoff, feels like "just a quiz"
> ✅ NO — if optional, contextual, and increases clarity of the problem
>
> Without quiz: "Maybe I need help…"
> With quiz: "Oh. THIS is why I'm stuck."
>
> That makes booking easier, not harder.

### Quiz vs ZoG (two different forces)

| Component | Function | Output |
|-----------|----------|--------|
| Quiz | Classification — "This is your pattern" | Named archetype + felt gap |
| ZoG | Revelation — "This is your expression of it" | Specific, personal, undeniable |

Example:
- Quiz says: *"You're The Invisible Genius"*
- ZoG says: *"You help people clarify complex internal states into actionable direction"* (way more specific)

### 6 Questions

**Q1 — Identity friction**
*When someone asks what you do, what happens?*
- (a) I explain it differently every time
- (b) I over-explain and lose them
- (c) I simplify too much and it feels wrong
- (d) I avoid the question entirely

**Q2 — External validation mismatch**
*What do people consistently come to you for?*
- (a) Advice / clarity
- (b) Strategy / direction
- (c) Solving complex problems
- (d) Something hard to describe

**Q3 — Internal tension**
*Which feels most true right now?*
- (a) "I'm good at too many things to choose one"
- (b) "I know what I do, I just can't explain it"
- (c) "I'm working hard but the results don't match"
- (d) "People get value from me but don't always pay for it"

**Q4 — Past pattern**
*Think about your best moments at work. What was happening?*
- (a) I was solving a puzzle no one else could see
- (b) I connected things that seemed unrelated
- (c) I made someone feel seen and understood
- (d) I built something from scratch that worked

**Q5 — Pricing reality**
*How do you currently price your work?*
- (a) I don't — I mostly give it away
- (b) I charge but always feel it's too low
- (c) My pricing keeps changing — I can't find the right number
- (d) I charge well for some things, but my real value isn't captured

**Q6 — What's actually missing**
*What would change everything for you right now?*
- (a) Being able to explain what I do in one sentence
- (b) Knowing exactly who to sell to
- (c) Having a clear offer that feels right
- (d) Charging what I'm worth without hesitation

### Scoring Matrix

| Archetype | Strongest signals |
|-----------|------------------|
| **The Invisible Genius** | Q1: a/b, Q2: d, Q3: b, Q6: a |
| **The Multi-Talent Trap** | Q1: a, Q3: a, Q4: b, Q6: b/c |
| **The Misaligned Vector** | Q3: c, Q4: d, Q5: c, Q6: c |
| **The Underpriced Operator** | Q2: a/c, Q3: d, Q5: a/b, Q6: d |

Scoring: Each answer adds weight to 1-2 archetypes. Highest total score wins.

### 4 Result Types (complete copy)

Each follows: **Identity → Mirror → Gap → Stop → Bridge**

**Result test:** After reading, do they feel Seen? Slightly exposed? Still unresolved? If yes → correct.

---

#### 🧩 1. THE INVISIBLE GENIUS

You create value in ways that are hard to explain.

People leave conversations with you clearer, more focused, or unstuck.
You don't always know how you do it—but it works.

**The problem is:**

You've never turned this into something others can quickly understand.

So instead:
- you explain it differently every time
- people get value, but don't always pay
- it feels obvious to you—but unclear to others

This isn't a skill problem.

It's a structure problem.

Most people stop here.
They understand themselves better… but nothing actually changes.

**👉 Watch what's actually missing (4 min)**

---

#### 🧩 2. THE MULTI-TALENT TRAP

You're good at many things—and none of them fully define you.

You can adapt, solve, build, and create across different domains.
That's your strength.

**The problem is:**

Without a clear center, nothing sticks.

So instead:
- you keep reshaping what you do
- your offer keeps changing
- people don't know how to place you

You don't need to choose one skill.

You need a structure that holds all of them.

Most people stay in motion—without direction.

**👉 Watch how this becomes something real (4 min)**

---

#### 🧩 3. THE MISALIGNED VECTOR

You're putting in effort.

A lot of it.

But the results don't match.

You've built things. Tried things. Moved forward.
And still… something feels off.

**The problem is:**

You're applying force in the wrong direction.

So instead:
- you work harder, but don't gain traction
- things almost click—but don't hold
- progress feels inconsistent

This isn't about effort.

It's about alignment.

Most people keep pushing—without correcting direction.

**👉 Watch where this actually breaks (4 min)**

---

#### 🧩 4. THE UNDERPRICED OPERATOR

You deliver real value.

People get results from working with you.

And still… you're not charging what that's worth.

**The problem is:**

People don't fully understand what you do—fast enough to pay.

So instead:
- you undercharge
- you overdeliver
- you hesitate to raise prices

This isn't about confidence.

It's about clarity.

Most people stay stuck here—knowing they should charge more, but not knowing how.

**👉 Watch how this shifts (4 min)**

---

### Quiz Route

| URL | Page |
|-----|------|
| `/quiz` | Quiz experience (6 questions → result) |

### Quiz → System Integration

```
Quiz Result Page
  │
  ├─ "Watch this (4 min)" → /ignite#hero-video
  │
  └─ "Want to go deeper?" → / (ZoG Reveal)
```

---

## 14. Phase 2+ Roadmap

> Items beyond the quiz that require validation first.

| Item | Description | Trigger |
|------|-------------|---------|
| ZoG output restructure | 6-part AI format: Name → Mirror → Distortion → Missed Link → Limitation → Bridge | After quiz validates |
| Behavior-based routing | Conditional nudges based on user actions on result page | After CRM migration |
| GHL migration | Full automation — sequences, follow-ups, re-engagement | After $5K/month |
| Referral flywheel | Post-session: "If someone came to mind — send them the reveal" | After 3 testimonials |

---

## 15. Pre-Launch Infrastructure Checklist

> *The foundation work IS the launch work. But the foundation has a "good enough" threshold, not a "perfect" threshold.*

### The Principle

The funnel needs to work — no dead ends, logic flows, copy doesn't repel. But it doesn't need to be polished to 9.9 before the first DM goes out. It needs to be at **7-8**. The first 5 humans who go through it will show you exactly what's broken, what's confusing, what's missing. That data is worth more than another week of polishing.

**Launch at 7-8. Polish with live data. Not before.**

### Before First DM — Walk the Full Path

- [ ] **Walk it yourself:** DM link → ZoG Reveal (/) → Result → Video → /ignite → Stripe → Confirmation → Cal.com
- [ ] Fix any broken links, dead ends, or confusing transitions
- [ ] ZoG Reveal loads fast (< 3 seconds) and produces a felt gap
- [ ] Video exists on /ignite (even placeholder — raw face-to-camera is better than produced)
- [ ] Stripe payment → confirmation page → email → Cal.com booking all flow
- [ ] Landing page copy leads with **feeling** (pain-artifact language), not capability
- [ ] "If your heart isn't resonating with this, don't sign up" — Resonance Permission visible on /ignite
- [ ] LinkedIn headline + banner + featured updated with ceremony line
- [ ] WhatsApp about + email signature updated
- [ ] The diagnostic: "Have I sent a personal message to a real human about what I do this week?" — If no, everything above is procrastination

### After First 5 Clients Go Through

- [ ] Debrief: Where did they get confused? Where did they hesitate? What made them say yes?
- [ ] Adjust based on real data, not projections
- [ ] THEN polish copy, THEN add the quiz routing, THEN automate follow-ups

### What Blocks Launch vs. What Can Wait

| NOW (blocks launch) | LATER (Phase 2, after validation) |
|---------------------|-----------------------------------|
| Full warm path works end-to-end | Quiz routing for cold traffic |
| Video exists (any quality) | Produced 4-min video |
| Stripe + Cal.com connected | GHL migration + automation |
| Copy leads with feeling | Behavioral routing by buyer type |
| 10 presence surfaces updated | Automated follow-up sequences |
| Manual CRM (Google Sheets) | Full CRM platform |

### The Builder's Principle

> **Every technical decision is a felt-experience decision.**

This tribe — founders with extraordinary capability who've been let down by systems that promised transformation — is hypersensitive to inauthenticity. The page load speed is an emotional experience. The button color is trust. The confirmation email timing is care. A 404 page is abandonment.

The technical quality of this infrastructure IS the product. Not a container for the product. Build it with that awareness and it carries the right frequency.

This is why liquid glass matters. This is why copy tone matters. This is why "Sales = Love" isn't a slogan — it's a technical specification. If the infrastructure itself creates uncertainty, it contradicts the product at the deepest level.

**The most important line in this playbook:** You are selling collapse of uncertainty. Make the path simple, clear, and warm. That's the whole job.

---

### Cross-References

| Document | Relationship |
|----------|-------------|
| [Unique Business Playbook](./unique_business_playbook.md) | The methodology this journey implements. Funnel architecture lives here; principles live there |
| [Alexander's Unique Business](../02-strategy/unique-businesses/alexanders_unique_business.md) | Alexander's own artifacts — the first instance of this journey, fully documented |
| [Tribe Outreach Tracker](../02-strategy/tribe_outreach_tracker.md) | Live operational data — names, statuses, metrics. Updates after every outreach batch |
| [Digital Surface Holomap](../02-strategy/digital_surface_holomap.md) | Full inventory of digital real estate for surface activation |
| [UI Playbook](./ui_playbook.md) | Design system (liquid glass, voice matrix, WCAG) that the funnel pages are built from |
| [Glassmorphism Blueprint](./glassmorphism_blueprint.md) | The liquid glass design specification applied to the funnel |

*Last updated: April 2, 2026*
*This playbook consolidates: godfather_playbook, outreach_templates, tomorrow_sop, video_script_4min*
*Section 15 distilled from holonic roasting session with Claude Opus 4.6 (April 1-2, 2026)*

