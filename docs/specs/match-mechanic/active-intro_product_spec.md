# Active Introduction Layer — Product Spec (Phase 1)

**Module:** Active Intro (§8.6 of matchmaking strategy)
**Built on:** §8 match mechanic
**Surface owner:** `/game/collaborate/matches` (the Genius Matches page) + email + edge-function-rendered confirmation pages

---

## INPUT — 5/5 ✅

(See tracker for the 5 elements.)

---

## 1.1 Master Result

> *"From clicking 'I'd like to meet' and waiting in silence — wondering if they'll ever come back to see my interest — to receiving a real introduction in my inbox, written like a thoughtful matchmaker, the moment both sides have actively said yes."*

**Point A felt state:** quiet, uncertain, "did anyone notice?"
**Point B felt state:** seen, validated, "the platform actually did what it said."

---

## 1.2 Sub-Results (4 felt wins)

### Sub-Result 1 — A understands what just happened
*"I clicked 'I'd like to meet' and the platform explained, in three sentences, what happens next — for me and for them."*

Implemented via the **MatchExplainer accordion** at the top of the Genius Matches page, auto-expanded on first visit.

### Sub-Result 2 — B receives a warm, concrete heads-up
*"I got an email saying someone wanted to meet me. It told me who they are, what we have in common, and what collaboration could look like. Not vague. Specific."*

Implemented via the **heads-up email**, body generated from the existing `suggest-asset-matches` AI output (alignment + complementarity + collaboration_proposal).

### Sub-Result 3 — B has clean Yes / Not now in one click
*"Two buttons. I picked one. Done. I didn't have to type anything, didn't have to come back to the platform, didn't have to log in."*

Implemented via **magic-link buttons** in the heads-up email → HMAC-signed tokens verified by `match-consent` edge function.

### Sub-Result 4 — On Yes, both get an intro email that reads like a real matchmaker wrote it
*"Both of us got an email in the same thread. 'Hey Alex, meet Sasha. I thought you two could hit it off on these three concrete things. Take it from here.' It felt like an actual person introduced us, not an algorithm."*

Implemented via the **refactored `send-mutual-intro-email`** in human-matchmaker voice. No magic-link CTA. Reply-to-thread is the action surface.

---

## 1.3 Screens / Surfaces (4 new)

### Surface 1 — Heads-up email (B's inbox)

```
From: Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>
Subject: ${A.firstName} wants to meet you — here's what we saw

[Aurora-styled HTML body — full design in 1.6]

CTAs:
  ┌──────────────────────┐  ┌────────────┐
  │ Yes, introduce us    │  │  Not now   │
  └──────────────────────┘  └────────────┘

Footer: "We won't pester you. If you don't reply, nothing happens.
        Stop notifying me about new matches → [link to Settings]"
```

### Surface 2 — Consent confirmation pages (rendered by `match-consent` edge function)

Six states:

| State | When | Copy core |
|---|---|---|
| Yes-confirmed | B clicks Yes | "Done. We're sending the intro now." |
| Not-now-confirmed | B clicks Not now | "Got it. We won't follow up on this one." |
| Expired | Token >30d old | "This invitation expired. If they're still interested, they may reach out again." |
| Already-responded | Token used | "You've already responded to this one." |
| Withdrawn | A withdrew before B clicked | "${A.firstName} is no longer pursuing this. No action needed." |
| Invalid | HMAC verification fails | "This link isn't valid. If you think this is a mistake, please contact us." |

All Aurora-styled, parchment background, Cormorant titles, Source Serif body.

### Surface 3 — MatchExplainer accordion (top of Genius Matches page)

Auto-expanded on first visit. Persists collapse state via `game_profiles.match_explainer_seen_at`.

### Surface 4 — Bilateral intro email (refactored from §8)

New voice. New structure. Both addresses in `to:`. Same thread.

```
From: Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>
To: ${A.email}, ${B.email}
Subject: Meet ${A.firstName} / Meet ${B.firstName}

Hey ${B.firstName}, meet ${A.firstName}.

I thought you two could hit it off on:
  • ${concrete_point_1}
  • ${concrete_point_2}
  • ${concrete_point_3}

Leave it up to you guys to make the connection and follow up
if you still want to. You both said yes.

— Find Your Top Talent
```

---

## 1.4 Dan Tians per surface

