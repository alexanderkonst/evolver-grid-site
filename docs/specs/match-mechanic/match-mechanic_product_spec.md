# Match Interaction Mechanic — Product + Architecture + UI Spec

> Day 66, May 16, 2026. Consolidated spec for Phases 1, 2, 3 of the integrated product building workflow. Phase 4 (vibe-coding) tracked separately in code commits. Tracker: [`match-mechanic_tracker.md`](match-mechanic_tracker.md).

---

## INPUT (5/5 — locked)

1. **ICP** — Authenticated platform user who has completed Top Talent reveal (has profile primitives the engine can match on) and has opened the Matchmaking surface.
2. **Transformation (A→B)** — From *"I see matches but my action triggers a cold one-way request"* → *"I express interest privately; an intro fires only when the other side independently agrees."*
3. **Pain of Point A** — Current Connect button fires a one-way email immediately. Feels like cold outreach. No "we both chose this" trust signal.
4. **Dream Outcome** — Mutual-opt-in introductions arrive in the inbox already framed by the platform — both sides chose, both sides know the why.
5. **Action** — Click "I'd like to meet" → if the other side has already opted in, intro email fires to both; else interest is held quietly until they reciprocate.

---

## PHASE 1 — PRODUCT

### Master Result

**From cold one-way connection requests to mutual-opt-in introductions where the platform frames the why for both sides at the moment they're both already interested.**

### Sub-Results (3 felt wins)

1. **Express interest with low friction.** Click "I'd like to meet" → see *"Your interest is recorded. We'll introduce you if they agree."* Feels safe (no cold-outreach exposure); decisive (a clear act).
2. **Recognize mutual interest the moment it forms.** When the other side clicks "I'd like to meet" — either before or after you — both sides see a *"Mutual interest — introduction sent"* state. The system found you both.
3. **Receive the introduction email** with both names in To: and the AI-generated why-text framing the match shape. The platform is the introducer; both sides are recipients of equal standing.

### Screens

**No new routes.** Only state changes on the existing `MatchCard` component. Three new visual states (see UI section):

- **Default state** (unchanged) — "I'd like to meet" CTA active, Pass available
- **Interest-expressed state** (NEW) — "Your interest is recorded — waiting for them" muted indicator
- **Mutual-interest state** (NEW) — "Mutual interest — introduction sent ✓" success indicator

### Dan Tians per state

| State | 🫀 Heart | 🧠 Mind | 🔥 Gut |
|---|---|---|---|
| Default | Curiosity about who this person is, recognition that the platform sees the connection-shape | Understanding why this match: the AI-generated why-text frames what could come of A+B | "I'd like to meet" — express interest, low-stakes, reversible |
| Interest-expressed | Calm satisfaction (action taken, no cold exposure), patience (the platform handles the rest) | Knowing your interest is recorded but unannounced; the other side won't know unless they independently choose you | No action needed — wait state |
| Mutual-interest | Recognition + delight (the platform found us both), warm momentum into the actual meeting | Knowing the intro email has fired to both; the connection-shape was real | Check inbox / take it from here outside the platform |

### Extensions

- **Artifacts produced:** `match_interests` row per direction; `match_intros` row when mutual; intro email sent (one email, both recipients).
- **Emotional states:** curious → satisfied (interest expressed) → delighted (mutual recognized).
- **Completion criteria:** for a match-pair, "complete" means an intro email has fired (or one side has Passed, ending the loop).
- **Skip paths:** Pass on a match → records nothing (or a soft `pass` flag if we want to avoid re-surfacing; v1 doesn't need this — the user just moves on).
- **Bridges:** the intro email is the bridge OUT of the platform (to user's inbox + their preferred scheduling tool). The platform doesn't book the meeting.

### Wireframes (the MatchCard's three states)

```
DEFAULT STATE
┌──────────────────────────────────────┐
│  [avatar]  Karime                    │
│            FORGING                   │
│  ────────────────────────────────    │
│  ★ Co-founder potential               │
│                                      │
│  Why you should meet Karime:         │
│  [AI-generated why-text paragraph,   │
│   2-3 sentences max]                 │
│                                      │
│  Alignment: ...                      │
│  Complementarity: ...                │
│                                      │
│  [ ✗ Pass ]   [ ✦ I'd like to meet ] │
└──────────────────────────────────────┘

INTEREST-EXPRESSED STATE
┌──────────────────────────────────────┐
│  [avatar]  Karime                    │
│            FORGING                   │
│  ────────────────────────────────    │
│  Why you should meet Karime: ...     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ✓ Your interest is recorded    │  │
│  │   We'll introduce you if they   │  │
│  │   say yes.                      │  │
│  └────────────────────────────────┘  │
│                                      │
│  [ ✗ Withdraw ]    (no Connect CTA)  │
└──────────────────────────────────────┘

MUTUAL-INTEREST STATE
┌──────────────────────────────────────┐
│  [avatar]  Karime                    │
│            FORGING                   │
│  ────────────────────────────────    │
│  ╔════════════════════════════════╗  │
│  ║ ✦ Mutual interest               ║  │
│  ║                                 ║  │
│  ║ You both said yes. We sent the  ║  │
│  ║ introduction to both inboxes.   ║  │
│  ║ Take it from there.             ║  │
│  ╚════════════════════════════════╝  │
│                                      │
│  [ → Check your inbox ]              │
└──────────────────────────────────────┘
```

---

## PHASE 2 — ARCHITECTURE

### Module boundaries

**Extends (touched, surgically):**
- `src/pages/Matchmaking.tsx` — `handleAiConnect` → `handleExpressInterest` (rewritten with new logic). Add interest-state lookup. Add mutual-detection. Add intro email trigger.
- `src/components/matchmaking/MatchCard.tsx` — props extended for state; new visual states; CTA label change.

**New:**
- `supabase/migrations/<ts>_match_mechanic.sql` — creates `match_interests` + `match_intros`, drops `connections` (data first wiped per Sasha's instruction).
- `src/prompts/user/matchWhyPrompt.ts` — captures the prompt that produces the why-text. Currently the why-text is generated inside `suggest-asset-matches` edge function (returns `collaboration_proposal` + `alignment` + `complementarity` + `friction`); this prompt file documents that surface and centralizes future iteration. v1 reuses the existing engine output; no new edge function for AI-why generation needed.
- `supabase/functions/send-mutual-intro-email/index.ts` — new edge function. Takes user_a_id + user_b_id + ai_why_text. Sends single email to both. Distinct from `send-connection-intro-email` (legacy, single-recipient, retired).

**Untouched:**
- Match scoring engine (`suggest-asset-matches` edge function) — already runs Gemini 2.5 Flash on profile primitives, returns collaboration_proposal + alignment + complementarity. This output IS the AI-why text.
- Page route (`/matchmaking`).
- Shell + layout.
- All other modules.

### Routing

No changes. `/matchmaking` stays.

### Data schema

```sql
-- Both directions of "I'd like to meet" clicks
CREATE TABLE public.match_interests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score     NUMERIC,
  compound_type   TEXT,         -- which compound matched (per matchmaking_strategy §3)
  ai_why_text     TEXT,         -- the why shown at click time, captured for the feedback loop
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

-- Mutual-interest events. Inserted when both directions exist.
-- Each row = one intro email sent = one high-trust feedback event.
CREATE TABLE public.match_intros (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score     NUMERIC,
  compound_type   TEXT,
  ai_why_text     TEXT,
  intro_sent_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)  -- canonical ordering — same pair = one row
);

-- RLS: users can read their own (either direction); users can only insert
-- their own from-direction interest. match_intros: server-side inserts only.
```

**Legacy table deprecation:** `DELETE FROM public.connections;` then `DROP TABLE IF EXISTS public.connections CASCADE;` per Sasha's go-ahead (no data preservation needed; no real connections made yet).

### State management

- **Client state:** which matches the current user has expressed interest in — read from `match_interests` on page mount + after each click. Cached in component state. Realtime channel optional for v1 (cross-tab sync of "they just opted in too" would be sweet but not blocking).
- **Server state:** `match_interests` + `match_intros` as the source of truth.
- **No mutual-detection trigger** in v1 — done client-side after each interest insert. (Trigger as defense-in-depth is parked; v1 ships without it. If users skip the mutual check by closing the tab between insert and detect, the trigger could catch it later.)

---

## PHASE 3 — UI

### Visual rules (Aurora register preserved)

- All new state surfaces use the existing parchment-card token set (`var(--skin-card-bg)`, gold-hairline border).
- Status indicators: muted-gold for "interest expressed"; ceremonial-gold for "mutual interest" with the strong cocktail (per ui_playbook Part VIII halo-deep).
- Typography: Cormorant for the state titles, Source Serif 4 for descriptions, DM Sans for the action affordance — same hierarchy as the existing card.

### Component states (9 states per ui_playbook Part V)

| State | Treatment |
|---|---|
| default | "I'd like to meet" CTA active + Pass available |
| hover | scale(1.02) on CTA, lift on card |
| focus | gold ring for keyboard nav |
| active | scale(0.98) on click |
| disabled | (during async click) 40% opacity, "Recording…" pseudo-state |
| loading | skeleton-shaped placeholders during initial fetch |
| error | inline error text + retry affordance ("Couldn't record interest — retry") |
| **empty** | when user has no matches — "We're finding people. Check back soon." surface |
| **skeleton** | card-shaped placeholder during initial load |

Plus the **two new business states**:
- interest-expressed
- mutual-interest

### Brandbook integration

- **Emotional mode:** *calm* for interest-expressed, *celebration* for mutual-interest.
- **Voice for the new states:**
  - Interest-expressed: *"Your interest is recorded. We'll introduce you if they say yes."* — Direct + Warm.
  - Mutual-interest: *"Mutual interest. We sent the introduction to both inboxes. Take it from there."* — Sacred + Direct.
- **No new imagery** required — text-only state surfaces.

### Micro-interactions

- **Interest-expressed transition:** the "I'd like to meet" CTA fades out, the "✓ recorded" line fades in (200ms). Subtle gold-pulse on the recorded confirmation (300ms, one cycle).
- **Mutual-interest transition:** more dramatic — the whole card briefly haloes (500ms gold glow), the mutual-interest banner draws in from the top of the card (300ms slide-down). Single celebration moment.
- Both respect `prefers-reduced-motion`.

### Accessibility

- ARIA live region announces state transitions ("Your interest is recorded" / "Mutual interest, introduction sent").
- All new CTAs are keyboard-reachable with visible focus rings.
- Color contrast ≥4.5:1 on the new status text vs. parchment background.

---

## Roast Gates summary (this consolidated spec)

- **Gate 1 (Product):** flow walkthrough — A clicks first → records interest → time passes → B clicks → both see mutual state → intro email fires. Edge case: B clicks first → A clicks later → same outcome. Edge case: A clicks then Withdraws → row deleted (or kept? v1 = deleted for simplicity). ✓
- **Gate 2 (Architecture):** data schema reviewed; legacy `connections` deletion confirmed safe (no real data per Sasha); mutual-detection lives client-side; trigger parked as defense-in-depth. ✓
- **Gate 3 (UI):** Aurora register preserved; three new visual states defined; voice matrix applied; a11y considered. ✓

Roast findings folded into the spec inline (not a separate section). When the build hits an unexpected state during Phase 4, fold it back into the spec and re-roast.