### MatchExplainer accordion
- 🫀 **Heart:** *"I'm not being shouted at; I'm being shown how this works. I can trust this."*
- 🧠 **Mind:** *"Three sentences. I understand the privacy boundary. I understand what happens to me and what happens to them."*
- 🔥 **Gut:** Click "Got it" (or just click "I'd like to meet" on a card — both dismiss the panel).

### Heads-up email
- 🫀 **Heart:** *"Someone real saw something in me. Not a spam blast. The 3 points are specific."*
- 🧠 **Mind:** *"This is a one-time invitation. Two buttons. No log-in required. AI reads my reply only if I reply, which I don't have to."*
- 🔥 **Gut:** Click "Yes, introduce us" OR "Not now" — one click, done.

### Yes-confirmation page
- 🫀 **Heart:** *"That worked. Both of us are about to be introduced. Good."*
- 🧠 **Mind:** *"The intro email is going to both of us in the same thread. I take it from there."*
- 🔥 **Gut:** Close the tab. Wait for the email.

### Not-now-confirmation page
- 🫀 **Heart:** *"That was clean. No pressure to explain why. They got the signal."*
- 🧠 **Mind:** *"This person won't be re-suggested for a while (15 days)."*
- 🔥 **Gut:** Close the tab. Move on.

### Refactored intro email
- 🫀 **Heart:** *"This feels like a real human introduction. The platform stepped back."*
- 🧠 **Mind:** *"Three concrete reasons we'd hit it off. The platform isn't telling me what to do — it's giving me handles to start a conversation."*
- 🔥 **Gut:** Reply-all. Schedule a call or exchange context. The platform is no longer in the loop.

---

## 1.5 Extensions

### Artifacts produced
- `match_interests.headsup_email_sent_at` — timestamp of heads-up dispatch
- `match_interests.consent_response` — `pending` (default) → `consented` / `declined` / `expired`
- `match_interests.consent_responded_at` — timestamp of B's click
- `match_interests.headsup_email_status` — `sent` / `bounced` / `failed` / `no_email` / `opted_out` / `globally_suppressed` / `already_connected`
- `match_interests.headsup_sent_count` — increments on re-invite (capped at 3 lifetime per pair)
- `match_intros` row — on Yes click, the success event
- `game_profiles.match_headsup_opt_out` — user-level opt-out
- `game_profiles.match_explainer_seen_at` — first-visit tracking

### Completion criteria
- **A's perspective:** they've expressed interest, the system handled it. Closure either way: heads-up went out, B responded (yes/no), or B never responded (cool-down expires).
- **B's perspective:** they made an informed Yes / Not now choice, OR they intentionally ignored.
- **System perspective:** every `match_interests` row resolves to one of: `consented` (intro fired), `declined` (suppressed for 15 days), `expired` (token aged out), `withdrawn` (A pulled it).

### Skip paths
- A doesn't want to wait → can withdraw from `/game/collaborate/connections` anytime. If heads-up already sent and B clicks Yes after withdraw, B sees "no longer pursuing" page.
- B ignores the email → after 30 days, token expires, row marked `expired`.
- B opts out globally → all future heads-ups suppressed at send time.

### Bridges
- The bilateral intro email is the bridge **out** of the platform (action moves to inboxes + calendars).
- `match_intros` rows feed the engine learning loop (high-trust signal).
- `match_declines` (consent_response='declined') feed the engine learning loop (negative signal).

---

## 1.6 Wireframes

### MatchExplainer accordion (collapsed state)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│     ✦  How introductions work             ▾                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### MatchExplainer accordion (expanded state)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│     ✦  How introductions work             ▴                       │
│                                                                  │
│     1. You click "I'd like to meet"                              │
│        Your interest stays private. They don't see it            │
│        in the platform.                                          │
│                                                                  │
│     2. We send them a heads-up email                             │
│        Explaining who you are and why we paired you. They        │
│        can say yes or not now in one click.                      │
│                                                                  │
│     3. If they say yes                                           │
│        We send you both an intro email in the same thread.       │
│        You take it from there.                                   │
│                                                                  │
│     If they don't respond, we leave it at that.                  │
│     You can withdraw your interest anytime from your             │
│     Connections page.                                            │
│                                                                  │
│                                                  [ Got it ]      │
└──────────────────────────────────────────────────────────────────┘
```

### Heads-up email

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│         ✦ A MOMENT OF MUTUAL INTEREST                            │
│                                                                  │
│     ${A.firstName} wants to meet you.                            │
│                                                                  │
│     ${A.firstName} just saw your profile and expressed           │
│     interest in connecting. Here's what we saw between you:      │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  ${A.firstName}                                          │   │
│   │  ${A.archetype}                                          │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│     WHY THE ENGINE PAIRED YOU                                    │
│                                                                  │
│     ${ai_why_text — alignment + complementarity, ~120 words}     │
│                                                                  │
│     WHAT COLLABORATION COULD LOOK LIKE                           │
│                                                                  │
│     ${collaboration_proposal — ~80 words}                        │
│                                                                  │
│   ┌──────────────────────────┐     ┌──────────────────────────┐  │
│   │   Yes, introduce us      │     │      Not now             │  │
│   └──────────────────────────┘     └──────────────────────────┘  │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│                                                                  │
│   We won't pester you. If you don't respond, nothing happens.    │
│   Want to stop these heads-ups? → Settings                       │
│                                                                  │
│   Find Your Top Talent                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Yes-confirmation page (after B clicks Yes)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                       ✦                                          │
│                                                                  │
│              Done. We're sending the intro now.                  │
│                                                                  │
│        You'll both receive an email in the same thread           │
│        within a minute. ${A.firstName} doesn't know you           │
│        clicked yes until the intro arrives.                      │
│                                                                  │
│        Take it from there — schedule, exchange context,          │
│        whatever feels right. We've made the introduction.        │
│                                                                  │
│                                                                  │
│                Find Your Top Talent                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Not-now-confirmation page

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                       ✦                                          │
│                                                                  │
│             Got it. We won't follow up on this one.              │
│                                                                  │
│        ${A.firstName} won't be re-suggested for 15 days.          │
│        After that, if the engine re-pairs you naturally,         │
│        you may see them again.                                   │
│                                                                  │
│        ${A.firstName} doesn't see that you declined —            │
│        from their side, it just goes quiet.                      │
│                                                                  │
│                                                                  │
│                Find Your Top Talent                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Architectural decisions (preview of Phase 2)

| Decision | Choice | Rationale |
|---|---|---|
| Token type | HMAC-SHA256 | No JWT lib needed, secret already in env, simple verify |
| Token payload | `{match_interest_id, action, expires_at}` base64-encoded | Self-describing, server can verify without DB lookup |
| Secret storage | Edge function env `MATCH_CONSENT_SECRET` | Lovable-friendly, rotatable, no Vault complexity |
| Expiry | 30 days | Long enough that B's slow response works, short enough that stale tokens age out |
| AI source | Existing `suggest-asset-matches` output | No new AI call, no new prompt to maintain |
| Mutual fire | Server-side from `match-consent` | Removes client-side reverse-check; single source of truth |
| Suppression window | 15 days | Sasha decision 2026-05-19 |
| Throttling | 10 heads-up per A per 7 days; 3 lifetime per (A,B) pair | Anti-spam + anti-harassment |
| Globally suppressed emails | Skip send + log status | Honors existing `suppressed_emails` table |
| Opt-out toggle | `game_profiles.match_headsup_opt_out` boolean | Per-feature, separate from global suppression |

---

## UI tokens

All from existing Aurora register:
- Parchment background: `rgba(255, 252, 245, 0.92)` with gold hairline `rgba(212, 175, 55, 0.55)`
- Cormorant Garamond — titles
- Source Serif 4 — body
- DM Sans — eyebrows + buttons
- Gold accent: `#b8860b` (text), `#d4af37` (accents)
- Navy text primary: `#0b2a5a`
- Muted navy: `rgba(11, 42, 90, 0.78)`
- Button bg: gold-deep gradient `linear-gradient(135deg, #b8860b, #7a5108)` for primary; outline-only for secondary

---

**Phase 1 status:** complete, ready for Roast Gate 1.

🔥 **ROAST GATE 1** — pass. Flow walkthrough:
- A on Genius Matches page → sees MatchExplainer if first visit → clicks "I'd like to meet" → toast: "Heads-up email sent to ${B}. We'll introduce you both if they say yes."
- B in inbox → reads heads-up → clicks Yes → lands on confirmation page → closes tab → both receive intro email
- OR B clicks Not now → confirmation page → 15-day suppression begins
- OR B ignores → token expires after 30 days, row state goes `expired`

All paths resolved. Phase 2 begins.
